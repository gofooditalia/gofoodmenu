---
name: a11y-audit
description: Controllo di accessibilità (WCAG 2.2 livello A e AA) del menu pubblico e delle altre pagine
  di Go!Food Menù su pagine reali, viste da telefono. Usala quando si parla di accessibilità, leggibilità,
  contrasto dei colori, testi poco leggibili, prezzi che non si leggono, lettori di schermo, ipovedenti,
  WCAG, European Accessibility Act, oppure prima di cambiare colori, temi o componenti del menu.
---

# Controllo di accessibilità

Obiettivo: chiunque apra il menu dal QR, anche con vista ridotta, al sole o con un lettore di schermo,
riesce a leggere piatti, prezzi e allergeni e a usare i comandi. Rispondere in italiano.

Adattata da `engineering-team/a11y-audit` di alirezarezvani/claude-skills (MIT). Del pacchetto
originale resta solo `scripts/contrast_checker.py`. Lo scanner statico è stato scartato perché tratta
ogni componente come una pagina intera e segnala quasi solo falsi problemi.

## Perché si controlla la pagina vera e non solo il codice
Ogni locale ha il suo tema: i colori arrivano da `tenant_design_settings.theme_config` e diventano
variabili CSS in `src/components/theme/ThemeWrapper.tsx` (`--tenant-primary`, `--tenant-background`,
`--tenant-text`, `--tenant-price`, `--tenant-price-bg`, `--tenant-accent`…). Lo stesso componente può
essere leggibile su un locale e illeggibile su un altro. Per questo:
- si controllano **più locali reali con temi diversi**, non uno solo (gli account di prova sono elencati in `CLAUDE.md`);
- per ogni problema si distingue se sta **nel codice** (vale per tutti i locali) o **nel tema** di un
  locale (scelta del ristoratore o del titolare).

## 1. Scansione automatica (axe-core)
`scripts/axe-scan.mjs` apre le pagine in Chromium come un telefono (390×844, italiano), scorre fino in
fondo e lancia axe-core con le regole WCAG 2.0/2.1/2.2 A e AA più le buone pratiche.

Servono `playwright` e `axe-core`. Vanno installati in una cartella temporanea (lo scratchpad della
sessione) e **non** aggiunti alle dipendenze del progetto:

```bash
cd <cartella-temporanea> && npm i --no-audit --no-fund playwright@1 axe-core@4
node <repo>/.claude/skills/a11y-audit/scripts/axe-scan.mjs \
  https://gofoodmenu.it/<slug> https://gofoodmenu.it/<slug>/allergeni \
  --json risultati.json --screens screenshot/
```

Lo script va lanciato **dalla cartella dove sono installati i pacchetti**. Nelle sessioni cloud usa da
solo il Chromium in `/opt/pw-browsers/chromium`; in locale quello di Playwright.
Le anteprime Vercel sono protette da login: per provare una modifica non ancora in produzione serve
`npm run dev` in locale, poi lo script su `http://localhost:3000/<slug>`.

Per i problemi di contrasto axe riporta, per ogni elemento, colore del testo, colore di fondo e
rapporto (`node.any[0].data`). Conviene raggrupparli per coppia di colori: 100 avvisi spesso sono
un unico problema ripetuto su ogni piatto.

Guardare sempre anche gli screenshot: confermano a occhio i problemi e mostrano quelli che axe non vede.

## 2. Colori del tema
Per verificare una coppia di colori, o per scegliere un'alternativa:

```bash
python3 -I scripts/contrast_checker.py "#ffffff" "#C5A059"   # rapporto e soglie AA/AAA
python3 -I scripts/contrast_checker.py --suggest "#ffffff"    # sfondi che funzionano con quel testo
```

Soglie WCAG AA: testo normale **4,5:1**; testo grande (≥ 24 px, o ≥ 18,7 px in grassetto) e icone o
bordi dei comandi **3:1**.

## 3. Controlli a mano (axe non li copre)
- Testo ingrandito al 200% dalle impostazioni del telefono: niente testi tagliati o sovrapposti.
- Navigazione da tastiera (computer): si vede sempre dove si trova il focus e si raggiungono tutti i comandi.
- Lettore di schermo (VoiceOver su iPhone, TalkBack su Android): per ogni piatto legge nome, prezzo e allergeni.
- Le informazioni non passano solo dal colore: allergeni e badge (surgelato, fatto in casa) hanno anche testo o icona.
- I comandi toccabili misurano almeno 24×24 px (WCAG 2.2, 2.5.8).

## Gravità e rapporto
| Gravità axe | Nel rapporto | Significato |
|---|---|---|
| critical | Bloccante | Qualcuno non riesce proprio a usare la pagina |
| serious | Grave | Barriera seria (es. prezzo illeggibile) |
| moderate | Media | Disagio, struttura migliorabile |
| minor | Lieve | Rifinitura |

Per ogni problema indicare: pagina, gravità, criterio WCAG, quanti elementi, **dove sta la causa**
(file e riga, oppure il campo del tema del locale), correzione proposta con i nuovi colori e il
rapporto di contrasto verificato.

## Regole per le correzioni
- Nel codice: la correzione deve funzionare con **tutti** i temi, non solo con quello del locale provato.
  Mai colori fissi che ignorano il tema, se non per elementi che il tema non governa (banner cookie, badge).
- Nel tema di un locale: non modificarlo nel database senza il consenso del titolare. Proporre i colori
  corretti da impostare nell'editor del design della dashboard.
- Dopo ogni correzione rilanciare la scansione sulle stesse pagine e confrontare con il risultato precedente.
- Le modifiche al codice seguono le convenzioni del progetto: branch, PR verso `main`, `npx tsc --noEmit -p .`.

## Situazione al 21/10/2026
Prima prova su `/magnaromatrattoria`, poi su 5 locali reali (MagnaRoma, Bistrot 107, Osteria Cilea,
Sunset, Scjavuru) più l'account di prova `ristorante-marina`. Correzioni nella PR #46:
- `src/lib/theme-engine/contrast.ts`: il testo dei badge, quello sul colore principale
  (`--tenant-on-primary`: pulsanti, categorie attive, selettore lingua) e quello del colore secondario
  (sottotitolo, descrizioni categorie) resta quello del tema se si legge, altrimenti diventa scuro o bianco.
- Il Design Studio avvisa quando una coppia di colori scelta dal ristoratore non si legge
  (`ContrastWarnings` in `src/components/theme/VisualEditorPanel.tsx`): i nuovi controlli sui colori
  vanno aggiunti lì.
- Restano, perché sono colori salvati dai locali: prezzo bianco su oro (MagnaRoma, Bistrot 107,
  Osteria Cilea; scelta: sfondo prezzo col colore principale del locale), bianco su fondo trasparente sopra la foto (Sunset, axe non
  lo misura: va guardato negli screenshot). Si cambiano dal Design Studio.
