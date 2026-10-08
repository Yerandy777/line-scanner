const ORIGIN='https://v3.football.api-sports.io';
const ALLOW=new Set(['/api/health','/api/status','/api/countries','/api/teams','/api/fixtures','/api/fixtures/statistics','/api/fixtures/events','/api/odds','/api/predictions']);
function cors(){return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Cache-Control':'no-store'}}
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8',...cors(),...extra}})}
function ttl(path,q){
 if(path==='/api/fixtures'&&q.has('live'))return 20;
 if(path==='/api/fixtures/statistics')return 45;
 if(path==='/api/fixtures/events')return 30;
 if(path==='/api/odds')return 180;
 if(path==='/api/predictions')return 900;
 if(path==='/api/fixtures'&&q.has('id'))return 300;
 if(path==='/api/fixtures'&&q.has('date'))return 180;
 if(path==='/api/fixtures'&&(q.has('from')||q.has('to')||q.has('last')||q.has('next')||q.has('team')||q.has('h2h')))return 300;
 if(path==='/api/teams')return 86400;
 return 60;
}
function targetPath(path){
 if(path==='/api/fixtures/statistics')return '/fixtures/statistics';
 if(path==='/api/fixtures/events')return '/fixtures/events';
 return path.replace(/^\/api/,'');
}
export default {async fetch(request,env){
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors()});
 const u=new URL(request.url);if(u.pathname==='/api/health')return json({ok:true,service:'Scanner Pro API',status:'online',provider:'API-Football',configured:!!env.API_FOOTBALL_KEY});
 if(!ALLOW.has(u.pathname))return json({ok:false,error:'NOT_FOUND'},404);
 const key=env.API_FOOTBALL_KEY;if(!key)return json({ok:false,errors:{token:'Worker secret API_FOOTBALL_KEY no configurado'}},500);
 const targetUrl=new URL(ORIGIN+targetPath(u.pathname));u.searchParams.forEach((v,k)=>{if(!['utm_source','utm_medium','utm_campaign'].includes(k))targetUrl.searchParams.set(k,v)});
 const cacheKey=new Request(targetUrl.toString(),{method:'GET'});const cache=caches.default;const cached=await cache.match(cacheKey);if(cached)return new Response(cached.body,cached);
 const r=await fetch(targetUrl.toString(),{headers:{'x-apisports-key':key,'Accept':'application/json'}});const raw=await r.text();let data;try{data=JSON.parse(raw)}catch{data={raw}};
 const providerHeaders={};['x-ratelimit-requests-limit','x-ratelimit-requests-remaining','x-ratelimit-requests-reset','x-ratelimit-limit','x-ratelimit-remaining','x-ratelimit-reset','retry-after'].forEach(k=>{const v=r.headers.get(k);if(v!=null)providerHeaders[k]=v});
 const hasProviderError=data?.errors&&Object.keys(data.errors).length>0;if(r.ok&&!hasProviderError){const out=json(data,r.status,{'X-ScannerPro-Cache':'MISS'});const copy=out.clone();const seconds=ttl(u.pathname,u.searchParams);await cache.put(cacheKey,new Response(copy.body,{status:copy.status,headers:{...Object.fromEntries(copy.headers),'Cache-Control':`public, max-age=${seconds}`}}));return out}
 return json(data,r.status||502,{'X-ScannerPro-Cache':'BYPASS',...providerHeaders});
}}
