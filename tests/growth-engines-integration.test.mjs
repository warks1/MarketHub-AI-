import test from 'node:test';
import assert from 'node:assert/strict';
const local=new Map();
globalThis.localStorage={
 getItem:k=>local.get(k)||null,
 setItem:(k,v)=>local.set(k,String(v)),
 removeItem:k=>local.delete(k)
};
globalThis.FormData=class FakeFormData{
 constructor(form){this.values=form.values}
 get(k){return this.values[k]??null}
};
const {growthPage,growthOpenTab,growthSubmit}=await import('../src/growth.js');
const messages=[],ctx={toast:t=>messages.push(t),refresh:()=>messages.push('refresh')};
const submit=(id,values,plan='free')=>growthSubmit({id,values},plan,ctx);
const state=()=>JSON.parse(local.get('markethub-growth-local-v1')||'{}');
test('Motores accesibles en FREE y PRO sin ocultar las pestañas antiguas',()=>{
 growthOpenTab('motores');
 for(const plan of ['free','pro']){
  const html=growthPage(plan);
  assert.match(html,/Motor multivariantes/);
  assert.match(html,/growth-engine-forecast/);
  assert.match(html,/growth-engine-ab/);
  assert.match(html,/engine-fields/);
 }
 for(const tab of ['campanas','utm','seo','emails','reutilizar','bio'])assert.ok(growthPage('free').includes('tab-'+tab));
});
test('Auditor local guarda hallazgos y los escapa en el HTML',()=>{
 submit('growth-engine-creative',{engineCreativeText:'Descubre nuestros servicios para empresas. Reserva una llamada. #empresa',engineCreativeKeyword:'servicios',engineCreativeChannel:'LinkedIn'});
 assert.equal(state().engines.creative.report.score,100);
 assert.match(growthPage('free'),/Palabra clave presente/);
});
test('Variantes FREE y PRO respetan cantidad sin borrar variantes de la otra opción',()=>{
 submit('growth-engine-copies',{engineIdea:'Plan editorial',engineAudience:'emprendedores',engineBrand:'ABC',engineOffer:'Contenido claro',engineCta:'Pide información',engineChannel:'Instagram'},'free');
 assert.equal(state().engines.copies.variants.length,2);
 submit('growth-engine-copies',{engineIdea:'Plan editorial',engineAudience:'emprendedores',engineBrand:'ABC',engineOffer:'Contenido claro',engineCta:'Pide información',engineChannel:'Instagram'},'pro');
 assert.equal(state().engines.copies.variants.length,5);
 assert.match(growthPage('pro'),/Descargar TXT/);
});
test('Simulador calcula escenario base y guardado forma parte de respaldo existente',()=>{
 submit('growth-engine-forecast',{engineBudget:'1000',engineCpm:'10',engineCtr:'2',engineConversion:'5',engineTicket:'100',engineMargin:'40'});
 assert.equal(state().engines.forecast.report.scenarios[1].revenue,10000);
 assert.ok(local.has('markethub-growth-local-v1'));
 assert.match(growthPage('free'),/Conservador/);
});
test('A/B rechaza conversiones mayores que visitas conservando estado',()=>{
 submit('growth-engine-ab',{engineVisitsA:'1000',engineConvertsA:'100',engineVisitsB:'1000',engineConvertsB:'200'});
 assert.equal(state().engines.ab.report.winner,'B');
 submit('growth-engine-ab',{engineVisitsA:'100',engineConvertsA:'101',engineVisitsB:'100',engineConvertsB:'1'});
 assert.equal(state().engines.ab.report.winner,'B');
 assert.match(messages.at(-1),/Comprueba los campos/);
});
