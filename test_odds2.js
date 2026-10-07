function normalizeName(s){
 return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\b(fc|cf|sc|afc|ac|club)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
function splitQuarter(n){
 const x=Number(n); if(!Number.isFinite(x))return [];
 const q=Math.round(x*4)/4, frac=Math.round((q-Math.floor(q))*100)/100;
 if(Math.abs(frac-.25)<.001)return [q-.25,q+.25];
 if(Math.abs(frac-.75)<.001)return [q-.25,q+.25];
 return [q];
}
function poissonProb(lambda,k){lambda=Math.max(0,Number(lambda)||0);k=Math.max(0,Math.floor(Number(k)||0));let p=Math.exp(-lambda);for(let i=1;i<=k;i++)p*=lambda/i;return p}
function poissonOver(lambda,line){const q=Number(line);if(!Number.isFinite(q))return null;const parts=splitQuarter(q);const one=x=>{const n=Math.floor(x);let under=0;for(let k=0;k<=n;k++)under+=poissonProb(lambda,k);return 1-under};if(parts.length===1)return one(parts[0]);return (one(parts[0])+one(parts[1]))/2}
function poissonWinner(homeExp,awayExp){let h=0,d=0,a=0;for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){const p=poissonProb(homeExp,i)*poissonProb(awayExp,j);if(i>j)h+=p;else if(i===j)d+=p;else a+=p}const z=h+d+a||1;return {home:h/z,draw:d/z,away:a/z}}
function oddsMarketLabel(k){return ({winner:'GANADOR',firstHalf:'PRIMER TIEMPO',btts:'AMBOS MARCAN',goals:'GOLES',cards:'TARJETAS',corners:'CÓRNERS',firstScore:'PRIMER EQUIPO EN MARCAR'})[k]||k}
function normalizeOddsGroup(arr){
 const a=(arr||[]).filter(x=>Number.isFinite(x.odd)&&x.odd>1); if(!a.length)return [];
 const inv=a.map(x=>1/x.odd),sum=inv.reduce((n,v)=>n+v,0); return a.map((x,i)=>({...x,implied:Math.round(inv[i]/sum*100)}));
}
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
 const ranked=all.filter(x=>Number.isFinite(x.modelProbability)).sort((a,b)=>(b.edge-a.edge)||(b.modelProbability-a.modelProbability));
 const valueCandidates=ranked.filter(x=>x.edge>=3 && x.modelProbability>=50);
 return {markets,all,ranked,primary:valueCandidates[0]||null};
}
const odds={winner:[{label:'Bélgica',odd:1.55},{label:'Turquía',odd:5.25},{label:'Empate',odd:4.5}],firstHalf:[{label:'Bélgica',odd:2},{label:'Turquía',odd:5},{label:'Empate',odd:2.62}],btts:[{label:'Sí',odd:1.5},{label:'No',odd:2.5}],goals:[{label:'+2.5',odd:1.18},{label:'-2.5',odd:2.5}],cards:[{label:'+4.5',odd:2.1},{label:'-4.5',odd:1.66}],corners:[{label:'+9.5',odd:1.83},{label:'-9.5',odd:1.83}],firstScore:[{label:'Bélgica',odd:1.5},{label:'Turquía',odd:2.6},{label:'Sin goles',odd:21}]};
const a=buildOddsAnalysis(odds,{home:'Bélgica',away:'Turquía',line:2.5},{home:'Bélgica',away:'Turquía',status:'UPCOMING'}, {totalExpected:2.55,homeExpected:1.65,awayExpected:.9,marginExpected:.75,liveStats:[]});
console.log(JSON.stringify(a.primary)); console.log(a.ranked.slice(0,5).map(x=>[x.market,x.side,x.modelProbability,x.edge,x.decisionScore])); console.log(a.ranked.map(x=>({m:x.market,s:x.side,mp:x.marketProbability,model:x.modelProbability,edge:x.edge})));
