import { test, expect } from '@playwright/test';
import { menuLangDir, menuLangTag, pickMenuLang } from '../src/lib/menu-languages';

// Lingua in cui si apre il menu dal QR (middleware): solo logica, nessuna pagina
const TUTTE = ['en', 'fr', 'de', 'es', 'pl', 'pt', 'zh', 'ar'];
const EUROPEE = ['en', 'fr', 'de', 'es', 'pl', 'pt'];

test.describe('pickMenuLang', () => {
  for (const [header, lang] of [
    ['zh-CN,zh;q=0.9', 'zh'],
    ['zh-TW,zh;q=0.9,en;q=0.8', 'zh'],
    ['zh-Hant-HK', 'zh'],
    ['ar-SA,ar;q=0.9', 'ar'],
    ['ar-EG', 'ar'],
    ['it-IT,it;q=0.9,en;q=0.8', 'it'],
    ['nl-NL', 'en'],
  ] as const) {
    test(`${header} → ${lang} (locale con cinese e arabo)`, () => {
      expect(pickMenuLang(TUTTE, header)).toBe(lang);
    });
  }

  test('telefono in cinese o arabo, locale senza quelle lingue → inglese', () => {
    expect(pickMenuLang(EUROPEE, 'zh-CN,zh;q=0.9')).toBe('en');
    expect(pickMenuLang(EUROPEE, 'ar-SA')).toBe('en');
  });

  test('la scelta salvata nel selettore vale più del telefono', () => {
    expect(pickMenuLang(TUTTE, 'zh-CN', 'ar')).toBe('ar');
    expect(pickMenuLang(TUTTE, 'ar-SA', 'it')).toBe('it');
    // Scelta di una lingua poi disattivata: conta di nuovo il telefono
    expect(pickMenuLang(EUROPEE, 'ar-SA', 'zh')).toBe('en');
  });
});

test('direzione del testo e codice della lingua', () => {
  expect(menuLangDir('ar')).toBe('rtl');
  expect(menuLangDir('zh')).toBe('ltr');
  expect(menuLangDir('it')).toBe('ltr');
  expect(menuLangTag('zh')).toBe('zh-Hans');
  expect(menuLangTag('ar')).toBe('ar');
  expect(menuLangTag('en')).toBe('en');
});
