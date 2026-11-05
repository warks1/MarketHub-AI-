// Prueba de restauración real de una copia integral en navegadores de móvil y PC.
import {chromium,webkit} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
await mkdir('visual-qa/full-backup',{recursive:true});
const base=process.env.MARKETHUB_URL||'http://127.0.0.1:5173/';
const results=[];
async function openSettings(page,width){
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000});
 await page.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:20000});
 await page.locator('#skipSplash').click({timeout:3500}).catch(()=>{});
 if(width<700){
  await page.locator('.mobile-bottom [data-action="show-mobile-menu"]').click();
  await page.locator('.mobile-menu-drawer [data-page="ajustes"]').click();
 }else await page.locator('.sidebar [data-page="ajustes"]').click();
 await page.locator('[data-action="unified-backup-export"]').waitFor({state:'visible',timeout:10000});
}
for(const [name,engine,width,height] of [['chromium-desktop',chromium,1440,900],['webkit-iphone',webkit,390,844]]){
 const browser=await engine.launch({headless:true}),errors=[];
 try{
  const orig=await browser.newContext({viewport:{width,height},acceptDownloads:true});
  const page=await orig.newPage();
  page.on('pageerror',e=>errors.push('JS export: '+e.message));
  await openSettings(page,width);
  await page.evaluate(async()=>{
   const projects=await import('./src/creative-projects.js'),assets=await import('./src/media-vault.js'),
    brands=await import('./src/brand-dna.js');
   const bytes=new Uint8Array([137,80,78,71,13,10,26,10,5,7,9,11,20]);
   await projects.saveCreativeProject({name:'Campaña integral',file:new Blob([bytes],{type:'image/png'}),
    settings:{format:'4:5',mask:'orbita',look:'neon',safezone:'on',caption:'Contenido protegido',
      brandActive:true,brandPrimary:'#44AABB',brandAccent:'#DD55FF'}});
   await assets.saveVaultAsset('recurso-foto.png',new Blob([bytes],{type:'image/png'}));
   brands.saveBrandProfile({name:'Marca Integral',primary:'#112233',accent:'#AABBCC',tone:'Elegante',cta:'Compra'});
   localStorage.setItem('markethub-ai-office-v1',JSON.stringify({tasks:[{title:'Tarea respaldada'}]}));
  });
  const downloadPromise=page.waitForEvent('download',{timeout:20000});
  await page.locator('[data-action="unified-backup-export"]').click();
  const download=await downloadPromise,backup=await readFile(await download.path());
  if(!download.suggestedFilename().endsWith('.mhubfull'))errors.push('No se exportó formato .mhubfull');
  if(backup.subarray(0,4).toString('hex')!=='504b0304')errors.push('La copia no comienza con cabecera ZIP');
  // Cifrado íntegro por contraseña en móvil y PC: el archivo no debe incluir
  // marcas ni datos en claro y debe poderse recuperar en otro navegador.
  const encryptedPassword='Prueba de cifrado MarketHub AI 2026+';
  await page.locator('#unifiedBackupPassword').fill(encryptedPassword);
  const encryptedWait=page.waitForEvent('download',{timeout:30000});
  await page.locator('[data-action="unified-backup-encrypted-export"]').click();
  const encryptedDownload=await encryptedWait,encryptedBytes=await readFile(await encryptedDownload.path());
  if(!encryptedDownload.suggestedFilename().endsWith('.mhubsecure')||
      encryptedBytes.subarray(0,8).toString('ascii')!=='MHUBSEC1')
   errors.push('No se descargó una copia cifrada .mhubsecure válida');
  if(encryptedBytes.includes(Buffer.from('Campaña integral'))||
      encryptedBytes.includes(Buffer.from('Tarea respaldada')))
   errors.push('La copia protegida contiene información de usuario visible en claro');

  const fresh=await browser.newContext({viewport:{width,height},acceptDownloads:true});
  const restored=await fresh.newPage();
  restored.on('pageerror',e=>errors.push('JS import: '+e.message));
  await openSettings(restored,width);
  await restored.evaluate(async()=>{
   const p=await import('./src/creative-projects.js'),b=await import('./src/brand-dna.js');
   await p.saveCreativeProject({name:'Proyecto que NO borrar',file:new Blob([new Uint8Array([1,2,3,4])],{type:'image/png'}),settings:{}});
   b.saveBrandProfile({name:'Marca Integral',primary:'#FFEEDD',accent:'#AABBCC',tone:'Cercano',cta:'Anterior'});
   localStorage.setItem('markethub-ai-office-v1',JSON.stringify({tasks:[{title:'Oficina no sobreescrita'}]}));
  });
  restored.on('dialog',d=>d.accept());
  await restored.locator('[data-unified-backup-import]').setInputFiles({
   name:'copia-integral.mhubfull',mimeType:'application/zip',buffer:backup
  });
  // Importación y recarga son asíncronas; consultar IndexedDB desde Node
  // para evitar interpretar una Promise del navegador como un resultado verdadero.
  let restoredProjects=0;
  for(let attempt=0;attempt<75;attempt++){
   try{
    restoredProjects=await restored.evaluate(async()=>{
     const p=await import('./src/creative-projects.js');
     return (await p.listCreativeProjects()).length;
    });
   }catch{}
   if(restoredProjects===2)break;
   await restored.waitForTimeout(300);
  }
  if(restoredProjects!==2)errors.push('La restauración integral no agregó el proyecto esperado: '+restoredProjects);
  // La app recarga al terminar la recuperación; dejar que vuelva a inicializarse.
  await restored.waitForTimeout(550);
  await restored.waitForFunction(()=>window.__MARKETHUB_BOOT__?.ready===true,null,{timeout:20000});
  const check=await restored.evaluate(async()=>{
   const p=await import('./src/creative-projects.js'),v=await import('./src/media-vault.js'),
    b=await import('./src/brand-dna.js');
   const projects=await p.listCreativeProjects(),vault=await v.listVaultAssets(),brands=b.readBrandProfiles();
   const original=projects.find(p=>p.name==='Campaña integral');
   const opened=original?await p.openCreativeProject(original.id):null;
   const media=vault.length?await v.getVaultAsset(vault[0].id):null;
   return {names:projects.map(x=>x.name),vault:vault.length,brand:brands.find(x=>x.id==='marca-integral')?.primary,
    office:JSON.parse(localStorage.getItem('markethub-ai-office-v1')||'{}').tasks?.[0]?.title,
    imageType:opened?.file.type,mask:opened?.settings.mask,
    originalBytes:opened?Array.from(new Uint8Array(await opened.file.arrayBuffer())):[],
    mediaBytes:media?Array.from(new Uint8Array(await media.blob.arrayBuffer())):[]};
  });
  if(check.names.length!==2||!check.names.includes('Proyecto que NO borrar')||
      !check.names.includes('Campaña integral'))errors.push('Se perdieron proyectos anteriores');
  if(check.vault!==1||check.mediaBytes.length!==13||check.originalBytes.length!==13)
   errors.push('No se restauró la biblioteca multimedia o la foto original');
  if(check.brand!=='#FFEEDD')errors.push('El ADN de marca ya existente fue sobrescrito');
  if(check.office!=='Oficina no sobreescrita')errors.push('Los datos previos de Oficina fueron sobrescritos');
  if(check.mask!=='orbita'||check.imageType!=='image/png')errors.push('Se perdieron los ajustes editables');

  // Después de restaurar la app recarga la vista principal. Volver a
  // Configuración antes de probar la importación de una copia manipulada.
  await openSettings(restored,width);
  // Una copia con bytes alterados debe rechazarse, sin añadir nuevos archivos.
  const damaged=Buffer.from(backup),position=damaged.indexOf(Buffer.from([137,80,78,71,13,10,26,10,5,7,9,11,20]));
  if(position<0)errors.push('No se encontró la imagen en el ZIP para prueba de integridad');
  else{
   damaged[position+6]^=1;
   await restored.locator('[data-unified-backup-import]').setInputFiles({
    name:'copia-danada.mhubfull',mimeType:'application/zip',buffer:damaged
   });
   await restored.locator('.toast').filter({hasText:'No se pudo restaurar la copia'}).waitFor({state:'visible',timeout:15000});
   const numbers=await restored.evaluate(async()=>{
    const p=await import('./src/creative-projects.js'),v=await import('./src/media-vault.js');
    return [(await p.listCreativeProjects()).length,(await v.listVaultAssets()).length];
   });
   if(numbers[0]!==2||numbers[1]!==1)errors.push('ZIP dañado modificó archivos del usuario');
  }
  await restored.screenshot({path:'visual-qa/full-backup/'+name+'-configuracion.png',fullPage:true});
  const cryptoContext=await browser.newContext({viewport:{width,height},acceptDownloads:true});
  const cryptoPage=await cryptoContext.newPage();
  cryptoPage.on('pageerror',e=>errors.push('JS descifrado: '+e.message));
  await openSettings(cryptoPage,width);
  cryptoPage.on('dialog',dialog=>dialog.accept());
  await cryptoPage.locator('#unifiedBackupPassword').fill(encryptedPassword);
  await cryptoPage.locator('[data-unified-backup-import]').setInputFiles({
   name:'copia-segura.mhubsecure',mimeType:'application/octet-stream',buffer:encryptedBytes
  });
  let encryptedRestored=0;
  for(let attempt=0;attempt<65;attempt++){
   try{
    encryptedRestored=await cryptoPage.evaluate(async()=>{
     const {listCreativeProjects}=await import('./src/creative-projects.js');
     return (await listCreativeProjects()).length;
    });
   }catch{}
   if(encryptedRestored===1)break;
   await cryptoPage.waitForTimeout(300);
  }
  if(encryptedRestored!==1)errors.push('No se pudo restaurar el archivo integral cifrado');
  await openSettings(cryptoPage,width);
  // Alteración autenticada: no debe restaurar un solo dato de un archivo corrupto.
  const tamperedEncrypted=Buffer.from(encryptedBytes);
  tamperedEncrypted[52+Math.min(12,tamperedEncrypted.length-53)]^=1;
  await cryptoPage.locator('#unifiedBackupPassword').fill(encryptedPassword);
  await cryptoPage.locator('[data-unified-backup-import]').setInputFiles({
   name:'copia-protegida-alterada.mhubsecure',mimeType:'application/octet-stream',buffer:tamperedEncrypted
  });
  await cryptoPage.locator('.toast').filter({hasText:'No se pudo restaurar la copia'}).waitFor({state:'visible',timeout:18000});
  const afterTamper=await cryptoPage.evaluate(async()=>{
   const {listCreativeProjects}=await import('./src/creative-projects.js');
   return (await listCreativeProjects()).length;
  });
  if(afterTamper!==1)errors.push('Un respaldo cifrado manipulado cambió los proyectos existentes');
  await cryptoContext.close();
  await orig.close();await fresh.close();
 }catch(e){errors.push('Excepción E2E: '+e.message)}
 finally{await browser.close()}
 results.push({engine:name,passed:errors.length===0,errors});
}
console.log(JSON.stringify(results,null,2));
if(results.some(x=>!x.passed))process.exitCode=1;
