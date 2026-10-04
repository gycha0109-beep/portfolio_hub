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

async function shotBoard(indexes, name) {
  await page.evaluate((ids) => {
    const old = document.getElementById("portfolio-capture-board");
    old?.remove();
    const board = document.createElement("div");
    board.id = "portfolio-capture-board";
    board.style.cssText = "width:1180px;margin:0;padding:0 0 20px;background:#f6f7fb;color:#172033;";
    const source = [...document.querySelectorAll("main > section")];
    for (const id of ids) board.appendChild(source[id].cloneNode(true));
    document.body.appendChild(board);
  }, indexes);
  const board = page.locator("#portfolio-capture-board");
  await board.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await board.screenshot({ path: `${out}/${name}`, animations: "disabled" });
  await page.locator("#portfolio-capture-board").evaluate(el => el.remove());
}

await shotSection(0, "01_vibeguard_framevote_hero.png");
await shotSection(1, "02_core_issues_before_after.png");
await shotBoard([2, 3, 4], "03_qa_results_verification.png");

await browser.close();
console.log("Captured 3 Wishket portfolio images.");
