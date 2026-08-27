// ---------- palette ----------
const PALETTE = [
  { id:"gold",  from:"#C99A3E", to:"#8C6A1F", label:"طلایی" },
  { id:"teal",  from:"#2E9E86", to:"#175E4F", label:"سبزآبی" },
  { id:"coral", from:"#C2603F", to:"#7E3820", label:"مسی" },
  { id:"indigo",from:"#4B5A9E", to:"#2A3364", label:"نیلی" },
  { id:"rose",  from:"#A34E6B", to:"#602B3E", label:"زرشکی" },
  { id:"slate", from:"#556070", to:"#2E353E", label:"سربی" },
];
function paletteFor(id){ return PALETTE.find(p=>p.id===id) || PALETTE[0]; }

// ---------- helpers ----------
function fmt(n){ return Math.round(Number(n)||0).toLocaleString("fa-IR"); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function toEnglishDigits(str){
  const fa="۰۱۲۳۴۵۶۷۸۹", ar="٠١٢٣٤٥٦٧٨٩";
  return String(str).replace(/[۰-۹]/g,d=>fa.indexOf(d)).replace(/[٠-٩]/g,d=>ar.indexOf(d)).replace(/[^0-9]/g,"");
}
function fmtDate(ts){
  try{
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian",{month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(ts));
  }catch(e){ return new Date(ts).toLocaleString("fa-IR"); }
}
function fmtPersianDate(ts){
  try{
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian",{year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(ts));
  }catch(e){ return new Date(ts).toLocaleDateString("fa-IR"); }
}
function addMonths(date, months){
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
const PERSIAN_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
function addDays(date, n){ const d = new Date(date); d.setDate(d.getDate()+n); return d; }
function toJalaliYMD(date){
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian",{year:"numeric",month:"numeric",day:"numeric"}).formatToParts(date);
  let y,m,d;
  for(const p of parts){ if(p.type==='year') y=+p.value; if(p.type==='month') m=+p.value; if(p.type==='day') d=+p.value; }
  return {y,m,d};
}
function jalaliTupleNum(date){ const t = toJalaliYMD(date); return t.y*10000 + t.m*100 + t.d; }
function getTodayJalali(){ return toJalaliYMD(new Date()); }
// converts a Jalali (Shamsi) date to a Gregorian JS Date using binary search over Intl's persian calendar
function jalaliToGregorian(jy, jm, jd){
  const target = jy*10000 + jm*100 + jd;
  const base = new Date(jy+620, 0, 1);
  let lo = 0, hi = 1200;
  while(lo < hi){
    const mid = Math.floor((lo+hi)/2);
    const val = jalaliTupleNum(addDays(base, mid));
    if(val < target) lo = mid+1; else hi = mid;
  }
  return addDays(base, lo);
}
function jalaliMonthLength(jy, jm){
  const d1 = jalaliToGregorian(jy, jm, 1);
  const njy = jm===12 ? jy+1 : jy;
  const njm = jm===12 ? 1 : jm+1;
  const d2 = jalaliToGregorian(njy, njm, 1);
  return Math.round((d2 - d1) / 86400000);
}
function getNoteSuggestions(){
  const seen = new Set();
  const list = [];
  for (const t of state.transactions){
    if (t.note && t.note.trim() && !seen.has(t.note)){
      seen.add(t.note);
      list.push(t.note);
    }
  }
  return list.slice(0, 40);
}

// ---------- icons (tiny inline svg) ----------
const ICONS = {
  plus:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  trash:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>',
  x:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  bank:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h18M3 10l9-7 9 7M4 10v9M20 10v9M8 10v9M12 10v9M16 10v9"/></svg>',
  pencil:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  download:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  upload:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
  transfer:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h13l-4-4M17 17H4l4 4"/></svg>',
  star:'<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 7.1-1.01L12 2z"/></svg>',
  bell:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
};

// ---------- state ----------
const STORAGE_KEY = "money-widget-data-v1";
let state = { banks: [], transactions: [], installments: [], activeBankId: null, showAddBank: false, showTransfer: false, mode: "expense", amount: "", note: "", activeTab: "main", loanCardId: null };

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const data = JSON.parse(raw);
      state.banks = data.banks || [];
      state.transactions = data.transactions || [];
      state.installments = (data.installments || []).map(inst=>{
        if(Array.isArray(inst.paidInstallments)){
          return { id: inst.id, name: inst.name||'', amount: inst.amount, startDate: inst.startDate, installmentCount: inst.installmentCount, paidCount: inst.paidInstallments.length, paymentTxIds: [] };
        }
        const withDefaults = { name:'', paidCount:0, paymentTxIds:[], ...inst };
        if(!Array.isArray(withDefaults.paymentTxIds)) withDefaults.paymentTxIds = [];
        return withDefaults;
      });
      state.loanCardId = data.loanCardId || null;
      if(state.banks.length) state.activeBankId = state.banks[0].id;
    }
  }catch(e){}
}
function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ banks: state.banks, transactions: state.transactions, installments: state.installments, loanCardId: state.loanCardId }));
  }catch(e){ console.error("save failed", e); }
}

let toastTimer = null;
function showToast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove("show"), 1800);
}

