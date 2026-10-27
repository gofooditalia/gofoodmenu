/**
 * Testi fissi della pagina allergeni (/{slug}/allergeni e /{slug}/{lingua}/allergeni) nelle lingue di MenuLang:
 * i 14 allergeni dell'Allegato II del Reg. UE 1169/2011 e le note legali. Scritti a mano sulla base dei testi
 * ufficiali del regolamento in ogni lingua e mai generati dall'AI (sono un obbligo di legge: niente errori).
 * Gli id coincidono con allergen_ids dei piatti; i nomi brevi sui piatti stanno in src/lib/menu-i18n.ts.
 */

import type { MenuLang } from '@/lib/menu-languages';

type Localized = Record<MenuLang, string>;

export interface AllergenEntry {
    id: string;
    number: number;
    icon: string;
    name: Localized;
    description: Localized;
}

export const ALLERGEN_LIST: AllergenEntry[] = [
    {
        id: 'glutine', number: 1, icon: '🌾',
        name: {
            it: 'Cereali contenenti glutine',
            en: 'Cereals containing gluten',
            fr: 'Céréales contenant du gluten',
            de: 'Glutenhaltiges Getreide',
            es: 'Cereales que contienen gluten',
        },
        description: {
            it: 'Grano, segale, orzo, avena, farro, kamut o loro ceppi ibridati, e prodotti derivati',
            en: 'Wheat, rye, barley, oats, spelt, kamut or their hybridised strains, and products thereof',
            fr: 'Blé, seigle, orge, avoine, épeautre, kamut ou leurs souches hybridées, et produits dérivés',
            de: 'Weizen, Roggen, Gerste, Hafer, Dinkel, Kamut oder Hybridstämme davon sowie daraus gewonnene Erzeugnisse',
            es: 'Trigo, centeno, cebada, avena, espelta, kamut o sus variedades híbridas, y productos derivados',
        },
    },
    {
        id: 'crostacei', number: 2, icon: '🦐',
        name: {
            it: 'Crostacei e prodotti a base di crostacei',
            en: 'Crustaceans and products thereof',
            fr: 'Crustacés et produits à base de crustacés',
            de: 'Krebstiere und daraus gewonnene Erzeugnisse',
            es: 'Crustáceos y productos a base de crustáceos',
        },
        description: {
            it: 'Gamberi, scampi, aragoste, granchi e prodotti derivati',
            en: 'Prawns, scampi, lobsters, crabs and products thereof',
            fr: 'Crevettes, langoustines, homards, crabes et produits dérivés',
            de: 'Garnelen, Scampi, Hummer, Krabben und daraus gewonnene Erzeugnisse',
            es: 'Gambas, cigalas, langostas, cangrejos y productos derivados',
        },
    },
    {
        id: 'uova', number: 3, icon: '🥚',
        name: {
            it: 'Uova e prodotti a base di uova',
            en: 'Eggs and products thereof',
            fr: 'Œufs et produits à base d’œufs',
            de: 'Eier und daraus gewonnene Erzeugnisse',
            es: 'Huevos y productos a base de huevo',
        },
        description: {
            it: 'Tutte le preparazioni contenenti uova',
            en: 'All preparations containing eggs',
            fr: 'Toutes les préparations contenant des œufs',
            de: 'Alle Zubereitungen mit Eiern',
            es: 'Todas las preparaciones que contienen huevo',
        },
    },
    {
        id: 'pesce', number: 4, icon: '🐟',
        name: {
            it: 'Pesce e prodotti a base di pesce',
            en: 'Fish and products thereof',
            fr: 'Poissons et produits à base de poissons',
            de: 'Fische und daraus gewonnene Erzeugnisse',
            es: 'Pescado y productos a base de pescado',
        },
        description: {
            it: 'Tutti i tipi di pesce e preparazioni derivate, eccetto gelatina di pesce',
            en: 'All kinds of fish and fish preparations, except fish gelatine',
            fr: 'Tous les poissons et préparations à base de poisson, sauf la gélatine de poisson',
            de: 'Alle Fischarten und Fischzubereitungen, außer Fischgelatine',
            es: 'Todo tipo de pescado y preparaciones a base de pescado, excepto la gelatina de pescado',
        },
    },
    {
        id: 'arachidi', number: 5, icon: '🥜',
        name: {
            it: 'Arachidi e prodotti a base di arachidi',
            en: 'Peanuts and products thereof',
            fr: 'Arachides et produits à base d’arachides',
            de: 'Erdnüsse und daraus gewonnene Erzeugnisse',
            es: 'Cacahuetes y productos a base de cacahuetes',
        },
        description: {
            it: 'Noccioline americane e tutti i prodotti derivati',
            en: 'Peanuts and all products thereof',
            fr: 'Cacahuètes et tous les produits dérivés',
            de: 'Erdnüsse und alle daraus gewonnenen Erzeugnisse',
            es: 'Cacahuetes y todos sus productos derivados',
        },
    },
    {
        id: 'soia', number: 6, icon: '🫘',
        name: {
            it: 'Soia e prodotti a base di soia',
            en: 'Soybeans and products thereof',
            fr: 'Soja et produits à base de soja',
            de: 'Sojabohnen und daraus gewonnene Erzeugnisse',
            es: 'Soja y productos a base de soja',
        },
        description: {
            it: 'Fagioli di soia e prodotti derivati, eccetto alcuni oli raffinati',
            en: 'Soybeans and products thereof, except some refined oils',
            fr: 'Fèves de soja et produits dérivés, sauf certaines huiles raffinées',
            de: 'Sojabohnen und daraus gewonnene Erzeugnisse, außer einigen raffinierten Ölen',
            es: 'Habas de soja y productos derivados, excepto algunos aceites refinados',
        },
    },
    {
        id: 'lattosio', number: 7, icon: '🥛',
        name: {
            it: 'Latte e prodotti a base di latte',
            en: 'Milk and products thereof',
            fr: 'Lait et produits à base de lait',
            de: 'Milch und daraus gewonnene Erzeugnisse',
            es: 'Leche y sus derivados',
        },
        description: {
            it: 'Incluso il lattosio, formaggi, burro, yogurt e derivati',
            en: 'Including lactose, cheese, butter, yoghurt and other dairy products',
            fr: 'Y compris le lactose, fromages, beurre, yaourts et produits dérivés',
            de: 'Einschließlich Laktose, Käse, Butter, Joghurt und Milcherzeugnisse',
            es: 'Incluida la lactosa, quesos, mantequilla, yogur y derivados',
        },
    },
    {
        id: 'frutta-secca', number: 8, icon: '🌰',
        name: {
            it: 'Frutta a guscio',
            en: 'Nuts',
            fr: 'Fruits à coque',
            de: 'Schalenfrüchte',
            es: 'Frutos de cáscara',
        },
        description: {
            it: 'Mandorle, nocciole, noci, anacardi, pecan, noci del Brasile, pistacchi, noci macadamia, noci del Queensland e prodotti derivati',
            en: 'Almonds, hazelnuts, walnuts, cashews, pecans, Brazil nuts, pistachios, macadamia or Queensland nuts, and products thereof',
            fr: 'Amandes, noisettes, noix, noix de cajou, noix de pécan, noix du Brésil, pistaches, noix de macadamia ou du Queensland, et produits dérivés',
            de: 'Mandeln, Haselnüsse, Walnüsse, Cashewnüsse, Pekannüsse, Paranüsse, Pistazien, Macadamia- oder Queenslandnüsse sowie daraus gewonnene Erzeugnisse',
            es: 'Almendras, avellanas, nueces, anacardos, pacanas, nueces de Brasil, pistachos, nueces de macadamia o de Queensland, y productos derivados',
        },
    },
    {
        id: 'sedano', number: 9, icon: '🌿',
        name: {
            it: 'Sedano e prodotti a base di sedano',
            en: 'Celery and products thereof',
            fr: 'Céleri et produits à base de céleri',
            de: 'Sellerie und daraus gewonnene Erzeugnisse',
            es: 'Apio y productos derivados',
        },
        description: {
            it: 'Sedano e preparazioni derivate',
            en: 'Celery and preparations made from it',
            fr: 'Céleri et préparations dérivées',
            de: 'Sellerie und daraus hergestellte Zubereitungen',
            es: 'Apio y preparaciones derivadas',
        },
    },
    {
        id: 'senape', number: 10, icon: '🌭',
        name: {
            it: 'Senape e prodotti a base di senape',
            en: 'Mustard and products thereof',
            fr: 'Moutarde et produits à base de moutarde',
            de: 'Senf und daraus gewonnene Erzeugnisse',
            es: 'Mostaza y productos derivados',
        },
        description: {
            it: 'Semi di senape e prodotti derivati',
            en: 'Mustard seeds and products thereof',
            fr: 'Graines de moutarde et produits dérivés',
            de: 'Senfkörner und daraus gewonnene Erzeugnisse',
            es: 'Semillas de mostaza y productos derivados',
        },
    },
    {
        id: 'sesamo', number: 11, icon: '○',
        name: {
            it: 'Semi di sesamo e prodotti a base di semi di sesamo',
            en: 'Sesame seeds and products thereof',
            fr: 'Graines de sésame et produits à base de graines de sésame',
            de: 'Sesamsamen und daraus gewonnene Erzeugnisse',
            es: 'Granos de sésamo y productos a base de granos de sésamo',
        },
        description: {
            it: 'Semi di sesamo e prodotti derivati',
            en: 'Sesame seeds and products thereof',
            fr: 'Graines de sésame et produits dérivés',
            de: 'Sesamsamen und daraus gewonnene Erzeugnisse',
            es: 'Granos de sésamo y productos derivados',
        },
    },
    {
        id: 'solfiti', number: 12, icon: '⚗️',
        name: {
            it: 'Anidride solforosa e solfiti',
            en: 'Sulphur dioxide and sulphites',
            fr: 'Anhydride sulfureux et sulfites',
            de: 'Schwefeldioxid und Sulphite',
            es: 'Dióxido de azufre y sulfitos',
        },
        description: {
            it: 'In concentrazioni superiori a 10 mg/kg o 10 mg/litro in termini di SO₂ totale',
            en: 'At concentrations of more than 10 mg/kg or 10 mg/litre in terms of total SO₂',
            fr: 'À des concentrations de plus de 10 mg/kg ou 10 mg/litre exprimées en SO₂ total',
            de: 'In Konzentrationen von mehr als 10 mg/kg oder 10 mg/l, als insgesamt vorhandenes SO₂ angegeben',
            es: 'En concentraciones superiores a 10 mg/kg o 10 mg/litro en términos de SO₂ total',
        },
    },
    {
        id: 'lupini', number: 13, icon: '🫘',
        name: {
            it: 'Lupini e prodotti a base di lupini',
            en: 'Lupin and products thereof',
            fr: 'Lupin et produits à base de lupin',
            de: 'Lupinen und daraus gewonnene Erzeugnisse',
            es: 'Altramuces y productos a base de altramuces',
        },
        description: {
            it: 'Lupini e prodotti derivati',
            en: 'Lupin and products thereof',
            fr: 'Lupin et produits dérivés',
            de: 'Lupinen und daraus gewonnene Erzeugnisse',
            es: 'Altramuces y productos derivados',
        },
    },
    {
        id: 'molluschi', number: 14, icon: '🦪',
        name: {
            it: 'Molluschi e prodotti a base di molluschi',
            en: 'Molluscs and products thereof',
            fr: 'Mollusques et produits à base de mollusques',
            de: 'Weichtiere und daraus gewonnene Erzeugnisse',
            es: 'Moluscos y productos a base de moluscos',
        },
        description: {
            it: 'Vongole, cozze, ostriche, calamari e prodotti derivati',
            en: 'Clams, mussels, oysters, squid and products thereof',
            fr: 'Palourdes, moules, huîtres, calamars et produits dérivés',
            de: 'Venusmuscheln, Miesmuscheln, Austern, Tintenfische und daraus gewonnene Erzeugnisse',
            es: 'Almejas, mejillones, ostras, calamares y productos derivados',
        },
    },
];

