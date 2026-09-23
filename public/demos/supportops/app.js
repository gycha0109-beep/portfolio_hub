const state={
  route:"dashboard",
  selectedTicket:"SUP-DEMO-018",
  knowledgeTrusted:false,
  tickets:[
    {no:"SUP-DEMO-018",subject:"API 인증 오류",product:"CloudDesk API",priority:"HIGH",status:"WAITING_REVIEW",team:"TECH_SUPPORT",sla:"2시간 14분"},
    {no:"SUP-DEMO-017",subject:"청구서 금액 문의",product:"CloudDesk Billing",priority:"NORMAL",status:"IN_PROGRESS",team:"BILLING_SUPPORT",sla:"6시간 42분"},
    {no:"SUP-DEMO-016",subject:"SSO 설정 방법",product:"CloudDesk",priority:"NORMAL",status:"WAITING_REVIEW",team:"CUSTOMER_SUCCESS",sla:"5시간 03분"},
    {no:"SUP-DEMO-015",subject:"서비스 접속 불가",product:"CloudDesk",priority:"CRITICAL",status:"IN_PROGRESS",team:"SRE",sla:"38분"},
    {no:"SUP-DEMO-014",subject:"API Key 재발급 문의",product:"CloudDesk API",priority:"HIGH",status:"IN_PROGRESS",team:"TECH_SUPPORT",sla:"1시간 20분"}
  ],
  audit:[
    ["06:03","SUP-DEMO-018","ai.analysis.claimed","Demo Administrator"],
    ["06:03","SUP-DEMO-018","ai.analysis.completed","SYSTEM"],
    ["05:58","-","knowledge.document.trust_changed","Demo Administrator"],
    ["05:44","SUP-DEMO-013","delivery.outbox.replayed","Demo Administrator"],
    ["05:43","SUP-DEMO-013","delivery.outbox.delivered","SYSTEM"]
  ]
};

const app=document.querySelector("#app");
const nav=[...document.querySelectorAll("[data-route]")];
const videoModal=document.querySelector("#demo-video-modal");
const demoVideo=document.querySelector("#demo-video");

function openDemoVideo(){
  if(!videoModal||!demoVideo) return;
  videoModal.classList.add("open");
  videoModal.setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");
  demoVideo.play().catch(()=>{});
}
function closeDemoVideo(){
  if(!videoModal||!demoVideo) return;
  demoVideo.pause();
  videoModal.classList.remove("open");
  videoModal.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
}
document.querySelector("#open-demo-video")?.addEventListener("click",openDemoVideo);
videoModal?.querySelectorAll("[data-close-demo-video]").forEach(el=>el.addEventListener("click",closeDemoVideo));
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&videoModal?.classList.contains("open")) closeDemoVideo();
});

function esc(v){return String(v).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]))}
const priorityLabels={LOW:"낮음",NORMAL:"보통",HIGH:"높음",CRITICAL:"긴급"};
const statusLabels={NEW:"접수됨",AI_PROCESSING:"AI 분석 중",WAITING_REVIEW:"검토 대기",IN_PROGRESS:"처리 중",WAITING_CUSTOMER:"고객 답변 대기",RESOLVED:"처리 완료",CLOSED:"종료",PENDING:"대기 중",PROCESSING:"발송 처리 중",DELIVERED:"발송 완료",FAILED:"발송 실패",DEAD:"최종 실패",ACTIVE:"사용 중",ARCHIVED:"보관됨"};
const teamLabels={TECH_SUPPORT:"기술 지원팀",BILLING_SUPPORT:"결제 지원팀",CUSTOMER_SUCCESS:"고객 지원팀",SUPPORT:"고객 지원팀",SECURITY:"보안팀",SRE:"서비스 운영팀"};
const categoryLabels={API_AUTHENTICATION:"API 인증",BILLING:"결제·요금",SERVICE_OUTAGE:"서비스 장애",HOW_TO:"사용 방법",ACCOUNT:"계정",SECURITY:"보안",OTHER:"기타"};
const trustLabels={TRUSTED_INTERNAL:"검증된 내부 자료",UNVERIFIED:"미검증"};
const auditLabels={"ai.analysis.claimed":"AI 분석 시작","ai.analysis.completed":"AI 분석 완료","knowledge.document.trust_changed":"자료 검증 상태 변경","delivery.outbox.replayed":"발송 다시 처리","delivery.outbox.delivered":"답변 발송 완료"};
function label(map,value){return map[value]??value}
function badge(value,kind=""){return `<span class="badge ${kind}">${esc(value)}</span>`}
function priorityBadge(p){return badge(label(priorityLabels,p),p==="CRITICAL"||p==="HIGH"?"high":"")}
function statusBadge(s){return badge(label(statusLabels,s),s==="DELIVERED"||s==="RESOLVED"?"good":s==="FAILED"||s==="DEAD"?"risk":"")}
function toast(message){const el=document.createElement("div");el.className="toast";el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),2200)}
function route(name){
  state.route=name;
  location.hash=name;
  render();
}
function header(eyebrow,title,sub){return `<div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="sub">${sub}</p>`}

