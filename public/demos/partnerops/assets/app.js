document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-filter]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const group=btn.closest("[data-filter-group]");
      if(!group)return;
      group.querySelectorAll("[data-filter]").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      const value=btn.dataset.filter;
      const target=group.dataset.filterGroup;
      document.querySelectorAll("[data-row-group='"+target+"']").forEach(row=>{
        row.style.display=(value==="ALL"||row.dataset.category===value)?"":"none";
      });
    });
  });
  document.querySelectorAll("[data-status-action]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const badge=btn.closest("tr")?.querySelector(".badge");
      if(!badge)return;
      const next=btn.dataset.statusAction;
      badge.textContent=next;
      badge.className="badge "+(next==="COMPLETED"||next==="PAID"?"green":"blue");
      btn.textContent="저장됨";
      btn.disabled=true;
    });
  });
  const preview=document.querySelector("[data-import-preview]");
  if(preview){
    preview.addEventListener("click",()=>{
      document.querySelector("[data-import-result]")?.classList.add("show");
      preview.textContent="검증 완료";
    });
  }
});
