import test from 'node:test';
import assert from 'node:assert/strict';
import {platformReachSummary,localRecommendations} from '../src/local-insights.js';
import {liveHome} from '../src/live-ui.js';
const today=new Date(2026,10,5,12,0,0);

test('El resumen atribuye solo el alcance importado a plataformas válidas',()=>{
 const rows=[{plataforma:'Instagram',alcance:900},{plataforma:'TikTok',alcance:100},{plataforma:'TikTok',alcance:-500},
  {plataforma:'<script>',alcance:3000},{plataforma:'Instagram',alcance:'NaN'}];
 const report=platformReachSummary(rows);
 assert.equal(report.total,1000);
 assert.equal(report.platforms[0].platform,'Instagram');
 assert.equal(report.platforms[0].sharePercent,90);
});

test('Las recomendaciones se basan en el calendario y presupuesto reales del usuario',()=>{
 const recommendations=localRecommendations({
  rows:[{plataforma:'Instagram',alcance:400},{plataforma:'TikTok',alcance:600}],
  posts:[{id:1,status:'Borrador',date:'2026-11-04'},{id:2,status:'Borrador',date:'2026-11-06'}],
  campaigns:[{budget:125},{budget:225}]
 },{today});
 assert.ok(recommendations.some(x=>x.id==='reach-leader'&&x.label.includes('TikTok')));
 assert.ok(recommendations.some(x=>x.id==='overdue'));
 assert.ok(recommendations.some(x=>x.id==='due-soon'));
 assert.ok(recommendations.every(x=>['analitica','crear','campanas','diseño'].includes(x.page)));
 assert.ok(recommendations.every(x=>!x.label.includes('ROI')));
});

test('Sin datos de redes, se invita a importar CSV en vez de mostrar porcentajes ficticios',()=>{
 const insights=localRecommendations({rows:[],posts:[],campaigns:[]},{today});
 assert.equal(insights[0].id,'import-stats');
 assert.ok(insights.every(x=>x.kind==='local'));
});

test('La vista escapa de forma segura las recomendaciones con nombres controlados por usuario',()=>{
 const html=liveHome({analyticsRows:[{plataforma:'Instagram',alcance:100}]});
 assert.match(html,/alcance importado/);
 assert.match(html,/data-page="analitica"/);
 assert.ok(!html.includes('ROAS falso'));
});