// ---------- actions ----------
function addBank(name, balance, colorId){
  const b = { id: uid(), name, balance: Number(balance)||0, color: colorId };
  state.banks.push(b);
  state.activeBankId = b.id;
  state.showAddBank = false;
  saveState(); render();
}
function openEditBank(id){
  const bank = state.banks.find(b=>b.id===id);
  if(!bank) return;
  state.editingBankId = id;
  state._editBankName = bank.name;
  state._editBankBalance = String(bank.balance);
  state._editBankColor = bank.color;
  render();
}
function saveEditBank(){
  const bank = state.banks.find(b=>b.id===state.editingBankId);
  if(!bank) return;
  const newBalance = Number(state._editBankBalance);
  if(state._editBankName && state._editBankName.trim()){
    const balanceDiff = newBalance - bank.balance;
    bank.name = state._editBankName.trim();
    bank.balance = newBalance;
    bank.color = state._editBankColor || PALETTE[0].id;
    if(balanceDiff !== 0){
      state.transactions.unshift({ id: uid(), type: "expense", bankId: bank.id, amount: Math.abs(balanceDiff), note: balanceDiff > 0 ? "افزایش موجودی" : "کاهش موجودی", date: Date.now() });
    }
  }
  state.editingBankId = null;
  saveState(); render();
  showToast("بانک ویرایش شد");
}
function closeEditBank(){
  state.editingBankId = null;
  render();
}
function deleteBank(id){
  state.banks = state.banks.filter(b=>b.id!==id);
  state.transactions = state.transactions.filter(t=>{
    if(t.type === "transfer"){
      return t.fromBankId !== id && t.toBankId !== id;
    }
    return t.bankId !== id;
  });
  if(state.activeBankId===id){
    state.activeBankId = state.banks.length ? state.banks[0].id : null;
  }
  if(state.loanCardId===id) state.loanCardId = null;
  state.editingBankId = null;
  saveState(); render();
}
function setLoanCard(id){
  state.loanCardId = (state.loanCardId===id) ? null : id;
  saveState(); render();
}
function getActiveInstallmentsTotal(){
  return state.installments.reduce((sum, inst)=>{
    const remaining = inst.installmentCount - (inst.paidCount||0);
    return sum + (remaining > 0 ? inst.amount : 0);
  }, 0);
}
function submitTransaction(){
  const val = Number(state.amount);
  if(!state.activeBankId || !val || val<=0) return;
  const bank = state.banks.find(b=>b.id===state.activeBankId);
  const mode = state.mode || "expense";
  if(mode === "expense") bank.balance -= val; else bank.balance += val;
  state.transactions.unshift({ id: uid(), type: mode, bankId: state.activeBankId, amount: val, note: state.note.trim(), date: Date.now() });
  state.amount = ""; state.note = "";
  saveState(); render();
  showToast(mode === "expense" ? "ثبت شد و از موجودی کم شد" : "به موجودی اضافه شد");
}
function openEditTx(id){
  state.editingTxId = id;
  state._editAmount = null;
  state._editNote = null;
  render();
}
function closeEditTx(){
  state.editingTxId = null;
  render();
}
function saveEditTx(){
  const t = state.transactions.find(x=>x.id===state.editingTxId);
  if(!t) return;
  const newAmount = Number(state._editAmount!=null ? state._editAmount : t.amount);
  const newNote = state._editNote!=null ? state._editNote : (t.note||'');
  if(!newAmount || newAmount<=0){ showToast("مبلغ معتبر نیست"); return; }
  const oldAmount = t.amount;
  if(t.type === "transfer"){
    const fromBank = state.banks.find(b=>b.id===t.fromBankId);
    const toBank = state.banks.find(b=>b.id===t.toBankId);
    if(fromBank) fromBank.balance += oldAmount - newAmount;
    if(toBank) toBank.balance += newAmount - oldAmount;
  } else {
    const bank = state.banks.find(b=>b.id===t.bankId);
    if(bank){
      if(t.type==='expense') bank.balance += oldAmount - newAmount;
      else bank.balance += newAmount - oldAmount;
    }
  }
  t.amount = newAmount;
  t.note = newNote.trim();
  state.editingTxId = null; state._editAmount = null; state._editNote = null;
  saveState(); render();
  showToast("تراکنش ویرایش شد");
}
function deleteTx(id){
  const idx = state.transactions.findIndex(t=>t.id===id);
  if(idx===-1) return;
  const t = state.transactions[idx];
  if(t.type === "transfer"){
    const fromBank = state.banks.find(b=>b.id===t.fromBankId);
    const toBank = state.banks.find(b=>b.id===t.toBankId);
    if(fromBank) fromBank.balance += t.amount;
    if(toBank) toBank.balance -= t.amount;
  } else {
    const bank = state.banks.find(b=>b.id===t.bankId);
    if(bank){
      if(t.type==='expense') bank.balance += t.amount; else bank.balance -= t.amount;
    }
  }
  state.transactions.splice(idx,1);
  saveState(); render();
  showToast("تراکنش حذف شد");
}
function submitTransfer(){
  const fromId = state._transferFrom;
  const toId = state._transferTo;
  const val = Number(state._transferAmount);
  if(!fromId || !toId || fromId === toId || !val || val<=0) return;
  const fromBank = state.banks.find(b=>b.id===fromId);
  const toBank = state.banks.find(b=>b.id===toId);
  if(!fromBank || !toBank) return;
  fromBank.balance -= val;
  toBank.balance += val;
  state.transactions.unshift({ id: uid(), type: "transfer", fromBankId: fromId, toBankId: toId, amount: val, note: (state._transferNote||"").trim(), date: Date.now() });
  state.showTransfer = false; state._transferAmount = ""; state._transferNote = "";
  saveState(); render();
  showToast("انتقال انجام شد");
}
function exportData(){
  const payload = { app:"money-widget", version:1, exportedAt: new Date().toISOString(), banks: state.banks, transactions: state.transactions };
  const blob = new Blob([JSON.stringify(payload,null,2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `money-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("فایل پشتیبان دانلود شد");
}
function handleImportFile(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(String(reader.result));
      if(!Array.isArray(data.banks) || !Array.isArray(data.transactions)) throw new Error("bad shape");
      state.banks = data.banks;
      state.transactions = data.transactions;
      state.activeBankId = data.banks.length ? data.banks[0].id : null;
      saveState(); render();
      showToast("داده‌ها با موفقیت بارگذاری شد");
    }catch(e){ showToast("فایل معتبر نیست"); }
  };
  reader.readAsText(file);
}

// ---------- installments ----------
function addInstallment(name, amount, startDate, installmentCount){
  const inst = {
    id: uid(),
    name: (name||"").trim(),
    amount: Number(amount)||0,
    startDate: new Date(startDate).getTime(),
    installmentCount: Math.max(1, Number(installmentCount)||1),
    paidCount: 0
  };
  state.installments.push(inst);
  saveState(); render();
  showToast("قسط اضافه شد");
}
function payNextInstallment(installmentId){
  const inst = state.installments.find(i=>i.id===installmentId);
  if(!inst) return;
  const bank = state.banks.find(b=>b.id===state.loanCardId);
  if(!bank){
    showToast("اول یه بانک رو به‌عنوان «کارت پرداخت اقساط» ⭐ انتخاب کن");
    render();
    return;
  }
  if(bank.balance < inst.amount){
    showToast(`موجودی «${bank.name}» برای این قسط کافی نیست`);
    render();
    return;
  }
  bank.balance -= inst.amount;
  const tx = { id: uid(), type: "expense", bankId: bank.id, amount: inst.amount, note: `قسط: ${inst.name || "قسط بدون‌نام"}`, date: Date.now() };
  state.transactions.unshift(tx);
  if(!Array.isArray(inst.paymentTxIds)) inst.paymentTxIds = [];
  inst.paymentTxIds.push(tx.id);
  inst.paidCount = Math.min(inst.installmentCount, (inst.paidCount||0) + 1);
  saveState(); render();
  showToast(`قسط از موجودی «${bank.name}» کم شد`);
}
function undoLastInstallmentPayment(installmentId){
  const inst = state.installments.find(i=>i.id===installmentId);
  if(!inst) return;
  if(Array.isArray(inst.paymentTxIds) && inst.paymentTxIds.length){
    const txId = inst.paymentTxIds.pop();
    const txIndex = state.transactions.findIndex(t=>t.id===txId);
    if(txIndex!==-1){
      const tx = state.transactions[txIndex];
      const bank = state.banks.find(b=>b.id===tx.bankId);
      if(bank) bank.balance += tx.amount;
      state.transactions.splice(txIndex,1);
    }
  }
  inst.paidCount = Math.max(0, (inst.paidCount||0) - 1);
  saveState(); render();
  showToast("پرداخت قسط برگشت خورد");
}
function openEditInst(id){
  const inst = state.installments.find(i=>i.id===id);
  if(!inst) return;
  const jy = toJalaliYMD(new Date(inst.startDate));
  state.editingInstId = id;
  state._editInstName = inst.name || '';
  state._editInstAmount = String(inst.amount);
  state._editInstCount = String(inst.installmentCount);
  state._editInstYear = jy.y;
  state._editInstMonth = jy.m;
  state._editInstDay = jy.d;
  render();
}
function closeEditInst(){
  state.editingInstId = null;
  render();
}
function saveEditInst(){
  const inst = state.installments.find(i=>i.id===state.editingInstId);
  if(!inst) return;
  const amount = Number(state._editInstAmount);
  const count = Math.max(1, Number(state._editInstCount)||1);
  if(!amount || amount<=0){ showToast("مبلغ معتبر نیست"); return; }
  inst.name = (state._editInstName||'').trim();
  inst.amount = amount;
  inst.installmentCount = count;
  inst.startDate = jalaliToGregorian(state._editInstYear, state._editInstMonth, state._editInstDay).getTime();
  if(inst.paidCount > inst.installmentCount) inst.paidCount = inst.installmentCount;
  state.editingInstId = null;
  saveState(); render();
  showToast("قسط ویرایش شد");
}
function deleteInstallment(id){
  state.installments = state.installments.filter(i=>i.id!==id);
  saveState(); render();
}
function getInstallmentDueDate(inst, monthIndex){
  return addMonths(new Date(inst.startDate), monthIndex);
}

// ---------- installment reminders (best-effort, requires opening the app) ----------
function sendInstallmentNotification(title, body){
  if(!("Notification" in window) || Notification.permission !== "granted") return;
  if(navigator.serviceWorker && navigator.serviceWorker.ready){
    navigator.serviceWorker.ready.then(reg=>{
      if(reg && reg.showNotification){ reg.showNotification(title, { body, icon: "icon-192.png" }); }
      else new Notification(title, { body, icon: "icon-192.png" });
    }).catch(()=>{ try{ new Notification(title, { body, icon: "icon-192.png" }); }catch(e){} });
  } else {
    try{ new Notification(title, { body, icon: "icon-192.png" }); }catch(e){}
  }
}
function checkInstallmentReminders(){
  if(!("Notification" in window) || Notification.permission !== "granted") return;
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  state.installments.forEach(inst=>{
    const paidCount = inst.paidCount||0;
    const remaining = inst.installmentCount - paidCount;
    if(remaining <= 0) return;
    const due = getInstallmentDueDate(inst, paidCount);
    const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
    const diffDays = Math.round((dueMid - todayMid) / 86400000);
    if(diffDays === 1){
      const key = "notified_" + inst.id + "_" + due.toDateString();
      if(!localStorage.getItem(key)){
        sendInstallmentNotification(
          "یادآوری قسط",
          `فردا نوبت پرداخت «${inst.name || 'قسط'}» به مبلغ ${fmt(inst.amount)} تومانه.`
        );
        try{ localStorage.setItem(key, "1"); }catch(e){}
      }
    }
  });
}
function enableInstallmentNotifications(){
  if(!("Notification" in window)){ showToast("مرورگر شما نوتیفیکیشن را پشتیبانی نمی‌کند"); return; }
  if(Notification.permission === "granted"){ checkInstallmentReminders(); render(); return; }
  if(Notification.permission === "denied"){ showToast("اجازه نوتیفیکیشن قبلاً رد شده"); return; }
  Notification.requestPermission().then(p=>{
    if(p === "granted"){ showToast("یادآوری فعال شد"); checkInstallmentReminders(); }
    else showToast("اجازه داده نشد");
    render();
  });
}

// ---------- render ----------
function getCardTransactions(bankId){
  return state.transactions.filter(t=>{
    if(t.type === "transfer") return t.fromBankId === bankId || t.toBankId === bankId;
    return t.bankId === bankId;
  });
}
function getCardUsageTotal(bankId){
  // "usage" = money that left this card: expenses + outgoing transfers
  return state.transactions.reduce((sum,t)=>{
    if(t.type === "expense" && t.bankId === bankId) return sum + t.amount;
    if(t.type === "transfer" && t.fromBankId === bankId) return sum + t.amount;
    return sum;
  }, 0);
}
function renderCardDetailContent(){
  if(!state.banks.length) return `<div class="card" style="text-align:center;color:#8b93a7;margin-top:20px;">اول یه بانک اضافه کن.</div>`;
  const bank = state.banks.find(b=>b.id===state._detailBankId) || state.banks[0];
  const pal = paletteFor(bank.color);
  const usageTotal = getCardUsageTotal(bank.id);
  const incomeTotal = state.transactions.reduce((sum,t)=>{
    if(t.type === "income" && t.bankId === bank.id) return sum + t.amount;
    if(t.type === "transfer" && t.toBankId === bank.id) return sum + t.amount;
    return sum;
  }, 0);
  const cardTxs = getCardTransactions(bank.id).sort((a,b)=>b.date-a.date);

  const chips = state.banks.map(b=>{
    const sel = b.id === bank.id;
    const p = paletteFor(b.color);
    return `<button data-select-detail-bank="${b.id}" style="flex:0 0 auto; padding:8px 12px; border-radius:9px; font-size:12px; background:${sel?`linear-gradient(135deg, ${p.from}, ${p.to})`:'#0F1420'}; color:${sel?'#fff':'#c7cddb'}; border:1px solid ${sel?'transparent':'#262c3d'};">${esc(b.name)}</button>`;
  }).join("");

  const listHtml = cardTxs.length ? cardTxs.map(t=>{
    if(t.type === "transfer"){
      const out = t.fromBankId === bank.id;
      const otherBank = state.banks.find(b=>b.id===(out?t.toBankId:t.fromBankId));
      return `
        <div class="tx">
          <div class="left">
            <div class="dot" style="background:linear-gradient(135deg, ${pal.from}, ${pal.to});"></div>
            <div>
              <div class="note">${esc(t.note || "انتقال بین بانک‌ها")}</div>
              <div class="meta">${out? 'انتقال به' : 'انتقال از'} ${esc(otherBank?otherBank.name:"حذف‌شده")} · ${fmtDate(t.date)}</div>
            </div>
          </div>
          <div class="right">
            <div class="amt ${out?'':'income'}">${out?'-':'+'}${fmt(t.amount)}</div>
          </div>
        </div>`;
    }
    const isIncome = t.type === "income";
    return `
      <div class="tx">
        <div class="left">
          <div class="dot" style="background:linear-gradient(135deg, ${pal.from}, ${pal.to});"></div>
          <div>
            <div class="note">${esc(t.note || (isIncome?"واریز":"بدون توضیح"))}</div>
            <div class="meta">${fmtDate(t.date)}</div>
          </div>
        </div>
        <div class="right">
          <div class="amt ${isIncome?'income':''}">${isIncome?'+':'-'}${fmt(t.amount)}</div>
        </div>
      </div>`;
  }).join("") : `<div class="empty">هنوز تراکنشی برای این کارت ثبت نشده.</div>`;

  return `
    <div class="card">
      <div class="title">انتخاب کارت</div>
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:2px;">${chips}</div>
    </div>
    <div class="card" style="background:linear-gradient(135deg, ${pal.from}, ${pal.to});">
      <div style="font-size:12.5px;color:rgba(255,255,255,.85);margin-bottom:4px;">جمع کل استفاده از «${esc(bank.name)}»</div>
      <div style="font-size:22px;font-weight:800;color:#fff;">${fmt(usageTotal)} <span style="font-size:13px;font-weight:500;">تومان</span></div>
      <div style="font-size:11.5px;color:rgba(255,255,255,.8);margin-top:6px;">واریزی‌ها: ${fmt(incomeTotal)} تومان · موجودی فعلی: ${fmt(bank.balance)} تومان</div>
    </div>
    <div class="history">
      <div class="head">
        <div class="title">تراکنش‌های این کارت (خرید و انتقال)</div>
      </div>
      ${listHtml}
    </div>
  `;
}

function render(){
  const app = document.getElementById("app");
  const __scrollY = window.scrollY;
  const __sheetEl = document.getElementById("sheet");
  const __sheetScroll = __sheetEl ? __sheetEl.scrollTop : 0;
  const __cardsEl = document.querySelector(".cards");
  const __cardsScroll = __cardsEl ? __cardsEl.scrollLeft : 0;
  const activeBank = state.banks.find(b=>b.id===state.activeBankId);
  const total = state.banks.reduce((s,b)=>s+b.balance,0);

  const loanTotal = getActiveInstallmentsTotal();
  const cardsHtml = state.banks.map(b=>{
    const pal = paletteFor(b.color);
    const active = b.id===state.activeBankId;
    return `
      <div style="flex:0 0 auto;width:128px;">
        <div class="bank-card ${active?'active':''}" data-select-bank="${b.id}" role="button" tabindex="0" style="background:linear-gradient(135deg, ${pal.from}, ${pal.to}); cursor:pointer;">
          <div class="top">
            <span style="color:rgba(255,255,255,.85); display:flex; gap:3px; align-items:center; transform:scale(0.72); transform-origin:right top;">${ICONS.bank}</span>
            <div style="display:flex;gap:3px;">
              <button class="tx-icon-btn" data-edit-bank="${b.id}" style="width:18px;height:18px;font-size:10px;background:rgba(0,0,0,.3);color:#8b93a7;padding:2px;" title="ویرایش" onclick="event.stopPropagation();">${ICONS.pencil}</button>
              <button class="tx-icon-btn danger" data-delete-bank="${b.id}" style="width:18px;height:18px;font-size:10px;background:rgba(0,0,0,.3);color:#D9764F;padding:2px;" title="حذف" onclick="event.stopPropagation();">${ICONS.trash}</button>
            </div>
          </div>
          <div>
            <div class="name">${esc(b.name)}</div>
            <div class="balance">${fmt(b.balance)}</div>
          </div>
        </div>
      </div>`;
  }).join("");

  const mode = state.mode || "expense";
  const quickAddHtml = state.banks.length ? `
    <div class="card">
      <div class="mode-toggle">
        <button class="mode-btn ${mode==='expense'?'active':''}" data-mode="expense">خرج کردم</button>
        <button class="mode-btn ${mode==='income'?'active':''}" data-mode="income">واریز کردم</button>
      </div>
      <div class="title">${mode==='expense' ? `ثبت خرید از «${esc(activeBank?activeBank.name:'')}»` : `افزایش موجودی «${esc(activeBank?activeBank.name:'')}»`}</div>
      <input class="amount-input" inputmode="numeric" placeholder="${mode==='expense'?'مبلغ خرید (تومان)':'مبلغ واریزی (تومان)'}" id="amountInput" value="${esc(state.amount)}" />
      <input class="note-input" placeholder="بابت چی؟ (اختیاری)" id="noteInput" list="noteSuggestions" value="${esc(state.note)}" />
      <button class="submit-btn" id="submitBtn" ${(!state.amount || Number(state.amount)<=0)?'disabled':''}>${mode==='expense'?'کم کن از موجودی':'اضافه کن به موجودی'}</button>
      ${activeBank && state.amount ? `<div class="after-note">مانده بعد از این ${mode==='expense'?'خرید':'واریز'}: <b>${fmt(mode==='expense' ? activeBank.balance - (Number(state.amount)||0) : activeBank.balance + (Number(state.amount)||0))} تومان</b></div>` : ''}
    </div>` : `<div class="card" style="text-align:center;color:#8b93a7;">اول یه بانک اضافه کن تا بتونی ثبت کنی.</div>`;

  // ---------- build transaction history ----------
  const txActionsHtml = (t) => `
    <button class="tx-icon-btn" data-edit-tx="${t.id}" title="ویرایش">${ICONS.pencil}</button>
    <button class="tx-icon-btn danger" data-delete-tx="${t.id}" title="حذف">${ICONS.trash}</button>`;

  const txHtml = state.transactions.length ? state.transactions.map(t=>{
    if(t.type === "transfer"){
      const fromBank = state.banks.find(b=>b.id===t.fromBankId);
      const toBank = state.banks.find(b=>b.id===t.toBankId);
      const pal = paletteFor(fromBank?fromBank.color:null);
      return `
        <div class="tx">
          <div class="left">
            <div class="dot" style="background:linear-gradient(135deg, ${pal.from}, ${pal.to});"></div>
            <div>
              <div class="note">${esc(t.note || "انتقال بین بانک‌ها")}</div>
              <div class="meta">${esc(fromBank?fromBank.name:"حذف‌شده")} ← ${esc(toBank?toBank.name:"حذف‌شده")} · ${fmtDate(t.date)}</div>
            </div>
          </div>
          <div class="right">
            <div class="amt transfer">${fmt(t.amount)}</div>
            ${txActionsHtml(t)}
          </div>
        </div>`;
    }
    const bank = state.banks.find(b=>b.id===t.bankId);
    const pal = paletteFor(bank?bank.color:null);
    const isIncome = t.type === "income";
    return `
      <div class="tx">
        <div class="left">
          <div class="dot" style="background:linear-gradient(135deg, ${pal.from}, ${pal.to});"></div>
          <div>
            <div class="note">${esc(t.note || (isIncome?"واریز":"بدون توضیح"))}</div>
            <div class="meta">${esc(bank?bank.name:"بانک حذف‌شده")} · ${fmtDate(t.date)}</div>
          </div>
        </div>
        <div class="right">
          <div class="amt ${isIncome?'income':''}">${isIncome?'+':'-'}${fmt(t.amount)}</div>
          ${txActionsHtml(t)}
        </div>
      </div>`;
  }).join("") : `<div class="empty">هنوز تراکنشی ثبت نشده.</div>`;

  // ---------- main tab content ----------
  const mainContent = state.banks.length ? `
    ${quickAddHtml}
    <div class="history">
      <div class="head">
        <div class="title">تراکنش‌های اخیر</div>
      </div>
      ${txHtml}
    </div>
  ` : `<div class="card" style="text-align:center;color:#8b93a7;margin-top:20px;">اول یه بانک اضافه کن.</div>`;

  // ---------- transfer tab content ----------
  // make sure from/to are always valid bank ids before rendering (fixes transfer silently failing)
  if(state.banks.length > 1){
    if(!state._transferFromTab || !state.banks.find(b=>b.id===state._transferFromTab)){
      state._transferFromTab = state.banks[0].id;
    }
    if(!state._transferToTab || !state.banks.find(b=>b.id===state._transferToTab) || state._transferToTab===state._transferFromTab){
      const alt = state.banks.find(b=>b.id!==state._transferFromTab);
      state._transferToTab = alt ? alt.id : state.banks[0].id;
    }
  }
  const transferContent = state.banks.length > 1 ? `
    <div class="card">
      <div class="title">انتقال از کارت به کارت</div>
      <div class="field-label">از کدام بانک؟</div>
      <select class="note-input" id="transferFromTab">
        ${state.banks.map(b=>`<option value="${b.id}" ${b.id===state._transferFromTab?'selected':''}>${esc(b.name)} (${fmt(b.balance)})</option>`).join("")}
      </select>
      <div class="field-label">به کدام بانک؟</div>
      <select class="note-input" id="transferToTab">
        ${state.banks.map(b=>`<option value="${b.id}" ${b.id===state._transferToTab?'selected':''}>${esc(b.name)} (${fmt(b.balance)})</option>`).join("")}
      </select>
      <input class="amount-input" inputmode="numeric" placeholder="مبلغ انتقال (تومان)" id="transferAmountTab" value="${esc(state._transferAmountTab||'')}" />
      <input class="note-input" placeholder="توضیح (اختیاری)" id="transferNoteTab" value="${esc(state._transferNoteTab||'')}" />
      <button class="submit-btn" id="submitTransferTabBtn" ${(!state._transferAmountTab || Number(state._transferAmountTab)<=0 || state._transferFromTab === state._transferToTab)?'disabled':''}>${ICONS.transfer} انتقال دادن</button>
    </div>
  ` : `<div class="card" style="text-align:center;color:#8b93a7;margin-top:20px;">برای انتقال، حداقل دو بانک لازم است.</div>`;

  // ---------- installments tab content ----------
  const todayJ = getTodayJalali();
  if(!state._instYear) state._instYear = todayJ.y;
  if(!state._instMonth) state._instMonth = todayJ.m;
  if(!state._instDay) state._instDay = todayJ.d;
  const instMonthLen = jalaliMonthLength(state._instYear, state._instMonth);
  if(state._instDay > instMonthLen) state._instDay = instMonthLen;

  const instYearOptions = Array.from({length:8},(_,i)=> todayJ.y-1+i)
    .map(y=>`<option value="${y}" ${state._instYear===y?'selected':''}>${y}</option>`).join("");
  const instMonthOptions = PERSIAN_MONTHS
    .map((name,i)=>`<option value="${i+1}" ${state._instMonth===(i+1)?'selected':''}>${name}</option>`).join("");
  const instDayOptions = Array.from({length:instMonthLen},(_,i)=>i+1)
    .map(d=>`<option value="${d}" ${state._instDay===d?'selected':''}>${d}</option>`).join("");

  const loanBank = state.banks.find(b=>b.id===state.loanCardId);
  const loanTotalForBanner = getActiveInstallmentsTotal();
  const loanBankSufficient = loanBank ? (loanBank.balance >= loanTotalForBanner) : false;
  const loanBankPickerChips = state.banks.map(b=>{
    const sel = b.id === state.loanCardId;
    const pal = paletteFor(b.color);
    return `<button data-set-loan-bank="${b.id}" style="flex:0 0 auto; display:flex; align-items:center; gap:5px; padding:7px 11px; border-radius:9px; font-size:12px; background:${sel?`linear-gradient(135deg, ${pal.from}, ${pal.to})`:'#0F1420'}; color:${sel?'#fff':'#c7cddb'}; border:1px solid ${sel?'transparent':'#262c3d'};">${sel?ICONS.star:''}${esc(b.name)}</button>`;
  }).join("");
  const loanBankStatusCard = state.banks.length ? `
    <div class="card" style="border:1px solid ${loanBank ? (loanBankSufficient?'#2E9E86':'#D9764F') : '#333c4d'};">
      <div class="title">${ICONS.star} کارت پرداخت اقساط</div>
      <div style="font-size:11.5px;color:#8b93a7;margin-bottom:10px;">یکی از کارت‌های موجودت رو انتخاب کن؛ لازم نیست کارت جدید بسازی.</div>
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:2px; margin-bottom:${state.installments.length?'12px':'0'};">${loanBankPickerChips}</div>
      ${state.installments.length ? (loanBank ? `
        <div style="font-size:13px;color:#F3EFE6;margin-bottom:4px;">${esc(loanBank.name)} · موجودی فعلی: ${fmt(loanBank.balance)} تومان</div>
        <div style="font-size:12px;color:${loanBankSufficient?'#2E9E86':'#D9764F'};">
          ${loanBankSufficient ? `✓ موجودی برای اقساط این ماه (${fmt(loanTotalForBanner)} تومان) کافیه` : `⚠ موجودی «${esc(loanBank.name)}» برای اقساط این ماه (${fmt(loanTotalForBanner)} تومان) کافی نیست`}
        </div>
      ` : `
        <div style="font-size:12.5px;color:#D9764F;">هنوز کارتی برای پرداخت اقساط انتخاب نکردی؛ از چیپ‌های بالا یکی رو بزن.</div>
      `) : ''}
    </div>
  ` : '';

  const notifPermission = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
  const reminderCard = `
    <div class="card">
      <div class="title">${ICONS.bell} یادآوری اقساط</div>
      ${notifPermission === 'granted' ? `
        <div style="font-size:12.5px;color:#2E9E86;">یادآوری فعاله؛ یک روز قبل از هر قسط بهت نوتیفیکیشن می‌ده (وقتی اپ رو باز کنی).</div>
      ` : notifPermission === 'denied' ? `
        <div style="font-size:12.5px;color:#D9764F;">اجازه نوتیفیکیشن رد شده. از تنظیمات مرورگر/سایت فعالش کن.</div>
      ` : `
        <button class="submit-btn" id="enableNotifBtn">${ICONS.bell} فعال‌سازی یادآوری</button>
        <div style="font-size:11.5px;color:#8b93a7;margin-top:8px;">توجه: چون این اپ سرور نداره، یادآوری وقتی کار می‌کنه که گاهی اپ رو باز کنی؛ کاملاً پس‌زمینه (وقتی اپ کلاً بسته‌ست) پشتیبانی نمی‌شه.</div>
      `}
    </div>
  `;

  const installmentsContent = `
    ${loanBankStatusCard}
    ${reminderCard}
    <div class="card">
      <div class="title">قسط جدید</div>
      <input class="note-input" placeholder="اسم قسط (مثلاً وام بانک ملی)" id="instName" value="${esc(state._instName||'')}" />
      <input class="amount-input" inputmode="numeric" placeholder="مبلغ هر قسط (تومان)" id="instAmount" value="${esc(state._instAmount||'')}" />
      <div class="field-label">تاریخ شروع (شمسی)</div>
      <div style="display:flex; gap:8px;">
        <select class="note-input" id="instYear" style="flex:1;">${instYearOptions}</select>
        <select class="note-input" id="instMonth" style="flex:1;">${instMonthOptions}</select>
        <select class="note-input" id="instDay" style="flex:1;">${instDayOptions}</select>
      </div>
      <div class="field-label">تعداد اقساط (ماه)</div>
      <input class="note-input" inputmode="numeric" type="number" min="1" placeholder="مثلاً ۱، ۲، ۱۲ ..." id="instCount" value="${esc(state._instCount||'')}" />
      <button class="submit-btn" id="submitInstBtn" ${(!state._instAmount || Number(state._instAmount)<=0 || !state._instCount || Number(state._instCount)<=0)?'disabled':''}>اضافه کردن قسط</button>
    </div>
    <div class="history">
      <div class="head">
        <div class="title">اقساط فعال</div>
      </div>
      ${state.installments.length ? state.installments.sort((a,b)=>a.startDate-b.startDate).map(inst=>{
        const paidCount = inst.paidCount||0;
        const remaining = inst.installmentCount - paidCount;
        const isDone = remaining <= 0;
        let bodyHtml;
        if(isDone){
          bodyHtml = `<div style="font-size:12.5px;color:#2E9E86;">✓ همه اقساط پرداخت شد</div>`;
        } else {
          const dueDate = getInstallmentDueDate(inst, paidCount);
          bodyHtml = `
            <div class="install-checkbox">
              <input type="checkbox" id="inst_${inst.id}" data-inst-id="${inst.id}" />
              <label for="inst_${inst.id}" style="flex:1;cursor:pointer;">
                <div style="font-size:13px;color:#F3EFE6;">قسط ${paidCount+1} از ${inst.installmentCount}: ${fmt(inst.amount)} تومان</div>
                <div class="date">سررسید: ${fmtPersianDate(dueDate)} · ${remaining} ماه مانده</div>
              </label>
            </div>
            ${paidCount>0 ? `<button data-undo-inst="${inst.id}" style="font-size:11.5px;color:#8b93a7;margin-top:2px;">↺ برگشت آخرین پرداخت</button>` : ''}
          `;
        }
        return `
          <div class="installment-item">
            <div class="header">
              <div>
                <div class="amount">${esc(inst.name || 'قسط بدون‌نام')}</div>
                <div class="paid">${fmt(inst.amount)} × ${inst.installmentCount} = ${fmt(inst.amount * inst.installmentCount)} تومان</div>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="tx-icon-btn" data-edit-inst="${inst.id}" title="ویرایش">${ICONS.pencil}</button>
                <button class="tx-icon-btn danger" data-delete-inst="${inst.id}" title="حذف">${ICONS.trash}</button>
              </div>
            </div>
            <div class="date-info">شروع: ${fmtPersianDate(inst.startDate)} | پرداخت‌شده: ${paidCount}/${inst.installmentCount}</div>
            ${bodyHtml}
          </div>
        `;
      }).join("") : `<div class="empty">هنوز قسطی ثبت نشده.</div>`}
    </div>
  `;

  // ---------- card detail tab content ----------
  if(state.banks.length && (!state._detailBankId || !state.banks.find(b=>b.id===state._detailBankId))){
    state._detailBankId = state.activeBankId || state.banks[0].id;
  }
  const cardDetailContent = renderCardDetailContent();

  // ---------- render main app ----------
  const tabContent = state.activeTab === "transfer" ? transferContent : 
                     state.activeTab === "installments" ? installmentsContent :
                     state.activeTab === "cardDetail" ? cardDetailContent : mainContent;

  app.innerHTML = `
    <div class="header">
      <div>
        <div class="label">مجموع موجودی</div>
        <div class="total">${fmt(total)} <span class="unit">تومان</span></div>
      </div>
      <div class="actions">
        <button class="icon-btn" id="importBtn" title="بارگذاری بک‌آپ">${ICONS.upload}</button>
        <button class="icon-btn" id="exportBtn" title="گرفتن بک‌آپ">${ICONS.download}</button>
        <input type="file" accept="application/json" id="fileInput" style="display:none" />
      </div>
    </div>

    <div class="cards">
      ${cardsHtml}
      <button class="add-card" id="openAddBank">${ICONS.plus}<span>بانک جدید</span></button>
    </div>

    <div class="tabs">
      <button class="tab ${state.activeTab==='main'?'active':''}" data-tab="main">خانه</button>
      ${state.banks.length>1 ? `<button class="tab ${state.activeTab==='transfer'?'active':''}" data-tab="transfer">انتقال کارت</button>` : ''}
      <button class="tab ${state.activeTab==='installments'?'active':''}" data-tab="installments">اقساط</button>
      ${state.banks.length ? `<button class="tab ${state.activeTab==='cardDetail'?'active':''}" data-tab="cardDetail">جزئیات کارت</button>` : ''}
    </div>

    ${tabContent}

    ${state.showAddBank ? renderAddBankModal() : ''}
    ${state.editingBankId ? renderEditBankModal() : ''}
    ${state.editingTxId ? renderEditTxModal() : ''}
    ${state.editingInstId ? renderEditInstModal() : ''}
    <datalist id="noteSuggestions">
      ${getNoteSuggestions().map(n=>`<option value="${esc(n)}"></option>`).join("")}
    </datalist>
    <div class="toast" id="toast"></div>
  `;

  attachEvents();

  // restore scroll position so re-renders don't feel like a sudden jump
  window.scrollTo(0, __scrollY);
  const __newSheet = document.getElementById("sheet");
  if(__newSheet && __sheetScroll) __newSheet.scrollTop = __sheetScroll;
  const __newCards = document.querySelector(".cards");
  if(__newCards && __cardsScroll) __newCards.scrollLeft = __cardsScroll;
}

function renderTransferModal(){
  const fromId = state._transferFrom || (state.banks[0] && state.banks[0].id);
  const toId = state._transferTo || (state.banks[1] ? state.banks[1].id : (state.banks[0] && state.banks[0].id));
  const options = (selectedId) => state.banks.map(b=>`<option value="${b.id}" ${b.id===selectedId?'selected':''}>${esc(b.name)} (${fmt(b.balance)})</option>`).join("");
  const canSubmit = state._transferAmount && Number(state._transferAmount)>0 && fromId && toId && fromId!==toId;

  return `
  <div class="overlay" id="transferOverlay">
    <div class="sheet" id="transferSheet">
      <div class="head">
        <div class="title">انتقال بین بانک‌ها</div>
        <button class="close-btn" id="closeTransferModal">${ICONS.x}</button>
      </div>
      <div class="field-label">از</div>
      <select class="note-input" id="transferFrom">${options(fromId)}</select>
      <div class="field-label">به</div>
      <select class="note-input" id="transferTo">${options(toId)}</select>
      <input class="amount-input" inputmode="numeric" placeholder="مبلغ انتقال (تومان)" id="transferAmount" value="${esc(state._transferAmount||'')}" />
      <input class="note-input" placeholder="بابت چی؟ (اختیاری)" id="transferNote" list="noteSuggestions" value="${esc(state._transferNote||'')}" />
      ${fromId===toId ? `<div class="field-label" style="color:#D9764F;margin-bottom:10px;">بانک مبدا و مقصد نباید یکی باشن</div>` : ''}
      <button class="submit-btn" id="submitTransferBtn" ${!canSubmit?'disabled':''}>انتقال بده</button>
    </div>
  </div>`;
}

function renderEditTxModal(){
  const t = state.transactions.find(x=>x.id===state.editingTxId);
  if(!t) return '';
  return `
  <div class="overlay" id="editTxOverlay">
    <div class="sheet">
      <div class="head">
        <div class="title">ویرایش تراکنش</div>
        <button class="close-btn" id="closeEditTx">${ICONS.x}</button>
      </div>
      <div class="field-label">مبلغ (تومان)</div>
      <input class="amount-input" inputmode="numeric" id="editTxAmount" value="${esc(state._editAmount!=null ? state._editAmount : t.amount)}" />
      <div class="field-label">توضیح</div>
      <input class="note-input" id="editTxNote" value="${esc(state._editNote!=null ? state._editNote : (t.note||''))}" />
      <button class="submit-btn" id="saveEditTxBtn">ذخیره تغییرات</button>
    </div>
  </div>`;
}

function renderEditInstModal(){
  const inst = state.installments.find(i=>i.id===state.editingInstId);
  if(!inst) return '';
  const y = state._editInstYear, m = state._editInstMonth, d = state._editInstDay;
  const monthLen = jalaliMonthLength(y, m);
  if(state._editInstDay > monthLen) state._editInstDay = monthLen;
  const yearOptions = Array.from({length:8},(_,i)=> y-3+i)
    .map(yy=>`<option value="${yy}" ${state._editInstYear===yy?'selected':''}>${yy}</option>`).join("");
  const monthOptions = PERSIAN_MONTHS
    .map((name,i)=>`<option value="${i+1}" ${state._editInstMonth===(i+1)?'selected':''}>${name}</option>`).join("");
  const dayOptions = Array.from({length:monthLen},(_,i)=>i+1)
    .map(dd=>`<option value="${dd}" ${state._editInstDay===dd?'selected':''}>${dd}</option>`).join("");
  return `
  <div class="overlay" id="editInstOverlay">
    <div class="sheet">
      <div class="head">
        <div class="title">ویرایش قسط</div>
        <button class="close-btn" id="closeEditInst">${ICONS.x}</button>
      </div>
      <div class="field-label">اسم قسط</div>
      <input class="note-input" id="editInstName" value="${esc(state._editInstName||'')}" />
      <div class="field-label">مبلغ هر قسط (تومان)</div>
      <input class="amount-input" inputmode="numeric" id="editInstAmount" value="${esc(state._editInstAmount||'')}" />
      <div class="field-label">تاریخ شروع (شمسی)</div>
      <div style="display:flex; gap:8px;">
        <select class="note-input" id="editInstYear" style="flex:1;">${yearOptions}</select>
        <select class="note-input" id="editInstMonth" style="flex:1;">${monthOptions}</select>
        <select class="note-input" id="editInstDay" style="flex:1;">${dayOptions}</select>
      </div>
      <div class="field-label">تعداد اقساط (ماه)</div>
      <input class="note-input" inputmode="numeric" type="number" min="1" id="editInstCount" value="${esc(state._editInstCount||'')}" />
      <button class="submit-btn" id="saveEditInstBtn">ذخیره تغییرات</button>
    </div>
  </div>`;
}

function renderAddBankModal(){
  const swatches = PALETTE.map(p=>`
    <button class="swatch ${state._newColor===p.id?'active':''}" data-swatch="${p.id}" style="background:linear-gradient(135deg, ${p.from}, ${p.to});" title="${p.label}"></button>
  `).join("");
  const manageRows = state.banks.map(b=>`
    <div class="bank-manage-row">
      <span>${esc(b.name)} ${state.loanCardId===b.id ? '⭐' : ''}</span>
      <div style="display:flex;gap:14px;align-items:center;">
        <button data-set-loan-bank="${b.id}" style="color:${state.loanCardId===b.id?'#C99A3E':'#8b93a7'};" title="تعیین به‌عنوان کارت اقساط">${ICONS.star}</button>
        <button data-delete-bank="${b.id}">${ICONS.trash}</button>
      </div>
    </div>
  `).join("");

  return `
  <div class="overlay" id="overlay">
    <div class="sheet" id="sheet">
      <div class="head">
        <div class="title">بانک جدید</div>
        <button class="close-btn" id="closeModal">${ICONS.x}</button>
      </div>
      <input class="note-input" placeholder="اسم بانک (مثلاً ملت، بلوبانک)" id="newBankName" value="${esc(state._newName||'')}" />
      <input class="amount-input" inputmode="numeric" placeholder="موجودی فعلی (تومان)" id="newBankBalance" value="${esc(state._newBalance||'')}" />
      <div style="font-size:12.5px;color:#8b93a7;margin:12px 0 8px;">رنگ کارت</div>
      <div class="palette">${swatches}</div>
      <button class="submit-btn" id="addBankBtn" ${!(state._newName&&state._newName.trim())?'disabled':''}>${ICONS.plus} اضافه کن</button>
      ${state.banks.length ? `<div style="margin-top:20px;"><div style="font-size:12px;color:#6b7386;margin-bottom:8px;">مدیریت بانک‌ها · ⭐ کارت پرداخت اقساط</div>${manageRows}</div>` : ''}
    </div>
  </div>`;
}

function renderEditBankModal(){
  const bank = state.banks.find(b=>b.id===state.editingBankId);
  if(!bank) return '';
  const swatches = PALETTE.map(p=>`
    <button class="swatch ${state._editBankColor===p.id?'active':''}" data-swatch-edit="${p.id}" style="background:linear-gradient(135deg, ${p.from}, ${p.to});" title="${p.label}"></button>
  `).join("");
  return `
  <div class="overlay" id="editBankOverlay">
    <div class="sheet" id="editBankSheet">
      <div class="head">
        <div class="title">ویرایش بانک</div>
        <button class="close-btn" id="closeEditBankModal">${ICONS.x}</button>
      </div>
      <input class="note-input" placeholder="اسم بانک" id="editBankName" value="${esc(state._editBankName||'')}" />
      <input class="amount-input" inputmode="numeric" placeholder="موجودی فعلی (تومان)" id="editBankBalance" value="${esc(state._editBankBalance||'')}" />
      <div style="font-size:12.5px;color:#8b93a7;margin:12px 0 8px;">رنگ کارت</div>
      <div class="palette">${swatches}</div>
      <button class="submit-btn" id="saveEditBankBtn" ${!(state._editBankName&&state._editBankName.trim())?'disabled':''}>ذخیره تغییرات</button>
    </div>
  </div>`;
}

function attachEvents(){
  document.querySelectorAll('[data-select-bank]').forEach(el=>{
    el.addEventListener('click', ()=>{ state.activeBankId = el.getAttribute('data-select-bank'); render(); });
  });
  document.querySelectorAll('[data-select-detail-bank]').forEach(el=>{
    el.addEventListener('click', ()=>{ state._detailBankId = el.getAttribute('data-select-detail-bank'); render(); });
  });

  const amountInput = document.getElementById('amountInput');
  if(amountInput){
    amountInput.addEventListener('input', e=>{
      state.amount = toEnglishDigits(e.target.value);
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = !state.amount || Number(state.amount)<=0;
      const activeBank = state.banks.find(b=>b.id===state.activeBankId);
      const mode = state.mode || "expense";
      let note = document.querySelector('.after-note');
      const parent = document.querySelector('.card');
      if(activeBank && state.amount){
        const newBal = mode==='expense' ? activeBank.balance - (Number(state.amount)||0) : activeBank.balance + (Number(state.amount)||0);
        const val = `<div class="after-note">مانده بعد از این ${mode==='expense'?'خرید':'واریز'}: <b>${fmt(newBal)} تومان</b></div>`;
        if(note) note.outerHTML = val; else parent.insertAdjacentHTML('beforeend', val);
      } else if(note){ note.remove(); }
      // keep caret at end without full rerender
      const pos = e.target.value.length;
      e.target.setSelectionRange(pos,pos);
    });
  }
  const noteInput = document.getElementById('noteInput');
  if(noteInput) noteInput.addEventListener('input', e=>{ state.note = e.target.value; });

  const submitBtn = document.getElementById('submitBtn');
  if(submitBtn) submitBtn.addEventListener('click', submitTransaction);

  document.querySelectorAll('[data-mode]').forEach(el=>{
    el.addEventListener('click', ()=>{ state.mode = el.getAttribute('data-mode'); render(); });
  });

  const openTransfer = document.getElementById('openTransfer');
  if(openTransfer) openTransfer.addEventListener('click', ()=>{
    state.showTransfer = true;
    state._transferFrom = state.banks[0] && state.banks[0].id;
    state._transferTo = state.banks[1] ? state.banks[1].id : (state.banks[0] && state.banks[0].id);
    state._transferAmount = ""; state._transferNote = "";
    render();
  });
  const closeTransferModal = document.getElementById('closeTransferModal');
  if(closeTransferModal) closeTransferModal.addEventListener('click', ()=>{ state.showTransfer=false; render(); });
  const transferOverlay = document.getElementById('transferOverlay');
  if(transferOverlay) transferOverlay.addEventListener('click', e=>{ if(e.target.id==='transferOverlay'){ state.showTransfer=false; render(); } });
  const transferFrom = document.getElementById('transferFrom');
  if(transferFrom) transferFrom.addEventListener('change', e=>{ state._transferFrom = e.target.value; render(); });
  const transferTo = document.getElementById('transferTo');
  if(transferTo) transferTo.addEventListener('change', e=>{ state._transferTo = e.target.value; render(); });
  const transferAmount = document.getElementById('transferAmount');
  if(transferAmount) transferAmount.addEventListener('input', e=>{
    state._transferAmount = toEnglishDigits(e.target.value);
    e.target.value = state._transferAmount;
    const btn = document.getElementById('submitTransferBtn');
    if(btn) btn.disabled = !state._transferAmount || Number(state._transferAmount)<=0 || state._transferFrom===state._transferTo;
    const pos = e.target.value.length;
    e.target.setSelectionRange(pos,pos);
  });
  const transferNote = document.getElementById('transferNote');
  if(transferNote) transferNote.addEventListener('input', e=>{ state._transferNote = e.target.value; });
  const submitTransferBtn = document.getElementById('submitTransferBtn');
  if(submitTransferBtn) submitTransferBtn.addEventListener('click', submitTransfer);

  const openAddBank = document.getElementById('openAddBank');
  if(openAddBank) openAddBank.addEventListener('click', ()=>{ state.showAddBank = true; state._newColor = PALETTE[0].id; state._newName=''; state._newBalance=''; render(); });

  const closeModal = document.getElementById('closeModal');
  if(closeModal) closeModal.addEventListener('click', ()=>{ state.showAddBank=false; render(); });
  const overlay = document.getElementById('overlay');
  if(overlay) overlay.addEventListener('click', (e)=>{ if(e.target.id==='overlay'){ state.showAddBank=false; render(); } });

  const newBankName = document.getElementById('newBankName');
  if(newBankName) newBankName.addEventListener('input', e=>{
    state._newName = e.target.value;
    const btn = document.getElementById('addBankBtn');
    if(btn) btn.disabled = !state._newName.trim();
  });
  const newBankBalance = document.getElementById('newBankBalance');
  if(newBankBalance) newBankBalance.addEventListener('input', e=>{ state._newBalance = toEnglishDigits(e.target.value); e.target.value = state._newBalance; });

  document.querySelectorAll('[data-swatch]').forEach(el=>{
    el.addEventListener('click', ()=>{ state._newColor = el.getAttribute('data-swatch'); render(); });
  });

  const addBankBtn = document.getElementById('addBankBtn');
  if(addBankBtn) addBankBtn.addEventListener('click', ()=>{
    if(state._newName && state._newName.trim()) addBank(state._newName.trim(), state._newBalance, state._newColor||PALETTE[0].id);
  });

  document.querySelectorAll('[data-edit-bank]').forEach(el=>{
    el.addEventListener('click', (e)=>{ e.stopPropagation(); openEditBank(el.getAttribute('data-edit-bank')); });
  });
  document.querySelectorAll('[data-delete-bank]').forEach(el=>{
    el.addEventListener('click', (e)=>{ e.stopPropagation(); deleteBank(el.getAttribute('data-delete-bank')); });
  });
  document.querySelectorAll('[data-set-loan-bank]').forEach(el=>{
    el.addEventListener('click', ()=> setLoanCard(el.getAttribute('data-set-loan-bank')));
  });

  const closeEditBankModal = document.getElementById('closeEditBankModal');
  if(closeEditBankModal) closeEditBankModal.addEventListener('click', closeEditBank);
  
  const editBankNameInput = document.getElementById('editBankName');
  if(editBankNameInput) editBankNameInput.addEventListener('input', e=>{ state._editBankName = e.target.value; });
  const editBankBalanceInput = document.getElementById('editBankBalance');
  if(editBankBalanceInput) editBankBalanceInput.addEventListener('input', e=>{ state._editBankBalance = toEnglishDigits(e.target.value); });
  
  document.querySelectorAll('[data-swatch-edit]').forEach(el=>{
    el.addEventListener('click', ()=>{ state._editBankColor = el.getAttribute('data-swatch-edit'); render(); });
  });
  
  const saveEditBankBtn = document.getElementById('saveEditBankBtn');
  if(saveEditBankBtn) saveEditBankBtn.addEventListener('click', saveEditBank);

  const exportBtn = document.getElementById('exportBtn');
  if(exportBtn) exportBtn.addEventListener('click', exportData);
  const importBtn = document.getElementById('importBtn');
  const fileInput = document.getElementById('fileInput');
  if(importBtn && fileInput){
    importBtn.addEventListener('click', ()=>fileInput.click());
    fileInput.addEventListener('change', e=>{
      const file = e.target.files && e.target.files[0];
      if(file) handleImportFile(file);
      e.target.value = '';
    });
  }

  // ---------- tabs ----------
  document.querySelectorAll('[data-tab]').forEach(el=>{
    el.addEventListener('click', ()=>{ state.activeTab = el.getAttribute('data-tab'); render(); });
  });

  // ---------- transfer tab ----------
  const transferFromTab = document.getElementById('transferFromTab');
  if(transferFromTab) transferFromTab.addEventListener('change', e=>{ state._transferFromTab = e.target.value; render(); });
  const transferToTab = document.getElementById('transferToTab');
  if(transferToTab) transferToTab.addEventListener('change', e=>{ state._transferToTab = e.target.value; render(); });
  const transferAmountTab = document.getElementById('transferAmountTab');
  if(transferAmountTab) transferAmountTab.addEventListener('input', e=>{
    state._transferAmountTab = toEnglishDigits(e.target.value);
    const btn = document.getElementById('submitTransferTabBtn');
    if(btn) btn.disabled = !state._transferAmountTab || Number(state._transferAmountTab)<=0 || (state._transferFromTab===state._transferToTab);
  });
  const transferNoteTab = document.getElementById('transferNoteTab');
  if(transferNoteTab) transferNoteTab.addEventListener('input', e=>{ state._transferNoteTab = e.target.value; });
  const submitTransferTabBtn = document.getElementById('submitTransferTabBtn');
  if(submitTransferTabBtn) submitTransferTabBtn.addEventListener('click', ()=>{
    if(!state._transferFromTab || !state._transferToTab || !state._transferAmountTab || Number(state._transferAmountTab)<=0) return;
    if(state._transferFromTab === state._transferToTab){ showToast("بانک مبدا و مقصد نباید یکی باشن"); return; }
    const fromBank = state.banks.find(b=>b.id===state._transferFromTab);
    const toBank = state.banks.find(b=>b.id===state._transferToTab);
    if(!fromBank || !toBank){ showToast("بانک انتخاب‌شده معتبر نیست"); return; }
    if(fromBank.balance < Number(state._transferAmountTab)){ showToast("موجودی بانک مبدا کافی نیست"); return; }

    const amt = Number(state._transferAmountTab);
    fromBank.balance -= amt;
    toBank.balance += amt;
    state.transactions.push({
      id: uid(),
      type: "transfer",
      fromBankId: state._transferFromTab,
      toBankId: state._transferToTab,
      amount: amt,
      note: state._transferNoteTab,
      date: Date.now()
    });
    
    state._transferFromTab = '';
    state._transferToTab = '';
    state._transferAmountTab = '';
    state._transferNoteTab = '';
    saveState(); render();
    showToast("انتقال کارت انجام شد");
  });

  // ---------- installments ----------
  function refreshInstSubmitState(){
    const btn = document.getElementById('submitInstBtn');
    if(btn) btn.disabled = !state._instAmount || Number(state._instAmount)<=0 || !state._instCount || Number(state._instCount)<=0;
  }
  const instName = document.getElementById('instName');
  if(instName) instName.addEventListener('input', e=>{ state._instName = e.target.value; });
  const instAmount = document.getElementById('instAmount');
  if(instAmount) instAmount.addEventListener('input', e=>{
    state._instAmount = toEnglishDigits(e.target.value);
    e.target.value = state._instAmount;
    refreshInstSubmitState();
  });
  const instYear = document.getElementById('instYear');
  if(instYear) instYear.addEventListener('change', e=>{ state._instYear = parseInt(e.target.value); render(); });
  const instMonth = document.getElementById('instMonth');
  if(instMonth) instMonth.addEventListener('change', e=>{ state._instMonth = parseInt(e.target.value); render(); });
  const instDay = document.getElementById('instDay');
  if(instDay) instDay.addEventListener('change', e=>{ state._instDay = parseInt(e.target.value); render(); });
  const instCount = document.getElementById('instCount');
  if(instCount) instCount.addEventListener('input', e=>{
    state._instCount = toEnglishDigits(e.target.value);
    e.target.value = state._instCount;
    refreshInstSubmitState();
  });
  const submitInstBtn = document.getElementById('submitInstBtn');
  if(submitInstBtn) submitInstBtn.addEventListener('click', ()=>{
    if(!state._instAmount || Number(state._instAmount)<=0) return;
    if(!state._instCount || Number(state._instCount)<=0) return;
    const startDate = jalaliToGregorian(state._instYear, state._instMonth, state._instDay).getTime();
    addInstallment(state._instName, state._instAmount, startDate, state._instCount);
    state._instAmount = '';
    state._instName = '';
    state._instCount = '';
    const t = getTodayJalali();
    state._instYear = t.y; state._instMonth = t.m; state._instDay = t.d;
    render();
  });

  // ---------- installment payment checkbox (pays the next due month) ----------
  document.querySelectorAll('[data-inst-id]').forEach(el=>{
    el.addEventListener('change', ()=>{
      if(el.checked) payNextInstallment(el.getAttribute('data-inst-id'));
    });
  });

  // ---------- undo last installment payment ----------
  document.querySelectorAll('[data-undo-inst]').forEach(el=>{
    el.addEventListener('click', ()=> undoLastInstallmentPayment(el.getAttribute('data-undo-inst')));
  });

  // ---------- delete installment ----------
  document.querySelectorAll('[data-delete-inst]').forEach(el=>{
    el.addEventListener('click', ()=>{
      if(confirm('این قسط حذف شود؟')) deleteInstallment(el.getAttribute('data-delete-inst'));
    });
  });

  // ---------- edit installment ----------
  document.querySelectorAll('[data-edit-inst]').forEach(el=>{
    el.addEventListener('click', ()=> openEditInst(el.getAttribute('data-edit-inst')));
  });
  const closeEditInstBtn = document.getElementById('closeEditInst');
  if(closeEditInstBtn) closeEditInstBtn.addEventListener('click', closeEditInst);
  const editInstOverlay = document.getElementById('editInstOverlay');
  if(editInstOverlay) editInstOverlay.addEventListener('click', e=>{ if(e.target.id==='editInstOverlay') closeEditInst(); });
  const editInstName = document.getElementById('editInstName');
  if(editInstName) editInstName.addEventListener('input', e=>{ state._editInstName = e.target.value; });
  const editInstAmount = document.getElementById('editInstAmount');
  if(editInstAmount) editInstAmount.addEventListener('input', e=>{
    state._editInstAmount = toEnglishDigits(e.target.value);
    e.target.value = state._editInstAmount;
  });
  const editInstCount = document.getElementById('editInstCount');
  if(editInstCount) editInstCount.addEventListener('input', e=>{
    state._editInstCount = toEnglishDigits(e.target.value);
    e.target.value = state._editInstCount;
  });
  const editInstYear = document.getElementById('editInstYear');
  if(editInstYear) editInstYear.addEventListener('change', e=>{ state._editInstYear = parseInt(e.target.value); render(); });
  const editInstMonth = document.getElementById('editInstMonth');
  if(editInstMonth) editInstMonth.addEventListener('change', e=>{ state._editInstMonth = parseInt(e.target.value); render(); });
  const editInstDay = document.getElementById('editInstDay');
  if(editInstDay) editInstDay.addEventListener('change', e=>{ state._editInstDay = parseInt(e.target.value); render(); });
  const saveEditInstBtn = document.getElementById('saveEditInstBtn');
  if(saveEditInstBtn) saveEditInstBtn.addEventListener('click', saveEditInst);

  // ---------- edit / delete transaction ----------
  document.querySelectorAll('[data-edit-tx]').forEach(el=>{
    el.addEventListener('click', ()=> openEditTx(el.getAttribute('data-edit-tx')));
  });
  document.querySelectorAll('[data-delete-tx]').forEach(el=>{
    el.addEventListener('click', ()=>{
      if(confirm('این تراکنش حذف شود؟')) deleteTx(el.getAttribute('data-delete-tx'));
    });
  });
  const closeEditTxBtn = document.getElementById('closeEditTx');
  if(closeEditTxBtn) closeEditTxBtn.addEventListener('click', closeEditTx);
  const editTxOverlay = document.getElementById('editTxOverlay');
  if(editTxOverlay) editTxOverlay.addEventListener('click', e=>{ if(e.target.id==='editTxOverlay') closeEditTx(); });
  const editTxAmount = document.getElementById('editTxAmount');
  if(editTxAmount) editTxAmount.addEventListener('input', e=>{
    state._editAmount = toEnglishDigits(e.target.value);
    e.target.value = state._editAmount;
  });
  const editTxNote = document.getElementById('editTxNote');
  if(editTxNote) editTxNote.addEventListener('input', e=>{ state._editNote = e.target.value; });
  const saveEditTxBtn = document.getElementById('saveEditTxBtn');
  if(saveEditTxBtn) saveEditTxBtn.addEventListener('click', saveEditTx);

  const enableNotifBtn = document.getElementById('enableNotifBtn');
  if(enableNotifBtn) enableNotifBtn.addEventListener('click', enableInstallmentNotifications);
}

// ---------- init ----------
loadState();
render();
checkInstallmentReminders();
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) checkInstallmentReminders(); });

// register service worker so the browser offers a real "Install app" prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
