// Locali reali che usano il menu (vedi CLAUDE.md). Aggiornare quando arriva un nuovo cliente.
// Gli account di prova (ristorante-marina, belleepoquepalermo, accademia) restano fuori.
export const LOCALI_REALI = [
  'magnaromatrattoria',
  'osteria-cilea',
  'bistrot107',
  'spaghetteria-da-emanuele',
  'scjavuru',
  'sunset-barcarello',
  'villa-pensabene-ristorante-pizzeria',
];

// Locale col piano free: il suo menu non deve essere pubblico
export const LOCALE_FREE = 'accademia';

// Locale con il menu tradotto e salvato (tenants.menu_languages): pagine /{slug}/{lingua} e /{slug}/{lingua}/allergeni
export const LOCALE_TRADOTTO = 'magnaromatrattoria';
