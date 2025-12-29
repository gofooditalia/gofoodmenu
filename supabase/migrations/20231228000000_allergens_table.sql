-- Create Allergens Table
CREATE TABLE IF NOT EXISTS public.allergens (
  id TEXT NOT NULL,
  number INTEGER NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  name TEXT NULL,
  description TEXT NULL,
  CONSTRAINT allergens_pkey PRIMARY KEY (id),
  CONSTRAINT allergens_number_key UNIQUE (number),
  CONSTRAINT allergens_number_check CHECK (
    (
      (number >= 1)
      AND (number <= 14)
    )
  )
);

-- Enable RLS
ALTER TABLE public.allergens ENABLE ROW LEVEL SECURITY;

-- Policies for Allergens
CREATE POLICY "Public can view allergens" ON public.allergens
  FOR SELECT USING (TRUE);

-- Seed Data (14 standard EU allergens)
INSERT INTO public.allergens (id, number, icon, name, description) VALUES
('glutine', 1, '🌾', 'Glutine', 'Cereali contenenti glutine: grano, segale, orzo, avena, farro, kamut.'),
('crostacei', 2, '🦐', 'Crostacei', 'Crostacei e prodotti a base di crostacei.'),
('uova', 3, '🥚', 'Uova', 'Uova e prodotti a base di uova.'),
('pesce', 4, '🐟', 'Pesce', 'Pesce e prodotti a base di pesce.'),
('arachidi', 5, '🥜', 'Arachidi', 'Arachidi e prodotti a base di arachidi.'),
('soia', 6, '🫘', 'Soia', 'Soia e prodotti a base di soia.'),
('latte', 7, '🥛', 'Latte', 'Latte e prodotti a base di latte (compreso il lattosio).'),
('frutta-guscio', 8, '🌰', 'Frutta a guscio', 'Mandorle, nocciole, noci, anacardi, pistacchi.'),
('sedano', 9, '🌿', 'Sedano', 'Sedano e prodotti a base di sedano.'),
('senape', 10, '🍯', 'Senape', 'Senape e prodotti a base di senape.'),
('sesamo', 11, '🥯', 'Sesamo', 'Semi di sesamo e prodotti a base di semi di sesamo.'),
('anidride-solforosa', 12, '🍷', 'Solfiti', 'Anidride solforosa e solfiti in concentrazioni superiori a 10 mg/kg o 10 mg/litro.'),
('lupini', 13, '🌼', 'Lupini', 'Lupini e prodotti a base di lupini.'),
('molluschi', 14, '🐚', 'Molluschi', 'Molluschi e prodotti a base di molluschi.');
