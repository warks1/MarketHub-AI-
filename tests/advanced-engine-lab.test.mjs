import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backing=new Map();
globalThis.localStorage={getItem:k=>backing.get(k)||null,setItem:(k,v)=>backing.set(k,String(v)),removeItem:k=>backing.delete(k)};
globalThis.FormData=class FakeFormData{constructor(form){this.values=form.values}get(k){return this.values[k]??null}};
const {growthPage,growthOpenTab,growthSubmit}=await import('../src/growth.js');
const messages=[],ctx={toast:s=>messages.push(s),refresh:()=>messages.push('refresh')};
const saved=()=>JSON.parse(backing.get('markethub-growth-local-v1')||'{}');
const submit=(id,values)=>growthSubmit({id,values},'free',ctx);
const sample={advBaseline:'5',advLift:'20',advDaily:'500',advConfidence:'95',advPower:'80'};
const allocation={
 advBudget:'1500',advMaxShare:'60',
 advName0:'Instagram',advCpm0:'10',advCtr0:'2',advCvr0:'5',
 advName1:'TikTok',advCpm1:'8',advCtr1:'1',advCvr1:'4',
 advName2:'Google Ads',advCpm2:'20',advCtr2:'3',advCvr2:'3'
};
const csv=[{fecha:'2026-11-05',plataforma:'TikTok',impresiones:1000,alcance:500,interacciones:100,clics:40}];
test('Las tres herramientas muestran formularios en modo FREE/PRO y se respeta el diseño anterior',()=>{
 growthOpenTab('motores');
 for(const plan of ['free','pro']){
  const html=growthPage(plan,csv);
  for(const id of ['growth-engine-adv-sample','growth-engine-adv-allocate','engine-adv-export-analytics'])
   assert.ok(html.includes(id),id);
  for(const id of ['growth-engine-creative','growth-engine-copies','growth-engine-forecast','growth-engine-ab'])
   assert.ok(html.includes(id),id);
  assert.match(html,/TikTok/);assert.match(html,/4\s?%/);
 }
});
test('El calculador A/B se almacena en el respaldo existente, sin alterar otros motores',()=>{
 submit('growth-engine-adv-sample',sample);
 assert.ok(saved().engines.advanced.sample.report.samplePerGroup>5000);
 assert.ok(saved().engines.advanced.sample.report.days>0);
 assert.match(growthPage('free'),/Visitas aproximadas por variante/);
});
test('El repartidor conserva presupuesto y evita configuraciones inválidas',()=>{
 submit('growth-engine-adv-allocate',allocation);
 const report=saved().engines.advanced.allocation.report;
 assert.equal(report.totalAlloc,1500);
 assert.equal(report.channels.length,3);
 assert.ok(report.channels.every(x=>x.share<=60));
 const original=report.totalAlloc;
 submit('growth-engine-adv-allocate',{...allocation,advCpm1:'0'});
 assert.equal(saved().engines.advanced.allocation.report.totalAlloc,original);
 assert.match(messages.at(-1),/Corrige los valores/);
});
test('El diagnóstico no inventa datos y muestra aviso sin CSV',()=>{
 growthOpenTab('motores');
 const blank=growthPage('free',[]);
 assert.match(blank,/Todavía no hay métricas importadas/);
 assert.doesNotMatch(blank,/CTR observado más alto/);
 const html=growthPage('free',csv);
 assert.match(html,/CTR observado más alto/);
 assert.match(html,/sin inventar ingresos/i);
});
test('Un nombre malicioso de canal se escapa al mostrarlo',()=>{
 submit('growth-engine-adv-allocate',{...allocation,advName0:'<img src=x onerror=alert(1)>'});
 const html=growthPage('free');
 assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
 assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
});
test('Las rutas del código pasan las métricas existentes, sin repetir imports ni duplicar almacenamiento',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/growthPage\(state\.plan,state\.analyticsRows\)/);
 assert.match(app,/analyticsRows:state\.analyticsRows/);
});
