# Go!Food Menù – note per Claude

Piattaforma SaaS multi-tenant di menu digitali QR per ristoranti (gofoodmenu.it).
Next.js 16 (App Router) + Supabase + Stripe + Resend, deploy su Vercel (team "Giorgio's projects").
Il titolare parla italiano: rispondere in italiano.
**bemyrider** (altro progetto della ditta) si scrive SEMPRE tutto minuscolo, mai "BeMyRider".
La ditta è **GO!Food Italia**: "GO" maiuscolo, senza spazio tra "!" e "Food" (mai "GO! Food" o "Go!Food Italia"). Font del logotipo GO!Food: **Alegreya**.
Email pubblica della ditta: **info@gofood.it** (sui siti sostituisce italiagofood@gmail.com, che resta l'account Google).
**Account di prova** (non sono locali reali): `belleepoquepalermo` (email di Gabriele), `accademia` (piano free) e
`gofood` (italiagofood@gmail.com, usato dal test del Design Studio); `ristorante-marina` non esiste più (22/10/2026).
Anche `oza` (email di Gabriele, registrazione senza slug) è una prova. Elenco nel codice: `TEST_TENANT_SLUGS` e,
per chi non ha slug, `TEST_TENANT_IDS` in `src/lib/admin.ts`, da aggiornare se ne nasce uno nuovo.
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
- Temi modificati direttamente nel database: il menu pubblico è in cache ISR fino a 24 h; salvando dalla
  dashboard (o con un nuovo deploy) si aggiorna subito.
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
  `help@gofoodmenu.it`) ai 7 clienti paganti. Novità già annunciate: menu come app (PWA), risposte alle recensioni Google,
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
- **Trattoria da Piero (Mondello), potenziale cliente** (23/10/2026): il titolare vuole contattarlo; il locale ha un
  forte stile siciliano e apprezzerebbe un menu coerente. Direzione approvata: tema **"barca e limoni"** ricavato dal
  locale (barca bianca/blu cobalto/rossa con la scritta "da Piero Mondello" in corsivo, limoni, zoccolo di maioliche,
  tovaglie azzurre): fondo crema, blu cobalto principale, giallo limone come accento, rosso pochissimo, nome in corsivo,
  **maiolica come fascia** (testata e tra le categorie) e non come sfondo intero (il prototipo ChatGPT tutto piastrelle
  era troppo carico). Bozza fuori dal codice in `design/da-piero/bozza-tema.html` (+ `.png`; prezzi e testi inventati).
  Non adatto a Bistrot 107. Prossimi passi, quando si parte: foto e menu pubblicati da lui (non le foto dei recensori),
  stile pronto nel Design Studio con contrasti verificati e nuovo motivo maiolica (`PatternType`, `TextureOverlay.tsx`),
  layout del menu invariato, demo PRIVATA su account di prova (niente menu pubblico col suo nome prima del sì).
  Argomenti: il suo stile, menu in più lingue (molti turisti), polpo come piatto della casa. Da incastrare con GloriaFood.
