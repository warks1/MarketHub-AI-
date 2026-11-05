import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {nexusHome,nexusStudio} from '../src/nexus-ui.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const originals={
 'assets/boceto-01-inicio-original.jpeg':'77519de588c1acba59f1d206692c102a2de0be6853aa76938ee0ee6b4951ae4a',
 'assets/boceto-02-estudio-original.jpeg':'1de9ff99e38aedca4ffd9a77668b532dd053e93f1bf1d2ff2d93190a296147df',
 'assets/boceto-03-movil-original.jpeg':'ee3243753b0eb2eb108b6ed74422d3def5c9349e3d4103d90808fc0638185fd3',
 'assets/boceto-04-carga-original.jpeg':'87f03f231431819480cd149445ccdf2f6e3a00f52785d40c191da42fcf1fc1c7'
};
test('Los cuatro bocetos originales permanecen sin modificaciones binarias',()=>{
 for(const [name,expected] of Object.entries(originals)){
  const file=path.join(root,name);
  assert.ok(existsSync(file),'Falta boceto seleccionado: '+name);
  const bytes=readFileSync(file);
  assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),expected,'No modificar la referencia sin la elección expresa del usuario: '+name);
 }
});
test('La galería muestra exactamente los originales seleccionados, no alternativas',()=>{
 const html=read('referencias.html');
 for(const name of Object.keys(originals))assert.ok(html.includes('./'+name));
 for(const id of ['ref01','ref02','ref03','ref04'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/referencia visual/);
});
test('El boceto 04 es la base original de la pantalla de carga panorámica',()=>{
 const app=read('src/app.js'),css=read('src/reference.css'),index=read('index.html');
 assert.match(app,/boceto-04-carga-original\.jpeg/);
 assert.match(app,/nexus-original-splash/);
 assert.match(app,/progressFill/);
 assert.match(app,/skipSplash/);
 assert.match(css,/nexus-original-splash-board/);
 assert.match(index,/reference\.css/);
});
test('Las vistas operativas siguen presentes y no simulan conexiones o datos reales',()=>{
 const home=nexusHome({posts:[],chart:'<svg></svg>',plan:'free'});
 const studio=nexusStudio({posts:[],mode:'Video / Reels',format:'9:16'});
 for(const v of ['Rendimiento por plataforma','Calendario de contenidos','Social Listening','Bandeja unificada','Plataformas conectadas'])
  assert.ok(home.includes(v),v);
 for(const v of ['Herramientas de edición','Recomendaciones IA','Línea de tiempo','Plantillas destacadas'])
  assert.ok(studio.includes(v),v);
 assert.match(home,/Sin conectar/);
 assert.match(studio,/DEMO|demostración|conceptual/i);
});