function dashboard(){
  return header("운영 현황","고객지원 운영 현황","AI 답변 초안은 관련 자료 확인과 담당자 검토를 거친 뒤 처리됩니다. · 정적 포트폴리오 데모")+`
  <section class="grid kpis">
    <div class="card"><div class="kpi-label">처리 중 문의</div><div class="kpi-value">5</div></div>
    <div class="card"><div class="kpi-label">처리 기한 임박</div><div class="kpi-value">1</div></div>
    <div class="card"><div class="kpi-label">AI 초안 생성 비율</div><div class="kpi-value">83%</div></div>
    <div class="card"><div class="kpi-label">바로 승인 비율</div><div class="kpi-value">67%</div></div>
  </section>
  <section class="grid split">
    <div class="card">
      <h2>최근 고객 문의</h2>
      <div class="table-wrap"><table class="table"><thead><tr><th>문의 번호</th><th>문의</th><th>긴급도</th><th>상태</th><th>처리 기한</th></tr></thead>
      <tbody>${state.tickets.slice(0,4).map(t=>`<tr><td><button class="button link" data-ticket="${t.no}">${t.no}</button></td><td>${esc(t.subject)}</td><td>${priorityBadge(t.priority)}</td><td>${statusBadge(t.status)}</td><td>${t.sla}</td></tr>`).join("")}</tbody></table></div>
    </div>
    <div class="card">
      <h2>담당자 검토 결과</h2>
      <div class="funnel">
        <div class="funnel-row"><span>그대로 승인</span><div class="bar"><span style="width:67%"></span></div><strong>67%</strong></div>
        <div class="funnel-row"><span>수정 후 승인</span><div class="bar"><span style="width:17%"></span></div><strong>17%</strong></div>
        <div class="funnel-row"><span>반려</span><div class="bar"><span style="width:16%"></span></div><strong>16%</strong></div>
      </div>
      <div class="callout" style="margin-top:18px">운영 지표, 담당자 검토 결과, 자료 검색 품질, 발송 상태는 실제 서버 앱의 데이터에서 계산됩니다.</div>
    </div>
  </section>`;
}

function tickets(){
  return header("고객 문의 운영","문의 목록","긴급도, 처리 상태, 담당 팀과 처리 기한을 기준으로 고객 문의를 관리합니다.")+`
  <div class="card">
    <div class="controls">
      <input id="ticket-q" placeholder="문의 번호 또는 제목 검색">
      <select id="ticket-priority"><option value="">모든 긴급도</option><option value="CRITICAL">긴급</option><option value="HIGH">높음</option><option value="NORMAL">보통</option></select>
      <button class="button primary" id="ticket-filter">필터 적용</button>
    </div>
    <div id="ticket-table">${ticketTable(state.tickets)}</div>
  </div>`;
}
function ticketTable(rows){
  return `<div class="table-wrap"><table class="table"><thead><tr><th>문의 번호</th><th>문의</th><th>제품</th><th>긴급도</th><th>상태</th><th>담당 팀</th><th>처리 기한</th></tr></thead><tbody>
  ${rows.map(t=>`<tr><td><button class="button link" data-ticket="${t.no}">${t.no}</button></td><td>${esc(t.subject)}</td><td>${esc(t.product)}</td><td>${priorityBadge(t.priority)}</td><td>${statusBadge(t.status)}</td><td>${esc(label(teamLabels,t.team))}</td><td>${t.sla}</td></tr>`).join("")}
  </tbody></table></div>`;
}

