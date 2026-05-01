import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = 'docs/design/v1.5-screens';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
});
const page = await context.newPage();
const BASE = 'http://localhost:5173';

async function shot(name) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

console.log('Снимаю скриншоты v1.5...');

// 01 — Start screen
await page.goto(`${BASE}/start`, { waitUntil: 'networkidle' });
await shot('01-start');

// 02 — Main default (expenses, no filter)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await shot('02-main-default');

// 03 — Main with drill-down filter (tap first category)
const firstCat = await page.$('button:has-text("Еда")');
if (firstCat) {
  await firstCat.click();
  await shot('03-main-with-filter');
  // Reset filter
  const chip = await page.$('button:has-text("Еда") >> xpath=ancestor::div[contains(@class,"rounded-full")]//button');
  if (chip) await chip.click();
  else {
    const resetCat = await page.$('button:has-text("Еда")');
    if (resetCat) await resetCat.click();
  }
}

// 04 — Summary sheet
await page.waitForTimeout(300);
const summaryBtn = await page.$('button:has(svg path[d*="M18 20V10"])');
if (summaryBtn) {
  await summaryBtn.click();
  await shot('04-summary-sheet');
  // Close
  const overlay = await page.$('.fixed.inset-0.z-\\[100\\]');
  if (overlay) await overlay.click({ position: { x: 195, y: 50 } });
  await page.waitForTimeout(400);
}

// 05 — Transaction editor (tap first transaction)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
// Scroll to transactions
await page.evaluate(() => window.scrollTo(0, 600));
await page.waitForTimeout(300);
const txCard = await page.$('button:has-text("Пятёрочка")');
if (txCard) {
  await txCard.click();
  await shot('05-edit-transaction');
  // Close editor
  const closeBtn = await page.$('.fixed.inset-0 button:has(svg path[d*="M6 6l12 12"])');
  if (closeBtn) await closeBtn.click();
  await page.waitForTimeout(400);
}

// 06 — Swipe actions (hard to screenshot, we'll just show the list)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, 600));
await page.waitForTimeout(500);
await shot('06-swipe-actions');

// 07 — Settings
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const avatarBtn = await page.$('button:has-text("К")');
if (avatarBtn) {
  await avatarBtn.click();
  await shot('07-settings');
}

// 08 — Settings categories (scroll down in settings)
await page.waitForTimeout(300);
await page.evaluate(() => {
  const el = document.querySelector('.fixed.inset-0 .overflow-auto');
  if (el) el.scrollTo(0, 300);
});
await shot('08-settings-categories');

// Close settings
const closeSettings = await page.$('.fixed.inset-0 button:has(svg path[d*="M6 6l12 12"])');
if (closeSettings) await closeSettings.click();
await page.waitForTimeout(400);

// 09 — UIKit
await page.goto(`${BASE}/uikit`, { waitUntil: 'networkidle' });
await shot('09-uikit-updated');

// 10 — Toast (add a transaction to trigger toast)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const input = await page.$('input[placeholder]');
if (input) {
  await input.fill('еда 500');
  await page.waitForTimeout(200);
  const sendBtn = await page.$('button:has(svg path[d*="M5 12l14"])');
  if (sendBtn) await sendBtn.click();
  await page.waitForTimeout(400);
  await shot('10-toast');
}

await browser.close();
console.log('Готово!');
