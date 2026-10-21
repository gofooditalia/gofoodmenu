import { test, expect } from './fixtures';
import { LOCALI_REALI, LOCALE_FREE } from './locali';

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

test('il menu di un locale col piano free non è pubblico', async ({ page }) => {
  const res = await page.goto(`/${LOCALE_FREE}`);
  expect(res?.status()).toBe(404);
});
