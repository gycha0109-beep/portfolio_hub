import { chromium } from "playwright";

const url=process.env.DEMO_BASE_URL||"http://127.0.0.1:4173/demos/careledger/index.html";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800}});

const expectText=async(selector,expected)=>{
  await page.waitForFunction(({selector,expected})=>document.querySelector(selector)?.textContent?.trim()===expected,{selector,expected});
};

try{
  await page.goto(url,{waitUntil:"networkidle"});
  await expectText("#transactionMetric","3");
  await expectText("#reviewMetric","1");
  await expectText("#totalMetric","₩286,666");

  await page.locator("#addTxnBtn").click();
  await page.locator("#vendorInput").fill("카카오T");
  await page.locator("#memoInput").fill("출장 교통");
  await page.locator("#amountInput").fill("18000");
  await page.locator("#transactionForm").evaluate(form=>form.requestSubmit());
  await expectText("#transactionMetric","4");
  await expectText("#totalMetric","₩304,666");

  await page.locator("#resetBtn").click();
  await expectText("#transactionMetric","3");

  const csv="거래처,적요,금액\n한국전력공사,전기요금,10000\n쿠팡,업무용 구매,20000\n오피스상사,사무용품,30000\n";
  await page.locator("#fileInput").setInputFiles({
    name:"careledger-smoke.csv",
    mimeType:"text/csv",
    buffer:Buffer.from(csv,"utf8")
  });
  await expectText("#transactionMetric","3");
  await expectText("#reviewMetric","1");
  await expectText("#totalMetric","₩60,000");

  await page.locator("#reviewCategory").selectOption({label:"사무비"});
  await page.locator("#correctBtn").click();
  await expectText("#reviewMetric","0");
  await page.locator("#approveBtn").click();
  await page.locator("#transmitBtn").click();
  await expectText("#varianceMetric","₩30,000");
  await page.locator("#retryBtn").click();
  await page.locator("#reconcileBtn").click();
  await expectText("#varianceMetric","₩0");

  await page.locator('[data-view="history"]').click();
  const historyCount=await page.locator(".transfer-history-row").count();
  if(historyCount!==3)throw new Error("expected 3 transfer history rows, got "+historyCount);
  await expectText("#historyStatus","처리 완료");

  console.log("CareLedger sandbox smoke test passed");
}finally{
  await browser.close();
}
