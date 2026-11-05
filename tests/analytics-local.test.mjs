import test from 'node:test';
import assert from 'node:assert/strict';
import {analyticsCsvTemplate,parseAnalyticsCSV,summarizeAnalytics,analyticsLocalHTML} from '../src/analytics-local.js';

const csv='fecha;plataforma;alcance;impresiones;interacciones;clics\r\n'+
 '2026-11-01;Instagram;1000;2000;50;20\r\n'+
 '2026-11-02;TikTok;500;750;25;10\r\n';

test('La plantilla incluye las seis columnas necesarias y se genera localmente',()=>{
 assert.ok(analyticsCsvTemplate.startsWith('\uFEFF'));
 for(const key of ['fecha','plataforma','alcance','impresiones','interacciones','clics'])
  assert.ok(analyticsCsvTemplate.includes(key));
});

test('El importador acepta ; y , como separadores con datos numéricos',()=>{
 const rows=parseAnalyticsCSV(csv);
 assert.equal(rows.length,2);
 assert.equal(rows[0].alcance,1000);
 assert.equal(rows[1].plataforma,'TikTok');
 const comma='fecha,plataforma,alcance,impresiones,interacciones,clics\n2026-10-01,YouTube,20,30,10,4\n';
 assert.equal(parseAnalyticsCSV(comma)[0].clics,4);
});

test('Se rechazan fechas, plataformas, números y tamaños inválidos',()=>{
 for(const bad of [
  csv.replace('2026-11-01','2026-02-30'),
  csv.replace('Instagram','No autorizada'),
  csv.replace(';1000;',';-5;'),
  csv.replace(';2000;',';Infinity;')
 ]) assert.throws(()=>parseAnalyticsCSV(bad));
 assert.throws(()=>parseAnalyticsCSV('x'.repeat(1500001)));
 assert.throws(()=>parseAnalyticsCSV(analyticsCsvTemplate));
});

test('Los totales se calculan exclusivamente a partir de filas importadas',()=>{
 const s=summarizeAnalytics(parseAnalyticsCSV(csv));
 assert.equal(s.alcance,1500);assert.equal(s.impresiones,2750);
 assert.equal(s.interacciones,75);assert.equal(s.clics,30);
 assert.equal(s.registros,2);assert.equal(s.periodo.length,2);
 assert.equal(s.tasaInteraccion,5);
});

test('La vista real aparece separada de los KPI ilustrativos y con etiquetas honestas',()=>{
 const h=analyticsLocalHTML(parseAnalyticsCSV(csv));
 assert.match(h,/Analítica con datos propios/);
 assert.match(h,/<strong>(?:1\.500|1500)<\/strong>/);
 assert.match(h,/Instagram/);
 assert.match(h,/TikTok/);
 assert.match(h,/datos a ningún servidor/);
 assert.match(h,/KPI de demostración/);
});
