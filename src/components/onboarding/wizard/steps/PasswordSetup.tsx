import { useEffect, useState } from 'react';
import { KeyRound, Check, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { authErrorMessage } from '@/lib/auth-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Password facoltativa per chi si è registrato con il solo link via email. Senza password si rientra sempre con
 * "mandami un link" dal login. Si vede solo a chi non l'ha ancora scelta: `password_set` nei metadati dell'utente;
 * chi si è registrato con il vecchio modulo (nome del locale nei metadati) ha già una password.
 */
export function PasswordSetup() {
    const [visible, setVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        createClient().auth.getUser().then(({ data: { user } }) => {
            const meta = user?.user_metadata ?? {};
            setVisible(!!user && !meta.password_set && !meta.restaurant_name);
        });
    }, []);

    if (!visible) return null;

    async function save() {
        if (password.length < 6) {
            setError('Usa almeno 6 caratteri.');
            return;
        }
        setSaving(true);
        setError(null);
        const { error: updateError } = await createClient().auth.updateUser({ password, data: { password_set: true } });
        setSaving(false);
        if (updateError) {
            setError(authErrorMessage(updateError, 'Password non salvata. Riprova.'));
            return;
        }
        setSaved(true);
        setPassword('');
    }

    return (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                    <p className="font-bold text-gray-900">Password per i prossimi accessi (facoltativa)</p>
                    <p className="text-sm text-gray-600">
                        Se non la scegli, entri ogni volta con un link che ti mandiamo via email.
                    </p>
                </div>
            </div>
            {saved ? (
                <p role="status" className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <Check className="w-4 h-4" aria-hidden="true" /> Password salvata: la prossima volta puoi accedere con email e password.
                </p>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="new-password" className="sr-only">Nuova password</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Input
                                id="new-password"
                                type={show ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Minimo 6 caratteri"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShow(!show)}
                                aria-label={show ? 'Nascondi password' : 'Mostra password'}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <Button type="button" variant="outline" onClick={save} disabled={saving || !password}>
                            {saving ? 'Salvataggio...' : 'Salva password'}
                        </Button>
                    </div>
                    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                </div>
            )}
        </div>
    );
}
