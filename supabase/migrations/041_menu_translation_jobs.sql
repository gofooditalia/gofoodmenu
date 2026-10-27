-- 041: Traduzione automatica del menu dopo il salvataggio
--
-- Una riga per locale tradotto (tenants.menu_languages non vuoto). Ogni salvataggio dal pannello aggiorna
-- `requested_at`; la traduzione parte qualche secondo dopo l'ultima richiesta (le modifiche ravvicinate si
-- raggruppano) e prende il lucchetto `locked_until`, così per lo stesso locale non girano mai due traduzioni
-- insieme (salvataggio, cron orario e pulsante "Traduci menu" in /admin). Vedi src/lib/menu-translation-jobs.ts.
-- Solo service role: RLS attiva senza policy, il ristoratore non legge né scrive questa tabella.

CREATE TABLE IF NOT EXISTS public.menu_translation_jobs (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz,
  last_run_at timestamptz
);

ALTER TABLE public.menu_translation_jobs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.menu_translation_jobs IS 'Richieste di traduzione automatica del menu e lucchetto per locale (solo service role)';
COMMENT ON COLUMN public.menu_translation_jobs.requested_at IS 'Ultimo salvataggio che chiede una traduzione';
COMMENT ON COLUMN public.menu_translation_jobs.locked_until IS 'Traduzione in corso fino a questa data (lucchetto con scadenza)';
COMMENT ON COLUMN public.menu_translation_jobs.last_run_at IS 'Inizio dell''ultima traduzione completata';
