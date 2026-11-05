/* MarketHub AI · service worker PWA para modo básico sin conexión.
   La estrategia de navegación es network-first: no inmovilizar versiones antiguas ni ocultar fallos de publicación. */
const CACHE = 'markethub-nexus-pulse-shell-v0.4.0';
const SHELL = [
 './','./index.html','./logo.svg','./manifest.webmanifest',
 './src/app.js','./src/catalogue.js','./src/nexus-ui.js','./src/post-manager.js',
 './src/office.js','./src/growth.js','./src/visual.js','./src/backup.js',
 './src/style.css','./src/nexus-ui.css','./src/nexus.css',
 './src/office.css','./src/growth.css','./src/visual.css'
];
self.addEventListener('install', event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  const results=await Promise.allSettled(SHELL.map(async file=>{
   const url=new URL(file,self.registration.scope);
   const response=await fetch(url,{cache:'reload'});
   if(!response.ok)throw Error('Recurso no disponible: '+file);
   await cache.put(url,response);
  }));
  // No afirmar que existe modo offline completo si alguna dependencia falla.
  if(results.every(result=>result.status==='fulfilled'))await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const all=await caches.keys();
  await Promise.all(all.filter(name=>name.startsWith('markethub-nexus-pulse-shell-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{
   const index=new URL('./index.html',self.registration.scope);
   try{
    const response=await fetch(req,{cache:'no-store'});
    if(response.ok){
     const cache=await caches.open(CACHE);
     await cache.put(index,response.clone());
    }
    return response;
   }catch{
    return await caches.match(index) ||
      new Response('<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="background:#061026;color:white;font:16px system-ui;padding:28px"><h1>MarketHub AI</h1><p>No hay conexión y aún no hay una copia local completa. Conéctate a Internet y vuelve a abrir la aplicación.</p></body></html>',{headers:{'Content-Type':'text/html;charset=utf-8'}});
   }
  })());
  return;
 }
 if(!url.pathname.startsWith(new URL('./',self.registration.scope).pathname))return;
 event.respondWith((async()=>{
  const cached=await caches.match(req,{ignoreSearch:true});
  if(cached)return cached;
  try{
   const network=await fetch(req);
   if(network.ok && ['script','style','image','manifest'].includes(req.destination)){
    const cache=await caches.open(CACHE);await cache.put(req,network.clone());
   }
   return network;
  }catch{
   return new Response('Recurso no disponible sin conexión',{status:503,statusText:'Offline'});
  }
 })());
});
