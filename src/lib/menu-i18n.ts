'use client';

/**
 * Testi fissi del menu pubblico nelle lingue di MenuLang: etichette, pulsanti e nomi dei 14 allergeni.
 * Scritti a mano e mai generati dall'AI (gli allergeni sono un obbligo di legge: niente errori).
 * Cinese e arabo (oltre a polacco e portoghese) sono da far rileggere a un madrelingua.
 * La lingua arriva da MenuLangProvider (pagine /{slug} e /{slug}/{lingua}); fuori dal menu vale l'italiano.
 */

import { createContext, useContext } from 'react';
import type { MenuLang } from '@/lib/menu-languages';

interface MenuStrings {
    outOfSeason: string;
    seasonalOnly: string;
    containsGluten: string;
    /** Filtro senza glutine attivo su un piatto senza allergeni inseriti: non va presentato come sicuro */
    allergensUnknown: string;
    homemade: string;
    frozen: string;
    vegetarian: string;
    vegan: string;
    allergenInfo: string;
    // Pulsante "i" del menu Sunset che mostra i nomi accanto alle icone degli allergeni
    allergenNames: string;
    glutenFilter: string;
    /** Etichetta breve del filtro, accanto all'icona (impaginazioni su misura) */
    glutenFreeShort: string;
    backToTop: string;
    languageLabel: string;
    ourLocations: string;
    information: string;
    allergens: string;
    followUs: string;
    /** Piatti con foto in testa alla categoria (impaginazioni su misura, src/lib/menu-layouts.ts) */
    featured: string;
}

