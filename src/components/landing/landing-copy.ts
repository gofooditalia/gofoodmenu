/**
 * Testi della landing in italiano e inglese (/ e /en).
 * L'inglese è scritto per chi non parla italiano (es. ristoratori a Malta), non tradotto parola per parola.
 * Niente promesse che il prodotto non mantiene: le lingue del menu sono tradotte in automatico.
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
  featuresTitle: string;
  featuresLead: string;
  features: string[];
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
    headerTagline: 'Costruisci il tuo menu',
    navPricing: 'Prezzi',
    navLogin: 'Accedi',
    navStart: 'Inizia Ora',
    switchLabel: 'EN',
    switchAria: 'English version',
    heroBadge: 'La rivoluzione dei menu digitali',
    heroTitle: 'Il tuo menu digitale',
    heroTitleAccent: 'in pochi click',
    heroLead: ["Carica la foto del tuo menu cartaceo e l'", 'Intelligenza Artificiale', ' lo digitalizza in secondi.'],
    heroCta: 'Crea il tuo Menu',
    heroDemo: 'Vedi Demo',
    trustSetup: 'Setup in 5 minuti',
    trustSupport: 'Supporto incluso',
    badgeQrIncluded: 'Incluso',
    badgeLanguages: '7 Lingue',
    badgeLanguagesSub: 'IT · EN · +5',
    badgeFilter: 'Filtro',
    badgeFilterSub: 'Senza glutine',
    badgeImportSub: 'Smart',
    clientsTitle: 'Scelto dai migliori ristoranti',
    problemBadge: 'IL PROBLEMA',
    problemTitle: 'Menu cartacei?',
    problemTitleAccent: 'No grazie!',
    problemLead: 'Costosi, lenti da aggiornare e poco igienici. È ora di cambiare.',
    problems: [
      { icon: '💸', title: 'Costi folli', description: 'Centinaia di euro spesi ogni anno in stampe e ristampe', color: 'red' },
      { icon: '🐌', title: 'Lentezza', description: 'Settimane per aggiornare prezzi tra grafica e stampa', color: 'yellow' },
      { icon: '🦠', title: 'Igiene zero', description: 'Menu che si sporcano e si rovinano continuamente', color: 'purple' },
    ],
    howImageAlt: 'Anteprima del menu digitale su smartphone',
    howBadge: 'SEMPLICE E VELOCE',
    howTitle: 'Come creo il mio Menu',
    howTitleAccent: 'con QR Code?',
    howLeadBefore: 'Bastano pochi minuti. ',
    howLeadLink: 'Registrati gratuitamente',
    howLeadAfter: ' e inizia subito:',
    howSteps: [
      { title: 'Registrati e crea il tuo locale', description: 'Inserisci i dati del tuo ristorante e personalizza il tuo profilo.' },
      { title: 'Carica il tuo menu', description: 'Usa la nostra AI per importare il menu da una foto o PDF, oppure crealo manualmente.' },
      { title: 'Organizza le portate', description: 'Crea categorie (Antipasti, Primi...) e ordina i piatti come preferisci.' },
      { title: 'Personalizza i dettagli', description: 'Aggiungi foto, allergeni, etichette e traduzioni in altre lingue.' },
      { title: 'Anteprima e pubblicazione', description: 'Controlla come vedranno il menu i tuoi clienti e rendilo visibile.' },
      { title: 'Scarica il QR Code', description: 'Scarica, stampa ed esponi il QR Code sui tavoli del tuo locale.' },
    ],
    glutenBadge: 'FILTRO SENZA GLUTINE',
    glutenTitle: 'Un tocco, e il cliente celiaco vede cosa può mangiare',
    glutenLead: "Pochissimi menu digitali lo hanno. Nel tuo c'è già: il cliente attiva il filtro e i piatti con glutine si sbiadiscono, mentre quelli adatti a lui restano in primo piano. Senza chiedere al cameriere piatto per piatto.",
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
    featuresTitle: 'Tutto quello che ti serve',
    featuresLead: 'Funzionalità professionali, interfaccia semplicissima',
    features: ['Mobile First', 'Importazione AI', 'Sync Live', 'Multilingua', 'Allergeni EU', 'Brand Custom', 'Piatti e Categorie Illimitate', 'QR Code'],
    pricingBadge: 'PREZZI CHIARI',
    pricingTitle: 'Un solo piano. Tutto incluso.',
    pricingLead: 'Crei e personalizzi il tuo menu gratis. Paghi solo quando decidi di pubblicarlo.',
    pricingSteps: [
      { step: '1', title: 'Registrati gratis', text: 'Nessuna carta di credito per iniziare.' },
      { step: '2', title: 'Costruisci il menu', text: 'Importa con l’AI da foto o PDF, aggiungi foto, allergeni e traduzioni.' },
      { step: '3', title: 'Pubblica quando sei pronto', text: 'Attivi l’abbonamento e il tuo menu va online con il suo QR.' },
    ],
    planBadge: 'TUTTO INCLUSO',
    planPrice: '€19,90',
    planPeriod: '/mese',
    planVat: 'Prezzo finale, nessuna IVA da aggiungere.',
    planNoCommitment: 'Nessun vincolo. Disdici quando vuoi.',
    planFeatures: [
      'Piatti e categorie illimitati',
      'Import AI da foto o PDF',
      'Menu in 7 lingue',
      'Allergeni EU e filtro',
      'Grafica con il tuo brand',
      'QR code pronto da stampare',
      'Modifiche live in un secondo',
      'Supporto incluso',
    ],
    planCta: 'Crea il tuo menu gratis',
    planNote: 'Paghi solo quando pubblichi. Pagamento sicuro con Stripe.',
    ctaTitle: 'Pronto a decollare? 🚀',
    ctaLead: 'Unisciti ai ristoratori che hanno già detto addio ai menu cartacei',
    ctaButton: 'Inizia Ora',
    ctaChecks: '✓ Tutti i vantaggi inclusi · ✓ Setup in 5 minuti · ✓ Cancella quando vuoi',
    footerTagline: 'La piattaforma più semplice per creare menu digitali professionali.',
    footerSupport: 'Supporto',
    footerResources: 'Risorse',
    footerTerms: 'Termini e Condizioni',
    footerRights: 'Tutti i diritti riservati.',
    footerCompany: 'P.IVA 06955440828 - Via Mariano Stabile 160, Palermo',
    footerProductOf: 'Un prodotto di',
  },
  en: {
    headerTagline: 'Build your menu',
    navPricing: 'Pricing',
    navLogin: 'Log in',
    navStart: 'Get started',
    switchLabel: 'IT',
    switchAria: 'Versione italiana',
    heroBadge: 'Digital menus for restaurants',
    heroTitle: 'Your digital menu',
    heroTitleAccent: 'in a few clicks',
    heroLead: ['Upload a photo of your printed menu and ', 'AI', ' turns it into a digital menu in seconds.'],
    heroCta: 'Create your menu',
    heroDemo: 'See a live menu',
    trustSetup: 'Set up in 5 minutes',
    trustSupport: 'Support included',
    badgeQrIncluded: 'Included',
    badgeLanguages: '7 languages',
    badgeLanguagesSub: 'Auto-translated',
    badgeFilter: 'Gluten-free',
    badgeFilterSub: 'filter',
    badgeImportSub: 'from a photo',
    clientsTitle: 'Already on the tables of these restaurants',
    problemBadge: 'THE PROBLEM',
    problemTitle: 'Printed menus?',
    problemTitleAccent: 'No thanks!',
    problemLead: 'Expensive, slow to update and hard to keep clean. Time for a change.',
    problems: [
      { icon: '💸', title: 'Printing costs', description: 'Hundreds of euros a year on printing and reprinting', color: 'red' },
      { icon: '🐌', title: 'Slow updates', description: 'Weeks to change a price between the designer and the printer', color: 'yellow' },
      { icon: '🦠', title: 'Hygiene', description: 'Menus that get dirty and worn out all the time', color: 'purple' },
    ],
    howImageAlt: 'Preview of the digital menu on a smartphone',
    howBadge: 'QUICK AND EASY',
    howTitle: 'How do I create my menu',
    howTitleAccent: 'with a QR code?',
    howLeadBefore: 'It takes a few minutes. ',
    howLeadLink: 'Sign up for free',
    howLeadAfter: ' and get started:',
    howSteps: [
      { title: 'Sign up and add your restaurant', description: 'Enter your restaurant details and set up your profile.' },
      { title: 'Upload your menu', description: 'Let our AI import it from a photo or PDF, or build it by hand.' },
      { title: 'Organise your courses', description: 'Create categories (starters, mains...) and sort the dishes the way you like.' },
      { title: 'Add the details', description: 'Add photos, allergens and labels to each dish.' },
      { title: 'Preview and publish', description: 'Check how your guests will see the menu, then make it live.' },
      { title: 'Download the QR code', description: 'Download it, print it and place it on your tables.' },
    ],
    glutenBadge: 'GLUTEN-FREE FILTER',
    glutenTitle: 'One tap, and guests with coeliac disease see what they can eat',
    glutenLead: 'Very few digital menus have it. Yours does: the guest turns on the filter, dishes with gluten fade out and the safe ones stay in front. No need to ask the waiter about every dish.',
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
    featuresTitle: 'Everything you need',
    featuresLead: 'Professional features, a very simple dashboard',
    features: ['Mobile first', 'AI import', 'Live updates', 'Multilingual', 'EU allergens', 'Your branding', 'Unlimited dishes and categories', 'QR code'],
    pricingBadge: 'CLEAR PRICING',
    pricingTitle: 'One plan. Everything included.',
    pricingLead: 'Build and design your menu for free. You only pay when you decide to publish it.',
    pricingSteps: [
      { step: '1', title: 'Sign up for free', text: 'No credit card needed to start.' },
      { step: '2', title: 'Build the menu', text: 'Import it with AI from a photo or PDF, then add photos and allergens.' },
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
      'EU allergens and filter',
      'Design with your branding',
      'Print-ready QR code',
      'Live changes in a second',
      'Support included',
    ],
    planCta: 'Create your menu for free',
    planNote: 'You only pay when you publish. Secure payment with Stripe.',
    dashboardNote: 'The restaurant dashboard is in Italian for now. Write to us and we will set it up with you.',
    ctaTitle: 'Ready to start? 🚀',
    ctaLead: 'Join the restaurants that have already said goodbye to printed menus',
    ctaButton: 'Get started',
    ctaChecks: '✓ Everything included · ✓ Set up in 5 minutes · ✓ Cancel any time',
    footerTagline: 'Digital menus for restaurants, made in Palermo.',
    footerSupport: 'Support',
    footerResources: 'Resources',
    footerTerms: 'Terms and Conditions (Italian)',
    footerRights: 'All rights reserved.',
    footerCompany: 'VAT no. IT06955440828 - Via Mariano Stabile 160, Palermo, Italy',
    footerProductOf: 'A product of',
  },
};
