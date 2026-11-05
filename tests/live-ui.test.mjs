import test from 'node:test';
import assert from 'node:assert/strict';
import {liveHome,liveInbox,liveListening} from '../src/live-ui.js';
import {liveStudio,createScene,parseScene} from '../src/live-studio.js';
const posts=[{id:'1',title:'Mi lanzamiento',platform:'Instagram',date:'2026-11-22',status:'Borrador'}];
const campaigns=[{id:'2',name:'Primera campaña',objective:'Alcance',channel:'TikTok',budget:150,status:'Borrador'}];
const metrics=[{fecha:'2026-11-01',plataforma:'Instagram',alcance:1000,impresiones:2000,interacciones:50,clics:20}];

test('Panel real muestra cifras importadas y no inventa ROI ni leads',()=>{
 const html=liveHome({posts,campaigns,analyticsRows:metrics,plan:'free'});
 for(const label of ['Alcance','Interacciones','Leads','Publicaciones','ROI','Campañas',
 'Rendimiento por plataforma','Calendario de contenidos','Asistente de marketing',
 'Social Listening','Bandeja unificada','Plataformas'])assert.ok(html.includes(label),label);
 assert.ok(html.includes('1000')||html.includes('1.000'));
 assert.ok(html.includes('Mi lanzamiento'));
 assert.ok(html.includes('Primera campaña'));
 assert.ok(html.includes('Sin cuenta conectada'));
 assert.match(html,/data-action="calendar-day"/);
 assert.match(html,/data-action="calendar-next"/);
});

test('En ausencia de datos no aparece una falsa curva de rendimiento',()=>{
 const html=liveHome({posts:[],campaigns:[],analyticsRows:[]});
 assert.match(html,/Sin datos de redes/);
 assert.match(html,/Importa un CSV/);
 assert.match(html,/data-page="analitica"/);
 assert.ok(!html.includes('2.84 M'));
});

test('Los textos del usuario quedan escapados en todos los módulos',()=>{
 const hostile='<img src=x onerror=alert(1)>';
 for(const html of [
  liveHome({posts:[{id:1,title:hostile,date:'2026-11-22',platform:'Instagram',status:'Borrador'}],campaigns:[]}),
  liveInbox({messages:[{id:1,contact:hostile,network:'Otro',body:hostile}]}),
  liveListening({mentions:[{id:1,text:hostile,source:'Blog',sentiment:'Neutra'}]}),
  liveStudio({scenes:[{id:'s',title:hostile,caption:hostile,theme:'Neón',duration:5}]})
 ]){
  assert.ok(!html.includes(hostile));
  assert.ok(html.includes('&lt;img'));
 }
});

test('Estudio creativo permite editar título, duración, orden y proyecto local',()=>{
 const frames=[{id:'s',title:'Escena inicial',caption:'Ejemplo',duration:8,theme:'Neón'}];
 const html=liveStudio({scenes:frames,current:0,format:'9:16'});
 for(const k of ['id="storyboardForm"','data-action="storyboard-add"','data-action="storyboard-remove"',
 'data-action="storyboard-export"','data-action="storyboard-duplicate"',
 'data-action="storyboard-move-right"','data-action="storyboard-select"'])
  assert.ok(html.includes(k),k);
 assert.match(html,/Escena inicial/);
 assert.match(html,/8 segundos/);
 assert.ok(!html.includes('boceto-02-estudio-original.jpeg'));
});

test('Validación de escenas no admite valores peligrosos ni duraciones inválidas',()=>{
 const scene=createScene('Prueba');
 assert.ok(scene.id);
 assert.equal(parseScene({...scene,title:' Nuevo título ',duration:'6',theme:'Neón'}).value.title,'Nuevo título');
 assert.ok(parseScene({...scene,title:''}).error);
 assert.ok(parseScene({...scene,duration:0}).error);
 assert.ok(parseScene({...scene,duration:90}).error);
 assert.ok(parseScene({...scene,theme:'Script'}).error);
});

test('La app móvil puede mostrar todas las acciones sin ocultar módulos',()=>{
 const html=liveHome({posts,campaigns,analyticsRows:metrics});
 for(const id of ['crear','diseño','analitica','bandeja','campanas','escucha','herramientas','ajustes'])
  assert.ok(html.includes('data-page="'+id+'"'),'No hay enlace para '+id);
 const inbox=liveInbox(),listen=liveListening();
 assert.match(inbox,/id="liveMessageForm"/);
 assert.match(listen,/id="liveMentionForm"/);
});
