// Compatibilidad real de motores: WebKit (Safari), Firefox y Chromium.
// No sustituye pruebas con dispositivos iPhone/iPad, Android y Mac físicos.
import {chromium,firefox,webkit} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const cases=[
 ['safari-iphone',webkit,375,812],
 ['safari-ipad',webkit,820,1180],
 ['safari-mac',webkit,1440,900],
 ['firefox-desktop',firefox,1366,768],
 ['chromium-android-landscape',chromium,844,390],
 ['chromium-4k',chromium,3840,2160]
];
await mkdir('browser-qa',{recursive:true});
const results=[];
for(const [id,engine,width,height] of cases){
 let browser;
 const problems=[];
 try{
  browser=await engine.launch({headless:true});
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  page.on('pageerror',err=>problems.push('Error JavaScript: '+String(err).slice(0,240)));
  const response=await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:16000});
  const splash=page.locator('.nexus-original-splash');
  if(await splash.isVisible().catch(()=>false)){
   const img=page.locator('.nexus-original-splash img').first();
   await img.evaluate(el=>el.decode());
   if(!(await img.getAttribute('src')).includes('boceto-04-carga-original.jpeg'))
    problems.push('No usa la pantalla de carga aprobada');
   await page.screenshot({path:'browser-qa/'+id+'-carga.png'});
   // La carga se cierra sola tras un breve progreso: en Safari el botón puede
   // desaparecer durante el click de Playwright. No es un fallo de la app.
   await page.locator('#skipSplash').click({force:true,timeout:900}).catch(()=>{});
  }
  await page.locator('.nexus-original-splash').waitFor({state:'hidden',timeout:5000}).catch(()=>{});
  await page.locator('.live-home').waitFor({state:'visible',timeout:12000});
  if(await page.locator('.mirror-overlay').count())problems.push('Captura estática impide operar');
  if(await page.locator('.live-stat').count()!==6)problems.push('No se muestran seis métricas');
  const measure=()=>page.evaluate(()=>({
   scrollWidth:document.documentElement.scrollWidth,
   viewport:document.documentElement.clientWidth,
   nav:getComputedStyle(document.querySelector(innerWidth<=680?'.mobile-bottom':'.sidebar')).display
  }));
  const home=await measure();
  if(home.scrollWidth>home.viewport+4)problems.push('Inicio horizontal '+home.scrollWidth+'/'+home.viewport);
  if(home.nav==='none')problems.push('No se ve la navegación');
  await page.screenshot({path:'browser-qa/'+id+'-inicio.png',fullPage:false});
  const nav=width<=680?'.mobile-bottom [data-page="estudio"]':'.sidebar [data-page="estudio"]';
  await page.locator(nav).click();
  await page.locator('.live-studio').waitFor({state:'visible'});
  await page.locator('#live-scene-title').fill('Revisión de Safari y compatibilidad');
  await page.locator('#storyboardForm button[type="submit"]').click();
  if(!(await page.locator('.live-editor-text h3').textContent()).includes('Revisión de Safari'))
   problems.push('No conserva los cambios del editor');
  const studio=await measure();
  if(studio.scrollWidth>studio.viewport+4)problems.push('Editor horizontal '+studio.scrollWidth+'/'+studio.viewport);
  await page.screenshot({path:'browser-qa/'+id+'-estudio.png',fullPage:false});
  results.push({id,width,height,http:response?.status(),home,studio,problems});
  await page.close();
 }catch(err){
  problems.push('Navegador: '+String(err).slice(0,550));
  results.push({id,width,height,problems});
 }finally{
  if(browser)await browser.close().catch(()=>{});
 }
}
await writeFile('browser-qa/resultados.json',JSON.stringify(results,null,2));
const failures=results.filter(r=>r.problems.length);
console.log(JSON.stringify({cases:results.length,failed:failures},null,2));
if(failures.length)process.exitCode=1;
