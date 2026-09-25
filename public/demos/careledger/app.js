const $=(id)=>document.getElementById(id);
const categories=["공공요금 · 전기료","소모품비","사무비","여비교통비","회의비","복리후생비","통신비","수선비","기타"];
const sampleTransactions=[
  {vendor:"한국전력공사",memo:"전기요금",amount:181111},
  {vendor:"쿠팡",memo:"업무용 구매",amount:72222},
  {vendor:"오피스상사",memo:"사무용품",amount:33333}
];
const state={
  transactions:[],
  sourceLabel:"",
  approved:false,
  transmitted:false,
  retried:false,
  reconciled:false,
  failedIds:[],
  approvedSnapshot:[],
  nextId:1
};
window.__careledgerState=state;

const money=(value)=>"₩"+Math.round(Number(value)||0).toLocaleString("ko-KR");
const formatTime=()=>new Date().toLocaleTimeString("ko-KR",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});
const totalAmount=()=>state.transactions.reduce((sum,txn)=>sum+txn.amount,0);
const pendingTransactions=()=>state.transactions.filter(txn=>txn.needsReview);
const create=(tag,className,text)=>{
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
};
const normalizeText=(value)=>String(value??"").trim();
const normalizeAmount=(value)=>{
  if(typeof value==="number")return Math.abs(Math.round(value));
  const cleaned=String(value??"").replace(/[₩원,\s]/g,"").replace(/[^0-9.-]/g,"");
  const parsed=Number(cleaned);
  return Number.isFinite(parsed)?Math.abs(Math.round(parsed)):0;
};

function classify(vendor,memo){
  const text=(vendor+" "+memo).toLowerCase();
  if(/한국전력|전기|전력/.test(text))return {category:"공공요금 · 전기료",needsReview:false,reason:"전기요금 관련 거래로 자동분류했습니다."};
  if(/오피스|문구|사무용품|문구점/.test(text))return {category:"소모품비",needsReview:false,reason:"사무용품 관련 거래로 자동분류했습니다."};
  if(/택시|카카오t|교통|철도|코레일|주차/.test(text))return {category:"여비교통비",needsReview:false,reason:"교통 관련 거래로 자동분류했습니다."};
  if(/통신|kt|skt|lg유플러스|인터넷/.test(text))return {category:"통신비",needsReview:false,reason:"통신 관련 거래로 자동분류했습니다."};
  if(/수리|수선|정비/.test(text))return {category:"수선비",needsReview:false,reason:"수리·수선 관련 거래로 자동분류했습니다."};
  if(/쿠팡|네이버|쇼핑|마켓|구매/.test(text))return {category:"소모품비",needsReview:true,reason:"범용 구매처·구매 적요는 용도를 단정하기 어려워 담당자 확인이 필요합니다."};
  if(/식사|카페|커피|회의/.test(text))return {category:"회의비",needsReview:true,reason:"식음료 거래는 업무 목적 확인이 필요합니다."};
  return {category:"기타",needsReview:true,reason:"분류 근거가 충분하지 않아 담당자 확인이 필요합니다."};
}

function buildTransaction(raw){
  const vendor=normalizeText(raw.vendor);
  const memo=normalizeText(raw.memo);
  const amount=normalizeAmount(raw.amount);
  const suppliedCategory=normalizeText(raw.category);
  const auto=classify(vendor,memo);
  return {
    id:raw.id||state.nextId++,
    vendor:vendor||"거래처 미입력",
    memo:memo||"적요 없음",
    amount,
    category:suppliedCategory||auto.category,
    needsReview:suppliedCategory?false:auto.needsReview,
    reason:suppliedCategory?"파일 또는 사용자가 지정한 계정과목입니다.":auto.reason,
    classification:suppliedCategory?"manual":"auto"
  };
}

function log(action,message){
  const row=create("div");
  row.append(create("time","",formatTime()),create("b","",action),create("span","",message));
  $("eventLog").appendChild(row);
  row.classList.add("flash");
}

function clearHistory(){
  $("transferHistoryRows").replaceChildren(create("div","transfer-history-empty","전송 이력이 없습니다."));
  $("transferHistoryRows").firstElementChild.id="historyEmpty";
  setHistorySummary("전송 전","아직 전송된 거래가 없습니다","업무 처리에서 전송을 실행하면 최초 전송, 실패 건 재전송, 최종 결과 확인 기록이 여기에 순서대로 남습니다.");
}

