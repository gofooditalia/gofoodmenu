-- Allow public read access to profiles
-- This is required for customers to view the restaurant page without logging in.
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (TRUE);
