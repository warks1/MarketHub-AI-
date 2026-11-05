// Ejecutar con un servidor Vite activo y Playwright instalado.
// Las capturas son comprobaciones reales de interfaz, no sustituyen dispositivos físicos.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.MARKETHUB_URL || 'http://127.0.0.1:5173/';
const sizes=[
 ['movil-320',320,568],['movil-375',375,812],['movil-390',390,844],
 ['movil-430',430,932],['tablet-768',768,1024],['tablet-1024',1024,1366],
 ['pc-1440',1440,900],['pc-1920',1920,1080]
];
const browser=await chromium.launch({headless:true});
await mkdir('visual-qa',{recursive:true});
const results=[];
try{
 for(const [id,width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const faults=[];
  page.on('pageerror',e=>faults.push(String(e)));
  const response=await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:15000});
  const splash=page.locator('.nexus-splash');
  if(await splash.isVisible().catch(()=>false)){
   await page.screenshot({path:'visual-qa/'+id+'-carga.png',fullPage:false});
   await page.locator('#skipSplash').click();
  }
  await page.locator('#main').waitFor({state:'visible'});
  await page.screenshot({path:'visual-qa/'+id+'-inicio.png',fullPage:true});
  const home=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    contentWidth:document.documentElement.scrollWidth,
    mobileNav:getComputedStyle(document.querySelector('.mobile-bottom')).display,
    desktopNav:getComputedStyle(document.querySelector('.sidebar')).display,
    headings:[...document.querySelectorAll('main h1')].map(e=>e.textContent.trim())
  }));
  if(home.contentWidth>home.viewport+3)faults.push('Desbordamiento horizontal '+home.contentWidth+' > '+home.viewport);
  if(width<=680&&home.mobileNav==='none')faults.push('Menú móvil oculto');
  if(width>980&&home.desktopNav==='none')faults.push('Barra de escritorio oculta');
  if(id==='movil-390' || id==='pc-1440'){
    await page.locator('[data-action="calendar-next"]').click();
    const day=page.locator('[data-action="calendar-day"]').first();
    const chosen=await day.getAttribute('data-date');
    await day.click();
    await page.locator('#postForm').waitFor({state:'visible'});
    const actual=await page.locator('#date').inputValue();
    if(actual!==chosen)faults.push('Fecha seleccionada en calendario no se precarga en el formulario');
    if(width<=680)await page.locator('.mobile-bottom [data-page="inicio"]').click();
    else await page.locator('.sidebar [data-page="inicio"]').click();
  }
  if(width<=680){
   await page.locator('[data-action="show-mobile-menu"]').click();
   const drawer=page.locator('.mobile-menu-drawer');
   if(!(await drawer.isVisible()))faults.push('Menú Más no se abre');
   await page.screenshot({path:'visual-qa/'+id+'-menu.png',fullPage:false});
   await page.locator('[data-page="estudio"]').last().click();
  }else{
   await page.locator('.sidebar [data-page="estudio"]').click();
  }
  await page.locator('.nexus-studio').waitFor({state:'visible'});
  await page.screenshot({path:'visual-qa/'+id+'-estudio.png',fullPage:true});
  const studio=await page.evaluate(()=>{
   const viewport=document.documentElement.clientWidth;
   const offenders=[...document.querySelectorAll('main *')].map(el=>{
    const rect=el.getBoundingClientRect();
    return {tag:el.tagName,cls:String(el.className).slice(0,80),width:Math.round(rect.width),left:Math.round(rect.left),right:Math.round(rect.right)};
   }).filter(x=>x.right>viewport+3 && x.left>=0 && x.width>0).slice(0,12);
   return {width:document.documentElement.scrollWidth,viewport,offenders};
  });
  if(studio.width>studio.viewport+3)faults.push('Estudio desborda horizontalmente');
  // Abrir el gestor de campañas y comprobar formulario, guardado y layout.
  if(width<=680){
   await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
   await page.locator('.mobile-menu-drawer [data-page="campanas"]').click();
  }else{
   await page.locator('.sidebar [data-page="campanas"]').click();
  }
  await page.locator('#campaignForm').waitFor({state:'visible'});
  await page.screenshot({path:'visual-qa/'+id+'-campanas.png',fullPage:true});
  const campaignsBefore=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  if(campaignsBefore.width>campaignsBefore.viewport+3)faults.push('Campañas desborda horizontalmente');
  await page.locator('#campaignName').fill('Campaña local de prueba');
  await page.locator('#campaignBudget').fill('125.50');
  await page.locator('#campaignForm [type="submit"]').click();
  if((await page.locator('.campaign-local-row').count())<1)faults.push('El formulario de campaña no guarda el dato local');
  const campaign=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  if(campaign.width>campaign.viewport+3)faults.push('Campañas después de guardar desborda horizontalmente');
  // Validar Analítica con datos propios y el importador CSV en las mismas pantallas.
  if(width<=680){
    await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
    await page.locator('.mobile-menu-drawer [data-page="analitica"]').click();
  }else{
    await page.locator('.sidebar [data-page="analitica"]').click();
  }
  await page.locator('#analyticsCsv').waitFor({state:'visible'});
  await page.screenshot({path:'visual-qa/'+id+'-analitica.png',fullPage:true});
  await page.locator('#analyticsCsv').setInputFiles({
    name:'informe-local.csv',mimeType:'text/csv',
    buffer:Buffer.from('fecha;plataforma;alcance;impresiones;interacciones;clics\n2026-11-02;Instagram;100;150;20;10\n')
  });
  await page.locator('.analytics-local-metrics').waitFor({state:'visible'});
  const analytics=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  if(analytics.width>analytics.viewport+3)faults.push('Analítica importada desborda horizontalmente');
  results.push({id,width,height,http:response?.status(),home,studio,campaign,analytics,faults});
  await page.close();
 }
}finally{
 await browser.close();
}
await writeFile('visual-qa/resultados.json',JSON.stringify(results,null,2));
const fails=results.filter(r=>r.faults.length);
console.log(JSON.stringify({screens:results.length,issues:fails.map(r=>({screen:r.id,issues:r.faults,studio:r.studio}))},null,2));
if(fails.length)process.exitCode=1;
