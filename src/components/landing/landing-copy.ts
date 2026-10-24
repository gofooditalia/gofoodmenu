/**
 * Testi della landing in italiano e inglese (/ e /en).
 * L'inglese è scritto per chi non parla italiano (es. ristoratori a Malta), non tradotto parola per parola.
 * Costruiti sull'identità decisa il 24/10/2026 (vedi CLAUDE.md): SaaS che il ristoratore usa da solo,
 * con l'assistenza di una persona; pubblico italiano, /en per l'estero.
 * Niente superlativi né promesse che il prodotto non mantiene: le lingue del menu sono tradotte in automatico.
 */

export type LandingLang = 'it' | 'en';

type Step = { title: string; description: string };
type Item = { icon: string; title: string; text: string };

export interface LandingCopy {
  headerTagline: string;
  navPricing: string;
  navLogin: string;
  navStart: string;
  switchLabel: string;
  switchAria: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroLead: [string, string, string];
  heroCta: string;
  heroDemo: string;
  trustSetup: string;
  trustSupport: string;
  badgeQrIncluded: string;
  badgeLanguages: string;
  badgeLanguagesSub: string;
  badgeFilter: string;
  badgeFilterSub: string;
  badgeImportSub: string;
  clientsTitle: string;
  problemBadge: string;
  problemTitle: string;
  problemTitleAccent: string;
  problemLead: string;
  problems: { icon: string; title: string; description: string; color: 'red' | 'yellow' | 'purple' }[];
  howImageAlt: string;
  howBadge: string;
  howTitle: string;
  howTitleAccent: string;
  howLeadBefore: string;
  howLeadLink: string;
  howLeadAfter: string;
  howSteps: Step[];
  glutenBadge: string;
  glutenTitle: string;
  glutenLead: string;
  glutenItems: Item[];
  glutenCaseName: string;
  glutenCaseText: string;
  glutenCta: string;
  glutenNote: string;
  glutenImageAlt: string;
  glutenActive: string;
  pillarsTitle: string;
  pillars: Item[];
  pricingBadge: string;
  pricingTitle: string;
  pricingLead: string;
  pricingSteps: { step: string; title: string; text: string }[];
  planBadge: string;
  planPrice: string;
  planPeriod: string;
  planVat: string;
  planNoCommitment: string;
  planFeatures: string[];
  planCta: string;
  planNote: string;
  dashboardNote?: string;
  ctaTitle: string;
  ctaLead: string;
  ctaButton: string;
  ctaChecks: string;
  footerTagline: string;
  footerSupport: string;
  footerResources: string;
  footerTerms: string;
  footerRights: string;
  footerCompany: string;
  footerProductOf: string;
}

