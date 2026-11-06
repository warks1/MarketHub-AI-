// Regressión de límite de borradores por la acción interna de Estudio.
// Usa eventos reales en la SPA, incluso si el botón correspondiente está oculto.
import {chromium,webkit} from 'playwright';
const base=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const results=[];
for(const [engineName,engine,viewport] of [
 ['Chromium escritorio',chromium,{width:1440,height:900}],
 ['Safari WebKit móvil',webkit,{width:390,height:844}]
]){
 const browser=await engine.launch({headless:true});
 try{
  for(const [plan,count,expected] of [
   ['free',20,20],['free',19,20],
   ['pro',500,500],['pro',499,500]
  ]){
   const errors=[],page=await browser.newPage({viewport});
   try{
    page.on('pageerror',err=>errors.push('Error JS '+err.message));
    await page.addInitScript(({plan,count})=>{
     const posts=Array.from({length:count},(_,i)=>({
      id:'test-'+i,title:'Publicación de prueba '+i,
      platform:'Instagram',date:'2026-11-06',status:'Borrador'
     }));
     localStorage.setItem('markethub-ai-demo-v1',JSON.stringify({plan,posts}));
    },{plan,count});
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000});
    await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:20000});
    const actual=await page.evaluate(()=>{
     const input=document.createElement('textarea');
     input.id='creativePrompt';input.value='Texto de prueba para el Estudio';
     const button=document.createElement('button');
     button.type='button';button.dataset.action='draft-from-studio';
     document.body.append(input,button);
     button.click();
     button.remove();input.remove();
     return JSON.parse(localStorage.getItem('markethub-ai-demo-v1')||'{}').posts||[];
    });
    if(actual.length!==expected)errors.push('Se esperaban '+expected+' borradores; hay '+actual.length);
    if(count<expected&&actual[0]?.title!=='Texto de prueba para el Estudio')
     errors.push('La creación permitida no guardó el texto introducido');
    if(count===expected&&actual[0]?.title==='Texto de prueba para el Estudio')
     errors.push('Se permitió sobrepasar el límite');
    // Al llegar al límite, un segundo clic nunca podrá añadir otro borrador.
    if(count<expected){
     const second=await page.evaluate(()=>{
      const input=document.createElement('textarea');input.id='creativePrompt';input.value='Borrador extra';
      const button=document.createElement('button');button.dataset.action='draft-from-studio';
      document.body.append(input,button);button.click();button.remove();input.remove();
      return JSON.parse(localStorage.getItem('markethub-ai-demo-v1')||'{}').posts?.length;
     });
     if(second!==expected)errors.push('Segundo clic supera límite: '+second);
    }
   }catch(error){errors.push('Excepción: '+error.message)}
   finally{await page.close()}
   results.push({engine:engineName,plan,initial:count,expected,ok:errors.length===0,errors});
  }
 }finally{await browser.close()}
}
console.log(JSON.stringify(results,null,2));
if(results.some(row=>!row.ok))process.exitCode=1;
