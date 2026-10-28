-- 044: Dati riservati dei locali non più leggibili da tutti
--
-- Prima: la regola "Public read access to tenant info" (USING true, per tutti i ruoli) e i
-- permessi di default rendevano leggibile ogni colonna di ogni locale con la chiave pubblica:
-- email, proprietario, piano, stato dell'abbonamento, periodo di tolleranza, date.
-- Ora:
--   - anon (menu pubblico, prenotazioni, middleware delle lingue) legge tutti i locali ma solo
--     le colonne pubbliche, le stesse di PUBLIC_TENANT_COLUMNS in src/lib/public-tenant.ts;
--   - authenticated (pannello del ristoratore) legge per intero solo i propri locali.
-- Stato dell'abbonamento per il menu pubblico ed email per le prenotazioni si leggono sul server
-- con la chiave service role (src/lib/public-tenant.ts), che non passa da queste regole.
--
-- Da applicare DOPO il deploy del codice che legge solo le colonne pubbliche e dopo la 043
-- (is_slug_taken): con il codice vecchio i menu, che leggono `select('*')`, andrebbero in errore.

-- Colonne pubbliche per chi non ha fatto il login
REVOKE SELECT ON public.tenants FROM anon;
GRANT SELECT (
  id, restaurant_name, slug, country, currency, cover_charge, footer_data, logo_url, translations, menu_languages
) ON public.tenants TO anon;

-- Righe: anon tutte (con le sole colonne qui sopra), authenticated solo le proprie
DROP POLICY IF EXISTS "Public read access to tenant info" ON public.tenants;

CREATE POLICY "Anon read public tenant info" ON public.tenants
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Owners read own tenant" ON public.tenants
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

-- Controllo: regole SELECT su tenants e colonne leggibili da anon
SELECT policyname, roles, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'tenants' AND cmd = 'SELECT';

SELECT string_agg(column_name, ', ' ORDER BY column_name) AS colonne_anon
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'tenants' AND grantee = 'anon' AND privilege_type = 'SELECT';
