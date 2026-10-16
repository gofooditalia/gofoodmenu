'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Loader2, Sparkles, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DEFAULT_REVIEW_SETTINGS,
    MAX_INSTRUCTIONS_LENGTH,
    MAX_REVIEW_LENGTH,
    type ReviewReplySettings,
    type ReviewTone,
} from '@/lib/review-reply';

export default function ReviewsPage() {
    const { data: tenant, isLoading } = useTenant();

    const [settings, setSettings] = useState<ReviewReplySettings>(DEFAULT_REVIEW_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);

    const [rating, setRating] = useState(5);
    const [reviewerName, setReviewerName] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [replies, setReplies] = useState<string[]>([]);

    useEffect(() => {
        if (!tenant?.id) return;
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from('tenant_review_settings') as any)
            .select('tone, signature, instructions')
            .eq('tenant_id', tenant.id)
            .maybeSingle()
            .then(({ data }: { data: ReviewReplySettings | null }) => {
                setSettings(data ? { ...DEFAULT_REVIEW_SETTINGS, ...data } : {
                    ...DEFAULT_REVIEW_SETTINGS,
                    signature: tenant.restaurant_name || '',
                });
            });
    }, [tenant?.id, tenant?.restaurant_name]);

    async function handleSaveSettings() {
        if (!tenant?.id) return;
        setIsSaving(true);
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('tenant_review_settings') as any).upsert({
            tenant_id: tenant.id,
            tone: settings.tone,
            signature: settings.signature.trim(),
            instructions: settings.instructions.trim(),
        });
        setIsSaving(false);
        if (error) {
            console.error('[reviews] Salvataggio impostazioni:', error);
            toast.error('Impossibile salvare le impostazioni');
        } else {
            toast.success('Impostazioni salvate');
        }
    }

    async function handleGenerate() {
        setIsGenerating(true);
        setReplies([]);
        try {
            const res = await fetch('/api/ai/review-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: reviewText, rating, reviewerName }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Errore durante la generazione');
            setReplies(data.replies || []);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Errore durante la generazione');
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleCopy(reply: string) {
        try {
            await navigator.clipboard.writeText(reply);
            toast.success('Risposta copiata: incollala su Google');
        } catch {
            toast.error('Copia non riuscita, seleziona il testo a mano');
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Recensioni ⭐</h1>
                <p className="text-gray-600">
                    Incolla una recensione Google: l&apos;AI ti propone le risposte con il tono del tuo locale.
                    Scegli quella che preferisci, copiala e pubblicala dal tuo profilo Google.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Rispondi a una recensione</CardTitle>
                    <CardDescription>Le risposte seguono le impostazioni qui sotto.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Stelle</Label>
                        <div className="flex gap-1" role="radiogroup" aria-label="Stelle della recensione">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    role="radio"
                                    aria-checked={rating === n}
                                    aria-label={`${n} stell${n === 1 ? 'a' : 'e'}`}
                                    onClick={() => setRating(n)}
                                    className="p-1"
                                >
                                    <Star
                                        className={`w-7 h-7 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reviewer-name">Nome del cliente (facoltativo)</Label>
                        <Input
                            id="reviewer-name"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            placeholder="Es. Marco Rossi"
                            maxLength={100}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="review-text">Testo della recensione</Label>
                        <Textarea
                            id="review-text"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Incolla qui il testo della recensione (vuoto se il cliente ha lasciato solo le stelle)"
                            rows={5}
                            maxLength={MAX_REVIEW_LENGTH}
                        />
                    </div>

                    <Button onClick={handleGenerate} disabled={isGenerating} className="bg-orange-600 hover:bg-orange-700">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isGenerating ? 'Sto scrivendo…' : 'Proponi risposte'}
                    </Button>

                    {replies.length > 0 && (
                        <div className="space-y-3 pt-2">
                            {replies.map((reply, i) => (
                                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <p className="whitespace-pre-line text-gray-800">{reply}</p>
                                    <Button variant="outline" size="sm" className="mt-3" onClick={() => handleCopy(reply)}>
                                        <Copy className="w-4 h-4" />
                                        Copia
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Impostazioni delle risposte</CardTitle>
                    <CardDescription>Come vuoi che suonino le risposte del tuo locale.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tono</Label>
                        <Select
                            value={settings.tone}
                            onValueChange={(v) => setSettings((s) => ({ ...s, tone: v as ReviewTone }))}
                        >
                            <SelectTrigger className="w-full sm:w-72">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="amichevole">Amichevole (del tu)</SelectItem>
                                <SelectItem value="formale">Formale (del lei)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="signature">Firma</Label>
                        <Input
                            id="signature"
                            value={settings.signature}
                            onChange={(e) => setSettings((s) => ({ ...s, signature: e.target.value }))}
                            placeholder="Es. Lo staff di Villa Pensabene"
                            maxLength={100}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructions">Le tue istruzioni</Label>
                        <Textarea
                            id="instructions"
                            value={settings.instructions}
                            onChange={(e) => setSettings((s) => ({ ...s, instructions: e.target.value }))}
                            placeholder="Es. Invita sempre a tornare. Non promettere mai sconti o omaggi."
                            rows={4}
                            maxLength={MAX_INSTRUCTIONS_LENGTH}
                        />
                        <p className="text-xs text-gray-500">
                            Hanno la precedenza sulle regole standard. L&apos;AI non inventa mai fatti e non promette
                            sconti o rimborsi, a meno che tu non lo scriva qui.
                        </p>
                    </div>

                    <Button onClick={handleSaveSettings} disabled={isSaving || !tenant?.id}>
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Salva impostazioni
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
