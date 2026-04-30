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

const BASE = 'http://localhost:4174';

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

await shot(`${BASE}/start`, '01-start', 'text=Копейка');
await shot(`${BASE}/`, '02-main-expenses', 'text=Апрель');

// Switch to income tab if available
try {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const incomeBtn = await page.$('button:has-text("доходы")');
  if (incomeBtn) {
    await incomeBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/03-main-income.png`, fullPage: false });
    console.log('  ✓ 03-main-income.png');
  }
} catch (e) {
  console.log('  ⚠ income tab not found');
}

await shot(`${BASE}/uikit`, '04-uikit-top', 'text=UI Kit');

// Scroll down for more uikit
try {
  await page.goto(`${BASE}/uikit`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/05-uikit-components.png`, fullPage: false });
  console.log('  ✓ 05-uikit-components.png');

  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/06-uikit-charts.png`, fullPage: false });
  console.log('  ✓ 06-uikit-charts.png');
} catch (e) {
  console.log('  ⚠ uikit scroll failed');
}

await browser.close();
console.log('Готово!');
