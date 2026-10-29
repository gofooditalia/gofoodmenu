import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Arrivo dal link di accesso via email (registrazione e "mandami un link" del login).
 * - `token_hash` + `type`: modelli email di Supabase con {{ .TokenHash }}; funziona anche aprendo il link su un altro
 *   dispositivo (es. registrazione dal computer, email letta sul telefono).
 * - `code`: modelli predefiniti ({{ .ConfirmationURL }}); funziona solo nel browser in cui il link è stato chiesto.
 * Poi porta a `next` (solo percorsi interni), altrimenti al login con un avviso.
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const code = searchParams.get('code');
    const nextParam = searchParams.get('next') ?? '/dashboard';
    const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/dashboard';

    const supabase = await createClient();
    let ok = false;
    if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        ok = !error;
        if (error) console.error('verifyOtp:', error.message);
    } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        ok = !error;
        if (error) console.error('exchangeCodeForSession:', error.message);
    }

    return NextResponse.redirect(`${origin}${ok ? next : '/login?error=link'}`);
}
