-- 040: Periodo di tolleranza per i pagamenti non riusciti
--
-- Con un pagamento non riuscito (Stripe: past_due / unpaid) il menu pubblico resta visibile fino a
-- `grace_until`, mentre Stripe ritenta l'addebito. La data la imposta il webhook al primo pagamento
-- non riuscito e non si sposta con i tentativi successivi; al pagamento riuscito torna NULL.
-- Dopo quella data il menu mostra una pagina neutra (il cron giornaliero aggiorna la cache).
--
-- In tenant_billing (solo service role) le date degli avvisi email al ristoratore, per non mandarli due volte.

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS grace_until timestamptz;

COMMENT ON COLUMN public.tenants.grace_until IS 'Con pagamento non riuscito (past_due), il menu resta pubblico fino a questa data; NULL negli altri casi';

ALTER TABLE public.tenant_billing
  ADD COLUMN IF NOT EXISTS grace_notice_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS grace_reminder_sent_at timestamptz;

COMMENT ON COLUMN public.tenant_billing.grace_notice_sent_at IS 'Email "pagamento non riuscito" inviata (tolleranza in corso)';
COMMENT ON COLUMN public.tenant_billing.grace_reminder_sent_at IS 'Email di promemoria prima della sospensione del menu inviata';

-- Anche grace_until è riservato al sistema di pagamento: un proprietario non deve poter allungare la tolleranza.
CREATE OR REPLACE FUNCTION public.protect_tenant_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Only client roles are restricted; service_role / postgres pass through.
  IF current_user IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.subscription_tier := 'free';
      NEW.subscription_status := 'active';
      NEW.grace_until := NULL;
    ELSIF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier
       OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
       OR NEW.grace_until IS DISTINCT FROM OLD.grace_until THEN
      RAISE EXCEPTION 'subscription fields can only be changed by the billing system'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
