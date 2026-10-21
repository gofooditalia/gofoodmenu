---
name: nuovo-ristorante
description: Accompagna l'ingresso di un nuovo ristorante su Go!Food Menù, dalla registrazione al menu
  pubblico funzionante. Usala quando si parla di aggiungere un ristorante, un nuovo cliente, un nuovo
  locale o un nuovo tenant, di attivare o controllare il menu di un locale appena arrivato, di scegliere
  lo slug, di metterne il logo sulla landing o di capire perché il menu di un cliente nuovo non si vede.
---

# Nuovo ristorante su Go!Food Menù

Obiettivo: il locale ha un menu pubblico su `https://gofoodmenu.it/<slug>` completo e corretto,
installabile come app, e il titolare sa cosa resta da fare. Rispondere in italiano.

## Come entra un ristorante (flusso reale del codice)

1. **Registrazione** (`src/app/register/page.tsx`): `supabase.auth.signUp`, poi insert in `tenants`
   con `slug: null`. Il trigger `protect_tenant_subscription_fields` (migrazione 036) forza
   `subscription_tier = 'free'` per i client. Se serve la conferma email, il tenant nasce dopo la conferma.
2. **Onboarding** (`src/app/onboarding/page.tsx`, wizard in `src/components/onboarding/wizard/`), 6 passi:
   1 Impostazioni · 2 Categorie · 3 Piatti · 4 Caratteristiche · 5 Foto · 6 Branding (logo, colori).
   Avanzamento in `tenants.onboarding_step` / `onboarding_completed`; oltre il passo 6 → `/dashboard`.
3. **Pagamento e slug**: dalla dashboard, `src/app/api/stripe/checkout/route.ts` valida lo slug
   (`^[a-z0-9-]+$`) e, se è già preso, aggiunge `-1`, `-2`… Il webhook
   (`src/app/api/stripe/webhook/route.ts`, `checkout.session.completed`) imposta `slug`,
   `subscription_tier = 'premium'`, `subscription_status = 'active'`, salva gli ID Stripe in
   `tenant_billing` e rivalida il menu.
4. **Menu pubblico** (`src/app/[slug]/page.tsx`): se il tier è `free` o lo stato non è `active`
   la pagina dà **404**. È la prima cosa da controllare quando "il menu non si vede".

## Procedura

### 1. Raccogliere i dati
Chiedere al titolare solo ciò che manca: nome del locale, email del gestore, slug desiderato,
logo (file), colori del brand, sedi/orari, se servono prenotazioni o assistente recensioni.

**Slug**: minuscolo, solo lettere, numeri e trattini, corto e riconoscibile (es. `osteria-cilea`,
`bistrot107`). Una volta stampati i QR **non va più cambiato**: i QR puntano a `/<slug>`.
Prima di proporlo, verificare che sia libero (query sotto).

### 2. Registrazione e onboarding
Il ristoratore si iscrive da solo da `/register` con la propria email e completa l'onboarding.
Nessun insert manuale in `tenants`: si salterebbero onboarding, trigger e Stripe.

### 3. Logo e foto
- Ogni foto o logo passa da `prepareImageForUpload` (`src/lib/image-upload.ts`): piatti max 1600 px /
  500 KB in WebP, loghi max 600 px / 200 KB in PNG. I caricamenti da dashboard e onboarding lo fanno già.
- Mai caricare a mano sui bucket `dishes`/`logos` un file non ottimizzato, e mai sovrascrivere un
  percorso esistente: la cache immagini dura 31 giorni, serve sempre un **nome file nuovo**.
- Il logo deve essere leggibile anche piccolo: diventa l'icona dell'app (`/[slug]/app-icon/...`).

### 4. Colori e app (PWA)
`pickAppColor` in `src/lib/tenant-pwa.ts` sceglie per barre e splash il primo colore del tema
abbastanza scuro tra primario, sfondo e testo (luminanza ≤ 0,3); se nessuno lo è usa `#1F1F1F`.
Se i colori del brand sono tutti chiari, avvisare il titolare che l'app avrà barre grigio scuro
e proporre un primario più scuro. Non provare a sistemarlo via CSS o viewport-fit (già scartato).

