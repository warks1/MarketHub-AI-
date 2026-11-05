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
  const studio=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  if(studio.width>studio.viewport+3)faults.push('Estudio desborda horizontalmente');
  results.push({id,width,height,http:response?.status(),home,studio,faults});
  await page.close();
 }
}finally{
 await browser.close();
}
await writeFile('visual-qa/resultados.json',JSON.stringify(results,null,2));
const fails=results.filter(r=>r.faults.length);
console.log(JSON.stringify({screens:results.length,issues:fails.map(r=>({screen:r.id,issues:r.faults}))},null,2));
if(fails.length)process.exitCode=1;
