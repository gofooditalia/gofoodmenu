'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronRight, AlertCircle, MailCheck } from 'lucide-react';
import { authErrorMessage } from '@/lib/auth-errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReCAPTCHA from 'react-google-recaptcha';

export default function RegisterPage() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Email a cui è partita la conferma: al posto del modulo si mostra "Controlla la tua email"
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!captchaToken) {
        throw new Error('Per favore, completa il controllo "Non sono un robot".');
      }

      // Verify captcha with our backend
      const verifyRes = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
        throw new Error(verifyData.message || 'Verifica reCAPTCHA fallita. Riprova.');
      }

      // Solo l'email: il link porta dentro con l'email già verificata e da lì parte la configurazione guidata
      // (nome del locale al passaggio 1, password facoltativa). Con un'email già registrata il link fa rientrare.
      const { error: otpError } = await createClient().auth.signInWithOtp({
        email: formData.email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/onboarding`,
        },
      });

      if (otpError) {
        console.error('Auth signup error:', otpError);
        throw new Error(authErrorMessage(otpError, 'Registrazione non riuscita. Riprova.'));
      }

      setSentTo(formData.email.trim());
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione. Riprova.');
      // Reset captcha on error if needed
      // recaptchaRef.current?.reset();
      // setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
      {/* Decorative background blobs - maintained but subtle */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img
              src="/logo-gofood-new.svg"
              alt="Go!Food"
              className="h-14 w-auto mx-auto mb-4"
            />
          </Link>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Inizia la tua avventura! 🚀
          </h2>
          <p className="text-gray-600">
            Crea il tuo menu digitale in pochi minuti
          </p>
        </div>

        {sentTo ? (
          <Card className="shadow-2xl border-orange-100 overflow-hidden">
            <CardHeader className="space-y-2 pt-10 pb-4 text-center">
              <MailCheck className="w-12 h-12 text-orange-500 mx-auto" aria-hidden="true" />
              <CardTitle className="text-2xl font-black text-gray-900">Controlla la tua email</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Ti abbiamo mandato un link a <strong className="text-gray-900 break-all">{sentTo}</strong>.
                Aprilo per entrare: si parte subito con la creazione del menu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-10 px-8 text-sm text-gray-600">
              <p>Non la trovi? Guarda nello spam o nella cartella Promozioni. Può arrivare dopo qualche minuto.</p>
              <p>
                Email sbagliata?{' '}
                <button type="button" onClick={() => { setSentTo(null); setCaptchaToken(null); }} className="font-bold text-orange-600 hover:underline">
                  Cambia email
                </button>
              </p>
            </CardContent>
          </Card>
        ) : (
        <Card className="shadow-2xl border-orange-100 overflow-hidden">
          <CardHeader className="space-y-1 pt-10 pb-6">
            <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Registrati</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Basta la tua email: ti mandiamo un link per entrare
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Errore</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold">Email *</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xl">📧</span>
                  </div>
                  <Input
                    id="email"
                    placeholder="mario@ristorante.it"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ email: e.target.value })}
                    className="pl-10 py-6 text-base"
                  />
                </div>
              </div>

              <div className="flex justify-center py-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                  onChange={(token) => setCaptchaToken(token)}
                  hl="it"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-6 rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 text-lg transition-all hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Invio del link...
                  </>
                ) : (
                  <>
                    Ricevi il link <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-5 pt-4 pb-10 px-8">
            <div className="relative w-full text-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-bold tracking-wider">Hai già un account?</span>
              </div>
            </div>

            <Link href="/login" className="w-full">
              <Button
                variant="outline"
                className="w-full py-7 font-black border-2 border-orange-100 hover:border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all text-base rounded-xl"
              >
                Accedi al tuo account
              </Button>
            </Link>

            <p className="text-xs text-center text-gray-400 leading-relaxed mt-2 px-6">
              Registrandoti accetti i nostri{' '}
              <Link href="/termini-e-condizioni" className="font-bold text-orange-600 hover:underline">Termini di Servizio</Link>
              {' '}e la{' '}
              <a href="https://www.iubenda.com/privacy-policy/23100081" className="font-bold text-orange-600 hover:underline">Privacy Policy</a>
            </p>
          </CardFooter>
        </Card>
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-orange-600 transition-colors font-medium">
            ← Torna alla home
          </Link>
        </div>

      </div>
    </div>
  );
}
