import { test, expect } from './fixtures';
import { THEME_PRESETS } from '../src/lib/theme-engine/presets';

// Credenziali dell'account di prova del titolare: segreti GitHub, letti con env() a ogni uso.
// Senza credenziali il test non parte.
const env = (name: string) => process.env[name] ?? '';

// Niente trace: registrerebbe la password digitata e i token di sessione, e il report dei test falliti
// viene caricato su GitHub. Playwright accetta questa opzione solo al livello più alto del file.
test.use({ trace: 'off' });

interface Write {
  table: string;
  method: string;
  body: unknown;
}

test.describe('Design Studio', () => {
  test.skip(!env('E2E_EMAIL') || !env('E2E_PASSWORD'), 'Mancano E2E_EMAIL ed E2E_PASSWORD');
  // Editor e anteprima affiancati: su telefono sono in due schede separate
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });

  test("uno stile pronto aggiorna l'anteprima e salva tutti i suoi colori", async ({ page }) => {
    // Il database è quello di produzione: ogni scrittura viene intercettata e registrata, a Supabase
    // arrivano solo letture. Salvare davvero cambierebbe il tema (e lo slug, se manca) dell'account.
    const writes: Write[] = [];
    await page.route(/\/rest\/v1\//, (route) => {
      const request = route.request();
      if (request.method() === 'GET' || request.method() === 'HEAD') return route.continue();
      let body: unknown = null;
      try {
        body = request.postDataJSON();
      } catch {
        // DELETE senza corpo
      }
      writes.push({ table: new URL(request.url()).pathname.split('/rest/v1/')[1], method: request.method(), body });
      return route.fulfill({ status: request.method() === 'POST' ? 201 : 204 });
    });

    await page.goto('/login');
    await page.locator('#email').fill(env('E2E_EMAIL'));
    await page.locator('#password').fill(env('E2E_PASSWORD'));
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/);

    await page.goto('/dashboard/design-studio');
    const presetSelect = page.locator('select').filter({ has: page.locator(`option[value="${THEME_PRESETS[0].id}"]`) });
    await expect(presetSelect).toBeVisible();

    // Uno stile diverso da quello salvato, così l'anteprima deve per forza cambiare
    const current = await presetSelect.inputValue();
    const target = THEME_PRESETS.find((preset) => preset.id !== current)!;
    await presetSelect.selectOption(target.id);

    const preview = page.locator('[style*="--tenant-primary"]').first();
    const cssVar = (name: string) =>
      preview.evaluate((el, n) => (el as HTMLElement).style.getPropertyValue(n).trim().toLowerCase(), name);
    await expect.poll(() => cssVar('--tenant-primary')).toBe(target.colors.primary.toLowerCase());
    await expect.poll(() => cssVar('--tenant-background')).toBe(target.colors.background.toLowerCase());
    await expect.poll(() => cssVar('--tenant-text')).toBe(target.colors.text.toLowerCase());

    await page.getByRole('button', { name: /Salva Modifiche/ }).click();
    await expect(page.getByText('Dati salvati!')).toBeVisible();

    const design = writes.find((w) => w.table.startsWith('tenant_design_settings'));
    expect(design, 'il tema non è stato inviato a tenant_design_settings').toBeTruthy();
    const payload = (Array.isArray(design!.body) ? design!.body[0] : design!.body) as {
      theme_config: { id: string; colors: Record<string, unknown> };
    };
    expect(payload.theme_config.id).toBe(target.id);
    // Applicare uno stile sostituisce TUTTI i colori del locale (vedi CLAUDE.md, Temi e Design Studio)
    expect(payload.theme_config.colors).toMatchObject({ ...target.colors });
  });
});
