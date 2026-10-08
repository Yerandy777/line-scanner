
(function(){'use strict';
const VERSION='V47.0 SCANNER PRO · MATCH INTELLIGENCE';
const WORKER_ENABLED=true;
let WORKER_HEALTHY=false;
const SPORTS=[['football','⚽','Fútbol'],['basketball','🏀','Baloncesto'],['baseball','⚾','Béisbol'],['hockey','🏒','Hockey'],['f1','🏎️','F1'],['mma','🥊','MMA'],['rugby','🏉','Rugby'],['volleyball','🏐','Voleibol'],['tennis','🎾','Tenis']];
const API_CFG={
 football:{label:'Fútbol',base:'https://v3.football.api-sports.io',live:'/fixtures?live=all',upcoming:'/fixtures?date=',kind:'football'},
 basketball:{label:'Baloncesto',base:'https://v1.basketball.api-sports.io',live:'/games?live=all',upcoming:'/games?date=',kind:'games'},
 baseball:{label:'Béisbol',base:'https://v1.baseball.api-sports.io',live:'/games?live=all',upcoming:'/games?date=',kind:'games'},
 hockey:{label:'Hockey',base:'https://v1.hockey.api-sports.io',live:'/games?live=all',upcoming:'/games?date=',kind:'games'},
 rugby:{label:'Rugby',base:'https://v1.rugby.api-sports.io',live:'/games?live=all',upcoming:'/games?date=',kind:'games'},
 volleyball:{label:'Voleibol',base:'https://v1.volleyball.api-sports.io',live:'/games?live=all',upcoming:'/games?date=',kind:'games'},
 f1:{label:'F1',base:'https://v1.formula-1.api-sports.io',live:null,kind:'f1'},
 mma:{label:'MMA',base:'https://v1.mma.api-sports.io',live:null,kind:'unsupported'},
 tennis:{label:'Tenis',base:null,live:null,kind:'unsupported'}
};
const DEMO=[
{id:'d1',sport:'football',league:'LaLiga',home:'Real Madrid',away:'Barcelona',homeLogo:'https://media.api-sports.io/football/teams/541.png',awayLogo:'https://media.api-sports.io/football/teams/529.png',homeScore:2,awayScore:1,status:'LIVE',minute:67,odds:[2.10,3.40,3.20]},
{id:'d2',sport:'football',league:'Premier League',home:'Manchester City',away:'Liverpool',homeLogo:'https://media.api-sports.io/football/teams/50.png',awayLogo:'https://media.api-sports.io/football/teams/40.png',homeScore:1,awayScore:0,status:'LIVE',minute:54,odds:[1.85,3.60,4.20]},
{id:'d3',sport:'football',league:'Champions League',home:'PSG',away:'B. Dortmund',homeLogo:'https://media.api-sports.io/football/teams/85.png',awayLogo:'https://media.api-sports.io/football/teams/165.png',homeScore:0,awayScore:0,status:'LIVE',minute:32,odds:[1.70,3.80,4.80]},
{id:'d4',sport:'football',league:'Bundesliga',home:'Bayer Leverkusen',away:'Bayern Munich',homeLogo:'https://media.api-sports.io/football/teams/168.png',awayLogo:'https://media.api-sports.io/football/teams/157.png',homeScore:2,awayScore:0,status:'FINISHED',minute:90,odds:[3.10,3.50,2.10]},
{id:'d5',sport:'basketball',league:'NBA',home:'Lakers',away:'Celtics',homeScore:88,awayScore:84,status:'LIVE',minute:31,odds:[1.95,2.00]},
{id:'d6',sport:'tennis',league:'ATP',home:'Jugador A',away:'Jugador B',homeScore:1,awayScore:0,status:'LIVE',minute:2,odds:[1.60,2.35]}
];
const memoryStore=new Map();const store={get(k,d){try{const v=window.sessionStorage.getItem(k);return v?JSON.parse(v):(memoryStore.has(k)?memoryStore.get(k):d)}catch{return memoryStore.has(k)?memoryStore.get(k):d}},set(k,v){memoryStore.set(k,v);try{window.sessionStorage.setItem(k,JSON.stringify(v))}catch{}},del(k){memoryStore.delete(k);try{window.sessionStorage.removeItem(k)}catch{}}};
function sessionGet(k){try{return window.sessionStorage.getItem(k)||window.localStorage.getItem(k)||memoryStore.get(k)||''}catch{try{return window.localStorage.getItem(k)||memoryStore.get(k)||''}catch{return memoryStore.get(k)||''}}} function sessionSet(k,v){memoryStore.set(k,v);try{window.sessionStorage.setItem(k,v)}catch{}try{window.localStorage.setItem(k,v)}catch{}} function sessionDel(k){memoryStore.delete(k);try{window.sessionStorage.removeItem(k)}catch{}try{window.localStorage.removeItem(k)}catch{}}
const state={apiCooldownUntil:0,apiRemaining:null,apiLimit:null,apiResetSeconds:null,apiLastStatus:null,page:'home',homeSport:'football',sport:'all',liveFilter:'all',finalFilter:'today',scanRange:'today',scanStatus:'all',scanMarket:'all',scanQuality:'all',scans:store.get('lsp_scans',[]),preds:store.get('lsp_preds',[]),apiKey:sessionGet('lsp_api'),selected:null,online:{},liveCache:{},scheduleCache:{},scoreMemory:{},resolverCache:{},teamSearchCache:{},requestInflight:{},lastPendingRefresh:0,visualSport:(()=>{try{return localStorage.getItem('lsp_visual_sport')||'football'}catch(e){return 'football'}})()};
try{const ps=JSON.parse(localStorage.getItem('lsp_scans')||'null');if(Array.isArray(ps)&&ps.length)state.scans=ps}catch(e){}
try{const pp=JSON.parse(localStorage.getItem('lsp_preds')||'null');if(Array.isArray(pp)&&pp.length)state.preds=pp}catch(e){}
function $(s){return document.querySelector(s)} function $$(s){return [...document.querySelectorAll(s)]}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function page(p,push=true){
 if(!p)return;
 if(push && state.page!==p)history.pushState({page:p},'',`#${p}`);
 state.page=p;
 $$('.screen').forEach(x=>x.classList.toggle('active',x.dataset.page===p));
 $$('[data-page]').forEach(x=>{if(x.classList.contains('nav'))x.classList.toggle('active',x.dataset.page===p)});
 renderPage(p);
 window.scrollTo({top:0,behavior:'instant'});
}
function goBack(){
 if(history.state?.page){history.back();return}
 if(state.page!=='home')page('home');
}
function renderPage(p){
 if(p==='home')renderHome();
 if(p==='live')renderLive();
 if(p==='final')renderFinal();
 if(p==='pred')renderPred();
 if(p==='scanner')renderScanner();
 if(p==='stats')renderStats();
 if(p==='settings')renderSettings();
 if(p==='detail')renderDetail();
}
if(!history.state?.page){try{history.replaceState({page:'home'},'',location.pathname+location.search+'#home')}catch(e){}}
window.addEventListener('popstate',e=>page(e.state?.page||'home',false));
function sportLabel(k){return (SPORTS.find(x=>x[0]===k)||['','',''])[2]||k}
function sportIcon(k){return (SPORTS.find(x=>x[0]===k)||['','🏆'])[1]||'🏆'}
function teamBadge(m,side){
 const name=side==='home'?m.home:m.away, logo=side==='home'?m.homeLogo:m.awayLogo;
 const init=String(name||'?').trim().split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
 let h=0; for(const c of String(name||'').toLowerCase()) h=(h*31+c.charCodeAt(0))>>>0;
 const hue=h%360, hue2=(hue+55)%360;
 return logo?`<div class="badge badge-real"><span class="badge-initials">${init}</span><img src="${esc(logo)}" alt="${esc(name||'Equipo')}" decoding="async" onload="this.previousElementSibling.style.opacity='0'" onerror="this.style.display='none'"></div>`:
 `<div class="badge badge-generated" style="--team-h:${hue}deg;--team-h2:${hue2}deg"><span class="shield-shape"></span><b>${init}</b></div>`;
}
function scoreFX(m){
 const key=String(m.sport)+'|'+String(m.id)+'|'+String(m.home)+'|'+String(m.away);
 const now=(Number(m.homeScore)||0)*100+(Number(m.awayScore)||0);
 const old=state.scoreMemory?.[key];
 state.scoreMemory ||= {};
 state.scoreMemory[key]=now;
 return old!=null && now>old ? ' score-goal' : '';
}
function matchCard(m,button=true){
 const finished=m.status==='FINISHED',up=m.status==='UPCOMING',fx=scoreFX(m); if(fx && state.page==='live') setTimeout(()=>showGoalFlash(m),20);
 const when=fixtureStateLabel(m);
 const sportClass=esc(m.sport||'football');
 return `<div class="card match sport-card sport-${sportClass}${fx}" data-match-key="${esc(String(m.id||m.home+'-'+m.away))}">
   <div class="match-energy"></div>
   <div class="match-head"><span class="sport-chip">${sportIcon(m.sport)} ${esc(sportLabel(m.sport))} · ${esc(m.league||'Competición')}</span><span class="tag">${when}</span></div>
   <div class="teams">
    <div class="team"><div class="team-shield">${teamBadge(m,'home')}</div><strong>${esc(m.home)}</strong></div>
    <div class="score-zone"><div class="score">${up?'—':`${m.homeScore} - ${m.awayScore}`}</div>${m.status==='LIVE'?'<span class="live-dot">LIVE</span>':''}</div>
    <div class="team"><div class="team-shield">${teamBadge(m,'away')}</div><strong>${esc(m.away)}</strong></div>
   </div>
   <div class="meta">${finished?'FINALIZADO':m.status==='LIVE'?`EN VIVO · ${m.minute||''}'`:'PRÓXIMO'}</div>
   ${button?`<div class="odds">${(m.odds||[]).map((o,i)=>`<div class="odd"><span>${m.sport==='tennis'?'Jugador '+(i+1):['1','X','2'][i]||'Mercado'}</span><b>${Number(o).toFixed(2)}</b></div>`).join('')}</div>`:''}
 </div>`
}

function setArenaSport(sport,manual=true){
 const valid=['football','basketball','tennis','baseball','hockey','f1','mma','rugby','volleyball'];
 if(!valid.includes(sport))sport='football';
 const app=$('#app'); app.className='app arena-'+sport;
 const label=sportLabel(sport).toUpperCase();
 const arenaName=$('#arenaName'); if(arenaName)arenaName.textContent=label;
 const subtitles={
  football:'Estadio nocturno · césped, gradas y focos dinámicos',
  basketball:'Arena indoor · parquet, aro y focos de competición',
  tennis:'Court premium · líneas iluminadas y público animado',
  baseball:'Ballpark nocturno · diamante, marcador y focos',
  hockey:'Ice arena · pista helada, boards y luces LED',
  f1:'Circuito nocturno · asfalto, boxes y líneas de velocidad',
  mma:'Fight arena · octágono, luces y energía de combate',
  rugby:'Stadium field · césped y focos de alta intensidad',
  volleyball:'Arena indoor · cancha y red con iluminación dinámica'
 };
 const arenaSub=$('#arenaSub'); if(arenaSub)arenaSub.textContent=subtitles[sport]||'Escenario deportivo · iluminación dinámica';
 $$('.arena-btn').forEach(b=>b.classList.toggle('active',b.dataset.arenaSport===sport));
 state.visualSport=sport;
 if(manual){try{localStorage.setItem('lsp_visual_sport',sport)}catch(e){}}
}
function startVisualRotation(){
 const list=['football','basketball','tennis','baseball','hockey','f1'];
 let i=Math.max(0,list.indexOf(state.visualSport||'football'));
 setInterval(()=>{
  if(state.page!=='home')return;
  i=(i+1)%list.length;
  setArenaSport(list[i],false);
 },8500);
}
function randomThunder(force=false){
 const svg=$('#thunderBolt'), glow=svg?.querySelector('.glow'), core=svg?.querySelector('.core'), flare=$('#thunderFlare');
 if(!svg||!glow||!core||!flare)return;
 const side=Math.random()<.5?'left':'right';
 const startX=side==='left' ? 8+Math.random()*35 : 58+Math.random()*34;
 const endX=Math.max(4,Math.min(96,startX+(Math.random()-.5)*26));
 const points=[]; let x=startX, y=-3; points.push([x,y]);
 const steps=5+Math.floor(Math.random()*6);
 for(let i=1;i<=steps;i++){ y=i*(103/steps); x += (Math.random()-.5)*20; x=Math.max(3,Math.min(97,x)); points.push([x,y]); }
 const d=points.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
 glow.setAttribute('d',d); core.setAttribute('d',d);
 const fx=Math.max(8,Math.min(92,endX+(Math.random()-.5)*12)), fy=20+Math.random()*65;
 flare.style.left=fx+'%'; flare.style.top=fy+'%';
 svg.classList.remove('show'); flare.classList.remove('show'); void svg.offsetWidth;
 svg.classList.add('show'); flare.classList.add('show');
 setTimeout(()=>{svg.classList.remove('show');flare.classList.remove('show')},760);
}
function startRandomThunder(){
 if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const schedule=()=>{const delay=6500+Math.random()*12500;setTimeout(()=>{if(document.visibilityState==='visible' && Math.random()>.12)randomThunder();schedule()},delay)};
 setTimeout(()=>randomThunder(),3200); schedule();
}

function showGoalFlash(m){
 const el=$('#goalFlash'), lightning=$('#electricLayer'); if(!el)return;
 $('#goalFlashText').textContent=`${m.home} ${m.homeScore} - ${m.awayScore} ${m.away}`;
 el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
 if(lightning){lightning.classList.remove('flash');void lightning.offsetWidth;lightning.classList.add('flash');setTimeout(()=>lightning.classList.remove('flash'),1000)}
 setTimeout(()=>el.classList.remove('show'),2600);
}
function bindArena(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-arena-sport]');
  if(b){setArenaSport(b.dataset.arenaSport,true);if(state.page==='home'){state.homeSport=b.dataset.arenaSport;updateHomeSportTabs();renderHome();}return}
 });
}
function renderSports(){$('#sportGrid').innerHTML=SPORTS.map(x=>`<button class="sport sport-${x[0]}" data-sport="${x[0]}"><span class="ico">${x[1]}</span><b>${x[2]}</b><small>Ver en vivo / próximo</small></button>`).join('')}
function todayISO(){const d=new Date();const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function tomorrowISO(){const d=new Date(Date.now()+86400000);const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function normalizeName(s){
 return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\b(fc|cf|sc|afc|ac|club)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
function parseLine(raw){
 const text=String(raw||'').trim();
 if(!text)return {error:'Entrada vacía',raw:text};
 const m=text.match(/^(.*?)\s+(?:vs\.?|v\.?|🆚|contra)\s+(.*)$/i);
 if(!m)return {error:'Formato esperado: Equipo A vs Equipo B [hándicap] (línea de goles)',raw:text};
 let home=m[1].trim(), rest=m[2].trim();
 let line=null,lineText=null,totalSide=null;
 const lm=rest.match(/\(([^()]*)\)\s*$/);
 if(lm){
   lineText=lm[1].trim();rest=rest.slice(0,lm.index).trim();
   const range=lineText.match(/([+-]?\d+(?:[\.,]\d+)?)\s*[-–]\s*([+-]?\d+(?:[\.,]\d+)?)/);
   const nums=lineText.match(/[+-]?\d+(?:[\.,]\d+)?/g)||[];
   if(range){
     let a=Number(range[1].replace(',','.')),b=Number(range[2].replace(',','.'));
     // Goal ranges are normally positive: 2-2.5, 3-3.5, etc.
     if(a>=0&&b<0)b=Math.abs(b);
     line=(a+b)/2;
   }else if(nums.length===1)line=Number(nums[0].replace(',','.'));
   if(/\bunder\b|\bmenos\b/i.test(lineText))totalSide='UNDER';
   else if(/\bover\b|\bmas\b|\bmás\b/i.test(lineText))totalSide='OVER';
 }
 let handicap=null,handicapTeam=null;
 const cleanHandicapSegment=(segment,teamSide)=>{
   let x=String(segment||'').trim();
   // Accept both market forms: `0.5-1 Marseille` and `Marseille +0.5-1`.
   const leading=x.match(/^\s*(?:p\s*)?([+-]?\d+(?:[\.,]\d+)?)(?:\s*[-–/]\s*([+-]?\d+(?:[\.,]\d+)?))?(?=\s+|$)/i);
   const trailing=x.match(/(?:^|\s)(?:p\s*)?([+-]?\d+(?:[\.,]\d+)?)(?:\s*[-–/]\s*([+-]?\d+(?:[\.,]\d+)?))?\s*$/i);
   const hit=leading||trailing;
   if(!hit)return {team:x,handicap:null};
   let a=Number(hit[1].replace(',','.')),h=a;
   if(hit[2]!=null){let b=Number(hit[2].replace(',','.'));if(a<0&&b>0)b=-b;h=(a+b)/2;}
   const cleaned=leading?x.slice(hit[0].length).replace(/^\s+/,'').trim():x.slice(0,hit.index).trim();
   return {team:cleaned,handicap:h,teamSide};
 };
 // Home-side form: Nicaragua +1.5-2 vs Costa Rica
 const homeParsed=cleanHandicapSegment(home,'home');
 // Away-side form: Besiktas vs 0.5-1 Marseille / Juventus vs 2 NEC
 const awayParsed=cleanHandicapSegment(rest,'away');
 if(homeParsed.handicap!=null){handicap=homeParsed.handicap;handicapTeam='home';home=homeParsed.team;rest=awayParsed.team;}
 else if(awayParsed.handicap!=null){handicap=awayParsed.handicap;handicapTeam='away';rest=awayParsed.team;home=homeParsed.team;}
 else {home=homeParsed.team;rest=awayParsed.team;}
 const away=String(rest||'').trim();
 if(!home||!away)return {error:'No se pudieron identificar los dos equipos',raw:text};
 return {raw:text,home,away,line,lineText,totalSide,handicap,handicapTeam};
}
function parseOddsText(raw){
 const t=String(raw||''); const lines=t.split(/\n+/).map(x=>x.trim()).filter(Boolean); const markets={}; let current=null;
 const canon=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
 const set=(market,label,odd)=>{if(!markets[market])markets[market]=[]; const n=Number(String(odd).replace(',','.')); if(Number.isFinite(n)&&n>1)markets[market].push({label,odd:n});};
 for(const line of lines){
  const c=canon(line).replace(/💰/g,'');
  if(/^(ganador|resultado|1x2)/.test(c)){current='winner';continue}
  if(/^(primer tiempo|1er tiempo|first half)/.test(c)){current='firstHalf';continue}
  if(/^(ambos marcan|btts)/.test(c)){current='btts';continue}
  if(/^(goles|total goles|over|under)/.test(c)){current='goals';continue}
  if(/^(tarjetas|cards)/.test(c)){current='cards';continue}
  if(/^(corner|corners)/.test(c)){current='corners';continue}
  if(/^(primer equipo en marcar|first team to score)/.test(c)){current='firstScore';continue}
  if(!current)continue;
  const m=line.match(/^(.*?)\s+x\s*([0-9]+(?:[.,][0-9]+)?)/i); if(!m)continue;
  set(current,m[1].trim(),m[2]);
 }
 return markets;
}
function splitScannerEntries(raw){
 const lines=String(raw||'').split(/\n+/).map(x=>x.trim()).filter(Boolean), out=[]; let cur=null;
 const looksMatch=x=>/\s+(?:vs\.?|v\.?|🆚|contra)\s+/i.test(x);
 for(const line of lines){
  if(looksMatch(line)){if(cur)out.push(cur);cur={matchLine:line,oddsLines:[]};}
  else if(cur)cur.oddsLines.push(line);
 }
 if(cur)out.push(cur); return out.length?out:[{matchLine:String(raw||'').trim(),oddsLines:[]}];
}
function parseProviderOdds(rows,home,away){
 const out={}; const add=(k,label,odd)=>{const n=Number(String(odd??'').replace(',','.'));if(!Number.isFinite(n)||n<=1)return;(out[k]??=[]).push({label:String(label||'').trim(),odd:n})};
 const arr=Array.isArray(rows)?rows:[];
 const mapName=n=>{const x=normalizeName(n);if(/match winner|fulltime result|1x2|winner/.test(x))return'winner';if(/first half/.test(x))return'firstHalf';if(/both teams to score|both teams score|btts/.test(x))return'btts';if(/over under|goals over/.test(x))return'goals';if(/cards/.test(x))return'cards';if(/corners/.test(x))return'corners';if(/first team to score|team to score first/.test(x))return'firstScore';return null};
 for(const book of arr){for(const bet of (book?.bets||[])){const k=mapName(bet?.name);if(!k)continue;for(const v of (bet?.values||[])){let label=v?.value||v?.name||'';if(/home/i.test(label))label=home;else if(/away/i.test(label))label=away;add(k,label,v?.odd)}}}
 for(const k of Object.keys(out)){const dedup=[];for(const x of out[k])if(!dedup.some(y=>y.label===x.label&&y.odd===x.odd))dedup.push(x);out[k]=dedup.slice(0,20)}
 return out;
}
function normalizeOddsGroup(arr){
 const a=(arr||[]).filter(x=>Number.isFinite(x.odd)&&x.odd>1); if(!a.length)return [];
 const inv=a.map(x=>1/x.odd),sum=inv.reduce((n,v)=>n+v,0); return a.map((x,i)=>({...x,implied:Math.round(inv[i]/sum*100)}));
}
function oddsMarketLabel(k){return ({winner:'GANADOR',firstHalf:'PRIMER TIEMPO',btts:'AMBOS MARCAN',goals:'GOLES',cards:'TARJETAS',corners:'CÓRNERS',firstScore:'PRIMER EQUIPO EN MARCAR'})[k]||k}
function poissonProb(lambda,k){lambda=Math.max(0,Number(lambda)||0);k=Math.max(0,Math.floor(Number(k)||0));let p=Math.exp(-lambda);for(let i=1;i<=k;i++)p*=lambda/i;return p}
function poissonOver(lambda,line){const q=Number(line);if(!Number.isFinite(q))return null;const parts=splitQuarter(q);const one=x=>{const n=Math.floor(x);let under=0;for(let k=0;k<=n;k++)under+=poissonProb(lambda,k);return 1-under};if(parts.length===1)return one(parts[0]);return (one(parts[0])+one(parts[1]))/2}
function poissonWinner(homeExp,awayExp){let h=0,d=0,a=0;for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){const p=poissonProb(homeExp,i)*poissonProb(awayExp,j);if(i>j)h+=p;else if(i===j)d+=p;else a+=p}const z=h+d+a||1;return {home:h/z,draw:d/z,away:a/z}}
function modelOddsProbability(x,ctx){
 const total=ctx.totalExp,he=ctx.homeExp,ae=ctx.awayExp,home=ctx.home,away=ctx.away,parsedGlobalLine=ctx.line;
 const side=String(x.side||''), norm=normalizeName(side);
 let p=x.marketProbability, evidence='mercado';
 if(x.market==='GANADOR'){
  const w=poissonWinner(he,ae); if(/empate|draw|tie/.test(norm))p=w.draw*100;else if(norm.includes(normalizeName(home))||normalizeName(home).includes(norm))p=w.home*100;else if(norm.includes(normalizeName(away))||normalizeName(away).includes(norm))p=w.away*100;
  evidence='Poisson + forma + margen';
 }else if(x.market==='GOLES'){
  const m=side.match(/([+-]?\d+(?:[.,]\d+)?)/);const line=m?Number(m[1].replace(',','.')):parsedGlobalLine;
  if(Number.isFinite(line)){const over=poissonOver(total,line);p=/under|menos|^-/i.test(side)?(1-over)*100:over*100;evidence='Poisson de goles + total esperado'}
 }else if(x.market==='AMBOS MARCAN'){
  const yes=(1-Math.exp(-he))*(1-Math.exp(-ae));p=/^no\b|\bno$|^not\b/i.test(norm)?(1-yes)*100:yes*100;evidence='Poisson de goles + ataque/defensa';
 }else if(x.market==='PRIMER EQUIPO EN MARCAR'){
  const sum=Math.max(.001,he+ae);const no=Math.exp(-sum);if(/sin goles|no goal|none/.test(norm))p=no*100;else if(norm.includes(normalizeName(home))||normalizeName(home).includes(norm))p=(1-no)*(he/sum)*100;else if(norm.includes(normalizeName(away))||normalizeName(away).includes(norm))p=(1-no)*(ae/sum)*100;evidence='Tasa de gol esperada'}
 else if(x.market==='PRIMER TIEMPO'){
  const w=poissonWinner(he*.45,ae*.45);if(/empate|draw|tie/.test(norm))p=w.draw*100;else if(norm.includes(normalizeName(home))||normalizeName(home).includes(norm))p=w.home*100;else if(norm.includes(normalizeName(away))||normalizeName(away).includes(norm))p=w.away*100;evidence='Poisson primera mitad'}
 else if(x.market==='TARJETAS'||x.market==='CÓRNERS'){
  const stats=ctx.liveStats||[];let observed=0;
  const label=x.market==='TARJETAS'?'Yellow Cards':'Corner Kicks';
  for(const row of stats){const arr=row.statistics||[];for(const v of arr){if(String(v.type||'').toLowerCase()===label.toLowerCase())observed+=Number(String(v.value??'').replace('%',''))||0}}
  if(observed>0&&ctx.status==='LIVE'){const elapsed=Math.max(1,Number(ctx.minute)||45),proj=observed*90/elapsed;const m=side.match(/([+-]?\d+(?:[.,]\d+)?)/);if(m){const line=Number(m[1].replace(',','.'));const over=poissonOver(proj,line);p=/under|menos|^-/i.test(side)?(1-over)*100:over*100;evidence='estadística LIVE extrapolada'}}
  else {p=x.marketProbability;evidence='sin muestra prepartido suficiente'}
 }
 return {p:Math.max(1,Math.min(99,p)),evidence};
}
function buildOddsAnalysis(odds,parsed,match,baseAnalysis){
 const markets=odds||{}, all=[];let parsedGlobalLine=Number(parsed?.line);if(!Number.isFinite(parsedGlobalLine))parsedGlobalLine=2.5;
 const home=match?.home||parsed.home,away=match?.away||parsed.away;
 const totalExp=Number(baseAnalysis?.totalExpected)||2.5,homeExp=Number(baseAnalysis?.homeExpected)||Math.max(.1,totalExp/2),awayExp=Number(baseAnalysis?.awayExpected)||Math.max(.1,totalExp-homeExp);
 const liveStats=baseAnalysis?.liveStats||[];
 const ctx={totalExp,homeExp,awayExp,home,away,liveStats,line:parsedGlobalLine,status:match?.status,minute:match?.minute};
 for(const [k,rows] of Object.entries(markets)){const norm=normalizeOddsGroup(rows);if(!norm.length)continue;for(const x of norm){const model=modelOddsProbability({market:oddsMarketLabel(k),side:x.label,odd:x.odd,marketProbability:x.implied},ctx);x.modelProbability=Math.round(model.p);x.edge=+(x.modelProbability-x.implied).toFixed(1);x.evidence=model.evidence;all.push({market:oddsMarketLabel(k),side:x.label,odd:x.odd,marketProbability:x.implied,modelProbability:x.modelProbability,edge:x.edge,evidence:x.evidence})}}
 for(const x of all)x.decisionScore=+(x.modelProbability+Math.max(-8,Math.min(8,x.edge))*0.10).toFixed(1);
 const ranked=all.filter(x=>Number.isFinite(x.modelProbability)).sort((a,b)=>(b.decisionScore-a.decisionScore)||(b.modelProbability-a.modelProbability)||(b.edge-a.edge));
 const valueCandidates=ranked.filter(x=>x.modelProbability>=50&&x.decisionScore>=50);
 let primary=valueCandidates[0]||null;
 const winner=ranked.find(x=>x.market==='GANADOR'&&x.modelProbability>=55);
 if(winner&&primary&&winner.modelProbability+5>=primary.modelProbability)primary=winner;
 return {markets,all,ranked,primary};
}
function splitQuarter(n){
 const x=Number(n); if(!Number.isFinite(x))return [];
 const q=Math.round(x*4)/4, frac=Math.round((q-Math.floor(q))*100)/100;
 if(Math.abs(frac-.25)<.001)return [q-.25,q+.25];
 if(Math.abs(frac-.75)<.001)return [q-.25,q+.25];
 return [q];
}
function settleHalf(r1,r2){
 const a=String(r1),b=String(r2);
 if(a==='WIN'&&b==='WIN')return 'WIN';
 if(a==='LOSS'&&b==='LOSS')return 'LOSS';
 if((a==='WIN'&&b==='LOSS')||(a==='LOSS'&&b==='WIN'))return 'PUSH';
 if((a==='WIN'&&b==='PUSH')||(a==='PUSH'&&b==='WIN'))return 'HALF-WIN';
 if((a==='LOSS'&&b==='PUSH')||(a==='PUSH'&&b==='LOSS'))return 'HALF-LOSS';
 if((a==='HALF-WIN'&&b==='LOSS')||(a==='LOSS'&&b==='HALF-WIN'))return 'PUSH';
 if((a==='HALF-LOSS'&&b==='WIN')||(a==='WIN'&&b==='HALF-LOSS'))return 'PUSH';
 if(a===b)return a;
 return 'PUSH';
}
function settleWhole(value){return value>0?'WIN':value<0?'LOSS':'PUSH'}
function settleGoals(total,line,side){
 const n=Number(total),q=Number(line); if(!Number.isFinite(n)||!Number.isFinite(q))return 'PUSH';
 const parts=splitQuarter(q); const evalOne=x=>side==='under'?settleWhole(x-n):settleWhole(n-x);
 if(parts.length===1)return evalOne(parts[0]);
 return settleHalf(evalOne(parts[0]),evalOne(parts[1]));
}
function settleHandicap(margin,handicap){
 const m=Number(margin),h=Number(handicap); if(!Number.isFinite(m)||!Number.isFinite(h))return 'PUSH';
 const parts=splitQuarter(h), evalOne=x=>settleWhole(m+x);
 if(parts.length===1)return evalOne(parts[0]);
 return settleHalf(evalOne(parts[0]),evalOne(parts[1]));
}
function parseAndSettleDemo(parsed,score){
 const total=(Number(score?.homeScore)||0)+(Number(score?.awayScore)||0),margin=(Number(score?.homeScore)||0)-(Number(score?.awayScore)||0),markets={};
 if(parsed?.line!=null){const side=parsed.totalSide||'OVER';markets.total={result:settleGoals(total,parsed.line,side.toLowerCase()),side,line:parsed.line};}
 if(parsed?.handicap!=null){const adj=(parsed.handicapTeam||'home')==='away'?-margin:margin;markets.handicap={result:settleHandicap(adj,parsed.handicap),team:parsed.handicapTeam||'home',line:parsed.handicap};}
 const vals=Object.values(markets).map(x=>x.result).filter(Boolean);let settlement='PENDIENTE';
 if(vals.length===1)settlement=vals[0];
 else if(vals.length>1)settlement='MULTI';
 return {settlement,markets,total,margin};
}
function isFinishedStatus(st){return ['FT','AET','PEN','FINISHED','COMPLETED','3'].includes(String(st||'').toUpperCase())}
function isLiveStatus(st){return ['1H','2H','HT','ET','BT','P','LIVE','IN PLAY','INPLAY','Q1','Q2','Q3','Q4','OT'].includes(String(st||'').toUpperCase())}
async function fetchScheduleSport(sport){const cfg=API_CFG[sport];if(!cfg?.upcoming)throw new Error(cfg?.kind==='unsupported'?'API NO DISPONIBLE':'SCHEDULE NO DISPONIBLE');const now=Date.now(),cached=state.scheduleCache[sport];if(cached&&now-cached.ts<120000)return cached.rows;const j=await apiRequestSport(sport,cfg.upcoming+todayISO());const rows=(j.response||[]).map(x=>mapGame(sport,x));state.scheduleCache[sport]={ts:now,rows};state.online[sport]={ok:true,results:j.results??rows.length};return rows}
async function fetchFocusSport(sport){
 const liveErrorList=[],scheduleErrorList=[];
 let live=[];
 try{live=await fetchLiveSport(sport,true)}catch(e){liveErrorList.push(e)}
 if(live.length){
   return {mode:'LIVE',rows:live.filter(x=>x.status==='LIVE').sort((a,b)=>(b.minute||0)-(a.minute||0)).slice(0,8),liveError:null,scheduleError:null};
 }
 let scheduled=[];
 try{scheduled=await fetchScheduleSport(sport)}catch(e){scheduleErrorList.push(e)}
 const now=Math.floor(Date.now()/1000);
 const rows=scheduled
   .filter(x=>x.status==='UPCOMING'||x.status==='LIVE')
   .filter(x=>(x.timestamp||0)>=now-10*60)
   .sort((a,b)=>(a.timestamp||0)-(b.timestamp||0))
   .slice(0,8);
 return {
   mode:rows.length?'UPCOMING':'EMPTY',
   rows,
   liveError:liveErrorList[0]||null,
   scheduleError:scheduleErrorList[0]||null
 };
}
async function renderSportFocus(sport){state.liveFilter=sport;const label=sportLabel(sport);state.page='live';$$('.screen').forEach(x=>x.classList.toggle('active',x.dataset.page==='live'));$$('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page==='live'));const head=document.querySelector('#liveList');head.innerHTML=`<div class="focus-head"><div><div class="ey">${sportIcon(sport)} ${esc(label.toUpperCase())}</div><h2>Lo que se está jugando o lo próximo</h2><p>Primero se buscan eventos en vivo; si no hay, se muestran los próximos del día.</p></div><button class="ghost" id="focusAllBtn">TODOS</button></div><div class="empty">Consultando ${esc(label)}…</div>`;if(!state.apiKey){const live=DEMO.filter(m=>m.sport===sport&&m.status==='LIVE');const rows=live.length?live:DEMO.filter(m=>m.sport===sport);head.innerHTML=`<div class="focus-head"><div><div class="ey">${sportIcon(sport)} ${esc(label.toUpperCase())}</div><h2>${live.length?'EN VIVO':'MÁS DESTACADO'}</h2></div><button class="ghost" id="focusAllBtn">TODOS</button></div>`+(rows.length?rows.map(m=>matchCard(m)).join(''):'<div class="empty">Modo DEMO: no hay datos para este deporte.</div>');$('#focusAllBtn')?.addEventListener('click',()=>{state.liveFilter='all';renderLive()});return}const f=await fetchFocusSport(sport);const err=f.scheduleError||f.liveError;const title=f.mode==='LIVE'?'EN VIVO':f.mode==='UPCOMING'?'PRÓXIMOS HOY':'SIN EVENTOS';const note=f.mode==='LIVE'?'Partidos que se están jugando ahora.':f.mode==='UPCOMING'?'No hay partido en vivo; aquí están los siguientes del día.':`No se encontraron eventos. ${err?normalizeApiError(err):''}`;head.innerHTML=`<div class="focus-head"><div><div class="ey">${sportIcon(sport)} ${esc(label.toUpperCase())}</div><h2>${title}</h2><p>${esc(note)}</p></div><button class="ghost" id="focusAllBtn">TODOS</button></div>`+(f.rows.length?f.rows.map(m=>matchCard(m)).join(''):'<div class="empty">No hay partidos disponibles para este deporte ahora mismo.</div>');$('#focusAllBtn')?.addEventListener('click',()=>{state.liveFilter='all';renderLive()})}
async function renderHome(){
 const box=$('#featured');
 if(!WORKER_ENABLED&&!state.apiKey){
   $('#apiPill').textContent='DEMO';
   box.innerHTML='<div class="home-demo-warning">MODO DEMO · Conecta una API key para mostrar exclusivamente partidos reales.</div>'+DEMO.map(m=>matchCard(m)).join('');
   return;
 }
 $('#apiPill').textContent='ONLINE';
 box.innerHTML='<div class="home-loading"><span class="loading-ring"></span><div><b>Buscando partidos reales…</b><small>Comprobando eventos en vivo y próximos en las APIs conectadas.</small></div></div>';
 const keys=Object.keys(API_CFG).filter(k=>API_CFG[k]?.base&&(API_CFG[k]?.live||API_CFG[k]?.upcoming));
 const results=await Promise.all(keys.map(async key=>{
   try{
     const f=await fetchFocusSport(key);
     return {key,...f};
   }catch(e){
     state.online[key]={ok:false,error:normalizeApiError(e)};
     return {key,mode:'EMPTY',rows:[],error:e};
   }
 }));
 const all=results.flatMap(r=>(r.rows||[]).map(m=>({...m,homeSource:r.key})));
 const uniq=all.filter((m,i,a)=>a.findIndex(x=>String(x.id)===String(m.id)&&x.sport===m.sport)===i);
 const live=uniq.filter(m=>m.status==='LIVE').sort((a,b)=>(b.minute||0)-(a.minute||0));
 const upcoming=uniq.filter(m=>m.status==='UPCOMING'&&m.timestamp>Date.now()/1000).sort((a,b)=>(a.timestamp||0)-(b.timestamp||0));
 const selected=[...live,...upcoming].slice(0,12);
 const updated=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 const available=selected.length;
 const failures=results.filter(r=>r.error||r.scheduleError&&!(r.rows||[]).length).length;
 box.innerHTML=`
   <div class="home-real-head">
    <div><div class="ey">● DATOS REALES</div><h2>${live.length?'EN VIVO AHORA':'PRÓXIMOS EVENTOS'}</h2>
    <p>${live.length?`${live.length} partido${live.length===1?'':'s'} en juego. Los siguientes aparecen debajo.`:'No hay eventos en vivo detectados. Mostrando los próximos eventos disponibles.'}</p></div>
    <button class="ghost refresh-real" id="refreshHomeBtn">↻ ACTUALIZAR</button>
   </div>
   <div class="home-real-meta"><span>API ONLINE</span><span>${available} eventos</span><span>Actualizado ${updated}</span>${failures?`<span>${failures} fuente${failures===1?'':'s'} sin respuesta</span>`:''}</div>
   ${available?selected.map(m=>matchCard(m)).join(''):'<div class="empty">La API no devolvió eventos reales actuales o próximos. No se muestran partidos inventados.</div>'}`;
 $('#refreshHomeBtn')?.addEventListener('click',()=>renderHome());
}
async function renderLive(){const sport=state.liveFilter==='all'?null:state.liveFilter;const tabs=SPORTS.map(x=>`<button class="ghost ${state.liveFilter===x[0]?'active-filter':''}" data-live-filter="${x[0]}">${x[1]} ${x[2]}</button>`).join('');$('#liveList').innerHTML=`<div class="live-switch"><div class="filter-row"><button class="ghost ${!sport?'active-filter':''}" data-live-filter="all">Todos</button>${tabs}</div></div><div class="empty">Consultando…</div>`;if(!WORKER_ENABLED&&!state.apiKey){let a=DEMO.filter(m=>m.status==='LIVE');if(sport)a=a.filter(m=>m.sport===sport);$('#liveList').innerHTML=`<div class="live-switch"><div class="filter-row"><button class="ghost ${!sport?'active-filter':''}" data-live-filter="all">Todos</button>${tabs}</div></div>`+(a.length?a.map(m=>matchCard(m)).join(''):`<div class="empty">Modo DEMO: no hay ${sport?sportLabel(sport).toLowerCase():'partidos'} en vivo.</div>`);return}const keys=sport?[sport]:Object.keys(API_CFG).filter(k=>API_CFG[k]?.live);const all=[];for(const k of keys){try{all.push(...await fetchLiveSport(k,true))}catch(e){state.online[k]={ok:false,error:normalizeApiError(e)}}}const a=all.filter((m,i,x)=>x.findIndex(y=>y.id===m.id&&y.sport===m.sport)===i);$('#liveList').innerHTML=`<div class="live-switch"><div class="filter-row"><button class="ghost ${!sport?'active-filter':''}" data-live-filter="all">Todos</button>${tabs}</div><span>${a.length} eventos en vivo</span></div>`+(a.length?a.map(m=>matchCard(m)).join(''):`<div class="empty">No hay ${sport?sportLabel(sport).toLowerCase():'partidos'} en vivo ahora. Toca un deporte en Inicio para ver también los próximos.</div>`)}
function normalizeApiError(e){const m=String(e?.message||e);if(m.includes('429')||m.includes('QUOTA'))return 'CUOTA AGOTADA';if(m.includes('401')||m.includes('403')||m.includes('AUTH_REJECTED')||m.includes('FORBIDDEN'))return 'KEY/ACCESO';if(m.includes('NETWORK'))return 'BLOQUEO DE RED/CORS';if(m.includes('TIEMPO'))return 'TIEMPO AGOTADO';return m}
function apiKeyValue(){const el=document.getElementById('apiKey');const input=el?String(el.value||'').replace(/[\r\n\t]/g,'').trim():'';return input&&!/^•+$/.test(input)?input:String(state.apiKey||'').replace(/[\r\n\t]/g,'').trim()}
const WORKER_BASE=(sessionGet('lsp_worker')||'https://flat-term-e886.soleryerandy7.workers.dev').replace(/\/$/,'');
async function checkWorkerHealth(){
 if(!WORKER_ENABLED)return false;
 try{const c=new AbortController(),t=setTimeout(()=>c.abort(),5000);const r=await fetch(WORKER_BASE+'/api/health',{cache:'no-store',signal:c.signal});clearTimeout(t);if(!r.ok)throw new Error('HTTP_'+r.status);const j=await r.json();WORKER_HEALTHY=!!j?.ok&&j?.configured!==false;return WORKER_HEALTHY}catch(e){WORKER_HEALTHY=false;return false}
}

const DIRECT_MIN_INTERVAL=6500;
let lastDirectRequestAt=0;
const inflightRequests=new Map();
async function waitDirectSlot(){
 const wait=Math.max(0,DIRECT_MIN_INTERVAL-(Date.now()-lastDirectRequestAt));
 if(wait) await new Promise(r=>setTimeout(r,wait));
 lastDirectRequestAt=Date.now();
}
function quotaErrorFromResponse(r,j){
 const resetRaw=r.headers.get('x-ratelimit-requests-reset')||r.headers.get('x-ratelimit-reset')||r.headers.get('retry-after')||'';
 const remaining=r.headers.get('x-ratelimit-requests-remaining')||r.headers.get('x-ratelimit-remaining');
 const limit=r.headers.get('x-ratelimit-requests-limit')||r.headers.get('x-ratelimit-limit');
 const reset=Math.max(1,Number(resetRaw)||60);
 state.apiCooldownUntil=Date.now()+reset*1000;
 state.apiRemaining=remaining==null?0:Number(remaining);
 state.apiLimit=limit==null?null:Number(limit);
 state.apiResetSeconds=reset;
 state.apiLastStatus=429;
 return new Error(`QUOTA: límite por minuto alcanzado. Reintento en ${reset}s${limit?` · cuota ${remaining||0}/${limit}`:''}`);
}
function quotaGuard(){
 if(Date.now()<Number(state.apiCooldownUntil||0)){
   const sec=Math.max(1,Math.ceil((state.apiCooldownUntil-Date.now())/1000));
   throw new Error(`QUOTA: API en enfriamiento. Reintento en ${sec}s${state.apiLimit?` · cuota ${state.apiRemaining||0}/${state.apiLimit}`:''}`);
 }
}
async function requestJson(url,headers,timeout=12000){
 quotaGuard();
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),timeout);let r;
 try{r=await fetch(url,{method:'GET',cache:'no-store',headers,signal:c.signal})}
 catch(e){if(e?.name==='AbortError')throw new Error('TIEMPO AGOTADO');throw new Error('NETWORK: no se pudo conectar con la fuente de datos.')}
 finally{clearTimeout(timer)}
 const raw=await r.text();let j={};try{j=JSON.parse(raw)}catch{}
 const errs=j?.errors&&typeof j.errors==='object'?Object.values(j.errors).flat().map(String):[],msg=errs.join(' · ')||j?.message||j?.error||'';
 if(r.status===401)throw new Error('AUTH_REJECTED: clave no autorizada.');
 if(r.status===403)throw new Error('FORBIDDEN: acceso denegado.');
 if(r.status===429)throw quotaErrorFromResponse(r,j);
 if(!r.ok)throw new Error('HTTP_'+r.status+(msg?' · '+msg:''));
 if(errs.length)throw new Error('API_ERROR: '+errs.join(' · '));
 const remaining=r.headers.get('x-ratelimit-requests-remaining')||r.headers.get('x-ratelimit-remaining');
 const limit=r.headers.get('x-ratelimit-requests-limit')||r.headers.get('x-ratelimit-limit');
 if(remaining!=null){state.apiRemaining=Number(remaining);state.apiLimit=limit==null?state.apiLimit:Number(limit);state.apiLastStatus=r.status;}
 return {data:j||{},headers:r.headers,status:r.status};
}
async function requestJsonDedup(url,headers,timeout=12000){
 const key=`${url}|${JSON.stringify(headers||{})}`;
 if(inflightRequests.has(key))return inflightRequests.get(key);
 const promise=requestJson(url,headers,timeout).finally(()=>inflightRequests.delete(key));
 inflightRequests.set(key,promise);return promise;
}
async function apiRequestSport(sport,path,timeout=12000){
 const cfg=API_CFG[sport];if(!cfg||!cfg.base)throw new Error('API NO DISPONIBLE PARA '+sport);
 const cleanPath=String(path||'/');
 const direct=cfg.base+cleanPath;
 const key=apiKeyValue();
 // Cloudflare Worker is the preferred and rate-safe path. A 429 is terminal for this
 // request: NEVER fall back to the direct API key, because that would immediately spend
 // another request and make the quota problem worse.
 if(sport==='football'&&WORKER_ENABLED&&WORKER_HEALTHY){
   const workerUrl=WORKER_BASE+'/api'+cleanPath;
   try{
     const out=await requestJsonDedup(workerUrl,{'Accept':'application/json'},timeout);
     const h=out.headers.get('X-ScannerPro-Cache');
     if(h) state.online.football={ok:true,cache:h,remaining:state.apiRemaining,limit:state.apiLimit};
     return out.data;
   }catch(e){
     const msg=String(e?.message||e);
     if(/QUOTA/.test(msg))throw e;
     if(!key)throw e;
     if(!/HTTP_500|AUTH_REJECTED|FORBIDDEN|NETWORK|TIEMPO/.test(msg))throw e;
   }
 }
 if(!key)throw new Error('FUENTE_NO_CONFIGURADA: conecta Cloudflare Worker o introduce una API key.');
 await waitDirectSlot();
 const out=await requestJsonDedup(direct,{'Accept':'application/json','x-apisports-key':key},timeout);
 return out.data;
}

function mapGame(sport,g){if(sport==='football'){const st=String(g.fixture?.status?.short||'NS').toUpperCase();return {id:g.fixture?.id,sport,league:g.league?.name||'',leagueId:g.league?.id,home:g.teams?.home?.name||'Local',away:g.teams?.away?.name||'Visitante',homeLogo:g.teams?.home?.logo||'',awayLogo:g.teams?.away?.logo||'',homeScore:g.goals?.home??0,awayScore:g.goals?.away??0,status:isFinishedStatus(st)?'FINISHED':isLiveStatus(st)?'LIVE':fixtureStatus(st),statusCode:st,statusLong:g.fixture?.status?.long||'',minute:g.fixture?.status?.elapsed||0,halftimeHome:g.score?.halftime?.home??null,halftimeAway:g.score?.halftime?.away??null,date:g.fixture?.date||'',timestamp:g.fixture?.timestamp||0,odds:[]}}const st=String(g.status?.short??g.status?.long??'').toUpperCase();const finished=isFinishedStatus(st);const live=isLiveStatus(st)||(!finished&&!['NS','NOT STARTED','CANC','CANCELLED','POSTPONED','4','5','6'].includes(st)&&st!=='');return {id:g.id,sport,league:g.league?.name||g.league?.league||g.league||'',home:g.teams?.home?.name||'Local',away:g.teams?.away?.name||'Visitante',homeLogo:g.teams?.home?.logo||g.teams?.home?.image||'',awayLogo:g.teams?.away?.logo||g.teams?.away?.image||'',homeScore:g.scores?.home?.total??g.scores?.home??g.scores?.home?.points??0,awayScore:g.scores?.away?.total??g.scores?.away??g.scores?.away?.points??0,status:finished?'FINISHED':live?'LIVE':fixtureStatus(st),statusCode:st,statusLong:g.status?.long||'',minute:g.status?.timer||g.status?.elapsed||st,date:g.date||g.datetime||'',timestamp:g.timestamp||g.date?.timestamp||0,odds:[]}}
async function fetchLiveSport(sport,cache=true){const cfg=API_CFG[sport];if(!cfg?.live)throw new Error(cfg?.kind==='unsupported'?'API NO DISPONIBLE':'LIVE NO DISPONIBLE');const now=Date.now(),c=state.liveCache[sport];if(cache&&c&&now-c.ts<45000)return c.rows;const j=await apiRequestSport(sport,cfg.live);const rows=(j.response||[]).map(x=>mapGame(sport,x)).filter(x=>x.status==='LIVE');state.liveCache[sport]={ts:now,rows};state.online[sport]={ok:true,results:j.results??rows.length};return rows}
async function testAllApis(){if(!state.apiKey){renderApiMatrix();return}for(const sport of Object.keys(API_CFG)){const cfg=API_CFG[sport];if(!cfg?.base){state.online[sport]={ok:false,error:'NO SOPORTADO POR API-SPORTS'};continue}try{if(cfg.kind==='football')await apiRequestSport(sport,'/status');else if(cfg.kind==='games')await apiRequestSport(sport,cfg.live);else state.online[sport]={ok:false,error:'SIN LIVE ENDPOINT'};if(cfg.kind==='football'||cfg.kind==='games')state.online[sport]={ok:true,error:''}}catch(e){state.online[sport]={ok:false,error:normalizeApiError(e)}}}renderApiMatrix()}
function renderApiMatrix(){const el=$('#apiMatrix');if(!el)return;el.innerHTML=SPORTS.map(x=>{const k=x[0],cfg=API_CFG[k],o=state.online[k];let label='SIN PROBAR',cls='status-warn';if(!WORKER_ENABLED&&!state.apiKey)label='SIN CLAVE';else if(!cfg?.base)label='NO DISPONIBLE';else if(o?.ok){label='ONLINE';cls='status-ok'}else if(o?.error){label=o.error;cls='status-bad'}return `<div class="test"><span>${x[1]} ${x[2]}</span><b class="${cls}">${esc(label)}</b></div>`}).join('')}
function daysAgoISO(n){
 const d=new Date(Date.now()-n*86400000);
 const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
 return `${y}-${m}-${day}`;
}
async function fetchFinishedFootballRange(range){
 if(!WORKER_ENABLED&&!state.apiKey)return [];
 let from,to;
 if(range==='today'){from=to=todayISO();}
 else if(range==='7d'){from=daysAgoISO(7);to=todayISO();}
 else if(range==='30d'){from=daysAgoISO(30);to=todayISO();}
 else {from=daysAgoISO(30);to=todayISO();}
 try{
  const path=from===to?'/fixtures?date='+from:'/fixtures?from='+from+'&to='+to;
  const j=await apiRequestSport('football',path);
  const rows=(j.response||[]).map(x=>mapGame('football',x)).filter(x=>x.status==='FINISHED');
  return rows.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0)).slice(0,100);
 }catch(e){
  state.online.football={ok:false,error:normalizeApiError(e)};
  return [];
 }
}
async function renderFinal(){
 const box=$('#finalList'),pill=$('#finalApiPill');
 $$('.final-range-row [data-final-range]').forEach(x=>x.classList.toggle('active',x.dataset.finalRange===state.finalFilter));
 if(!WORKER_ENABLED&&!state.apiKey){
  if(pill)pill.textContent='DEMO';
  const a=DEMO.filter(m=>m.status==='FINISHED');
  box.innerHTML=a.map(m=>matchCard(m)).join('')||'<div class="empty">Modo DEMO: conecta la API para ver resultados reales.</div>';
  return;
 }
 if(pill)pill.textContent='ONLINE';
 box.innerHTML='<div class="empty"><span class="loading-ring"></span> Consultando resultados reales…</div>';
 const a=await fetchFinishedFootballRange(state.finalFilter);
 box.innerHTML=(a.length?'<div class="small" style="margin:0 3px 8px;color:#00e7ff">● DATOS REALES · API-Football · actualización al abrir esta sección</div>':'')+(a.length?a.map(m=>matchCard(m)).join(''):'<div class="empty">No hay resultados finalizados en este periodo.</div>');
}
function marketLabel(p){const low=String(p?.raw||'').toLowerCase();const arr=[];if(p?.line!=null)arr.push(low.includes('under')||low.includes('menos')?'UNDER':'OVER');if(p?.handicap!=null)arr.push('HÁNDICAP');return arr.join(' + ')||'LÍNEA'}
function isRealSettledScan(s){
 const provider=String(s?.provider||'');
 return !!s?.match?.id && /^API-/.test(provider) && ['GANADA','PERDIDA','PUSH','MEDIA-WIN','MEDIA-LOSS'].includes(s?.settlement);
}
function settledScans(){return state.scans.filter(isRealSettledScan)}
function outcomeScore(s){return s.settlement==='GANADA'||s.settlement==='MEDIA-WIN'?1:s.settlement==='PUSH'?.5:s.settlement==='MEDIA-LOSS'?.25:0}
function outcomeWeight(s,halfLifeDays=45){const t=Date.parse(s?.match?.date||s?.createdAt||'');if(!Number.isFinite(t))return .35;const age=Math.max(0,(Date.now()-t)/86400000);return Math.pow(.5,age/halfLifeDays)}
function weightedRate(rows){
 let w=0,score=0;for(const s of rows){const wt=outcomeWeight(s);w+=wt;score+=wt*outcomeScore(s)}
 return w?Math.round((score/w)*100):null;
}
function learningSimilarity(a,b,market){
 const pa=a?.parsed||a||{}, pb=b?.parsed||b||{};
 const sportA=a?.match?.sport||pa.sport, sportB=b?.match?.sport||pb.sport;
 let score=0, weight=0;
 const add=(ok,w)=>{weight+=w;if(ok)score+=w};
 add(!sportA||!sportB||sportA===sportB,.22);
 add(marketLabel(pa)===marketLabel(pb),.22);
 if(pa.line!=null&&pb.line!=null){const d=Math.abs(Number(pa.line)-Number(pb.line));add(d<=.25,.16);if(d<=.5)score+=.05;}
 else if(pa.line==null&&pb.line==null)add(true,.16);
 if(pa.handicap!=null&&pb.handicap!=null){const d=Math.abs(Number(pa.handicap)-Number(pb.handicap));add((pa.handicapTeam||'home')===(pb.handicapTeam||'home')&&d<=.25,.16);if(d<=.5)score+=.04;}
 else if(pa.handicap==null&&pb.handicap==null)add(true,.16);
 add((a?.featureSnapshot?.status||a?.match?.status||'')===(b?.featureSnapshot?.status||b?.match?.status||''),.06);
 add((a?.featureSnapshot?.dataQuality||a?.analysis?.dataQuality||'')===(b?.featureSnapshot?.dataQuality||b?.analysis?.dataQuality||''),.06);
 const ea=Number(a?.featureSnapshot?.edge),eb=Number(b?.featureSnapshot?.edge);
 if(Number.isFinite(ea)&&Number.isFinite(eb))add(Math.abs(ea-eb)<=.35,.07);else weight+=.07;
 return weight?Math.min(1,score/weight):0;
}
function similarSettledCases(p,match,limit=12){
 const market=marketLabel(p||{}),sport=match?.sport||p?.sport||null;
 return settledScans().map(s=>({s,similarity:learningSimilarity({parsed:p,match},s,market)}))
  .filter(x=>(!sport||!x.s.match?.sport||x.s.match.sport===sport)&&x.similarity>=.48)
  .sort((a,b)=>b.similarity-a.similarity||outcomeWeight(b.s)-outcomeWeight(a.s))
  .slice(0,limit);
}
function learningProfile(p,match=null){
 const done=settledScans(), market=marketLabel(p), sport=p?.sport||match?.sport||null;
 const rawLine=p?.line!=null?p.line:p?.handicap;
 const lineBucket=rawLine!=null?Math.round(Number(rawLine)*4)/4:null;
 const side=p?.handicapTeam||'home';
 const same=(s,strictSport=true)=>{const sp=s.parsed||{};return (!strictSport||!sport||s.match?.sport===sport)&&marketLabel(sp)===market&&(lineBucket==null||Math.abs(Number(sp.line??sp.handicap??999)-lineBucket)<=.001)&&(p?.handicap==null||sp.handicap==null||(sp.handicapTeam||'home')===side)};
 const relevant=done.filter(s=>same(s,true)), marketRows=done.filter(s=>marketLabel(s.parsed)===market), sportRows=sport?done.filter(s=>s.match?.sport===sport):[];
 const rate=weightedRate, effective=a=>a.reduce((n,s)=>n+outcomeWeight(s),0);
 const bucketRate=rate(relevant),marketRate=rate(marketRows),sportRate=rate(sportRows);
 const shrink=(r,n)=>r==null?50:Math.round((r*n+50*6)/(n+6));
 const eff=effective(relevant), marketEff=effective(marketRows), sportEff=effective(sportRows);
 const similar=match?similarSettledCases(p,match):[];
 const simWeight=similar.reduce((n,x)=>n+Math.max(.25,x.similarity)*outcomeWeight(x.s),0);
 const simRate=simWeight?Math.round(similar.reduce((n,x)=>n+Math.max(.25,x.similarity)*outcomeWeight(x.s)*outcomeScore(x.s),0)/simWeight*100):null;
 return {market,sport,lineBucket,side,sample:relevant.length,effectiveSample:+eff.toFixed(2),marketSample:marketRows.length,marketEffectiveSample:+marketEff.toFixed(2),sportSample:sportRows.length,sportEffectiveSample:+sportEff.toFixed(2),bucketRate,marketRate,sportRate,calibratedRate:shrink(bucketRate,eff),historicalConfidence:relevant.length?Math.round(relevant.reduce((n,s)=>n+Number(s.snapshot?.confidence||0),0)/relevant.length):0,patterns:done.filter(s=>s.featureSnapshot).length,similarSample:similar.length,similarRate:simRate,similarityTop:similar.slice(0,5).map(x=>({id:x.s.id,similarity:Math.round(x.similarity*100),settlement:x.s.settlement,fixture:x.s.match?.home+' vs '+x.s.match?.away}))};
}
function prediction(parsed){
 const prior=learningProfile(parsed);let pick='SIN SEÑAL',confidence=38;
 if(parsed.line!=null){const side=parsed.totalSide||'OVER';pick=`${side} ${parsed.line}`;confidence=50;}
 if(parsed.handicap!=null){const side=(parsed.handicapTeam||'home')==='home'?'LOCAL':'VISITANTE';pick=`HÁNDICAP ${side} ${parsed.handicap>0?'+':''}${parsed.handicap}`;confidence=Math.max(confidence,50);}
 if(prior.bucketRate!=null&&prior.effectiveSample>=3)confidence=confidence*.65+prior.calibratedRate*.35;
 const c=Math.max(0,Math.min(95,Math.round(confidence)));
 const priorText=prior.bucketRate!=null?`Historial real ponderado: ${prior.bucketRate}% sobre ${prior.sample} casos (${prior.effectiveSample} efectivos).`:'Sin muestra histórica real suficiente.';
 return {prediction:pick,confidence:c,reason:`Modelo adaptativo V42. ${priorText} El aprendizaje solo usa análisis reales ya liquidados y no modifica decisiones congeladas.`,learningPrior:prior,modelVersion:'V45.6-LEARNING-SIMILARITY'};
}

function summarizeForm(rows,teamId){
 const a=(rows||[]).filter(f=>fixtureStatus(f.fixture?.status?.short)==='FINISHED');
 let gf=0,ga=0,w=0,d=0,l=0;
 for(const f of a){
  const isHome=f.teams?.home?.id===teamId,h=f.goals?.home??0,aw=f.goals?.away??0;
  gf+=isHome?h:aw;ga+=isHome?aw:h;
  const r=isHome?h-aw:aw-h;if(r>0)w++;else if(r===0)d++;else l++;
 }
 return {n:a.length,gf,ga,avgGF:a.length?+(gf/a.length).toFixed(2):0,avgGA:a.length?+(ga/a.length).toFixed(2):0,w,d,l,winRate:a.length?Math.round(w/a.length*100):0};
}
function summarizeH2H(rows,homeId,awayId){
 const a=(rows||[]).filter(f=>fixtureStatus(f.fixture?.status?.short)==='FINISHED').slice(0,5);
 if(!a.length)return {n:0,avgTotal:0,homeMargin:0};
 let total=0,margin=0;
 for(const f of a){
  const h=f.goals?.home??0,aw=f.goals?.away??0;total+=h+aw;
  margin+=(f.teams?.home?.id===homeId?h-aw:aw-h);
 }
 return {n:a.length,avgTotal:+(total/a.length).toFixed(2),homeMargin:+(margin/a.length).toFixed(2)};
}
function liveProjection(parsed,match,totalExp){
 const sport=match?.sport||'football',current=(Number(match?.homeScore)||0)+(Number(match?.awayScore)||0);
 if(sport==='football'){
  const elapsed=Math.max(1,Math.min(90,Number(match?.minute)||45)),remaining=Math.max(0,90-elapsed),pace=current/(elapsed/90),factor=current===0?1:Math.max(.55,Math.min(1.65,pace/Math.max(.35,totalExp))),rem=totalExp*(remaining/90)*(.72+.28*factor);
  return {elapsed,current,remaining,pace:+pace.toFixed(2),paceFactor:+factor.toFixed(2),remainingExpected:+rem.toFixed(2),projectedFinal:+(current+rem).toFixed(2)};
 }
 return {elapsed:match?.minute??'',current,remaining:null,remainingExpected:null,projectedFinal:null,sport};
}
function genericRows(rows){return (rows||[]).map(g=>({id:g.id||g.game?.id||g.fixture?.id,homeId:g.teams?.home?.id,awayId:g.teams?.away?.id,home:g.teams?.home?.name||'Local',away:g.teams?.away?.name||'Visitante',homeScore:Number(g.scores?.home?.total??g.scores?.home?.runs??g.scores?.home??0)||0,awayScore:Number(g.scores?.away?.total??g.scores?.away?.runs??g.scores?.away??0)||0,status:fixtureStatus(g.status?.short||g.status?.long||'')}));}
function genericForm(rows,teamId){const a=genericRows(rows).filter(x=>x.status==='FINISHED');let total=0,margin=0,n=0,w=0,d=0,l=0;for(const g of a){const home=String(g.homeId)===String(teamId),gf=home?g.homeScore:g.awayScore,ga=home?g.awayScore:g.homeScore;total+=gf+ga;margin+=gf-ga;n++;if(gf>ga)w++;else if(gf===ga)d++;else l++;}return {n,avgTotal:n?+(total/n).toFixed(2):0,avgMargin:n?+(margin/n).toFixed(2):0,w,d,l,winRate:n?Math.round(w/n*100):0};}
function liveStatValue(rows,name,teamIndex){
 const row=Array.isArray(rows)?rows[teamIndex]||{}:{}; const item=(row.statistics||[]).find(x=>String(x.type||'').toLowerCase()===String(name).toLowerCase()); return item?.value??null;
}
function liveStatsSummary(research){
 const rows=research?.liveStats||[]; if(!rows.length)return null;
 const keys=[['Tiros','Total Shots'],['A puerta','Shots on Goal'],['Corners','Corner Kicks'],['Posesión','Ball Possession'],['Tarjetas','Yellow Cards']];
 const out={}; for(const [label,key] of keys)out[label]=[liveStatValue(rows,key,0),liveStatValue(rows,key,1)]; return out;
}
function liveStatsSignals(research){
 const x=liveStatsSummary(research); if(!x)return {signals:[],summary:null}; const sig=[];
 const shots=x['Tiros'],on=x['A puerta'],corn=x['Corners'],pos=x['Posesión'];
 const num=v=>Number(String(v??'').replace('%',''))||0;
 if(shots.some(v=>v!=null)){const diff=num(shots[0])-num(shots[1]);sig.push({name:'Volumen de tiros',value:`${shots[0]??'—'}-${shots[1]??'—'}`,state:Math.abs(diff)>=3?'ok':Math.abs(diff)>=1?'warn':'bad'})}
 if(on.some(v=>v!=null)){const diff=num(on[0])-num(on[1]);sig.push({name:'Tiros a puerta',value:`${on[0]??'—'}-${on[1]??'—'}`,state:Math.abs(diff)>=2?'ok':Math.abs(diff)>=1?'warn':'bad'})}
 if(corn.some(v=>v!=null)){const diff=num(corn[0])-num(corn[1]);sig.push({name:'Corners',value:`${corn[0]??'—'}-${corn[1]??'—'}`,state:Math.abs(diff)>=3?'ok':Math.abs(diff)>=1?'warn':'bad'})}
 if(pos.some(v=>v!=null)){const diff=num(pos[0])-num(pos[1]);sig.push({name:'Posesión',value:`${pos[0]??'—'} / ${pos[1]??'—'}`,state:Math.abs(diff)>=12?'ok':Math.abs(diff)>=5?'warn':'bad'})}
 return {signals:sig,summary:x};
}
function buildResearchGeneric(parsed,match,research){
 const hf=genericForm(research?.homeForm,match?.homeId),af=genericForm(research?.awayForm,match?.awayId),h2h=genericRows(research?.h2h).filter(x=>x.status==='FINISHED').slice(0,5);
 const h2hTotal=h2h.length?+(h2h.reduce((n,x)=>n+x.homeScore+x.awayScore,0)/h2h.length).toFixed(2):0,h2hMargin=h2h.length?+(h2h.reduce((n,x)=>n+x.homeScore-x.awayScore,0)/h2h.length).toFixed(2):0;
 const totals=[hf.avgTotal,af.avgTotal,h2hTotal].filter(x=>x>0),totalExp=totals.length?+(totals.reduce((a,b)=>a+b,0)/totals.length).toFixed(2):0;
 const margins=[hf.avgMargin,-af.avgMargin,h2hMargin],marginExp=+(margins.reduce((a,b)=>a+b,0)/margins.length).toFixed(2),live=match.status==='LIVE',current=(Number(match.homeScore)||0)+(Number(match.awayScore)||0);
 const baseTotal=live&&current>0?Math.max(totalExp,current):totalExp,candidates=[],signals=[];
 if(parsed.line!=null&&baseTotal){const gap=baseTotal-parsed.line,side=parsed.totalSide||(gap>=0?'OVER':'UNDER');signals.push({name:'Total vs línea',value:`${baseTotal} / ${parsed.line}`,state:Math.abs(gap)>=.5?'ok':Math.abs(gap)>=.18?'warn':'bad'});if(Math.abs(gap)>=.18)candidates.push({market:'Over/Under',pick:`${side} ${parsed.line}`,reason:`Base ${baseTotal} frente a línea ${parsed.line}; diferencia ${gap>=0?'+':''}${gap.toFixed(2)}.`});}
 if(parsed.handicap!=null){const adj=marginExp+parsed.handicap,side=adj>=0?'LOCAL':'VISITANTE';signals.push({name:'Margen vs hándicap',value:`${marginExp.toFixed(2)} / ${parsed.handicap}`,state:Math.abs(adj)>=.5?'ok':Math.abs(adj)>=.18?'warn':'bad'});if(Math.abs(adj)>=.18)candidates.push({market:'Hándicap',pick:`HÁNDICAP ${side} ${parsed.handicap>0?'+':''}${parsed.handicap}`,reason:`Margen estimado ${marginExp.toFixed(2)} frente al hándicap ${parsed.handicap}.`});}
 const primary=candidates[0]||{market:marketLabel(parsed),pick:'SIN APUESTA',reason:'Datos insuficientes para superar el umbral mínimo; no se fuerza una selección.'},quality=(hf.n>=2||af.n>=2||h2h.length>=2)?'BUENA':'LIMITADA';let confidence=primary.pick==='SIN APUESTA'?35:55+Math.min(18,Math.abs(parsed.line!=null?baseTotal-parsed.line:marginExp+parsed.handicap)*8);const prior=learningProfile({...parsed,sport:match?.sport},match);if(prior.bucketRate!=null&&prior.effectiveSample>=3)confidence=confidence*.72+prior.bucketRate*.28;confidence=Math.max(0,Math.min(95,Math.round(confidence)));
 const label=API_CFG[match.sport]?.label||match.sport;return {homeForm:hf,awayForm:af,h2h:{n:h2h.length,avgTotal:h2hTotal,homeMargin:h2hMargin},totalExpected:baseTotal,marginExpected:marginExp,liveProjection:live?liveProjection(parsed,match,baseTotal):null,candidates,primary,confidence,reasons:[`Deporte identificado: ${label}.`,`${live?'EN VIVO · marcador '+match.homeScore+'-'+match.awayScore:'PREPARTIDO'} · análisis con unidades propias del deporte.`,`Base histórica de totales: ${baseTotal||'sin muestra'}; margen estimado: ${marginExp.toFixed(2)}.`,h2h.length?`H2H comparable: ${h2h.length}; total medio ${h2hTotal}.`:'H2H: sin muestra suficiente.',prior.bucketRate!=null?`Patrón histórico: ${prior.bucketRate}% sobre ${prior.sample} casos.`:'Patrón histórico: muestra insuficiente.'],signals,dataQuality:quality,learningPrior:prior,decisionMode:live?'LIVE':'PREMATCH',signalScore:{positive:candidates.length,negative:0,total:signals.length},noBet:primary.pick==='SIN APUESTA'};
}

function poissonMarginProb(homeExp,awayExp,line){
 homeExp=Math.max(.01,Number(homeExp)||.01);awayExp=Math.max(.01,Number(awayExp)||.01);
 const parts=splitQuarter(Number(line));
 const one=L=>{let win=0,push=0;for(let h=0;h<=10;h++)for(let a=0;a<=10;a++){const p=poissonProb(homeExp,h)*poissonProb(awayExp,a),adj=h-a+L;if(adj>1e-9)win+=p;else if(Math.abs(adj)<1e-9)push+=p}return win+push*.5};
 return parts.length===1?one(parts[0]):(one(parts[0])+one(parts[1]))/2;
}
function totalMarketProb(lambda,line,type){
 const over=poissonOver(lambda,line);if(!Number.isFinite(over))return null;
 return Math.round((type==='OVER'?over:1-over)*100);
}
function buildResearch(parsed,match,research){
 const hf=summarizeForm(research?.homeForm,match?.homeId);
 const af=summarizeForm(research?.awayForm,match?.awayId);
 const h2h=summarizeH2H(research?.h2h,match?.homeId,match?.awayId);
 const homeExp=(hf.avgGF+af.avgGA)/2;
 const awayExp=(af.avgGF+hf.avgGA)/2;
 let teamTotal=+(homeExp+awayExp).toFixed(2);
 let totalExp=teamTotal;
 let marginExp=+(homeExp-awayExp).toFixed(2);
 // H2H is context, not a replacement for current form. Blend it lightly when enough data exists.
 if(h2h.n>=3){totalExp=+(teamTotal*.72+h2h.avgTotal*.28).toFixed(2);marginExp=+(marginExp*.72+h2h.homeMargin*.28).toFixed(2)}
 const live=match?.status==='LIVE';
 const lp=live?liveProjection(parsed,match,totalExp):null;
 const targetTotal=live&&Number.isFinite(lp?.projectedFinal)?lp.projectedFinal:totalExp;
 const signals=[];
 const candidates=[];
 const liveExtra=liveStatsSignals(research);
 if(live)signals.push(...liveExtra.signals);
 const prior=learningProfile(parsed,match);
 const providerPick=String(research?.providerPrediction?.predictions?.winner?.name||research?.providerPrediction?.predictions?.winner?.comment||'');
 const providerAdvice=String(research?.providerPrediction?.predictions?.advice||'');

 const quality=(()=>{const n=hf.n+af.n+h2h.n,liveEvidence=liveExtra.signals.length;if(n>=12||(n>=8&&liveEvidence>=2))return 'BUENA';if(n>=5||(n>=2&&liveEvidence>=1))return 'MEDIA';if(n>=1||liveEvidence>=1)return 'LIMITADA';return 'NO_APTA'})();
 const qBonus=quality==='BUENA'?7:quality==='MEDIA'?4:quality==='LIMITADA'?1:-8;
 const historyBonus=Number.isFinite(prior.similarRate)?Math.max(-5,Math.min(8,(prior.similarRate-50)*.12)):0;
 const sigmoid=(x,scale)=>50+42*Math.tanh(x/Math.max(.01,scale));

 // Build BOTH sides of the total market. This is important: the engine must compare OVER vs UNDER,
 // not merely choose one side and then display two symmetric numbers.
 if(parsed.line!=null){
   const edge=+(targetTotal-parsed.line).toFixed(2);
   const abs=Math.abs(edge);
   const poissonOverProb=totalMarketProb(Math.max(.05,totalExp),parsed.line,'OVER'); const overProb=Number.isFinite(poissonOverProb)?Math.round(Math.max(5,Math.min(95,poissonOverProb+qBonus+historyBonus))):Math.round(Math.max(5,Math.min(95,sigmoid(edge,.38)+qBonus+historyBonus)));
   const poissonUnderProb=totalMarketProb(Math.max(.05,totalExp),parsed.line,'UNDER'); const underProb=Number.isFinite(poissonUnderProb)?Math.round(Math.max(5,Math.min(95,poissonUnderProb+qBonus+historyBonus))):Math.round(Math.max(5,Math.min(95,sigmoid(-edge,.38)+qBonus+historyBonus)));
   const totalState=abs>=.55?'ok':abs>=.20?'warn':'bad';
   signals.push({name:'Total vs línea',value:`${targetTotal} vs ${parsed.line}`,state:totalState});
   candidates.push({market:'Over/Under',pick:`OVER ${parsed.line}`,side:'OVER',probability:overProb,edge,reason:`Proyección ${targetTotal} frente a ${parsed.line}; diferencia ${edge>=0?'+':''}${edge}.`});
   candidates.push({market:'Over/Under',pick:`UNDER ${parsed.line}`,side:'UNDER',probability:underProb,edge:-edge,reason:`Proyección ${targetTotal} frente a ${parsed.line}; diferencia para UNDER ${(-edge)>=0?'+':''}${(-edge).toFixed(2)}.`});
 }

 // Handicap: calculate the side that actually receives the entered handicap.
 if(parsed.handicap!=null){
   const team=parsed.handicapTeam||'home';
   const adjusted=team==='home'?marginExp+parsed.handicap:-marginExp+parsed.handicap;
   const side=adjusted>=0?'LOCAL':'VISITANTE';
   const abs=Math.abs(adjusted);
   const rawHandicapProb=poissonMarginProb(homeExp,awayExp,team==='home'?parsed.handicap:-parsed.handicap); const handicapProb=Number.isFinite(rawHandicapProb)?Math.round(Math.max(5,Math.min(95,rawHandicapProb+qBonus+historyBonus))):Math.round(Math.max(5,Math.min(95,sigmoid(adjusted,.45)+qBonus+historyBonus)));
   const oppositeProb=100-handicapProb;
   signals.push({name:'Margen vs hándicap',value:`${marginExp} / ajuste ${adjusted.toFixed(2)}`,state:abs>=.55?'ok':abs>=.20?'warn':'bad'});
   const label=`HÁNDICAP ${side} ${parsed.handicap>0?'+':''}${parsed.handicap}`;
   candidates.push({market:'Hándicap',pick:label,side,probability:handicapProb,edge:adjusted,reason:`Margen esperado ${marginExp}; ajuste para ${team==='home'?'local':'visitante'} = ${adjusted.toFixed(2)}.`});
 }

 signals.push({name:'Forma reciente',value:`${hf.n}+${af.n} partidos`,state:(hf.n>=4&&af.n>=4)?'ok':(hf.n||af.n)?'warn':'bad'});
 signals.push({name:'H2H',value:h2h.n?`${h2h.n} partidos · ${h2h.avgTotal} goles`:'SIN MUESTRA',state:h2h.n>=3?'ok':h2h.n?'warn':'bad'});
 if(providerPick||providerAdvice)signals.push({name:'Predicción del proveedor',value:providerPick||providerAdvice.slice(0,42),state:'ok'});

 // Give a small bonus to the requested side when the user explicitly wrote OVER/UNDER,
 // but never allow that preference to override a clearly stronger model signal.
 if(parsed.totalSide){for(const c of candidates)if(c.market==='Over/Under'&&c.side===parsed.totalSide)c.probability=Math.min(95,c.probability+3)}
 const ordered=candidates.filter(c=>Number.isFinite(c.probability)).sort((a,b)=>b.probability-a.probability);
 let primary=ordered[0]||null;
 const second=ordered[1]||null;
 const gap=primary&&second?primary.probability-second.probability:0;
 const evidenceCount=signals.filter(x=>x.state==='ok').length;
 const edgeEnough=primary?Math.abs(Number(primary.edge||0))>=.18:false;
 // Automatic resolution: require real data plus a directional edge. If two markets are nearly tied,
 // the system refuses to manufacture certainty.
 const enough=quality!=='NO_APTA'&&primary&&edgeEnough&&(evidenceCount>=1||quality==='MEDIA'||quality==='BUENA')&&(gap>=4||Math.abs(Number(primary.edge||0))>=.55);
 if(!enough){
   primary={market:marketLabel(parsed),pick:'SIN APUESTA',probability:Math.max(35,primary?.probability||40),edge:primary?.edge||0,reason:'Las opciones están demasiado parejas o la muestra real es insuficiente. El Scanner conserva la línea y no fuerza una apuesta.'};
 }
 let confidence=primary.pick==='SIN APUESTA'?Math.min(55,Math.max(35,primary.probability||40)):Math.max(50,Math.min(95,primary.probability));
 if(prior.bucketRate!=null&&prior.effectiveSample>=3)confidence=Math.round(confidence*.78+prior.calibratedRate*.22);
 if(prior.similarRate!=null&&prior.similarSample>=3)confidence=Math.round(confidence*.82+prior.similarRate*.18);
 confidence=Math.max(0,Math.min(95,confidence));
 const positive=signals.filter(x=>x.state==='ok').length,negative=signals.filter(x=>x.state==='bad').length;
 const reasons=[
   `FUENTE: API-Football · forma ${hf.n}/${af.n} · H2H ${h2h.n} · señales LIVE ${liveExtra.signals.length}.`,
   `Estado: ${live?`EN VIVO · ${match.minute||'?'}' · ${match.homeScore}-${match.awayScore}`:'PREPARTIDO · fixture identificado'}`,
   `Proyección de total: ${totalExp} goles${live?` · proyección final LIVE ${targetTotal}`:''}; línea recibida: ${parsed.line??'no indicada'}.`,
   `Margen estimado: ${marginExp}; hándicap recibido: ${parsed.handicap!=null?`${parsed.handicap} (${parsed.handicapTeam||'home'})`:'no indicado'}.`,
   `Forma: ${match.home} ${hf.avgGF} GF / ${hf.avgGA} GC; ${match.away} ${af.avgGF} GF / ${af.avgGA} GC.`,
   h2h.n?`H2H: ${h2h.n} partidos · promedio ${h2h.avgTotal} goles · margen ${h2h.homeMargin}.`:'H2H: sin muestra suficiente.',
   providerPick?`API-Football prediction: ${providerPick}${providerAdvice?` · ${providerAdvice}`:''}.`:(providerAdvice?`API-Football advice: ${providerAdvice}.`:'Predicción del proveedor: no disponible; el modelo local no la sustituye.'),
   prior.bucketRate!=null?`Patrón de la misma familia: ${prior.bucketRate}% sobre ${prior.sample} casos reales.`:'Patrón histórico: muestra insuficiente.',
   prior.similarSample>=3?`Motor de aprendizaje: ${prior.similarSample} casos similares reales · referencia ${prior.similarRate}%.`:'Motor de aprendizaje: aún no hay casos similares suficientes.',
   `Comparación automática: ${ordered.slice(0,3).map(c=>`${c.pick} ${c.probability}%`).join(' · ')||'sin mercados evaluables'}.`,
   `Regla de seguridad: ${primary.pick==='SIN APUESTA'?'no se fuerza selección cuando la evidencia no separa claramente los mercados.':'se selecciona el mercado con mayor señal independiente y margen suficiente.'}`
 ];
 return {homeForm:hf,awayForm:af,h2h,providerPrediction:research?.providerPrediction||null,totalExpected:totalExp,homeExpected:homeExp,awayExpected:awayExp,marginExpected:marginExp,liveProjection:lp,candidates,primary,confidence,checks:{line:parsed.line,handicap:parsed.handicap},reasons,signals,dataQuality:quality,learningPrior:prior,decisionMode:live?'LIVE':'PREMATCH',signalScore:{positive,negative,total:signals.length},noBet:primary.pick==='SIN APUESTA',liveStats:research?.liveStats||[],liveStatsSummary:liveExtra.summary};
}

function persistScannerData(){store.set('lsp_scans',state.scans);store.set('lsp_preds',state.preds);try{localStorage.setItem('lsp_scans',JSON.stringify(state.scans));localStorage.setItem('lsp_preds',JSON.stringify(state.preds))}catch(e){}}
function applyVoid(s,reason){s.settlement='DEVUELTA';s.settlementDetail=`Apuesta devuelta: ${reason||'evento cancelado o aplazado.'}`;const pp=state.preds.find(z=>z.scanId===s.id);if(pp)pp.settlement='DEVUELTA';persistScannerData()}
function saveScan(scan){state.scans.unshift(scan);state.scans=state.scans.slice(0,100);persistScannerData()}
function updateScannerMetrics(){
 const scans=state.scans||[], pending=scans.filter(x=>!x.settlement||x.settlement==='PENDIENTE').length;
 const wins=scans.filter(x=>x.settlement==='GANADA'||x.settlement==='MEDIA-WIN').length;
 const settled=scans.filter(x=>['GANADA','PERDIDA','PUSH','MEDIA-WIN','MEDIA-LOSS'].includes(x.settlement)).length;
 const rate=settled?Math.round(wins/settled*100):null;
 if($('#scanCount'))$('#scanCount').textContent=scans.length;
 if($('#scanPending'))$('#scanPending').textContent=pending;
 if($('#scanWins'))$('#scanWins').textContent=wins;
 if($('#scanRate'))$('#scanRate').textContent=rate==null?'—':rate+'%';
}
function bindScannerExamples(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-scan-example]');
  if(b){const box=$('#scannerInput');if(box){box.value=b.dataset.scanExample;box.focus();}}
 });
}
function scanMatchesRange(scan){
 const t=Date.parse(scan.createdAt||'');
 if(state.scanRange==='all'||!Number.isFinite(t))return true;
 const age=Date.now()-t;
 if(state.scanRange==='today')return new Date(t).toDateString()===new Date().toDateString();
 if(state.scanRange==='7d')return age<=7*86400000;
 if(state.scanRange==='30d')return age<=30*86400000;
 return true;
}
function scanStatusMatch(s){const st=s.match?.status||'UNKNOWN';if(state.scanStatus==='all')return true;if(state.scanStatus==='LIVE')return st==='LIVE';if(state.scanStatus==='UPCOMING')return st==='UPCOMING';if(state.scanStatus==='PENDIENTE')return !s.settlement||s.settlement==='PENDIENTE';if(state.scanStatus==='SETTLED')return ['GANADA','PERDIDA','PUSH','MEDIA-WIN','MEDIA-LOSS','DEVUELTA'].includes(s.settlement);return true}

function scanMarketMatch(s){
 const m=marketLabel(s.parsed||{});
 return state.scanMarket==='all'||m.includes(state.scanMarket);
}
function scanQualityMatch(s){
 const q=s.analysis?.dataQuality||s.featureSnapshot?.dataQuality||'NO_APTA';
 return state.scanQuality==='all'||q===state.scanQuality;
}
function scanSignalCount(s){return Number(s.analysis?.signalScore?.positive||0)}
function getPatternStats(){
 const done=settledScans().filter(s=>s.featureSnapshot);
 const patterns=[];
 const groups=[
  ['OVER','Over',s=>marketLabel(s.parsed).includes('OVER')],
  ['UNDER','Under',s=>marketLabel(s.parsed).includes('UNDER')],
  ['HÁNDICAP','Hándicap',s=>marketLabel(s.parsed).includes('HÁNDICAP')],
  ['LIVE','Live',s=>s.featureSnapshot.status==='LIVE'],
  ['PREMATCH','Prepartido',s=>s.featureSnapshot.status==='UPCOMING'||s.featureSnapshot.status==='UNKNOWN'],
  ['HIGH_EDGE','Edge alto',s=>Number(s.featureSnapshot.edge||0)>=.5],
  ['HIGH_DATA','Datos altos',s=>(s.featureSnapshot.dataQuality||'')==='BUENA']
 ];
 for(const [id,label,fn] of groups){
   const a=done.filter(fn); if(a.length<3)continue;
   const score=Math.round(a.reduce((n,s)=>n+outcomeScore(s),0)/a.length*100);
   patterns.push({id,label,n:a.length,score});
 }
 return patterns.sort((a,b)=>b.n-a.n);
}
function renderScannerPatterns(){
 const box=$('#scannerPatterns'); if(!box)return;
 const patterns=getPatternStats();
 if(!patterns.length){box.innerHTML='<div class="empty">Aún no hay suficientes resultados liquidados para detectar patrones.</div>';return}
 box.innerHTML=patterns.slice(0,8).map(p=>`<div class="scanner-pattern"><div><b>${esc(p.label)}</b><span>${p.n} casos cerrados · patrón descriptivo, no garantía futura</span></div><strong>${p.score}%</strong></div>`).join('');
 $('#scanPatterns').textContent=patterns.length;
}

function scanOptionSignal(a,parsed,market,side){
 const quality=a?.dataQuality==='BUENA'?8:a?.dataQuality==='MEDIA'?4:a?.dataQuality==='LIMITADA'?0:-6;
 const prior=Number(a?.learningPrior?.similarRate??a?.learningPrior?.bucketRate);
 const hist=Number.isFinite(prior)?(prior-50)*.18:0;
 let edge=0,direction=0;
 if(market==='HÁNDICAP'&&parsed?.handicap!=null){edge=(parsed.handicapTeam||'home')==='away'?-Number(a?.marginExpected||0)+Number(parsed.handicap||0):Number(a?.marginExpected||0)+Number(parsed.handicap||0);direction=edge>=0?1:-1;}
 if(market==='OVER'&&parsed?.line!=null){edge=Number(a?.totalExpected||0)-Number(parsed.line||0);direction=edge>=0?1:-1;}
 if(market==='UNDER'&&parsed?.line!=null){edge=Number(parsed.line||0)-Number(a?.totalExpected||0);direction=edge>=0?1:-1;}
 let raw=50+Math.min(30,Math.abs(edge)*22)*direction+quality+hist;
 const selected=String(a?.primary?.pick||'').toUpperCase();
 const isSelected=(market==='HÁNDICAP'&&selected.includes('HÁNDICAP'))||(market==='OVER'&&selected.includes('OVER'))||(market==='UNDER'&&selected.includes('UNDER'));
 if(isSelected)raw=Math.max(raw,Number(a.confidence||0));
 if(a?.noBet)raw-=8;
 return Math.max(5,Math.min(95,Math.round(raw)));
}
function learningDashboard(){
 const done=settledScans(); const n=done.length; const wins=done.filter(s=>s.settlement==='GANADA'||s.settlement==='MEDIA-WIN').length; const hit=n?Math.round(wins/n*100):null;
 const avgConf=n?Math.round(done.reduce((a,s)=>a+Number(s.snapshot?.confidence||s.analysis?.confidence||0),0)/n):null;
 const recent=done.slice(0,12); const recentWins=recent.filter(s=>s.settlement==='GANADA'||s.settlement==='MEDIA-WIN').length; const recentHit=recent.length?Math.round(recentWins/recent.length*100):null;
 const patterns=getPatternStats();
 return {n,wins,hit,avgConf,recentHit,patterns};
}
function renderScannerLearning(){
 const box=$('#scannerLearning'); if(!box)return; const d=learningDashboard();
 box.innerHTML=`<div class="scanner-v44-learning-grid">
  <div class="scanner-v44-learning-cell"><b>${d.n}</b><span>LIQUIDADAS</span></div>
  <div class="scanner-v44-learning-cell"><b>${d.hit==null?'—':d.hit+'%'}</b><span>EFECTIVIDAD</span></div>
  <div class="scanner-v44-learning-cell"><b>${d.avgConf==null?'—':d.avgConf+'%'}</b><span>CONFIANZA MEDIA</span></div>
  <div class="scanner-v44-learning-cell"><b>${d.recentHit==null?'—':d.recentHit+'%'}</b><span>ÚLTIMAS ${Math.min(12,d.n)}</span></div>
 </div>
 ${d.patterns.length?d.patterns.slice(0,4).map(p=>`<div class="scanner-v44-pattern"><div><b>${esc(p.label)}</b><span>${p.n} casos liquidados · patrón descriptivo</span></div><strong>${p.score}%</strong></div>`).join(''):`<div class="empty">El motor todavía no tiene una muestra real suficiente. No inventa patrones.</div>`}
 <div class="scanner-v44-note">Muestra efectiva, no solo conteo bruto: las decisiones recientes y los patrones de la misma línea tienen más peso. Con pocos casos, la confianza se mantiene limitada.</div>`;
}
function freezeScan(index){
 const s=state.scans[index]; if(!s)return; const now=new Date().toISOString(); s.snapshot=s.snapshot||{}; s.snapshot.frozenAt=s.snapshot.frozenAt||now; s.featureSnapshot=s.featureSnapshot||{}; s.featureSnapshot.frozenAt=s.featureSnapshot.frozenAt||s.snapshot.frozenAt; s.frozen=true; s.frozenAt=s.featureSnapshot.frozenAt; const p=state.preds.find(x=>x.scanId===s.id); if(p){p.frozenAt=s.frozenAt;p.frozen=true} persistScannerData();renderScanner();renderPred();toast('Decisión congelada. El marcador final ya no puede reescribirla.');}
function renderScanner(){
 const box=$('#scannerResults'); if(!box)return; updateScannerMetrics(); renderScannerLearning(); renderScannerPatterns();
 const q=String($('#searchBox')?.value||'').toLowerCase().trim();
 const rows=state.scans.map((s,i)=>({s,i})).filter(({s})=>scanMatchesRange(s)).filter(({s})=>scanStatusMatch(s)).filter(({s})=>scanMarketMatch(s)).filter(({s})=>scanQualityMatch(s)).filter(({s})=>!q||`${s.parsed?.home||''} ${s.parsed?.away||''} ${s.parsed?.raw||''}`.toLowerCase().includes(q));
 if(!rows.length){box.innerHTML='<div class="scanner3-empty">Introduce un partido. El Scanner 3.0 primero intenta identificar el fixture real y después construye la decisión.</div>';return;}
 box.innerHTML=rows.map(({s,i})=>{
  const a=s.analysis||{},p=s.parsed||{},pick=String(a.primary?.pick||s.snapshot?.prediction||'SIN APUESTA'),m=s.match||{};
  const live=m.status==='LIVE', finished=m.status==='FINISHED', upcoming=m.status==='UPCOMING';
  const quality=a.dataQuality||'NO_APTA'; const qLabel={BUENA:'ALTA',MEDIA:'MEDIA',LIMITADA:'LIMITADA',NO_APTA:'NO APTA'}[quality]||quality;
  const prob=(a.candidates||[]).filter(x=>Number.isFinite(Number(x.probability))).sort((x,y)=>Number(y.probability)-Number(x.probability)).slice(0,4);
  const pri=Number(a.confidence??s.snapshot?.confidence)||0;
  const patterns=a.learningPrior||{};
  const sourceError=a.sourceError||!m.id;
  const status=sourceError?'NO CONFIRMADO':fixtureStateLabel(m);
  const statusClass=live?'live':finished?'final':upcoming?'next':'';
  const liveSummary=a.liveStatsSummary||{};
  return `<article class="scanner3-card ${live?'is-live':''}
    <div class="scanner3-top"><div><span class="scanner3-kicker">${esc(API_CFG[m.sport]?.label||m.sport||'FÚTBOL')} · ${esc(m.league||'Fixture')}</span><h2>${esc(p.home||'Equipo local')} <em>vs</em> ${esc(p.away||'Equipo visitante')}</h2></div><span class="scanner3-status ${statusClass}">${esc(status)}</span></div>
    <div class="scanner3-score">${m.id?`${esc(m.homeScore??0)} <b>—</b> ${esc(m.awayScore??0)}`:'—'} ${live?`<small>${esc(m.minute||'?')}'</small>`:''}</div>
    <div class="scanner3-lines"><span>Goles <b>${esc(p.lineText??p.line??'—')}</b></span>${p.handicap!=null?`<span>Hándicap <b>${p.handicap>0?'+':''}${esc(p.handicap)} · ${p.handicapTeam==='away'?esc(p.away):esc(p.home)}</b></span>`:''}<span>Fuente <b>${sourceError?'LOCAL / SIN FIXTURE':esc(s.provider||'API-Football')}</b></span></div>
    <section class="scanner3-decision"><div class="scanner3-label">DECISIÓN DEL SCANNER</div><div class="scanner3-pick ${pick==='SIN APUESTA'?'no':''}">${esc(pick)}</div><div class="scanner3-conf"><div><span>Confianza</span><b>${pri}%</b></div><i><u style="width:${Math.min(100,pri)}%"></u></i><small>${qLabel} · ${patterns.sample||0} casos de la misma familia · ${patterns.similarSample||0} similares</small></div></section>
    <section class="scanner3-grid"><div><b>ESTADO</b><strong>${live?'🔴 EN VIVO':finished?'✓ FINAL':upcoming?'◷ PRÓXIMO':'?'}</strong><small>${m.date?new Date(m.date).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'Sin fecha confirmada'}</small></div><div><b>ANÁLISIS PREVIO</b><strong>${esc(a.totalExpected??'—')}</strong><small>goles esperados · margen ${esc(a.marginExpected??'—')}</small></div><div><b>MEJOR SEÑAL</b><strong>${esc((prob[0]?.probability??'—')+(prob[0]?'%':''))}</strong><small>${esc(prob[0]?.pick||'Sin señal suficiente')}</small></div></section>
    <section class="scanner3-evidence"><div class="scanner3-label">POR QUÉ</div>${(a.reasons||[]).slice(0,6).map((r,n)=>`<div><span>${n+1}</span>${esc(r)}</div>`).join('')}</section>
    ${live&&Object.keys(liveSummary).length?`<section class="scanner3-live"><div class="scanner3-label">LECTURA LIVE</div><div>${Object.entries(liveSummary).map(([k,v])=>`<span><b>${esc(v?.[0]??'—')} - ${esc(v?.[1]??'—')}</b><small>${esc(k)}</small></span>`).join('')}</div></section>`:''}
    <section class="scanner3-pattern"><div class="scanner3-label">PATRÓN PARA FUTURAS APUESTAS</div><div><b>${patterns.similarSample>=3?`${patterns.similarRate}% en casos similares`:'Muestra todavía insuficiente'}</b><span>${patterns.bucketRate!=null?` · misma línea/familia ${patterns.bucketRate}%`:' · se seguirá aprendiendo al liquidarse este análisis'}</span></div>${(patterns.similarityTop||[]).slice(0,3).map(x=>`<small>• ${x.similarity}% parecido · ${esc(x.fixture||'caso histórico')} · ${esc(x.settlement)}</small>`).join('')}</section>
    ${sourceError?`<div class="scanner3-warning"><b>DATOS EXTERNOS NO CONFIRMADOS</b><span>${esc(s.research?.providerError||'El partido no pudo verificarse en la fuente externa. La decisión visible es provisional y no usa un marcador inventado.')}</span></div>`:''}
    <div class="scanner3-actions"><button class="ghost ${s.frozen?'scanner-v44-frozen':''}" data-scan-freeze="${i}">${s.frozen?'✓ DECISIÓN CONGELADA':'❄ CONGELAR DECISIÓN'}</button><button class="ghost" data-scan-detail="${i}">VER ANÁLISIS COMPLETO</button>${m.id&&!finished?`<button class="ghost" data-refresh-scan="${i}">↻ ACTUALIZAR ESTADO</button>`:''}</div>
    <div class="scanner3-settlement"><b>${esc(s.settlement||'PENDIENTE')}</b><span>${esc(s.settlementDetail||'Seguimiento automático activo')}</span></div>
  </article>`;
 }).join('');
}

function fixtureStatus(st){
 const x=String(st||'').toUpperCase();
 if(['FT','AET','PEN','AWD','WO','ABD','CANC','CANCELLED'].includes(x))return ['CANC','CANCELLED'].includes(x)?'CANCELLED':'FINISHED';
 if(['1H','2H','HT','ET','BT','P','LIVE','INT','SUSP'].includes(x))return 'LIVE';
 if(['PST','POSTPONED'].includes(x))return 'POSTPONED';
 if(['TBD','NS','NOT STARTED'].includes(x))return 'UPCOMING';
 return 'UPCOMING';
}
function fixtureStateLabel(m){
 const raw=String(m?.statusCode||'').toUpperCase();
 if(m?.status==='FINISHED')return 'FINAL';
 if(m?.status==='CANCELLED')return 'CANCELADO';
 if(m?.status==='POSTPONED')return 'APLAZADO';
 if(m?.status==='LIVE'){
  if(raw==='HT')return 'DESCANSO';
  if(raw==='INT')return 'INTERMEDIO';
  if(raw==='SUSP')return 'SUSPENDIDO';
  if(raw==='P')return 'PENALTIS';
  return m?.minute?`EN VIVO · ${m.minute}'`:'EN VIVO';
 }
 return m?.date?new Date(m.date).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'PRÓXIMO';
}
function sameTeam(a,b){const x=normalizeName(a),y=normalizeName(b);return x===y||x.includes(y)||y.includes(x)}
async function resolveOnline(p){
 const hint=String(p.raw||'').toLowerCase();
 const alias=hint.match(/\b(nba|mlb|nhl|fiba|baloncesto|basket|beisbol|baseball|hockey|rugby|voleibol|volleyball|futbol|football|tenis|tennis|formula|f1|mma)\b/)?.[1];
 const map={nba:'basketball',fiba:'basketball',baloncesto:'basketball',basket:'basketball',mlb:'baseball',beisbol:'baseball',baseball:'baseball',nhl:'hockey',hockey:'hockey',rugby:'rugby',voleibol:'volleyball',volleyball:'volleyball',futbol:'football',football:'football',tenis:'tennis',tennis:'tennis',formula:'f1',f1:'f1',mma:'mma'};
 const sport=map[alias]||'football';
 if(!API_CFG[sport]?.base||API_CFG[sport].kind==='unsupported')throw new Error('DEPORTE_NO_DISPONIBLE: '+sportLabel(sport));
 const cacheKey=normalizeName(p.home)+'|'+normalizeName(p.away)+'|'+sport;
 const cached=state.resolverCache[cacheKey];
 if(cached&&Date.now()-cached.at<180000)return cached.value;
 if(sport!=='football')return resolveGenericSport(p,sport,cacheKey);
 const q=path=>apiRequestSport('football',path), norm=n=>normalizeName(n);
 const aliases={'alemania':'Germany','espana':'Spain','españa':'Spain','inglaterra':'England','francia':'France','italia':'Italy','portugal':'Portugal','paises bajos':'Netherlands','holanda':'Netherlands','belgica':'Belgium','croacia':'Croatia','serbia':'Serbia','brasil':'Brazil','argentina':'Argentina','colombia':'Colombia','uruguay':'Uruguay','mexico':'Mexico','ecuador':'Ecuador','chile':'Chile','peru':'Peru'};
 async function teamSearch(name){
   const k=norm(name),c=state.teamSearchCache[k];
   if(c&&Date.now()-c.at<86400000)return c.rows;
   const j=await q('/teams?search='+encodeURIComponent(aliases[k]||name));
   const rows=(j.response||[]).map(x=>x.team).filter(Boolean);state.teamSearchCache[k]={at:Date.now(),rows};return rows;
 }
 const [hs,as]=await Promise.all([teamSearch(p.home),teamSearch(p.away)]);
 const pick=(rows,name)=>{const n=norm(name);return rows.find(t=>norm(t.name)===n)||rows.find(t=>sameTeam(t.name,name))||null;};
 const ht=pick(hs,p.home),at=pick(as,p.away);
 if(!ht?.id||!at?.id)throw new Error('EQUIPOS_NO_ENCONTRADOS: '+p.home+' / '+p.away);
 const now=Date.now(), today=new Date(); today.setHours(0,0,0,0);
 const iso=d=>d.toISOString().slice(0,10);
 // One narrow fixture lookup around today. If the match is not there, try the other team once.
 const from=new Date(today.getTime()-2*86400000), to=new Date(today.getTime()+4*86400000);
 const fk='fixture-window:'+ht.id+':'+iso(from)+':'+iso(to);
 let windowRows=state.scheduleCache[fk]&&now-state.scheduleCache[fk].at<120000?state.scheduleCache[fk].rows:null;
 if(!windowRows){const j=await q('/fixtures?team='+ht.id+'&from='+iso(from)+'&to='+iso(to));windowRows=j.response||[];state.scheduleCache[fk]={at:now,rows:windowRows};}
 const teamMatch=g=>{const h=g?.teams?.home?.name||'',v=g?.teams?.away?.name||'';return (sameTeam(h,p.home)&&sameTeam(v,p.away))||(sameTeam(h,p.away)&&sameTeam(v,p.home));};
 let matches=windowRows.filter(teamMatch);
 if(!matches.length){
   const fk2='fixture-window:'+at.id+':'+iso(from)+':'+iso(to);
   let rows2=state.scheduleCache[fk2]&&now-state.scheduleCache[fk2].at<120000?state.scheduleCache[fk2].rows:null;
   if(!rows2){const j=await q('/fixtures?team='+at.id+'&from='+iso(from)+'&to='+iso(to));rows2=j.response||[];state.scheduleCache[fk2]={at:now,rows:rows2};}
   matches=rows2.filter(teamMatch);
 }
 // If the fixture was older than the window, one H2H fallback is allowed; cached results prevent repeats.
 if(!matches.length){
   const hk='h2h:'+ht.id+'-'+at.id,hc=state.scheduleCache[hk];
   if(hc&&now-hc.at<600000)matches=hc.rows;
   else {const j=await q('/fixtures?h2h='+ht.id+'-'+at.id+'&last=20');matches=j.response||[];state.scheduleCache[hk]={at:now,rows:matches};}
 }
 if(!matches.length)throw new Error('PARTIDO_NO_ENCONTRADO: '+p.home+' vs '+p.away);
 const nowSec=Date.now()/1000;
 const live=matches.filter(g=>isLiveStatus(String(g.fixture?.status?.short||'')));
 const future=matches.filter(g=>!isFinishedStatus(String(g.fixture?.status?.short||''))&&(g.fixture?.timestamp||0)>=nowSec-15*60);
 const pool=(live.length?live:future.length?future:matches).slice().sort((a,b)=>Math.abs((a.fixture?.timestamp||0)-nowSec)-Math.abs((b.fixture?.timestamp||0)-nowSec));
 const g=pool[0];
 let match=mapGame('football',g);match.homeId=g.teams?.home?.id;match.awayId=g.teams?.away?.id;
 // Current fixture detail includes events/statistics in one response; this replaces separate statistics/events calls.
 let detail=g,liveStats=[],events=[],detailError='';
 try{
   const dj=await q('/fixtures?id='+g.fixture.id);detail=(dj.response||[])[0]||g;
   match=mapGame('football',detail);match.homeId=detail.teams?.home?.id||match.homeId;match.awayId=detail.teams?.away?.id||match.awayId;
   liveStats=detail.statistics||[];events=detail.events||[];
 }catch(e){detailError=normalizeApiError(e)}
 const teamHistory=async teamId=>{
   const k='team-last:'+teamId,c=state.scheduleCache[k];
   if(c&&now-c.at<900000)return c.rows;
   try{const j=await q('/fixtures?team='+teamId+'&last=8');const rows=j.response||[];state.scheduleCache[k]={at:Date.now(),rows};return rows}catch(e){return []}
 };
 const [homeHistory,awayHistory]=await Promise.all([teamHistory(match.homeId),teamHistory(match.awayId)]);
 const combined=[...(homeHistory||[]),...(awayHistory||[]),...(matches||[])];
 const uniq=new Map();for(const x of combined)if(x?.fixture?.id&&!uniq.has(String(x.fixture.id)))uniq.set(String(x.fixture.id),x);
 const all=[...uniq.values()];
 const h2h=all.filter(x=>{const h=x.teams?.home?.id,v=x.teams?.away?.id;return (String(h)===String(match.homeId)&&String(v)===String(match.awayId))||(String(h)===String(match.awayId)&&String(v)===String(match.homeId));}).filter(x=>isFinishedStatus(String(x.fixture?.status?.short||''))).slice(0,5);
 const homeForm=all.filter(x=>{const h=x.teams?.home?.id,v=x.teams?.away?.id;return (String(h)===String(match.homeId)||String(v)===String(match.homeId))&&isFinishedStatus(String(x.fixture?.status?.short||''));}).sort((a,b)=>(b.fixture?.timestamp||0)-(a.fixture?.timestamp||0)).slice(0,8);
 const awayForm=all.filter(x=>{const h=x.teams?.home?.id,v=x.teams?.away?.id;return (String(h)===String(match.awayId)||String(v)===String(match.awayId))&&isFinishedStatus(String(x.fixture?.status?.short||''));}).sort((a,b)=>(b.fixture?.timestamp||0)-(a.fixture?.timestamp||0)).slice(0,8);
 // Provider prediction is a single pre-match signal and is used only as secondary evidence.
 let providerPrediction=null,predictionError='';
 if(match.status!=='FINISHED'){
   try{const pj=await q('/predictions?fixture='+g.fixture.id);providerPrediction=(pj.response||[])[0]||null}catch(e){predictionError=normalizeApiError(e)}
 }
 const research={homeForm,awayForm,h2h,odds:[],events,liveStats,providerPrediction,sourceMeta:{homeForm:homeForm.length,awayForm:awayForm.length,h2h:h2h.length,liveStats:liveStats.length,events:events.length,apiCalls:'optimized'},statsError:detailError,predictionError};
 const value={match,research,sport};state.resolverCache[cacheKey]={at:Date.now(),value};return value;
}
async function resolveGenericSport(p,sport,cacheKey){
 const cfg=API_CFG[sport];
 if(!cfg?.upcoming)throw new Error('DEPORTE_NO_DISPONIBLE: '+sportLabel(sport));
 const dates=[];for(let i=0;i<4;i++){const d=new Date(Date.now()-i*86400000);dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)}
 const rows=[];const errors=[];
 for(const date of dates){try{const j=await apiRequestSport(sport,cfg.upcoming+date);rows.push(...(j.response||[]).map(x=>mapGame(sport,x)));}catch(e){errors.push(normalizeApiError(e));}}
 const a=normalizeName(p.home),b=normalizeName(p.away);
 const exact=rows.filter(g=>(sameTeam(g.home,a)&&sameTeam(g.away,b))||(sameTeam(g.home,b)&&sameTeam(g.away,a)));
 if(!exact.length)throw new Error('PARTIDO_NO_ENCONTRADO: '+p.home+' vs '+p.away+(errors[0]?' · '+errors[0]:''));
 const live=exact.filter(g=>g.status==='LIVE'),finished=exact.filter(g=>g.status==='FINISHED');
 const now=Date.now()/1000;const future=exact.filter(g=>g.status==='UPCOMING'&&(!g.timestamp||g.timestamp>=now-900));
 const pool=live.length?live:future.length?future:finished.length?finished:exact;pool.sort((x,y)=>Math.abs((x.timestamp||0)-now)-Math.abs((y.timestamp||0)-now));
 const match=pool[0];
 const homeId=match.homeId,awayId=match.awayId;
 const homeForm=rows.filter(g=>String(g.homeId)===String(homeId)||String(g.awayId)===String(homeId)).filter(g=>g.status==='FINISHED').slice(0,10);
 const awayForm=rows.filter(g=>String(g.homeId)===String(awayId)||String(g.awayId)===String(awayId)).filter(g=>g.status==='FINISHED').slice(0,10);
 const h2h=rows.filter(g=>(String(g.homeId)===String(homeId)&&String(g.awayId)===String(awayId))||(String(g.homeId)===String(awayId)&&String(g.awayId)===String(homeId))).filter(g=>g.status==='FINISHED').slice(0,5);
 const value={match,research:{homeForm,awayForm,h2h,liveStats:[]},sport};state.resolverCache[cacheKey]={at:Date.now(),value};return value;
}

