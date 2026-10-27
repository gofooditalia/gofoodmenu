'use client';

/**
 * Testi fissi del menu pubblico nelle lingue di MenuLang: etichette, pulsanti e nomi dei 14 allergeni.
 * Scritti a mano e mai generati dall'AI (gli allergeni sono un obbligo di legge: niente errori).
 * La lingua arriva da MenuLangProvider (pagine /{slug} e /{slug}/{lingua}); fuori dal menu vale l'italiano.
 */

import { createContext, useContext } from 'react';
import type { MenuLang } from '@/lib/menu-languages';

interface MenuStrings {
    outOfSeason: string;
    seasonalOnly: string;
    containsGluten: string;
    homemade: string;
    frozen: string;
    vegetarian: string;
    vegan: string;
    allergenInfo: string;
    glutenFilter: string;
    backToTop: string;
    languageLabel: string;
    ourLocations: string;
    information: string;
    allergens: string;
    followUs: string;
}

const STRINGS: Record<MenuLang, MenuStrings> = {
    it: {
        outOfSeason: 'Fuori stagione',
        seasonalOnly: 'Disponibile solo nel periodo stagionale',
        containsGluten: 'Contiene glutine',
        homemade: 'Fatto in casa',
        frozen: 'Surgelato',
        vegetarian: 'Vegetariano',
        vegan: 'Vegano',
        allergenInfo: 'Vedi info allergeni',
        glutenFilter: 'Filtro senza glutine',
        backToTop: 'Torna su',
        languageLabel: 'Lingua del menu',
        ourLocations: 'Le Nostre Sedi',
        information: 'Informazioni',
        allergens: 'Allergeni',
        followUs: 'Seguici',
    },
    en: {
        outOfSeason: 'Out of season',
        seasonalOnly: 'Available only in season',
        containsGluten: 'Contains gluten',
        homemade: 'Homemade',
        frozen: 'Frozen',
        vegetarian: 'Vegetarian',
        vegan: 'Vegan',
        allergenInfo: 'Allergen information',
        glutenFilter: 'Gluten-free filter',
        backToTop: 'Back to top',
        languageLabel: 'Menu language',
        ourLocations: 'Our Locations',
        information: 'Information',
        allergens: 'Allergens',
        followUs: 'Follow Us',
    },
    fr: {
        outOfSeason: 'Hors saison',
        seasonalOnly: 'Disponible uniquement en saison',
        containsGluten: 'Contient du gluten',
        homemade: 'Fait maison',
        frozen: 'Surgelé',
        vegetarian: 'Végétarien',
        vegan: 'Végan',
        allergenInfo: 'Informations sur les allergènes',
        glutenFilter: 'Filtre sans gluten',
        backToTop: 'Haut de page',
        languageLabel: 'Langue du menu',
        ourLocations: 'Nos adresses',
        information: 'Informations',
        allergens: 'Allergènes',
        followUs: 'Suivez-nous',
    },
    de: {
        outOfSeason: 'Nicht in der Saison',
        seasonalOnly: 'Nur in der Saison erhältlich',
        containsGluten: 'Enthält Gluten',
        homemade: 'Hausgemacht',
        frozen: 'Tiefgekühlt',
        vegetarian: 'Vegetarisch',
        vegan: 'Vegan',
        allergenInfo: 'Informationen zu Allergenen',
        glutenFilter: 'Glutenfrei-Filter',
        backToTop: 'Nach oben',
        languageLabel: 'Sprache der Speisekarte',
        ourLocations: 'Unsere Standorte',
        information: 'Informationen',
        allergens: 'Allergene',
        followUs: 'Folgen Sie uns',
    },
    es: {
        outOfSeason: 'Fuera de temporada',
        seasonalOnly: 'Disponible solo en temporada',
        containsGluten: 'Contiene gluten',
        homemade: 'Casero',
        frozen: 'Congelado',
        vegetarian: 'Vegetariano',
        vegan: 'Vegano',
        allergenInfo: 'Información sobre alérgenos',
        glutenFilter: 'Filtro sin gluten',
        backToTop: 'Volver arriba',
        languageLabel: 'Idioma del menú',
        ourLocations: 'Nuestros locales',
        information: 'Información',
        allergens: 'Alérgenos',
        followUs: 'Síguenos',
    },
    pl: {
        outOfSeason: 'Poza sezonem',
        seasonalOnly: 'Dostępne tylko w sezonie',
        containsGluten: 'Zawiera gluten',
        homemade: 'Domowej roboty',
        frozen: 'Mrożone',
        vegetarian: 'Wegetariańskie',
        vegan: 'Wegańskie',
        allergenInfo: 'Informacje o alergenach',
        glutenFilter: 'Filtr bezglutenowy',
        backToTop: 'Do góry',
        languageLabel: 'Język menu',
        ourLocations: 'Nasze lokale',
        information: 'Informacje',
        allergens: 'Alergeny',
        followUs: 'Obserwuj nas',
    },
    pt: {
        outOfSeason: 'Fora de época',
        seasonalOnly: 'Disponível apenas na época',
        containsGluten: 'Contém glúten',
        homemade: 'Caseiro',
        frozen: 'Congelado',
        vegetarian: 'Vegetariano',
        vegan: 'Vegano',
        allergenInfo: 'Informação sobre alergénios',
        glutenFilter: 'Filtro sem glúten',
        backToTop: 'Voltar ao topo',
        languageLabel: 'Idioma do menu',
        ourLocations: 'Os nossos espaços',
        information: 'Informações',
        allergens: 'Alergénios',
        followUs: 'Siga-nos',
    },
};