function ticketDetail(){
  const t=state.tickets.find(x=>x.no===state.selectedTicket)||state.tickets[0];
  return header("문의 상세",t.no,`${t.subject} · ${t.product}`)+`
  <div class="detail-grid">
    <div class="stack">
      <div class="card"><h2>고객 문의</h2><p>기존 API key로 호출하면 401 Unauthorized가 반복됩니다. 인증 설정과 키 만료 여부를 확인하고 싶습니다.</p><div class="button-row">${priorityBadge(t.priority)} ${statusBadge(t.status)}</div></div>
      <div class="card"><h2>관련 자료</h2>
        <div class="source"><strong>API Authentication Guide · 관련도 96%</strong>401 Unauthorized가 반복되면 API Key 만료 여부와 Authorization 헤더 형식을 먼저 확인합니다.</div>
        <div class="source"><strong>API Rate Limit Guide · 관련도 61%</strong>Rate limit과 Retry-After 헤더 확인 절차를 안내합니다.</div>
      </div>
    </div>
    <div class="stack">
      <div class="card"><h2>AI 분석 결과</h2><table class="table"><tbody>
        <tr><th>문제 유형</th><td>${label(categoryLabels,"API_AUTHENTICATION")}</td></tr><tr><th>긴급도</th><td>${label(priorityLabels,"HIGH")}</td></tr>
        <tr><th>담당 팀</th><td>${label(teamLabels,"TECH_SUPPORT")}</td></tr><tr><th>판단 신뢰도</th><td>${badge("높음 · 91%","good")}</td></tr>
      </tbody></table></div>
      <div class="card"><h2>AI 답변 초안</h2>
        <p>API Key의 만료 여부와 Authorization 헤더 형식을 먼저 확인해 주세요. 문제가 계속되면 사용 중인 인증 방식과 오류 시각을 함께 전달해 주시면 추가 확인하겠습니다.</p>
        <div class="table-note">내부 자료를 바탕으로 작성 · 담당자 승인 필요 · 관련 자료 2건</div>
        <div class="button-row"><button class="button danger" data-demo-action="반려 처리 데모">반려</button><button class="button" data-demo-action="수정 후 승인 데모">수정 후 승인</button><button class="button primary" data-demo-action="승인 데모">승인</button></div>
      </div>
    </div>
  </div>`;
}

