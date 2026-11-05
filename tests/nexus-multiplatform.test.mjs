import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {nexusHome,nexusStudio} from '../src/nexus-ui.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('Boceto 01: panel incluye todos los componentes elegidos, con datos demo identificados',()=>{
 const page=nexusHome({posts:[{id:1,title:'Prueba',date:'2026-11-15',platform:'TikTok',status:'Borrador'}],chart:'<div class="chart-box">Gráfico demo</div>',plan:'free'});
 for(const text of ['Rendimiento por plataforma','Calendario de contenidos','Asistente IA','Próximos contenidos','Rendimiento de campañas','Social Listening','Bandeja unificada','Plataformas conectadas'])
  assert.ok(page.includes(text),'Componente ausente: '+text);
 assert.match(page,/Gráfico demo/);
 assert.match(page,/Prueba/);
 assert.match(page,/Sin conectar/);
 assert.match(page,/Plan FREE/);
 assert.match(page,/DATOS DEMO/);
});
test('Boceto 02: estudio conserva editor visual, timeline y acceso a herramienta PNG real',()=>{
 const page=nexusStudio({mode:'Video / Reels',format:'9:16',posts:[]});
 for(const text of ['Estudio creativo','Herramientas de edición','IA Creativa','Recomendaciones IA','Línea de tiempo','Video / Reels','Subtítulos IA','Abrir diseñador PNG'])
  assert.ok(page.includes(text),'Elemento visual no encontrado: '+text);
 assert.match(page,/data-mode="Video \/ Reels"/);
 assert.match(page,/role="img"/);
 assert.match(page,/data-action="goto-diseño"/);
 assert.match(page,/Vista conceptual/);
});
test('Boceto 03: navegación inferior móvil conserva Inicio, Crear, Planificar, Bandeja y Más',()=>{
 const app=read('src/app.js'),css=read('src/nexus.css');
 assert.match(app,/const quickIds=\['inicio','estudio','crear','bandeja'\]/);
 for(const text of ["'inicio':'Inicio'","'estudio':'Crear'","'crear':'Planificar'","'bandeja':'Bandeja'"])
  assert.ok(app.includes(text));
 assert.match(app,/show-mobile-menu/);
 assert.match(css,/@media\s*\(max-width:680px\)/);
 assert.match(css,/@media\s*\(max-width:980px\)/);
 assert.match(css,/@media\s*\(prefers-reduced-motion:reduce\)/);
});
test('Boceto 04: referencia original y barra de carga animada',()=>{
 const app=read('src/app.js');
 assert.match(app,/nexus-original-splash/);
 assert.match(app,/boceto-04-carga-original.jpeg/);
 assert.match(app,/progressFill/);
 assert.match(app,/progressPercent/);
 assert.match(app,/skipSplash/);
 assert.ok(fs.existsSync(path.join(root,'assets/boceto-04-carga-original.jpeg')));
 assert.match(read('index.html'),/src\/reference\.css/);
});
test('Compatibilidad PWA y rutas a las tiendas',()=>{
 const manifest=JSON.parse(read('manifest.webmanifest'));
 assert.equal(manifest.display,'standalone');
 assert.equal(manifest.start_url,'./');
 assert.equal(manifest.scope,'./');
 for(const size of [192,512]){
  assert.ok(manifest.icons.some(x=>x.sizes===size+'x'+size),'Icono '+size+' ausente');
  assert.ok(fs.existsSync(path.join(root,'icon-'+size+'.png')));
 }
 const app=read('src/app.js');
 assert.match(app,/serviceWorker\.register/);
 assert.ok(fs.existsSync(path.join(root,'sw.js')));
 assert.equal(read('sw.js'),read('public/sw.js'));
 const cap=JSON.parse(read('capacitor.config.json'));
 assert.equal(cap.appName,'MarketHub AI');
});
