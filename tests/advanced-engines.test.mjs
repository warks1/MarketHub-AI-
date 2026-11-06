import test from 'node:test';
import assert from 'node:assert/strict';
import {planABSample,allocateBudget,reviewImportedMetrics} from '../src/advanced-engines.js';
test('La muestra A/B aumenta con más confianza o menor efecto',()=>{
 const base=planABSample({baselinePct:5,liftPct:20,trafficDaily:1000});
 const hard=planABSample({baselinePct:5,liftPct:10,trafficDaily:1000,confidence:99,power:90});
 assert.ok(base.samplePerGroup>1000);assert.ok(hard.samplePerGroup>base.samplePerGroup);
 assert.equal(base.totalSample,base.samplePerGroup*2);
 assert.equal(base.days,Math.ceil(base.totalSample/1000));
 assert.throws(()=>planABSample({baselinePct:80,liftPct:100,trafficDaily:1000}),RangeError);
 assert.throws(()=>planABSample({baselinePct:5,liftPct:20,trafficDaily:0}),RangeError);
});
test('El reparto no excede límites y conserva todo el presupuesto',()=>{
 const rows=[
  {name:'Instagram',cpm:10,ctr:2,conversionRate:5},
  {name:'TikTok',cpm:10,ctr:1,conversionRate:4},
  {name:'Google Ads',cpm:20,ctr:1,conversionRate:1}
 ];
 const r=allocateBudget({budget:1000,maxShare:60,channels:rows});
 assert.ok(Math.abs(r.totalAlloc-1000)<1e-6);
 assert.ok(r.channels.every(c=>c.share<=60.00001));
 assert.equal(r.channels[0].allocation,600);
 assert.equal(r.channels[1].allocation,400);
 assert.equal(r.channels[2].allocation,0);
 assert.equal(r.totalExpectedConversions,76);
 assert.throws(()=>allocateBudget({budget:1000,maxShare:60,channels:[rows[0]]}),RangeError);
});
test('El reparto sin conversiones modeladas distribuye sin inventar ganadores',()=>{
 const r=allocateBudget({budget:300,maxShare:60,channels:['a','b','c'].map(name=>({name,cpm:10,ctr:0,conversionRate:0}))});
 assert.equal(r.noSignal,true);
 assert.ok(r.channels.every(x=>Math.abs(x.allocation-100)<1e-6));
});
test('Analítica calcula CTR solo a partir del CSV validado y distingue falta de datos',()=>{
 const empty=reviewImportedMetrics([]);
 assert.equal(empty.available,false);
 const r=reviewImportedMetrics([
  {fecha:'2026-11-01',plataforma:'Instagram',alcance:100,impresiones:200,interacciones:30,clics:12},
  {fecha:'2026-11-02',plataforma:'TikTok',alcance:100,impresiones:200,interacciones:50,clics:8},
  {fecha:'insegura',plataforma:'X',alcance:100,impresiones:100,interacciones:20,clics:90}
 ]);
 assert.equal(r.available,true);assert.equal(r.records,2);assert.equal(r.days,2);
 assert.equal(r.leader.name,'Instagram');assert.equal(r.channels[0].ctr,6);
 assert.ok(r.notes.some(n=>n.includes('no se calcula ROI')));
});
