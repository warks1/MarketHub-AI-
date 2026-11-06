import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildPulsePlan,validatePulseBrief,pulsePlanCSV,pulsePlanICS} from '../src/pulse-campaign.js';

const brief={id:'b1',name:'Reparaciones de primavera',brand:'Negocio local',audience:'familias',
 offer:'revisión y reparación en domicilio',goal:'Captación de contactos',channel:'Multicanal',
 budget:250,date:'2026-11-28',cta:'Solicita presupuesto'};

test('PULSE prepara siete mensajes diferentes, locales y fechados incluso al cambiar de mes',()=>{
 const plan=buildPulsePlan(brief);
 assert.equal(plan.items.length,7);
 assert.deepEqual(plan.items.map(x=>x.date),['2026-11-28','2026-11-29','2026-11-30','2026-12-01','2026-12-02','2026-12-03','2026-12-04']);
 assert.equal(new Set(plan.items.map(x=>x.platform)).size,5);
 assert.equal(new Set(plan.items.map(x=>x.title)).size,7);
 for(const [i,item] of plan.items.entries()){
  assert.equal(item.day,i+1);
  assert.equal(item.status,'Borrador');
  assert.ok(item.title.length>20&&item.title.length<=240);
  assert.ok(item.check.length>10);
  assert.ok(item.format.length>5);
 }
 assert.equal(plan.name,brief.name);
 assert.equal(plan.sourceId,brief.id);
});
test('PULSE valida fecha real, campos mínimos y plataformas permitidas',()=>{
 assert.throws(()=>validatePulseBrief({...brief,date:'2026-02-29'}),/fecha/);
 assert.throws(()=>validatePulseBrief({...brief,date:'2026-13-10'}),/fecha/);
 assert.throws(()=>validatePulseBrief({...brief,channel:'Red desconocida'}),/canal/);
 assert.throws(()=>validatePulseBrief({...brief,offer:''}),/oferta/);
 assert.throws(()=>validatePulseBrief(null),/brief/);
 assert.equal(buildPulsePlan({...brief,channel:'Email'}).items.every(x=>x.platform==='Email'),true);
});
test('CSV es seguro ante fórmulas de hojas de cálculo y los acentos se conservan',()=>{
 const plan=buildPulsePlan(brief);
 plan.items[0].title='=HYPERLINK("https://ejemplo.es","ver")';
 const csv=pulsePlanCSV(plan);
 assert.ok(csv.startsWith('\uFEFF'));
 assert.ok(csv.includes('"\'=HYPERLINK('));
 assert.ok(csv.includes('Revisión antes de publicar'));
 assert.equal(csv.match(/\r\n/g).length,8);
});
test('Calendario ICS utiliza eventos de día completo sin prometer horarios ni publicación',()=>{
 const plan=buildPulsePlan({...brief,offer:'diseño, reparación; asesoramiento'});
 const ics=pulsePlanICS(plan);
 assert.match(ics,/BEGIN:VCALENDAR\r\n/);
 assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,7);
 assert.match(ics,/DTSTART;VALUE=DATE:20261128/);
 assert.match(ics,/DTSTART;VALUE=DATE:20261204/);
 assert.doesNotMatch(ics,/DTSTART;TZID|DTSTART:\d{8}T/);
 assert.match(ics,/No se publica automáticamente/);
 assert.match(ics,/\\\\,/);
 assert.match(ics,/\\\\;/);
 assert.ok(ics.split('\r\n').every(line=>new TextEncoder().encode(line).length<=75));
});
test('La transferencia de 7 borradores valida todos antes de guardarlos y no crea lotes parciales',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const start=app.indexOf('function addPulseDrafts(items)');
 assert.ok(start>=0);
 const portion=app.slice(start,app.indexOf("document.addEventListener('click'",start));
 assert.match(portion,/state\.posts\.length\+items\.length>limit/);
 assert.match(portion,/items\.map\(x=>validatePost\(x\)\)/);
 assert.match(portion,/const previous=state\.posts/);
 assert.match(portion,/if\(!save\(\)\)\{state\.posts=previous;return false\}/);
 assert.match(portion,/go\('crear'\)/);
});
test('Growth Lab ofrece plan editable, exportaciones y control por red',async()=>{
 const backing=new Map();
 globalThis.localStorage={
  getItem:key=>backing.get(key)??null,
  setItem:(key,value)=>backing.set(key,String(value)),
  removeItem:key=>backing.delete(key)
 };
 globalThis.FormData=class{
  constructor(form){this.data=form.fields}
  get(key){return this.data[key]??null}
 };
 const {growthSubmit,growthPage,growthClick,growthOpenTab}=await import('../src/growth.js');
 const responses=[],context={refresh:()=>{},toast:t=>responses.push(t),newPosts:items=>{responses.push(items);return true}};
 const form={id:'growth-brief',fields:{
  briefName:brief.name,briefGoal:'Visibilidad',briefBrand:brief.brand,briefAudience:brief.audience,
  briefOffer:brief.offer,briefChannel:'Instagram',briefBudget:'100',briefDate:brief.date,briefCta:brief.cta
 }};
 assert.equal(growthSubmit(form,'free',context),true);
 growthOpenTab('campanas');
 const state=JSON.parse(backing.get('markethub-growth-local-v1'));
 assert.equal(state.briefs.length,1);
 assert.match(growthPage('free'),/data-growth-action="pulse-generate"/);
 const button={dataset:{growthAction:'pulse-generate',id:state.briefs[0].id}};
 assert.equal(growthClick(button,context),true);
 const page=growthPage('free');
 assert.match(page,/PULSE CAMPAIGN PILOT/);
 assert.match(page,/data-growth-action="pulse-export-csv"/);
 assert.match(page,/data-growth-action="pulse-export-ics"/);
 assert.match(page,/data-growth-action="pulse-to-drafts"/);
 assert.equal((page.match(/data-pulse-text=/g)||[]).length,7);
 globalThis.document={getElementById:()=>null};
 assert.equal(growthClick({dataset:{growthAction:'pulse-to-drafts'}},context),true);
 const sent=responses.find(Array.isArray);
 assert.equal(sent?.length,7);
 assert.ok(sent.every(x=>x.platform==='Instagram'&&x.status==='Borrador'));
 const persisted=JSON.parse(backing.get('markethub-growth-local-v1'));
 assert.equal(persisted.pulsePlan.items.length,7);
});
