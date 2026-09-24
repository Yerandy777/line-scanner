const CACHE='line-scanner-pro-v33-visual';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin===location.origin && !u.pathname.includes('/api/')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(x=>{
      if(e.request.method==='GET') c.put(e.request,x.clone());
      return x;
    })));
  }
});