- **Concorrenza: dine.mt / CUGO** (ricerca del 24/10/2026). DINE Malta (dal 2015): guida ai ristoranti di Malta e
  Gozo (~590 locali) + menu digitale MENU.mt/MenuGPS. Menu GRATIS per sempre (QR o link, 50+ lingue già tradotte per
  piatto, 14 allergeni UE); ordini dal tavolo con schermo cucina a 20 €/mese + IVA o 1 % per ordine; cartoncini QR/NFC
  da 3,50–5 € l'uno; WaiterButton (bottone di legno NFC per chiamare il cameriere, 5 €; link firmato a ogni tocco,
  attivo solo se uno schermo del personale è aperto; per i lettini manda la posizione del cliente); chiosco Xiosk.
  Le schede si riempiono da sole con Google (foto `gplaces_`, descrizioni AI) e poi si chiede al locale di rivendicarle.
  In Sicilia: **CUGO** (cugo.it), 35 locali a Marina di Ragusa, tutti caricati in automatico (0 recensioni, nessun
  sito dei locali rimanda a CUGO): oggi una vetrina, non clienti. Sito pulito e sobrio, schede curate (giudizio del
  titolare); italiano tradotto male. Argomento contro di loro: il menu porta il marchio DINE/CUGO e mostra i "posti
  simili" (concorrenti); con noi il menu, lo stile e l'app sono del locale. Punto a loro favore: le lingue già pronte.
  **BlueFrog Indian Restaurant** (St Paul's Bay, Malta, 24/10/2026): proposta Go!Food fatta dal titolare di persona;
  il gestore ha preferito dine.mt perché paga una volta (i cartoncini) e non un canone. Ha anche detto che **le foto nei
  piatti non gli piacciono**: le trova da fast food, non da locale con un'esperienza da far vivere. Punto di vista da
  tenere presente. Da qui l'opzione **"Foto dei Piatti: Con foto / Solo testo"** nel Design Studio (24/10/2026):
  `dishPhotos: 'hide'` in `theme_config` (nessuna migrazione), `DishCard` senza riquadro foto e prezzo accanto al nome,
  due colonne su schermo largo, nessuna immagine scaricata. Applicare uno stile pronto NON cambia questa scelta
  (`applyPreset` in `ThemeContext.tsx`). Le foto caricate restano salvate. Default: con foto (nessun locale cambia).
  Idee emerse, non decise: piano annuale pagato in anticipo; "chiama il cameriere" dal menu (utile ai lidi);
  traduzioni salvate per piatto al posto di Google Translate. Sconsigliata la licenza una tantum (costi mensili per locale).
- Richiesta API Google Business Profile: ripresentarla da info@gofood.it dopo 60 giorni dalla verifica
  della scheda "GO!Food Italia" (metà dicembre 2026).
- Verificare l'installazione dell'app Bistrot su Android e l'icona su iPhone (gestore MagnaRoma).
- **Prenotazione tavoli e fine di GloriaFood** (scadenza: fine aprile 2027). GO!Food è partner GloriaFood per la
  Sicilia e GloriaFood chiude: decidere se passare a un nuovo partner (es. UpMenu) o fare una soluzione interna.
  Base esistente: modulo prenotazioni in-house (~2.200 righe: `/prenota/[slug]`, `/dashboard/reservations`,
  `src/components/reservations/`, `src/app/actions/reservation-actions.ts`, tabelle `reservation_*` e
  `reservations`, migrazioni 032–035), attivo solo su Villa Pensabene (5 prenotazioni in tutto al 21/10/2026).
  Mancano: disponibilità per fascia senza doppie prenotazioni, notifiche affidabili (push/WhatsApp), conferma,
  promemoria e annullamento via link, chiusure/ferie, widget per i siti dei clienti, privacy, test.
  Tabella di marcia: inventario dei clienti GloriaFood e delle funzioni usate (solo prenotazioni o anche ordini
  online e pagamenti) entro novembre 2026; decisione entro metà dicembre; sviluppo e pilota in inverno;
  migrazione dei clienti entro febbraio–marzo 2027 (Pasqua 28/3/2027). Parere del 21/10/2026: prenotazioni
  in-house; ordini online e pagamenti da decidere dopo l'inventario (eventuale soluzione mista). Primo passo:
  controllo tecnico del modulo esistente con stima del lavoro.

## Ecosistema GO!Food Italia (altri repo, tutti su Vercel, deploy da `main`)
- Sito della ditta: gofooditalia/gofooditalia (gofood.it). Il suo CLAUDE.md è la memoria principale per
  brand (logotipo Alegreya, logo GO! FOOD in `brand/`), credits, Resend e siti dei clienti.
- Siti clienti con credits "Sito realizzato da" → gofood.it: maropizzeria, osteriacilea, villapensabene,
  sunset-barcarello, mondelloholiday, scjavuru-holiday.
- Email dai moduli: Resend, dominio gofood.it, mittente noreply@gofood.it; `RESEND_API_KEY` come variabile
  condivisa del team Vercel (collegata a mondelloholiday e scjavuru-holiday; gofooditalia ha la sua).
- Pagina LinkedIn linkedin.com/company/gofooditalia e scheda Google "GO!Food Italia" completate.
