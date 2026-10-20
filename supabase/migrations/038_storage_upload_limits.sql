-- 038: Limiti di peso e formato sui bucket delle immagini
--
-- Barriera lato server: anche se il browser non ottimizza l'immagine (codice vecchio,
-- errore, chiamata diretta alle API) Supabase rifiuta i file troppo pesanti o in un
-- formato non previsto. I valori coincidono con le regole di src/lib/image-upload.ts,
-- che ridimensiona e converte le immagini prima del caricamento.
-- Valgono solo per i nuovi caricamenti: i file già presenti non vengono toccati.

-- Foto dei piatti: WebP (JPEG per i browser che non sanno scrivere WebP), max 500 KB
UPDATE storage.buckets
SET file_size_limit = 512000,
    allowed_mime_types = ARRAY['image/webp', 'image/jpeg']
WHERE id = 'dishes';

-- Loghi: PNG (le icone dell'app del locale non leggono il WebP), max 200 KB
UPDATE storage.buckets
SET file_size_limit = 204800,
    allowed_mime_types = ARRAY['image/png']
WHERE id = 'logos';

-- Controllo: deve mostrare i due bucket con i nuovi limiti
SELECT id, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id IN ('dishes', 'logos');
