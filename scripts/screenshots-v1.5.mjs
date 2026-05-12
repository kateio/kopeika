import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = 'docs/design/v1.5-screens';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  hasTouch: true,
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

// 02 — Main default (expenses, no filter, InputBar fixed at bottom)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await shot('02-main-default');

// 03 — Main with multi-select filter (tap 2 categories → multiple chips visible)
const firstCat = await page.$('button:has-text("Еда")');
if (firstCat) {
  await firstCat.click();
  await page.waitForTimeout(300);
}
const secondCat = await page.$('button:has-text("Транспорт")');
if (!secondCat) {
  // Try another category name
  const altCat = await page.$('button:has-text("Развлечения")');
  if (altCat) {
    await altCat.click();
    await page.waitForTimeout(300);
  }
} else {
  await secondCat.click();
  await page.waitForTimeout(300);
}
await shot('03-main-with-filter');
// Reset filter
const resetBtn = await page.$('button:has-text("Сбросить")');
if (resetBtn) await resetBtn.click();
else {
  // Close chips individually
  const chipCloses = await page.$$('.shrink-0 .rounded-full button');
  for (const btn of chipCloses) await btn.click();
}

// 04 — Summary sheet (rounded corners, scroll locked)
await page.waitForTimeout(300);
const summaryBtn = await page.$('button:has(svg path[d*="M18 20V10"])');
if (summaryBtn) {
  await summaryBtn.click();
  await shot('04-summary-sheet');
  const overlay = await page.$('.fixed.inset-0.z-\\[100\\]');
  if (overlay) await overlay.click({ position: { x: 195, y: 50 } });
  await page.waitForTimeout(400);
}

// 05 — Transaction editor (rounded fields and buttons)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const scrollContainer = await page.$('.flex-1.overflow-auto');
if (scrollContainer) await scrollContainer.evaluate(el => el.scrollTo(0, 600));
await page.waitForTimeout(300);
const txCard = await page.$('button:has-text("Пятёрочка")');
if (txCard) {
  await txCard.click();
  await shot('05-edit-transaction');
  const closeBtn = await page.$('.fixed.inset-0 button:has(svg path[d*="M6 6l12 12"])');
  if (closeBtn) await closeBtn.click();
  await page.waitForTimeout(400);
}

// 06 — Swipe actions (simulate touch swipe to reveal delete button)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const scrollArea = await page.$('.flex-1.overflow-auto');
if (scrollArea) await scrollArea.evaluate(el => el.scrollTo(0, 400));
await page.waitForTimeout(300);
// Find a transaction row to swipe
const txRow = await page.$('.rounded-card.bg-card .relative.overflow-hidden');
if (txRow) {
  const box = await txRow.boundingBox();
  if (box) {
    // Swipe left ~40% to reveal delete button
    await page.touchscreen.tap(box.x + box.width - 30, box.y + box.height / 2);
    await page.waitForTimeout(100);
    const startX = box.x + box.width - 30;
    const startY = box.y + box.height / 2;
    await page.touchscreen.tap(startX, startY);
    // Manual touch sequence for swipe
    await page.evaluate(({ x, y, endX }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return;
      const touch = new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], changedTouches: [touch], bubbles: true }));
      const moveTouch = new Touch({ identifier: 1, target: el, clientX: endX, clientY: y });
      el.dispatchEvent(new TouchEvent('touchmove', { touches: [moveTouch], changedTouches: [moveTouch], bubbles: true }));
      const endTouch = new Touch({ identifier: 1, target: el, clientX: endX, clientY: y });
      el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [endTouch], bubbles: true }));
    }, { x: startX, y: startY, endX: startX - 150 });
    await page.waitForTimeout(400);
  }
}
await shot('06-swipe-actions');

// 07 — Settings main screen (rounded corners)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const avatarBtn = await page.$('button:has-text("К")');
if (avatarBtn) {
  await avatarBtn.click();
  await page.waitForTimeout(400);
  await shot('07-settings');
}

// 08 — Settings → Categories list (nested sub-screen)
const catMenuItem = await page.$('.fixed.inset-0 button:has-text("Категории")');
if (catMenuItem) {
  await catMenuItem.click();
  await page.waitForTimeout(400);
  await shot('08-settings-categories-list');
}

// 09 — Settings → Category edit (tap first category)
const firstEditCat = await page.$('.fixed.inset-0 .rounded-card button:has-text("Еда")');
if (firstEditCat) {
  await firstEditCat.click();
  await page.waitForTimeout(400);
  await shot('09-settings-category-edit');
}

// 10 — Emoji picker open
const emojiField = await page.$('.fixed.inset-0 button:has-text("Выбрать эмодзи")');
if (emojiField) {
  await emojiField.click();
  await page.waitForTimeout(800);
  await shot('10-emoji-picker');
}

// Close settings
const closeSettings = await page.$('.fixed.inset-0 button:has(svg path[d*="M6 6l12 12"])');
if (closeSettings) await closeSettings.click();
await page.waitForTimeout(400);

// 11 — UIKit
await page.goto(`${BASE}/uikit`, { waitUntil: 'networkidle' });
await shot('11-uikit-updated');

// 12 — Toast (trigger by adding transaction)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const input = await page.$('input[placeholder]');
if (input) {
  await input.fill('еда 500');
  await page.waitForTimeout(200);
  const sendBtn = await page.$('button:has(svg path[d*="M5 12l14"])');
  if (sendBtn) await sendBtn.click();
  await page.waitForTimeout(400);
  await shot('12-toast');
}

// 13 — Swipe commit zone (~80%)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const scrollArea2 = await page.$('.flex-1.overflow-auto');
if (scrollArea2) await scrollArea2.evaluate(el => el.scrollTo(0, 400));
await page.waitForTimeout(300);
const txRow2 = await page.$('.rounded-card.bg-card .relative.overflow-hidden');
if (txRow2) {
  const box2 = await txRow2.boundingBox();
  if (box2) {
    const sx = box2.x + box2.width - 30;
    const sy = box2.y + box2.height / 2;
    await page.evaluate(({ x, y, endX }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return;
      const touch = new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], changedTouches: [touch], bubbles: true }));
      const moveTouch = new Touch({ identifier: 1, target: el, clientX: endX, clientY: y });
      el.dispatchEvent(new TouchEvent('touchmove', { touches: [moveTouch], changedTouches: [moveTouch], bubbles: true }));
    }, { x: sx, y: sy, endX: sx - 280 });
    await page.waitForTimeout(400);
    await shot('13-swipe-commit-zone');
    // Release
    await page.evaluate(({ x, y, endX }) => {
      const el = document.elementFromPoint(endX, y);
      if (!el) return;
      const endTouch = new Touch({ identifier: 1, target: el, clientX: endX, clientY: y });
      el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [endTouch], bubbles: true }));
    }, { x: sx, y: sy, endX: sx - 280 });
  }
}

await browser.close();
console.log('Готово!');
