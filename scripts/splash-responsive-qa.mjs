// QA visual: el mismo boceto 04 se compone con elementos responsivos en TODOS los dispositivos.
// Se permiten scroll vertical y cambios de colocación; nunca tarjetas ocultas ni recortes horizontales.
import {chromium,webkit} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const url=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const cases=[
 ['iphone-se',320,568],['iphone',375,812],['android',390,844],
 ['android-grande',430,932],['movil-horizontal',844,390],
 ['tablet-600',600,960],['ipad',768,1024],['ipad-horizontal',1024,768],
 ['tablet-grande',1180,820],['ipad-pro-horizontal',1194,834],
 ['portatil',1280,800],['pc',1440,900],['pc-full-hd',1920,1080]
];
const safari=[['safari-iphone',375,812],['safari-ipad',768,1024],['safari-ipad-horizontal',1024,768],['safari-pc',1440,900]];
const expected=['Analítica inteligente','IA creativa','Campañas con IA','Social Listening','Contenido creativo','Planificación y automatización'];

await mkdir('visual-qa/splash',{recursive:true});
const results=[];

async function inspect(browser,engine,devices){
 for(const [device,width,height] of devices){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const failures=[];
  page.on('pageerror',error=>failures.push('Error JS: '+error.message));
  // Congela la pantalla el tiempo suficiente para inspeccionar su geometría.
  await page.addInitScript(()=>{
   const realSetInterval=window.setInterval;
   window.setInterval=(callback,ms,...rest)=>ms===105?0:realSetInterval(callback,ms,...rest);
  });
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
   if(!response?.ok())failures.push('Carga HTTP incorrecta: '+response?.status());
   const splash=page.locator('.nexus-original-splash .mh-splash-compact');
   await splash.waitFor({state:'visible',timeout:15000});
   const cards=page.locator('.nexus-original-splash .mh-splash-feature');
   if(await cards.count()!==6)failures.push('No aparecen los seis banners');
   const observed=await cards.evaluateAll(elements=>elements.map(el=>{
    const rect=el.getBoundingClientRect(),label=el.querySelector('span');
    const style=getComputedStyle(el);
    const textBox=label?.getBoundingClientRect();
    return {
     name:label?.textContent.trim(),
     left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
     width:rect.width,height:rect.height,font:Number.parseFloat(getComputedStyle(label).fontSize),
     hidden:style.display==='none'||style.visibility==='hidden'||Number(style.opacity)<.5,
     textOverflows:!!textBox&&(label.scrollWidth>label.clientWidth+2)
    };
   }));
   for(const name of expected){
    if(!observed.some(card=>card.name===name))failures.push('Falta el banner '+name);
   }
   for(const card of observed){
    if(card.hidden)failures.push('Banner oculto: '+card.name);
    if(card.left<-.7||card.right>width+.7)failures.push('Banner recortado lateralmente: '+card.name);
    if(card.width<90||card.height<40)failures.push('Banner demasiado pequeño: '+card.name);
    if(card.font<10)failures.push('Texto demasiado pequeño: '+card.name);
    if(card.textOverflows)failures.push('Texto se sale de su tarjeta: '+card.name);
   }
   for(let i=0;i<observed.length;i++)for(let j=i+1;j<observed.length;j++){
    const a=observed[i],b=observed[j];
    if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>3&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>3){
     failures.push('Tarjetas superpuestas: '+a.name+' / '+b.name);
    }
   }
   const center=page.locator('.mh-splash-orb-crop img');
   if(!(await center.getAttribute('src'))?.includes('boceto-04-carga-original.jpeg')){
    failures.push('La esfera no utiliza el boceto 04 aprobado');
   }
   const measured=await splash.evaluate(el=>({
    scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,
    scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,
    overflowY:getComputedStyle(el).overflowY
   }));
   if(measured.scrollWidth>measured.clientWidth+2)failures.push('Desbordamiento horizontal de la pantalla');
   if(measured.scrollHeight>measured.clientHeight+3&&measured.overflowY!=='auto'){
    failures.push('Contenido inferior inaccesible en una pantalla corta');
   }
   // Reproduce el fallo reportado: 56 % visible pero barra sin relleno.
   await page.locator('#progressFill').evaluate(el=>{
    el.style.setProperty('--splash-progress','0.56');
    el.parentElement.querySelector('.progress-value').textContent='56%';
   });
   await page.waitForTimeout(180); // Transición CSS de 100 ms.
   const progress=await page.locator('#progressFill').evaluate(el=>{
    const a=el.getBoundingClientRect(),track=el.parentElement.getBoundingClientRect();
    const computed=getComputedStyle(el);
    return {
     height:a.height,ratio:track.width?a.width/track.width:0,background:computed.backgroundImage,
     paintedWidth:a.width,layoutWidth:el.offsetWidth,cssWidth:computed.width,
     inlineProgress:el.style.getPropertyValue('--splash-progress'),
     computedProgress:computed.getPropertyValue('--splash-progress'),
     transform:computed.transform,trackWidth:track.width
    };
   });
   if(progress.height<10||progress.ratio<.49||progress.ratio>.61||!progress.background.includes('gradient')){
    failures.push('La barra de 56 % no se rellena correctamente: '+JSON.stringify(progress));
   }
   // En tablet vertical/horizontal el conjunto debe quedar centrado si cabe.
   if(width>=700&&width<=1199&&height>=700){
    const group=await page.evaluate(()=>{
     const start=document.querySelector('.mh-splash-showcase').getBoundingClientRect();
     const end=document.querySelector('.mh-splash-bottom').getBoundingClientRect();
     return {top:start.top,bottom:end.bottom};
    });
    if(group.bottom-group.top<height-40&&Math.abs((group.top+group.bottom)/2-height/2)>Math.max(75,height*.13)){
     failures.push('La composición de tablet está desplazada hacia un extremo: '+JSON.stringify(group));
    }
   }
   for(const selector of ['.mh-splash-brand','.mh-splash-track','.mh-splash-status','.mh-splash-bottom','#skipSplash']){
    if(!(await page.locator('.nexus-original-splash '+selector).isVisible()))failures.push('Falta elemento: '+selector);
   }
   await page.screenshot({path:'visual-qa/splash/'+engine+'-'+device+'.png'});
   await page.locator('#skipSplash').scrollIntoViewIfNeeded();
   await page.screenshot({path:'visual-qa/splash/'+engine+'-'+device+'-pie.png'});
   await page.locator('#skipSplash').click();
   if(await page.locator('.nexus-original-splash').count())failures.push('Entrar no cierra la carga');
  }catch(error){
   failures.push(String(error.message||error));
  }finally{
   results.push({engine,device,width,height,failures});
   await page.close();
  }
 }
}
const chrome=await chromium.launch({headless:true});
try{await inspect(chrome,'chromium',cases)}finally{await chrome.close()}
const safariBrowser=await webkit.launch({headless:true});
try{await inspect(safariBrowser,'webkit',safari)}finally{await safariBrowser.close()}
await writeFile('visual-qa/splash/resultados.json',JSON.stringify(results,null,2));
const errors=results.filter(result=>result.failures.length);
console.log(JSON.stringify({tested:results.length,failed:errors.length,errors},null,2));
if(errors.length)process.exitCode=1;
