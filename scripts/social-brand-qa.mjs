// Verificación real de marcas sociales, selección táctil y borradores en PC y Safari.
import {chromium,webkit} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const site=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const networks=['instagram','tiktok','youtube','facebook','linkedin','x','whatsapp','threads','pinterest','snapchat','bluesky','twitch','telegram','reddit','discord','mastodon','tumblr','spotify','vimeo','behance','dribbble','messenger','wechat','line','vk'];
const devices=[
 {name:'chromium-desktop',driver:chromium,width:1440,height:900},
 {name:'webkit-iphone',driver:webkit,width:390,height:844},
 {name:'webkit-iphone-se',driver:webkit,width:320,height:568},
 {name:'webkit-ipad',driver:webkit,width:768,height:1024}
];
await mkdir('visual-qa/social',{recursive:true});
const results=[];
for(const {name,driver,width,height} of devices){
 const browser=await driver.launch({headless:true});
 const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});
 const page=await context.newPage(),issues=[];
 page.on('pageerror',error=>issues.push('Error JS: '+error.message));
 try{
  await page.goto(site,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:20000});
  await page.locator('#skipSplash').click({timeout:5000}).catch(()=>{});
  await page.locator('.live-home .live-platforms').waitFor({state:'visible',timeout:12000});
  const icons=await page.locator('.live-platforms .social-brand-icon svg path').count();
  if(icons!==networks.length)issues.push('La pantalla principal no muestra todos los '+networks.length+' logotipos: '+icons);
  for(const brand of networks){
   if(!(await page.locator('.live-platforms .social-brand-icon--'+brand).count()))issues.push('Falta logotipo '+brand);
  }
  if((await page.locator('.live-platforms [data-platform]').count())!==6)issues.push('Las seis redes válidas no pueden iniciar borradores');
  const geometry=await page.locator('.live-platforms').evaluate(el=>{
   const rect=el.getBoundingClientRect(),cards=[...el.children].map(card=>{
    const box=card.getBoundingClientRect(),badge=card.querySelector('.social-brand-icon').getBoundingClientRect();
    const style=getComputedStyle(card),title=card.querySelector('b');
    return {name:title?.textContent||'',x:box.left,w:box.width,right:box.right,h:box.height,
     badgeWidth:badge.width,display:style.display,visibility:style.visibility,
     textClipped:!!title&&title.scrollWidth>title.clientWidth+2};
   });
   return {left:rect.left,right:rect.right,width:rect.width,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,
    scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,cards}
  });
  if(geometry.cards.length!==networks.length)issues.push('Hay tarjetas escondidas en la cuadrícula: '+geometry.cards.length);
  if(geometry.scrollWidth>geometry.clientWidth+2)issues.push('El catálogo genera scroll horizontal: '+JSON.stringify(geometry).slice(0,250));
  for(const tile of geometry.cards){
   if(tile.display==='none'||tile.visibility==='hidden')issues.push('Tarjeta oculta: '+tile.name);
   if(tile.w<73||tile.h<80||tile.badgeWidth<31)issues.push('Icono o tarjeta demasiado pequeña: '+JSON.stringify(tile));
   if(tile.x<geometry.left-1||tile.right>geometry.right+1)issues.push('Tarjeta cortada lateralmente: '+tile.name);
   if(tile.textClipped)issues.push('Nombre del icono cortado: '+tile.name);
  }
  const last=page.locator('.live-platforms > *').last();
  await last.scrollIntoViewIfNeeded();
  if(!(await last.isVisible()))issues.push('Los últimos iconos no son accesibles al desplazarse');
  await page.locator('.live-platforms [data-platform="TikTok"]').scrollIntoViewIfNeeded();

  if(!(await page.locator('.live-platforms').textContent()).includes('Sin conectar'))issues.push('Falta aviso honesto de estado desconectado');
  await page.screenshot({path:'visual-qa/social/'+name+'-inicio.png',fullPage:true});
  await page.locator('.live-platforms [data-platform="TikTok"]').click();
  await page.locator('#postForm').waitFor({state:'visible',timeout:10000});
  if(await page.locator('#platform').inputValue()!=='TikTok')issues.push('Tocar TikTok no preseleccionó la red');
  if(await page.locator('[data-action="select-post-platform"][data-platform="TikTok"]').getAttribute('aria-pressed')!=='true')
   issues.push('El selector táctil TikTok no refleja el estado');
  const title='Borrador de prueba de marcas '+name;
  await page.locator('#title').fill(title);
  await page.locator('[data-action="select-post-platform"][data-platform="YouTube"]').click();
  if(await page.locator('#title').inputValue()!==title)issues.push('Cambiar plataforma ha eliminado el texto sin guardar');
  if(await page.locator('#platform').inputValue()!=='YouTube')issues.push('El icono de YouTube no actualiza la selección');
  await page.locator('#platform').selectOption('Facebook');
  if(await page.locator('[data-action="select-post-platform"][data-platform="Facebook"]').getAttribute('aria-pressed')!=='true')
   issues.push('El selector accesible y los iconos no están sincronizados');
  await page.locator('#platform').selectOption('YouTube');
  await page.locator('#postForm button[type="submit"]').click();
  const row=page.locator('.post-list-row',{hasText:title}).first();
  await row.waitFor({state:'visible',timeout:10000});
  if(!(await row.locator('.social-brand-icon--youtube').count()))
   issues.push('El borrador guardado no conserva el logotipo correcto de la plataforma');
  if(!(await row.textContent()).includes('YouTube'))issues.push('El borrador no conserva la plataforma real');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  if(overflow>2)issues.push('Desbordamiento horizontal en '+name+': '+overflow+' px');
  await page.screenshot({path:'visual-qa/social/'+name+'-planificador.png',fullPage:true});
  if(width<=680)await page.locator('.mobile-bottom [data-page="inicio"]').click();
  else await page.locator('.sidebar [data-page="inicio"]').click();
  await page.locator('.live-home .live-platforms').waitFor({state:'visible'});
  const saved=page.locator('.live-row',{hasText:title}).first();
  if(!(await saved.locator('.social-brand-icon--youtube').count()))
   issues.push('La pantalla de inicio no recupera el icono del borrador guardado');
  await context.close();
 }catch(error){issues.push(String(error.stack||error).slice(0,1300))}
 await browser.close();results.push({name,ok:issues.length===0,issues});
}
await writeFile('visual-qa/social/resultado.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
if(results.some(result=>!result.ok))process.exitCode=1;
