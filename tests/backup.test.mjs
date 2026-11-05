import test from 'node:test';
import assert from 'node:assert/strict';

let quotaFail=false,allow=false,reloads=0,lastPrompt='';
const map=new Map();
globalThis.localStorage={
 getItem:key=>map.has(key)?map.get(key):null,
 setItem:(key,value)=>{
  if(quotaFail&&key==='markethub-growth-local-v1')throw new Error('QuotaExceededError');
  map.set(key,String(value));
 },
 removeItem:key=>map.delete(key)
};
globalThis.window={confirm:prompt=>{lastPrompt=prompt;return allow},location:{reload:()=>{reloads++}}};
const {readBackup,validateBackup,backupImport,backupModuleKeys}=await import('../src/backup.js');
const toast=[],ctx={toast:message=>toast.push(message)};
const payload=modules=>({format:'markethub-ai-local-backup',version:1,modules,exportedAt:'2026-11-04T20:00:00Z'});
const file=value=>{const json=JSON.stringify(value);return {size:Buffer.byteLength(json),text:async()=>json}};

test('Incluye las cuatro claves locales actuales y no datos de terceros',()=>{
 assert.deepEqual(backupModuleKeys,[
  'markethub-ai-demo-v1','markethub-ai-office-v1','markethub-ai-visual-v1','markethub-growth-local-v1'
 ]);
});
test('Exportación lógica reúne módulos existentes sin borrar datos',()=>{
 map.clear();
 map.set('markethub-ai-demo-v1',JSON.stringify({plan:'free',posts:[{title:'Mi texto'}]}));
 map.set('otra-app-secreta','valor privado');
 const result=readBackup();
 assert.equal(result.version,1);
 assert.equal(result.format,'markethub-ai-local-backup');
 assert.equal(result.modules['markethub-ai-demo-v1'].posts[0].title,'Mi texto');
 assert.equal(result.modules['otra-app-secreta'],undefined);
 assert.equal(map.get('otra-app-secreta'),'valor privado');
});
test('Validación rechaza versión incompatible, módulos desconocidos y estructuras inválidas',()=>{
 assert.throws(()=>validateBackup(payload({'otra-app':{a:1}})),/módulo desconocido/);
 assert.throws(()=>validateBackup({...payload({}),version:9}),/versión incompatible/);
 assert.throws(()=>validateBackup(payload({'markethub-ai-demo-v1':'mal'})),/formato válido/);
 assert.throws(()=>validateBackup(payload({})),/no contiene módulos/);
});
test('Importación cancelada no sobrescribe nada',async()=>{
 allow=false;map.set('markethub-ai-demo-v1',JSON.stringify({plan:'free'}));
 const result=await backupImport(file(payload({'markethub-ai-demo-v1':{plan:'pro'}})),ctx);
 assert.equal(result,false);
 assert.equal(JSON.parse(map.get('markethub-ai-demo-v1')).plan,'free');
 assert.equal(reloads,0);
 assert.match(lastPrompt,/sobrescribirá/);
});
test('Importación autorizada conserva módulos no incluidos y recarga',async()=>{
 allow=true;map.clear();reloads=0;
 map.set('markethub-ai-office-v1',JSON.stringify({tasks:[{title:'Sin perder'}]}));
 const result=await backupImport(file(payload({'markethub-ai-demo-v1':{plan:'free',posts:[{title:'Restaurado'}]}})),ctx);
 assert.equal(result,true);
 assert.equal(JSON.parse(map.get('markethub-ai-demo-v1')).posts[0].title,'Restaurado');
 assert.equal(JSON.parse(map.get('markethub-ai-office-v1')).tasks[0].title,'Sin perder');
 assert.equal(reloads,1);
});
test('Si falla escritura, revierte el estado anterior',async()=>{
 allow=true;map.clear();reloads=0;
 map.set('markethub-ai-demo-v1',JSON.stringify({plan:'free'}));
 quotaFail=true;
 const result=await backupImport(file(payload({
  'markethub-ai-demo-v1':{plan:'pro'},
  'markethub-growth-local-v1':{utms:[{name:'x'}]}
 })),ctx);
 quotaFail=false;
 assert.equal(result,false);
 assert.equal(JSON.parse(map.get('markethub-ai-demo-v1')).plan,'free');
 assert.equal(map.has('markethub-growth-local-v1'),false);
 assert.equal(reloads,0);
});
test('Rechaza archivos superiores a 3 MB',async()=>{
 const result=await backupImport({size:4*1024*1024,text:async()=>''},ctx);
 assert.equal(result,false);
 assert.match(toast.at(-1),/3 MB/);
});
test('Rechaza estructuras potencialmente peligrosas',()=>{
 const suspicious=JSON.parse('{"__proto__": {"admin": true}}');
 assert.throws(()=>validateBackup(payload({'markethub-ai-demo-v1':suspicious})),/Clave no autorizada/);
});

test('La copia conserva fotografías de escenas sin aceptar imágenes SVG ni scripts',()=>{
 const photo='data:image/jpeg;base64,'+'A'.repeat(140000);
 const content={plan:'free',storyboard:[{id:'escena-1',title:'Foto',imageData:photo}]};
 map.clear();
 map.set('markethub-ai-demo-v1',JSON.stringify(content));
 const backup=readBackup();
 assert.equal(backup.modules['markethub-ai-demo-v1'].storyboard[0].imageData,photo);
 const validated=validateBackup(payload({'markethub-ai-demo-v1':content}));
 assert.equal(JSON.parse(validated['markethub-ai-demo-v1']).storyboard[0].imageData,photo);
 const unsafe={plan:'free',storyboard:[{id:'mal',imageData:'data:image/svg+xml;base64,'+'A'.repeat(140000)}]};
 assert.throws(()=>validateBackup(payload({'markethub-ai-demo-v1':unsafe})),/Texto demasiado largo/);
});
