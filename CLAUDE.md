# Go!Food Menù – note per Claude

Piattaforma SaaS multi-tenant di menu digitali QR per ristoranti (gofoodmenu.it).
Next.js 16 (App Router) + Supabase + Stripe + Resend, deploy su Vercel (team "Giorgio's projects").
Il titolare parla italiano: rispondere in italiano.
**bemyrider** (altro progetto della ditta) si scrive SEMPRE tutto minuscolo, mai "BeMyRider".
La ditta è **GO!Food Italia**: "GO" maiuscolo, senza spazio tra "!" e "Food" (mai "GO! Food" o "Go!Food Italia"). Font del logotipo GO!Food: **Alegreya**.
Email pubblica della ditta: **info@gofood.it** (sui siti sostituisce italiagofood@gmail.com, che resta l'account Google).
**Account di prova** (non sono locali reali, creati all'inizio del progetto): `ristorante-marina`, `belleepoquepalermo`
e `accademia` (piano free).
Non trattarli come clienti in controlli, prove e statistiche. Locali reali che usano il menu (21/10/2026):
`magnaromatrattoria`, `osteria-cilea`, `bistrot107`, `spaghetteria-da-emanuele`, `scjavuru`, `sunset-barcarello`,
`villa-pensabene-ristorante-pizzeria`.

## Convenzioni di lavoro
- Lavorare su un branch e aprire una pull request verso `main`: l'anteprima Vercel serve per provare
  prima della produzione. Le anteprime sono protette dal login Vercel (le PWA vanno provate in produzione).
- Le migrazioni in `supabase/migrations/` si eseguono a mano nel SQL Editor di Supabase.
- Controllo rapido: `npx tsc --noEmit -p .` (ESLint al momento non parte per un problema di configurazione).
- Test del menu pubblico (Playwright + axe, anche su GitHub Actions a ogni PR): `npm run build && npm run test:e2e`.
  Girano sui 7 locali reali in `e2e/locali.ts` (da aggiornare a ogni nuovo cliente) e falliscono anche per
  colori illeggibili salvati da un locale: in quel caso si corregge il tema, non il test.
- Le funzioni AI usano OpenRouter (`OPENROUTER_API_KEY`, modello di default `google/gemini-2.5-flash`).

## Decisioni prese
- **PWA**: un'app per ogni ristorante dalla pagina del menu (`/[slug]/manifest.webmanifest`,
  icone `/[slug]/app-icon/{any|maskable}/{192|512}`), nome/logo/colori del locale, avvio su `/[slug]`.
  L'app dei ristoratori è `public/app.webmanifest`, collegata solo dalla dashboard (start `/dashboard`).
  Su Android 15+ la barra di navigazione prende il `background_color` del manifest e ci disegna
  tasti chiari: serve un colore abbastanza scuro (vedi `pickAppColor` in `src/lib/tenant-pwa.ts`).
  Non si controlla da CSS / viewport-fit (provato e scartato).
- **Recensioni Google**: assistente manuale in `/dashboard/reviews` (prompt in `src/lib/review-reply.ts`,
  impostazioni in `tenant_review_settings`). Regole fisse: niente fatti inventati, niente sconti o
  promesse di cambiamenti, non ammettere né smentire accuse specifiche, pronome coerente.
  Ristorante pilota: Villa Pensabene.
- **Risposte automatiche** (in attesa): modello "agenzia", l'account Google italiagofood@gmail.com è
  gestore di 14 schede Business Profile. Progetto Google Cloud `gofoodmenu-recensioni` (n. 320974965020),
  quota API a 0. Due richieste di accesso respinte automaticamente. Risposta dell'assistenza Google
  (caso 8-9259000041884): il dominio dell'email del richiedente deve coincidere con il dominio del sito
  della scheda (noi avevamo usato @gmail.com). Piano (deciso il 16/10/2026): scheda Business
  Profile della ditta individuale **GO!Food Italia** (software, siti web, Go!Food Menù, bemyrider), creata il
  16/10/2026 con `info@gofood.it`, sito `https://gofood.it` (sito statico da mettere online). Nuova richiesta
  da `info@gofood.it` dopo 60 giorni dalla verifica, rispondendo "Sì" ai 60 giorni e "No" al progetto già approvato.
- **Credits**: nel footer della landing (`src/app/page.tsx`) fascia sottile "Un prodotto di" + logo GO! FOOD
  (`public/gofood-italia.svg`) → https://gofood.it, stesso formato dei siti dei clienti (repo gofooditalia/gofooditalia, `brand/`).
- **Pannello admin** `/admin` (PR #29): accesso via `ADMIN_EMAILS`, newsletter tramite segmento Resend
  (`RESEND_NEWSLETTER_SEGMENT_ID`). Niente CRM esterno per ora (solo clienti già iscritti, unico utente).
- **Cache immagini** (PR #33, 20/10/2026): `images.minimumCacheTTL` a 31 giorni e `deviceSizes` senza 2048/3840
  in `next.config.ts`. Prima le foto dei piatti venivano ritrasformate ogni 4 ore (~13 $/mese).
  Regola: ogni foto o logo caricato su Supabase deve avere un nome file NUOVO (mai sovrascrivere lo stesso
  percorso), altrimenti il menu mostra la versione vecchia fino a un mese.
  Dal 27/10/2026 il team è sulla fascia "Flat Rate CDN 10M" (20 $/mese): ~1,5M richieste/mese, metà da `/_next/image`.
- **Performance menu pubblico** (20/10/2026, banco di prova `/magnaromatrattoria`, il menu più pesante):
  obiettivo alleggerire tutto il progetto, non un singolo locale. Tolta la splash di 3,2 s; prime 2 foto con
  `preload`; logo via `TenantLogo` (next/image); Inter/Playfair solo da next/font (mai doppi da Google Fonts);
  Google Translate caricato solo se il cookie `googtrans` indica una lingua diversa dall'italiano;
  link allergeni con `prefetch={false}`.
- **Caricamento immagini** (20/10/2026): ogni foto/logo passa da `prepareImageForUpload` in
  `src/lib/image-upload.ts` (unico punto: foto piatti max 1600 px / 500 KB in WebP, JPEG di riserva;
  loghi max 600 px / 200 KB in PNG, perché `/[slug]/app-icon` usa next/og che non legge il WebP).
  Se l'ottimizzazione fallisce il caricamento si blocca: mai caricare l'originale. Barriera lato server:
  `file_size_limit` e `allowed_mime_types` dei bucket `dishes` e `logos` (migrazione 038), da tenere
  allineati ai valori del codice. Nuovi punti di caricamento devono usare la stessa funzione.

## Cose aperte (aggiornate al 20/10/2026)
- Ricompressione immagini già caricate (`scripts/recompress-images.mjs`, prova senza `--apply`; migrazione 038
  applicata il 20/10/2026). Fatto il 20/10/2026 per tutti i locali con file fuori regola (Scjavuru, Bistrot 107,
  MagnaRoma, Spaghetteria, Villa Pensabene, Osteria Cilea, Marina, Accademia, Sunset) + 22 orfani cancellati:
  foto in uso da 339 a 106 MB, nessuna foto o logo fuori regola. Copie degli indirizzi originali in
  `scripts/recompress-manifests/*-backup-before.json`. I loghi JPEG sotto 200 KB restano JPEG (next/og li legge).
  Da fare dal 21/10/2026 ore 17:45 UTC: `--cleanup` con ogni manifest `scripts/recompress-manifests/<slug>-<numero>.json`
  (prova, poi `--apply`; ~320 file vecchi), poi revocare la secret key `sb_secret_…` dedicata e toglierla
  dall'ambiente. Non toccare il bucket `Go Food` (loghi della landing in `ClientLogosMarquee.tsx`).
  BelleEpoque (account di prova) usa 86 foto dal sito belleepoquepalermo.it, fuori da Supabase.
- PR #29 (`/admin`) unita: verificare `/admin` con i dati reali (serve `ADMIN_EMAILS` su Vercel).
- Richiesta API Google Business Profile: ripresentarla da info@gofood.it dopo 60 giorni dalla verifica
  della scheda "GO!Food Italia" (metà dicembre 2026).
- Verificare l'installazione dell'app Bistrot su Android e l'icona su iPhone (gestore MagnaRoma).

## Ecosistema GO!Food Italia (altri repo, tutti su Vercel, deploy da `main`)
- Sito della ditta: gofooditalia/gofooditalia (gofood.it). Il suo CLAUDE.md è la memoria principale per
  brand (logotipo Alegreya, logo GO! FOOD in `brand/`), credits, Resend e siti dei clienti.
- Siti clienti con credits "Sito realizzato da" → gofood.it: maropizzeria, osteriacilea, villapensabene,
  sunset-barcarello, mondelloholiday, scjavuru-holiday.
- Email dai moduli: Resend, dominio gofood.it, mittente noreply@gofood.it; `RESEND_API_KEY` come variabile
  condivisa del team Vercel (collegata a mondelloholiday e scjavuru-holiday; gofooditalia ha la sua).
- Pagina LinkedIn linkedin.com/company/gofooditalia e scheda Google "GO!Food Italia" completate.
