// QA real de reproductor de sonido + visualizador y galería en PC, iPhone y tablet.
import {chromium,webkit} from 'playwright';
import {mkdir,readFile} from 'node:fs/promises';
import {encodeWav} from '../src/media-forge.js';
await mkdir('visual-qa/players',{recursive:true});
const wavBuffer=()=>{
 const sampleRate=22050,length=sampleRate*3;
 const samples=Float32Array.from({length},(_,i)=>Math.sin(2*Math.PI*440*i/sampleRate)*.35);
 return Buffer.from(encodeWav({sampleRate,numberOfChannels:1,length,duration:length/sampleRate,getChannelData:()=>samples}));
};
const audioBytes=wavBuffer();
const presets=[
 {label:'chrome-desktop',driver:chromium,w:1440,h:900},
 {label:'webkit-iphone',driver:webkit,w:390,h:844},
 {label:'webkit-ipad',driver:webkit,w:768,h:1024}
];
const results=[];
for(const {label,driver,w,h} of presets){
 const browser=await driver.launch({headless:true});
 const errors=[];
 const context=await browser.newContext({viewport:{width:w,height:h},acceptDownloads:true});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push('Error JS: '+e.message));
 try{
  await page.goto(process.env.MARKETHUB_URL||'http://127.0.0.1:5173/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:20000});
  await page.locator('#skipSplash').click({timeout:3500}).catch(()=>{});
  if(w<=680){
   await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
   await page.locator('.mobile-menu-drawer [data-page="multimedia"]').click();
  }else await page.locator('.sidebar [data-page="multimedia"]').click();
  await page.locator('[data-forge-tab="players"]').click();
  await page.locator('#forgePlayerStage').waitFor();
  const images=await page.evaluate(()=>{
   const make=color=>{
    const canvas=document.createElement('canvas');
    canvas.width=48;canvas.height=36;
    const c=canvas.getContext('2d');c.fillStyle=color;c.fillRect(0,0,48,36);
    return canvas.toDataURL('image/png').split(',')[1];
   };
   return [make('#ff1111'),make('#2255ff')];
  });
  await page.locator('[data-forge-file="player-images"]').setInputFiles(images.map((base64,i)=>({
   name:['Primera.png','Segunda.png'][i],mimeType:'image/png',buffer:Buffer.from(base64,'base64')
  })));
  // La decodificación de dos Blob puede completarse después de que el contador sea visible en WebKit.
  await page.waitForFunction(()=>document.querySelector('#forgePlayerCount')?.textContent?.trim()==='1 / 2',null,{timeout:12000});
  if((await page.locator('.forge-player-thumb').count())!==2)errors.push('No se cargaron ambas fotografías');
  await page.locator('[data-forge-action="player-next"]').click();
  if((await page.locator('#forgePlayerCaption').textContent()||'').indexOf('Segunda.png')===-1)errors.push('Siguiente imagen no cambia');
  await page.locator('[data-forge-action="player-prev"]').click();
  await page.locator('[data-forge-action="player-zoom-in"]').click();
  if(!(await page.locator('#forgePlayerZoom').textContent()).includes('125'))errors.push('Zoom no funciona');
  await page.locator('[data-forge-action="player-rotate"]').click();
  if(!(await page.locator('#forgePlayerImage').getAttribute('style')).includes('rotate(90deg)'))errors.push('Rotación no funciona');
  await page.locator('[data-forge-action="player-expand"]').click();
  if(!(await page.locator('#forgePlayerGallery').getAttribute('class')).includes('is-expanded'))errors.push('No entra en pantalla completa');
  await page.locator('[data-forge-action="player-expand"]').click();
  await page.locator('[data-forge-action="player-reset"]').click();
  await page.locator('[data-forge-action="player-slideshow"]').click();
  await page.locator('[data-forge-action="player-slideshow"]').click();
  const downloadEvent=page.waitForEvent('download',{timeout:12000});
  await page.locator('[data-forge-action="player-image-download"]').click();
  const result=await downloadEvent;const png=await readFile(await result.path());
  if(png.subarray(0,4).toString('hex')!=='89504e47')errors.push('Descarga de imagen original inválida');
  await page.locator('[data-forge-file="player-audio"]').setInputFiles({
   name:'Tono-440Hz.wav',mimeType:'audio/wav',buffer:audioBytes
  });
  await page.locator('#forgePlayerAudio').waitFor({state:'visible',timeout:10000});
  await page.waitForFunction(()=>document.querySelector('#forgePlayerAudio')?.readyState>=1,null,{timeout:10000});
  await page.locator('[data-forge-action="player-loop"]').click();
  const loop=await page.locator('#forgePlayerAudio').evaluate(el=>el.loop);
  if(!loop)errors.push('Bucle de audio no cambia');
  await page.locator('[data-forge-action="player-rate"]').click();
  const rate=await page.locator('#forgePlayerAudio').evaluate(el=>el.playbackRate);
  if(rate!==1.25)errors.push('Velocidad no cambia');
  await page.locator('[data-forge-action="player-waveform"]').click();
  await page.locator('[data-forge-action="player-visualize"]').click();
  const visualMessage=await page.locator('#forgePlayerAudioStatus').textContent();
  if(!visualMessage.includes('activado')&&!visualMessage.includes('no ofrece Web Audio'))errors.push('Visualizador no se activa: '+visualMessage);
  if(visualMessage.includes('activado')){
   await page.locator('[data-forge-action="player-play"]').click();
   await page.locator('#forgePlayerSpectrum[data-live="true"]').waitFor({timeout:12000});
   const current=await page.locator('#forgePlayerAudio').evaluate(el=>el.currentTime);
   if(current<0)errors.push('El audio no está reproduciéndose');
   await page.locator('[data-forge-action="player-spectrum"]').click();
   await page.locator('[data-forge-action="player-play"]').click();
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  if(overflow>2)errors.push('Desbordamiento horizontal: '+overflow+' px');
  await page.screenshot({path:'visual-qa/players/'+label+'.png',fullPage:true});
  await page.locator('[data-forge-tab="photo"]').click();
  if(!await page.locator('#forgeCanvas').count())errors.push('El editor fotográfico anterior dejó de funcionar');
  await page.locator('[data-forge-tab="audio"]').click();
  if(!await page.locator('[data-forge-action="wav"]').count())errors.push('El conversor WAV anterior desapareció');
 }catch(error){errors.push(String(error.message||error).slice(0,800))}
 await context.close();await browser.close();
 results.push({label,ok:errors.length===0,errors});
}
console.log(JSON.stringify(results,null,2));
if(results.some(x=>!x.ok))process.exitCode=1;
