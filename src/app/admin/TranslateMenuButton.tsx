'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Languages, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_TRANSLATED_LANGS, MENU_LANG_LABELS, TRANSLATED_LANGS, type TranslatedLang } from '@/lib/menu-languages';
import { translateMenuForTenant } from './actions';

/**
 * Lingue del menu tradotto di un locale: caselle con le lingue attive (o quelle di default per un locale nuovo)
 * e "Traduci menu", che traduce le lingue scelte e attiva esattamente quelle.
 */
export function TranslateMenuButton({ tenantId, restaurantName, activeLanguages }: { tenantId: string; restaurantName: string; activeLanguages: string[] }) {
    const [isPending, startTransition] = useTransition();
    const [selected, setSelected] = useState<TranslatedLang[]>(() => {
        const active = TRANSLATED_LANGS.filter((l) => activeLanguages.includes(l));
        return active.length ? active : [...DEFAULT_TRANSLATED_LANGS];
    });

    const toggle = (lang: TranslatedLang) =>
        setSelected((current) => current.includes(lang) ? current.filter((l) => l !== lang) : [...current, lang]);

    return (
        <details className="min-w-[13rem]">
            <summary className="cursor-pointer select-none text-gray-700">
                {activeLanguages.length ? activeLanguages.map((l) => l.toUpperCase()).join(' ') : 'Non tradotto'}
            </summary>
            <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {TRANSLATED_LANGS.map((lang) => (
                        <label key={lang} className="flex items-center gap-1.5 text-xs text-gray-700">
                            <input
                                type="checkbox"
                                checked={selected.includes(lang)}
                                onChange={() => toggle(lang)}
                                disabled={isPending}
                            />
                            {MENU_LANG_LABELS[lang].label}
                        </label>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending || !selected.length}
                    title={`Traduci il menu di ${restaurantName} nelle lingue scelte e attiva solo quelle`}
                    onClick={() =>
                        startTransition(async () => {
                            const result = await translateMenuForTenant(tenantId, selected);
                            if (result.ok) toast.success(`${restaurantName}: ${result.message}`);
                            else toast.error(`${restaurantName}: ${result.message}`);
                        })
                    }
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                    {isPending ? 'Traduzione…' : 'Traduci menu'}
                </Button>
            </div>
        </details>
    );
}