function knowledge(){
  const trust=state.knowledgeTrusted?"TRUSTED_INTERNAL":"UNVERIFIED";
  return header("내부 자료 관리","자료 보관함","검증된 내부 자료만 AI 답변의 근거로 사용합니다.")+`
  <div class="grid split">
    <div class="card"><h2>관련 자료 검색 테스트</h2>
      <div class="controls"><input value="API 호출 시 401 Unauthorized"><select><option value="API_AUTHENTICATION">API 인증</option></select><button class="button primary" data-demo-action="관련 자료 검색 데모">자료 검색 테스트</button></div>
      <div class="source"><strong>#1 API Authentication Guide · 관련도 96.0%</strong>401 Unauthorized가 반복되면 API Key 만료 여부와 Authorization 헤더 형식을 먼저 확인합니다.</div>
    </div>
    <div class="card"><h2>자료 검증 상태</h2>
      <p class="sub">미검증 자료는 저장·검토할 수 있지만 AI 답변 근거에는 사용되지 않습니다.</p>
      <div class="source"><strong>E2E Unverified Injection Note</strong><div class="button-row">${badge(label(trustLabels,trust),state.knowledgeTrusted?"good":"risk")}</div></div>
      <button class="button primary" id="toggle-trust">${state.knowledgeTrusted?"미검증으로 전환":"검증 자료로 전환"}</button>
    </div>
  </div>
  <div class="card" style="margin-top:16px"><h2>자료 문서</h2>
    <div class="table-wrap"><table class="table"><thead><tr><th>문서</th><th>버전</th><th>문제 유형</th><th>검증 상태</th><th>검색 단위</th><th>상태</th></tr></thead><tbody>
      <tr><td>API Authentication Guide</td><td>v2</td><td>${label(categoryLabels,"API_AUTHENTICATION")}</td><td>${badge(label(trustLabels,"TRUSTED_INTERNAL"),"good")}</td><td>3</td><td>${statusBadge("ACTIVE")}</td></tr>
      <tr><td>API Authentication Guide</td><td>v1</td><td>${label(categoryLabels,"API_AUTHENTICATION")}</td><td>${badge(label(trustLabels,"TRUSTED_INTERNAL"),"good")}</td><td>2</td><td>${statusBadge("ARCHIVED")}</td></tr>
      <tr><td>E2E Unverified Injection Note</td><td>v1</td><td>${label(categoryLabels,"API_AUTHENTICATION")}</td><td>${badge(label(trustLabels,trust),state.knowledgeTrusted?"good":"risk")}</td><td>1</td><td>${statusBadge("ACTIVE")}</td></tr>
    </tbody></table></div>
  </div>`;
}

function evaluation(){
  return header("AI 품질 현황","AI 평가","AI 답변의 승인·수정 결과와 관련 자료 검색 품질, AI 서비스 실행 현황을 확인합니다.")+`
  <section class="grid kpis">
    <div class="card"><div class="kpi-label">분석 건수</div><div class="kpi-value">12</div></div>
    <div class="card"><div class="kpi-label">승인 비율</div><div class="kpi-value">67%</div></div>
    <div class="card"><div class="kpi-label">수정 비율</div><div class="kpi-value">17%</div></div>
    <div class="card"><div class="kpi-label">상위 전달 비율</div><div class="kpi-value">8%</div></div>
  </section>
  <section class="grid split">
    <div class="card"><h2>자료 검색 정확도 평가</h2><table class="table"><tbody>
      <tr><th>평가 기준</th><td>golden-v2</td></tr><tr><th>검색 서비스 / 모델</th><td>테스트용 AI / category-basis-v1</td></tr>
      <tr><th>평가 문항</th><td>5</td></tr><tr><th>첫 번째 결과 적중률</th><td>100.0%</td></tr><tr><th>상위 결과 정확도</th><td>1.000</td></tr><tr><th>통과 여부</th><td>${badge("통과","good")}</td></tr>
    </tbody></table></div>
    <div class="card"><h2>AI 서비스별 실행 현황</h2><table class="table"><thead><tr><th>AI 서비스</th><th>모델</th><th>설정 버전</th><th>실행 건수</th></tr></thead><tbody>
      <tr><td>테스트용 AI</td><td>mock-v1</td><td>support-analysis-v1</td><td>12</td></tr>
    </tbody></table><p class="sub" style="margin-top:12px">실제 OpenAI 연결 검증은 별도 보호 환경에서 진행합니다.</p></div>
  </section>`;
}

