-- Abilita il Row Level Security (RLS) sulla tabella allergens
ALTER TABLE public.allergens ENABLE ROW LEVEL SECURITY;

-- Crea una policy per permettere la lettura pubblica (SELECT)
-- Questo è necessario affinché il menu possa mostrare gli allergeni
CREATE POLICY "Permetti lettura pubblica degli allergeni" 
ON public.allergens 
FOR SELECT 
USING (true);

-- Nota: Non creiamo policy di INSERT/UPDATE/DELETE per ora,
-- il che significa che solo il ruolo 'service_role' (o tramite script admin) 
-- potrà modificare questi dati.