function extractTeamStat(stats,teamId,label){
 const row=(stats||[]).find(x=>String(x.team?.id)===String(teamId)); const v=(row?.statistics||[]).find(x=>String(x.type||'').toLowerCase()===String(label||'').toLowerCase());
 const n=Number(String(v?.value??'').replace('%','')); return Number.isFinite(n)?n:null;
}
function settleSelected(parsed,match,analysis){
 const pick=String(analysis?.primary?.pick||'').toUpperCase(); if(!match||match.status!=='FINISHED')return {settlement:'PENDIENTE'};
 const hs=Number(match.homeScore)||0,as=Number(match.awayScore)||0,total=hs+as,margin=hs-as;
 if(/GANADOR|@/.test(pick)&&analysis?.oddsAnalysis?.primary){
   const side=String(analysis.oddsAnalysis.primary.side||'').toLowerCase();
   if(/empate|draw|tie/.test(side))return {settlement:margin===0?'GANADA':'PERDIDA',type:'winner',total,margin,selection:'EMPATE'};
   if(normalizeName(side).includes(normalizeName(match.home))||normalizeName(match.home).includes(normalizeName(side)))return {settlement:margin>0?'GANADA':'PERDIDA',type:'winner',total,margin,selection:match.home};
   if(normalizeName(side).includes(normalizeName(match.away))||normalizeName(match.away).includes(normalizeName(side)))return {settlement:margin<0?'GANADA':'PERDIDA',type:'winner',total,margin,selection:match.away};
   if(/sin goles/.test(side))return {settlement:total===0?'GANADA':'PERDIDA',type:'firstScore',total,margin,selection:'SIN GOLES'};
 }
 if(parsed.line!=null&&/OVER|UNDER/.test(pick)){const type=pick.includes('UNDER')?'under':'over';const r=settleGoals(total,parsed.line,type);return {settlement:r,type,total,margin,selection:`${type.toUpperCase()} ${parsed.line}`}}
 if(parsed.handicap!=null&&/HÁNDICAP|LOCAL|VISITANTE/.test(pick)){const away=/VISITANTE/.test(pick),adj=away?-margin:margin,r=settleHandicap(adj,parsed.handicap);return {settlement:r,type:'handicap',total,margin,selection:`${away?'VISITANTE':'LOCAL'} ${parsed.handicap}`}}
 if(analysis?.oddsAnalysis?.primary){
  const o=analysis.oddsAnalysis.primary, side=String(o.side||'').toLowerCase(), market=o.market;
  if(market==='AMBOS MARCAN'){const yes=/si|yes/.test(side);return {settlement:((hs>0&&as>0)===yes)?'GANADA':'PERDIDA',type:'btts',total,margin,selection:o.side};}
  if(market==='GOLES'){const m=side.match(/([+-]?\d+(?:[.,]\d+)?)/);if(m){const line=Number(m[1].replace(',','.'));const under=/-|under|menos/.test(side);return {settlement:settleGoals(total,line,under?'under':'over'),type:'goals',total,margin,selection:o.side};}}
  if(market==='PRIMER TIEMPO'){const h=Number(match.halftimeHome??0),a=Number(match.halftimeAway??0);if(/empate|draw/.test(side))return {settlement:h===a?'GANADA':'PERDIDA',type:'firstHalf',selection:o.side,total,margin};const homeSel=normalizeName(side).includes(normalizeName(match.home));return {settlement:(homeSel?h>a:a>h)?'GANADA':'PERDIDA',type:'firstHalf',selection:o.side,total,margin};}
  if(market==='PRIMER EQUIPO EN MARCAR'){
   if(total===0)return {settlement:/sin goles/.test(side)?'GANADA':'PERDIDA',type:'firstScore',total,margin,selection:o.side};
   const goals=(analysis?.research?.events||[]).filter(e=>/goal/i.test(String(e.type||''))&&!/missed/i.test(String(e.detail||''))).sort((a,b)=>(Number(a.time?.elapsed)||0)-(Number(b.time?.elapsed)||0));
   if(goals.length){const first=goals[0];const firstTeam=String(first.team?.name||'');const ok=normalizeName(firstTeam)===normalizeName(side)||normalizeName(firstTeam).includes(normalizeName(side))||normalizeName(side).includes(normalizeName(firstTeam));return {settlement:ok?'GANADA':'PERDIDA',type:'firstScore',total,margin,selection:o.side};}
   return {settlement:'PENDIENTE',type:'firstScore',total,margin,selection:o.side,detail:'No hay secuencia de goles disponible para liquidar este mercado.'};
  }
  if((market==='TARJETAS'||market==='CÓRNERS')&&analysis?.researchStats){
   const label=market==='TARJETAS'?'Yellow Cards':'Corner Kicks'; const hv=extractTeamStat(analysis.researchStats,match.homeId,label),av=extractTeamStat(analysis.researchStats,match.awayId,label);const sum=(hv??0)+(av??0);const m=side.match(/([+-]?\d+(?:[.,]\d+)?)/);if(m){const line=Number(m[1].replace(',','.'));return {settlement:settleGoals(sum,line,/-|under|menos/.test(side)?'under':'over'),type:market,total:sum,margin,selection:o.side};}
  }
 }
 return {settlement:'PENDIENTE'};
}
function buildLocalLineAnalysis(parsed,pastedOdds={},sourceMessage=''){
 const base=prediction(parsed);
 const candidates=[];
 if(parsed.line!=null){
   const explicit=parsed.totalSide;
   const overP=explicit==='OVER'?51:50, underP=explicit==='UNDER'?51:50;
   candidates.push({market:'Over/Under',pick:`OVER ${parsed.line}`,side:'OVER',probability:overP,edge:0,reason:'Señal provisional basada únicamente en la línea introducida.'});
   candidates.push({market:'Over/Under',pick:`UNDER ${parsed.line}`,side:'UNDER',probability:underP,edge:0,reason:'Señal provisional basada únicamente en la línea introducida.'});
 }
 if(parsed.handicap!=null){
   const team=(parsed.handicapTeam||'home')==='home'?'LOCAL':'VISITANTE';
   const p=50;
   candidates.push({market:'Hándicap',pick:`HÁNDICAP ${team} ${parsed.handicap>0?'+':''}${parsed.handicap}`,side:team,probability:p,edge:0,reason:'Señal provisional basada en el hándicap introducido.'});
 }
 let primary=candidates.find(c=>c.pick===base.prediction)||candidates[0]||{market:marketLabel(parsed),pick:'SIN APUESTA',probability:40,edge:0,reason:'No hay una línea evaluable.'};
 // If odds were pasted, use their normalized market probabilities as secondary evidence.
 const flat=Object.entries(pastedOdds||{}).flatMap(([market,rows])=>normalizeOddsGroup(rows).map(x=>({...x,market:oddsMarketLabel(market)})));
 if(flat.length){
   const best=flat.slice().sort((a,b)=>b.implied-a.implied)[0];
   const same=candidates.find(c=>normalizeName(c.pick).includes(normalizeName(best.label))||normalizeName(best.label).includes(normalizeName(c.side||'')));
   if(same){same.probability=Math.max(same.probability,Math.min(75,best.implied));primary=same;}
 }
 const reason=`ANÁLISIS PROVISIONAL: ${sourceMessage||'la fuente externa no respondió'}. La línea original se conserva. No se presentan datos de marcador, forma o LIVE como si fueran reales.`;
 return {
   primary, candidates, confidence:Math.round(primary.probability||50),
   reasons:[reason,`Entrada: ${parsed.home} vs ${parsed.away}.`,parsed.line!=null?`Línea de goles: ${parsed.lineText??parsed.line}.`:'Sin línea de goles.',parsed.handicap!=null?`Hándicap: ${parsed.handicap>0?'+':''}${parsed.handicap} para ${parsed.handicapTeam==='away'?parsed.away:parsed.home}.`:'Sin hándicap.'],
   dataQuality:'NO_APTA',decisionMode:'LOCAL_LINE_ONLY',learningPrior:base.learningPrior,
   noBet:true,sourceError:true,provisional:true,totalExpected:null,homeExpected:null,awayExpected:null,marginExpected:null,
   liveProjection:null,signals:[],signalScore:{positive:0,negative:0,total:0},liveStats:[],oddsAnalysis:null
 };
}

