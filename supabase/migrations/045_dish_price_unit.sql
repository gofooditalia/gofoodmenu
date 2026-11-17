-- 045: Prezzo al peso dei piatti
--
-- `price_unit` dice a cosa si riferisce `price`: NULL = a porzione (tutti i piatti esistenti, nessun cambiamento),
-- 'hg' = all'etto (100 g), 'kg' = al chilo. Il menu pubblico mostra l'etichetta accanto al prezzo
-- (src/lib/price-unit.ts). Colonna aggiunta e basta: nessun dato esistente viene toccato.
-- La tabella dishes non ha permessi per colonna: la nuova colonna è leggibile dal menu pubblico come le altre.

ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS price_unit text;

ALTER TABLE public.dishes
  DROP CONSTRAINT IF EXISTS dishes_price_unit_check;

ALTER TABLE public.dishes
  ADD CONSTRAINT dishes_price_unit_check CHECK (price_unit IS NULL OR price_unit IN ('hg', 'kg'));

COMMENT ON COLUMN public.dishes.price_unit IS 'Unità del prezzo: NULL a porzione, hg all''etto, kg al chilo';
