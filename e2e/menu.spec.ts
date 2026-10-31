import { test, expect } from './fixtures';
import { LOCALI_REALI, LOCALE_FREE, LOCALE_TRADOTTO } from './locali';
import { INFO_PAGE_SLUGS } from '../src/lib/tenant-info';

for (const slug of LOCALI_REALI) {
  test.describe(slug, () => {
    test('il menu si apre con piatti e prezzi', async ({ page }) => {
      const res = await page.goto(`/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.locator('main h3').first()).toBeVisible();
      await expect(page.getByText(/€\s?\d/).first()).toBeVisible();
    });

    test('la pagina allergeni si apre', async ({ page }) => {
      const res = await page.goto(`/${slug}/allergeni`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('main h1')).toBeVisible();
    });

    test("il manifest dell'app ha nome e colori", async ({ request }) => {
      const res = await request.get(`/${slug}/manifest.webmanifest`);
      expect(res.status()).toBe(200);
      const manifest = await res.json();
      expect(manifest.name).toBeTruthy();
      expect(manifest.start_url).toContain(slug);
      expect(manifest.background_color).toMatch(/^#[0-9a-f]{3,6}$/i);
    });
  });
}

// Pagina allergeni nelle lingue del menu tradotto: testi fissi, link al menu nella stessa lingua
const ALLERGENI_TRADOTTI = { en: 'Allergens and Intolerances', fr: 'Allergènes et intolérances', de: 'Allergene und Unverträglichkeiten', es: 'Alérgenos e intolerancias', pl: 'Alergeny i nietolerancje', pt: 'Alergénios e intolerâncias' };
for (const [lang, title] of Object.entries(ALLERGENI_TRADOTTI)) {
  test(`${LOCALE_TRADOTTO}: la pagina allergeni in ${lang}`, async ({ page }) => {
    const res = await page.goto(`/${LOCALE_TRADOTTO}/${lang}/allergeni`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await expect(page.locator(`[lang="${lang}"]`).first()).toBeAttached();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link')).toHaveAttribute('href', `/${LOCALE_TRADOTTO}/${lang}`);
    await expect(page.locator(`link[rel="alternate"][hreflang="it"]`)).toHaveAttribute('href', /\/allergeni$/);
  });
}

test('il menu tradotto porta agli allergeni nella stessa lingua', async ({ page }) => {
  await page.goto(`/${LOCALE_TRADOTTO}/en`);
  await expect(page.locator(`a[href="/${LOCALE_TRADOTTO}/en/allergeni"]`).first()).toBeAttached();
});

// Locale senza lingue attive: l'account di prova sul piano free, che non viene mai tradotto (i locali reali
// passano uno alla volta ai menu tradotti, quindi non se ne può scegliere uno come "non tradotto")
test('la pagina allergeni non esiste nelle lingue non attive del locale', async ({ page }) => {
  const res = await page.goto(`/${LOCALE_FREE}/en/allergeni`);
  expect(res?.status()).toBe(404);
});

// Locale senza menu pubblico (piano free, abbonamento sospeso o disdetto): pagina neutra, niente piatti, fuori dai motori
for (const path of ['', '/allergeni']) {
  test(`il menu di un locale col piano free non è pubblico (${path || '/'})`, async ({ page }) => {
    const res = await page.goto(`/${LOCALE_FREE}${path}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Menu non disponibile' })).toBeVisible();
    await expect(page.getByText(/chiedi pure al personale/i)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.getByText('€')).toHaveCount(0);
  });
}

// Scheda contatti /{slug}/info: per ora solo i locali in prova
for (const slug of INFO_PAGE_SLUGS) {
  test(`${slug}: la scheda contatti porta al menu`, async ({ page }) => {
    const res = await page.goto(`/${slug}/info`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    const menu = page.getByRole('link', { name: /sfoglia il menu/i });
    await expect(menu).toHaveAttribute('href', `/${slug}`);
    await expect(page.locator('a[href^="https://www.google.com/maps/"]').first()).toBeVisible();
  });
}

test('la scheda contatti dei locali non in prova non esiste', async ({ page }) => {
  const altro = LOCALI_REALI.find((slug) => !INFO_PAGE_SLUGS.includes(slug))!;
  const res = await page.goto(`/${altro}/info`);
  expect(res?.status()).toBe(404);
});

// Menu su misura di Sunset: tema scelto prima che la pagina si veda, passaggio allo scuro al tramonto
test.describe('sunset-barcarello: tema del tramonto', () => {
  test('il tema si può forzare e non resta sul sito uscendo dal menu', async ({ page }) => {
    await page.goto('/sunset-barcarello?tema=scuro');
    await expect(page.locator('html')).toHaveAttribute('data-sunset', 'dark');
    await page.goto('/sunset-barcarello?tema=chiaro');
    await expect(page.locator('html')).toHaveAttribute('data-sunset', 'light');
  });

  test('la barra del browser prende il colore del tema', async ({ page }) => {
    const themeColor = page.locator('meta[name="theme-color"]').first();
    await page.goto('/sunset-barcarello?tema=scuro');
    await expect(themeColor).toHaveAttribute('content', '#0F1B2D');
    await page.goto('/sunset-barcarello?tema=chiaro');
    await expect(themeColor).toHaveAttribute('content', '#FBF4EA');
  });

  test('con ?tema=tramonto il menu passa da chiaro a scuro', async ({ page }) => {
    await page.goto('/sunset-barcarello?tema=tramonto');
    await expect(page.locator('html')).toHaveAttribute('data-sunset', 'light');
    await expect(page.locator('html')).toHaveAttribute('data-sunset', 'dark', { timeout: 5000 });
  });

  test('nessuna categoria vuota e nessuna foto segnaposto', async ({ page }) => {
    await page.goto('/sunset-barcarello');
    for (const section of await page.locator('main section').all()) {
      await expect(section.locator('h3').first()).toBeAttached();
    }
    await expect(page.locator('img[src*="no-image"]')).toHaveCount(0);
  });

  test('gli altri locali restano sul menu standard', async ({ page }) => {
    await page.goto('/villa-pensabene-ristorante-pizzeria');
    await expect(page.locator('.sunset-menu')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-sunset', /.*/);
  });
});