### 5. Attivazione
Tutti gli abbonamenti passano da Stripe: il ristoratore paga dalla dashboard e il webhook attiva
il menu. Non proporre attivazioni manuali via SQL. Se dopo il pagamento il menu resta in 404,
controllare `subscription_tier`/`subscription_status` e `slug` (query sotto) e i log del webhook
su Vercel (`[STRIPE_WEBHOOK]`).

### 6. QR code
Lo genera il ristoratore dalla dashboard: card "Il tuo QR Menu" (`src/components/dashboard/QRCodeCard.tsx`,
libreria `react-qrcode-logo`). Appare solo dopo il pagamento (senza slug c'è "Attivazione Richiesta",
con il piano free è bloccata).
- Il link è sempre `https://gofoodmenu.it/<slug>` (`SITE_URL` in `src/lib/site.ts`), anche se la
  dashboard è aperta da un'anteprima Vercel.
- Stile fisso: punti arrotondati, correzione d'errore alta (`H`), logo del locale al centro
  (se manca, `/logo-gofood.png`). Colori e dimensioni del logo vengono da
  `tenants.theme_options.qrCode` (default nero su bianco, logo incluso).
- Il pulsante "Scarica QR Code (.png)" salva `<slug>-menu-qr.png` a **280×280 px**: va bene per
  segnatavolo piccoli, per stampe grandi (locandine, vetrine) può risultare sgranato.
- Prima di mandarlo in stampa, provarlo con almeno due telefoni: deve aprire il menu giusto.

### 7. Facoltativi
- **Prenotazioni**: turni in `reservation_shifts` (esempio: migrazione 034 per MagnaRoma).
- **Recensioni Google**: impostazioni in `tenant_review_settings`, pagina `/dashboard/reviews`.
- **Logo sulla landing** (`src/components/landing/ClientLogosMarquee.tsx`): copiare il logo in
  `public/images/clients/<slug>.png` e aggiungere la voce a `CLIENT_LOGOS` con `href: '/<slug>'`.
  Non puntare al bucket `logos` del locale (si svuota quando il ristoratore cambia logo) e non toccare
  il bucket `Go Food`. È una modifica al codice: branch + PR verso `main` + `npx tsc --noEmit -p .`.

## Query di controllo (solo lettura)

Con il connettore Supabase si possono eseguire direttamente; altrimenti darle al titolare.

```sql
-- Lo slug è libero?
select id, restaurant_name from tenants where slug = '<slug>';

-- Stato del locale
select id, restaurant_name, slug, subscription_tier, subscription_status,
       onboarding_step, onboarding_completed, logo_url
from tenants where slug = '<slug>' or restaurant_name ilike '%<nome>%';

-- Contenuto del menu
select (select count(*) from categories c where c.tenant_id = t.id) as categorie,
       (select count(*) from dishes d where d.tenant_id = t.id)     as piatti
from tenants t where t.slug = '<slug>';
```

Prima di usare tabelle o colonne non citate qui, verificarne il nome reale (`list_tables`
o le migrazioni in `supabase/migrations/`).

## Verifica finale (da fare con il titolare)
- [ ] `https://gofoodmenu.it/<slug>` si apre (niente 404) con categorie, piatti, prezzi e foto giuste
- [ ] Allergeni: `/<slug>/allergeni` si apre
- [ ] Logo nitido; `/<slug>/manifest.webmanifest` ha nome e colori del locale
- [ ] Anteprima di condivisione (link inviato su WhatsApp) con nome e colori del locale
- [ ] App installata da telefono: icona corretta, barre leggibili (Android) e icona su iPhone.
      Le PWA vanno provate in produzione, non nelle anteprime Vercel (protette da login)
- [ ] QR scaricato dalla dashboard, provato con due telefoni, stampato a una dimensione adatta

## Alla fine
Riassumere al titolare in poche righe: cosa è attivo, link del menu, cosa resta in sospeso.
Se è emersa una decisione nuova o un problema ricorrente, proporre di aggiornare `CLAUDE.md`
o questa skill.
