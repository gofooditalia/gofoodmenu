/**
 * Messaggi in italiano per gli errori più comuni di Supabase Auth (registrazione e login), che arrivano in inglese.
 * Si riconoscono dal codice (`code`) quando c'è, altrimenti dal testo.
 */

const MESSAGES: { match: RegExp; text: string }[] = [
    { match: /user_already_exists|already registered/i, text: 'Esiste già un account con questa email. Accedi oppure recupera la password.' },
    { match: /email_not_confirmed|email not confirmed/i, text: "Devi prima confermare l'email: apri il link che ti abbiamo mandato (controlla anche lo spam)." },
    { match: /invalid_credentials|invalid login credentials/i, text: 'Email o password non validi. Riprova.' },
    { match: /weak_password|password should be/i, text: 'La password è troppo debole: usa almeno 6 caratteri.' },
    { match: /email_address_invalid|invalid email|unable to validate email/i, text: "L'indirizzo email non è valido." },
    { match: /otp_disabled|signups not allowed for otp|user not found/i, text: 'Non troviamo un account con questa email. Controlla di averla scritta bene oppure registrati.' },
    { match: /otp_expired|email link is invalid|token has expired/i, text: 'Il link non è più valido: chiedine uno nuovo.' },
    { match: /reauthentication_needed|reauthentication/i, text: 'Per sicurezza esci, rientra con un nuovo link e imposta la password subito dopo.' },
    { match: /same_password|should be different/i, text: 'La nuova password deve essere diversa da quella attuale.' },
    { match: /rate limit|over_email_send_rate_limit|too many requests/i, text: 'Troppi tentativi in poco tempo. Aspetta qualche minuto e riprova.' },
];

export function authErrorMessage(error: unknown, fallback: string): string {
    const e = error as { code?: string; message?: string } | null;
    const text = `${e?.code ?? ''} ${e?.message ?? ''}`;
    return MESSAGES.find((m) => m.match.test(text))?.text ?? fallback;
}
