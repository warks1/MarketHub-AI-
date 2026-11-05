// QA específica del boceto 04: todos los paneles de información completos
// en móvil / tablet / PC, sin encogimiento ilegible ni recortes laterales.
// En equipos compactos es válido desplazarse verticalmente, nunca ocultar tarjetas.
import {chromium,webkit} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const url=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const checks=[
 ['iphone-320',320,568],['iphone-375',375,812],['android-390',390,844],
 ['android-430',430,932],['movil-horizontal',844,390],
 ['tablet-600',600,960],['ipad-768',768,1024],['ipad-horizontal',1024,768],
 ['tablet-grande',1180,820],['ipad-pro-horizontal',1194,834],
 ['portatil-1280',1280,800],['pc-1440',1440,900],['pc-1920',1920,1080]
];
const webkitSizes=[['safari-iphone-375',375,812],['safari-ipad-768',768,1024],['safari-ipad-horizontal',1024,768]];
const expected=['Analítica inteligente','IA creativa','Campañas con IA','Social Listening','Contenido creativo','Planificación y automatización'];
await mkdir('visual-qa/splash',{recursive:true});
const results=[];
async function testBrowser(browser,label,devices){
 for(const [id,width,height] of devices){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const failures=[];
  page.on('pageerror',e=>failures.push('Excepción JS: '+e.message));
  // Congela únicamente el contador de 105 ms de la pantalla de carga durante la inspección.
  await page.addInitScript(()=>{
   const original=window.setInterval;
   window.setInterval=(fn,ms,...args)=>ms===105?0:original(fn,ms,...args);
  });
  try{
   const resp=await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
   await page.locator('.nexus-original-splash').waitFor({state:'visible',timeout:12000});
   const compact=width<=1199||height<=640;
   if(compact){
    const cards=page.locator('.mh-splash-feature');
    await cards.first().waitFor({state:'visible'});
    if(await cards.count()!==6)failures.push('No se muestran los seis paneles');
    const observed=await cards.evaluateAll(elements=>elements.map(e=>{
     const a=e.getBoundingClientRect(),sty=getComputedStyle(e),txt=e.querySelector('span');
     return {name:txt?.textContent.trim(),x:a.left,y:a.top,right:a.right,bottom:a.bottom,
       width:a.width,height:a.height,font:parseFloat(getComputedStyle(txt).fontSize),
       display:sty.display,visibility:sty.visibility,opacity:sty.opacity};
    }));
    for(const name of expected)if(!observed.some(x=>x.name===name))failures.push('Falta el banner '+name);
    for(const card of observed){
     if(card.x<-.6||card.right>width+.6)failures.push('Panel cortado lateralmente: '+card.name+' '+JSON.stringify(card));
     if(card.width<100||card.height<55)failures.push('Panel demasiado pequeño: '+card.name+' '+JSON.stringify(card));
     if(card.font<11.9)failures.push('Texto ilegible: '+card.name+' '+card.font+'px');
     if(card.display==='none'||card.visibility==='hidden'||Number(card.opacity)<.5)failures.push('Panel oculto: '+card.name);
    }
    for(let i=0;i<observed.length;i++)for(let j=i+1;j<observed.length;j++){
     const a=observed[i],b=observed[j];
     if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>4&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>4)
      failures.push('Paneles solapados: '+a.name+' / '+b.name);
    }
    const src=await page.locator('.mh-splash-orb-crop img').getAttribute('src');
    if(!src?.includes('boceto-04-carga-original.jpeg'))failures.push('La esfera no usa la imagen original 04');
    const shell=await page.locator('.mh-splash-compact').evaluate(e=>({
     scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,
     overflowY:getComputedStyle(e).overflowY
    }));
    if(shell.scrollWidth>shell.clientWidth+2)failures.push('La pantalla de carga desborda horizontalmente');
    if(shell.scrollHeight>shell.clientHeight+3&&shell.overflowY!=='auto')failures.push('Contenido vertical inaccesible en pantalla corta');
    await page.screenshot({path:'visual-qa/splash/'+label+'-'+id+'.png'});
    await page.locator('#skipSplash').scrollIntoViewIfNeeded();
    await page.screenshot({path:'visual-qa/splash/'+label+'-'+id+'-final.png'});
    await page.locator('#skipSplash').click();
    if(await page.locator('.nexus-original-splash').count())failures.push('Botón Entrar no cierra la carga');
   }else{
    if(await page.locator('.mh-splash-feature').count())failures.push('El escritorio panorámico no utiliza el original completo');
    const img=page.locator('.nexus-original-splash-board>img');
    await img.evaluate(el=>el.decode());
    if(!(await img.getAttribute('src')).includes('boceto-04-carga-original.jpeg'))failures.push('No se usa el JPEG elegido');
    const box=await img.boundingBox();
    if(!box||box.x<-.6||box.x+box.width>width+1||box.y<-.6||box.y+box.height>height+1)
      failures.push('JPEG panorámico recortado en escritorio');
    await page.screenshot({path:'visual-qa/splash/'+label+'-'+id+'.png'});
   }
   results.push({id,browser:label,width,height,compact,failures});
  }catch(err){
   results.push({id,browser:label,width,height,failures:[...failures,String(err.message||err)]});
  }finally{await page.close()}
 }
}
const chromiumBrowser=await chromium.launch({headless:true});
try{await testBrowser(chromiumBrowser,'chromium',checks)}finally{await chromiumBrowser.close()}
const safariBrowser=await webkit.launch({headless:true});
try{await testBrowser(safariBrowser,'webkit',webkitSizes)}finally{await safariBrowser.close()}
await writeFile('visual-qa/splash/resultados.json',JSON.stringify(results,null,2));
const fail=results.filter(r=>r.failures.length);
console.log(JSON.stringify({devices:results.length,failed:fail.length,details:fail},null,2));
if(fail.length)process.exitCode=1;