const STRINGS: Record<MenuLang, MenuStrings> = {
    it: {
        outOfSeason: 'Fuori stagione',
        seasonalOnly: 'Disponibile solo nel periodo stagionale',
        containsGluten: 'Contiene glutine',
        allergensUnknown: 'Allergeni non indicati: chiedi al personale',
        homemade: 'Fatto in casa',
        frozen: 'Surgelato',
        vegetarian: 'Vegetariano',
        vegan: 'Vegano',
        allergenInfo: 'Vedi info allergeni',
        allergenNames: 'Nomi degli allergeni',
        glutenFilter: 'Filtro senza glutine',
        glutenFreeShort: 'Senza glutine',
        backToTop: 'Torna su',
        languageLabel: 'Lingua del menu',
        ourLocations: 'Le Nostre Sedi',
        information: 'Informazioni',
        allergens: 'Allergeni',
        followUs: 'Seguici',
        featured: 'In evidenza',
    },
    en: {
        outOfSeason: 'Out of season',
        seasonalOnly: 'Available only in season',
        containsGluten: 'Contains gluten',
        allergensUnknown: 'Allergens not listed: please ask our staff',
        homemade: 'Homemade',
        frozen: 'Frozen',
        vegetarian: 'Vegetarian',
        vegan: 'Vegan',
        allergenInfo: 'Allergen information',
        allergenNames: 'Allergen names',
        glutenFilter: 'Gluten-free filter',
        glutenFreeShort: 'Gluten-free',
        backToTop: 'Back to top',
        languageLabel: 'Menu language',
        ourLocations: 'Our Locations',
        information: 'Information',
        allergens: 'Allergens',
        followUs: 'Follow Us',
        featured: 'Featured',
    },
    fr: {
        outOfSeason: 'Hors saison',
        seasonalOnly: 'Disponible uniquement en saison',
        containsGluten: 'Contient du gluten',
        allergensUnknown: 'Allergènes non indiqués : demandez au personnel',
        homemade: 'Fait maison',
        frozen: 'Surgelé',
        vegetarian: 'Végétarien',
        vegan: 'Végan',
        allergenInfo: 'Informations sur les allergènes',
        allergenNames: 'Noms des allergènes',
        glutenFilter: 'Filtre sans gluten',
        glutenFreeShort: 'Sans gluten',
        backToTop: 'Haut de page',
        languageLabel: 'Langue du menu',
        ourLocations: 'Nos adresses',
        information: 'Informations',
        allergens: 'Allergènes',
        followUs: 'Suivez-nous',
        featured: 'À la une',
    },
    de: {
        outOfSeason: 'Nicht in der Saison',
        seasonalOnly: 'Nur in der Saison erhältlich',
        containsGluten: 'Enthält Gluten',
        allergensUnknown: 'Allergene nicht angegeben: bitte beim Personal nachfragen',
        homemade: 'Hausgemacht',
        frozen: 'Tiefgekühlt',
        vegetarian: 'Vegetarisch',
        vegan: 'Vegan',
        allergenInfo: 'Informationen zu Allergenen',
        allergenNames: 'Namen der Allergene',
        glutenFilter: 'Glutenfrei-Filter',
        glutenFreeShort: 'Glutenfrei',
        backToTop: 'Nach oben',
        languageLabel: 'Sprache der Speisekarte',
        ourLocations: 'Unsere Standorte',
        information: 'Informationen',
        allergens: 'Allergene',
        followUs: 'Folgen Sie uns',
        featured: 'Empfehlungen',
    },
    es: {
        outOfSeason: 'Fuera de temporada',
        seasonalOnly: 'Disponible solo en temporada',
        containsGluten: 'Contiene gluten',
        allergensUnknown: 'Alérgenos no indicados: pregunte al personal',
        homemade: 'Casero',
        frozen: 'Congelado',
        vegetarian: 'Vegetariano',
        vegan: 'Vegano',
        allergenInfo: 'Información sobre alérgenos',
        allergenNames: 'Nombres de los alérgenos',
        glutenFilter: 'Filtro sin gluten',
        glutenFreeShort: 'Sin gluten',
        backToTop: 'Volver arriba',
        languageLabel: 'Idioma del menú',
        ourLocations: 'Nuestros locales',
        information: 'Información',
        allergens: 'Alérgenos',
        followUs: 'Síguenos',
        featured: 'Destacados',
    },
    pl: {
        outOfSeason: 'Poza sezonem',
        seasonalOnly: 'Dostępne tylko w sezonie',
        containsGluten: 'Zawiera gluten',
        allergensUnknown: 'Alergeny nie zostały podane: zapytaj obsługę',
        homemade: 'Domowej roboty',
        frozen: 'Mrożone',
        vegetarian: 'Wegetariańskie',
        vegan: 'Wegańskie',
        allergenInfo: 'Informacje o alergenach',
        allergenNames: 'Nazwy alergenów',
        glutenFilter: 'Filtr bezglutenowy',
        glutenFreeShort: 'Bez glutenu',
        backToTop: 'Do góry',
        languageLabel: 'Język menu',
        ourLocations: 'Nasze lokale',
        information: 'Informacje',
        allergens: 'Alergeny',
        followUs: 'Obserwuj nas',
        featured: 'Polecane',
    },
    pt: {
        outOfSeason: 'Fora de época',
        seasonalOnly: 'Disponível apenas na época',
        containsGluten: 'Contém glúten',
        allergensUnknown: 'Alergénios não indicados: pergunte ao pessoal',
        homemade: 'Caseiro',
        frozen: 'Congelado',
        vegetarian: 'Vegetariano',
        vegan: 'Vegano',
        allergenInfo: 'Informação sobre alergénios',
        allergenNames: 'Nomes dos alergénios',
        glutenFilter: 'Filtro sem glúten',
        glutenFreeShort: 'Sem glúten',
        backToTop: 'Voltar ao topo',
        languageLabel: 'Idioma do menu',
        ourLocations: 'Os nossos espaços',
        information: 'Informações',
        allergens: 'Alergénios',
        followUs: 'Siga-nos',
        featured: 'Em destaque',
    },
    zh: {
        outOfSeason: '非当季',
        seasonalOnly: '仅在当季供应',
        containsGluten: '含麸质',
        allergensUnknown: '未标注过敏原：请咨询工作人员',
        homemade: '自制',
        frozen: '冷冻',
        vegetarian: '素食',
        vegan: '纯素',
        allergenInfo: '过敏原信息',
        allergenNames: '过敏原名称',
        glutenFilter: '无麸质筛选',
        glutenFreeShort: '无麸质',
        backToTop: '返回顶部',
        languageLabel: '菜单语言',
        ourLocations: '我们的门店',
        information: '信息',
        allergens: '过敏原',
        followUs: '关注我们',
        featured: '精选',
    },
    ar: {
        outOfSeason: 'خارج الموسم',
        seasonalOnly: 'متوفر في موسمه فقط',
        containsGluten: 'يحتوي على الغلوتين',
        allergensUnknown: 'لم تُذكر مسببات الحساسية: يُرجى سؤال الموظفين',
        homemade: 'من صنعنا',
        frozen: 'مجمّد',
        vegetarian: 'نباتي',
        vegan: 'نباتي صرف',
        allergenInfo: 'معلومات مسببات الحساسية',
        allergenNames: 'أسماء مسببات الحساسية',
        glutenFilter: 'تصفية: خالٍ من الغلوتين',
        glutenFreeShort: 'خالٍ من الغلوتين',
        backToTop: 'العودة إلى الأعلى',
        languageLabel: 'لغة القائمة',
        ourLocations: 'فروعنا',
        information: 'معلومات',
        allergens: 'مسببات الحساسية',
        followUs: 'تابعونا',
        featured: 'مميز',
    },
};

