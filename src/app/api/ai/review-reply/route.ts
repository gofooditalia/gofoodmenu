import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/site';
import { AI_MODELS, reasoningFor } from '@/lib/ai-models';
import {
    buildReviewReplyPrompt,
    DEFAULT_REVIEW_SETTINGS,
    MAX_REVIEW_LENGTH,
    REVIEW_REPLY_VARIANTS,
    type ReviewReplySettings,
} from '@/lib/review-reply';

// Client OpenAI (via OpenRouter) creato alla richiesta e non al caricamento del modulo:
// durante la build la chiave può mancare (es. deploy di anteprima) e il build non deve fallire.
function getOpenAI() {
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
            'HTTP-Referer': SITE_URL,
            'X-Title': 'Go!Food Menu', // header HTTP: solo ASCII
        },
    });
}

const DEFAULT_MODEL = AI_MODELS.review;

// Genera proposte di risposta a una recensione Google con tono, firma e istruzioni del ristorante
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const text = typeof body?.text === 'string' ? body.text.slice(0, MAX_REVIEW_LENGTH) : '';
        const rating = Number(body?.rating);
        const reviewerName = typeof body?.reviewerName === 'string' ? body.reviewerName.slice(0, 100) : '';

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Indica il numero di stelle (da 1 a 5)' }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: tenant } = await (supabase.from('tenants') as any)
            .select('id, restaurant_name')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!tenant) {
            return NextResponse.json({ error: 'Ristorante non trovato' }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: saved } = await (supabase.from('tenant_review_settings') as any)
            .select('tone, signature, instructions')
            .eq('tenant_id', tenant.id)
            .maybeSingle();

        const settings: ReviewReplySettings = { ...DEFAULT_REVIEW_SETTINGS, ...(saved || {}) };
        const prompt = buildReviewReplyPrompt(tenant.restaurant_name, settings, { text, rating, reviewerName });

        const model = process.env.OPENROUTER_REVIEW_MODEL || DEFAULT_MODEL;
        const completion = await getOpenAI().chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.8,
            reasoning: reasoningFor(model),
        } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming & { reasoning: ReturnType<typeof reasoningFor> });

        const content = completion.choices[0]?.message?.content || '';
        let replies: string[] = [];
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed?.replies)) {
                replies = parsed.replies
                    .filter((r: unknown): r is string => typeof r === 'string' && r.trim() !== '')
                    .map((r: string) => r.trim())
                    .slice(0, REVIEW_REPLY_VARIANTS);
            }
        } catch {
            console.error('[review-reply] Risposta del modello non in JSON:', content.slice(0, 500));
        }

        if (replies.length === 0) {
            return NextResponse.json({ error: 'Non sono riuscito a generare le risposte, riprova' }, { status: 502 });
        }

        return NextResponse.json({ replies });
    } catch (error) {
        console.error('[review-reply] Errore:', error);
        return NextResponse.json({ error: 'Errore durante la generazione delle risposte' }, { status: 500 });
    }
}
