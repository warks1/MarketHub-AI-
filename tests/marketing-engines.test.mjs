import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeCreative,generateCopyVariants,forecastScenarios,compareAB} from '../src/marketing-engines.js';
test('El auditor da diagnóstico reproducible y reduce puntuación sin CTA',()=>{
 const good=analyzeCreative('Descubre una opción útil para tu negocio. Reserva información aquí. #novedades',{keyword:'negocio'});
 const weak=analyzeCreative('Hola',{keyword:'negocio'});
 assert.equal(good.score,100);assert.ok(weak.score<good.score);
 assert.equal(good.checks.length,7);assert.equal(good.hashtags,1);
});
test('Variantes se generan sin APIs ni promesas inventadas',()=>{
 const v=generateCopyVariants({idea:'Servicio de formación',audience:'equipos',offer:'Taller a medida',cta:'Consulta precios',brand:'Marca'},4);
 assert.equal(v.length,4);assert.equal(new Set(v.map(x=>x.text)).size,4);
 assert.ok(v.every(x=>x.text.includes('Servicio de formación')||x.text.includes('Taller a medida')));
 assert.throws(()=>generateCopyVariants({idea:'',audience:'equipos'}),RangeError);
});
test('El embudo calcula impresiones, clics, conversión y rentabilidad con unidades',()=>{
 const r=forecastScenarios({budget:1000,cpm:10,ctr:2,conversionRate:5,ticket:100,margin:40});
 assert.equal(r.scenarios[1].impressions,100000);
 assert.equal(r.scenarios[1].clicks,2000);
 assert.equal(r.scenarios[1].conversions,100);
 assert.equal(r.scenarios[1].revenue,10000);
 assert.equal(r.scenarios[1].netContribution,3000);
 assert.equal(r.breakEvenConversions,25);
 assert.ok(r.scenarios[0].conversions<r.scenarios[2].conversions);
 assert.throws(()=>forecastScenarios({budget:100,cpm:0}),RangeError);
});
test('A/B no declara victoria sin muestra suficiente y respeta rangos',()=>{
 const tiny=compareAB({visitsA:2,convertsA:0,visitsB:2,convertsB:2});
 assert.equal(tiny.significant,false);
 const equal=compareAB({visitsA:1000,convertsA:100,visitsB:1000,convertsB:100});
 assert.equal(equal.winner,'No concluyente');assert.equal(equal.pValue,1);
 const winning=compareAB({visitsA:1000,convertsA:100,visitsB:1000,convertsB:200});
 assert.equal(winning.winner,'B');assert.ok(winning.pValue<0.05);
 assert.throws(()=>compareAB({visitsA:100,convertsA:101,visitsB:100,convertsB:1}),RangeError);
});
