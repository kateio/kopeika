import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = 'docs/design/v1-screens';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
});
const page = await context.newPage();

const BASE = 'http://localhost:5173';

async function shot(url, name, waitFor) {
  await page.goto(url, { waitUntil: 'networkidle' });
  if (waitFor) {
    await page.waitForSelector(waitFor, { timeout: 5000 }).catch(() => {});
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

console.log('Снимаю скриншоты...');

// 01 — Start screen
await shot(`${BASE}/start`, '01-start', 'text=Копейка');

// 02 — Main / expenses
await shot(`${BASE}/`, '02-main-expenses', 'text=Апрель');

// 03 — Main / income
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const incomeBtn = await page.$('button:has-text("доходы")');
if (incomeBtn) {
  await incomeBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/03-main-income.png`, fullPage: false });
  console.log('  ✓ 03-main-income.png');
}

// 04 — UIKit top
await shot(`${BASE}/uikit`, '04-uikit-top', 'text=UI Kit');

// 05 — UIKit components (scroll down)
await page.goto(`${BASE}/uikit`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.evaluate(() => window.scrollTo(0, 1200));
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/05-uikit-components.png`, fullPage: false });
console.log('  ✓ 05-uikit-components.png');

// 06 — UIKit charts (scroll more)
await page.evaluate(() => window.scrollTo(0, 3000));
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/06-uikit-charts.png`, fullPage: false });
console.log('  ✓ 06-uikit-charts.png');

// 07 — Category modal open
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
// Click the first category card to open the modal
const catButton = await page.$('button:has-text("еда")');
if (catButton) {
  await catButton.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/07-category-modal-open.png`, fullPage: false });
  console.log('  ✓ 07-category-modal-open.png');
}

await browser.close();
console.log('Готово!');