function addHistory(kind,target,amount,result,detail,tone=""){
  $("historyEmpty")?.remove();
  const row=create("div","transfer-history-row"+(tone?" "+tone:""));
  const kindCell=create("span");
  kindCell.append(create("b","",kind),create("small","",detail));
  const targetCell=create("span","",target);
  const amountCell=create("span","",amount);
  const resultCell=create("span","history-result",result);
  const timeCell=create("time","",formatTime());
  row.append(kindCell,targetCell,amountCell,resultCell,timeCell);
  $("transferHistoryRows").appendChild(row);
  row.classList.add("flash");
}

function setHistorySummary(status,headline,description,tone=""){
  $("historyStatus").textContent=status;
  $("historyStatus").className="status-pill"+(tone?" "+tone:"");
  $("historyHeadline").textContent=headline;
  $("historyDescription").textContent=description;
}

function resetExecution({clearLog=false,reason=""}={}){
  const hadApproval=state.approved||state.transmitted||state.retried||state.reconciled;
  state.approved=false;
  state.transmitted=false;
  state.retried=false;
  state.reconciled=false;
  state.failedIds=[];
  state.approvedSnapshot=[];
  if(clearLog)$("eventLog").replaceChildren();
  clearHistory();
  $("varianceMetric").textContent="—";
  $("batchStatus").textContent="전송 전";
  $("batchStatus").className="status-pill";
  if(reason&&hadApproval)log("승인 상태 초기화",reason+" · 변경된 내용으로 다시 승인해야 합니다.");
}

function renderRows(){
  const container=$("transactionRows");
  container.replaceChildren();
  if(!state.transactions.length){
    const empty=create("div","transaction-empty","거래가 없습니다. Excel/CSV를 불러오거나 거래를 직접 추가해 주세요.");
    container.appendChild(empty);
    return;
  }
  state.transactions.forEach(txn=>{
    const row=create("div","tr"+(txn.needsReview?" focus":""));
    row.dataset.id=String(txn.id);
    row.append(create("span","",txn.vendor),create("span","",txn.memo),create("span","",txn.category),create("span","",money(txn.amount)));
    const status=create("span",txn.needsReview?"warn":"ok",txn.needsReview?"확인 필요":txn.classification==="manual"?"직접 확정":"자동분류");
    const actions=create("span","row-actions");
    const edit=create("button","row-action","수정");
    edit.type="button";
    edit.dataset.action="edit";
    edit.dataset.id=String(txn.id);
    const remove=create("button","row-action danger","삭제");
    remove.type="button";
    remove.dataset.action="delete";
    remove.dataset.id=String(txn.id);
    actions.append(edit,remove);
    row.append(status,actions);
    container.appendChild(row);
  });
}

function fillCategorySelect(select,includeAuto=false){
  select.replaceChildren();
  if(includeAuto){
    const auto=create("option","","자동분류 사용");
    auto.value="";
    select.appendChild(auto);
  }
  categories.forEach(category=>{
    const option=create("option","",category);
    option.value=category;
    select.appendChild(option);
  });
}

function renderReview(){
  const pending=pendingTransactions();
  const select=$("reviewCategory");
  const button=$("correctBtn");
  if(!pending.length){
    $("reviewTitle").textContent=state.transactions.length?"모든 거래 검토 완료":"검토할 거래가 없습니다";
    $("reviewReason").textContent=state.transactions.length?"전송 전 점검을 통과할 수 있습니다.":"먼저 거래 데이터를 불러와 주세요.";
    select.disabled=true;
    button.disabled=true;
    button.textContent="검토 완료";
    return;
  }
  const txn=pending[0];
  $("reviewTitle").textContent=txn.vendor+" · "+txn.memo;
  $("reviewReason").textContent=txn.reason;
  select.disabled=false;
  button.disabled=false;
  button.textContent="선택한 계정으로 확정";
  fillCategorySelect(select);
  select.value=categories.includes(txn.category)?txn.category:"기타";
  button.dataset.id=String(txn.id);
}

function setStep(id,stateName,text){
  const step=$(id);
  step.className="step"+(stateName?" "+stateName:"");
  const small=step.querySelector("small");
  if(small)small.textContent=text;
}

