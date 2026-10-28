-- 042: Foto e loghi modificabili solo dal proprietario del locale
--
-- I file di ogni locale stanno nella cartella intestata al suo id:
--   dishes: <tenant_id>/dishes/<file> (foto) e <tenant_id>/thumbs/<file> (miniature)
--   logos:  <tenant_id>/logo-<data>.png
-- Le regole precedenti permettevano a qualsiasi utente autenticato di caricare, sostituire,
-- elencare e cancellare i file di tutti i bucket; quelle per locale dei loghi cercavano un
-- nome `<id>.<estensione>` che il codice non usa più. Le regole si sommano: tolte le larghe,
-- restano solo quelle per cartella.
--
-- Lettura: i bucket sono pubblici, quindi /storage/v1/object/public/... funziona senza regole.
-- La regola SELECT serve solo all'elenco dei file (libreria foto, pulizia dei loghi) e alla
-- cancellazione: anche questa limitata alla cartella del proprio locale.
-- Gli script e le azioni del server con la chiave service role non passano da queste regole.

DROP POLICY IF EXISTS "Authenticated users can upload dish images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update dish images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete dish images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to dish images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated Insert Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to logos" ON storage.objects;
DROP POLICY IF EXISTS "Tenant owners can upload logo" ON storage.objects;
DROP POLICY IF EXISTS "Tenant owners can update logo" ON storage.objects;
DROP POLICY IF EXISTS "Tenant owners can delete logo" ON storage.objects;

-- Prima cartella del percorso = id di un locale dell'utente
CREATE OR REPLACE FUNCTION public.storage_owns_folder(object_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenants
    WHERE owner_id = (SELECT auth.uid())
      AND id::text = (storage.foldername(object_name))[1]
  );
$$;

REVOKE ALL ON FUNCTION public.storage_owns_folder(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.storage_owns_folder(text) TO authenticated;

CREATE POLICY "Owners list own images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('dishes', 'logos') AND public.storage_owns_folder(name));

CREATE POLICY "Owners upload own images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('dishes', 'logos') AND public.storage_owns_folder(name));

CREATE POLICY "Owners update own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('dishes', 'logos') AND public.storage_owns_folder(name))
  WITH CHECK (bucket_id IN ('dishes', 'logos') AND public.storage_owns_folder(name));

CREATE POLICY "Owners delete own images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('dishes', 'logos') AND public.storage_owns_folder(name));

-- Controllo: per dishes e logos devono restare solo le quattro regole "Owners ... own images"
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND (qual LIKE '%dishes%' OR qual LIKE '%logos%' OR with_check LIKE '%dishes%' OR with_check LIKE '%logos%')
ORDER BY policyname;
