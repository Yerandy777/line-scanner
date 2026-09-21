const CACHE='line-scanner-mobile-v2';
const ASSETS=['./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET') return;
 const url=new URL(e.request.url);
 if(url.origin===location.origin && (e.request.mode==='navigate' || url.pathname.endsWith('/index.html'))){
   e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{
     const copy=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return r;
   }).catch(()=>caches.match('./index.html')));
   return;
 }
 e.respondWith(fetch(e.request).then(r=>{
   if(r.ok && url.origin===location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
   return r;
 }).catch(()=>caches.match(e.request)));
});