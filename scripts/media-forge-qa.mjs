// Integración real de MEDIA FORGE: flujos de foto, audio y ZIP en Chromium y WebKit.
import {chromium,webkit} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {encodeWav} from '../src/media-forge.js';
const base=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
await mkdir('visual-qa/forge',{recursive:true});
const results=[];
const wavBuffer=encodeWav({
 sampleRate:8000,numberOfChannels:1,length:8000,duration:1,
 getChannelData:()=>Float32Array.from({length:8000},(_,i)=>Math.sin(i/8000*2*Math.PI*440)*.15)
});
for(const [engine,runner,width,height] of [
 ['chromium-mobile',chromium,390,844],['chromium-desktop',chromium,1440,900],
 ['webkit-iphone',webkit,375,812],['webkit-ipad',webkit,768,1024]
]){
 const browser=await runner.launch({headless:true});
 const page=await browser.newPage({viewport:{width,height},acceptDownloads:true,deviceScaleFactor:1});
 const problems=[];
 page.on('pageerror',error=>problems.push(String(error.message).slice(0,150)));
 try{
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true);
  await page.locator('#skipSplash').click({timeout:4000}).catch(()=>{});
  if(width<=680){
   await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
   await page.locator('.mobile-menu-drawer [data-page="multimedia"]').click();
  }else await page.locator('.sidebar [data-page="multimedia"]').click();
  await page.locator('.media-forge').waitFor();
  const photo=await page.evaluate(()=>{
   const canvas=document.createElement('canvas');canvas.width=160;canvas.height=120;
   const ctx=canvas.getContext('2d');
   ctx.fillStyle='#16c5da';ctx.fillRect(0,0,160,120);ctx.fillStyle='#e536bb';ctx.fillRect(45,25,70,70);
   return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.locator('[data-forge-file="photo"]').setInputFiles({
   name:'campana-prueba.png',mimeType:'image/png',buffer:Buffer.from(photo,'base64')
  });
  await page.locator('[data-forge-input="mask"]').selectOption('corazon');
  await page.locator('[data-forge-input="format"]').selectOption('1:1');
  await page.locator('[data-forge-input="caption"]').fill('CAMPAÑA DE PRUEBA');
  // Auditor PULSE: debe analizar una creatividad local sin bloquear el editor.
  await page.locator('[data-forge-action="audit-photo"]').click();
  await page.locator('.forge-audit h2').waitFor({state:'visible'});
  if(!(await page.locator('.forge-audit li').count()))problems.push('Auditor PULSE no presenta hallazgos');
  // ADN Creativo: guardar una identidad, aplicar y preservar la composición.
  await page.locator('[data-forge-input="brandName"]').fill('Marca de Prueba');
  await page.locator('[data-forge-input="brandPrimary"]').evaluate(el=>{el.value='#1122aa';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});
  await page.locator('[data-forge-input="brandAccent"]').evaluate(el=>{el.value='#ff33dd';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});
  await page.locator('[data-forge-input="brandTone"]').selectOption('Cercano');
  await page.locator('[data-forge-input="brandCta"]').fill('Descubre la campaña');
  await page.locator('[data-forge-action="brand-save"]').click();
  if(!(await page.locator('#forgeBrandSelect option').allTextContents()).includes('Marca de Prueba'))
   problems.push('El ADN de marca no se guarda en la lista');
  await page.locator('#forgeBrandSelect').selectOption('marca-de-prueba');
  await page.locator('[data-forge-action="brand-apply"]').click();
  if((await page.locator('[data-forge-input="brandPrimary"]').inputValue()).toLowerCase()!=='#1122aa')
   problems.push('El perfil de marca no recupera el color principal');
  const canvasInfo=await page.locator('#forgeCanvas').evaluate(el=>({w:el.width,h:el.height}));
  if(canvasInfo.w!==600||canvasInfo.h!==600)problems.push('Vista previa 1:1 incorrecta '+JSON.stringify(canvasInfo));
  await page.screenshot({path:'visual-qa/forge/'+engine+'-foto.png'});
  const pngWait=page.waitForEvent('download',{timeout:20000});
  await page.locator('[data-forge-action="png"]').click();
  const png=await pngWait,pngBytes=await readFile(await png.path());
  if(pngBytes.subarray(0,4).toString('hex')!=='89504e47')problems.push('PNG exportado inválido');
  const packWait=page.waitForEvent('download',{timeout:30000});
  await page.locator('[data-forge-action="pack"]').click();
  const pack=await packWait,zip=await readFile(await pack.path());
  if(zip.subarray(0,4).toString()!=='PK\u0003\u0004')problems.push('ZIP exportado inválido');
  for(const format of ['9x16','4x5','1x1','16x9','3x2'])
   if(!zip.includes(Buffer.from('campana-prueba-'+format+'.jpg')))problems.push('Falta formato '+format+' en PULSE PACK');
  // Guardar el ORIGINAL con capas/parámetros editables, exportar una copia portable,
  // y reabrir desde la galería sin depender de otro editor.
  await page.locator('[data-forge-input="projectName"]').fill('Campaña editable PULSE');
  await page.locator('[data-forge-action="project-save"]').click();
  await page.locator('.toast').filter({hasText:'Proyecto editable guardado.'}).waitFor({state:'visible',timeout:20000});
  await page.locator('[data-forge-action="project-list"]').click();
  await page.locator('.forge-project-item').first().waitFor({state:'visible',timeout:15000});
  const backupWait=page.waitForEvent('download',{timeout:25000});
  await page.locator('[data-forge-action="project-export"]').first().click();
  const projectDownload=await backupWait,projectBytes=await readFile(await projectDownload.path());
  if(!projectDownload.suggestedFilename().endsWith('.mhub'))problems.push('Copia de proyecto no usa .mhub');
  let portable;
  try{portable=JSON.parse(projectBytes.toString('utf8'))}catch{problems.push('Copia de proyecto no es JSON válido')}
  const fullBackupWait=page.waitForEvent('download',{timeout:20000});
  await page.locator('[data-forge-action="project-batch-export"]').click();
  const fullDownload=await fullBackupWait,fullBytes=await readFile(await fullDownload.path());
  if(!fullDownload.suggestedFilename().endsWith('.mhubpack')||
      fullBytes.subarray(0,4).toString('hex')!=='504b0304')problems.push('Copia completa .mhubpack ZIP inválida');
  if(portable?.format!=='mhub-creative-project'||portable?.settings?.mask!=='corazon'||
     portable?.settings?.format!=='1:1'||!portable?.sourceBase64)
   problems.push('La copia editable no incluye foto original y ajustes de campaña');
  await page.locator('[data-forge-action="project-open"]').first().click();
  await page.locator('[data-forge-input="format"]').waitFor();
  if(await page.locator('[data-forge-input="mask"]').inputValue()!=='corazon'||
     await page.locator('[data-forge-input="caption"]').inputValue()!=='CAMPAÑA DE PRUEBA')
   problems.push('Los ajustes del proyecto no se recuperan al reabrirlo');
  // Persistencia real en IndexedDB: guardar, recargar, reabrir y eliminar.
  await page.locator('[data-forge-action="vault-save-photo"]').click();
  // El guardado es asíncrono; confirmar su finalización antes de abrir otra pestaña.
  await page.locator('.toast').filter({hasText:'Composición guardada en Mi biblioteca'}).waitFor({state:'visible',timeout:20000});
  await page.locator('[data-forge-tab="vault"]').click();
  await page.locator('.forge-vault-item').first().waitFor({state:'visible',timeout:15000});
  if((await page.locator('.forge-vault-item').count())!==1)problems.push('La biblioteca no guardó exactamente una imagen');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true);
  await page.locator('#skipSplash').click({timeout:4000}).catch(()=>{});
  if(width<=680){
   await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
   await page.locator('.mobile-menu-drawer [data-page="multimedia"]').click();
  }else await page.locator('.sidebar [data-page="multimedia"]').click();
  await page.locator('[data-forge-tab="vault"]').click();
  await page.locator('.forge-vault-item').first().waitFor({state:'visible',timeout:15000});
  const storedType=await page.locator('.forge-vault-item .forge-vault-info small').first().innerText();
  if(!storedType.includes('image/jpeg'))
   problems.push('La imagen de la biblioteca no sobrevivió a la recarga como JPG');
  await page.screenshot({path:'visual-qa/forge/'+engine+'-biblioteca.png'});
  await page.locator('.forge-vault-item [data-forge-action="vault-open"]').first().click();
  await page.locator('#forgeCanvas').waitFor();
  // El formato predeterminado tras recargar es 9:16; elegir 1:1 para comprobar
  // que existe una foto real reabierta y no el canvas de marcador vacío.
  await page.locator('[data-forge-input="format"]').selectOption('1:1');
  await page.waitForFunction(()=>document.querySelector('#forgeCanvas')?.width===600,null,{timeout:10000})
   .catch(()=>problems.push('No se reabrió correctamente la imagen guardada'));
  await page.locator('[data-forge-tab="vault"]').click();
  await page.locator('.forge-vault-item').first().waitFor();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('.forge-vault-item [data-forge-action="vault-delete"]').first().click();
  await page.locator('.forge-vault-item').first().waitFor({state:'detached',timeout:10000});
  // Proyectos: sobreviven a recarga, se eliminan con confirmación y se pueden
  // recuperar en otro dispositivo desde el fichero portable exportado.
  await page.locator('[data-forge-tab="projects"]').click();
  await page.locator('.forge-project-item').first().waitFor({state:'visible',timeout:15000});
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('[data-forge-action="project-delete"]').first().click();
  await page.locator('.forge-project-item').first().waitFor({state:'detached',timeout:15000});
  await page.locator('[data-forge-file="project"]').setInputFiles({
    name:'campana-recuperada.mhub',mimeType:'application/json',buffer:projectBytes
  });
  await page.locator('.forge-project-item').first().waitFor({state:'visible',timeout:15000});
  await page.locator('[data-forge-action="project-open"]').first().click();
  await page.locator('[data-forge-input="format"]').waitFor();
  if(await page.locator('[data-forge-input="format"]').inputValue()!=='1:1')
   problems.push('La copia portable no restaura el formato de la campaña');
  // La copia completa añade sin sobreescribir la copia .mhub recuperada.
  await page.locator('[data-forge-tab="projects"]').click();
  await page.locator('.forge-project-item').first().waitFor();
  await page.locator('[data-forge-file="portfolio"]').setInputFiles({
   name:'respaldo-de-campanas.mhubpack',mimeType:'application/zip',buffer:fullBytes
  });
  await page.waitForFunction(()=>document.querySelectorAll('.forge-project-item').length===2,
   null,{timeout:15000}).catch(()=>problems.push('La copia completa no restauró el proyecto adicional'));
  const countAfterFullImport=await page.locator('.forge-project-item').count();
  if(countAfterFullImport!==2)problems.push('El respaldo completo ha reemplazado o duplicado mal los proyectos');


  await page.locator('[data-forge-tab="audio"]').click();
  await page.locator('[data-forge-file="audio"]').setInputFiles({
   name:'voz-prueba.wav',mimeType:'audio/wav',buffer:Buffer.from(wavBuffer)
  });
  const wavWait=page.waitForEvent('download',{timeout:20000});
  await page.locator('[data-forge-action="wav"]').click();
  const wav=await wavWait,wavData=await readFile(await wav.path());
  if(wavData.subarray(0,4).toString()!=='RIFF')problems.push('Conversión de audio WAV inválida');
  await page.locator('[data-forge-tab="video"]').click();
  if(!(await page.locator('video').count())){ // Sin fichero: el visor debe admitir su incorporación.
   if(!(await page.locator('[data-forge-file="video"]').count()))problems.push('Falta visor de vídeo');
  }
  await page.locator('[data-forge-tab="pdf"]').click();
  if(!(await page.locator('[data-forge-file="pdf"]').count()))problems.push('Falta selector de PDF');
  results.push({engine,width,height,problems});
 }catch(err){problems.push(String(err.message||err).slice(0,500));results.push({engine,width,height,problems});}
 finally{await page.close();await browser.close()}
}
await writeFile('visual-qa/forge/resultados.json',JSON.stringify(results,null,2));
const failed=results.filter(x=>x.problems.length);
console.log(JSON.stringify({total:results.length,failed},null,2));
if(failed.length)process.exitCode=1;
