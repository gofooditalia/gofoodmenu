import { test, expect } from '@playwright/test';
import { dayPhase, nightIntervals, sunTimes } from '../src/lib/sun-times';
import { menuLayoutFor } from '../src/lib/menu-layouts';

// Alba e tramonto del menu Sunset (tema chiaro di giorno, scuro dopo il tramonto): solo logica, nessuna pagina.
// Valori di riferimento (UTC) calcolati con la libreria astral (Python) per le stesse coordinate.
const layout = menuLayoutFor('sunset-barcarello');
if (layout?.kind !== 'sunset') throw new Error('sunset-barcarello deve avere il menu Sunset');
const place = layout.place;

const RIFERIMENTI: [string, string, string][] = [
  ['2026-03-20', '05:10:52', '17:18:24'],
  ['2026-06-21', '03:44:08', '18:33:16'],
  ['2026-10-31', '05:31:54', '16:08:30'],
  ['2026-12-21', '06:20:01', '15:49:51'],
];

for (const [day, sunrise, sunset] of RIFERIMENTI) {
  test(`alba e tramonto a Barcarello il ${day} (scarto massimo 1 minuto)`, () => {
    const t = sunTimes(new Date(`${day}T12:00:00Z`), place);
    expect(Math.abs(t.sunrise!.getTime() - Date.parse(`${day}T${sunrise}Z`))).toBeLessThan(60_000);
    expect(Math.abs(t.sunset!.getTime() - Date.parse(`${day}T${sunset}Z`))).toBeLessThan(60_000);
  });
}

test('giorno e notte, con il prossimo cambio', () => {
  // 31/10/2026: tramonto alle 17:08 ora italiana (16:08 UTC)
  const pomeriggio = dayPhase(new Date('2026-10-31T15:00:00Z'), place);
  expect(pomeriggio.phase).toBe('day');
  expect(pomeriggio.nextChange!.toISOString().slice(0, 16)).toBe('2026-10-31T16:08');

  const sera = dayPhase(new Date('2026-10-31T19:00:00Z'), place);
  expect(sera.phase).toBe('night');
  expect(sera.nextChange!.getUTCDate()).toBe(1); // alba del 1° novembre

  // Dopo mezzanotte (ora italiana) è ancora notte fino all'alba
  expect(dayPhase(new Date('2026-10-31T23:30:00Z'), place).phase).toBe('night');
  expect(dayPhase(new Date('2026-11-01T06:00:00Z'), place).phase).toBe('day');
});

test('gli intervalli di notte per lo script inline coprono i giorni richiesti', () => {
  const from = new Date('2026-10-31T10:00:00Z');
  const nights = nightIntervals(from, 15, place);
  expect(nights.length).toBe(16);
  for (const [start, end] of nights) expect(end).toBeGreaterThan(start);
  // L'ultima notte arriva oltre i 14 giorni: la pagina in cache (rigenerata ogni 24 ore) non resta mai scoperta
  expect(nights[nights.length - 1][1] - from.getTime()).toBeGreaterThan(14 * 86_400_000);
});
