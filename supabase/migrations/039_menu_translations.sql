-- 039: Traduzioni del menu salvate nel database (al posto di Google Translate)
--
-- Ogni piatto e categoria tiene le sue traduzioni in `translations`:
--   { "source": { "name": "...", "description": "..." },   -- testo italiano da cui sono partite
--     "en": { "name": "...", "description": "..." }, "fr": {...}, "de": {...}, "es": {...} }
-- Se il testo italiano cambia e non coincide più con `source`, il menu pubblico mostra l'italiano
-- per quel piatto finché non viene ritradotto (mai una traduzione vecchia, es. ingredienti cambiati).
-- Il locale tiene in `translations` il sottotitolo tradotto e in `menu_languages` le lingue attive:
-- solo per queste esistono le pagine /{slug}/{lingua} e il reindirizzamento in base alla lingua del telefono.
-- Gli allergeni NON si traducono qui: hanno nomi fissi nel codice.

ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS menu_languages text[] NOT NULL DEFAULT '{}'::text[];

COMMENT ON COLUMN public.dishes.translations IS 'Traduzioni del piatto: { source, en, fr, de, es } con name e description';
COMMENT ON COLUMN public.categories.translations IS 'Traduzioni della categoria: { source, en, fr, de, es } con name e description';
COMMENT ON COLUMN public.tenants.translations IS 'Traduzioni dei testi del locale (es. sottotitolo): { source, en, fr, de, es }';
COMMENT ON COLUMN public.tenants.menu_languages IS 'Lingue del menu tradotte e pubblicate (es. {en,fr,de,es}); vuoto = solo italiano';
