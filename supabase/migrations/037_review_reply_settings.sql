-- 037: Impostazioni delle risposte alle recensioni Google, per tenant
--
-- Tono, firma e istruzioni libere che l'AI segue quando scrive le risposte.
-- Tabella separata da `tenants` perché quella è leggibile pubblicamente,
-- mentre queste istruzioni riguardano solo il ristoratore.

CREATE TABLE IF NOT EXISTS public.tenant_review_settings (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  tone text NOT NULL DEFAULT 'amichevole' CHECK (tone IN ('amichevole', 'formale')),
  signature text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tenant_review_settings IS 'Tono, firma e istruzioni per le risposte AI alle recensioni';

ALTER TABLE public.tenant_review_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tenant_review_settings FROM anon;

DROP POLICY IF EXISTS "Tenant owners can read review settings" ON public.tenant_review_settings;
CREATE POLICY "Tenant owners can read review settings"
  ON public.tenant_review_settings
  FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Tenant owners can insert review settings" ON public.tenant_review_settings;
CREATE POLICY "Tenant owners can insert review settings"
  ON public.tenant_review_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Tenant owners can update review settings" ON public.tenant_review_settings;
CREATE POLICY "Tenant owners can update review settings"
  ON public.tenant_review_settings
  FOR UPDATE
  TO authenticated
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())))
  WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())));

DROP TRIGGER IF EXISTS update_tenant_review_settings_updated_at ON public.tenant_review_settings;
CREATE TRIGGER update_tenant_review_settings_updated_at
  BEFORE UPDATE ON public.tenant_review_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
