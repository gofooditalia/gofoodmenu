# Go!Food Menù – note per Claude

Piattaforma SaaS multi-tenant di menu digitali QR per ristoranti (gofoodmenu.it).
Next.js 16 (App Router) + Supabase + Stripe + Resend, deploy su Vercel (team "Giorgio's projects").
Il titolare parla italiano: rispondere in italiano.
**Il repository è PUBBLICO.** Mai scrivere in codice, commenti, nomi, test, commit, PR, issue, README o in questo file:
prezzi e formule commerciali, strategia, nomi di concorrenti, partner o fornitori, costi e margini, numeri dei clienti.
Servono valori neutri, segnaposto o variabili d'ambiente; nel dubbio chiedere al titolare. Le note riservate stanno in
file locali esclusi da git (non disponibili nelle sessioni cloud).
**bemyrider** (altro progetto della ditta) si scrive SEMPRE tutto minuscolo, mai "BeMyRider".
La ditta è **GO!Food Italia**: "GO" maiuscolo, senza spazio tra "!" e "Food" (mai "GO! Food" o "Go!Food Italia"). Font del logotipo GO!Food: **Alegreya**.
Email pubblica della ditta: **info@gofood.it** (sui siti sostituisce italiagofood@gmail.com, che resta l'account Google).
**Account di prova** (non sono locali reali): `belleepoquepalermo` (email di Gabriele), `accademia` (piano free) e
`gofood` (italiagofood@gmail.com, usato dal test del Design Studio); `ristorante-marina` non esiste più (22/10/2026).
Anche `oza` (email di Gabriele, registrazione senza slug) è una prova. E `demo` (italiagofood+prova1@gmail.com, 29/10/2026, prova
registrazione con la sola email e importazione AI). Elenco nel codice: `TEST_TENANT_SLUGS` e,
per chi non ha slug, `TEST_TENANT_IDS` in `src/lib/admin.ts`, da aggiornare se ne nasce uno nuovo.
Non trattarli come clienti in controlli, prove e statistiche. Locali reali che usano il menu (21/10/2026):
`magnaromatrattoria`, `osteria-cilea`, `bistrot107`, `spaghetteria-da-emanuele`, `scjavuru`, `sunset-barcarello`,
`villa-pensabene-ristorante-pizzeria`.

## Convenzioni di lavoro
- Lavorare su un branch e aprire una pull request verso `main`: l'anteprima Vercel serve per provare
  prima della produzione. Le anteprime sono protette dal login Vercel (le PWA vanno provate in produzione).
  reCAPTCHA (registrazione): sulle anteprime Vercel usa le chiavi di prova pubbliche di Google (variabili
  `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` e `RECAPTCHA_SECRET_KEY` del solo ambiente Preview, 29/10/2026), che superano
  sempre il controllo: i domini `*.vercel.app` non sono registrati sulla chiave vera, usata solo in produzione.
- Le migrazioni in `supabase/migrations/` si eseguono a mano nel SQL Editor di Supabase.
- Controllo rapido: `npx tsc --noEmit -p .` (ESLint al momento non parte per un problema di configurazione).
- Test del menu pubblico (Playwright + axe, anche su GitHub Actions a ogni PR): `npm run build && npm run test:e2e`.
  Girano sui 7 locali reali in `e2e/locali.ts` (da aggiornare a ogni nuovo cliente) e falliscono anche per
  colori illeggibili salvati da un locale: in quel caso si corregge il tema, non il test.
  Segreti GitHub: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chiave publishable dedicata
  `github_actions`, sola lettura). Nel workflow `STRIPE_SECRET_KEY` e `SUPABASE_SERVICE_ROLE_KEY` sono finte:
  servono solo al build (client creati al caricamento dei moduli).
  Test del Design Studio (`e2e/design-studio.spec.ts`, PR #59, 22/10/2026): accede con l'account di prova "Gofood"
  (italiagofood@gmail.com, piano free: il Design Studio non richiede premium) tramite i segreti `E2E_EMAIL` ed
  `E2E_PASSWORD`, applica l'altro stile pronto e controlla anteprima e dati salvati. Ogni scrittura verso Supabase
  viene intercettata (il database è quello di produzione): non togliere quella barriera. Trace spento in quel
  file (conterrebbe password e token); senza segreti il test viene saltato. Playwright 1.64.1 su `ubuntu-latest`
  (Ubuntu 26.04 richiede Playwright 1.64 o successivo; con la 1.56 il job si fermava all'installazione di Chromium).
- Salvataggio dati del locale (`useUpdateTenant` in `src/hooks/useTenant.ts`, 22/10/2026): ogni scrittura controlla
  l'errore (prima compariva "Dati salvati!" anche col tema non salvato). Le sedi (`tenant_locations`) si salvano
  inserendo le nuove e poi cancellando le vecchie per id: se l'inserimento fallisce il locale tiene i suoi indirizzi.
- Skill del progetto in `.claude/skills/`: `nuovo-ristorante` (ingresso di un locale) e `a11y-audit`
  (accessibilità su pagine reali con axe-core).
- Branch: la cancellazione automatica dopo il merge NON è attiva su GitHub e il proxy delle sessioni cloud non
  può cancellare branch remoti: i branch uniti si cancellano a mano da github.com/gofooditalia/gofoodmenu/branches.
- **Slug riservati** (24/10/2026): `RESERVED_SLUGS` in `src/lib/reserved-slugs.ts` elenca le rotte di primo livello
  di `src/app/` (e cartelle di `public/`), che hanno la precedenza su `/[slug]`. Ogni nuova rotta va aggiunta lì,
  altrimenti un locale con quel nome avrebbe il menu irraggiungibile. Lunghezza minima 3 caratteri
  (`SLUG_MIN_LENGTH`). La route di checkout (`/api/stripe/checkout`, dove lo slug viene davvero assegnato) passa al
  suffisso `-1`, `-2`… per uno slug riservato o troppo corto, come per uno occupato (il ristoratore non può
  modificare lo slug proposto in `ActivationModal`); `useCheckSlug` lo segnala come non disponibile.
- **Registrazione con la sola email** (29/10/2026, PR #102): `/register` chiede solo email + reCAPTCHA e manda un link
  (`signInWithOtp`, `shouldCreateUser: true`) che porta a `/auth/confirm?next=/onboarding`; il nome del locale si scrive
  al passaggio 1 (il nome provvisorio `PLACEHOLDER_RESTAURANT_NAME` lì parte vuoto), la password è facoltativa
  (`PasswordSetup`, metadato `password_set`). Il login ha anche "mandami un link" (`shouldCreateUser: false`).
  `/auth/confirm` accetta `token_hash` (modelli email con `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email`,
  funziona anche su un altro dispositivo) o `code` (modelli predefiniti, solo nello stesso browser).
- **Importazione AI con categorie** (29/10/2026): l'AI (`/api/ai/analyze-menu`) copia per ogni piatto l'intestazione del
  menu in `section` (mai inventata: vuota se non c'è) e usa `categoryId` solo per categorie già create. `proposeCategories`
  (`src/lib/menu-import-categories.ts`) riusa quelle con lo stesso nome e propone le altre (`new:<slug>`), che il
  ristoratore rinomina o toglie nella revisione di `MenuImportModal`: si creano solo all'importazione. Al passaggio 2
  dell'onboarding "Importa il menu" è la prima scelta, le categorie a mano restano.
- Temi modificati direttamente nel database: il menu pubblico è in cache ISR fino a 24 h; salvando dalla
  dashboard (o con un nuovo deploy) si aggiorna subito.
- Le funzioni AI usano OpenRouter (`OPENROUTER_API_KEY`). Modelli predefiniti in `AI_MODELS` (`src/lib/ai-models.ts`,
  29/10/2026): allergeni `google/gemini-3.8-flash`; importazione menu, traduzioni e risposte alle recensioni
  `anthropic/claude-haiku-5.5` con ragionamento minimo. Ognuno si cambia da Vercel (`OPENROUTER_ALLERGEN_MODEL`,
  `_IMPORT_`, `_TRANSLATE_`, `_REVIEW_`). `reasoningFor` spegne il ragionamento solo sui Gemini 2.5 (dai Gemini 3.5 è
  obbligatorio: spegnerlo dà errore 400), altrimenti `low`. Haiku ignora `temperature`. Scelta fatta con prove su un
  menu di 10 pagine, 30 piatti (allergeni) e 16 piatti × 8 lingue: 2.5 Flash-Lite non segnava come certi noci,
  pistacchi, pinoli, sesamo; 3.5 Flash-Lite traduceva mandorle e noci con "nuts"; GLM 5.3 Flash e Gemma 4 scartati.
  Un nuovo modello si prova prima su dati veri.
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
- **Risposte automatiche** (in attesa): servono le API Google Business Profile, non ancora concesse.
  Richiesta da ripresentare da `info@gofood.it` a metà dicembre 2026.
- **Credits**: nel footer della landing (`src/app/page.tsx`) fascia sottile "Un prodotto di" + logo GO! FOOD
  (`public/gofood-italia.svg`) → https://gofood.it, stesso formato dei siti dei clienti (repo gofooditalia/gofooditalia, `brand/`).
- **Pannello admin** `/admin` (PR #29): accesso via `ADMIN_EMAILS`, newsletter tramite segmento Resend
  (`RESEND_NEWSLETTER_SEGMENT_ID`). Niente CRM esterno per ora (solo clienti già iscritti, unico utente).
- **Cache immagini** (PR #33, 20/10/2026): `images.minimumCacheTTL` a 31 giorni e `deviceSizes` senza 2048/3840
  in `next.config.ts`. Prima le foto dei piatti venivano ritrasformate ogni 4 ore.
  Regola: ogni foto o logo caricato su Supabase deve avere un nome file NUOVO (mai sovrascrivere lo stesso
  percorso), altrimenti il menu mostra la versione vecchia fino a un mese.
  Da tenere d'occhio i build delle anteprime Vercel.
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
- **Permessi sui file** (migrazione 042, applicata il 28/10/2026): nei bucket `dishes` e `logos` un utente può
  elencare, caricare, modificare e cancellare solo nella cartella `<tenant_id>/` del proprio locale
  (`public.storage_owns_folder`). I bucket sono pubblici: la lettura dagli indirizzi `/object/public/` non passa dalle
  regole. Ogni nuovo punto di caricamento deve scrivere sotto `<tenant_id>/`. Il bucket `Go Food` (landing) usa ancora
  cartelle per slug.
- **Dati pubblici dei locali** (PR #96, migrazioni 043–044 applicate il 28/10/2026): chi non ha fatto il login legge da
  `tenants` solo `PUBLIC_TENANT_COLUMNS` (`src/lib/public-tenant.ts`: nome, slug, logo, `footer_data`, coperto, valuta,
  paese, lingue, traduzioni); un utente autenticato legge per intero solo i propri locali. Email, proprietario, piano,
  stato dell'abbonamento e date sono riservati. Le pagine pubbliche leggono il locale con `getPublicTenant` (mai
  `select('*')` con il client pubblico: darebbe "permesso negato") e sanno se il menu è pubblico da `menu_public`
  (funzione `is_menu_public`); sitemap da `public_menu_tenants()`, slug libero da `is_slug_taken()`, email del locale
  per le notifiche con `getTenantContactEmail` (chiave service role, solo server). Una nuova colonna pubblica va
  aggiunta sia a `PUBLIC_TENANT_COLUMNS` sia ai permessi di `anon` (nuova migrazione).
- **Miniature delle foto dei piatti** (28/10/2026): il menu pubblico scarica `<tenant>/thumbs/<file>` direttamente da
  Supabase (`dishThumbUrl` in `src/lib/dish-thumbs.ts`, `unoptimized` in `DishCard`), non da `/_next/image`: le foto
  erano il 70 % delle richieste CDN di Vercel. Miniatura max 960 px / 150 KB in WebP, creata al caricamento insieme
  alla foto da `uploadDishPhoto` (`src/lib/image-upload.ts`, unico punto per le foto dei piatti) e cancellata con lei.
  Se manca, `DishCard` torna alla foto ottimizzata da next/image. Foto già caricate: `scripts/make-dish-thumbs.mjs`
  (prova senza `--apply`), da rilanciare dopo ogni `recompress-images.mjs`. Loghi e foto fuori da Supabase restano su
  next/image.
- **Temi e Design Studio** (21/10/2026, PR #48–#51): i preset del Design Studio sono solo due,
  `trattoria-classica` e `moderno-scuro` (`THEME_PRESETS` in `src/lib/theme-engine/presets.ts`), completi in ogni
  colore e con contrasti WCAG AA verificati. I 10 preset vecchi restano in `LEGACY_PRESETS`, fuori dal Design
  Studio, solo per completare i temi già salvati (`osteria-romana`, `moderno`…): non modificarli, cambierebbe
  l'aspetto dei locali. `resolveTheme` completa un tema salvato col preset da cui è partito (prima tutti
  ereditavano da Osteria Romana e il menu era diverso dall'anteprima). Applicare un preset sostituisce TUTTI i
  colori del locale. "Font titoli" vale anche per i nomi dei piatti (`theme-heading`). Nessun effetto sul menu
  pubblico: `frame`, `rounded`, `shadows`, `scale` (`MenuFrame` non è usato), `colors.success`, e le colonne
  `tenants.primary_color`, `hero_title_color`… che il Design Studio scrive ancora.
- **Leggibilità** (21/10/2026, PR #46): `src/lib/theme-engine/contrast.ts` (`contrastRatio`, `readableTextOn`).
  Si correggono da soli, se il colore del tema non si legge: testo dei badge, testo sul colore principale
  (`--tenant-on-primary`: pulsanti, categorie attive, selettore lingua) e testo in colore Secondario
  (sottotitolo, descrizioni categorie), anche nell'anteprima. Per i colori che il ristoratore sceglie il Design
  Studio avvisa (`ContrastWarnings` in `VisualEditorPanel.tsx`): i nuovi controlli vanno aggiunti lì. Il
  selettore lingua prende i colori del tema (niente pillola bianca sui temi scuri).
- **QR code** (PR #44): si scarica dalla card della dashboard (`QRCodeCard.tsx`) disegnato a 1200 px; logo di
  riserva `/logo-gofood-new.svg` (`/logo-gofood.png` non esiste).
- **Layout del menu pubblico**: deciso il 21/10/2026 di non ridisegnarlo (piace ai ristoratori, test e
  accessibilità a posto). taste-skill (Leonxlnx/taste-skill) valutata: utile come controllo della landing, non
  per il menu né come guida di stile; non installata nel repo.
- **Landing**: niente numeri o prove inventate (tolta "Usata da centinaia di ristoranti", PR #54).
  Bilingue dal 24/10/2026: `/` in italiano e `/en` in inglese scritto apposta,
  stesso componente `src/components/landing/LandingPage.tsx`, testi in `landing-copy.ts` (ogni modifica va fatta in
  entrambe le lingue). Pulsante IT/EN in testata, hreflang e canonical nei metadati, `/en` nella sitemap, banner
  cookie in inglese su `/en`. In inglese: lingue del menu dichiarate "auto-translated" (sono Google Translate) e avviso
  che il pannello del ristoratore è solo in italiano. **Lo slug `en` è occupato dalla landing**: nessun locale può
  usarlo (le rotte statiche vincono su `/[slug]`; verificato il 24/10/2026 che nessun locale lo aveva).
  Testi riscritti il 24/10/2026: sezione "Quattro motivi per sceglierlo" (`pillars`) al posto della griglia di
  funzioni; chiusura "Il tuo menu online in giornata". Promessa: "Il tuo menu digitale. Lo fai tu, in pochi minuti."
  Pilastri: Lo fai tu · Allergeni seri · Il menu è tuo · Ti risponde una persona. Tono: concreto, niente superlativi,
  niente numeri o prove inventate. Go!Food Menù non è un sito web del locale (niente chi siamo / gallery).
- **Foto dei Piatti: Con foto / Solo testo** (Design Studio, 24/10/2026): `dishPhotos: 'hide'` in `theme_config`
  (nessuna migrazione), `DishCard` senza riquadro foto e prezzo accanto al nome, due colonne su schermo largo, nessuna
  immagine scaricata. Applicare uno stile pronto NON cambia questa scelta (`applyPreset` in `ThemeContext.tsx`). Le
  foto caricate restano salvate. Default: con foto (nessun locale cambia).

- **Scheda contatti `/{slug}/info`** (24/10/2026, in prova solo su **Magna Roma**: `INFO_PAGE_SLUGS` in
  `src/lib/tenant-info.ts`, gli altri locali ricevono 404). Stile Linktree, **solo link e contatti, nient'altro**:
  logo, nome, sottotitolo, un unico pulsante "Sfoglia il menu" (niente pulsante Bevande), per ogni sede indirizzo con
  "Indicazioni" (Google Maps), un pulsante per ogni numero di telefono, orari; social. Niente recensioni, prenotazioni,
  app, testi o foto: non è un sito del locale. **Il QR resta sul menu**; la scheda serve per bio Instagram/TikTok,
  scheda Google, biglietti. Per tutti i locali con link pubblico quando si apre (cioè i paganti). Dati da
  `tenant_locations` e `footer_data.socials`; i numeri si ricavano dal campo libero del telefono (`parsePhoneNumbers`:
  "091 7283177 - 3922151234" → due pulsanti; parti con lettere saltate). Solo in italiano per ora. Orari di Magna Roma
  inseriti il 24/10/2026 (12:30–15:00 · 19:30–23:00, tutte le sedi). Si aggiorna con `revalidateMenuSlug`.
- **Pagamenti non riusciti** (27/10/2026, migrazione 040): con `past_due`/`unpaid` il menu resta visibile per
  `MENU_GRACE_DAYS` giorni (default 7) fino a `tenants.grace_until`, che il webhook imposta al primo pagamento non
  riuscito e non sposta più; al pagamento riuscito torna NULL. Regola unica `isMenuPublic` in
  `src/lib/menu-visibility.ts`, con la copia SQL `is_menu_public` (migrazione 043) usata dalle pagine pubbliche
  (menu, lingue, allergeni, `/info`, sitemap): le due vanno cambiate insieme. Locale esistente ma senza menu pubblico
  (sospeso, disdetto, free): pagina neutra `MenuUnavailable` (noindex, "chiedi al personale", riga in inglese), non
  più 404. Cron Vercel `/api/cron/billing-grace` alle 5 UTC (`vercel.json`, richiede `CRON_SECRET`): sospende alla
  scadenza (ore 4 UTC, mai durante il servizio) e manda le email al ristoratore con copia ad `ADMIN_EMAILS`
  (avviso all'inizio, promemoria 2 giorni prima; date in `tenant_billing`). `grace_until` è protetto dal trigger
  come `subscription_status`.
- **Disdetta dell'abbonamento** (27/10/2026): pulsante "Disdici abbonamento" in Account, che apre il portale clienti
  Stripe direttamente sulla disdetta (`action: 'cancel'` in `/api/stripe/portal`, `flow_data` `subscription_cancel`).
  La configurazione del portale su Stripe (dashboard Stripe, non nel codice) disdice a fine periodo, senza rimborsi
  parziali, con motivo facoltativo. Mentre la disdetta è programmata: stato "Disdetto", "Termina il …", pulsante
  "Riattiva abbonamento" e avviso in tutto il pannello (`CancellationBanner`, dati da Stripe con
  `useSubscriptionDetails`, nessuna colonna nel database). Alla fine del periodo `subscription.deleted` porta il locale
  al piano free (pagina neutra). Il webhook avvisa `ADMIN_EMAILS` quando un ristoratore disdice o annulla la disdetta
  (`src/lib/cancellation-notice.ts`, con il motivo scelto nel portale). "Elimina Account" NON disdice l'abbonamento (scelta del
  titolare: niente disdetta automatica) ma è **bloccato finché l'abbonamento si rinnova**: la conferma offre "Disdici
  abbonamento" e "Elimina tutto" resta disattivato; `deleteAccount` ripete il controllo su Stripe
  (`hasRenewingSubscription` in `src/lib/stripe-billing.ts`) e si ferma anche se Stripe non risponde. Con la disdetta
  programmata l'eliminazione è libera (nessun altro rinnovo).

## Cose aperte (aggiornate al 21/10/2026)
- Ricompressione immagini già caricate (`scripts/recompress-images.mjs`, prova senza `--apply`; migrazione 038
  applicata il 20/10/2026). Fatto il 20/10/2026 per tutti i locali con file fuori regola (Scjavuru, Bistrot 107,
  MagnaRoma, Spaghetteria, Villa Pensabene, Osteria Cilea, Marina, Accademia, Sunset) + 22 orfani cancellati:
  foto in uso da 339 a 106 MB, nessuna foto o logo fuori regola. Copie degli indirizzi originali in
  `scripts/recompress-manifests/*-backup-before.json`. I loghi JPEG sotto 200 KB restano JPEG (next/og li legge).
  Pulizia fatta il 21/10/2026: `--cleanup --apply` su tutti i manifest, cancellati i 319 file vecchi (274 MB),
  0 piatti o loghi che puntano a file mancanti; bucket `dishes` 136 MB, `logos` 0,7 MB. I file citati nei
  `*-backup-before.json` non esistono più (restano solo come storico).
  Chiave segreta Supabase sostituita il 22/10/2026: la `default` (usata sia da Vercel sia dall'ambiente delle
  sessioni cloud) è stata cancellata; Vercel usa la nuova `vercel-produzione`. L'ambiente cloud non ha più
  `SUPABASE_SERVICE_ROLE_KEY`: per gli script di manutenzione creare una chiave segreta apposta, toglierla
  appena finito e non riusare mai quella di Vercel.
  Deciso il 22/10/2026: i file non assegnati a nessun piatto in `<tenant>/dishes/` NON sono orfani, sono la libreria
  foto del ristoratore (`/dashboard/media`, `PhotoManager`: le carica, le assegna più tardi, le elimina da sé).
  Non cancellarli (187 foto, ~30 MB al 22/10/2026, già sotto le regole di peso); `--orphans` salta apposta le
  cartelle dei locali. Una stessa foto può stare su più piatti: `deleteDishImage` in
  `src/app/dashboard/dishes/page.tsx` cancella il file solo se nessun altro piatto lo usa.
  Non toccare il bucket `Go Food` (loghi della landing in `ClientLogosMarquee.tsx`).
  BelleEpoque (account di prova) usa 86 foto dal sito belleepoquepalermo.it, fuori da Supabase.
- `/admin` verificato con i dati reali il 22/10/2026. Newsletter configurata il 23/10/2026: italiagofood@gmail.com è
  membro del team Resend **gofoodmenu** (account di Gabriele, dominio `gofoodmenu.it` verificato), segmento
  "Esercenti Go!Food Menù" (`RESEND_NEWSLETTER_SEGMENT_ID` su Vercel, Production e Preview) e nuova `RESEND_API_KEY`
  Full access dello stesso team (con "Sending access" non si creano contatti; una chiave di un altro team romperebbe
  gli invii da `help@` e `reservations@gofoodmenu.it`). Gli account di prova (`TEST_TENANT_SLUGS`, `TEST_TENANT_IDS`) sono esclusi
  dalla sincronizzazione. Invio da `help@` provato con la nuova chiave il 23/10/2026 (consegnato). "Sincronizza lista newsletter"
  provata il 23/10/2026. Dal 23/10/2026 la sincronizzazione aggiunge solo i clienti
  con abbonamento premium attivo (`isPaying` in `src/lib/admin.ts`): niente registrazioni a metà né piano free.
  Aggiunge e basta: chi smette di essere cliente va tolto a mano dal segmento su Resend.
  Prima newsletter inviata il 23/10/2026 da Resend Broadcasts (saluto `{{{FIRST_NAME|a tutto lo staff}}}`, reply-to
  `help@gofoodmenu.it`) ai clienti paganti. Novità già annunciate: menu come app (PWA), risposte alle recensioni Google,
  menu più veloce e foto ottimizzate, Design Studio con due stili e avvisi di leggibilità, QR in alta risoluzione,
  anteprima dei link condivisi, salvataggi più sicuri. La prossima riparte dalle novità successive.
  **Periodicità (decisa il 23/10/2026)**: una al mese, il **primo lunedì del mese verso le 10** (molti locali chiudono
  il lunedì; il venerdì è giorno di lavoro pieno). Racconta le novità del mese appena chiuso. Novembre 2026 saltato
  (troppo vicino alla prima): la seconda è lunedì 7/12/2026. Se nel mese non c'è niente di utile al ristoratore, si salta.
  Le newsletter inviate stanno in `newsletter/AAAA-MM.html` (la prima, `2026-10.html`, è il modello: stile, saluto,
  piè di pagina col link di disiscrizione `{{{RESEND_UNSUBSCRIBE_URL}}}`). Un'attività programmata ogni giovedì
  controlla se il lunedì dopo è il primo del mese e, in quel caso, prepara la bozza in una pull request. NON cancellare la chiave
  "Onboarding" (Sending access) dello stesso team: la usa via SMTP l'email "Conferma Registrazione" da
  `register@gofoodmenu.it`: è l'SMTP personalizzato di Supabase Auth (Authentication → Emails → SMTP Settings:
  `smtp.resend.com`, porta 465, utente `resend`, mittente "GO!Food Menù"; verificato il 23/10/2026).
- **Menu tradotti al posto di Google Translate** (24/10/2026, pilota **Magna Roma**, lingue **en, fr, de, es**, dal 27/10/2026 anche
  **pl** e **pt** (portoghese europeo), scelte per il turismo in Sicilia: polacchi in forte crescita e poco inglese):
  traduzioni salvate in `translations` (jsonb) di `dishes`, `categories` e `tenants` (sottotitolo `tagline` e descrizione
  `brand`), lingue attive in `tenants.menu_languages` (migrazione 039, applicata il 24/10/2026). Si generano dal pannello
  `/admin` (pulsante "Traduci menu", `src/lib/translate-menu.ts`, OpenRouter, modello `OPENROUTER_TRANSLATE_MODEL` o
  Gemini 2.5 Flash): traduce solo le voci nuove o cambiate e poi attiva le lingue. Regole del prompt: i nomi dei piatti
  tipici restano in italiano, ingredienti tradotti fedelmente, niente ingredienti aggiunti, "frutta secca" = frutta a
  guscio (nuts, Nüsse…), mai frutta essiccata (27/10/2026, Osteria Cilea);
  "noccioline" = arachidi, mai nocciole (27/10/2026, Bistrot 107). **Sicurezza**: ogni traduzione
  tiene il testo italiano di partenza (`source`); se il ristoratore cambia nome o descrizione, il menu tradotto mostra
  l'italiano per quel piatto finché non viene ritradotto. Allergeni ed etichette hanno testi fissi scritti a mano
  (`src/lib/menu-i18n.ts`), mai dall'AI. Pagine `/{slug}/{lingua}` (`src/app/[slug]/[lang]`, codice comune in
  `src/app/[slug]/menu-page.tsx`), hreflang tra le versioni, sitemap. Il middleware (`src/lib/menu-language-redirect.ts`)
  manda chi apre `/{slug}` dal QR alla lingua del telefono (olandese o altre → inglese; italiano o nessuna → italiano);
  la scelta fatta nel selettore (cookie `menu_lang`) vale più del telefono. Elenco dei locali tradotti letto ogni 5 min.
  I locali senza traduzioni restano con Google Translate. Pagina allergeni tradotta (27/10/2026): `/{slug}/{lingua}/allergeni`
  (`src/app/[slug]/allergens-page.tsx`), testi fissi dei 14 allergeni e delle note legali in `src/lib/allergens-i18n.ts`
  (scritti a mano sui testi ufficiali del Reg. UE 1169/2011, unica fonte anche per l'italiano), link dal menu e dal piè di
  pagina nella stessa lingua, selettore lingua che resta sugli allergeni, hreflang. "Traduci menu" traduce per ogni voce solo le lingue
  mancanti (una lingua nuova non rifà le altre); tutte se il testo italiano è cambiato. Una lingua si aggiunge in
  `TRANSLATED_LANGS` (`src/lib/menu-languages.ts`) più i testi fissi in `menu-i18n.ts`, `allergens-i18n.ts` e `META_TEXT`
  (`menu-page.tsx`): il compilatore segnala quelli mancanti. Testi fissi polacchi e portoghesi da far rileggere a un madrelingua. Tolta il 27/10/2026 la nota "N.B. Salsa
  pomodoro San Marzano…" che compariva per tutti i locali.
  **Traduzione automatica al salvataggio** (27/10/2026, migrazione 041 `menu_translation_jobs`, solo service role):
  ogni salvataggio dal pannello chiama già `revalidatePublicMenu`, che per i locali con `menu_languages` non vuoto e menu
  pubblico chiama con `after()` la route interna `/api/menu-translation` (`CRON_SECRET`), dove avviene la traduzione delle
  voci nuove o cambiate (`src/lib/menu-translation-jobs.ts`). **Mai `revalidatePath` dentro `after()` di un'azione
  server**: su Vercel non aggiornava la cache del menu (provato il 27/10/2026, `/en` rimasto in italiano); dentro una
  richiesta normale (route, cron, corpo dell'azione) funziona.
  Attende 30 s dall'ultimo salvataggio (modifiche ravvicinate e import AI = una sola traduzione), prende un lucchetto per
  locale (`locked_until`, scade dopo 6 min) e poi aggiorna il menu pubblico. Ogni giro ha un tempo massimo (120 s, 180 s
  da /admin): un menu molto grande si completa in più giri. Rete di sicurezza: cron orario `/api/cron/menu-translations`
  (`vercel.json`, `CRON_SECRET`) che traduce le voci rimaste indietro, senza chiamate AI se è tutto aggiornato.
  La traduzione automatica **non attiva mai le lingue**: un locale nuovo si attiva solo con "Traduci menu" in `/admin`
  (che usa lo stesso lucchetto e risponde "già in corso" se serve). I salvataggi fuori dal pannello (SQL, script) li
  recupera il cron. Una voce scartata ogni volta dal controllo di plausibilità viene ritentata a ogni cron.
  **Correzioni del ristoratore** (29/10/2026): pagina `/dashboard/translations` (voce "Traduzioni" nel menu del pannello,
  solo con `menu_languages` non vuoto), una linguetta per lingua con categorie e piatti, italiano accanto alla traduzione.
  Una lingua corretta finisce in `translations.manual` (`src/lib/translation-edits.ts`) e la traduzione automatica non
  la rifà; se cambia il testo italiano decade come le altre. "Torna alla traduzione automatica" la toglie e la fa
  rifare. Sottotitolo e descrizione del locale non sono ancora correggibili da lì.
  **Cinese (semplificato) e arabo** (27/10/2026): `zh` e `ar` in `TRANSLATED_LANGS`, ma **le lingue sono scelte per
  locale**: in `/admin` "Traduci menu" ha una casella per lingua (di default le sei europee, `DEFAULT_TRANSLATED_LANGS`;
  per un locale già tradotto quelle attive) e imposta `menu_languages` esattamente sulle lingue scelte (togliere una
  casella disattiva la lingua, le traduzioni restano salvate). Traduzione automatica e cron traducono **solo le lingue
  attive del locale**. Controllo di plausibilità con soglia per lingua (`LENGTH_RATIO` in `translate-menu.ts`: il
  cinese è molto più corto). Nel prompt: caratteri semplificati, arabo standard senza harakat, nomi italiani in
  caratteri latini, cifre 0-9, nomi di fantasia identici in caratteri latini (mai tradotti né traslitterati:
  il cliente deve leggere al cameriere lo stesso nome del menu italiano; regola aggiunta il 27/10/2026). Indirizzo `/{slug}/zh` ma `lang`/hreflang `zh-Hans` (`menuLangTag`); l'arabo ha
  `dir="rtl"` su `ThemeWrapper` (`menuLangDir`, `RTL_LANGS`): nei componenti del menu usare classi logiche
  (`start-*`, `end-*`, `ms-*`, `me-*`) invece di `left`/`right`, prezzi con `dir="ltr"`. Font: **nessun font
  scaricato**, solo font di sistema dopo quello del tema (`SCRIPT_FONTS` in `ThemeWrapper.tsx`); in arabo
  `letter-spacing` azzerato. Telefono zh-CN/zh-TW/zh-HK → `zh`, ar-* → `ar` (se attive, altrimenti inglese).
  Il Reg. UE 1169/2011 non ha testo ufficiale in cinese e arabo: allergeni e note legali tradotti a mano con
  l'avviso "in caso di dubbio vale l'italiano" (`translationNote` in `allergens-i18n.ts`). **Testi fissi cinesi e
  arabi da far rileggere a un madrelingua prima di attivare queste lingue su un locale.** Prova visiva fatta su
  telefono simulato; resta da provare su un telefono vero. **Deciso il 27/10/2026: niente voce "Altre lingue" con
  Google Translate nel selettore nativo** (darebbe l'idea di traduzioni fatte a metà): una lingua che serve si aggiunge
  come lingua nativa.
- Verificare l'installazione dell'app Bistrot su Android e l'icona su iPhone (gestore MagnaRoma).
- **Prenotazione tavoli** (da decidere entro aprile 2027): soluzione interna o servizio esterno.
  Base esistente: modulo prenotazioni in-house (~2.200 righe: `/prenota/[slug]`, `/dashboard/reservations`,
  `src/components/reservations/`, `src/app/actions/reservation-actions.ts`, tabelle `reservation_*` e
  `reservations`, migrazioni 032–035), iniziato a inizio 2026 e mai completato: non è offerto ai locali (le ultime
  prenotazioni nel database sono prove di gennaio 2026 su Villa Pensabene).
  Mancano: disponibilità per fascia senza doppie prenotazioni, notifiche affidabili (push/WhatsApp), conferma,
  promemoria e annullamento via link, chiusure/ferie, widget per i siti dei clienti, privacy, test.
  Primo passo: controllo tecnico del modulo esistente con stima del lavoro.

## Ecosistema GO!Food Italia (altri repo, tutti su Vercel, deploy da `main`)
- Sito della ditta: gofooditalia/gofooditalia (gofood.it). Il suo CLAUDE.md è la memoria principale per
  brand (logotipo Alegreya, logo GO! FOOD in `brand/`), credits, Resend e siti dei clienti.
- Siti clienti con credits "Sito realizzato da" → gofood.it: maropizzeria, osteriacilea, villapensabene,
  sunset-barcarello, mondelloholiday, scjavuru-holiday.
- Email dai moduli: Resend, dominio gofood.it, mittente noreply@gofood.it; `RESEND_API_KEY` come variabile
  condivisa del team Vercel (collegata a mondelloholiday e scjavuru-holiday; gofooditalia ha la sua).
- Pagina LinkedIn linkedin.com/company/gofooditalia e scheda Google "GO!Food Italia" completate.
