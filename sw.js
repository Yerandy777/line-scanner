const CACHE='line-scanner-pro-v42-1-20260925';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./apple-touch-icon.png','./sports-bg.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(cached=>{const fresh=fetch(e.request).then(r=>{if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone))}return r}).catch(()=>cached||caches.match('./index.html'));if(e.request.mode==='navigate')return fresh;return cached||fresh}))});