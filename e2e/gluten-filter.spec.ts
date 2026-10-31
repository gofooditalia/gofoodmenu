import { test, expect } from '@playwright/test';
import { glutenStatus } from '../src/lib/gluten-filter';

// Filtro "senza glutine": un piatto senza allergeni inseriti non deve sembrare adatto a un celiaco
test('filtro spento: nessun avviso', () => {
  expect(glutenStatus({ allergens: ['glutine'] }, false)).toBe('ok');
  expect(glutenStatus({ allergens: [] }, false)).toBe('ok');
});

test('filtro acceso: glutine, allergeni mancanti, piatto compilato', () => {
  expect(glutenStatus({ allergens: ['lattosio', 'glutine'] }, true)).toBe('contains');
  expect(glutenStatus({ allergens: [] }, true)).toBe('unknown');
  expect(glutenStatus({ allergens: null }, true)).toBe('unknown');
  expect(glutenStatus({ allergens: ['molluschi'] }, true)).toBe('ok');
  // Segnato dal locale come senza glutine: vale la sua dichiarazione
  expect(glutenStatus({ allergens: [], is_gluten_free: true }, true)).toBe('ok');
});
