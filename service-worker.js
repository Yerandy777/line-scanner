const CACHE='lsp-dynamic-v3-20260925';
const CORE=['./','./index.html','./manifest.json','./css/app.css','./css/components.css','./css/screens.css','./css/responsive.css','./js/core.js','./js/navigation.js','./data/config.js','./assets/icons/icon.svg','./assets/backgrounds/stadium-night.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lsp-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const u=new URL(event.request.url);
  if(u.origin!==location.origin) return;
  const isAppFile=/\.(html|css|js|json|svg)$/.test(u.pathname) || u.pathname.endsWith('/');
  if(isAppFile){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      const copy=response.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); return response;
    }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
  } else {
    event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return response}).catch(()=>caches.match('./index.html'))));
  }
});
