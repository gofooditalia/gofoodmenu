# Go!Food Menù – note per Claude

Piattaforma SaaS multi-tenant di menu digitali QR per ristoranti (gofoodmenu.it).
Next.js 16 (App Router) + Supabase + Stripe + Resend, deploy su Vercel (team "Giorgio's projects").
Il titolare parla italiano: rispondere in italiano.
**bemyrider** (altro progetto della ditta) si scrive SEMPRE tutto minuscolo, mai "BeMyRider".
La ditta è **GO!Food Italia**: "GO" maiuscolo, senza spazio tra "!" e "Food" (mai "GO! Food" o "Go!Food Italia"). Font del logotipo GO!Food: **Alegreya**.

## Convenzioni di lavoro
- Lavorare su un branch e aprire una pull request verso `main`: l'anteprima Vercel serve per provare
  prima della produzione. Le anteprime sono protette dal login Vercel (le PWA vanno provate in produzione).
- Le migrazioni in `supabase/migrations/` si eseguono a mano nel SQL Editor di Supabase.
- Controllo rapido: `npx tsc --noEmit -p .` (ESLint al momento non parte per un problema di configurazione).
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

## Cose aperte (ottobre 2026)
- Unire la PR #29 dopo aver impostato `ADMIN_EMAILS` su Vercel e verificare `/admin` con i dati reali.
- Sito gofood.it online (repo gofooditalia/gofooditalia); scheda Google "GO!Food Italia" aggiornata il 17/10/2026
  (sito https://gofood.it, categoria Web designer; social YouTube/LinkedIn/Facebook collegati).
  Dopo 60 giorni (metà dicembre 2026) ripresentare la richiesta API da info@gofood.it.
- Pagina LinkedIn linkedin.com/company/gofooditalia completata (Panoramica, servizi, sito, telefono).
- Sito gofood.it: progetti in evidenza, portfolio e modulo contatti (`api/contact.js`, Resend con dominio gofood.it
  verificato, mittente noreply@gofood.it, destinatario info@gofood.it; `RESEND_API_KEY` sul progetto Vercel gofooditalia).
- Verificare l'installazione dell'app Bistrot su Android e l'icona su iPhone (gestore MagnaRoma).