function renderFlow(){
  const count=state.transactions.length;
  const pending=pendingTransactions().length;
  const ready=count>0&&pending===0;
  $("transactionMetric").textContent=String(count);
  $("reviewMetric").textContent=String(pending);
  $("totalMetric").textContent=money(totalAmount());
  $("importStepText").textContent=count+"건";
  $("dataSourcePill").textContent=state.sourceLabel+" · "+count+"건";
  $("mappingText").textContent=count+" / "+count;
  $("retryBtn").textContent=state.failedIds.length?"실패 "+state.failedIds.length+"건 다시 전송":"실패 건 다시 전송";

  setStep("importStep",count?"done":"",""+count+"건");
  if(!count)setStep("reviewStep","","대기");
  else if(pending)setStep("reviewStep","current",pending+"건 필요");
  else setStep("reviewStep","done","완료");

  if(state.approved)setStep("approvalStep","done","승인 완료");
  else if(ready)setStep("approvalStep","current","승인 가능");
  else setStep("approvalStep","","대기");

  if(state.retried)setStep("transmitStep","done","전송 완료");
  else if(state.transmitted)setStep("transmitStep","current","일부 실패");
  else if(state.approved)setStep("transmitStep","current","전송 가능");
  else setStep("transmitStep","","대기");

  if(state.reconciled)setStep("reconcileStep","done","일치 완료");
  else if(state.retried)setStep("reconcileStep","current","비교 가능");
  else setStep("reconcileStep","","미실행");

  $("validationText").textContent=!count?"거래 없음":pending?"검토 필요":"통과";
  $("validationText").className=ready?"ok":pending?"warn":"";
  $("validationPill").textContent=!count?"거래 없음":pending?"검토 필요":"전송 가능";
  $("validationPill").className="status-pill"+(ready?" ok":pending?" warn":"");
  $("digestText").textContent=state.approved?"변경 없음":"—";
  $("digestText").className=state.approved?"ok":"";

  $("approveBtn").disabled=!ready||state.approved;
  $("transmitBtn").disabled=!state.approved||state.transmitted;
  $("retryBtn").disabled=!state.transmitted||state.retried;
  $("reconcileBtn").disabled=!state.retried||state.reconciled;
}

function renderAll(){
  renderRows();
  renderReview();
  renderFlow();
}

function announceLoaded(label){
  const pending=pendingTransactions().length;
  const autoCount=state.transactions.filter(txn=>!txn.needsReview).length;
  log("거래 불러오기",label+" · "+state.transactions.length+"건 · 브라우저 로컬 처리");
  log("자동분류 완료",autoCount+"건 분류 완료 · "+pending+"건 담당자 확인 필요");
}

function loadTransactions(rows,label){
  state.nextId=1;
  state.transactions=rows.map(buildTransaction).filter(txn=>txn.amount>0);
  state.sourceLabel=label;
  resetExecution({clearLog:true});
  announceLoaded(label);
  renderAll();
}

function markDataChanged(action,message){
  resetExecution({reason:"거래 데이터 변경 감지"});
  log(action,message);
  renderAll();
}

function pickValue(row,keys){
  const entries=Object.entries(row);
  const normalizedKeys=keys.map(key=>key.toLowerCase().replace(/[\s_()-]/g,""));
  for(const [key,value] of entries){
    const normalized=String(key).toLowerCase().replace(/[\s_()-]/g,"");
    if(normalizedKeys.includes(normalized))return value;
  }
  return "";
}

function normalizeImportedRow(row){
  return {
    vendor:pickValue(row,["거래처","거래처명","업체","업체명","가맹점","상호","vendor","merchant","payee"]),
    memo:pickValue(row,["적요","내용","거래내용","메모","비고","memo","description","desc"]),
    amount:pickValue(row,["금액","출금액","지출","거래금액","amount","debit","withdrawal"]),
    category:pickValue(row,["계정과목","분류","계정","category","account"])
  };
}

async function importFile(file){
  if(!file)return;
  try{
    if(!window.XLSX)throw new Error("Excel 파서가 로드되지 않았습니다. 네트워크 연결을 확인해 주세요.");
    const data=await file.arrayBuffer();
    const workbook=window.XLSX.read(data);
    const sheet=workbook.Sheets[workbook.SheetNames[0]];
    const rawRows=window.XLSX.utils.sheet_to_json(sheet,{defval:"",raw:false});
    const rows=rawRows.map(normalizeImportedRow).filter(row=>normalizeAmount(row.amount)>0&&(normalizeText(row.vendor)||normalizeText(row.memo)));
    if(!rows.length)throw new Error("읽을 수 있는 거래가 없습니다. 거래처·적요·금액 열 이름을 확인해 주세요.");
    loadTransactions(rows,file.name);
    $("fileHint").textContent=file.name+"을 서버 업로드 없이 브라우저에서 읽었습니다.";
  }catch(error){
    $("fileHint").textContent="파일을 읽지 못했습니다: "+error.message;
    window.alert("파일 불러오기 실패\n"+error.message);
  }finally{
    $("fileInput").value="";
  }
}

