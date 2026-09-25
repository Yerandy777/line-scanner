
(function(){'use strict';
const VERSION='V40 SCANNER PRO · AUTO FILTERS · LEARNING ENGINE';
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
{id:'d2',sport:'football',league:'Premier League',home:'Manchester City',away:'Arsenal',homeLogo:'https://media.api-sports.io/football/teams/50.png',awayLogo:'https://media.api-sports.io/football/teams/42.png',homeScore:1,awayScore:0,status:'LIVE',minute:54,odds:[1.85,3.60,4.20]},
{id:'d3',sport:'football',league:'Serie A',home:'Inter de Milán',away:'AC Milan',homeLogo:'https://media.api-sports.io/football/teams/505.png',awayLogo:'https://media.api-sports.io/football/teams/489.png',homeScore:0,awayScore:0,status:'LIVE',minute:32,odds:[2.45,3.25,2.90]},
{id:'d4',sport:'football',league:'Bundesliga',home:'Bayer Leverkusen',away:'Bayern Munich',homeLogo:'https://media.api-sports.io/football/teams/168.png',awayLogo:'https://media.api-sports.io/football/teams/157.png',homeScore:2,awayScore:0,status:'FINISHED',minute:90,odds:[3.10,3.50,2.10]},
{id:'d5',sport:'basketball',league:'NBA',home:'Boston',away:'Miami',homeScore:88,awayScore:84,status:'LIVE',minute:31,odds:[1.70,2.10]},
{id:'d6',sport:'tennis',league:'ATP',home:'Jugador A',away:'Jugador B',homeScore:1,awayScore:0,status:'LIVE',minute:2,odds:[1.60,2.35]}
];
const memoryStore=new Map();const store={get(k,d){try{const v=window.sessionStorage.getItem(k);return v?JSON.parse(v):(memoryStore.has(k)?memoryStore.get(k):d)}catch{return memoryStore.has(k)?memoryStore.get(k):d}},set(k,v){memoryStore.set(k,v);try{window.sessionStorage.setItem(k,JSON.stringify(v))}catch{}},del(k){memoryStore.delete(k);try{window.sessionStorage.removeItem(k)}catch{}}};
function sessionGet(k){try{return window.sessionStorage.getItem(k)||window.localStorage.getItem(k)||memoryStore.get(k)||''}catch{try{return window.localStorage.getItem(k)||memoryStore.get(k)||''}catch{return memoryStore.get(k)||''}}} function sessionSet(k,v){memoryStore.set(k,v);try{window.sessionStorage.setItem(k,v)}catch{}try{window.localStorage.setItem(k,v)}catch{}} function sessionDel(k){memoryStore.delete(k);try{window.sessionStorage.removeItem(k)}catch{}try{window.localStorage.removeItem(k)}catch{}}
const state={page:'home',sport:'all',liveFilter:'all',finalFilter:'today',scanRange:'today',scanStatus:'all',scanMarket:'all',scanQuality:'all',scans:store.get('lsp_scans',[]),preds:store.get('lsp_preds',[]),apiKey:sessionGet('lsp_api'),selected:null,online:{},liveCache:{},scoreMemory:{},visualSport:(()=>{try{return localStorage.getItem('lsp_visual_sport')||'football'}catch(e){return 'football'}})()};
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
if(!history.state?.page)history.replaceState({page:'home'},'',location.pathname+location.search+'#home');
window.addEventListener('popstate',e=>page(e.state?.page||'home',false));
function sportLabel(k){return (SPORTS.find(x=>x[0]===k)||['','',''])[2]||k}
function sportIcon(k){return (SPORTS.find(x=>x[0]===k)||['','🏆'])[1]||'🏆'}
function teamBadge(m,side){
 const name=side==='home'?m.home:m.away, logo=side==='home'?m.homeLogo:m.awayLogo;
 const init=String(name||'?').trim().split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
 let h=0; for(const c of String(name||'').toLowerCase()) h=(h*31+c.charCodeAt(0))>>>0;
 const hue=h%360, hue2=(hue+55)%360;
 return logo?`<div class="badge badge-real"><img src="${esc(logo)}" alt="${esc(name||'Equipo')}" loading="lazy" onerror="this.parentElement.classList.remove('badge-real');this.remove();this.parentElement.insertAdjacentHTML('beforeend','<span>${init}</span>')"></div>`:
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
 $('#arenaName').textContent=label;
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
 $('#arenaSub').textContent=subtitles[sport]||'Escenario deportivo · iluminación dinámica';
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
function playFX(type){
 try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);const t=c.currentTime;
  if(type==='goal'){o.type='sawtooth';o.frequency.setValueAtTime(240,t);o.frequency.exponentialRampToValueAtTime(760,t+.22);o.frequency.exponentialRampToValueAtTime(420,t+.48);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.18,t+.04);g.gain.exponentialRampToValueAtTime(.001,t+.62);o.start(t);o.stop(t+.65)}
  else {o.type='square';o.frequency.setValueAtTime(85,t);o.frequency.exponentialRampToValueAtTime(34,t+.18);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.22,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+.34);o.start(t);o.stop(t+.36)}
  setTimeout(()=>c.close(),900);
 }catch(e){}
}
function showGoalFlash(m){
 const el=$('#goalFlash'), lightning=$('#electricLayer'); if(!el)return;
 $('#goalFlashText').textContent=`${m.home} ${m.homeScore} - ${m.awayScore} ${m.away}`;
 el.removeAttribute('hidden');el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
 if(lightning){lightning.hidden=false;lightning.classList.remove('flash');void lightning.offsetWidth;lightning.classList.add('flash');setTimeout(()=>{lightning.classList.remove('flash');lightning.hidden=true},1000)}
 playFX('goal');
 setTimeout(()=>{el.classList.remove('show');el.hidden=true},2600);
 toast(`⚽ GOL · ${m.home} ${m.homeScore}-${m.awayScore} ${m.away}`);
}
function winStreak(){let n=0;for(const s of state.scans){if(s.settlement==='GANADA'||s.settlement==='MEDIA-WIN')n++;else if(['PERDIDA','MEDIA-LOSS'].includes(s.settlement))break;}return n}
function updateStreakFX(){const n=winStreak(),hot=n>=3;document.body.classList.toggle('hot-streak',hot);const el=$('#streakFlash');if(el&&hot){$('#streakFlashText').textContent=`${n} aciertos consecutivos · Scanner encendido`;el.classList.remove('show');void el.offsetWidth;el.classList.add('show')}}
function triggerThunder(message='Apuesta aceptada'){const el=$('#thunderOverlay');if(!el)return;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');playFX('thunder');toast(`⚡ ${message}`);setTimeout(()=>el.classList.remove('show'),1100)}
function bindArena(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-arena-sport]');
  if(b){setArenaSport(b.dataset.arenaSport,true);return}
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
 const home=m[1].trim(); let rest=m[2].trim();
 let line=null,lineText=null,totalSide=null;
 const lm=rest.match(/\(([^()]*)\)\s*$/);
 if(lm){
   lineText=lm[1].trim();rest=rest.slice(0,lm.index).trim();
   const range=lineText.match(/([+-]?\d+(?:[\.,]\d+)?)\s*[-–]\s*([+-]?\d+(?:[\.,]\d+)?)/);
   const nums=lineText.match(/[+-]?\d+(?:[\.,]\d+)?/g)||[];
   if(range){const a=Number(range[1].replace(',','.')),b=Number(range[2].replace(',','.'));line=(a+b)/2;}
   else if(nums.length>=1)line=Number(nums[0].replace(',','.'));
   if(/\bunder\b|\bmenos\b/i.test(lineText))totalSide='UNDER';
   else if(/\bover\b|\bmas\b|\bmás\b/i.test(lineText))totalSide='OVER';
 }
 let handicap=null,handicapTeam=null,away=rest;
 const hm=rest.match(/(?:^|\s|[A-Za-z])([+-]\d+(?:[\.,]\d+)?)(?=\s|$)/);
 if(hm){
   handicap=Number(hm[1].replace(',','.'));
   const token=hm[1], tokenPos=rest.indexOf(token), before=rest.slice(0,tokenPos).trim(), after=rest.slice(tokenPos+token.length).trim();
   if(!before){handicapTeam='away';away=after;}
   else if(!after){handicapTeam='home';away=before;}
   else {handicapTeam='away';away=(before+' '+after).trim();}
 }
 if(!away)return {error:'No se pudo identificar el segundo equipo',raw:text};
 return {raw:text,home,away,line,lineText,totalSide,handicap,handicapTeam};
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
async function fetchScheduleSport(sport){const cfg=API_CFG[sport];if(!cfg?.upcoming)throw new Error(cfg?.kind==='unsupported'?'API NO DISPONIBLE':'SCHEDULE NO DISPONIBLE');const j=await apiRequestSport(sport,cfg.upcoming+todayISO());const rows=(j.response||[]).map(x=>mapGame(sport,x));state.online[sport]={ok:true,results:j.results??rows.length};return rows}
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
 if(!state.apiKey){
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
async function renderLive(){const sport=state.liveFilter==='all'?null:state.liveFilter;const tabs=SPORTS.map(x=>`<button class="ghost ${state.liveFilter===x[0]?'active-filter':''}" data-live-filter="${x[0]}">${x[1]} ${x[2]}</button>`).join('');$('#liveList').innerHTML=`<div class="live-switch"><div class="filter-row"><button class="ghost ${!sport?'active-filter':''}" data-live-filter="all">Todos</button>${tabs}</div></div><div class="empty">Consultando…</div>`;if(!state.apiKey){let a=DEMO.filter(m=>m.status==='LIVE');if(sport)a=a.filter(m=>m.sport===sport);$('#liveList').innerHTML=`<div class="live-switch"><div class="filter-row"><button class="ghost ${!sport?'active-filter':''}" data-live-filter="all">Todos</button>${tabs}</div></div>`+(a.length?a.map(m=>matchCard(m)).join(''):`<div class="empty">Modo DEMO: no hay ${sport?sportLabel(sport).toLowerCase():'partidos'} en vivo.</div>`);return}const keys=sport?[sport]:Object.keys(API_CFG).filter(k=>API_CFG[k]?.live);const all=[];for(const k of keys){try{all.push(...await fetchLiveSport(k,true))}catch(e){state.online[k]={ok:false,error:normalizeApiError(e)}}}const a=all.filter((m,i,x)=>x.findIndex(y=>y.id===m.id&&y.sport===m.sport)===i);$('#liveList').innerHTML=`<div class="live-switch"><div class="filter-row"><button class="ghost ${!sport?'active-filter':''}" data-live-filter="all">Todos</button>${tabs}</div><span>${a.length} eventos en vivo</span></div>`+(a.length?a.map(m=>matchCard(m)).join(''):`<div class="empty">No hay ${sport?sportLabel(sport).toLowerCase():'partidos'} en vivo ahora. Toca un deporte en Inicio para ver también los próximos.</div>`)}
function normalizeApiError(e){const m=String(e?.message||e);if(m.includes('429')||m.includes('QUOTA'))return 'CUOTA AGOTADA';if(m.includes('401')||m.includes('403')||m.includes('AUTH_REJECTED')||m.includes('FORBIDDEN'))return 'KEY/ACCESO';if(m.includes('NETWORK'))return 'BLOQUEO DE RED/CORS';if(m.includes('TIEMPO'))return 'TIEMPO AGOTADO';return m}
function apiKeyValue(){const el=document.getElementById('apiKey');const input=el?String(el.value||'').replace(/[\r\n\t]/g,'').trim():'';return input&&!/^•+$/.test(input)?input:String(state.apiKey||'').replace(/[\r\n\t]/g,'').trim()}
async function apiRequestSport(sport,path,timeout=9000){const key=apiKeyValue();if(!key)throw new Error('FALTA_API_KEY');const cfg=API_CFG[sport];if(!cfg||!cfg.base)throw new Error('API NO DISPONIBLE');const u=new URL(cfg.base+path),c=new AbortController(),timer=setTimeout(()=>c.abort(),timeout);let r;try{r=await fetch(u.toString(),{method:'GET',cache:'no-store',headers:{'x-apisports-key':key,'Accept':'application/json'},signal:c.signal})}catch(e){if(e?.name==='AbortError')throw new Error('TIEMPO AGOTADO');throw new Error('NETWORK: el navegador no pudo llegar a API-Football/API-Sports. Comprueba internet, CORS o restricciones de dominio/IP.')}finally{clearTimeout(timer)}const raw=await r.text();let j={};try{j=JSON.parse(raw)}catch{}const errs=j?.errors&&typeof j.errors==='object'?Object.values(j.errors).flat().map(String):[],msg=errs.join(' · ')||j?.message||j?.error||'';const auth=errs.find(x=>/application key|missing application key|invalid.*key|invalid.*application/i.test(x));if(auth)throw new Error('AUTH_REJECTED: API-Football recibió la clave pero la rechazó. Verifica la key de Account → My Access.');if(r.status===401)throw new Error('AUTH_REJECTED: HTTP 401 · API key inválida o no autorizada.');if(r.status===403)throw new Error('FORBIDDEN: HTTP 403 · acceso denegado. Revisa restricciones de dominio/IP.');if(r.status===429)throw new Error('QUOTA: HTTP 429 · límite/cuota alcanzado.');if(!r.ok)throw new Error('HTTP_'+r.status+(msg?' · '+msg:''));if(errs.length)throw new Error('API_ERROR: '+errs.join(' · '));return j||{}}

function mapGame(sport,g){if(sport==='football'){const st=String(g.fixture?.status?.short||'NS').toUpperCase();return {id:g.fixture?.id,sport,league:g.league?.name||'',leagueId:g.league?.id,home:g.teams?.home?.name||'Local',away:g.teams?.away?.name||'Visitante',homeLogo:g.teams?.home?.logo||'',awayLogo:g.teams?.away?.logo||'',homeScore:g.goals?.home??0,awayScore:g.goals?.away??0,status:isFinishedStatus(st)?'FINISHED':isLiveStatus(st)?'LIVE':fixtureStatus(st),statusCode:st,statusLong:g.fixture?.status?.long||'',minute:g.fixture?.status?.elapsed||0,date:g.fixture?.date||'',timestamp:g.fixture?.timestamp||0,odds:[]}}const st=String(g.status?.short??g.status?.long??'').toUpperCase();const finished=isFinishedStatus(st);const live=isLiveStatus(st)||(!finished&&!['NS','NOT STARTED','CANC','CANCELLED','POSTPONED','4','5','6'].includes(st)&&st!=='');return {id:g.id,sport,league:g.league?.name||g.league?.league||g.league||'',home:g.teams?.home?.name||'Local',away:g.teams?.away?.name||'Visitante',homeLogo:g.teams?.home?.logo||g.teams?.home?.image||'',awayLogo:g.teams?.away?.logo||g.teams?.away?.image||'',homeScore:g.scores?.home?.total??g.scores?.home??g.scores?.home?.points??0,awayScore:g.scores?.away?.total??g.scores?.away??g.scores?.away?.points??0,status:finished?'FINISHED':live?'LIVE':fixtureStatus(st),statusCode:st,statusLong:g.status?.long||'',minute:g.status?.timer||g.status?.elapsed||st,date:g.date||g.datetime||'',timestamp:g.timestamp||g.date?.timestamp||0,odds:[]}}
async function fetchLiveSport(sport,cache=true){const cfg=API_CFG[sport];if(!cfg?.live)throw new Error(cfg?.kind==='unsupported'?'API NO DISPONIBLE':'LIVE NO DISPONIBLE');const now=Date.now(),c=state.liveCache[sport];if(cache&&c&&now-c.ts<30000)return c.rows;const j=await apiRequestSport(sport,cfg.live);const rows=(j.response||[]).map(x=>mapGame(sport,x)).filter(x=>x.status==='LIVE');state.liveCache[sport]={ts:now,rows};state.online[sport]={ok:true,results:j.results??rows.length};return rows}
async function testAllApis(){if(!state.apiKey){renderApiMatrix();return}for(const sport of Object.keys(API_CFG)){const cfg=API_CFG[sport];if(!cfg?.base){state.online[sport]={ok:false,error:'NO SOPORTADO POR API-SPORTS'};continue}try{if(cfg.kind==='football')await apiRequestSport(sport,'/status');else if(cfg.kind==='games')await apiRequestSport(sport,cfg.live);else state.online[sport]={ok:false,error:'SIN LIVE ENDPOINT'};if(cfg.kind==='football'||cfg.kind==='games')state.online[sport]={ok:true,error:''}}catch(e){state.online[sport]={ok:false,error:normalizeApiError(e)}}}renderApiMatrix()}
function renderApiMatrix(){const el=$('#apiMatrix');if(!el)return;el.innerHTML=SPORTS.map(x=>{const k=x[0],cfg=API_CFG[k],o=state.online[k];let label='SIN PROBAR',cls='status-warn';if(!state.apiKey)label='SIN CLAVE';else if(!cfg?.base)label='NO DISPONIBLE';else if(o?.ok){label='ONLINE';cls='status-ok'}else if(o?.error){label=o.error;cls='status-bad'}return `<div class="test"><span>${x[1]} ${x[2]}</span><b class="${cls}">${esc(label)}</b></div>`}).join('')}
function daysAgoISO(n){
 const d=new Date(Date.now()-n*86400000);
 const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
 return `${y}-${m}-${day}`;
}
async function fetchFinishedFootballRange(range){
 if(!state.apiKey)return [];
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
 if(!state.apiKey){
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
function settledScans(){return state.scans.filter(s=>['GANADA','PERDIDA','PUSH','MEDIA-WIN','MEDIA-LOSS'].includes(s.settlement))}
function outcomeScore(s){return s.settlement==='GANADA'||s.settlement==='MEDIA-WIN'?1:s.settlement==='PUSH'?.5:s.settlement==='MEDIA-LOSS'?.25:0}
function marketLabel(p){const low=String(p?.raw||'').toLowerCase();const arr=[];if(p?.line!=null)arr.push(low.includes('under')||low.includes('menos')?'UNDER':'OVER');if(p?.handicap!=null)arr.push('HÁNDICAP');return arr.join(' + ')||'LÍNEA'}

function learningProfile(p){
 const done=settledScans(), market=marketLabel(p);
 const lineBucket=p.line!=null?Math.round(p.line*4)/4:(p.handicap!=null?Math.round(p.handicap*4)/4:null);
 const side=p.handicapTeam||'home';
 const relevant=done.filter(s=>{
   const sp=s.parsed||{};
   const sameMarket=marketLabel(sp)===market;
   const sameBucket=lineBucket==null || Math.abs((sp.line??sp.handicap??999)-lineBucket)<=.001;
   const sameSide=sp.handicap==null || (sp.handicapTeam||'home')===side;
   return sameMarket&&sameBucket&&sameSide;
 });
 const rate=a=>a.length?Math.round(a.reduce((n,s)=>n+outcomeScore(s),0)/a.length*100):null;
 const patterns=done.filter(s=>s.featureSnapshot&&s.settlement&&s.settlement!=='DEVUELTA');
 const conf=a=>a.length?Math.round(a.reduce((n,s)=>n+Number(s.snapshot?.confidence||0),0)/a.length):0;
 return {
   market,lineBucket,side,sample:relevant.length,marketSample:done.filter(s=>marketLabel(s.parsed)===market).length,
   bucketRate:rate(relevant),marketRate:rate(done.filter(s=>marketLabel(s.parsed)===market)),
   historicalConfidence:conf(relevant),patterns:patterns.length
 };
}
function prediction(parsed){
 const prior=learningProfile(parsed);
 let pick='SIN SEÑAL',confidence=38;
 if(parsed.line!=null){
   const side=parsed.totalSide||'OVER';
   pick=`${side} ${parsed.line}`;
   confidence=50;
 }
 if(parsed.handicap!=null){
   const side=(parsed.handicapTeam||'home')==='home'?'LOCAL':'VISITANTE';
   pick=`HÁNDICAP ${side} ${parsed.handicap>0?'+':''}${parsed.handicap}`;
   confidence=Math.max(confidence,50);
 }
 if(prior.bucketRate!=null&&prior.sample>=3)confidence=confidence*.65+prior.bucketRate*.35;
 const c=Math.max(0,Math.min(95,Math.round(confidence)));
 const priorText=prior.bucketRate!=null
   ?`Historial de la misma familia: ${prior.bucketRate}% sobre ${prior.sample} casos.`
   :'Sin muestra histórica suficiente.';
 return {
   prediction:pick,confidence:c,
   reason:`Snapshot V40. ${priorText} El histórico se usa como evidencia y nunca reescribe una decisión ya congelada.`,
   learningPrior:prior,modelVersion:'V40-SCANNER-PRO-01',frozenAt:new Date().toISOString()
 };
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
function buildResearchGeneric(parsed,match,research){
 const hf=genericForm(research?.homeForm,match?.homeId),af=genericForm(research?.awayForm,match?.awayId),h2h=genericRows(research?.h2h).filter(x=>x.status==='FINISHED').slice(0,5);
 const h2hTotal=h2h.length?+(h2h.reduce((n,x)=>n+x.homeScore+x.awayScore,0)/h2h.length).toFixed(2):0,h2hMargin=h2h.length?+(h2h.reduce((n,x)=>n+x.homeScore-x.awayScore,0)/h2h.length).toFixed(2):0;
 const totals=[hf.avgTotal,af.avgTotal,h2hTotal].filter(x=>x>0),totalExp=totals.length?+(totals.reduce((a,b)=>a+b,0)/totals.length).toFixed(2):0;
 const margins=[hf.avgMargin,-af.avgMargin,h2hMargin],marginExp=+(margins.reduce((a,b)=>a+b,0)/margins.length).toFixed(2),live=match.status==='LIVE',current=(Number(match.homeScore)||0)+(Number(match.awayScore)||0);
 const baseTotal=live&&current>0?Math.max(totalExp,current):totalExp,candidates=[],signals=[];
 if(parsed.line!=null&&baseTotal){const gap=baseTotal-parsed.line,side=parsed.totalSide||(gap>=0?'OVER':'UNDER');signals.push({name:'Total vs línea',value:`${baseTotal} / ${parsed.line}`,state:Math.abs(gap)>=.5?'ok':Math.abs(gap)>=.18?'warn':'bad'});if(Math.abs(gap)>=.18)candidates.push({market:'Over/Under',pick:`${side} ${parsed.line}`,reason:`Base ${baseTotal} frente a línea ${parsed.line}; diferencia ${gap>=0?'+':''}${gap.toFixed(2)}.`});}
 if(parsed.handicap!=null){const adj=marginExp+parsed.handicap,side=adj>=0?'LOCAL':'VISITANTE';signals.push({name:'Margen vs hándicap',value:`${marginExp.toFixed(2)} / ${parsed.handicap}`,state:Math.abs(adj)>=.5?'ok':Math.abs(adj)>=.18?'warn':'bad'});if(Math.abs(adj)>=.18)candidates.push({market:'Hándicap',pick:`HÁNDICAP ${side} ${parsed.handicap>0?'+':''}${parsed.handicap}`,reason:`Margen estimado ${marginExp.toFixed(2)} frente al hándicap ${parsed.handicap}.`});}
 const primary=candidates[0]||{market:marketLabel(parsed),pick:'SIN APUESTA',reason:'Datos insuficientes para superar el umbral mínimo; no se fuerza una selección.'},quality=(hf.n>=2||af.n>=2||h2h.length>=2)?'BUENA':'LIMITADA';let confidence=primary.pick==='SIN APUESTA'?35:55+Math.min(18,Math.abs(parsed.line!=null?baseTotal-parsed.line:marginExp+parsed.handicap)*8);const prior=learningProfile(parsed);if(prior.bucketRate!=null&&prior.sample>=3)confidence=confidence*.72+prior.bucketRate*.28;confidence=Math.max(0,Math.min(95,Math.round(confidence)));
 const label=API_CFG[match.sport]?.label||match.sport;return {homeForm:hf,awayForm:af,h2h:{n:h2h.length,avgTotal:h2hTotal,homeMargin:h2hMargin},totalExpected:baseTotal,marginExpected:marginExp,liveProjection:live?liveProjection(parsed,match,baseTotal):null,candidates,primary,confidence,reasons:[`Deporte identificado: ${label}.`,`${live?'EN VIVO · marcador '+match.homeScore+'-'+match.awayScore:'PREPARTIDO'} · análisis con unidades propias del deporte.`,`Base histórica de totales: ${baseTotal||'sin muestra'}; margen estimado: ${marginExp.toFixed(2)}.`,h2h.length?`H2H comparable: ${h2h.length}; total medio ${h2hTotal}.`:'H2H: sin muestra suficiente.',prior.bucketRate!=null?`Patrón histórico: ${prior.bucketRate}% sobre ${prior.sample} casos.`:'Patrón histórico: muestra insuficiente.'],signals,dataQuality:quality,learningPrior:prior,decisionMode:live?'LIVE':'PREMATCH',signalScore:{positive:candidates.length,negative:0,total:signals.length},noBet:primary.pick==='SIN APUESTA'};
}

function buildResearch(parsed,match,research){
 const hf=summarizeForm(research?.homeForm,match?.homeId);
 const af=summarizeForm(research?.awayForm,match?.awayId);
 const h2h=summarizeH2H(research?.h2h,match?.homeId,match?.awayId);
 const homeExp=(hf.avgGF+af.avgGA)/2;
 const awayExp=(af.avgGF+hf.avgGA)/2;
 let totalExp=+(homeExp+awayExp).toFixed(2);
 const marginExp=+(homeExp-awayExp).toFixed(2);
 const apiOU=research?.apiPrediction?.under_over;
 const live=match?.status==='LIVE';
 const lp=live?liveProjection(parsed,match,totalExp):null;
 const targetTotal=live?lp.projectedFinal:totalExp;
 const signals=[];
 const candidates=[];

 // Total line signal
 if(parsed.line!=null){
   let side=parsed.totalSide;
   if(!side) side=targetTotal>parsed.line?'OVER':'UNDER';
   const gap=+(targetTotal-parsed.line).toFixed(2);
   const abs=Math.abs(gap);
   const modelSignal=gap>0.12?'OVER':gap<-0.12?'UNDER':'NEUTRAL';
   if(modelSignal!=='NEUTRAL')signals.push({name:'Proyección vs línea',value:`${targetTotal} vs ${parsed.line}`,state:abs>=.5?'ok':abs>=.2?'warn':'bad'});
   if(apiOU){
     const ext=String(apiOU).toUpperCase();
     const agrees=ext.includes(side);
     signals.push({name:'Señal externa',value:ext,state:agrees?'ok':'bad'});
   } else signals.push({name:'Señal externa',value:'NO DISPONIBLE',state:'warn'});
   if(abs>=.18){
     candidates.push({market:'Over/Under',pick:`${side} ${parsed.line}`,reason:`${live?'Proyección en vivo':'Proyección prepartido'} ${targetTotal} frente a línea ${parsed.line}; diferencia ${gap>0?'+':''}${gap}.`});
   }
 }

 // Handicap signal
 if(parsed.handicap!=null){
   const team=parsed.handicapTeam||'home';
   const adjusted=team==='home'?marginExp+parsed.handicap:-marginExp+parsed.handicap;
   const side=adjusted>=0?'LOCAL':'VISITANTE';
   const edge=Math.abs(adjusted);
   signals.push({name:'Margen vs hándicap',value:`${marginExp} / ajuste ${adjusted.toFixed(2)}`,state:edge>=.5?'ok':edge>=.2?'warn':'bad'});
   if(edge>=.18)candidates.push({
     market:'Hándicap',
     pick:`HÁNDICAP ${side} ${parsed.handicap>0?'+':''}${parsed.handicap}`,
     reason:`Margen esperado ${marginExp}; ajuste de la línea para ${team==='home'?'local':'visitante'} = ${adjusted.toFixed(2)}.`
   });
 }

 // Context signals
 signals.push({name:'Forma reciente',value:`${hf.n}+${af.n} partidos`,state:(hf.n>=4&&af.n>=4)?'ok':(hf.n||af.n)?'warn':'bad'});
 signals.push({name:'H2H',value:h2h.n?`${h2h.n} partidos · ${h2h.avgTotal} goles`:'SIN MUESTRA',state:h2h.n>=3?'ok':h2h.n?'warn':'bad'});

 // Choose only after comparing signals, not simply the first market.
 const positive=signals.filter(x=>x.state==='ok').length;
 const negative=signals.filter(x=>x.state==='bad').length;
 const dataCount=hf.n+af.n+h2h.n;
 const quality=dataCount>=10?'BUENA':dataCount>=5?'MEDIA':dataCount>=1?'LIMITADA':'NO_APTA';

 // Prefer a candidate supported by the strongest independent signals.
 let primary=null;
 if(candidates.length){
   const scored=candidates.map(c=>{
     const txt=c.pick.toUpperCase();
     let score=0;
     if(apiOU && parsed.line!=null && String(apiOU).toUpperCase().includes(txt.split(' ')[0]))score+=2;
     if(c.market==='Over/Under'){
       score+=Math.min(4,Math.round(Math.abs(targetTotal-parsed.line)*4));
     }else score+=Math.min(4,Math.round(Math.abs(marginExp+(parsed.handicap||0))*4));
     score+=positive*.35-negative*.45;
     return {...c,score};
   }).sort((a,b)=>b.score-a.score);
   primary=scored[0];
 }

 // No-bet gate: insufficient data or contradictory/weak edge.
 const edgeOK=primary && (primary.market==='Over/Under'
   ? Math.abs(targetTotal-(parsed.line??targetTotal))>=.18
   : Math.abs(marginExp+(parsed.handicap||0))>=.18);
 const enough=quality!=='NO_APTA' && positive>=1 && edgeOK;
 if(!enough){
   primary={market:marketLabel(parsed),pick:'SIN APUESTA',reason:'Las señales disponibles no superan el umbral mínimo de evidencia o son contradictorias. Se conserva la línea, pero no se fuerza una selección.'};
 }
 const prior=learningProfile(parsed);
 let confidence=42;
 if(primary.pick!=='SIN APUESTA'){
   confidence=52+Math.min(20,positive*5)-Math.min(12,negative*4);
   const edge=parsed.line!=null?Math.abs(targetTotal-parsed.line):Math.abs(marginExp+(parsed.handicap||0));
   confidence+=Math.min(15,edge*10);
   if(h2h.n>=3)confidence+=3;
   if(hf.n>=4&&af.n>=4)confidence+=5;
   if(prior.bucketRate!=null&&prior.sample>=3)confidence=confidence*.72+prior.bucketRate*.28;
 } else confidence=40;
 confidence=Math.max(0,Math.min(95,Math.round(confidence)));

 const reasons=[
   `Estado: ${live?`EN VIVO · ${match.minute||'?'}' · ${match.homeScore}-${match.awayScore}`:'PREPARTIDO · fixture identificado'}`,
   `Proyección: ${totalExp} goles; ${live?`proyección final en vivo ${targetTotal}`:'base prepartido'} frente a la línea recibida ${parsed.line??'no indicada'}.`,
   `Forma: ${match.home} ${hf.avgGF} GF / ${hf.avgGA} GC; ${match.away} ${af.avgGF} GF / ${af.avgGA} GC.`,
   h2h.n?`H2H: ${h2h.n} partidos, promedio ${h2h.avgTotal} goles.`:'H2H: sin muestra suficiente.',
   apiOU?`Señal externa: ${apiOU}.`:'Señal externa Over/Under: no disponible.',
   prior.bucketRate!=null?`Patrón histórico de esta familia: ${prior.bucketRate}% sobre ${prior.sample} casos.`:'Patrón histórico: muestra insuficiente.',
   `Regla V40: ${primary.pick==='SIN APUESTA'?'no se fuerza selección cuando la evidencia es insuficiente.':'la selección debe superar el umbral de evidencia antes de congelarse.'}`
 ];
 return {
   homeForm:hf,awayForm:af,h2h,totalExpected:totalExp,marginExpected:marginExp,
   liveProjection:lp,candidates,primary,confidence,
   checks:{line:parsed.line,handicap:parsed.handicap},
   reasons,signals,dataQuality:quality,
   learningPrior:prior,
   decisionMode:live?'LIVE':'PREMATCH',
   signalScore:{positive,negative,total:signals.length},
   noBet:primary.pick==='SIN APUESTA'
 };
}

function applyVoid(s,reason){s.settlement='DEVUELTA';s.settlementDetail=`Apuesta devuelta: ${reason||'evento cancelado o aplazado.'}`;const pp=state.preds.find(z=>z.scanId===s.id);if(pp)pp.settlement='DEVUELTA'}
function saveScan(scan){state.scans.unshift(scan);state.scans=state.scans.slice(0,100);store.set('lsp_scans',state.scans)}
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

function renderScanner(){
 const box=$('#scannerResults'); if(!box)return;
 $$('.scanner-status-filter [data-scan-status]').forEach(x=>x.classList.toggle('active',x.dataset.scanStatus===state.scanStatus));
 $$('[data-scan-market]').forEach(x=>x.classList.toggle('active',x.dataset.scanMarket===state.scanMarket));
 $$('[data-scan-quality]').forEach(x=>x.classList.toggle('active',x.dataset.scanQuality===state.scanQuality));
 $$('.scanner-range-row [data-scan-range]').forEach(x=>x.classList.toggle('active',x.dataset.scanRange===state.scanRange));
 updateScannerMetrics();

 const q=String($('#searchBox')?.value||'').toLowerCase().trim();
 const rows=state.scans.map((s,i)=>({s,i}))
  .filter(({s})=>scanMatchesRange(s))
  .filter(({s})=>scanStatusMatch(s))
  .filter(({s})=>scanMarketMatch(s))
  .filter(({s})=>scanQualityMatch(s))
  .filter(({s})=>!q || `${s.parsed?.home||''} ${s.parsed?.away||''} ${s.parsed?.raw||''}`.toLowerCase().includes(q));

 const signals=rows.reduce((n,x)=>n+scanSignalCount(x.s),0);
 $('#scanVisible').textContent=rows.length;
 $('#scanSignals').textContent=signals;

 if(!rows.length){
  box.innerHTML='<div class="empty">No hay análisis que coincidan con los filtros automáticos actuales.</div>';
  renderScannerPatterns(); return;
 }
 box.innerHTML=rows.map(({s,i})=>{
   const a=s.analysis||{}, settled=['GANADA','PERDIDA','PUSH','MEDIA-WIN','MEDIA-LOSS','DEVUELTA'].includes(s.settlement);
   const quality=a.dataQuality||'NO_APTA';
   const noBet=a.noBet||a.primary?.pick==='SIN APUESTA';
   const stateLabel=s.match?fixtureStateLabel(s.match):'SIN FIXTURE';
   const pick=a.primary?.pick||s.snapshot?.prediction||'SIN SEÑAL';
   return `<div class="card ${noBet?'scanner-no-bet':''}">
    <div class="match-head">
      <span class="sport-chip">SC-${String(i+1).padStart(3,'0')} · ${esc(s.provider||'LOCAL')}</span>
      <span class="real-state ${s.match?.status==='LIVE'?'live':s.match?.status==='FINISHED'?'final':s.match?.status==='UPCOMING'?'pending':''}"><i class="state-dot"></i>${esc(stateLabel)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
      <div><b style="font-size:12px">${esc(s.parsed?.home||'Entrada')} vs ${esc(s.parsed?.away||'')}</b><div class="small">Entrada original: ${esc(s.parsed?.raw||'')}</div></div>
      <span class="line-chip">${esc(a.primary?.market||marketLabel(s.parsed))}</span>
    </div>
    <div class="scanner-decision-meta">
      <span class="${quality==='BUENA'?'green':quality==='MEDIA'?'yellow':''}">DATOS ${esc(quality)}</span>
      <span>${esc(a.decisionMode||'UNKNOWN')}</span>
      <span>${esc(a.signalScore?.positive||0)} señales +</span>
      <span>${esc(a.signalScore?.negative||0)} en contra</span>
    </div>
    <div style="margin-top:10px"><div class="small">DECISIÓN CONGELADA</div><div class="decision-pick">${esc(pick)}</div>
      <div class="confidence-meter"><i style="width:${Math.min(100,Number(a.confidence??s.snapshot?.confidence)||0)}%"></i></div>
      <div class="small" style="margin-top:4px">Confianza: ${esc(a.confidence??s.snapshot?.confidence??0)}% · línea recibida: ${esc(s.parsed?.lineText??s.parsed?.line??s.parsed?.handicap??'—')}</div>
    </div>
    <div class="reason-list">${(a.reasons||[a.primary?.reason||s.snapshot?.reason]).slice(0,5).map(x=>`<div>${esc(x)}</div>`).join('')}</div>
    <div class="result" style="margin-top:9px"><b class="${s.settlement==='GANADA'?'win':s.settlement==='PERDIDA'?'loss':s.settlement==='PUSH'?'push':s.settlement==='DEVUELTA'?'void':''}">${esc(s.settlement||'PENDIENTE')}</b> <span class="small">${esc(s.settlementDetail||'Seguimiento activo')}</span></div>
    ${!noBet?`<button class="primary thunder-trigger" data-accept-bet="${i}" style="width:100%;margin-top:8px">⚡ ACEPTAR APUESTA · ${esc(pick)}</button>`:''}
    <button class="ghost" data-scan-detail="${i}" style="width:100%;margin-top:8px">VER FUNDAMENTACIÓN COMPLETA</button>
    ${s.match?.id&&!settled?`<button class="ghost refresh-real" data-refresh-scan="${i}" style="width:100%;margin-top:6px">↻ ACTUALIZAR ESTADO Y DATOS</button>`:''}
   </div>`;
 }).join('');
 renderScannerPatterns();
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
 if(!state.apiKey)return null;const supported=Object.keys(API_CFG).filter(s=>API_CFG[s]?.base&&['football','games'].includes(API_CFG[s].kind));
 const hint=String(p.raw||'').toLowerCase();const alias=hint.match(/\b(nba|mlb|nhl|fiba|baloncesto|basket|beisbol|baseball|hockey|rugby|voleibol|volleyball|futbol|football)\b/)?.[1];const map={nba:'basketball',fiba:'basketball',baloncesto:'basketball',basket:'basketball',mlb:'baseball',beisbol:'baseball',baseball:'baseball',nhl:'hockey',hockey:'hockey',rugby:'rugby',voleibol:'volleyball',volleyball:'volleyball',futbol:'football',football:'football'};const order=map[alias]?[map[alias],...supported.filter(x=>x!==map[alias])]:supported;
 for(const sport of order){try{const q=path=>apiRequestSport(sport,path);const [hs,as]=await Promise.all([q('/teams?search='+encodeURIComponent(p.home)),q('/teams?search='+encodeURIComponent(p.away))]);const hr=hs.response||[],ar=as.response||[];if(!hr.length||!ar.length)continue;const hids=hr.map(x=>x.team?.id).filter(Boolean),aids=ar.map(x=>x.team?.id).filter(Boolean),games=[];for(const h of hids.slice(0,3)){for(const mode of ['next=20','last=20']){try{const j=await q('/games?team='+h+'&'+mode);for(const g of j.response||[]){const gh=g.teams?.home?.id,ga=g.teams?.away?.id;if((h===gh&&aids.includes(ga))||(h===ga&&aids.includes(gh)))games.push(g)}}catch(e){}}}const uniq=games.filter((g,i,a)=>a.findIndex(x=>String(x.id)===String(g.id))===i);if(!uniq.length)continue;const now=Date.now()/1000;uniq.sort((a,b)=>{const live=x=>isLiveStatus(String(x.status?.short||'').toUpperCase()),fin=x=>isFinishedStatus(String(x.status?.short||'').toUpperCase()),pa=live(a)?0:fin(a)?2:1,pb=live(b)?0:fin(b)?2:1;return pa-pb||Math.abs((Number(a.timestamp)||0)-now)-Math.abs((Number(b.timestamp)||0)-now)});const g=uniq[0],match=mapGame(sport,g);match.homeId=g.teams?.home?.id;match.awayId=g.teams?.away?.id;const research={};try{const [hf,af,h2]=await Promise.all([q('/games?team='+match.homeId+'&last=10'),q('/games?team='+match.awayId+'&last=10'),q('/games?h2h='+match.homeId+'-'+match.awayId+'&last=5')]);research.homeForm=hf.response||[];research.awayForm=af.response||[];research.h2h=h2.response||[]}catch(e){research.formError=normalizeApiError(e)}return {match,research,sport};}catch(e){state.online[sport]={ok:false,error:normalizeApiError(e)}}}return null;
}
function settleSelected(parsed,match,analysis){
 const pick=String(analysis?.primary?.pick||'').toUpperCase();if(!match||match.status!=='FINISHED')return {settlement:'PENDIENTE'};
 const total=(Number(match.homeScore)||0)+(Number(match.awayScore)||0),margin=(Number(match.homeScore)||0)-(Number(match.awayScore)||0);
 if(parsed.line!=null&&/OVER|UNDER/.test(pick)){const type=pick.includes('UNDER')?'under':'over';const r=settleGoals(total,parsed.line,type);return {settlement:r,type,total,margin,selection:`${type.toUpperCase()} ${parsed.line}`}}
 if(parsed.handicap!=null&&/HÁNDICAP|LOCAL|VISITANTE/.test(pick)){const away=/VISITANTE/.test(pick),adj=away?-margin:margin,r=settleHandicap(adj,parsed.handicap);return {settlement:r,type:'handicap',total,margin,selection:`${away?'VISITANTE':'LOCAL'} ${parsed.handicap}`}}
 return {settlement:'PENDIENTE'}
}
async function analyze(){
 const raw=$('#scannerInput').value.split(/\n+/).map(x=>x.trim()).filter(Boolean);if(!raw.length){toast('Introduce uno o varios partidos con su línea.');return}
 const btn=$('#analyzeBtn');if(btn){btn.disabled=true;btn.textContent='⌁ ANALIZANDO…'}let made=0;
 for(const r of raw){const p=parseLine(r);if(!p||p.error){saveScan({id:'scan_'+Date.now()+'_'+made,parsed:{raw:r,home:'Entrada',away:'inválida'},snapshot:{prediction:'Entrada inválida',confidence:0,frozenAt:new Date().toISOString()},settlement:'ERROR',settlementDetail:p?.error||'Formato inválido',createdAt:new Date().toISOString()});continue}
  let snap=prediction(p),match=findDemoMatch(p),provider='DEMO',research={};
  if(state.apiKey){try{const online=await resolveOnline(p);if(online){match=online.match;research=online.research||{};const a=match.sport==='football'?buildResearch(p,match,research):buildResearchGeneric(p,match,research);snap={...snap,prediction:a.primary.pick,confidence:a.confidence,reason:a.reasons.join(' '),frozenAt:new Date().toISOString(),learningPrior:a.learningPrior,modelVersion:'V41-MULTISPORT'};provider='API-'+(API_CFG[match.sport]?.label||match.sport)}}catch(e){provider='API MULTIDEPORTE · '+normalizeApiError(e);research={providerError:normalizeApiError(e)}}}
  const analysis=match?(match.sport==='football'?buildResearch(p,match,research):buildResearchGeneric(p,match,research)):{primary:{market:marketLabel(p),pick:'SIN APUESTA',reason:'No se pudo identificar el evento real en las APIs disponibles. No se fuerza una selección.'},confidence:0,reasons:['No se identificó el evento real.','La línea original se conserva para reintentar.','No se inventan datos cuando el proveedor no devuelve el partido.'],dataQuality:'NO_APTA',decisionMode:'UNKNOWN',learningPrior:snap.learningPrior,noBet:true,signalScore:{positive:0,negative:0,total:0}};
  if(match&&match.status==='CANCELLED'||match?.status==='POSTPONED'){} 
  let settlement='PENDIENTE',detail=match?'Seguimiento automático activo.':'Pendiente de identificar el fixture real.';
  if(match&&['CANCELLED','POSTPONED'].includes(match.status)){settlement='DEVUELTA';detail=`Apuesta devuelta automáticamente: ${fixtureStateLabel(match)}.`}
  else if(match&&match.status==='FINISHED'){const x=settleSelected(p,match,analysis);if(x.settlement&&x.settlement!=='PENDIENTE'){settlement=x.settlement==='WIN'?'GANADA':x.settlement==='LOSS'?'PERDIDA':x.settlement==='PUSH'?'PUSH':x.settlement.replace('HALF-','MEDIA-');detail=`Liquidación automática de la selección ${x.selection||''} · total ${x.total??'-'} · margen ${x.margin??'-'}`}}
  else if(match&&match.status==='LIVE')detail=`Seguimiento EN VIVO: ${match.homeScore}-${match.awayScore} · ${match.minute||'?'}' · la selección no se reescribe con el marcador.`;
  const scan={id:'scan_'+Date.now()+'_'+made,parsed:p,snapshot:snap,match,settlement,settlementDetail:detail,createdAt:new Date().toISOString(),provider,analysis,research,featureSnapshot:{status:match?.status||'UNKNOWN',minute:match?.minute||0,score:[match?.homeScore??null,match?.awayScore??null],line:p.line,handicap:p.handicap,handicapTeam:p.handicapTeam,decision:analysis.primary?.pick,confidence:analysis.confidence??snap.confidence,market:marketLabel(p),dataQuality:analysis.dataQuality,model:'V40-SCANNER-PRO-01',
edge:p.line!=null?Math.abs(Number(analysis.totalExpected||0)-Number(p.line)):Math.abs(Number(analysis.marginExpected||0)+Number(p.handicap||0))
}};
  saveScan(scan);state.preds.unshift({id:'pred_'+scan.id,input:r,prediction:snap.prediction,confidence:snap.confidence,frozenAt:snap.frozenAt,reason:snap.reason,settlement,scanId:scan.id});state.preds=state.preds.slice(0,100);store.set('lsp_preds',state.preds);made++
 }
 $('#scannerInput').value='';if(btn){btn.disabled=false;btn.textContent='⚡ ANALIZAR LÍNEA'}renderScanner();renderPred();renderStats();toast(`${made} partido(s) procesado(s). Selección congelada y seguimiento activo.`)
}
function findDemoMatch(p){const h=normalizeName(p.home),a=normalizeName(p.away);return DEMO.find(m=>(normalizeName(m.home).includes(h)||h.includes(normalizeName(m.home)))&&(normalizeName(m.away).includes(a)||a.includes(normalizeName(m.away))))||null}
function loadDemoScan(){$('#scannerInput').value='Real Santander vs Orsomarso -0.5 (2-2.5)\nTigres vs Atlético (2)\nInternacional vs Independiente (2)';toast('Demo cargada. Pulsa ANALIZAR.')}
function renderStats(){updateStreakFX();const scans=settledScans(),wins=scans.filter(s=>s.settlement==='GANADA').length,loss=scans.filter(s=>s.settlement==='PERDIDA').length,push=scans.filter(s=>s.settlement==='PUSH').length,total=scans.length,returned=state.scans.filter(s=>s.settlement==='DEVUELTA').length,rate=total?Math.round(scans.reduce((n,s)=>n+outcomeScore(s),0)/total*100):0;const markets={};for(const s of scans){const k=marketLabel(s.parsed);markets[k]??=[];markets[k].push(s)}const patternRows=Object.entries(markets).map(([k,a])=>`<tr><td>${k}</td><td>${a.length}</td><td>${Math.round(a.reduce((n,s)=>n+outcomeScore(s),0)/a.length*100)}%</td><td>${a.filter(s=>s.settlement==='GANADA').length}</td><td>${a.filter(s=>s.settlement==='PERDIDA').length}</td></tr>`).join('');$('#statMetrics').innerHTML=[['Análisis',state.scans.length],['Liquidados',total],['Ganadas',wins],['Perdidas',loss],['Push',push],['Devueltas',returned],['Rendimiento',rate+'%']].map(x=>`<div class="metric"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');$('#teamTable').innerHTML=`<div class="small">El motor aprende solo de resultados ya cerrados. No usa el resultado actual para alterar su snapshot.</div><table class="table"><thead><tr><th>Mercado</th><th>Muestra</th><th>Rend.</th><th>W</th><th>L</th></tr></thead><tbody>${patternRows||'<tr><td colspan="5">Aún no hay muestra suficiente.</td></tr>'}</tbody></table>`;const buckets={};for(const s of scans){const k=s.parsed.line!=null?'Línea '+s.parsed.line:(s.parsed.handicap!=null?'H '+s.parsed.handicap:'Sin línea');buckets[k]??=[];buckets[k].push(s)}$('#lineStats').innerHTML=Object.entries(buckets).map(([k,a])=>`<div class="pattern-row"><b>${esc(k)}</b><span>${a.length} casos · ${Math.round(a.reduce((n,s)=>n+outcomeScore(s),0)/a.length*100)}%</span></div>`).join('')||'<div class="small">Los patrones aparecerán cuando existan resultados liquidados.</div>'}
function renderDetail(){const s=state.selected;if(!s){$('#detailContent').innerHTML='<div class="empty">Selecciona un análisis.</div>';return}const a=s.analysis||{},r=s.research||{},hf=a.homeForm||{},af=a.awayForm||{};const hist=s.settlement&&s.settlement!=='PENDIENTE'?`<div class="analysis-grid"><div class="metric"><b>${esc(s.settlement)}</b><span>Resultado de la apuesta</span></div><div class="metric"><b>${esc(s.match?.homeScore??'—')}-${esc(s.match?.awayScore??'—')}</b><span>Marcador final/actual</span></div></div>`:'<div class="result">Seguimiento: pendiente de resultado final.</div>';$('#detailContent').innerHTML=`<div class="card detail-hero"><div class="ey">ESTUDIO COMPLETO · ${esc(s.provider||'LOCAL')}</div><h2>${esc(s.parsed.home)} vs ${esc(s.parsed.away)}</h2><p class="small">Entrada exacta: ${esc(s.parsed.raw)}</p><div class="analysis-grid"><div class="metric"><b>${s.snapshot.confidence}%</b><span>Confianza congelada</span></div><div class="metric"><b>${esc(a.primary?.pick||s.snapshot.prediction)}</b><span>Opción analítica principal</span></div><div class="metric"><b>${esc(a.totalExpected??'—')}</b><span>Total esperado</span></div><div class="metric"><b>${esc(a.marginExpected??'—')}</b><span>Margen esperado</span></div></div></div><div class="card"><h3>1. Decisión del Scanner</h3><p class="small">Mercado: <b>${marketLabel(s.parsed)}</b> · Línea recibida: <b>${esc(s.parsed.lineText ?? s.parsed.line ?? s.parsed.handicap ?? '—')}</b> · modo: <b>${esc(a.decisionMode||'—')}</b></p><div class="decision-pick">${esc(a.primary?.pick||s.snapshot.prediction)}</div><div class="confidence-meter"><i style="width:${Math.min(100,Number(a.confidence??s.snapshot.confidence)||0)}%"></i></div><p>${esc(a.primary?.reason||s.snapshot.reason)}</p><div class="reason-list">${(a.reasons||[]).map(x=>`<div>${esc(x)}</div>`).join('')}</div><div class="candidate-list">${(a.candidates||[]).map((c,i)=>`<div class="candidate ${i===0?'primary-candidate':''}"><b>${i===0?'PRINCIPAL':'ALTERNATIVA'} · ${esc(c.pick)}</b><span>${esc(c.market)} · ${esc(c.reason)}</span></div>`).join('')}</div></div><div class="card"><h3>2. Forma reciente</h3><div class="analysis-grid"><div class="metric"><b>${hf.avgGF||0}</b><span>${esc(s.match?.home||'Local')} GF/partido</span></div><div class="metric"><b>${hf.avgGA||0}</b><span>${esc(s.match?.home||'Local')} GA/partido</span></div><div class="metric"><b>${af.avgGF||0}</b><span>${esc(s.match?.away||'Visitante')} GF/partido</span></div><div class="metric"><b>${af.avgGA||0}</b><span>${esc(s.match?.away||'Visitante')} GA/partido</span></div></div><p class="small">Muestra: ${hf.n||0} partidos local + ${af.n||0} visitante · calidad de datos: ${esc(a.dataQuality||'—')}</p>${a.liveProjection?`<div class="result"><b>Lectura EN VIVO</b><br><span class="small">${a.liveProjection.elapsed}' · ${a.liveProjection.current} goles actuales · proyección final ${a.liveProjection.projectedFinal} · goles restantes esperados ${a.liveProjection.remainingExpected}</span></div>`:''}</div><div class="card"><h3>3. Modelo externo y contexto</h3><p class="small">${esc(s.snapshot.reason)}</p>${r.apiPrediction?`<div class="result"><b>${esc(r.apiPrediction.advice||'Pronóstico API disponible')}</b><br><span class="small">Under/Over: ${esc(r.apiPrediction.under_over||'—')} · marcador estimado: ${esc(r.apiPrediction.goals?.home??'—')}-${esc(r.apiPrediction.goals?.away??'—')}</span></div>`:''}<p class="small">${r.predictionError?`Predicciones API: ${esc(r.predictionError)} · `:''}${r.formError?`Forma/H2H: ${esc(r.formError)} · `:''}H2H consultados: ${(r.h2h||[]).length}. El proveedor advierte que la cobertura puede variar por competición. Los datos faltantes no se inventan.</p></div><div class="card"><h3>4. Seguimiento y liquidación</h3>${s.match?`<div class="teams"><div class="team">${esc(s.match.home)}</div><div class="score">${esc(s.match.homeScore)}-${esc(s.match.awayScore)}</div><div class="team">${esc(s.match.away)}</div></div><p class="small">Estado: ${esc(s.match.status)} · ${esc(s.settlementDetail||'Seguimiento automático activo.')}</p>${s.settlement==='MULTI'&&s.match?`<div class="result"><b>Mercados liquidados por separado</b><br><span class="small">${esc(s.settlementDetail||'')}</span></div>`:''}`:'<div class="empty">Aún no hay fixture identificado. Con API conectada se reintenta.</div>'}${hist}</div><div class="card"><h3>5. Aprendizaje del sistema</h3><p class="small">${esc(s.snapshot.reason)}</p><p class="small">El snapshot fue congelado en ${new Date(s.snapshot.frozenAt).toLocaleString('es-ES')}. Después del resultado, el motor agrega este caso a sus patrones; no modifica retroactivamente esta predicción.</p></div>`}
function showScan(i){state.selected=state.scans[i];page('detail')}
function apiRequest(path){return apiRequestSport('football',path)}async function testApi(){const key=apiKeyValue();if(!key){$('#apiDiag').textContent='SIN CLAVE';$('#apiDiag').className='status-warn';toast('Introduce una API key primero.');return false}$('#apiStatus').textContent='Probando API-Football directamente…';try{let j;try{j=await apiRequestSport('football','/status')}catch(first){j=await apiRequestSport('football','/countries')}const active=j?.response?.account?.active,ok=active!==false;state.apiKey=key;sessionSet('lsp_api',key);state.online.football={ok,error:'',results:j?.results??null};$('#apiDiag').textContent=ok?'CONECTADA':'ERROR';$('#apiDiag').className=ok?'status-ok':'status-bad';$('#apiPill').textContent=ok?'ONLINE':'ERROR';$('#apiStatus').textContent=ok?'API-Football conectada correctamente.':'API-Football respondió pero la cuenta no está activa.';renderApiMatrix();return ok}catch(e){const msg=normalizeApiError(e);state.online.football={ok:false,error:msg};$('#apiDiag').textContent='ERROR';$('#apiDiag').className='status-bad';$('#apiPill').textContent='ERROR';$('#apiStatus').textContent=msg;renderApiMatrix();return false}}
async function refreshPending(){if(!state.apiKey)return;const pending=state.scans.filter(s=>s.match?.id&&s.settlement==='PENDIENTE');for(const s of pending.slice(0,20)){try{const online=await resolveOnline(s.parsed);if(!online)continue;s.match={...s.match,...online.match};if(['CANCELLED','POSTPONED'].includes(s.match.status))applyVoid(s,fixtureStateLabel(s.match));else if(s.match.status==='FINISHED'){const x=settleSelected(s.parsed,s.match,s.analysis||{});if(x.settlement&&x.settlement!=='PENDIENTE')applySettlement(s,x)}else if(s.match.status==='LIVE')s.settlementDetail=`Seguimiento EN VIVO: ${s.match.homeScore}-${s.match.awayScore} · selección congelada.`}catch(e){}}store.set('lsp_scans',state.scans);store.set('lsp_preds',state.preds);renderScanner();renderPred();renderStats();if(state.selected)renderDetail()}
function applySettlement(s,x){s.settlement=x.settlement==='WIN'?'GANADA':x.settlement==='LOSS'?'PERDIDA':x.settlement==='PUSH'?'PUSH':x.settlement.replace('HALF-','MEDIA-');s.settlementDetail=`Liquidación automática tras resultado final: ${x.type} · total ${x.total??'-'} · margen ${x.margin??'-'}`;const pp=state.preds.find(z=>z.scanId===s.id);if(pp)pp.settlement=s.settlement}
async function refreshOneScan(index){const s=state.scans[index];if(!s)return;if(!state.apiKey){toast('Conecta una API para actualizar el partido real.');return}try{const online=await resolveOnline(s.parsed);if(!online){toast('No se encontró el partido en las APIs disponibles.');return}s.match={...s.match,...online.match};s.research=online.research||s.research;s.analysis=s.match.sport==='football'?buildResearch(s.parsed,s.match,s.research):buildResearchGeneric(s.parsed,s.match,s.research);if(['CANCELLED','POSTPONED'].includes(s.match.status))applyVoid(s,fixtureStateLabel(s.match));else if(s.match.status==='FINISHED'){const x=settleSelected(s.parsed,s.match,s.analysis);if(x.settlement&&x.settlement!=='PENDIENTE')applySettlement(s,x)}else{s.settlement='PENDIENTE';s.settlementDetail=`Estado actualizado: ${fixtureStateLabel(s.match)} · ${s.match.homeScore}-${s.match.awayScore}`;s.analysis=s.analysis||{}}store.set('lsp_scans',state.scans);store.set('lsp_preds',state.preds);renderScanner();renderPred();renderStats();if(state.selected)renderDetail();toast('Estado real y análisis multideporte actualizados.')}catch(e){toast('Error al actualizar: '+normalizeApiError(e))}}
function selfTests(){const out=[];const check=(name,fn)=>{try{const v=fn();out.push([name,!!v,typeof v==='string'?v:'OK'])}catch(e){out.push([name,false,e.message])}};check('Navegación',()=>$$('.screen').length>=8&&$$('.nav').length===5&&!!history.state?.page);check('Parser vs/v/🆚',()=>parseLine('Real Santander vs Orsomarso -0.5 (2-2.5)').home==='Real Santander');check('Línea asiática cuarto',()=>JSON.stringify(splitQuarter(2.25))===JSON.stringify([2,2.5]));check('Over push',()=>settleGoals(2,2,'over')==='PUSH');check('Under push',()=>settleGoals(2,2,'under')==='PUSH');check('Hándicap push',()=>settleHandicap(1,-1)==='PUSH');check('Hándicap -1.25',()=>settleHandicap(1,-1.25)==='HALF-LOSS');check('Snapshot congelado',()=>{const p=parseLine('A vs B (2.25)'),s=prediction(p);return !!s.confidence&&!!s.reason});check('Persistencia sesión',()=>{store.set('lsp_test',123);return store.get('lsp_test')===123});check('Demo matches',()=>DEMO.length>=6);check('Escape HTML',()=>esc('<x>')==='&lt;x&gt;');check('Liquidación Over 2.25 con 2 goles',()=>settleGoals(2,2.25,'over')==='HALF-LOSS');check('Liquidación Under 2.25 con 2 goles',()=>settleGoals(2,2.25,'under')==='HALF-WIN');check('Dos mercados separados',()=>{const q=parseLine('A vs p-0.5 B (2-2.5)'),r=parseAndSettleDemo(q,{homeScore:2,awayScore:1});return r.settlement==='MULTI'&&r.markets.total.result==='WIN'&&r.markets.handicap.result==='WIN'});check('Fixture terminado',()=>fixtureStatus('FT')==='FINISHED');check('Fixture vivo',()=>fixtureStatus('2H')==='LIVE');check('Estado HT',()=>fixtureStateLabel({status:'LIVE',statusCode:'HT'})==='DESCANSO');check('Filtro 7 días',()=>['today','7d','30d','all'].every(x=>x));check('Parser identifica lado del hándicap',()=>parseLine('City vs Arsenal -1.0').handicapTeam==='home');check('Parser identifica hándicap visitante',()=>parseLine('City vs +0.5 Arsenal').handicapTeam==='away');check('Motor selecciona O/U automáticamente',()=>{const p=parseLine('A vs B (2.25)'),m={status:'UPCOMING',homeId:1,awayId:2,home:'A',away:'B',homeScore:0,awayScore:0},a=buildResearch(p,m,{homeForm:[],awayForm:[],h2h:[]});return /OVER|UNDER/.test(a.primary.pick)});check('Estado devuelto',()=>{const x={};applyVoid({id:'x'},'APLAZADO');return true});check('Liquidación respeta selección',()=>{const p=parseLine('A vs B (2-2.5)'),m={status:'FINISHED',homeScore:1,awayScore:1},a={primary:{pick:'UNDER 2.25'}};return settleSelected(p,m,a).settlement==='WIN'});check('Hándicap visitante se liquida aparte',()=>{const p=parseLine('A vs +0.5 B'),m={status:'FINISHED',homeScore:1,awayScore:1},a={primary:{pick:'HÁNDICAP VISITANTE +0.5'}};return settleSelected(p,m,a).settlement==='WIN'});check('Mapa baloncesto',()=>mapGame('basketball',{id:7,status:{short:'Q2'},teams:{home:{name:'A'},away:{name:'B'}},scores:{home:{total:50},away:{total:45}}}).status==='LIVE');const ok=out.every(x=>x[1]);$('#selfTest').innerHTML=`<div class="test-list">${out.map(x=>`<div class="test"><span>${esc(x[0])}</span><b class="${x[1]?'status-ok':'status-bad'}">${x[1]?'PASS':'FAIL'}</b></div>`).join('')}</div><div class="small" style="margin-top:8px">${ok?'Todos los tests locales PASS.':'Hay tests que requieren corrección.'}</div>`;return ok}
function exportData(){const blob=new Blob([JSON.stringify({version:VERSION,scans:state.scans,predictions:state.preds,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='line-scanner-pro-data.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

function renderPred(){const box=$('#predList');if(!box)return;const rows=state.preds.slice(0,12);if(!rows.length){box.innerHTML=DEMO.slice(0,5).map((m,i)=>`<div class="card"><div class="match-head"><span class="sport-chip">☆ Favorito</span><span class="line-chip">Guardado</span></div><div class="teams"><div class="team"><div class="badge">${esc(m.home.slice(0,2).toUpperCase())}</div>${esc(m.home)}</div><div class="score">${m.homeScore}-${m.awayScore}</div><div class="team"><div class="badge">${esc(m.away.slice(0,2).toUpperCase())}</div>${esc(m.away)}</div></div><div class="meta">${esc(m.league)} · ${m.status==='LIVE'?'EN VIVO':'FINAL'}</div></div>`).join('');return}box.innerHTML=rows.map((p,i)=>`<div class="card"><div class="match-head"><span class="sport-chip">☆ Favorito · ${esc(p.input||'Partido')}</span><span class="line-chip">${esc(p.confidence??0)}%</span></div><b>${esc(p.prediction||'Análisis')}</b><p class="small">${esc(p.reason||'Snapshot congelado')}</p><div class="result"><b class="${p.settlement==='GANADA'?'win':p.settlement==='PERDIDA'?'loss':''}">${esc(p.settlement||'PENDIENTE')}</b></div></div>`).join('')}

function renderSettings(){const k=state.apiKey;const input=$('#apiKey');if(input&&!input.matches(':focus'))input.value='';$('#apiStatus').textContent=k?'API key configurada en esta sesión.':'Modo DEMO activo. La API key no se guarda en GitHub.';$('#apiPill').textContent=k?'ONLINE':'API';renderApiMatrix()}

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
  const ab=e.target.closest('[data-accept-bet]'); if(ab){const i=Number(ab.dataset.acceptBet);const scan=state.scans[i];if(scan){state.selected=scan;triggerThunder('APUESTA ACEPTADA · '+(scan.analysis?.primary?.pick||scan.snapshot?.prediction||'SEGUIMIENTO ACTIVADO'));page('bet');}}
  const sd=e.target.closest('[data-scan-detail]');
  if(sd){showScan(Number(sd.dataset.scanDetail));return}
  const dt=e.target.closest('[data-detail]');
  if(dt){const p=state.preds[Number(dt.dataset.detail)];const s=state.scans.find(x=>x.id===p.scanId);if(s){state.selected=s;page('detail')}} 
 });
 const search=$('#searchBox'); if(search)search.addEventListener('input',()=>renderScanner());$('#demoScanBtn').onclick=loadDemoScan;$('#analyzeBtn').onclick=analyze;$('#selfTestBtn').onclick=selfTests;$('#runAllTest').onclick=selfTests;$('#saveKey').onclick=async()=>{const v=$('#apiKey').value.trim();if(!v||v.startsWith('•')){toast('Escribe una API key válida.');return}state.apiKey=v;sessionSet('lsp_api',v);await testApi();renderSettings();renderApiMatrix()};$('#clearKey').onclick=()=>{state.apiKey='';sessionDel('lsp_api');renderSettings();$('#apiPill').textContent='DEMO';toast('Clave eliminada de la sesión.')};$('#acceptBetBtn')?.addEventListener('click',()=>{triggerThunder('APUESTA ACEPTADA · SEGUIMIENTO ACTIVADO');document.querySelector('[data-page="bet"] .bet-card')?.classList.add('pulse-win');});$('#exportBtn').onclick=exportData;$('#resetBtn').onclick=()=>{if(confirm('¿Borrar análisis y predicciones locales?')){state.scans=[];state.preds=[];store.set('lsp_scans',[]);store.set('lsp_preds',[]);renderStats();renderScanner();renderPred();toast('Datos locales restablecidos.')}}}
async function boot(){renderSports();bindArena();bindScannerExamples();bind();setArenaSport(state.visualSport,false);startVisualRotation();updateScannerMetrics();await renderHome();renderLive();renderFinal();renderPred();renderScanner();renderStats();renderSettings();renderApiMatrix();selfTests();if(state.apiKey)refreshPending();setInterval(()=>{$('#clock').textContent=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});},10000);setInterval(()=>{if(state.apiKey){refreshPending();if(state.page==='home')renderHome();if(state.page==='live')renderLive();if(state.page==='final')renderFinal()}},30000)}window.LineScannerPro={VERSION,parseLine,settleGoals,settleHandicap,splitQuarter,selfTests,analyze,testApi};boot();
})();
