// Pruebas end-to-end de siete motores reales en pantallas PC, tablet y móvil.
import {chromium,webkit} from 'playwright';
import {mkdir,readFile} from 'node:fs/promises';
await mkdir('visual-qa/engines',{recursive:true});
const base=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const presets=[
 {label:'chrome-pc',browser:chromium,width:1440,height:900},
 {label:'webkit-iphone',browser:webkit,width:390,height:844},
 {label:'webkit-ipad',browser:webkit,width:768,height:1024}
];
const results=[];
for(const {label,browser:driver,width,height} of presets){
 const errors=[],browser=await driver.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});
  const page=await context.newPage();
  await page.addInitScript(()=>{
   const key='markethub-ai-demo-v1';
   let data={};try{data=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}
   data.analyticsRows=[{fecha:'2026-11-05',plataforma:'TikTok',impresiones:1000,alcance:500,interacciones:100,clics:40}];
   localStorage.setItem(key,JSON.stringify(data));
  });
  page.on('pageerror',e=>errors.push('Error JS: '+e.message));
  try{
   await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:20000});
   await page.locator('#skipSplash').click({timeout:3500}).catch(()=>{});
   if(width<=680){
    await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
    await page.locator('.mobile-menu-drawer [data-page="laboratorio"]').click();
   }else await page.locator('.sidebar [data-page="laboratorio"]').click();
   await page.locator('[data-growth-action="tab-motores"]').click();
   await page.locator('#growth-engine-creative').waitFor({state:'visible',timeout:10000});
   // Auditor real y persistencia
   await page.locator('[name="engineCreativeText"]').fill('Descubre herramientas para pequeños negocios. Reserva información y conoce novedades. #emprender');
   await page.locator('[name="engineCreativeKeyword"]').fill('negocios');
   await page.locator('#growth-engine-creative button[type="submit"]').click();
   if(!await page.locator('.engine-score').count())errors.push('Auditor sin resultado');
   // Variantes que sobreviven a render
   await page.locator('[name="engineIdea"]').fill('Curso de marketing');
   await page.locator('[name="engineAudience"]').fill('pequeñas empresas');
   await page.locator('[name="engineOffer"]').fill('Aprende a planificar contenido');
   await page.locator('#growth-engine-copies button[type="submit"]').click();
   if(await page.locator('.engine-variant').count()!==2)errors.push('FREE no limita a dos variantes');
   await page.locator('#engine-variant-0').fill('Texto corregido manualmente para probar la edición.');
   await page.locator('[data-growth-action="engine-save-copies"]').click();
   if(!await page.locator('#engine-variant-0').inputValue().then(x=>x.includes('Texto corregido')))errors.push('Edición no persistida');
   // Embudo
   await page.locator('#growth-engine-forecast button[type="submit"]').click();
   if(await page.locator('.engine-table tbody tr').count()!==3)errors.push('Faltan escenarios');
   // AB
   await page.locator('#growth-engine-ab button[type="submit"]').click();
   if(!await page.locator('.engine-ab-metrics').count())errors.push('A/B sin salida');
   // Muestra A/B con supuestos editables
   await page.locator('#growth-engine-adv-sample button[type="submit"]').click();
   if(!await page.locator('.engine-advanced .engine-score').count())errors.push('Motor de muestra sin resultados');
   // Repartidor de inversión
   await page.locator('#growth-engine-adv-allocate button[type="submit"]').click();
   if(await page.locator('.engine-advanced .engine-table tbody tr').count()<4)errors.push('No hay reparto de canales');
   // Analítica aportada por el usuario, nunca cifras inventadas
   if(!await page.locator('.engine-advanced').textContent().then(t=>t.includes('CTR observado más alto')&&t.includes('TikTok')))
    errors.push('No lee la analítica CSV importada');
   const strategyDownload=page.waitForEvent('download',{timeout:12000});
   await page.locator('[data-growth-action="engine-adv-export"]').click();
   const strategy=await strategyDownload;
   const strategyText=await readFile(await strategy.path(),'utf8');
   if(!strategyText.includes('PLANIFICACIÓN A/B')||!strategyText.includes('ASIGNACIÓN TEÓRICA')||!strategyText.includes('TikTok'))
    errors.push('Informe estratégico incompleto');
   const downloadEvent=page.waitForEvent('download',{timeout:12000});
   await page.locator('[data-growth-action="engine-export-report"]').click();
   const download=await downloadEvent;
   const txt=await readFile(await download.path(),'utf8');
   if(!txt.includes('Texto corregido manualmente')||!txt.includes('EMBUDO TEÓRICO'))errors.push('Exportación incompleta');
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('markethub-growth-local-v1')||'{}'));
   if(!saved.engines?.creative||!saved.engines?.copies||!saved.engines?.forecast||!saved.engines?.ab||!saved.engines?.advanced?.sample||!saved.engines?.advanced?.allocation)errors.push('Faltan resultados persistidos');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>2)errors.push('Desbordamiento horizontal de '+overflow+' px');
   await page.screenshot({path:'visual-qa/engines/'+label+'.png',fullPage:true});
  }catch(e){errors.push(e.message)}
  finally{await context.close()}
 }finally{await browser.close()}
 results.push({label,ok:errors.length===0,errors});
}
console.log(JSON.stringify(results,null,2));
if(results.some(r=>!r.ok))process.exitCode=1;