// I 14 allergeni del Reg. UE 1169/2011, con gli id usati nel database (allergen_ids dei piatti)
const ALLERGENS: Record<string, Record<MenuLang, string>> = {
    glutine: { it: 'Glutine', en: 'Gluten', fr: 'Gluten', de: 'Gluten', es: 'Gluten', pl: 'Gluten', pt: 'Glúten', zh: '麸质', ar: 'الغلوتين' },
    crostacei: { it: 'Crostacei', en: 'Crustaceans', fr: 'Crustacés', de: 'Krebstiere', es: 'Crustáceos', pl: 'Skorupiaki', pt: 'Crustáceos', zh: '甲壳类', ar: 'القشريات' },
    uova: { it: 'Uova', en: 'Eggs', fr: 'Œufs', de: 'Eier', es: 'Huevos', pl: 'Jaja', pt: 'Ovos', zh: '蛋', ar: 'البيض' },
    pesce: { it: 'Pesce', en: 'Fish', fr: 'Poisson', de: 'Fisch', es: 'Pescado', pl: 'Ryby', pt: 'Peixe', zh: '鱼', ar: 'الأسماك' },
    arachidi: { it: 'Arachidi', en: 'Peanuts', fr: 'Arachides', de: 'Erdnüsse', es: 'Cacahuetes', pl: 'Orzeszki ziemne', pt: 'Amendoins', zh: '花生', ar: 'الفول السوداني' },
    soia: { it: 'Soia', en: 'Soy', fr: 'Soja', de: 'Soja', es: 'Soja', pl: 'Soja', pt: 'Soja', zh: '大豆', ar: 'الصويا' },
    lattosio: { it: 'Lattosio', en: 'Milk', fr: 'Lait', de: 'Milch', es: 'Leche', pl: 'Mleko', pt: 'Leite', zh: '乳制品', ar: 'الحليب' },
    'frutta-secca': { it: 'Frutta secca', en: 'Nuts', fr: 'Fruits à coque', de: 'Schalenfrüchte', es: 'Frutos de cáscara', pl: 'Orzechy', pt: 'Frutos de casca rija', zh: '坚果', ar: 'المكسرات' },
    sedano: { it: 'Sedano', en: 'Celery', fr: 'Céleri', de: 'Sellerie', es: 'Apio', pl: 'Seler', pt: 'Aipo', zh: '芹菜', ar: 'الكرفس' },
    senape: { it: 'Senape', en: 'Mustard', fr: 'Moutarde', de: 'Senf', es: 'Mostaza', pl: 'Gorczyca', pt: 'Mostarda', zh: '芥末', ar: 'الخردل' },
    sesamo: { it: 'Sesamo', en: 'Sesame', fr: 'Sésame', de: 'Sesam', es: 'Sésamo', pl: 'Sezam', pt: 'Sésamo', zh: '芝麻', ar: 'السمسم' },
    solfiti: { it: 'Solfiti', en: 'Sulphites', fr: 'Sulfites', de: 'Sulfite', es: 'Sulfitos', pl: 'Siarczyny', pt: 'Sulfitos', zh: '亚硫酸盐', ar: 'الكبريتيت' },
    lupini: { it: 'Lupini', en: 'Lupin', fr: 'Lupin', de: 'Lupinen', es: 'Altramuces', pl: 'Łubin', pt: 'Tremoço', zh: '羽扇豆', ar: 'الترمس' },
    molluschi: { it: 'Molluschi', en: 'Molluscs', fr: 'Mollusques', de: 'Weichtiere', es: 'Moluscos', pl: 'Mięczaki', pt: 'Moluscos', zh: '软体动物', ar: 'الرخويات' },
};

const MenuLangContext = createContext<MenuLang>('it');
export const MenuLangProvider = MenuLangContext.Provider;

export function useMenuLang(): MenuLang {
    return useContext(MenuLangContext);
}

export function useMenuStrings(): MenuStrings & { allergenName: (id: string) => string } {
    const lang = useMenuLang();
    return {
        ...STRINGS[lang],
        allergenName: (id: string) => ALLERGENS[id]?.[lang] ?? id,
    };
}
