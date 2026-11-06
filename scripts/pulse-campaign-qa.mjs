// PULSE Campaign Pilot: prueba de generación local, CSV/ICS y límite FREE real.
import {chromium,webkit} from 'playwright';
import {mkdir,readFile} from 'node:fs/promises';
await mkdir('visual-qa/pulse',{recursive:true});
const base=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const variants=[
 {name:'chromium-desktop',engine:chromium,width:1440,height:900},
 {name:'webkit-mobile',engine:webkit,width:390,height:844}
];
const results=[];
async function openGrowth(page,width){
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000});
 await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:20000});
 await page.locator('#skipSplash').click({timeout:3500}).catch(()=>{});
 if(width<=680){
  await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
  await page.locator('.mobile-menu-drawer [data-page="laboratorio"]').click();
 }else await page.locator('.sidebar [data-page="laboratorio"]').click();
 await page.locator('#growth-brief').waitFor({state:'visible',timeout:12000});
}
async function makePlan(page){
 await page.locator('#briefName').fill('Campaña PULSE de prueba');
 await page.locator('#briefAudience').fill('Personas que buscan servicios locales');
 await page.locator('#briefOffer').fill('una solución práctica para el hogar');
 await page.locator('#briefChannel').selectOption('Multicanal');
 await page.locator('#briefGoal').selectOption('Ventas');
 await page.locator('#briefDate').fill('2026-11-29');
 await page.locator('#briefCta').fill('Solicita información');
 await page.locator('#growth-brief button[type="submit"]').click();
 await page.locator('[data-growth-action="pulse-generate"]').first().click();
 await page.locator('.growth-pulse-day').first().waitFor({state:'visible',timeout:15000});
}
for(const {name,engine,width,height} of variants){
 const browser=await engine.launch({headless:true}),errors=[];
 try{
  for(const oldCount of [0,15]){
   const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push('JS '+oldCount+': '+e.message));
   await page.addInitScript(count=>{
    const posts=Array.from({length:count},(_,i)=>({id:'old-'+i,title:'Antiguo '+i,platform:'Instagram',date:'2026-11-11',status:'Borrador'}));
    localStorage.setItem('markethub-ai-demo-v1',JSON.stringify({plan:'free',posts}));
   },oldCount);
   try{
    await openGrowth(page,width);
    await makePlan(page);
    if(await page.locator('.growth-pulse-day').count()!==7)errors.push('No se muestran siete días en '+oldCount);
    await page.locator('#pulseText0').fill('Campaña editada por el usuario #PULSE');
    await page.locator('[data-growth-action="pulse-save-edits"]').click();
    if(await page.locator('#pulseText0').inputValue()!=='Campaña editada por el usuario #PULSE')
     errors.push('No se conserva el texto editable del plan');
    const csvWait=page.waitForEvent('download',{timeout:10000});
    await page.locator('[data-growth-action="pulse-export-csv"]').click();
    const csv=await csvWait,csvText=await readFile(await csv.path(),'utf8');
    if(!csv.suggestedFilename().endsWith('.csv')||!csvText.includes('Campaña editada por el usuario #PULSE'))
     errors.push('La exportación CSV no incluye los textos editados');
    const icsWait=page.waitForEvent('download',{timeout:10000});
    await page.locator('[data-growth-action="pulse-export-ics"]').click();
    const ics=await icsWait,icsText=await readFile(await ics.path(),'utf8');
    if(!ics.suggestedFilename().endsWith('.ics')||(icsText.match(/BEGIN:VEVENT/g)||[]).length!==7)
     errors.push('No se exportan siete eventos de calendario');
    if(width<=680)await page.screenshot({path:'visual-qa/pulse/'+name+'-'+oldCount+'-responsive.png'});
    // Flujo sin programa externo: propuesta PULSE → editor real de Media Forge.
    await page.locator('[data-growth-action="pulse-to-forge"][data-id="0"]').click();
    await page.locator('[data-forge-input="caption"]').waitFor({state:'visible',timeout:12000});
    const caption=await page.locator('[data-forge-input="caption"]').inputValue();
    if(!caption.includes('Campaña editada'))errors.push('La propuesta no llegó al editor multimedia');
    if(!['9:16','4:5','1:1','16:9'].includes(await page.locator('[data-forge-input="format"]').inputValue()))
     errors.push('Media Forge no preparó un formato válido');
    if(width<=680){
     await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
     await page.locator('.mobile-menu-drawer [data-page="laboratorio"]').click();
    }else await page.locator('.sidebar [data-page="laboratorio"]').click();
    await page.locator('.growth-pulse-day').first().waitFor({state:'visible'});
    await page.locator('[data-growth-action="pulse-to-drafts"]').click();
    await page.waitForTimeout(350);
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('markethub-ai-demo-v1')||'{}').posts||[]);
    const expected=oldCount===15?15:7;
    if(saved.length!==expected)errors.push('Límite FREE ignorado: '+oldCount+' +7 = '+saved.length);
    if(oldCount===0){
     if(saved[0].title.length<15||!saved.some(x=>x.title.includes('Campaña editada'))||
        !saved.every(x=>x.status==='Borrador'))errors.push('El editor no recibe los siete textos del plan');
    }else if(saved.some(x=>x.title.includes('Campaña editada')))
     errors.push('Se ha guardado un lote parcialmente pese al límite FREE');
   }catch(e){errors.push('Escenario '+oldCount+': '+e.message)}
   finally{await context.close()}
  }
 }finally{await browser.close()}
 results.push({browser:name,ok:errors.length===0,errors});
}
console.log(JSON.stringify(results,null,2));
if(results.some(r=>!r.ok))process.exitCode=1;
