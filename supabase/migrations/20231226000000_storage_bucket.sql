-- Storage Bucket for Menu Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public to view images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'menu-images' );

-- Policy to allow authenticated users to upload images
CREATE POLICY "Auth Users Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'menu-images' AND 
  auth.role() = 'authenticated'
);

-- Policy to allow users to update their own images
CREATE POLICY "Users Update Own Images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'menu-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to delete their own images
CREATE POLICY "Users Delete Own Images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'menu-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
