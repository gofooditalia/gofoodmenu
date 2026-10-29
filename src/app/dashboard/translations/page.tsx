'use client';

/**
 * Traduzioni del menu: il ristoratore rilegge e corregge, lingua per lingua, nomi e descrizioni di categorie e
 * piatti tradotti in automatico (src/lib/translate-menu.ts). Le correzioni restano finché non cambia il testo
 * italiano (src/lib/translation-edits.ts). Solo per i locali con lingue attive (tenants.menu_languages).
 */

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Languages, Loader2, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { revalidatePublicMenu } from '@/app/actions/revalidate-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MENU_LANG_LABELS, menuLangDir, menuLangTag, TRANSLATED_LANGS, type TranslatedLang } from '@/lib/menu-languages';
import type { TextPair, Translations } from '@/lib/translate-menu';
import {
    currentTranslation,
    sourceOf,
    translationStatus,
    withManualTranslation,
    withoutTranslation,
    type TranslationStatus,
} from '@/lib/translation-edits';

interface Entry {
    kind: 'category' | 'dish';
    id: string;
    name: string;
    description: string | null;
    translations: Translations | null;
}

interface Section {
    category: Entry;
    dishes: Entry[];
}

const STATUS_LABELS: Record<TranslationStatus, { text: string; className: string }> = {
    auto: { text: 'Tradotto in automatico', className: 'bg-gray-100 text-gray-700' },
    manual: { text: 'Corretto da te', className: 'bg-green-100 text-green-800' },
    pending: { text: 'In attesa di traduzione', className: 'bg-amber-100 text-amber-800' },
};