async function analyze(){
 const input=String($('#scannerInput')?.value||'').trim();
 const entries=splitScannerEntries(input);
 if(!entries.length||!input){toast('Introduce uno o varios partidos con su línea.');return}
 const btn=$('#analyzeBtn');
 if(btn){btn.disabled=true;btn.textContent='⌁ ANALIZANDO…'}
 let made=0;
 try{
  // Health is advisory. A failed Worker must never prevent Scanner Pro from trying
  // the direct key or from producing a clearly-labelled local result.
  if(!WORKER_HEALTHY)await checkWorkerHealth();
  for(const entry of entries){
   const r=entry.matchLine,p=parseLine(r),createdAt=new Date().toISOString();
   if(!p||p.error){
    saveScan({id:'scan_'+Date.now()+'_'+made,parsed:{raw:r,home:'Entrada',away:'inválida'},snapshot:{prediction:'Entrada inválida',confidence:0,frozenAt:createdAt,reason:p?.error||'Formato inválido'},settlement:'ERROR',settlementDetail:p?.error||'Formato inválido',createdAt});
    made++;continue;
   }
   let snap=prediction(p),match=null,provider='LOCAL PROVISIONAL',research={},analysis=null;
   const pastedOdds=parseOddsText(entry.oddsLines.join('\n'));
   let externalError='';
   try{
    const online=await resolveOnline(p);
    if(online){
      match=online.match;research=online.research||{};
      analysis=match.sport==='football'?buildResearch(p,match,research):buildResearchGeneric(p,match,research);
      analysis.research=research;analysis.researchStats=research.liveStats||[];
      const oddsData=Object.keys(pastedOdds).length?buildOddsAnalysis(pastedOdds,p,match,analysis):null;
      analysis.oddsAnalysis=oddsData;
      if(oddsData)analysis.reasons.push(`Cuotas: ${oddsData.all.length} selecciones en ${Object.keys(pastedOdds).length} mercados. Evidencia secundaria.`);
      snap={...snap,prediction:analysis.primary?.pick||'SIN APUESTA',confidence:analysis.confidence,reason:(analysis.reasons||[]).join(' '),learningPrior:analysis.learningPrior,modelVersion:'V46.0-VERIFIED-ENGINE'};
      provider='API-'+(API_CFG[match.sport]?.label||match.sport);
    }
   }catch(e){externalError=normalizeApiError(e);research={...(research||{}),providerError:externalError};}
   if(!analysis){
    analysis=buildLocalLineAnalysis(p,pastedOdds,externalError||'no se pudo identificar el fixture en la fuente externa');
    analysis.research=research;analysis.researchStats=research.liveStats||[];
    snap={...snap,prediction:analysis.primary?.pick||snap.prediction,confidence:analysis.confidence,reason:analysis.reasons.join(' ')};
   }
   let settlement='PENDIENTE',detail=match?'Seguimiento automático activo.':'Sin fixture real todavía; se puede reintentar cuando la fuente esté disponible.';
   if(match&&['CANCELLED','POSTPONED'].includes(match.status)){settlement='DEVUELTA';detail=`Apuesta devuelta automáticamente: ${fixtureStateLabel(match)}.`}
   else if(match&&match.status==='FINISHED'){
    const x=settleSelected(p,match,analysis);
    if(x.settlement&&x.settlement!=='PENDIENTE'){settlement=x.settlement==='WIN'?'GANADA':x.settlement==='LOSS'?'PERDIDA':x.settlement==='PUSH'?'PUSH':x.settlement.replace('HALF-','MEDIA-');detail=`Liquidación automática de la selección ${x.selection||''} · total ${x.total??'-'} · margen ${x.margin??'-'}`}
   }else if(match&&match.status==='LIVE')detail=`Seguimiento EN VIVO: ${match.homeScore}-${match.awayScore} · ${match.minute||'?'}' · la selección permanece congelada.`;
   const scan={id:'scan_'+Date.now()+'_'+made,parsed:p,snapshot:snap,match,settlement,settlementDetail:detail,createdAt,provider,analysis,research,featureSnapshot:{status:match?.status||'UNKNOWN',minute:match?.minute||0,score:[match?.homeScore??null,match?.awayScore??null],line:p.line,handicap:p.handicap,handicapTeam:p.handicapTeam,decision:analysis.primary?.pick,confidence:analysis.confidence??null,market:marketLabel(p),dataQuality:analysis.dataQuality,model:'V46.0-VERIFIED-ENGINE',oddsAnalysis:analysis.oddsAnalysis||null,edge:analysis.oddsAnalysis?.primary?.edge??0}};
   if(match&&analysis.primary?.pick&&analysis.primary.pick!=='SIN APUESTA'&&analysis.primary?.pick!=='DATOS NO DISPONIBLES'&&!analysis.sourceError){const now=new Date().toISOString();scan.frozen=true;scan.frozenAt=now;scan.snapshot.frozenAt=now;scan.featureSnapshot.frozenAt=now}
   saveScan(scan);state.preds.unshift({id:'pred_'+scan.id,input:r,prediction:snap.prediction,confidence:snap.confidence,reason:snap.reason,settlement,scanId:scan.id,frozen:scan.frozen,frozenAt:scan.frozenAt});state.preds=state.preds.slice(0,100);made++;
  }
 }finally{
  if(btn){btn.disabled=false;btn.textContent='⚡ BUSCAR DATOS Y ANALIZAR'}
  renderScanner();renderPred();renderStats();
  if(made)toast(`${made} partido(s) procesado(s). Se muestra el análisis y el estado real cuando la fuente responde.`);
 }
}

