import test from 'node:test';
import assert from 'node:assert/strict';
import {campaignLimit,campaignNetworks,campaignGoals,campaignById,validateCampaign,campaignSummary,campaignsToCSV,campaignManagerHTML} from '../src/campaign-manager.js';
const sample={name:'Mi lanzamiento',objective:'Alcance',channel:'Instagram',start:'2026-11-10',end:'2026-12-10',budget:'350.75',status:'Borrador'};

test('Las campañas locales diferencian cuotas FREE y PRO demo',()=>{
 assert.equal(campaignLimit('free'),10);
 assert.equal(campaignLimit('pro'),150);
 assert.ok(campaignNetworks.includes('Instagram')&&campaignNetworks.includes('TikTok'));
 assert.ok(campaignGoals.includes('Leads'));
});
test('Campañas: valida nombre, fechas, objetivos, plataforma y presupuesto',()=>{
 const ok=validateCampaign(sample);
 assert.deepEqual(ok.value,{...sample,budget:350.75});
 assert.ok(validateCampaign({...sample,name:' '}).error);
 assert.ok(validateCampaign({...sample,objective:'Inventado'}).error);
 assert.ok(validateCampaign({...sample,channel:'Inseguro'}).error);
 assert.ok(validateCampaign({...sample,start:'2026-02-30'}).error);
 assert.ok(validateCampaign({...sample,end:'2026-10-01'}).error);
 assert.ok(validateCampaign({...sample,budget:-1}).error);
 assert.ok(validateCampaign({...sample,budget:'Infinity'}).error);
 assert.ok(validateCampaign({...sample,budget:1000001}).error);
 assert.ok(validateCampaign({...sample,status:'Publicado'}).error);
});
test('Campañas: totaliza presupuestos previstos sin inventar gasto ni ROI',()=>{
 const data=[{id:1,budget:20,status:'Borrador'},{id:2,budget:30.50,status:'Planificada'},null,'texto'];
 assert.equal(campaignById(data,'2').budget,30.50);
 assert.equal(campaignById(data,'no'),null);
 assert.deepEqual(campaignSummary(data),{count:2,plannedBudget:50.5,planned:1});
});
test('Campañas: renderiza el formulario y escapa texto HTML',()=>{
 const html=campaignManagerHTML({campaigns:[{...sample,id:1,name:'<img src=x onerror=alert(1)>'}],editingId:1,plan:'free'});
 assert.match(html,/id="campaignForm"/);
 assert.match(html,/Editar campaña/);
 assert.match(html,/campaign-duplicate/);
 assert.match(html,/campaign-delete/);
 assert.match(html,/campaign-export/);
 assert.match(html,/50|350/);
 assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
 assert.match(html,/&lt;img/);
 assert.match(html,/sin activar publicidad ni realizar cargos/);
});
test('Campañas: CSV neutraliza fórmulas y conserva UTF-8',()=>{
 const csv=campaignsToCSV([{...sample,name:'=HYPERLINK("evil")'}]);
 assert.ok(csv.startsWith('\uFEFF'));
 assert.match(csv,/"'=HYPERLINK/);
 assert.ok(csv.includes('\r\n'));
});