export default function TranslationsPage() {
    const { data: tenant, isLoading } = useTenant();
    const langs = useMemo(() => {
        const active = tenant?.menu_languages ?? [];
        return TRANSLATED_LANGS.filter((l) => active.includes(l));
    }, [tenant]);

    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenant?.id) return;
        const supabase = createClient();
        Promise.all([
            supabase.from('categories').select('id, name, description, translations')
                .eq('tenant_id', tenant.id).order('display_order'),
            supabase.from('dishes').select('id, name, description, translations, category_id')
                .eq('tenant_id', tenant.id).order('display_order').order('created_at').order('name'),
        ]).then(([cats, dishes]) => {
            if (cats.error || dishes.error) {
                toast.error('Impossibile caricare il menu');
                setLoading(false);
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dishRows = (dishes.data ?? []) as any[];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSections(((cats.data ?? []) as any[]).map((c) => ({
                category: { kind: 'category', id: c.id, name: c.name, description: c.description, translations: c.translations },
                dishes: dishRows.filter((d) => d.category_id === c.id).map((d) => ({
                    kind: 'dish', id: d.id, name: d.name, description: d.description, translations: d.translations,
                })),
            })));
            setLoading(false);
        });
    }, [tenant?.id]);

    function replaceEntry(updated: Entry) {
        setSections((prev) => prev.map((s) => ({
            category: s.category.kind === updated.kind && s.category.id === updated.id ? updated : s.category,
            dishes: s.dishes.map((d) => (d.kind === updated.kind && d.id === updated.id ? updated : d)),
        })));
    }

    if (isLoading || (loading && langs.length > 0)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!tenant) {
        return <div className="text-center p-10">Nessun ristorante trovato.</div>;
    }

    return (
        <div className="flex-1 w-full md:container mx-auto max-w-5xl px-0 md:p-6 pb-20">
            <div className="bg-white border-y md:border border-gray-100 rounded-none md:rounded-xl p-4 md:p-6 shadow-none md:shadow-sm">
                <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <Languages className="w-6 h-6 text-orange-500" aria-hidden="true" />
                    Traduzioni del menu
                </h1>

                {langs.length === 0 ? (
                    <p className="mt-4 text-gray-600">
                        Il tuo menu non è ancora tradotto. Per averlo in altre lingue scrivi all&apos;assistenza.
                    </p>
                ) : (
                    <>
                        <p className="mt-2 mb-6 text-sm text-gray-600">
                            Le traduzioni si fanno da sole quando salvi un piatto. Qui puoi rileggerle e correggerle:
                            la tua correzione resta finché non cambi il testo italiano. Allergeni ed etichette sono
                            già tradotti e non si modificano.
                        </p>
                        <Tabs defaultValue={langs[0]}>
                            <TabsList className="h-auto flex-wrap justify-start">
                                {langs.map((lang) => (
                                    <TabsTrigger key={lang} value={lang} className="px-3 py-1.5 flex-none">
                                        <span aria-hidden="true">{MENU_LANG_LABELS[lang].flag}</span>
                                        {MENU_LANG_LABELS[lang].label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {langs.map((lang) => (
                                <TabsContent key={lang} value={lang} className="mt-4 space-y-8">
                                    {sections.length === 0 && (
                                        <p className="text-gray-600">Il menu non ha ancora categorie.</p>
                                    )}
                                    {sections.map((section) => (
                                        <section key={section.category.id} className="space-y-3">
                                            <EntryEditor entry={section.category} lang={lang} onSaved={replaceEntry} />
                                            <div className="space-y-3 border-s-2 border-gray-100 ps-3 md:ps-5">
                                                {section.dishes.map((dish) => (
                                                    <EntryEditor key={dish.id} entry={dish} lang={lang} onSaved={replaceEntry} />
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </>
                )}
            </div>
        </div>
    );
}

function EntryEditor({ entry, lang, onSaved }: { entry: Entry; lang: TranslatedLang; onSaved: (e: Entry) => void }) {
    const source = sourceOf(entry.name, entry.description);
    const saved = currentTranslation(entry.translations, source, lang);
    const status = translationStatus(entry.translations, source, lang);

    const [draft, setDraft] = useState<TextPair>(saved ?? { name: '', description: '' });
    const [saving, setSaving] = useState(false);

    // Dopo un salvataggio (o un ripristino) il campo riparte dal valore salvato
    useEffect(() => {
        setDraft(saved ?? { name: '', description: '' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entry.translations, lang]);

    const dirty = draft.name.trim() !== (saved?.name ?? '') || draft.description.trim() !== (saved?.description ?? '');
    const table = entry.kind === 'dish' ? 'dishes' : 'categories';
    const fieldId = `${entry.kind}-${entry.id}-${lang}`;
    const isCategory = entry.kind === 'category';

    async function save(translations: Translations, message: string) {
        setSaving(true);
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from(table) as any).update({ translations }).eq('id', entry.id);
        setSaving(false);
        if (error) {
            toast.error('Salvataggio non riuscito, riprova');
            return;
        }
        onSaved({ ...entry, translations });
        toast.success(message);
        void revalidatePublicMenu();
    }

    function handleSave() {
        if (!draft.name.trim()) {
            toast.error('Il nome tradotto non può essere vuoto');
            return;
        }
        void save(withManualTranslation(entry.translations, source, lang, draft), 'Traduzione salvata');
    }

    function handleReset() {
        void save(withoutTranslation(entry.translations, lang), 'Traduzione automatica ripristinata: arriverà a breve');
    }

    return (
        <div className={`rounded-lg border p-3 md:p-4 ${isCategory ? 'border-orange-200 bg-orange-50/40' : 'border-gray-200'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    {isCategory && <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Categoria</p>}
                    <p className={`text-gray-900 ${isCategory ? 'text-lg font-bold' : 'font-semibold'}`}>{entry.name}</p>
                    {source.description && <p className="text-sm text-gray-600 whitespace-pre-line">{source.description}</p>}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_LABELS[status].className}`}>
                    {STATUS_LABELS[status].text}
                </span>
            </div>

            <div className="mt-3 space-y-2" lang={menuLangTag(lang)} dir={menuLangDir(lang)}>
                <label htmlFor={`${fieldId}-name`} className="sr-only">Nome in {MENU_LANG_LABELS[lang].label}</label>
                <Input
                    id={`${fieldId}-name`}
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder={status === 'pending' ? 'Traduzione in arrivo: nel frattempo il menu mostra l’italiano' : ''}
                />
                {source.description && (
                    <>
                        <label htmlFor={`${fieldId}-desc`} className="sr-only">
                            Descrizione in {MENU_LANG_LABELS[lang].label}
                        </label>
                        <Textarea
                            id={`${fieldId}-desc`}
                            value={draft.description}
                            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                            rows={2}
                        />
                    </>
                )}
            </div>

            {(dirty || status === 'manual') && (
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {status === 'manual' && !dirty && (
                        <Button variant="ghost" size="sm" onClick={handleReset} disabled={saving}>
                            <RotateCcw className="w-4 h-4" aria-hidden="true" />
                            Torna alla traduzione automatica
                        </Button>
                    )}
                    {dirty && (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => setDraft(saved ?? { name: '', description: '' })} disabled={saving}>
                                Annulla
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                                Salva
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