function openTransactionModal(txn=null){
  $("transactionModalTitle").textContent=txn?"거래 수정":"거래 직접 추가";
  $("editTxnId").value=txn?String(txn.id):"";
  $("vendorInput").value=txn?.vendor||"";
  $("memoInput").value=txn?.memo||"";
  $("amountInput").value=txn?String(txn.amount):"";
  fillCategorySelect($("categoryInput"),true);
  $("categoryInput").value=txn?.classification==="manual"?txn.category:"";
  $("transactionModal").hidden=false;
  document.body.classList.add("modal-open");
  $("vendorInput").focus();
}

function closeTransactionModal(){
  $("transactionModal").hidden=true;
  if($("videoDemoModal").hidden)document.body.classList.remove("modal-open");
}

document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav-item").forEach(item=>item.classList.remove("active"));
  document.querySelectorAll(".view").forEach(view=>view.classList.remove("active"));
  btn.classList.add("active");
  $(btn.dataset.view).classList.add("active");
}));

$("fileBtn").addEventListener("click",()=>$("fileInput").click());
$("fileInput").addEventListener("change",(event)=>importFile(event.target.files?.[0]));
$("sampleBtn").addEventListener("click",()=>{
  loadTransactions(sampleTransactions,"샘플 데이터");
  $("fileHint").textContent="샘플 3건을 다시 불러왔습니다. 직접 파일이나 거래를 넣어 바꿀 수 있습니다.";
});
$("resetBtn").addEventListener("click",()=>{
  loadTransactions(sampleTransactions,"샘플 데이터");
  $("fileHint").textContent="시연을 초기 상태로 되돌렸습니다.";
});
$("addTxnBtn").addEventListener("click",()=>openTransactionModal());

$("transactionRows").addEventListener("click",(event)=>{
  const button=event.target.closest("button[data-action]");
  if(!button)return;
  const id=Number(button.dataset.id);
  const txn=state.transactions.find(item=>item.id===id);
  if(!txn)return;
  if(button.dataset.action==="edit")openTransactionModal(txn);
  if(button.dataset.action==="delete"){
    state.transactions=state.transactions.filter(item=>item.id!==id);
    state.sourceLabel="직접 편집 데이터";
    markDataChanged("거래 삭제",txn.vendor+" · "+txn.memo+" · "+money(txn.amount));
  }
});

$("transactionForm").addEventListener("submit",(event)=>{
  event.preventDefault();
  const id=Number($("editTxnId").value)||null;
  const raw={
    vendor:$("vendorInput").value,
    memo:$("memoInput").value,
    amount:$("amountInput").value,
    category:$("categoryInput").value
  };
  if(!normalizeAmount(raw.amount)){
    window.alert("0보다 큰 금액을 입력해 주세요.");
    return;
  }
  if(id){
    const index=state.transactions.findIndex(txn=>txn.id===id);
    if(index>=0)state.transactions[index]=buildTransaction({...raw,id});
    state.sourceLabel="직접 편집 데이터";
    closeTransactionModal();
    markDataChanged("거래 수정",raw.vendor+" · "+raw.memo+" · "+money(normalizeAmount(raw.amount)));
  }else{
    state.transactions.push(buildTransaction(raw));
    state.sourceLabel="직접 입력 데이터";
    closeTransactionModal();
    markDataChanged("거래 추가",raw.vendor+" · "+raw.memo+" · "+money(normalizeAmount(raw.amount)));
  }
});

document.querySelectorAll("[data-close-transaction]").forEach(node=>node.addEventListener("click",closeTransactionModal));

$("correctBtn").addEventListener("click",()=>{
  const id=Number($("correctBtn").dataset.id);
  const txn=state.transactions.find(item=>item.id===id);
  if(!txn||!txn.needsReview)return;
  const before=txn.category;
  txn.category=$("reviewCategory").value||"기타";
  txn.needsReview=false;
  txn.classification="manual";
  txn.reason="담당자가 계정과목을 확인했습니다.";
  resetExecution({reason:"검토 결과 변경"});
  log("계정과목 확정",txn.vendor+" · "+before+" → "+txn.category+" · 변경 이력 저장");
  renderAll();
});

