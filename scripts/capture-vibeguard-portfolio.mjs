import { chromium } from "playwright";
import fs from "node:fs/promises";

const url = "https://porthub-neon.vercel.app/demo/vibeguard/index.html";
const out = "artifacts/vibeguard-wishket";
await fs.mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1.25,
  colorScheme: "light",
});
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.evaluate(() => document.fonts.ready);

const sections = page.locator("main > section");

async function shotSection(index, name) {
  const el = sections.nth(index);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await el.screenshot({ path: `${out}/${name}`, animations: "disabled" });
}

async function shotRange(startIndex, endIndex, name, pad = 8) {
  const a = await sections.nth(startIndex).boundingBox();
  const z = await sections.nth(endIndex).boundingBox();
  if (!a || !z) throw new Error("section bounds unavailable");
  const top = Math.max(0, a.y - pad);
  const bottom = z.y + z.height + pad;
  await page.screenshot({
    path: `${out}/${name}`,
    animations: "disabled",
    clip: { x: 0, y: top, width: 1440, height: bottom - top }
  });
}

await shotSection(0, "01_vibeguard_framevote_hero.png");
await shotSection(1, "02_core_issues_before_after.png");
await shotRange(2, 4, "03_qa_results_verification.png", 10);

await browser.close();
console.log("Captured 3 Wishket portfolio images.");
