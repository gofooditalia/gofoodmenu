import { test as base } from '@playwright/test';

// PNG trasparente 1×1: i test non controllano le foto
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

// Ogni esecuzione parte con la cache immagini vuota: senza questo, scorrere i menu
// scaricherebbe da Supabase centinaia di foto dei piatti (banda sprecata, risposte 429)
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/\/_next\/image\?|\/storage\/v1\/object\//, (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL })
    );
    await use(page);
  },
});

export { expect } from '@playwright/test';
