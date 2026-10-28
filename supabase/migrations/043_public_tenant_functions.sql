-- 043: Funzioni per le pagine pubbliche che non leggono i dati riservati dei locali
--
-- Da applicare PRIMA del deploy del codice che le usa e prima della 044, che toglie a chi non
-- ha fatto il login la lettura di email, piano e stato dell'abbonamento. Aggiunge solo funzioni:
-- non cambia nessun permesso esistente. Rispondono solo quello che una pagina pubblica mostra già.

-- Slug occupato? (registrazione e attivazione, useCheckSlug)
CREATE OR REPLACE FUNCTION public.is_slug_taken(p_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenants WHERE slug = p_slug);
$$;

-- Il menu del locale è pubblico? Stessa regola di isMenuPublic (src/lib/menu-visibility.ts):
-- da cambiare insieme. Premium attivo, oppure pagamento non riuscito ancora in tolleranza.
CREATE OR REPLACE FUNCTION public.is_menu_public(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenants
    WHERE id = p_tenant_id
      AND subscription_tier IS DISTINCT FROM 'free'
      AND (
        subscription_status = 'active'
        OR (subscription_status = 'past_due' AND grace_until IS NOT NULL AND grace_until > now())
      )
  );
$$;

-- Menu pubblici per la sitemap
CREATE OR REPLACE FUNCTION public.public_menu_tenants()
RETURNS TABLE (slug text, menu_languages text[], updated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.slug, t.menu_languages, t.updated_at
  FROM public.tenants t
  WHERE t.slug IS NOT NULL AND public.is_menu_public(t.id);
$$;

REVOKE ALL ON FUNCTION public.is_slug_taken(text) FROM public;
REVOKE ALL ON FUNCTION public.is_menu_public(uuid) FROM public;
REVOKE ALL ON FUNCTION public.public_menu_tenants() FROM public;
GRANT EXECUTE ON FUNCTION public.is_slug_taken(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_menu_public(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_menu_tenants() TO anon, authenticated;

-- Controllo: slug esistente e inventato; menu pubblici (devono essere i locali paganti)
SELECT public.is_slug_taken('bistrot107') AS esistente, public.is_slug_taken('slug-che-non-esiste-xyz') AS inventato;
SELECT slug FROM public.public_menu_tenants() ORDER BY slug;
