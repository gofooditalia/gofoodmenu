#!/usr/bin/env node
// Controllo di accessibilità (WCAG 2.2 A/AA) con axe-core su pagine reali, viste come da telefono.
// Uso: node axe-scan.mjs <url> [<url> ...] [--json out.json] [--screens dir]
// Richiede i pacchetti `playwright` e `axe-core` (vedi SKILL.md per dove installarli).
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(path.join(process.cwd(), 'noop.js'));
const { chromium } = require('playwright');
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return null;
  const [, value] = args.splice(i, 2);
  return value;
};
const jsonOut = flag('--json');
const screensDir = flag('--screens');
const urls = args;
if (!urls.length) {
  console.error('Uso: node axe-scan.mjs <url> [<url> ...] [--json out.json] [--screens dir]');
  process.exit(2);
}

const executablePath = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const browser = await chromium.launch({ executablePath });
// Telefono medio: è da lì che i clienti aprono il menu col QR
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'it-IT',
});

const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const results = [];
for (const url of urls) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  // Screenshot prima di scorrere: dopo lo scorrimento la pagina può risultare vuota nell'immagine
  if (screensDir) {
    fs.mkdirSync(screensDir, { recursive: true });
    const name = new URL(url).pathname.replace(/\W+/g, '_') || 'home';
    await page.screenshot({ path: path.join(screensDir, `${name}.png`) });
  }
  // Scorre fino in fondo per far caricare immagini e sezioni pigre
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
  await page.addScriptTag({ content: axeSource });
  const r = await page.evaluate(() =>
    window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    })
  );
  const violations = r.violations
    .map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      tags: v.tags.filter((t) => /^wcag\d/.test(t)),
      helpUrl: v.helpUrl,
      count: v.nodes.length,
      examples: v.nodes.slice(0, 3).map((n) => ({ target: n.target.join(' '), html: n.html.slice(0, 160), summary: n.failureSummary })),
    }))
    .sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact] || b.count - a.count);
  results.push({ url, violations, passes: r.passes.length, incomplete: r.incomplete.length });
  await page.close();

  console.log(`\n=== ${url}`);
  console.log(`Regole superate: ${r.passes.length} · da verificare a mano: ${r.incomplete.length} · violazioni: ${violations.length}`);
  for (const v of violations) {
    console.log(`\n[${v.impact}] ${v.id} (${v.count} elementi) ${v.tags.join(', ')}`);
    console.log(`  ${v.help}`);
    for (const e of v.examples) console.log(`  - ${e.target}\n    ${e.html}`);
  }
}
await browser.close();
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(results, null, 2));
