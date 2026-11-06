// QA integral: ancho de botones, diálogo accesible, búsqueda y textos en móviles y PC.
import {chromium,webkit} from 'playwright';
const origin=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const variants=[
 ['Chromium 320',chromium,320,568],
 ['Chromium iPhone 390',chromium,390,844],
 ['Chromium tablet 768',chromium,768,1024],
 ['Chromium desktop 1440',chromium,1440,900],
 ['Safari WebKit iPhone 390',webkit,390,844],
 ['Safari WebKit tablet 768',webkit,768,1024]
];
const results=[];
async function openPage(page,route,width){
 if(width<=680){
  await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
  await page.locator('.mobile-menu-drawer [data-page="'+route+'"]').click();
 }else await page.locator('.sidebar [data-page="'+route+'"]').click();
}
for(const [name,engine,width,height] of variants){
 const browser=await engine.launch({headless:true});
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push('JS: '+e.message));
 try{
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:20000});
  await page.locator('#skipSplash').click({timeout:3500}).catch(()=>{});
  const month=await page.locator('.live-month strong').first().innerText();
  if(!/^[A-ZÁÉÍÓÚÜÑ].* de \d{4}$/.test(month)||month.includes(' De '))
   errors.push('Etiqueta de mes incorrecta: '+month);
  if(!(await page.locator('.live-calendar-help').innerText()).toLocaleLowerCase('es-ES').includes('no se publica'))errors.push('No aparece la ayuda del calendario');
  await openPage(page,'ajustes',width);
  const size=await page.evaluate(()=>{
   const btn=document.querySelector('[data-action="unified-backup-encrypted-export"]');
   const rect=btn.getBoundingClientRect();
   return {left:rect.left,right:rect.right,width:innerWidth,scroll:document.documentElement.scrollWidth,
    textWrap:getComputedStyle(btn).whiteSpace};
  });
  if(size.left<-1||size.right>size.width+2||size.scroll>size.width+3)
   errors.push('El botón de copia cifrada se desborda: '+JSON.stringify(size));
  if(size.textWrap!=='normal')errors.push('El botón impide saltos de línea');
  const opener=page.locator('[data-action="reset-data"]').first();
  await opener.click();
  const dialog=page.locator('.modal[role="dialog"]');
  await dialog.waitFor({state:'visible'});
  const checked=await page.evaluate(()=>{
   const dialog=document.querySelector('.modal[role="dialog"]');
   return {inside:dialog.contains(document.activeElement),inert:document.querySelector('.nexus-canvas').inert,
    navInert:document.querySelector('.mobile-bottom').inert,
    overflow:getComputedStyle(document.body).overflow};
  });
  if(!checked.inside||!checked.inert||!checked.navInert||checked.overflow!=='hidden')
   errors.push('El diálogo no captura el foco o no bloquea el fondo: '+JSON.stringify(checked));
  await dialog.locator('button').last().focus();
  await page.keyboard.press('Tab');
  const loops=await dialog.locator('button').first().evaluate(el=>document.activeElement===el);
  if(!loops)errors.push('El foco sale del diálogo al pulsar Tab');
  await page.keyboard.press('Escape');
  if(await page.locator('.modal').count())errors.push('Escape no cierra el diálogo');
  const released=await page.evaluate(()=>({
   inert:document.querySelector('.nexus-canvas').inert,
   locked:document.body.classList.contains('mh-overlay-open'),
   restored:document.activeElement?.getAttribute('data-action')==='reset-data'
  }));
  if(released.inert||released.locked||!released.restored)
   errors.push('El cierre no recupera el foco/fondo: '+JSON.stringify(released));
  if(width<=680){
   await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
   const drawer=page.locator('.mobile-menu-drawer');
   if(!(await drawer.evaluate(el=>el.contains(document.activeElement))))errors.push('El menú móvil no recibe foco');
   if(!(await page.evaluate(()=>document.querySelector('.nexus-canvas').inert&&document.body.classList.contains('mh-overlay-open'))))
    errors.push('El menú móvil no bloquea la pantalla posterior');
   await page.keyboard.press('Escape');
   if(await drawer.count())errors.push('Escape no cierra el menú');
  }
  await openPage(page,'biblioteca',width);
  const search=page.locator('#librarySearch');
  await search.waitFor({state:'visible'});
  await search.fill('Presentación');
  let rows=await page.locator('#libraryResults .post-list-row').count();
  if(rows!==1)errors.push('La biblioteca no filtra por texto, devuelve '+rows);
  await search.fill('presentacion tiktok');
  rows=await page.locator('#libraryResults .post-list-row').count();
  if(rows!==1)errors.push('La búsqueda sin acentos y con varias palabras no filtra: '+rows);
  await search.fill('presentacion instagram');
  rows=await page.locator('#libraryResults .post-list-row').count();
  if(rows!==0)errors.push('Se mezclaron publicaciones de TikTok con Instagram en la búsqueda');
  if(!(await search.evaluate(el=>document.activeElement===el)))errors.push('Se pierde el foco del buscador');
  await search.fill('No existe este resultado');
  rows=await page.locator('#libraryResults .post-list-row').count();
  if(rows!==0)errors.push('La biblioteca no muestra búsqueda sin coincidencias');
  await search.fill('');
  rows=await page.locator('#libraryResults .post-list-row').count();
  if(rows!==2)errors.push('No se recuperan los dos borradores originales: '+rows);
  await openPage(page,'crear',width);
  if(!(await page.locator('.page-head .eyebrow').first().textContent()).includes('v0.7.6'))
   errors.push('La etiqueta de versión no coincide con v0.7.6');
  await openPage(page,'estudio',width);
  const typography=await page.locator('.live-editor-text h3').first().evaluate(el=>{
   const css=getComputedStyle(el);return {break:css.wordBreak,wrap:css.overflowWrap}
  });
  if(typography.break!=='normal'||typography.wrap!=='break-word')
   errors.push('La vista previa puede cortar palabras: '+JSON.stringify(typography));
 }catch(error){errors.push('Excepción: '+error.message)}
 finally{await browser.close()}
 results.push({device:name,ok:errors.length===0,errors});
}
console.log(JSON.stringify(results,null,2));
if(results.some(x=>!x.ok))process.exitCode=1;
