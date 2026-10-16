# Go!Food Menù – note per Claude

Piattaforma SaaS multi-tenant di menu digitali QR per ristoranti (gofoodmenu.it).
Next.js 16 (App Router) + Supabase + Stripe + Resend, deploy su Vercel (team "Giorgio's projects").
Il titolare parla italiano: rispondere in italiano.

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
  quota API a 0. Due richieste di accesso respinte automaticamente; inviata domanda all'assistenza Google,
  caso **8-9259000041884**: non ripresentare la richiesta prima della risposta.
- **Pannello admin** `/admin` (PR #29): accesso via `ADMIN_EMAILS`, newsletter tramite segmento Resend
  (`RESEND_NEWSLETTER_SEGMENT_ID`). Niente CRM esterno per ora (solo clienti già iscritti, unico utente).

## Cose aperte (ottobre 2026)
- Unire la PR #29 dopo aver impostato `ADMIN_EMAILS` su Vercel e verificare `/admin` con i dati reali.
- Attendere la risposta di Google al caso 8-9259000041884.
- Verificare l'installazione dell'app Bistrot su Android e l'icona su iPhone (gestore MagnaRoma).
