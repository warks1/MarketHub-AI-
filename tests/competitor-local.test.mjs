import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPETITOR_NETWORKS,competitorLimit,validateCompetitor,competitorProxy,
 competitorsSummary,competitorsHTML,findCompetitor,competitorsToCSV} from '../src/competitor-local.js';

const base={name:'Agencia de referencia',network:'Instagram',followers:'12000',averageInteractions:'350'};
test('Registros manuales: límites FREE/PRO y cifras enteras verificables por usuario',()=>{
 assert.equal(competitorLimit('free'),3);assert.equal(competitorLimit('pro'),30);
 assert.ok(COMPETITOR_NETWORKS.includes('TikTok'));
 assert.deepEqual(validateCompetitor(base).value,{...base,followers:12000,averageInteractions:350});
 for(const change of [{name:' '},{network:'Red inexistente'},{followers:'-5'},
  {followers:'1.5'},{followers:'Infinity'},{averageInteractions:'NaN'}])
  assert.ok(validateCompetitor({...base,...change}).error);
});
test('Ratio orientativo compara datos manuales sin atribuirse alcance verdadero',()=>{
 assert.equal(competitorProxy({followers:10000,averageInteractions:500}),5);
 assert.equal(competitorProxy({followers:0,averageInteractions:500}),null);
 const sample=[{...base,id:'1',followers:12000,averageInteractions:350},
 {id:'2',followers:8000,averageInteractions:160}];
 const stats=competitorsSummary(sample);
 assert.equal(stats.total,2);assert.equal(stats.averageFollowers,10000);
 assert.equal(findCompetitor(sample,'2').followers,8000);
 assert.equal(stats.averageEngagementProxy,2.46);
});
test('Los formularios y listados escapan nombres, mantienen rutas y son honestos',()=>{
 const value={id:1,...base,name:'<svg onload=alert(1)>'};
 const html=competitorsHTML({items:[value],editingId:1,plan:'free'});
 assert.match(html,/id="competitorForm"/);
 assert.match(html,/data-action="competitor-edit"/);
 assert.match(html,/data-action="competitor-delete"/);
 assert.match(html,/data-action="competitor-export"/);
 assert.match(html,/sin verificar|no verifica/i);
 assert.ok(html.includes('&lt;svg'));
 assert.ok(!html.includes('<svg onload=alert(1)>'));
});
test('CSV neutraliza fórmulas y conserva UTF-8 para nombres con tildes',()=>{
 const csv=competitorsToCSV([{id:1,...base,name:'=IMPORTRANGE("privado")',createdAt:'2026-11-05'}]);
 assert.ok(csv.startsWith('\uFEFF'));
 assert.match(csv,/"'=IMPORTRANGE/);
 assert.match(csv,/Instagram/);
 assert.ok(csv.includes('\r\n'));
});
