
(function(){
"use strict";
const LS_AUTO_KEY="line_scanner_auto_v2";
const safeRead=()=>{try{return JSON.parse(localStorage.getItem(LS_AUTO_KEY)||"{}")}catch(e){return{}}};
const A=Object.assign({
 bets:[], results:[], calibration:[], lastSync:null,
 provider:{odds:"manual/local",scores:"manual/local",status:"offline-first"}
},safeRead());
function save(){try{localStorage.setItem(LS_AUTO_KEY,JSON.stringify(A))}catch(e){}}
window.LineScannerAuto={A,save};

/* ---------- Exact Asian settlement ---------- */
function splitQuarter(x){
  const n=Number(x);
  if(!Number.isFinite(n)) return [n];
  const q=Math.round(n*4)/4;
  if(Math.abs(q*2-Math.round(q*2))<1e-9) return [q];
  return [q-0.25,q+0.25];
}
function settleHalfHandicap(home,away,line,side){
  const margin=(side==="away"?away-home:home-away);
  const v=margin+Number(line);
  if(v>0) return "win";
  if(Math.abs(v)<1e-9) return "push";
  return "lose";
}
function settleHandicap(home,away,line,side){
  const parts=splitQuarter(line);
  const r=parts.map(p=>settleHalfHandicap(home,away,p,side));
  if(r.length===1)return r[0];
  const w=r.filter(x=>x==="win").length, l=r.filter(x=>x==="lose").length;
  if(w===2)return "win";
  if(l===2)return "lose";
  if(w===1&&r.includes("push"))return "half-win";
  if(l===1&&r.includes("push"))return "half-loss";
  return "push";
}
function settleHalfTotal(total,line,side){
  const v=side==="over"?total-Number(line):Number(line)-total;
  if(v>0)return "win"; if(Math.abs(v)<1e-9)return "push"; return "lose";
}
function settleTotal(home,away,line,side){
  const parts=splitQuarter(line), total=home+away;
  const r=parts.map(p=>settleHalfTotal(total,p,side));
  if(r.length===1)return r[0];
  const w=r.filter(x=>x==="win").length,l=r.filter(x=>x==="lose").length;
  if(w===2)return "win"; if(l===2)return "lose";
  if(w===1&&r.includes("push"))return "half-win";
  if(l===1&&r.includes("push"))return "half-loss";
  return "push";
}
function profitUnit(result,odds){
  const o=Number(odds);
  if(!Number.isFinite(o))return 0;
  if(result==="win")return o-1;
  if(result==="lose")return -1;
  if(result==="half-win")return (o-1)/2;
  if(result==="half-loss")return -0.5;
  return 0;
}
window.LineScannerAuto.settleHandicap=settleHandicap;
window.LineScannerAuto.settleTotal=settleTotal;

/* ---------- Bet registry: multiple independent bets per match ---------- */
function addBet(b){
  const bet=Object.assign({
    id:"B"+Date.now().toString(36)+Math.random().toString(36).slice(2,7),
    createdAt:new Date().toISOString(), status:"open", result:null,
    finalHome:null,finalAway:null, pnl:null
  },b);
  A.bets.push(bet); save(); render();
  return bet;
}
function registerAnalysis(list){return (Array.isArray(list)?list:[list]).filter(Boolean).map(addBet)}
function settleBet(b,home,away){
  let result=null;
  const market=String(b.market||"").toLowerCase();
  if(market.includes("hand")||market==="hc"||market==="spread"){
    result=settleHandicap(home,away,Number(b.line),b.side||"home");
  }else if(market.includes("total")||market.includes("goal")||market==="ou"){
    result=settleTotal(home,away,Number(b.line),b.side||"over");
  }else return null;
  b.finalHome=home;b.finalAway=away;b.result=result;b.status="settled";
  b.pnl=profitUnit(result,b.odds);
  return result;
}
function settleMatch(eventId,homeTeam,awayTeam,home,away){
  let n=0;
  for(const b of A.bets){
    const sameId=eventId && b.eventId===eventId;
    const sameTeams=norm(b.home)===norm(homeTeam)&&norm(b.away)===norm(awayTeam);
    if((sameId||sameTeams)&&b.status!=="settled"){settleBet(b,home,away);n++}
  }
  if(n){A.results.push({eventId,homeTeam,awayTeam,home,away,at:new Date().toISOString(),settled:n});save();render()}
  return n;
}
function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
window.LineScannerAuto.addBet=addBet;
window.LineScannerAuto.registerAnalysis=registerAnalysis;
window.LineScannerAuto.settleMatch=settleMatch;
window.LineScannerAuto.hasOpenBets=()=>A.bets.some(b=>b.status!=='settled');
window.LineScannerAuto.openBets=()=>A.bets.filter(b=>b.status!=='settled');

/* ---------- Calibration / prediction vs reality ---------- */
function recordPrediction(p){
  A.calibration.push(Object.assign({at:new Date().toISOString()},p));
  save();render();
}
function calibration(){
  const rows=A.bets.filter(b=>b.status==="settled"&&Number.isFinite(Number(b.probability)));
  if(!rows.length)return {n:0,hit:null,brier:null,mae:null};
  let hit=0,brier=0,mae=0,n=0;
  for(const b of rows){
    const p=Math.max(0,Math.min(1,Number(b.probability)));
    const y=b.result==="win"?1:b.result==="half-win"?.5:b.result==="push"?null:0;
    if(y===null)continue;
    hit+=(y===1?1:y===.5?.5:0); brier+=(p-y)**2; mae+=Math.abs(p-y); n++;
  }
  return {n,hit:n?hit/n:null,brier:n?brier/n:null,mae:n?mae/n:null};
}
window.LineScannerAuto.calibration=calibration;

/* ---------- Local/offline-first provider abstraction ---------- */
function setProvider(kind,name,fn){
  A.provider[kind]=name||"local";
  if(fn) A.provider[kind+"Fn"]=fn;
  save();render();
}
async function syncScores(){
  const fn=A.provider.scoresFn;
  if(typeof fn!=="function"){A.lastSync=new Date().toISOString();save();render();return {ok:false,reason:"No score provider configured"}}
  const data=await fn();
  if(Array.isArray(data)) for(const e of data){
    if(e.completed && Number.isFinite(Number(e.home)) && Number.isFinite(Number(e.away)))
      settleMatch(e.eventId,e.homeTeam,e.awayTeam,Number(e.home),Number(e.away));
  }
  A.lastSync=new Date().toISOString();save();render();return {ok:true,count:Array.isArray(data)?data.length:0};
}
window.LineScannerAuto.setProvider=setProvider;
window.LineScannerAuto.syncScores=syncScores;

/* ---------- Pattern engine ---------- */
function patternReport(){
  const settled=A.bets.filter(b=>b.status==="settled");
  const groups=new Map();
  for(const b of settled){
    const key=[b.market,b.side,b.lineBucket||b.line,b.oddsBucket||"",b.probBucket||""].join("|");
    const g=groups.get(key)||{key,n:0,w:0,pnl:0,prob:0};
    g.n++;g.w+=(b.result==="win"?1:b.result==="half-win"?.5:0);g.pnl+=Number(b.pnl||0);g.prob+=Number(b.probability||0);
    groups.set(key,g);
  }
  return [...groups.values()].map(g=>Object.assign(g,{hit:g.n?g.w/g.n:null,avgProb:g.n?g.prob/g.n:null}))
    .sort((a,b)=>b.n-a.n);
}
window.LineScannerAuto.patternReport=patternReport;

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function render(){
  const root=document.getElementById("lsAutoPanel"); if(!root)return;
  const c=calibration(), open=A.bets.filter(b=>b.status==="open").length, settled=A.bets.filter(b=>b.status==="settled").length;
  const rep=patternReport().slice(0,8);
  root.innerHTML=`<div class="ls-auto"><h3>⚙ Line Scanner — Motor automático V2</h3>
  <div class="ls-grid">
   <div class="ls-stat">Apuestas registradas<b>${A.bets.length}</b></div>
   <div class="ls-stat">Pendientes<b>${open}</b></div>
   <div class="ls-stat">Liquidadas<b>${settled}</b></div>
   <div class="ls-stat">Muestra calibración<b>${c.n}</b></div>
   <div class="ls-stat">Hit rate<b>${c.hit==null?"—":(c.hit*100).toFixed(1)+"%"}</b></div>
   <div class="ls-stat">Brier<b>${c.brier==null?"—":c.brier.toFixed(4)}</b></div>
  </div>
  <p class="small">Modo de datos: <span class="ls-badge">${esc(A.provider.scores)}</span> · Última sincronización: ${A.lastSync?esc(new Date(A.lastSync).toLocaleString()):"—"}</p>
  <p class="small"><b>LIVE + FINAL:</b> ${A.bets.some(b=>b.status!=="settled")?'monitorización activa; al finalizar se liquidan las apuestas HC/O-U asociadas.':'sin apuestas automáticas pendientes.'}</p>
  <h4>Patrones observados</h4>
  ${rep.length?`<table class="ls-table"><thead><tr><th>Mercado</th><th>Línea</th><th>N</th><th>Prob. media</th><th>Resultado</th><th>P/L</th></tr></thead><tbody>${rep.map(g=>{const a=g.key.split("|");return `<tr><td>${esc(a[0])}</td><td>${esc(a[2])}</td><td>${g.n}</td><td>${g.avgProb==null?"—":(g.avgProb*100).toFixed(1)+"%"}</td><td>${g.hit==null?"—":(g.hit*100).toFixed(1)+"%"}</td><td>${g.pnl.toFixed(3)}</td></tr>`}).join("")}</tbody></table>`:"<div class='small'>Aún no hay suficiente historial liquidado.</div>"}
  </div>`;
}
document.addEventListener("DOMContentLoaded",()=>{
  const anchor=document.querySelector("main")||document.body;
  const d=document.createElement("div");d.id="lsAutoPanel";anchor.prepend(d);render();
});
})();
