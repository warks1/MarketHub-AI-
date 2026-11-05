// Auditoría REAL de MarketHub AI: imágenes originales aprobadas y rutas funcionales.
// Genera capturas para revisar visualmente; no crea bocetos ni altera referencias.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const sizes=[
 ['movil-320',320,568],['movil-375',375,812],['movil-390',390,844],
 ['movil-430',430,932],['tablet-768',768,1024],['tablet-1024',1024,1366],
 ['pc-1440',1440,900],['pc-1920',1920,1080]
];
const browser=await chromium.launch({headless:true});
await mkdir('visual-qa',{recursive:true});
const results=[];
async function nativeRoute(page,name,width){
 if(width<=680){
  await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
  await page.locator('.mobile-menu-drawer [data-page="'+name+'"]').click();
 }else await page.locator('.sidebar [data-page="'+name+'"]').click();
}
try{
 for(const [id,width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const faults=[];
  page.on('pageerror',err=>faults.push('Error JS: '+String(err)));
  const response=await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:15000});
  const splash=page.locator('.nexus-original-splash');
  if(await splash.isVisible().catch(()=>false)){
   const images=page.locator('.nexus-splash img');
   await images.first().evaluate(el=>el.decode());
   const sources=await images.evaluateAll(els=>els.map(el=>el.getAttribute('src')));
   if(!sources.length||sources.some(src=>!src.includes('boceto-04-carga-original.jpeg')))
    faults.push('La carga no usa exclusivamente el ORIGINAL 04');
   const portrait=width<=860&&height>width;
   if(portrait){
    const logo=page.locator('.mirror-splash-brand');
    if(!(await logo.isVisible()))faults.push('Nombre MarketHub AI de carga no visible en móvil');
    const bar=page.locator('.mirror-splash-progress .progress-track');
    if(!(await bar.isVisible()))faults.push('Progreso de carga no visible en móvil');
    const r=await logo.boundingBox();
    if(r&&r.width>width+2)faults.push('La carga móvil excede el ancho');
   }
   await page.screenshot({path:'visual-qa/'+id+'-carga.png'});
   await page.locator('#skipSplash').click();
  }else faults.push('Falta pantalla de carga original');
  const isPhone=width<=860&&height>width;
  const scope=isPhone?'.mirror-mobile-view':'.mirror-desktop-view';
  const homeSource=isPhone?'boceto-03-movil-original.jpeg':'boceto-01-inicio-original.jpeg';
  const studioSource=isPhone?'boceto-03-movil-original.jpeg':'boceto-02-estudio-original.jpeg';
  await page.locator('.mirror-overlay').waitFor({state:'visible'});
  const home=page.locator(scope+' img').first();
  await home.evaluate(el=>el.decode());
  if(!(await home.getAttribute('src')).includes(homeSource))faults.push('Inicio no utiliza original elegido');
  const imageStyle=await home.evaluate(el=>({filter:getComputedStyle(el).filter,transform:getComputedStyle(el).transform,opacity:getComputedStyle(el).opacity,naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight}));
  if(imageStyle.filter!=='none'||imageStyle.transform!=='none'||imageStyle.opacity!=='1')faults.push('La imagen original está modificada por CSS');
  if(imageStyle.naturalWidth!==1448||imageStyle.naturalHeight!==1086)faults.push('Dimensiones del archivo ORIGINAL no coinciden');
  await page.screenshot({path:'visual-qa/'+id+'-inicio-espejo.png'});
  if(isPhone){
   await page.locator(scope+' [data-action="mirror-menu"]').first().click();
   await page.locator('.mirror-menu-panel').waitFor({state:'visible'});
   await page.screenshot({path:'visual-qa/'+id+'-menu.png'});
   await page.locator('[data-action="mirror-close-menu"]').click();
  }
  // La barra inferior usa los píxeles originales y debe quedar accesible y anclada.
  if(isPhone){
   const footer=page.locator('.mirror-mobile-fixednav');
   await footer.waitFor({state:'visible'});
   const footerImage=footer.locator('img');
   await footerImage.evaluate(el=>el.decode());
   if(!(await footerImage.getAttribute('src')).includes('boceto-03-movil-original.jpeg'))
    faults.push('La barra inferior usa iconos o colores distintos al boceto 03');
   const fbox=await footer.boundingBox();
   if(!fbox||fbox.y+fbox.height>height+5)
    faults.push('La barra inferior queda parcialmente fuera de pantalla');
   await page.locator('.mirror-mobile-fixednav [data-page="estudio"]').click();
  }else{
   await page.locator('.mirror-desktop-view [data-page="estudio"]').first().click();
  }
  await page.locator('.mirror-overlay').waitFor({state:'visible'});
  const studioArt=page.locator(scope+' img').first();
  await studioArt.evaluate(el=>el.decode());
  if(!(await studioArt.getAttribute('src')).includes(studioSource))faults.push('Estudio no utiliza el original elegido');
  await page.screenshot({path:'visual-qa/'+id+'-estudio-espejo.png'});
  // Zonas transparentes ofrecen un editor REAL sin modificar las capturas.
  await page.locator(scope+' [data-action="mirror-live"]').first().click();
  await page.locator('.nexus-studio').waitFor({state:'visible'});
  if(await page.locator('.mirror-overlay').count())faults.push('La edición activa sigue bloqueada por la imagen');
  await page.screenshot({path:'visual-qa/'+id+'-estudio-editable.png'});
  const native=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  if(native.scrollWidth>native.clientWidth+3)faults.push('Editor real se desborda');
  // El panel funcional original permite programar, crear campañas e importar CSV.
  await nativeRoute(page,'campanas',width);
  await page.locator('#campaignForm').waitFor({state:'visible'});
  await page.locator('#campaignName').fill('Campaña local de prueba');
  await page.locator('#campaignBudget').fill('125.50');
  await page.locator('#campaignForm [type="submit"]').click();
  if(!(await page.locator('.campaign-local-row').count()))faults.push('No guarda campaña');
  await page.screenshot({path:'visual-qa/'+id+'-campanas.png'});
  await nativeRoute(page,'analitica',width);
  await page.locator('#analyticsCsv').setInputFiles({
   name:'datos-propios.csv',mimeType:'text/csv',
   buffer:Buffer.from('fecha;plataforma;alcance;impresiones;interacciones;clics\n2026-11-02;Instagram;100;150;20;10\n')
  });
  await page.locator('.analytics-local-metrics').waitFor({state:'visible'});
  await page.screenshot({path:'visual-qa/'+id+'-analitica.png'});
  const final=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  if(final.scrollWidth>final.clientWidth+3)faults.push('Analítica se desborda');
  results.push({id,width,height,status:response?.status(),style:imageStyle,final,faults});
  await page.close();
 }
}finally{await browser.close()}
await writeFile('visual-qa/resultados.json',JSON.stringify(results,null,2));
const failed=results.filter(x=>x.faults.length);
console.log(JSON.stringify({screens:results.length,failures:failed.map(x=>({screen:x.id,issues:x.faults}))},null,2));
if(failed.length)process.exitCode=1;
