/**
 * Alba e tramonto per un luogo (algoritmo NOAA, "General Solar Position Calculations"): errore di circa
 * un minuto alle nostre latitudini. Il tramonto è il momento in cui il bordo superiore del sole tocca
 * l'orizzonte (altezza -0,833°: raggio del disco più rifrazione), come nelle tabelle dei giornali.
 * Nessuna dipendenza e niente React: finisce nel bundle del menu pubblico e gira anche sul server.
 */

export interface Place {
  /** Latitudine in gradi (nord positiva) */
  lat: number;
  /** Longitudine in gradi (est positiva) */
  lng: number;
}

export interface SunTimes {
  /** Alba (null se quel giorno il sole non sorge o non tramonta, cosa che non capita in Italia) */
  sunrise: Date | null;
  sunset: Date | null;
}

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
// Altezza del centro del sole all'alba e al tramonto: -0,833° (raggio 0,266° + rifrazione 0,567°)
const ZENITH = 90.833;

function solar(jd: number) {
  const jc = (jd - 2451545) / 36525;
  const l0 = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
  const m = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
  const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
  const c =
    Math.sin(m * RAD) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    Math.sin(2 * m * RAD) * (0.019993 - 0.000101 * jc) +
    Math.sin(3 * m * RAD) * 0.000289;
  const omega = 125.04 - 1934.136 * jc;
  const apparentLong = l0 + c - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const meanObliq = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60;
  const obliq = meanObliq + 0.00256 * Math.cos(omega * RAD);
  const declination = Math.asin(Math.sin(obliq * RAD) * Math.sin(apparentLong * RAD));
  const y = Math.tan((obliq / 2) * RAD) ** 2;
  // Equazione del tempo, in minuti
  const eqTime =
    4 /
    RAD *
    (y * Math.sin(2 * l0 * RAD) -
      2 * e * Math.sin(m * RAD) +
      4 * e * y * Math.sin(m * RAD) * Math.cos(2 * l0 * RAD) -
      0.5 * y * y * Math.sin(4 * l0 * RAD) -
      1.25 * e * e * Math.sin(2 * m * RAD));
  return { declination, eqTime };
}

/** Minuti dalla mezzanotte UTC dell'alba (-1) o del tramonto (+1), oppure null. */
function eventMinutes(dayStartJd: number, place: Place, direction: 1 | -1): number | null {
  // Prima stima a mezzogiorno, poi si ricalcola la posizione del sole all'ora trovata (due passaggi bastano)
  let minutes = 720;
  for (let pass = 0; pass < 3; pass++) {
    const { declination, eqTime } = solar(dayStartJd + minutes / 1440);
    const latRad = place.lat * RAD;
    const cosHa =
      Math.cos(ZENITH * RAD) / (Math.cos(latRad) * Math.cos(declination)) - Math.tan(latRad) * Math.tan(declination);
    if (cosHa < -1 || cosHa > 1) return null;
    const hourAngle = Math.acos(cosHa) / RAD;
    const solarNoon = 720 - 4 * place.lng - eqTime;
    minutes = solarNoon + direction * hourAngle * 4;
  }
  return minutes;
}

/** Alba e tramonto del giorno di calendario (UTC) che contiene `date`. */
export function sunTimes(date: Date, place: Place): SunTimes {
  const dayStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayStartJd = dayStart / DAY_MS + 2440587.5;
  const at = (minutes: number | null) => (minutes === null ? null : new Date(dayStart + Math.round(minutes * 60_000)));
  return {
    sunrise: at(eventMinutes(dayStartJd, place, -1)),
    sunset: at(eventMinutes(dayStartJd, place, 1)),
  };
}

export type DayPhase = 'day' | 'night';

/**
 * Intervalli di notte [tramonto, alba successiva] in millisecondi, da un giorno prima di `from` per `days`
 * giorni: bastano per sapere se è giorno o notte senza ricalcolare (lo script che colora la pagina prima
 * che si carichi React li riceve già pronti dal server).
 */
export function nightIntervals(from: Date, days: number, place: Place): [number, number][] {
  const intervals: [number, number][] = [];
  for (let i = -1; i < days; i++) {
    const today = sunTimes(new Date(from.getTime() + i * DAY_MS), place);
    const tomorrow = sunTimes(new Date(from.getTime() + (i + 1) * DAY_MS), place);
    if (today.sunset && tomorrow.sunrise) intervals.push([today.sunset.getTime(), tomorrow.sunrise.getTime()]);
  }
  return intervals;
}

/** Giorno o notte nel luogo all'istante `now`, e quando cambierà. */
export function dayPhase(now: Date, place: Place): { phase: DayPhase; nextChange: Date | null } {
  const t = now.getTime();
  for (const [sunset, sunrise] of nightIntervals(now, 2, place)) {
    if (t < sunset) return { phase: 'day', nextChange: new Date(sunset) };
    if (t < sunrise) return { phase: 'night', nextChange: new Date(sunrise) };
  }
  return { phase: 'day', nextChange: null };
}