function delivery(){
  return header("답변 발송 관리","발송 대기 목록","승인된 답변은 발송 대기 목록에 등록된 뒤 자동 처리됩니다.")+`
  <section class="grid kpis">
    <div class="card"><div class="kpi-label">대기 중</div><div class="kpi-value">1</div></div>
    <div class="card"><div class="kpi-label">발송 처리 중</div><div class="kpi-value">0</div></div>
    <div class="card"><div class="kpi-label">발송 완료</div><div class="kpi-value">7</div></div>
    <div class="card"><div class="kpi-label">발송 실패</div><div class="kpi-value">1</div></div>
  </section>
  <div class="card" style="margin-top:16px"><h2>답변 발송 현황</h2><div class="table-wrap"><table class="table"><thead><tr><th>문의 번호</th><th>발송 채널</th><th>수신처</th><th>상태</th><th>발송 서비스</th><th>시도 횟수</th><th>작업</th></tr></thead><tbody>
    <tr><td>SUP-DEMO-018</td><td>이메일</td><td>ac***@example.invalid</td><td>${statusBadge("PENDING")}</td><td>-</td><td>0 / 5</td><td>-</td></tr>
    <tr><td>SUP-DEMO-013</td><td>이메일</td><td>sy*******@example.invalid</td><td>${statusBadge("DEAD")}</td><td>모의 발송</td><td>5 / 5</td><td><button class="button" data-demo-action="발송 다시 처리 데모">다시 처리</button></td></tr>
    <tr><td>SUP-DEMO-011</td><td>이메일</td><td>sy*******@example.invalid</td><td>${statusBadge("DELIVERED")}</td><td>모의 발송</td><td>1 / 5</td><td>-</td></tr>
  </tbody></table></div>
  <p class="sub" style="margin-top:14px">정적 데모에서는 실제 메일을 보내지 않습니다. 실제 이메일 연동은 별도 보호 환경과 안전한 수신 주소로 검증합니다.</p></div>`;
}

function audit(){
  return header("처리 기록","처리 기록","AI 분석, 담당자 검토, 내부 자료 변경과 답변 발송 처리 과정을 확인합니다.")+`
  <div class="card"><div class="audit-list">${state.audit.map(a=>`<div class="audit-entry"><div class="audit-meta">2026-09-23 ${a[0]}</div><div><div class="audit-event">${esc(label(auditLabels,a[2]))}</div><div class="audit-meta">${a[1]}</div></div><div class="audit-meta">${esc(a[3]==="SYSTEM"?"시스템":a[3]==="Demo Administrator"?"데모 관리자":a[3])}</div></div>`).join("")}</div></div>`;
}

function render(){
  nav.forEach(b=>b.classList.toggle("active",b.dataset.route===state.route));
  const views={dashboard,tickets,ticket:ticketDetail,knowledge,evaluation,delivery,audit};
  app.innerHTML=(views[state.route]||dashboard)();
  bind();
}
function bind(){
  app.querySelectorAll("[data-ticket]").forEach(el=>el.addEventListener("click",()=>{state.selectedTicket=el.dataset.ticket;state.route="ticket";location.hash="ticket";render()}));
  app.querySelectorAll("[data-demo-action]").forEach(el=>el.addEventListener("click",()=>toast(el.dataset.demoAction+" — 정적 UI에서만 시뮬레이션됩니다.")));
  const filter=app.querySelector("#ticket-filter");
  if(filter) filter.addEventListener("click",()=>{
    const q=app.querySelector("#ticket-q").value.toLowerCase();
    const p=app.querySelector("#ticket-priority").value;
    const rows=state.tickets.filter(t=>(!q||(t.no+" "+t.subject).toLowerCase().includes(q))&&(!p||t.priority===p));
    app.querySelector("#ticket-table").innerHTML=ticketTable(rows);
    bind();
  });
  const trust=app.querySelector("#toggle-trust");
  if(trust) trust.addEventListener("click",()=>{
    state.knowledgeTrusted=!state.knowledgeTrusted;
    state.audit.unshift(["06:22","-","knowledge.document.trust_changed","Demo Administrator"]);
    toast(state.knowledgeTrusted?"검증된 내부 자료로 전환했습니다.":"미검증 자료로 변경했습니다.");
    render();
  });
}
nav.forEach(b=>b.addEventListener("click",()=>route(b.dataset.route)));
const initial=location.hash.replace("#","");
if(["dashboard","tickets","ticket","knowledge","evaluation","delivery","audit"].includes(initial)) state.route=initial;
render();
