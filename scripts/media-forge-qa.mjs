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
  // Persistencia real en IndexedDB: guardar, recargar, reabrir y eliminar.
  await page.locator('[data-forge-action="vault-save-photo"]').click();
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
  if(!(await page.locator('.forge-vault-item strong').first().textContent()).includes('campana-prueba'))
   problems.push('La imagen de la biblioteca no sobrevivió a la recarga');
  await page.screenshot({path:'visual-qa/forge/'+engine+'-biblioteca.png'});
  await page.locator('.forge-vault-item [data-forge-action="vault-open"]').first().click();
  await page.locator('#forgeCanvas').waitFor();
  await page.waitForFunction(()=>document.querySelector('#forgeCanvas')?.width===600,{timeout:10000})
   .catch(()=>problems.push('No se reabrió correctamente la imagen guardada'));
  await page.locator('[data-forge-tab="vault"]').click();
  await page.locator('.forge-vault-item').first().waitFor();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('.forge-vault-item [data-forge-action="vault-delete"]').first().click();
  await page.locator('.forge-vault-item').first().waitFor({state:'detached',timeout:10000});
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
