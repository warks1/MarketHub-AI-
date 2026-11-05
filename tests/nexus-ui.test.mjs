import test from 'node:test';
import assert from 'node:assert/strict';
import {nexusHome,nexusStudio} from '../src/nexus-ui.js';

test('El panel de inicio mantiene los bloques del boceto 01 con datos identificados como demo',()=>{
 const html=nexusHome({posts:[{id:1,title:'Campaña de prueba',date:'2026-11-20',platform:'Instagram',status:'Borrador'}],chart:'<svg role="img"></svg>',plan:'free'});
 for(const text of ['Alcance','Interacciones','Leads','Conversiones','ROI','Crecimiento',
  'Rendimiento por plataforma','Calendario de contenidos','Asistente IA',
  'Próximos contenidos','Rendimiento de campañas','Social Listening',
  'Bandeja unificada','Plataformas conectadas'])
  assert.ok(html.includes(text),'Falta bloque '+text);
 assert.match(html,/Sin conectar/);
 assert.match(html,/Datos demo|DATOS DEMO|Ejemplo|EJEMPLO/);
 assert.match(html,/Campaña de prueba/);
});

test('El modo PRO de la vista no añade módulos publicitarios FREE',()=>{
 const free=nexusHome({plan:'free'}),pro=nexusHome({plan:'pro'});
 assert.match(free,/Plan FREE/);
 assert.match(pro,/Plan PRO/);
 assert.match(pro,/sin anuncios/);
});

test('El panel escapa el contenido de las publicaciones para evitar inyección HTML',()=>{
 const html=nexusHome({posts:[{id:1,title:'<img src=x onerror=alert(1)>',date:'2026-11-20',status:'Borrador',platform:'Instagram'}]});
 assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
 assert.ok(html.includes('&lt;img'));
});

test('El estudio creativo conserva las herramientas y la línea de tiempo del boceto 02',()=>{
 const html=nexusStudio({mode:'Video / Reels',format:'9:16',posts:[]});
 for(const item of ['Estudio creativo','Video / Reels','Herramientas de edición','Recortar',
  'Subtítulos IA','IA Creativa','Recomendaciones IA','Línea de tiempo',
  'Plantillas destacadas','Plataformas destino'])
  assert.ok(html.includes(item),'Falta elemento '+item);
 assert.match(html,/src\/app|nexus-product-art|serumBg/);
 assert.match(html,/Guardar borrador local/);
 assert.match(html,/Sin conectar/);
});

test('El estudio soporta 16:9 y opciones de modo sin perder controles',()=>{
 const html=nexusStudio({mode:'Imagen',format:'16:9',posts:[{id:1,title:'Idea'}]});
 assert.match(html,/Cambiar a 9:16/);
 assert.match(html,/aria|data-mode="Imagen"/);
 assert.match(html,/>1<\/strong>/);
});