$("approveBtn").addEventListener("click",()=>{
  if(state.approved||!state.transactions.length||pendingTransactions().length)return;
  state.approved=true;
  state.approvedSnapshot=state.transactions.map(txn=>({...txn}));
  log("전송 승인",state.transactions.length+"건 · "+money(totalAmount())+" · 승인 시점의 전송 내용 저장");
  renderAll();
});

$("transmitBtn").addEventListener("click",()=>{
  if(!state.approved||state.transmitted||!state.approvedSnapshot.length)return;
  state.transmitted=true;
  const failed=state.approvedSnapshot[state.approvedSnapshot.length-1];
  state.failedIds=[failed.id];
  const failedAmount=failed.amount;
  const successCount=state.approvedSnapshot.length-1;
  $("varianceMetric").textContent=money(failedAmount);
  $("batchStatus").textContent=successCount+"건 성공 · 1건 실패";
  $("batchStatus").className="status-pill warn";
  addHistory("1차 전송",state.approvedSnapshot.length+"건",money(totalAmount()),successCount+"건 성공 · 1건 실패","미처리 "+money(failedAmount),"warn");
  setHistorySummary("일부 실패",state.approvedSnapshot.length+"건 중 1건 전송 실패","성공한 "+successCount+"건은 유지하고 실패한 1건만 재전송 대상으로 남았습니다. · 미처리 "+money(failedAmount),"warn");
  log("회계 시스템 전송",successCount+"건 성공 · 1건 일시 오류 · 미처리 "+money(failedAmount));
  log("결과 비교","원장과 전송 결과 차이 · "+money(failedAmount));
  renderAll();
});

$("retryBtn").addEventListener("click",()=>{
  if(!state.transmitted||state.retried||!state.failedIds.length)return;
  state.retried=true;
  const failedRows=state.approvedSnapshot.filter(txn=>state.failedIds.includes(txn.id));
  const failedAmount=failedRows.reduce((sum,txn)=>sum+txn.amount,0);
  $("batchStatus").textContent="전송 완료";
  $("batchStatus").className="status-pill ok";
  addHistory("실패 건 재전송",failedRows.length+"건",money(failedAmount),"성공","최초 전송 내용 유지","ok");
  setHistorySummary("재전송 완료","실패한 "+failedRows.length+"건만 재전송 완료","최초 전송 내용을 유지한 채 실패 건만 다시 보내 중복 없이 전송을 마쳤습니다.","ok");
  log("실패 건 재전송","실패한 "+failedRows.length+"건만 다시 전송 · "+money(failedAmount)+" · 성공");
  renderAll();
});

$("reconcileBtn").addEventListener("click",()=>{
  if(!state.retried||state.reconciled)return;
  state.reconciled=true;
  $("varianceMetric").textContent="₩0";
  addHistory("최종 결과 확인",state.approvedSnapshot.length+"건",money(totalAmount()),"금액 차이 ₩0","원장·전송 결과 일치","ok");
  setHistorySummary("처리 완료","전송 완료 · 금액 차이 ₩0","원장 "+money(totalAmount())+"과 전송 결과 "+money(totalAmount())+"이 최종 일치합니다.","ok");
  log("최종 결과 확인","원장과 전송 결과 일치 · 차이 ₩0");
  renderAll();
});

const videoDemoBtn=$("videoDemoBtn");
const videoDemoModal=$("videoDemoModal");
const videoDemoClose=$("videoDemoClose");
const careledgerDemoVideo=$("careledgerDemoVideo");
let videoReturnFocus=null;
const openVideoDemo=()=>{
  videoReturnFocus=document.activeElement;
  videoDemoModal.hidden=false;
  document.body.classList.add("modal-open");
  videoDemoClose.focus();
  careledgerDemoVideo.play().catch(()=>{});
};
const closeVideoDemo=()=>{
  careledgerDemoVideo.pause();
  videoDemoModal.hidden=true;
  if($("transactionModal").hidden)document.body.classList.remove("modal-open");
  if(videoReturnFocus&&typeof videoReturnFocus.focus==="function")videoReturnFocus.focus();
};
videoDemoBtn.addEventListener("click",openVideoDemo);
videoDemoClose.addEventListener("click",closeVideoDemo);
videoDemoModal.querySelector("[data-close-video]").addEventListener("click",closeVideoDemo);
document.addEventListener("keydown",(event)=>{
  if(event.key!=="Escape")return;
  if(!videoDemoModal.hidden)closeVideoDemo();
  else if(!$("transactionModal").hidden)closeTransactionModal();
});

loadTransactions(sampleTransactions,"샘플 데이터");
