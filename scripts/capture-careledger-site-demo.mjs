import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const url = process.env.DEMO_BASE_URL || "http://127.0.0.1:4173/demos/careledger/index.html";
const out = path.resolve("artifacts/careledger-video");
const raw = path.join(out, "raw");
await fs.mkdir(raw, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 810 },
  recordVideo: { dir: raw, size: { width: 1440, height: 810 } }
});
const page = await context.newPage();
const video = page.video();
const wait = ms => page.waitForTimeout(ms);

await page.goto(url, { waitUntil: "networkidle" });

async function banner(title, detail, ms = 4200) {
  await page.evaluate(({ title, detail }) => {
    document.getElementById("portfolio-caption")?.remove();
    const el = document.createElement("div");
    el.id = "portfolio-caption";
    el.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;width:min(920px,calc(100vw - 80px));padding:16px 22px;border-radius:14px;background:rgba(15,38,34,.96);color:white;text-align:center;font-family:system-ui,sans-serif;box-shadow:0 18px 50px rgba(15,23,42,.25)";
    const h = document.createElement("strong");
    h.style.cssText = "display:block;font-size:22px;line-height:1.35";
    h.textContent = title;
    el.appendChild(h);
    const p = document.createElement("span");
    p.style.cssText = "display:block;margin-top:6px;color:#cde3de;font-size:14px;line-height:1.5";
    p.textContent = detail;
    el.appendChild(p);
    document.body.appendChild(el);
  }, { title, detail });
  await wait(ms);
  await page.evaluate(() => document.getElementById("portfolio-caption")?.remove());
}

async function focus(selector) {
  const loc = page.locator(selector);
  await loc.scrollIntoViewIfNeeded();
  await loc.evaluate(el => { el.style.outline = "3px solid #2f8f83"; el.style.outlineOffset = "4px"; });
  await wait(900);
  await loc.evaluate(el => { el.style.outline = ""; el.style.outlineOffset = ""; });
}

await banner("CareLedger Bridge", "은행 거래내역부터 전송 결과 확인까지 전체 흐름을 시연합니다.", 5000);
await focus(".workflow");
await banner("Excel 불러오기 → 검토 → 승인 → 전송 → 결과 확인", "사람이 확인해야 할 거래만 검토 대상으로 남깁니다.");

await focus(".transactions");
await banner("애매한 거래 1건만 담당자가 확인", "전기요금과 사무용품은 자동분류되고 쿠팡 거래만 확인 대상으로 남습니다.");
await page.locator("#correctBtn").click();
await banner("쿠팡 거래를 사무비로 수정", "수정 내용은 처리 이력에 남고 전송 전 점검이 통과됩니다.");

await focus(".control");
await banner("전송 전 안전장치 확인", "계정 연결, 승인 후 변경 여부, 승인자·전송자 분리, 중복 전송 방지를 확인합니다.");
await page.locator("#approveBtn").click();
await banner("전송 승인 완료", "승인 시점의 내용을 고정해 승인 후 임의 변경을 막습니다.");

await page.locator("#transmitBtn").click();
await focus(".metrics");
await banner("부분 실패: 미처리 금액 33,333원", "성공한 2건은 유지하고 실패한 1건만 재처리 대상으로 남깁니다.", 4800);

await focus(".event-panel");
await banner("실패한 1건만 다시 전송", "전체를 다시 보내지 않고 최초 전송 식별값을 유지합니다.");
await page.locator("#retryBtn").click();
await banner("재전송 성공", "부분 실패 건만 안전하게 다시 처리했습니다.");

await page.locator("#reconcileBtn").click();
await focus(".metrics");
await banner("최종 금액 차이 0원", "원장과 전송 결과가 일치하는지 마지막으로 확인합니다.", 4800);

await page.locator('[data-view="history"]').click();
await focus(".transfer-history");
await banner("전송 및 재시도 이력", "1차 전송의 부분 실패, 실패 1건 재전송, 최종 금액 차이 0원까지 실제 수행 기록을 확인합니다.");
await page.locator('[data-view="ops"]').click();
await banner("자동 복구 운영 상태", "응답 지연과 미처리 건을 감시해 중복 전송 위험을 줄입니다.", 4600);

await banner("수기 입력을 검토 가능한 자동화 흐름으로", "실제 희망이음 운영 시스템이 아닌 독립 테스트 연동 환경의 포트폴리오 시연입니다.", 5200);

await context.close();
if (!video) throw new Error("video unavailable");
await video.saveAs(path.join(out, "careledger-demo.webm"));
await browser.close();
console.log("careledger demo captured");