export interface AllergenPageStrings {
    menu: string;
    allergens: string;
    title: string;
    subtitle: string;
    tabList: string;
    tabLegal: string;
    listTitle: string;
    listSubtitle: string;
    questionsTitle: string;
    questionsText: string;
    digitalMenu: string;
    legalTitle: string;
    legalText: string;
    regulationTitle: string;
    frozenAtSource: string;
    blastChilled: string;
    contactText: string;
    coverCharge: string;
    metaDescription: (name: string) => string;
}

export const ALLERGEN_PAGE: Record<MenuLang, AllergenPageStrings> = {
    it: {
        menu: 'Menu',
        allergens: 'Allergeni',
        title: 'Allergeni e Intolleranze',
        subtitle: 'La tua sicurezza è la nostra priorità. Consulta l\'elenco completo degli allergeni presenti nei nostri piatti.',
        tabList: '📋 Lista Allergeni',
        tabLegal: '📄 Info Legali',
        listTitle: '14 Allergeni Principali',
        listSubtitle: 'Secondo il Regolamento (UE) N. 1169/2011',
        questionsTitle: 'Hai domande?',
        questionsText: 'Il nostro personale è a tua disposizione per fornirti informazioni dettagliate sugli ingredienti di ogni piatto e per aiutarti a scegliere in base alle tue esigenze alimentari.',
        digitalMenu: 'Menu Digitale',
        legalTitle: 'ELENCO ALLERGENI',
        legalText: 'Comunichiamo l\'elenco degli allergeni utilizzati in questo esercizio per i quali sussiste l\'obbligo di indicazione, per una corretta informazione verso i nostri preziosissimi Clienti',
        regulationTitle: 'REGOLAMENTO (UE) N. 1169/2011',
        frozenAtSource: 'Nel nostro menù, in assenza del reperimento del prodotto fresco, alcuni prodotti sono provenienti da congelamento effettuato all\'origine',
        blastChilled: 'Nel nostro menù, in assenza del reperimento del prodotto fresco, alcuni prodotti sono congelati in loco mediante abbattimento rapido di temperatura',
        contactText: 'Come previsto dall\'Articolo 9 del Regolamento (UE) N. 1169/2011 del Parlamento europeo e del Consiglio del 25 Ottobre 2011, le informazioni sugli ingredienti allergenici sono disponibili rivolgendosi al personale.',
        coverCharge: 'Costo del coperto',
        metaDescription: (name) => `Lista degli allergeni e informazioni legali per ${name}.`,
    },
    en: {
        menu: 'Menu',
        allergens: 'Allergens',
        title: 'Allergens and Intolerances',
        subtitle: 'Your safety is our priority. Check the complete list of allergens present in our dishes.',
        tabList: '📋 Allergen List',
        tabLegal: '📄 Legal Info',
        listTitle: '14 Main Allergens',
        listSubtitle: 'According to Regulation (EU) No 1169/2011',
        questionsTitle: 'Have questions?',
        questionsText: 'Our staff is at your disposal to provide detailed information about the ingredients of each dish and to help you choose according to your dietary needs.',
        digitalMenu: 'Digital Menu',
        legalTitle: 'ALLERGEN LIST',
        legalText: 'Below is the list of allergens used in this establishment that must be declared by law, so that our customers are properly informed.',
        regulationTitle: 'REGULATION (EU) No 1169/2011',
        frozenAtSource: 'When fresh produce is not available, some products on our menu are frozen at source.',
        blastChilled: 'When fresh produce is not available, some products on our menu are frozen on the premises by blast chilling.',
        contactText: 'As required by Article 9 of Regulation (EU) No 1169/2011 of the European Parliament and of the Council of 25 October 2011, information on allergenic ingredients is available from our staff.',
        coverCharge: 'Cover charge',
        metaDescription: (name) => `Allergen list and legal information for ${name}.`,
    },
    fr: {
        menu: 'Menu',
        allergens: 'Allergènes',
        title: 'Allergènes et intolérances',
        subtitle: 'Votre sécurité est notre priorité. Consultez la liste complète des allergènes présents dans nos plats.',
        tabList: '📋 Liste des allergènes',
        tabLegal: '📄 Infos légales',
        listTitle: 'Les 14 principaux allergènes',
        listSubtitle: 'Selon le règlement (UE) n° 1169/2011',
        questionsTitle: 'Des questions ?',
        questionsText: 'Notre personnel est à votre disposition pour vous renseigner en détail sur les ingrédients de chaque plat et vous aider à choisir selon vos besoins alimentaires.',
        digitalMenu: 'Menu digital',
        legalTitle: 'LISTE DES ALLERGÈNES',
        legalText: 'Voici la liste des allergènes utilisés dans cet établissement dont la déclaration est obligatoire, pour une information correcte de nos clients.',
        regulationTitle: 'RÈGLEMENT (UE) N° 1169/2011',
        frozenAtSource: 'En l’absence de produits frais, certains produits de notre menu sont surgelés à l’origine.',
        blastChilled: 'En l’absence de produits frais, certains produits de notre menu sont congelés sur place par refroidissement rapide.',
        contactText: 'Conformément à l’article 9 du règlement (UE) n° 1169/2011 du Parlement européen et du Conseil du 25 octobre 2011, les informations sur les ingrédients allergènes sont disponibles auprès de notre personnel.',
        coverCharge: 'Couvert',
        metaDescription: (name) => `Liste des allergènes et informations légales de ${name}.`,
    },
    de: {
        menu: 'Speisekarte',
        allergens: 'Allergene',
        title: 'Allergene und Unverträglichkeiten',
        subtitle: 'Ihre Sicherheit hat für uns Vorrang. Hier finden Sie die vollständige Liste der Allergene in unseren Gerichten.',
        tabList: '📋 Allergenliste',
        tabLegal: '📄 Rechtliche Hinweise',
        listTitle: 'Die 14 Hauptallergene',
        listSubtitle: 'Gemäß Verordnung (EU) Nr. 1169/2011',
        questionsTitle: 'Haben Sie Fragen?',
        questionsText: 'Unser Personal informiert Sie gerne ausführlich über die Zutaten jedes Gerichts und hilft Ihnen bei der Auswahl entsprechend Ihren Ernährungsbedürfnissen.',
        digitalMenu: 'Digitale Speisekarte',
        legalTitle: 'ALLERGENLISTE',
        legalText: 'Nachfolgend die Liste der in diesem Betrieb verwendeten kennzeichnungspflichtigen Allergene, zur korrekten Information unserer Gäste.',
        regulationTitle: 'VERORDNUNG (EU) Nr. 1169/2011',
        frozenAtSource: 'Wenn keine frischen Produkte erhältlich sind, werden einige Produkte unserer Speisekarte bereits am Ursprungsort tiefgefroren.',
        blastChilled: 'Wenn keine frischen Produkte erhältlich sind, werden einige Produkte unserer Speisekarte vor Ort schockgefrostet.',
        contactText: 'Gemäß Artikel 9 der Verordnung (EU) Nr. 1169/2011 des Europäischen Parlaments und des Rates vom 25. Oktober 2011 erhalten Sie Informationen zu allergenen Zutaten bei unserem Personal.',
        coverCharge: 'Gedeck',
        metaDescription: (name) => `Allergenliste und rechtliche Hinweise von ${name}.`,
    },
    es: {
        menu: 'Menú',
        allergens: 'Alérgenos',
        title: 'Alérgenos e intolerancias',
        subtitle: 'Tu seguridad es nuestra prioridad. Consulta la lista completa de alérgenos presentes en nuestros platos.',
        tabList: '📋 Lista de alérgenos',
        tabLegal: '📄 Información legal',
        listTitle: 'Los 14 alérgenos principales',
        listSubtitle: 'Según el Reglamento (UE) n.º 1169/2011',
        questionsTitle: '¿Tienes preguntas?',
        questionsText: 'Nuestro personal está a tu disposición para darte información detallada sobre los ingredientes de cada plato y ayudarte a elegir según tus necesidades alimentarias.',
        digitalMenu: 'Menú digital',
        legalTitle: 'LISTA DE ALÉRGENOS',
        legalText: 'Esta es la lista de alérgenos utilizados en este establecimiento cuya declaración es obligatoria, para informar correctamente a nuestros clientes.',
        regulationTitle: 'REGLAMENTO (UE) N.º 1169/2011',
        frozenAtSource: 'Cuando no se dispone de producto fresco, algunos productos de nuestro menú proceden de congelación en origen.',
        blastChilled: 'Cuando no se dispone de producto fresco, algunos productos de nuestro menú se congelan en el local mediante abatimiento rápido de temperatura.',
        contactText: 'Según lo previsto en el artículo 9 del Reglamento (UE) n.º 1169/2011 del Parlamento Europeo y del Consejo, de 25 de octubre de 2011, la información sobre los ingredientes alergénicos está disponible consultando al personal.',
        coverCharge: 'Cubierto',
        metaDescription: (name) => `Lista de alérgenos e información legal de ${name}.`,
    },
};