export const LANDING_COPY: Record<LandingLang, LandingCopy> = {
  it: {
    headerTagline: 'Il menu digitale del tuo locale',
    navPricing: 'Prezzi',
    navLogin: 'Accedi',
    navStart: 'Crea il tuo menu',
    switchLabel: 'EN',
    switchAria: 'English version',
    heroBadge: 'Menu digitali per ristoranti',
    heroTitle: 'Il tuo menu digitale.',
    heroTitleAccent: 'Lo fai tu, in pochi minuti.',
    heroLead: [
      'Fotografa il menu che hai già: ',
      "l'AI",
      ' lo trasforma in un menu digitale. Poi lo cambi quando vuoi dal telefono, con gli allergeni in regola e lo stile del tuo locale.',
    ],
    heroCta: 'Crea il tuo menu gratis',
    heroDemo: 'Guarda un menu vero',
    trustSetup: 'Pronto in pochi minuti',
    trustSupport: 'Ti risponde una persona',
    badgeQrIncluded: 'Incluso',
    badgeLanguages: '7 lingue',
    badgeLanguagesSub: 'Tradotte in automatico',
    badgeFilter: 'Filtro',
    badgeFilterSub: 'Senza glutine',
    badgeImportSub: 'da una foto',
    clientsTitle: 'Già sui tavoli di questi locali',
    problemBadge: 'IL MENU DI CARTA',
    problemTitle: 'Ogni prezzo cambiato',
    problemTitleAccent: 'è una ristampa',
    problemLead: 'Il menu di carta costa, invecchia presto e non parla le lingue dei tuoi clienti.',
    problems: [
      { icon: '🖨️', title: 'Ristampe continue', description: 'Basta un piatto nuovo o un prezzo diverso per rifare tutto.', color: 'red' },
      { icon: '🥜', title: 'Allergeni a voce', description: 'Il cliente chiede, il cameriere va in cucina a informarsi, il servizio si ferma.', color: 'yellow' },
      { icon: '🌍', title: 'Turisti in difficoltà', description: 'Un menu solo in italiano lo capisce metà della sala.', color: 'purple' },
    ],
    howImageAlt: 'Anteprima del menu digitale su smartphone',
    howBadge: 'SEMPLICE E VELOCE',
    howTitle: 'Come creo il mio menu',
    howTitleAccent: 'con il QR?',
    howLeadBefore: 'Fai tutto da solo, in pochi minuti. ',
    howLeadLink: 'Registrati gratis',
    howLeadAfter: ' e inizia:',
    howSteps: [
      { title: 'Registrati e crea il tuo locale', description: 'Nome, logo e indirizzo. Nessuna carta di credito.' },
      { title: 'Carica il menu', description: "Una foto o un PDF del menu che hai già: l'AI legge piatti e prezzi. Oppure lo scrivi a mano." },
      { title: 'Controlla e completa', description: 'Sistemi categorie e piatti, aggiungi allergeni e, se vuoi, le foto.' },
      { title: 'Dagli il tuo stile', description: 'Colori, caratteri, con o senza foto dei piatti.' },
      { title: 'Pubblica e stampa il QR', description: "Attivi l'abbonamento, scarichi il QR in alta qualità e lo metti sui tavoli." },
    ],
    glutenBadge: 'ALLERGENI IN REGOLA',
    glutenTitle: 'Un tocco, e il cliente celiaco vede cosa può mangiare',
    glutenLead: 'I 14 allergeni previsti dalla legge (Reg. UE 1169/2011) stanno su una pagina sempre aggiornata. E con il filtro senza glutine i piatti con glutine si sbiadiscono, quelli adatti restano in primo piano. Senza chiedere al cameriere piatto per piatto.',
    glutenItems: [
      { icon: '👆', title: 'Un pulsante, sempre visibile', text: 'In alto nel menu, su ogni pagina, in tutte le lingue.' },
      { icon: '✨', title: "L'AI ti aiuta a classificare i piatti", text: 'Propone quali piatti contengono glutine: tu controlli e confermi.' },
      { icon: '🔄', title: 'Sempre allineato alla cucina', text: 'Cambi una ricetta e il filtro si aggiorna in tempo reale.' },
    ],
    glutenCaseName: 'Bistrot 107',
    glutenCaseText: ', locale di Palermo certificato AIC, usa il filtro di Go!Food Menù per guidare i clienti con intolleranza al glutine.',
    glutenCta: 'Provalo sul menu di Bistrot 107',
    glutenNote: 'Il filtro si basa sulle informazioni sugli allergeni inserite e verificate dal ristoratore.',
    glutenImageAlt: 'Menu di Bistrot 107 con il filtro senza glutine attivo: i piatti con glutine sono sbiaditi e segnalati',
    glutenActive: 'Filtro attivo',
    pillarsTitle: 'Quattro motivi per sceglierlo',
    pillars: [
      { icon: '✋', title: 'Lo fai tu', text: "Import con l'AI, pannello semplice, modifiche online in un secondo. Non devi chiamare nessuno per cambiare un prezzo." },
      { icon: '🛡️', title: 'Allergeni seri', text: 'Pagina allergeni sempre aggiornata e filtro senza glutine, già usato da un locale certificato AIC.' },
      { icon: '🎨', title: 'Il menu è tuo', text: 'Il tuo logo, i tuoi colori, con o senza foto. I clienti possono salvarlo come app sul telefono. Nessuna pubblicità e nessun altro locale nella pagina.' },
      { icon: '💬', title: 'Ti risponde una persona', text: 'Siamo a Palermo. Se ti blocchi, scrivi e ti risponde qualcuno che conosce il prodotto, non un robot.' },
    ],
    pricingBadge: 'PREZZI CHIARI',
    pricingTitle: 'Un solo piano. Tutto incluso.',
    pricingLead: 'Crei e provi il tuo menu gratis. Paghi solo quando decidi di pubblicarlo.',
    pricingSteps: [
      { step: '1', title: 'Registrati gratis', text: 'Nessuna carta di credito per iniziare.' },
      { step: '2', title: 'Costruisci il menu', text: 'Importa con l’AI da foto o PDF, aggiungi allergeni e, se vuoi, le foto.' },
      { step: '3', title: 'Pubblica quando sei pronto', text: 'Attivi l’abbonamento e il tuo menu va online con il suo QR.' },
    ],
    planBadge: 'TUTTO INCLUSO',
    planPrice: '€19,90',
    planPeriod: '/mese',
    planVat: 'Prezzo finale, nessuna IVA da aggiungere.',
    planNoCommitment: 'Nessun vincolo. Disdici quando vuoi.',
    planFeatures: [
      'Piatti e categorie illimitati',
      "Import con l'AI da foto o PDF",
      '7 lingue, tradotte in automatico',
      'Allergeni e filtro senza glutine',
      'Il tuo stile, con o senza foto',
      'QR in alta qualità da stampare',
      'Aiuto per rispondere alle recensioni Google',
      'Assistenza da una persona',
    ],
    planCta: 'Crea il tuo menu gratis',
    planNote: 'Paghi solo quando pubblichi. Pagamento sicuro con Stripe.',
    ctaTitle: 'Il tuo menu online in giornata',
    ctaLead: 'Registrati gratis, carica una foto del menu e guarda il risultato. Paghi solo se ti piace.',
    ctaButton: 'Crea il tuo menu gratis',
    ctaChecks: '✓ Nessuna carta per iniziare · ✓ Disdici quando vuoi · ✓ Ti risponde una persona',
    footerTagline: 'Menu digitali per ristoranti, da Palermo.',
    footerSupport: 'Supporto',
    footerResources: 'Risorse',
    footerTerms: 'Termini e Condizioni',
    footerRights: 'Tutti i diritti riservati.',
    footerCompany: 'P.IVA 06955440828 - Via Mariano Stabile 160, Palermo',
    footerProductOf: 'Un prodotto di',
  },
  en: {
    headerTagline: "Your restaurant's digital menu",
    navPricing: 'Pricing',
    navLogin: 'Log in',
    navStart: 'Create your menu',
    switchLabel: 'IT',
    switchAria: 'Versione italiana',
    heroBadge: 'Digital menus for restaurants',
    heroTitle: 'Your digital menu.',
    heroTitleAccent: 'Made by you, in minutes.',
    heroLead: [
      'Take a photo of the menu you already have: ',
      'AI',
      " turns it into a digital menu. Then change it whenever you like from your phone, with allergens in order and your restaurant's own style.",
    ],
    heroCta: 'Create your menu for free',
    heroDemo: 'See a real menu',
    trustSetup: 'Ready in minutes',
    trustSupport: 'A real person answers',
    badgeQrIncluded: 'Included',
    badgeLanguages: '7 languages',
    badgeLanguagesSub: 'Auto-translated',
    badgeFilter: 'Gluten-free',
    badgeFilterSub: 'filter',
    badgeImportSub: 'from a photo',
    clientsTitle: 'Already on the tables of these restaurants',
    problemBadge: 'THE PAPER MENU',
    problemTitle: 'Every price change',
    problemTitleAccent: 'means a reprint',
    problemLead: "A paper menu costs money, wears out fast and doesn't speak your guests' languages.",
    problems: [
      { icon: '🖨️', title: 'Endless reprints', description: 'One new dish or one new price and you start over.', color: 'red' },
      { icon: '🥜', title: 'Allergens by word of mouth', description: 'The guest asks, the waiter goes to the kitchen to check, service stops.', color: 'yellow' },
      { icon: '🌍', title: 'Lost tourists', description: 'A menu in one language is understood by half the room.', color: 'purple' },
    ],
    howImageAlt: 'Preview of the digital menu on a smartphone',
    howBadge: 'QUICK AND EASY',
    howTitle: 'How do I create my menu',
    howTitleAccent: 'with a QR code?',
    howLeadBefore: 'You do it all yourself, in minutes. ',
    howLeadLink: 'Sign up for free',
    howLeadAfter: ' and start:',
    howSteps: [
      { title: 'Sign up and add your restaurant', description: 'Name, logo and address. No credit card.' },
      { title: 'Upload your menu', description: 'A photo or PDF of the menu you already have: AI reads dishes and prices. Or type it in yourself.' },
      { title: 'Check and complete', description: 'Sort categories and dishes, add allergens and, if you like, photos.' },
      { title: 'Give it your style', description: 'Colours, fonts, with or without dish photos.' },
      { title: 'Publish and print the QR code', description: 'Start the subscription, download the high-quality QR code and put it on your tables.' },
    ],
    glutenBadge: 'ALLERGENS DONE RIGHT',
    glutenTitle: 'One tap, and guests with coeliac disease see what they can eat',
    glutenLead: 'The 14 allergens required by law (EU Regulation 1169/2011) are listed on an always up-to-date page. And with the gluten-free filter, dishes with gluten fade out and the safe ones stay in front. No need to ask the waiter about every dish.',
    glutenItems: [
      { icon: '👆', title: 'One button, always visible', text: 'At the top of the menu, on every page, in every language.' },
      { icon: '✨', title: 'AI helps you sort the dishes', text: 'It suggests which dishes contain gluten: you check and confirm.' },
      { icon: '🔄', title: 'Always in step with the kitchen', text: 'Change a recipe and the filter updates straight away.' },
    ],
    glutenCaseName: 'Bistrot 107',
    glutenCaseText: ', a restaurant in Palermo certified by the Italian Coeliac Association (AIC), uses the Go!Food Menù filter to guide guests who are gluten intolerant.',
    glutenCta: 'Try it on the Bistrot 107 menu',
    glutenNote: 'The filter relies on the allergen information entered and checked by the restaurant.',
    glutenImageAlt: 'Bistrot 107 menu with the gluten-free filter on: dishes with gluten are faded and marked',
    glutenActive: 'Filter on',
    pillarsTitle: 'Four reasons to choose it',
    pillars: [
      { icon: '✋', title: 'You do it yourself', text: 'AI import, a simple dashboard, changes live in a second. No need to call anyone to change a price.' },
      { icon: '🛡️', title: 'Allergens done properly', text: 'An always up-to-date allergen page and a gluten-free filter, already used by an AIC-certified restaurant.' },
      { icon: '🎨', title: 'The menu is yours', text: 'Your logo, your colours, with or without photos. Guests can save it as an app on their phone. No ads and no other restaurants on the page.' },
      { icon: '💬', title: 'A real person answers', text: 'We are in Palermo. If you get stuck, write to us and someone who knows the product replies, not a bot.' },
    ],
    pricingBadge: 'CLEAR PRICING',
    pricingTitle: 'One plan. Everything included.',
    pricingLead: 'Build and try your menu for free. You only pay when you decide to publish it.',
    pricingSteps: [
      { step: '1', title: 'Sign up for free', text: 'No credit card needed to start.' },
      { step: '2', title: 'Build the menu', text: 'Import it with AI from a photo or PDF, add allergens and, if you like, photos.' },
      { step: '3', title: 'Publish when you are ready', text: 'Start the subscription and your menu goes live with its QR code.' },
    ],
    planBadge: 'ALL INCLUDED',
    planPrice: '€19.90',
    planPeriod: '/month',
    planVat: 'Final price, no VAT added.',
    planNoCommitment: 'No contract. Cancel any time.',
    planFeatures: [
      'Unlimited dishes and categories',
      'AI import from photo or PDF',
      '7 languages, auto-translated',
      'Allergens and gluten-free filter',
      'Your style, with or without photos',
      'High-quality QR code to print',
      'Help replying to Google reviews',
      'Support from a real person',
    ],
    planCta: 'Create your menu for free',
    planNote: 'You only pay when you publish. Secure payment with Stripe.',
    dashboardNote: 'The restaurant dashboard is in Italian for now. Write to us and we will set it up with you.',
    ctaTitle: 'Your menu online today',
    ctaLead: 'Sign up for free, upload a photo of your menu and see the result. You only pay if you like it.',
    ctaButton: 'Create your menu for free',
    ctaChecks: '✓ No card to start · ✓ Cancel any time · ✓ A real person answers',
    footerTagline: 'Digital menus for restaurants, from Palermo, Italy.',
    footerSupport: 'Support',
    footerResources: 'Resources',
    footerTerms: 'Terms and Conditions (Italian)',
    footerRights: 'All rights reserved.',
    footerCompany: 'VAT no. IT06955440828 - Via Mariano Stabile 160, Palermo, Italy',
    footerProductOf: 'A product of',
  },
};
