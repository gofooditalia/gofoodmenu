import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { LOCALI_REALI } from './locali';
import { INFO_PAGE_SLUGS } from '../src/lib/tenant-info';

// Stesse regole della skill a11y-audit: WCAG 2.0/2.1/2.2 livello A e AA
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function violazioni(page: Page) {
  // Scorre fino in fondo per far caricare immagini e sezioni pigre
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  // Tornando in cima la barra categorie cambia la categoria attiva: axe misurerebbe i colori a metà della
  // transizione del pulsante (falso contrasto insufficiente). Si aspetta che le animazioni CSS finiscano.
  // Le animazioni senza fine (es. un'icona di caricamento) non si aspettano.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  // Messaggio leggibile: regola, quanti elementi, primo esempio
  return violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} elementi): ${v.help} → ${v.nodes[0]?.target.join(' ')}`);
}

for (const slug of LOCALI_REALI) {
  test(`${slug}: menu senza violazioni WCAG`, async ({ page }) => {
    await page.goto(`/${slug}`);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await violazioni(page)).toEqual([]);
  });

  test(`${slug}: allergeni senza violazioni WCAG`, async ({ page }) => {
    await page.goto(`/${slug}/allergeni`);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await violazioni(page)).toEqual([]);
  });
}

for (const slug of INFO_PAGE_SLUGS) {
  test(`${slug}: scheda contatti senza violazioni WCAG`, async ({ page }) => {
    await page.goto(`/${slug}/info`);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await violazioni(page)).toEqual([]);
  });
}