// I 14 allergeni del Reg. UE 1169/2011, con gli id usati nel database (allergen_ids dei piatti)
const ALLERGENS: Record<string, Record<MenuLang, string>> = {
    glutine: { it: 'Glutine', en: 'Gluten', fr: 'Gluten', de: 'Gluten', es: 'Gluten', pl: 'Gluten', pt: 'Glúten' },
    crostacei: { it: 'Crostacei', en: 'Crustaceans', fr: 'Crustacés', de: 'Krebstiere', es: 'Crustáceos', pl: 'Skorupiaki', pt: 'Crustáceos' },
    uova: { it: 'Uova', en: 'Eggs', fr: 'Œufs', de: 'Eier', es: 'Huevos', pl: 'Jaja', pt: 'Ovos' },
    pesce: { it: 'Pesce', en: 'Fish', fr: 'Poisson', de: 'Fisch', es: 'Pescado', pl: 'Ryby', pt: 'Peixe' },
    arachidi: { it: 'Arachidi', en: 'Peanuts', fr: 'Arachides', de: 'Erdnüsse', es: 'Cacahuetes', pl: 'Orzeszki ziemne', pt: 'Amendoins' },
    soia: { it: 'Soia', en: 'Soy', fr: 'Soja', de: 'Soja', es: 'Soja', pl: 'Soja', pt: 'Soja' },
    lattosio: { it: 'Lattosio', en: 'Milk', fr: 'Lait', de: 'Milch', es: 'Leche', pl: 'Mleko', pt: 'Leite' },
    'frutta-secca': { it: 'Frutta secca', en: 'Nuts', fr: 'Fruits à coque', de: 'Schalenfrüchte', es: 'Frutos de cáscara', pl: 'Orzechy', pt: 'Frutos de casca rija' },
    sedano: { it: 'Sedano', en: 'Celery', fr: 'Céleri', de: 'Sellerie', es: 'Apio', pl: 'Seler', pt: 'Aipo' },
    senape: { it: 'Senape', en: 'Mustard', fr: 'Moutarde', de: 'Senf', es: 'Mostaza', pl: 'Gorczyca', pt: 'Mostarda' },
    sesamo: { it: 'Sesamo', en: 'Sesame', fr: 'Sésame', de: 'Sesam', es: 'Sésamo', pl: 'Sezam', pt: 'Sésamo' },
    solfiti: { it: 'Solfiti', en: 'Sulphites', fr: 'Sulfites', de: 'Sulfite', es: 'Sulfitos', pl: 'Siarczyny', pt: 'Sulfitos' },
    lupini: { it: 'Lupini', en: 'Lupin', fr: 'Lupin', de: 'Lupinen', es: 'Altramuces', pl: 'Łubin', pt: 'Tremoço' },
    molluschi: { it: 'Molluschi', en: 'Molluscs', fr: 'Mollusques', de: 'Weichtiere', es: 'Moluscos', pl: 'Mięczaki', pt: 'Moluscos' },
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
