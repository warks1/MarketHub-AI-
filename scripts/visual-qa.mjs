// MarketHub AI · auditoría de la interfaz REAL adaptable: nada de capturas inertes.
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const origin=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const sizes=[
 ['smartphone-320',320,568],['iphone-375',375,812],['smartphone-390',390,844],
 ['android-430',430,932],['tablet-768',768,1024],['tablet-1024',1024,1366],
 ['pc-1440',1440,900],['mac-1920',1920,1080],['wide-2560',2560,1440]
];
await mkdir('visual-qa',{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
async function go(page,id,width){
 if(width<=680){
  if(['inicio','estudio','crear','bandeja'].includes(id)){
   await page.locator('.mobile-bottom [data-page="'+id+'"]').click();
  }else{
   await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
   await page.locator('.mobile-menu-drawer [data-page="'+id+'"]').click();
  }
 }else{
  await page.locator('.sidebar [data-page="'+id+'"]').click();
 }
}
async function widths(page,phase){
 return page.evaluate(phase=>{
  const total=document.documentElement.scrollWidth,viewport=document.documentElement.clientWidth;
  const offenders=[...document.querySelectorAll('main *')].filter(el=>{
   const r=el.getBoundingClientRect();
   return r.right>viewport+4&&r.left>=0&&r.width>2&&getComputedStyle(el).position!=='fixed';
  }).slice(0,8).map(el=>({tag:el.tagName,cls:String(el.className).slice(0,70),width:Math.round(el.getBoundingClientRect().width)}));
  return {phase,total,viewport,offenders};
 },phase);
}
try{
 for(const [id,width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const problems=[];
  page.on('pageerror',e=>problems.push('Error JS '+String(e)));
  const response=await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:15000});
  const splash=page.locator('.nexus-original-splash');
  if(await splash.isVisible().catch(()=>false)){
   const im=page.locator('.nexus-original-splash img').first();
   await im.evaluate(el=>el.decode());
   if(!(await im.getAttribute('src')).includes('boceto-04-carga-original.jpeg'))problems.push('La carga perdió el boceto 04 original');
   await page.screenshot({path:'visual-qa/'+id+'-carga.png'});
   await page.locator('#skipSplash').click();
  }
  await page.locator('.live-home').waitFor({state:'visible'});
  if(await page.locator('.mirror-overlay').count())problems.push('Captura estática cubre la interfaz funcional');
  if((await page.locator('.live-stat').count())!==6)problems.push('No están los 6 indicadores funcionales');
  await page.screenshot({path:'visual-qa/'+id+'-inicio.png',fullPage:true});
  if(['smartphone-390','pc-1440'].includes(id)){
   const editorial=page.waitForEvent('download',{timeout:10000});
   await page.locator('.live-calendar-actions [data-action="export-calendar"]').click();
   const file=await editorial;
   if(!file.suggestedFilename().endsWith('.ics'))problems.push('Falta descarga del calendario .ics');
   const bytes=await readFile(await file.path(),'utf8');
   if(!bytes.includes('BEGIN:VCALENDAR')||!bytes.includes('BEGIN:VEVENT'))problems.push('Calendario exportado no tiene eventos válidos');
  }
  const home=await widths(page,'inicio');
  if(home.total>home.viewport+4)problems.push('Inicio se desborda '+JSON.stringify(home));
  if(width<=680){
   if(!(await page.locator('.mobile-bottom').isVisible()))problems.push('Barra de navegación móvil no visible');
   await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
   if(!(await page.locator('.mobile-menu-drawer').isVisible()))problems.push('Menú Más no se abre');
   await page.screenshot({path:'visual-qa/'+id+'-menu.png'});
   await page.locator('.mobile-menu-drawer [data-page="estudio"]').click();
  }else await go(page,'estudio',width);
  await page.locator('.live-studio').waitFor({state:'visible'});
  await page.screenshot({path:'visual-qa/'+id+'-estudio.png',fullPage:true});
  const studio=await widths(page,'estudio');
  if(studio.total>studio.viewport+4)problems.push('Estudio se desborda '+JSON.stringify(studio));
  if(['smartphone-390','pc-1440'].includes(id)){
   const count=await page.locator('.live-timeline-clip').count();
   await page.locator('[data-action="storyboard-add"]').first().click();
   if((await page.locator('.live-timeline-clip').count())!==count+1)problems.push('No añade escenas');
   await page.locator('#live-scene-title').fill('Escena realmente editable');
   await page.locator('#storyboardForm button[type="submit"]').click();
   if(!(await page.locator('.live-editor-text h3').textContent()).includes('Escena realmente editable'))problems.push('Vista previa no refleja edición');
   const output=page.waitForEvent('download',{timeout:10000});
   await page.locator('[data-action="storyboard-export-png"]').click();
   const png=await output;
   if(!png.suggestedFilename().endsWith('.png'))problems.push('El estudio no exporta una imagen PNG real');
   const photoBase64=await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=48;c.height=48;
    const ctx=c.getContext('2d');ctx.fillStyle='#ff008c';ctx.fillRect(0,0,48,48);
    ctx.fillStyle='#00ffff';ctx.fillRect(16,16,16,16);
    return c.toDataURL('image/png').split(',')[1];
   });
   await page.locator('#live-scene-photo').setInputFiles({
    name:'imagen-de-escena.png',mimeType:'image/png',buffer:Buffer.from(photoBase64,'base64')
   });
   await page.locator('.live-scene-photo').waitFor({state:'visible'});
   const imgSaved=await page.evaluate(()=>{
    const data=JSON.parse(localStorage.getItem('markethub-ai-demo-v1')||'{}');
    return data.storyboard?.some(x=>typeof x.imageData==='string'&&x.imageData.startsWith('data:image/jpeg;base64,'));
   });
   if(!imgSaved)problems.push('La foto del storyboard no persiste en el almacenamiento del dispositivo');
   const pngWithPhoto=page.waitForEvent('download',{timeout:10000});
   await page.locator('[data-action="storyboard-export-png"]').click();
   const photoDownload=await pngWithPhoto;
   if(!photoDownload.suggestedFilename().endsWith('.png'))problems.push('No exporta el PNG con la foto');
   await page.screenshot({path:'visual-qa/'+id+'-estudio-con-foto.png',fullPage:true});
   await page.locator('[data-action="storyboard-select"][data-index="0"]').click();
   await page.locator('#live-scene-duration').fill('1');
   await page.locator('#storyboardForm button[type="submit"]').click();
   await page.locator('[data-action="storyboard-play"]').click();
   if((await page.locator('[data-action="storyboard-play"]').getAttribute('aria-pressed'))!=='true')
    problems.push('Reproducción de storyboard no se inicia');
   await page.waitForFunction(()=>document.querySelector('.live-timeline-clip.selected')?.dataset.index==='1',null,{timeout:5000});
   await page.locator('[data-action="storyboard-play"]').click();
   if((await page.locator('[data-action="storyboard-play"]').getAttribute('aria-pressed'))!=='false')
    problems.push('El storyboard no se puede pausar');

   // Probar una exportación de vídeo real únicamente en Chromium desktop:
   // la compatibilidad móvil se detecta desde el navegador, sin suponer códecs.
   if(id==='pc-1440'){
    const canRecord=await page.evaluate(()=>typeof MediaRecorder!=='undefined'&&
      typeof HTMLCanvasElement.prototype.captureStream==='function'&&
      ['video/mp4','video/webm'].some(t=>MediaRecorder.isTypeSupported(t)));
    const videoButton=page.locator('[data-action="storyboard-export-video"]');
    if(!canRecord){
     if(!(await videoButton.isDisabled()))problems.push('Vídeo aparece activo sin MediaRecorder compatible');
    }else{
     // Limitar a dos escenas de un segundo para la prueba y minimizar CPU.
     await page.locator('[data-action="storyboard-select"][data-index="1"]').click();
     await page.locator('#live-scene-duration').fill('1');
     await page.locator('#storyboardForm button[type="submit"]').click();
     // El proyecto inicial tiene dos escenas y una extra; si existe una tercera se quita.
     while((await page.locator('.live-timeline-clip').count())>2){
      await page.locator('[data-action="storyboard-select"]').last().click();
      await page.locator('[data-action="storyboard-remove"]').click();
      await page.locator('[data-action="confirm-storyboard-delete"]').click();
     }
     const videoWait=page.waitForEvent('download',{timeout:35000});
     await videoButton.click();
     const movie=await videoWait;
     if(!/\.(webm|mp4)$/.test(movie.suggestedFilename()))problems.push('El archivo exportado no es MP4 ni WebM');
     const stat=await import('node:fs/promises').then(async fs=>fs.stat(await movie.path()));
     if(stat.size<3000)problems.push('Vídeo exportado vacío o incompleto');
     if(stat.size>=3000){
      const payload=await readFile(await movie.path());
      const videoInfo=await page.evaluate(async({base64,mime})=>{
       const source=atob(base64),bytes=new Uint8Array(source.length);
       for(let i=0;i<source.length;i++)bytes[i]=source.charCodeAt(i);
       const blob=new Blob([bytes],{type:mime});
       const url=URL.createObjectURL(blob),video=document.createElement('video');
       video.preload='metadata';video.muted=true;
       try{
        return await new Promise((resolve,reject)=>{
         const timeout=setTimeout(()=>reject(Error('Tiempo de lectura agotado')),12000);
         video.onloadedmetadata=()=>{
          clearTimeout(timeout);
          resolve({width:video.videoWidth,height:video.videoHeight,duration:video.duration});
         };
         video.onerror=()=>{clearTimeout(timeout);reject(Error('Códec de vídeo no reproducible'))};
         video.src=url;
        });
       }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url)}
      },{base64:payload.toString('base64'),mime:movie.suggestedFilename().endsWith('.mp4')?'video/mp4':'video/webm'});
      if(videoInfo.width<320||videoInfo.height<320)problems.push('Vídeo descargado ilegible o dimensiones inválidas');
     }

     await page.screenshot({path:'visual-qa/'+id+'-video-exportado.png',fullPage:true});
    }
   }
   await page.screenshot({path:'visual-qa/'+id+'-edicion.png',fullPage:true});
  }
  if(['iphone-375','pc-1440'].includes(id)){
   await page.locator('[data-mode="Imagen"]').first().click();
   await page.locator('#visual-headline').waitFor({state:'visible'});
   await go(page,'estudio',width);
   await page.locator('[data-mode="Texto / Copy"]').first().click();
   await page.locator('#office-copy-form').waitFor({state:'visible'});
   await go(page,'estudio',width);
   await page.locator('[data-mode="Ideas"]').first().click();
   await page.locator('.workspace-tabs').waitFor({state:'visible'});
   await go(page,'estudio',width);
  }
  await go(page,'campanas',width);
  await page.locator('#campaignForm').waitFor({state:'visible'});
  if(id==='smartphone-390'){
   await page.locator('#campaignName').fill('Campaña móvil');
   await page.locator('#campaignBudget').fill('125.50');
   await page.locator('#campaignForm [type="submit"]').click();
   if(!(await page.locator('.campaign-local-row').count()))problems.push('Campañas no guardan datos');
  }
  const campaigns=await widths(page,'campanas');
  if(campaigns.total>campaigns.viewport+4)problems.push('Campañas se desborda '+JSON.stringify(campaigns));
  await page.screenshot({path:'visual-qa/'+id+'-campanas.png',fullPage:true});
  await go(page,'competencia',width);
  await page.locator('#competitorForm').waitFor({state:'visible'});
  if(['smartphone-390','pc-1440'].includes(id)){
   await page.locator('#competitorName').fill('Empresa de prueba');
   await page.locator('#competitorFollowers').fill('12300');
   await page.locator('#competitorInteractions').fill('315');
   await page.locator('#competitorForm button[type="submit"]').click();
   if(!(await page.locator('.benchmark-row').count()))problems.push('La comparativa local no guarda competidores');
   const csvDownload=page.waitForEvent('download',{timeout:10000});
   await page.locator('[data-action="competitor-export"]').click();
   if(!(await csvDownload).suggestedFilename().endsWith('.csv'))problems.push('No exporta comparativa CSV');
  }
  const benchmark=await widths(page,'competencia');
  if(benchmark.total>benchmark.viewport+4)problems.push('Competencia desborda horizontalmente '+JSON.stringify(benchmark));
  await page.screenshot({path:'visual-qa/'+id+'-competencia.png',fullPage:true});
  if(['smartphone-390','pc-1440'].includes(id)){
   await go(page,'bandeja',width);
   await page.locator('#lmsg-contact').fill('Contacto prueba');
   await page.locator('#lmsg-text').fill('Nota manual');
   await page.locator('#liveMessageForm button[type="submit"]').click();
   if(!(await page.locator('.live-message').count()))problems.push('Bandeja no guarda mensajes locales');
   await go(page,'escucha',width);
   await page.locator('#lmention-text').fill('Mención real');
   await page.locator('#lmention-source').fill('Blog');
   await page.locator('#liveMentionForm button[type="submit"]').click();
   if(!(await page.locator('.live-message').count()))problems.push('Social Listening no guarda registros');
  }
  if(['smartphone-390','pc-1440'].includes(id)){
   await go(page,'ajustes',width);
   await page.locator('#backupPassword').waitFor({state:'visible'});
   await page.locator('#backupPassword').fill('Una frase secreta de 25 caracteres!');
   if(!(await page.locator('[data-action="backup-encrypted-export"]').isDisabled())){
    const encryptedWait=page.waitForEvent('download',{timeout:18000});
    await page.locator('[data-action="backup-encrypted-export"]').click();
    const encrypted=await encryptedWait;
    const json=JSON.parse(await readFile(await encrypted.path(),'utf8'));
    if(json.format!=='markethub-ai-encrypted-backup'||json.cipher!=='AES-256-GCM')
     problems.push('La copia protegida no está cifrada correctamente');
    if(JSON.stringify(json).includes('Contacto prueba'))
     problems.push('La copia cifrada ha filtrado datos de clientes en texto legible');
    await page.screenshot({path:'visual-qa/'+id+'-copia-cifrada.png',fullPage:true});
   }else problems.push('Cifrado bloqueado en el navegador de prueba HTTPS/local');
  }

  // Flujos de formularios reales: Oficina y Growth Lab en móvil y escritorio.
  if(['smartphone-390','pc-1440'].includes(id)){
   const checkBroken=async section=>{
    const text=await page.locator('main').innerText();
    const errors=text.match(/\bNaN\b|\bundefined\b|\[object Object\]/g);
    if(errors?.length)problems.push('Valores rotos en '+section+': '+errors.join(', '));
   };
   await go(page,'oficina',width);
   await page.locator('.workspace-tabs [data-office-action="tab-calculadora"]').click();
   await page.locator('#calcSpend').fill('100');
   await page.locator('#calcRevenue').fill('250');
   await page.locator('#calcLeads').fill('10');
   await page.locator('#calcOrders').fill('2');
   await page.locator('#office-calc-form button[type="submit"]').click();
   if(!(await page.locator('.workspace-metrics').innerText()).includes('2.50×'))problems.push('Oficina no calcula ROAS 2.50×');
   await checkBroken('Oficina / Calculadora');
   await page.locator('.workspace-tabs [data-office-action="tab-landing"]').click();
   await page.locator('#landingTitle').fill('Promoción de prueba con palabras completas');
   await page.locator('#landingSubtitle').fill('Esta vista previa debe respetar las palabras y los saltos de línea.');
   await page.locator('#landingUrl').fill('https://example.com/landing');
   await page.locator('#office-landing-form button[type="submit"]').click();
   const title=await page.locator('.workspace-landing-preview h2').textContent();
   if(!title?.includes('Promoción de prueba'))problems.push('La vista previa de la landing no se actualiza');
   await checkBroken('Oficina / Landing');
   await page.screenshot({path:'visual-qa/'+id+'-oficina-landing.png',fullPage:true});

   await go(page,'laboratorio',width);
   await page.locator('#briefName').fill('Campaña de prueba');
   await page.locator('#briefAudience').fill('Público de prueba');
   await page.locator('#briefOffer').fill('Servicio de muestra');
   await page.locator('#briefBudget').fill('125.50');
   await page.locator('#growth-brief button[type="submit"]').click();
   if(!(await page.locator('.growth-entry').count()))problems.push('Growth Lab no guarda briefs');
   await checkBroken('Growth Lab / Briefs');
   await page.locator('[data-growth-action="tab-utm"]').click();
   await page.locator('#utmBase').fill('https://example.com/producto');
   await page.locator('#utmSource').fill('instagram');
   await page.locator('#utmMedium').fill('social');
   await page.locator('#utmCampaign').fill('Promocion movil');
   await page.locator('#growth-utm button[type="submit"]').click();
   if(!(await page.locator('.growth-entry').count()))problems.push('Growth Lab no genera enlaces UTM');
   await checkBroken('Growth Lab / UTM');
   await page.screenshot({path:'visual-qa/'+id+'-growth-utm.png',fullPage:true});
  }
  results.push({id,width,height,http:response?.status(),home,studio,campaigns,problems});
  await page.close();
 }
}finally{await browser.close()}
await writeFile('visual-qa/resultados.json',JSON.stringify(results,null,2));
const bad=results.filter(x=>x.problems.length);
console.log(JSON.stringify({screens:results.length,failures:bad.map(x=>({id:x.id,problems:x.problems}))},null,2));
if(bad.length)process.exitCode=1;
