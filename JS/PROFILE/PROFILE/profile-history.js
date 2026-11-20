/* =================================================
   U9 PROFILE HISTORY — DEPOSITS + WITHDRAWALS
   Uses the existing custom U9 session token.
================================================= */
(function () {
  "use strict";
  if (window.U9ProfileHistory) return;
  const API_URL = "/api/transaction_history";
  const list = document.getElementById("U9-profile-history-list");
  const detail = document.getElementById("U9-profile-history-detail");
  const body = document.getElementById("U9-profile-history-body");
  let records = [];
  let loaded = false;
  let loadingPromise = null;

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function money(value) { const n=Number(value); return Number.isFinite(n) ? n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) : "0.00"; }
  function dateValue(value) { const d=new Date(value); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString([], {year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"}); }
  function dayValue(value) { const d=new Date(value); if(Number.isNaN(d.getTime())) return "Earlier"; const now=new Date(); if(d.toDateString()===now.toDateString()) return "Today"; const y=new Date(now); y.setDate(y.getDate()-1); if(d.toDateString()===y.toDateString()) return "Yesterday"; return d.toLocaleDateString([], {year:"numeric",month:"long",day:"numeric"}); }
  function statusClass(s) { return String(s||"pending").toLowerCase().replace(/[^a-z]/g,""); }
  function statusLabel(s) { const v=String(s||"pending"); return v.charAt(0).toUpperCase()+v.slice(1); }
  function icon(type) {
    return type === "deposit"
      ? '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v3h16v-3" stroke="#20a45a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21V9m0 0 4.5 4.5M12 9l-4.5 4.5M4 7V4h16v3" stroke="#e34b4b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function normalized(row,type) { return {...row, type, _date: row.created_at || ""}; }
  function renderList() {
    if(!list) return;
    if(!records.length) { list.innerHTML='<div class="U9-history-empty">No transaction history yet.</div>'; return; }
    let previousDay="";
    list.innerHTML=records.map((r,index)=>{
      const day=dayValue(r.created_at); const heading=day!==previousDay ? `<div class="U9-history-day">${escapeHTML(day)}</div>` : ""; previousDay=day;
      const type=r.type; const title=type==="deposit"?"Deposit":"Withdrawal"; const amount=(type==="deposit"?"+ ":"− ")+money(r.amount);
      return `${heading}<button type="button" class="U9-history-card" data-history-index="${index}" data-type="${type}" aria-label="${title} ${money(r.amount)}"><span class="U9-history-icon">${icon(type)}</span><span class="U9-history-main"><span class="U9-history-title-row"><span class="U9-history-title">${title}</span></span><span class="U9-history-time">${escapeHTML(dateValue(r.created_at))}</span><span class="U9-history-status ${statusClass(r.status)}">${escapeHTML(statusLabel(r.status))}</span></span><span class="U9-history-amount ${type}">${amount}</span></button>`;
    }).join("");
  }
  async function load(force=false) {
    if(!list) return;
    if(loadingPromise) return loadingPromise;
    if(loaded && !force) { renderList(); return; }
    list.innerHTML='<div class="U9-history-loading">Loading history...</div>';
    loadingPromise=(async()=>{
      try {
        const token=localStorage.getItem("u9_token");
        const headers={}; if(token) headers.Authorization=`Bearer ${token}`;
        const response=await fetch(API_URL,{method:"GET",headers,credentials:"same-origin",cache:"no-store"});
        let result={}; try { result=await response.json(); } catch(_) {}
        if(!response.ok) throw new Error(result.error || "Could not load transaction history.");
        const data=Array.isArray(result.data)?result.data:(Array.isArray(result.transactions)?result.transactions:[]);
        records=data.map(r=>normalized(r,r.type)).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
        loaded=true; renderList();
      } catch(error) { console.error("U9 history load failed:",error); list.innerHTML=`<div class="U9-history-error">${escapeHTML(error.message || "Could not load history.")}<br><br><button type="button" id="U9-history-retry">Try again</button></div>`; }
      finally { loadingPromise=null; }
    })();
    return loadingPromise;
  }
  function detailRow(label,value) { if(value===null || value===undefined || value==="") return ""; return `<div class="U9-history-detail-row"><span class="U9-history-detail-label">${escapeHTML(label)}</span><span class="U9-history-detail-value">${escapeHTML(value)}</span></div>`; }
  function showDetail(r) {
    if(!detail||!list) return;
    const deposit=r.type==="deposit"; const type=deposit?"Deposit":"Withdrawal"; const amount=(deposit?"+ ":"− ")+money(r.amount);
    let rows="";
    rows+=detailRow("Transaction ID",r.id);
    rows+=detailRow("Transaction Type",type);
    rows+=detailRow("Amount",money(r.amount));
    if(!deposit) { rows+=detailRow("Fee",money(r.fee)); rows+=detailRow("Net Amount",money(r.net_amount)); rows+=detailRow("Wallet Address",r.wallet_address); rows+=detailRow("Network",r.network); }
    rows+=detailRow("Status",statusLabel(r.status));
    rows+=detailRow("Submitted Time",dateValue(r.created_at));
    if(deposit) rows+=detailRow("Admin Note",r.admin_note);
    else { rows+=detailRow("Transaction Hash",r.tx_hash); rows+=detailRow("Note",r.note); rows+=detailRow("Reviewed Time",r.reviewed_at?dateValue(r.reviewed_at):""); rows+=detailRow("Completed Time",r.completed_at?dateValue(r.completed_at):""); }
    const receipt=deposit&&r.receipt_url?`<div class="U9-history-detail-row" style="display:block"><div class="U9-history-detail-label">Payment Receipt</div><a href="${escapeHTML(r.receipt_url)}" target="_blank" rel="noopener"><img class="U9-history-receipt" src="${escapeHTML(r.receipt_url)}" alt="Deposit receipt"></a></div>`:"";
    detail.innerHTML=`<div class="U9-history-detail-summary"><div class="U9-history-detail-icon ${deposit?"":"withdrawal"}">${icon(r.type)}</div><div class="U9-history-detail-amount ${r.type}">${amount}</div><span class="U9-history-status ${statusClass(r.status)}">${escapeHTML(statusLabel(r.status))}</span></div><div class="U9-history-detail-rows">${rows}${receipt}</div>`;
    list.hidden=true; detail.hidden=false;
  }
  function backToList() { if(detail) detail.hidden=true; if(list) list.hidden=false; }
  if(list) list.addEventListener("click",e=>{ const retry=e.target.closest("#U9-history-retry"); if(retry){load(true);return;} const card=e.target.closest("[data-history-index]"); if(!card)return; const r=records[Number(card.dataset.historyIndex)]; if(r)showDetail(r); });
  if(body) body.addEventListener("click",e=>{ if(e.target.closest("#U9-history-detail")) return; });
  window.U9ProfileHistory={load,refresh:()=>load(true),backToList,showDetail};
  const originalShow=window.openProfileHistory;
  window.openProfileHistory=function(){ if(typeof originalShow==="function") originalShow(); if(window.U9Profile?.showHistory) load(); };
  // profile.js calls U9Profile.showHistory directly from several buttons.
  const waitForProfile=()=>{ if(window.U9Profile && !window.U9ProfileHistoryHooked){ const old=window.U9Profile.showHistory; window.U9Profile.showHistory=function(...args){ const result=old.apply(this,args); if(result) load(); return result; }; window.U9ProfileHistoryHooked=true; } };
  waitForProfile();
})();