function findDemoMatch(p){const h=normalizeName(p.home),a=normalizeName(p.away);return DEMO.find(m=>(normalizeName(m.home).includes(h)||h.includes(normalizeName(m.home)))&&(normalizeName(m.away).includes(a)||a.includes(normalizeName(m.away))))||null}
function loadDemoScan(){$('#scannerInput').value='Real Santander vs Orsomarso -0.5 (2-2.5)\nTigres vs Atlético (2)\nInternacional vs Independiente (2)';toast('Demo cargada. Pulsa ANALIZAR.')}
function renderStats(){const scans=settledScans(),wins=scans.filter(s=>s.settlement==='GANADA').length,loss=scans.filter(s=>s.settlement==='PERDIDA').length,push=scans.filter(s=>s.settlement==='PUSH').length,total=scans.length,returned=state.scans.filter(s=>s.settlement==='DEVUELTA').length,rate=total?Math.round(scans.reduce((n,s)=>n+outcomeScore(s),0)/total*100):0;const markets={};for(const s of scans){const k=marketLabel(s.parsed);markets[k]??=[];markets[k].push(s)}const patternRows=Object.entries(markets).map(([k,a])=>`<tr><td>${k}</td><td>${a.length}</td><td>${Math.round(a.reduce((n,s)=>n+outcomeScore(s),0)/a.length*100)}%</td><td>${a.filter(s=>s.settlement==='GANADA').length}</td><td>${a.filter(s=>s.settlement==='PERDIDA').length}</td></tr>`).join('');$('#statMetrics').innerHTML=[['Análisis',state.scans.length],['Liquidados',total],['Ganadas',wins],['Perdidas',loss],['Push',push],['Devueltas',returned],['Rendimiento',rate+'%']].map(x=>`<div class="metric"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');$('#teamTable').innerHTML=`<div class="small">El motor aprende solo de resultados ya cerrados. No usa el resultado actual para alterar su snapshot.</div><table class="table"><thead><tr><th>Mercado</th><th>Muestra</th><th>Rend.</th><th>W</th><th>L</th></tr></thead><tbody>${patternRows||'<tr><td colspan="5">Aún no hay muestra suficiente.</td></tr>'}</tbody></table>`;const buckets={};for(const s of scans){const k=s.parsed.line!=null?'Línea '+s.parsed.line:(s.parsed.handicap!=null?'H '+s.parsed.handicap:'Sin línea');buckets[k]??=[];buckets[k].push(s)}$('#lineStats').innerHTML=Object.entries(buckets).map(([k,a])=>`<div class="pattern-row"><b>${esc(k)}</b><span>${a.length} casos · ${Math.round(a.reduce((n,s)=>n+outcomeScore(s),0)/a.length*100)}%</span></div>`).join('')||'<div class="small">Los patrones aparecerán cuando existan resultados liquidados.</div>'}
function renderDetail(){const s=state.selected;if(!s){$('#detailContent').innerHTML='<div class="empty">Selecciona un análisis.</div>';return}const a=s.analysis||{},r=s.research||{},hf=a.homeForm||{},af=a.awayForm||{};const hist=s.settlement&&s.settlement!=='PENDIENTE'?`<div class="analysis-grid"><div class="metric"><b>${esc(s.settlement)}</b><span>Resultado de la apuesta</span></div><div class="metric"><b>${esc(s.match?.homeScore??'—')}-${esc(s.match?.awayScore??'—')}</b><span>Marcador final/actual</span></div></div>`:'<div class="result">Seguimiento: pendiente de resultado final.</div>';$('#detailContent').innerHTML=`<div class="card detail-hero"><div class="ey">ESTUDIO COMPLETO · ${esc(s.provider||'LOCAL')}</div><h2>${esc(s.parsed.home)} vs ${esc(s.parsed.away)}</h2><p class="small">Entrada exacta: ${esc(s.parsed.raw)}</p><div class="analysis-grid"><div class="metric"><b>${s.snapshot.confidence}%</b><span>Confianza congelada</span></div><div class="metric"><b>${esc(a.primary?.pick||s.snapshot.prediction)}</b><span>Opción analítica principal</span></div><div class="metric"><b>${esc(a.totalExpected??'—')}</b><span>Total esperado</span></div><div class="metric"><b>${esc(a.marginExpected??'—')}</b><span>Margen esperado</span></div></div></div><div class="card"><h3>1. Decisión del Scanner</h3><p class="small">Mercado: <b>${marketLabel(s.parsed)}</b> · Línea recibida: <b>${esc(s.parsed.lineText ?? s.parsed.line ?? s.parsed.handicap ?? '—')}</b> · modo: <b>${esc(a.decisionMode||'—')}</b></p><div class="decision-pick">${esc(a.primary?.pick||s.snapshot.prediction)}</div><div class="confidence-meter"><i style="width:${Math.min(100,Number(a.confidence??s.snapshot.confidence)||0)}%"></i></div><p>${esc(a.primary?.reason||s.snapshot.reason)}</p><div class="reason-list">${(a.reasons||[]).map(x=>`<div>${esc(x)}</div>`).join('')}</div><div class="candidate-list">${(a.candidates||[]).map((c,i)=>`<div class="candidate ${i===0?'primary-candidate':''}"><b>${i===0?'PRINCIPAL':'ALTERNATIVA'} · ${esc(c.pick)}</b><span>${esc(c.market)} · ${esc(c.reason)}</span></div>`).join('')}</div></div><div class="card"><h3>2. Forma reciente</h3><div class="analysis-grid"><div class="metric"><b>${hf.avgGF||0}</b><span>${esc(s.match?.home||'Local')} GF/partido</span></div><div class="metric"><b>${hf.avgGA||0}</b><span>${esc(s.match?.home||'Local')} GA/partido</span></div><div class="metric"><b>${af.avgGF||0}</b><span>${esc(s.match?.away||'Visitante')} GF/partido</span></div><div class="metric"><b>${af.avgGA||0}</b><span>${esc(s.match?.away||'Visitante')} GA/partido</span></div></div><p class="small">Muestra: ${hf.n||0} partidos local + ${af.n||0} visitante · calidad de datos: ${esc(a.dataQuality||'—')}</p>${a.liveProjection?`<div class="result"><b>Lectura EN VIVO</b><br><span class="small">${a.liveProjection.elapsed}' · ${a.liveProjection.current} goles actuales · proyección final ${a.liveProjection.projectedFinal} · goles restantes esperados ${a.liveProjection.remainingExpected}</span></div>`:''}</div><div class="card"><h3>3. Modelo externo y contexto</h3><p class="small">${esc(s.snapshot.reason)}</p>${r.apiPrediction?`<div class="result"><b>${esc(r.apiPrediction.advice||'Pronóstico API disponible')}</b><br><span class="small">Under/Over: ${esc(r.apiPrediction.under_over||'—')} · marcador estimado: ${esc(r.apiPrediction.goals?.home??'—')}-${esc(r.apiPrediction.goals?.away??'—')}</span></div>`:''}<p class="small">${r.predictionError?`Predicciones API: ${esc(r.predictionError)} · `:''}${r.formError?`Forma/H2H: ${esc(r.formError)} · `:''}H2H consultados: ${(r.h2h||[]).length}. El proveedor advierte que la cobertura puede variar por competición. Los datos faltantes no se inventan.</p></div><div class="card"><h3>4. Seguimiento y liquidación</h3>${s.match?`<div class="teams"><div class="team">${esc(s.match.home)}</div><div class="score">${esc(s.match.homeScore)}-${esc(s.match.awayScore)}</div><div class="team">${esc(s.match.away)}</div></div><p class="small">Estado: ${esc(s.match.status)} · ${esc(s.settlementDetail||'Seguimiento automático activo.')}</p>${s.settlement==='MULTI'&&s.match?`<div class="result"><b>Mercados liquidados por separado</b><br><span class="small">${esc(s.settlementDetail||'')}</span></div>`:''}`:'<div class="empty">Aún no hay fixture identificado. Con API conectada se reintenta.</div>'}${hist}</div><div class="card"><h3>5. Aprendizaje del sistema</h3><p class="small">${esc(s.snapshot.reason)}</p><p class="small">El snapshot fue congelado en ${new Date(s.snapshot.frozenAt).toLocaleString('es-ES')}. Después del resultado, el motor agrega este caso a sus patrones; no modifica retroactivamente esta predicción.</p></div>`}
function showScan(i){state.selected=state.scans[i];page('detail')}
function apiRequest(path){return apiRequestSport('football',path)}async function testApi(){const key=apiKeyValue();if(WORKER_ENABLED&&!key)await checkWorkerHealth();if(!WORKER_ENABLED&&!key){$('#apiDiag').textContent='SIN CLAVE';$('#apiDiag').className='status-warn';toast('Introduce una API key primero.');return false}$('#apiStatus').textContent='Probando API-Football directamente…';try{const j=await apiRequestSport('football','/status');const active=j?.response?.account?.active,ok=active!==false;if(key){state.apiKey=key;sessionSet('lsp_api',key);}state.online.football={ok,error:'',results:j?.results??null};$('#apiDiag').textContent=ok?'CONECTADA':'ERROR';$('#apiDiag').className=ok?'status-ok':'status-bad';$('#apiPill').textContent=ok?'ONLINE':'ERROR';$('#apiStatus').textContent=ok?'API-Football conectada correctamente.':'API-Football respondió pero la cuenta no está activa.';renderApiMatrix();return ok}catch(e){const msg=normalizeApiError(e);state.online.football={ok:false,error:msg};$('#apiDiag').textContent='ERROR';$('#apiDiag').className='status-bad';$('#apiPill').textContent='ERROR';$('#apiStatus').textContent=msg;renderApiMatrix();return false}}
async function refreshPending(){if(!WORKER_ENABLED&&!state.apiKey||Date.now()-state.lastPendingRefresh<60000)return;state.lastPendingRefresh=Date.now();const pending=state.scans.filter(s=>s.match?.id&&s.settlement==='PENDIENTE').slice(0,3);for(const s of pending){try{const online=await resolveOnline(s.parsed);if(!online)continue;s.match={...s.match,...online.match};s.research=online.research||s.research;const frozenPick=s.frozen?String(s.snapshot?.prediction||''):'';s.analysis=s.match.sport==='football'?buildResearch(s.parsed,s.match,s.research):buildResearchGeneric(s.parsed,s.match,s.research);if(frozenPick&&frozenPick!=='SIN APUESTA'){s.analysis.primary={...(s.analysis.primary||{}),pick:frozenPick,reason:'Decisión congelada al momento del análisis inicial; los datos LIVE actualizan el contexto, no reescriben la selección.'};s.analysis.confidence=s.snapshot?.confidence??s.analysis.confidence;s.analysis.frozenDecision=true;}s.analysis.research=s.research;s.analysis.researchStats=s.research?.liveStats||[];if(['CANCELLED','POSTPONED'].includes(s.match.status))applyVoid(s,fixtureStateLabel(s.match));else if(s.match.status==='FINISHED'){const x=settleSelected(s.parsed,s.match,s.analysis||{});if(x.settlement&&x.settlement!=='PENDIENTE')applySettlement(s,x)}else if(s.match.status==='LIVE')s.settlementDetail=`Seguimiento EN VIVO: ${s.match.homeScore}-${s.match.awayScore} · la decisión permanece sin reescribirse.`}catch(e){}}persistScannerData();renderScanner();renderPred();renderStats();if(state.selected)renderDetail()}
function applySettlement(s,x){s.settlement=x.settlement==='WIN'?'GANADA':x.settlement==='LOSS'?'PERDIDA':x.settlement==='PUSH'?'PUSH':x.settlement.replace('HALF-','MEDIA-');s.settlementDetail=`Liquidación automática tras resultado final: ${x.type} · total ${x.total??'-'} · margen ${x.margin??'-'}`;const pp=state.preds.find(z=>z.scanId===s.id);if(pp)pp.settlement=s.settlement}
async function refreshOneScan(index){const s=state.scans[index];if(!s)return;if(!WORKER_ENABLED&&!state.apiKey){toast('La fuente de datos no está disponible.');return}try{const online=await resolveOnline(s.parsed);if(!online){toast('No se encontró el partido en las APIs disponibles.');return}s.match={...s.match,...online.match};s.research=online.research||s.research;const frozenPick=s.frozen?String(s.snapshot?.prediction||''):'';s.analysis=s.match.sport==='football'?buildResearch(s.parsed,s.match,s.research):buildResearchGeneric(s.parsed,s.match,s.research);if(frozenPick&&frozenPick!=='SIN APUESTA'){s.analysis.primary={...(s.analysis.primary||{}),pick:frozenPick,reason:'Decisión congelada al momento del análisis inicial; los datos LIVE actualizan el contexto, no reescriben la selección.'};s.analysis.confidence=s.snapshot?.confidence??s.analysis.confidence;s.analysis.frozenDecision=true;}s.analysis.research=s.research;s.analysis.researchStats=s.research?.liveStats||[];if(['CANCELLED','POSTPONED'].includes(s.match.status))applyVoid(s,fixtureStateLabel(s.match));else if(s.match.status==='FINISHED'){const x=settleSelected(s.parsed,s.match,s.analysis);if(x.settlement&&x.settlement!=='PENDIENTE')applySettlement(s,x)}else{s.settlement='PENDIENTE';s.settlementDetail=`Estado actualizado: ${fixtureStateLabel(s.match)} · ${s.match.homeScore}-${s.match.awayScore}`;s.analysis=s.analysis||{}}persistScannerData();renderScanner();renderPred();renderStats();if(state.selected)renderDetail();toast('Estado real y análisis multideporte actualizados.')}catch(e){toast('Error al actualizar: '+normalizeApiError(e))}}
function selfTests(){const out=[];const check=(name,fn)=>{try{const v=fn();out.push([name,!!v,typeof v==='string'?v:'OK'])}catch(e){out.push([name,false,e.message])}};check('Navegación',()=>$$('.screen').length>=8&&$$('.nav').length===5&&['home','live','final','pred','scanner','stats','settings','detail'].every(x=>$$('.screen[data-page=\"'+x+'\"]').length===1));check('Parser vs/v/🆚',()=>parseLine('Real Santander vs Orsomarso -0.5 (2-2.5)').home==='Real Santander');check('Línea asiática cuarto',()=>JSON.stringify(splitQuarter(2.25))===JSON.stringify([2,2.5]));check('Over push',()=>settleGoals(2,2,'over')==='PUSH');check('Under push',()=>settleGoals(2,2,'under')==='PUSH');check('Hándicap push',()=>settleHandicap(1,-1)==='PUSH');check('Hándicap -1.25',()=>settleHandicap(1,-1.25)==='HALF-LOSS');check('Snapshot congelado',()=>{const p=parseLine('A vs B (2.25)'),s=prediction(p);return !!s.confidence&&!!s.reason});check('Persistencia sesión',()=>{store.set('lsp_test',123);return store.get('lsp_test')===123});check('Protección 429',()=>typeof quotaGuard==='function'&&typeof requestJsonDedup==='function');check('Demo matches',()=>DEMO.length>=6);check('Escape HTML',()=>esc('<x>')==='&lt;x&gt;');check('Liquidación Over 2.25 con 2 goles',()=>settleGoals(2,2.25,'over')==='HALF-LOSS');check('Liquidación Under 2.25 con 2 goles',()=>settleGoals(2,2.25,'under')==='HALF-WIN');check('Dos mercados separados',()=>{const q=parseLine('A vs p-0.5 B (2-2.5)'),r=parseAndSettleDemo(q,{homeScore:2,awayScore:1});return r.settlement==='MULTI'&&r.markets.total.result==='WIN'&&r.markets.handicap.result==='LOSS'});check('Fixture terminado',()=>fixtureStatus('FT')==='FINISHED');check('Fixture vivo',()=>fixtureStatus('2H')==='LIVE');check('Estado HT',()=>fixtureStateLabel({status:'LIVE',statusCode:'HT'})==='DESCANSO');check('Filtro 7 días',()=>['today','7d','30d','all'].every(x=>x));check('Parser identifica lado del hándicap',()=>parseLine('City vs Arsenal -1.0').handicapTeam==='away');check('Parser identifica hándicap visitante',()=>parseLine('City vs +0.5 Arsenal').handicapTeam==='away');check('Parser rango asiático',()=>parseLine('Nicaragua +1.5-2 vs Costa Rica (3)').handicap===1.75);check('Parser equipo unido al hándicap',()=>parseLine('Alemania vs Serbia+2 (3.5)').away==='Serbia'&&parseLine('Alemania vs Serbia+2 (3.5)').handicap===2);check('Parser línea 2-2.5',()=>parseLine('A vs B (2-2.5)').line===2.25);check('Motor protege ante falta de evidencia',()=>{const p=parseLine('A vs B (2.25)'),m={status:'UPCOMING',homeId:1,awayId:2,home:'A',away:'B',homeScore:0,awayScore:0},a=buildResearch(p,m,{homeForm:[],awayForm:[],h2h:[]});return a.primary.pick==='SIN APUESTA'&&a.noBet===true});check('Estado devuelto',()=>{const x={};applyVoid({id:'x'},'APLAZADO');return true});check('Liquidación respeta selección',()=>{const p=parseLine('A vs B (2-2.5)'),m={status:'FINISHED',homeScore:1,awayScore:1},a={primary:{pick:'UNDER 2.25'}};return settleSelected(p,m,a).settlement==='HALF-WIN'});check('Hándicap visitante se liquida aparte',()=>{const p=parseLine('A vs +0.5 B'),m={status:'FINISHED',homeScore:1,awayScore:1},a={primary:{pick:'HÁNDICAP VISITANTE +0.5'}};return settleSelected(p,m,a).settlement==='WIN'});check('Mapa baloncesto',()=>mapGame('basketball',{id:7,status:{short:'Q2'},teams:{home:{name:'A'},away:{name:'B'}},scores:{home:{total:50},away:{total:45}}}).status==='LIVE');check('Error de fuente no es apuesta',()=>{const p=parseLine('A vs B (2.25)');const a={primary:{pick:'DATOS NO DISPONIBLES'},sourceError:true,confidence:null};return a.primary.pick!=='SIN APUESTA'&&a.confidence===null});check('Aprendizaje excluye DEMO',()=>{const old=state.scans;state.scans=[{provider:'DEMO',match:{id:1},settlement:'GANADA',parsed:{raw:'A vs B (2)'},snapshot:{confidence:90}}];const ok=settledScans().length===0;state.scans=old;return ok});check('Aprendizaje ponderado',()=>{const old=state.scans;state.scans=[{provider:'API-Fútbol',match:{id:1,sport:'football',date:new Date().toISOString()},settlement:'GANADA',parsed:{raw:'A vs B (2)',line:2},snapshot:{confidence:70}}];const p=learningProfile({raw:'X vs Y (2)',line:2,sport:'football'});state.scans=old;return p.bucketRate===100&&p.effectiveSample>0});check('V44 motor de aprendizaje',()=>{const d=learningDashboard();return d&&typeof d.n==='number'});check('Congelación explícita',()=>{const old=state.scans;const temp={id:'freeze-test',snapshot:{},featureSnapshot:{}};state.scans=[temp];const now=new Date().toISOString();temp.snapshot.frozenAt=now;temp.featureSnapshot.frozenAt=now;temp.frozen=true;state.scans=old;return !!now});check('Señal de mercados',()=>{const p=parseLine('A vs B (2.25)'),a={confidence:72,dataQuality:'BUENA',learningPrior:{bucketRate:60},primary:{pick:'OVER 2.25'},totalExpected:2.8};return scanOptionSignal(a,p,'OVER')>50});check('Señales direccionales',()=>{const p=parseLine('A vs B (2.25)'),a={confidence:70,dataQuality:'BUENA',learningPrior:{similarRate:65},primary:{pick:'OVER 2.25'},totalExpected:2.9};return scanOptionSignal(a,p,'OVER')>scanOptionSignal(a,p,'UNDER')});check('Odds provider parser',()=>{const o=parseProviderOdds([{bets:[{name:'Match Winner',values:[{value:'Home',odd:'1.50'},{value:'Draw',odd:'4.00'},{value:'Away',odd:'6.00'}]}]}],'A','B');return o.winner?.length===3&&o.winner[0].label==='A'});check('Odds model selects value-aware winner',()=>{const o=buildOddsAnalysis({winner:[{label:'A',odd:1.55},{label:'B',odd:5.25},{label:'Draw',odd:4.5}],btts:[{label:'Sí',odd:1.5},{label:'No',odd:2.5}]},{home:'A',away:'B',line:2.5},{home:'A',away:'B',status:'UPCOMING'},{totalExpected:2.55,homeExpected:1.65,awayExpected:.9,marginExpected:.75,liveStats:[]});return o.primary?.market==='GANADOR'&&o.primary?.side==='A'});check('Aprendizaje persistente',()=>{persistScannerData();return Array.isArray(JSON.parse(localStorage.getItem('lsp_scans')||'[]'))&&Array.isArray(JSON.parse(localStorage.getItem('lsp_preds')||'[]'))});const ok=out.every(x=>x[1]);$('#selfTest').innerHTML=`<div class="test-list">${out.map(x=>`<div class="test"><span>${esc(x[0])}</span><b class="${x[1]?'status-ok':'status-bad'}">${x[1]?'PASS':'FAIL'}</b></div>`).join('')}</div><div class="small" style="margin-top:8px">${ok?'Todos los tests locales PASS.':'Hay tests que requieren corrección.'}</div>`;return ok}
function exportData(){const blob=new Blob([JSON.stringify({version:VERSION,scans:state.scans,predictions:state.preds,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='line-scanner-pro-data.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

function renderPred(){const box=$('#predList');if(!box)return;const rows=state.preds.slice(0,12);if(!rows.length){box.innerHTML='<div class="empty">Aún no hay análisis reales guardados. Los datos de demo no se mezclan con el aprendizaje.</div>';return}box.innerHTML=rows.map((p,i)=>`<div class="card"><div class="match-head"><span class="sport-chip">☆ Favorito · ${esc(p.input||'Partido')}</span><span class="line-chip">${esc(p.confidence??0)}%</span></div><b>${esc(p.prediction||'Análisis')}</b><p class="small">${esc(p.reason||'Snapshot congelado')}</p><div class="result"><b class="${p.settlement==='GANADA'?'win':p.settlement==='PERDIDA'?'loss':''}">${esc(p.settlement||'PENDIENTE')}</b></div></div>`).join('')}

function renderSettings(){const k=state.apiKey;const input=$('#apiKey');if(input&&!input.matches(':focus'))input.value='';$('#apiStatus').textContent=(WORKER_ENABLED&&WORKER_HEALTHY)?'Worker Cloudflare operativo para Fútbol.':(k?'API key directa configurada; se aplica protección de cuota.':'Fuente de datos no configurada. Conecta Cloudflare o una API key.');$('#apiPill').textContent=(WORKER_ENABLED||k)?'ONLINE':'API';renderApiMatrix()}

function bind(){
 document.addEventListener('click',e=>{
  const back=e.target.closest('[data-back]');
  if(back){goBack();return}
  const sr=e.target.closest('[data-scan-range]');
  if(sr){state.scanRange=sr.dataset.scanRange;renderScanner();return}
  const ss=e.target.closest('[data-scan-status]');
  if(ss){state.scanStatus=ss.dataset.scanStatus;renderScanner();return}
  const sm=e.target.closest('[data-scan-market]');
  if(sm){state.scanMarket=sm.dataset.scanMarket;renderScanner();return}
  const sq=e.target.closest('[data-scan-quality]');
  if(sq){state.scanQuality=sq.dataset.scanQuality;renderScanner();return}
  const fr=e.target.closest('[data-final-range]');
  if(fr){state.finalFilter=fr.dataset.finalRange;renderFinal();return}
  const p=e.target.closest('[data-page]');
  if(p){page(p.dataset.page);return}
  const sf=e.target.closest('[data-sport]');
  if(sf){renderSportFocus(sf.dataset.sport);return}
  const lf=e.target.closest('[data-live-filter]');
  if(lf){state.liveFilter=lf.dataset.liveFilter;$$('[data-live-filter]').forEach(x=>x.classList.toggle('active',x===lf));renderLive();return}
  const rs=e.target.closest('[data-refresh-scan]');
  if(rs){refreshOneScan(Number(rs.dataset.refreshScan));return}
  const frz=e.target.closest('[data-scan-freeze]');
  if(frz){freezeScan(Number(frz.dataset.scanFreeze));return}
  const sd=e.target.closest('[data-scan-detail]');
  if(sd){showScan(Number(sd.dataset.scanDetail));return}
  const dt=e.target.closest('[data-detail]');
  if(dt){const p=state.preds[Number(dt.dataset.detail)];const s=state.scans.find(x=>x.id===p.scanId);if(s){state.selected=s;page('detail')}} 
 });
 const analyzeBtn=$('#analyzeBtn'); if(analyzeBtn)analyzeBtn.onclick=analyze; const selfBtn=$('#selfTestBtn'); if(selfBtn)selfBtn.onclick=selfTests; const allTest=$('#runAllTest'); if(allTest)allTest.onclick=selfTests; const save=$('#saveKey'); if(save)save.onclick=async()=>{const v=$('#apiKey')?.value.trim();if(!v||v.startsWith('•')){toast('Escribe una API key válida.');return}state.apiKey=v;sessionSet('lsp_api',v);await testApi();renderSettings();renderApiMatrix()}; const clear=$('#clearKey'); if(clear)clear.onclick=()=>{state.apiKey='';sessionDel('lsp_api');renderSettings();$('#apiPill').textContent='DEMO';toast('Clave eliminada de la sesión.')}; const exp=$('#exportBtn'); if(exp)exp.onclick=exportData; const reset=$('#resetBtn'); if(reset)reset.onclick=()=>{if(confirm('¿Borrar análisis y predicciones locales?')){state.scans=[];state.preds=[];persistScannerData();renderStats();renderScanner();renderPred();toast('Datos locales restablecidos.')}}}

/* ===== V43 HOME + THUNDER ENGINE ===== */
function updateHomeSportTabs(){
 const active=state.homeSport||'football';
 $$('.home-sport-tab').forEach(b=>b.classList.toggle('active',b.dataset.homeSport===active));
}
async function renderHome(){
 const box=$('#featured'); if(!box)return;
 const selected=state.homeSport||'football'; updateHomeSportTabs();
 $('#apiPill').textContent=state.apiKey?'ONLINE':'API';
 if(!WORKER_ENABLED&&!state.apiKey){
   const rows=selected==='all'?DEMO:DEMO.filter(m=>m.sport===selected);
   box.innerHTML='<div class="home-real-meta"><span>MODO DEMO</span><span>Conecta una API para datos reales</span></div>'+ (rows.length?rows.map(m=>matchCard(m)).join(''):'<div class="empty">No hay eventos demo para este deporte.</div>');
   return;
 }
 const keys=selected==='all'?Object.keys(API_CFG).filter(k=>API_CFG[k]?.base):[selected];
 box.innerHTML='<div class="home-loading"><span class="loading-ring"></span><div><b>Buscando datos reales…</b><small>Solo se muestran eventos del deporte seleccionado.</small></div></div>';
 const results=await Promise.all(keys.map(async key=>{try{return {key,...await fetchFocusSport(key)}}catch(e){return {key,rows:[],error:e}}}));
 const all=results.flatMap(r=>(r.rows||[]).map(m=>({...m,homeSource:r.key})));
 const uniq=all.filter((m,i,a)=>a.findIndex(x=>String(x.id)===String(m.id)&&x.sport===m.sport)===i);
 const live=uniq.filter(m=>m.status==='LIVE').sort((a,b)=>(b.minute||0)-(a.minute||0));
 const upcoming=uniq.filter(m=>m.status==='UPCOMING'&&(!m.timestamp||m.timestamp>Date.now()/1000)).sort((a,b)=>(a.timestamp||0)-(b.timestamp||0));
 const rows=[...live,...upcoming].slice(0,8);
 const failures=results.filter(r=>r.error).length;
 box.innerHTML=`<div class="home-real-meta"><span>● DATOS REALES</span><span>${rows.length} eventos</span><span>${new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</span>${failures?`<span>${failures} fuente(s) sin respuesta</span>`:''}</div>`+(rows.length?rows.map(m=>matchCard(m)).join(''):'<div class="empty">La API no devolvió eventos reales actuales para este deporte.</div>');
}
function bindV43Home(){
 document.addEventListener('click',e=>{
   const b=e.target.closest('[data-home-sport]');
   if(!b)return;
   const sport=b.dataset.homeSport;
   state.homeSport=sport;
   if(sport!=='all')setArenaSport(sport,true);
   else setArenaSport('football',false);
   updateHomeSportTabs();
   if(state.page==='home')renderHome();
 });
}
function randomThunder(){
 const svg=$('#thunderBolt'), glow=svg?.querySelector('.glow'), core=svg?.querySelector('.core'), b1=svg?.querySelector('.branch-1'), b2=svg?.querySelector('.branch-2'), flare=$('#thunderFlare');
 if(!svg||!glow||!core||!flare)return;
 const side=Math.random()<.5?'left':'right';
 const startX=side==='left'?2+Math.random()*30:68+Math.random()*30;
 const drift=(Math.random()-.5)*22;
 const points=[]; let x=startX,y=-4; points.push([x,y]);
 const steps=6+Math.floor(Math.random()*6);
 for(let i=1;i<=steps;i++){y=i*(108/steps);x+=((Math.random()-.5)*24)+drift*.16;x=Math.max(2,Math.min(98,x));points.push([x,y]);}
 const pathFrom=pts=>pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
 const d=pathFrom(points); glow.setAttribute('d',d); core.setAttribute('d',d);
 const makeBranch=(fromIndex,direction)=>{
   const p=points[Math.max(1,Math.min(points.length-2,fromIndex))];
   const dir=direction*(Math.random()>.35?1:-1);
   return pathFrom([p,[Math.max(2,Math.min(98,p[0]+dir*(9+Math.random()*13))),Math.min(96,p[1]+9+Math.random()*10)],[Math.max(2,Math.min(98,p[0]+dir*(17+Math.random()*23))),Math.min(99,p[1]+18+Math.random()*18)]]);
 };
 try{if(b1)b1.setAttribute('d',makeBranch(1+Math.floor(Math.random()*(points.length-3)),1));if(b2)b2.setAttribute('d',makeBranch(2+Math.floor(Math.random()*(points.length-4)),-1));}catch(e){if(b1)b1.setAttribute('d','');if(b2)b2.setAttribute('d','');}
 svg.style.transform=`rotate(${(Math.random()-.5)*5}deg) scaleX(${.82+Math.random()*.36})`;
 flare.style.left=(6+Math.random()*88)+'%';flare.style.top=(10+Math.random()*78)+'%';
 svg.classList.remove('show');flare.classList.remove('show');void svg.offsetWidth;svg.classList.add('show');flare.classList.add('show');
 setTimeout(()=>{svg.classList.remove('show');flare.classList.remove('show')},820);
}
function startRandomThunder(){
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const schedule=()=>{const delay=5200+Math.random()*10500;setTimeout(()=>{if(document.visibilityState==='visible')randomThunder();schedule()},delay)};
 setTimeout(randomThunder,2600);schedule();
}
function renderHeroReference(){
 const m=DEMO[0];
 const old=document.querySelector('.hero');
 if(old) old.remove();
}

async function boot(){startRandomThunder();await checkWorkerHealth();bindV43Home();renderSports();bindArena();bindScannerExamples();bind();setArenaSport(state.homeSport||'football',false);startVisualRotation();updateScannerMetrics();await renderHome();renderPred();renderScanner();renderStats();renderSettings();renderApiMatrix();selfTests();setInterval(()=>{$('#clock').textContent=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});},10000);setInterval(()=>{if((WORKER_ENABLED||state.apiKey)&&state.page==='scanner')refreshPending();},60000)}window.LineScannerPro={VERSION,parseLine,settleGoals,settleHandicap,splitQuarter,selfTests,analyze,testApi,parseAndSettleDemo,settleSelected,buildResearch,buildResearchGeneric,learningProfile,randomThunder};boot();
})();
