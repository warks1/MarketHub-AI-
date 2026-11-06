/* MarketHub AI · service worker PWA para modo básico sin conexión.
   La estrategia de navegación es network-first: no inmovilizar versiones antiguas ni ocultar fallos de publicación. */
const CACHE = 'markethub-nexus-pulse-shell-v0.7.27';
const SHELL = [
 './','./index.html','./logo.svg','./manifest.webmanifest',
 './src/app.js','./src/date-label.js','./src/catalogue.js','./src/nexus-ui.js','./src/mirror-ui.js','./src/live-ui.js','./src/local-insights.js','./src/live-studio.js','./src/studio-scene-export.js','./src/studio-video-export.js','./src/studio-scene-media.js','./src/post-manager.js','./src/campaign-manager.js','./src/analytics-local.js',
 './src/office.js','./src/growth.js','./src/marketing-engines.js','./src/engine-lab.js','./src/pulse-campaign.js','./src/visual.js','./src/media-forge.js','./src/media-vault.js','./src/brand-dna.js','./src/creative-audit.js','./src/creative-projects.js','./src/project-portfolio.js','./src/unified-backup.js','./src/unified-crypto.js','./src/subtitle-tools.js','./src/backup.js','./src/secure-backup.js','./src/competitor-local.js',
 './src/style.css','./src/nexus-ui.css','./src/nexus.css','./src/mirror.css','./src/live-ui.css','./src/reference.css','./src/campaign-manager.css','./src/analytics-local.css','./src/competitor-local.css','./src/splash-responsive.css',
 './assets/boceto-01-inicio.webp','./assets/boceto-02-estudio.webp',
 './assets/boceto-01-inicio-original.jpeg','./assets/boceto-02-estudio-original.jpeg',
 './assets/boceto-03-movil-original.jpeg','./assets/boceto-04-carga-original.jpeg',
 './assets/boceto-03-movil.webp','./assets/boceto-04-carga.webp',
 './referencias.html','./icon-192.png','./icon-512.png',
 './src/office.css','./src/growth.css','./src/visual.css','./src/media-forge.css'
];
self.addEventListener('install', event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  // Al compilar con Vite, los módulos se agrupan en /assets: precargarlos desde index.html.
  const landing=await fetch(new URL('./index.html',self.registration.scope),{cache:'reload'});
  if(!landing.ok)throw Error('No se pudo cargar index.html');
  const html=await landing.clone().text();
  const dynamic=[...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)]
    .map(match=>match[1]).filter(ref=>ref.startsWith('./')||ref.startsWith('/'));
  const assets=[...new Set([...SHELL,...dynamic])];
  const results=await Promise.allSettled(assets.map(async file=>{
   const url=new URL(file,self.registration.scope);
   const response=await fetch(url,{cache:'reload'});
   if(!response.ok)throw Error('Recurso no disponible: '+file);
   await cache.put(url,response);
  }));
  // En modo fuente hay ficheros /src; en el bundle de Vite no. Los 404 opcionales
  // nunca deben bloquear la actualización del service worker.
  await self.skipWaiting();
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
  // JS y CSS siempre se actualizan desde la red antes de acudir al modo offline.
  try{
   const network=await fetch(req,{cache:'no-cache'});
   if(network.ok && ['script','style','image','manifest','document'].includes(req.destination)){
    const cache=await caches.open(CACHE);
    await cache.put(req,network.clone());
   }
   return network;
  }catch{
   const cached=await caches.match(req); // No mezclar revisiones de archivos JS.
   if(cached)return cached;
   return new Response('Recurso no disponible sin conexión',{status:503,statusText:'Offline'});
  }
 })());
});
