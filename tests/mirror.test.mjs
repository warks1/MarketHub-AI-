import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mirrorLayer} from '../src/mirror-ui.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'src/mirror.css'),'utf8');

test('Los cuatro originales usados en la aplicación NO son versiones recreadas',()=>{
 const sources=['boceto-01-inicio-original.jpeg','boceto-02-estudio-original.jpeg','boceto-03-movil-original.jpeg','boceto-04-carga-original.jpeg'];
 for(const filename of sources){
  const original=fs.readFileSync(path.join(root,'assets',filename));
  const bundled=fs.readFileSync(path.join(root,'public/assets',filename));
  assert.equal(Buffer.compare(original,bundled),0,filename+' debe ser idéntico byte a byte');
  assert.ok(original.length>300000,'Asset muy pequeño: '+filename);
 }
});

test('Inicio usa fotografía original aprobada sin invertir ni recolorear',()=>{
 const html=mirrorLayer('inicio');
 assert.match(html,/boceto-01-inicio-original\.jpeg/);
 assert.match(html,/boceto-03-movil-original\.jpeg/);
 assert.match(html,/mirror-desktop-original/);
 assert.match(html,/mirror-mobile-original/);
 assert.match(html,/data-page="campanas"/);
 assert.match(html,/data-page="analitica"/);
 assert.match(html,/data-page="crear"/);
 assert.match(css,/filter:none!important/);
 assert.match(css,/transform:none!important/);
 assert.doesNotMatch(css,/scaleX\(-1\)/);
});

test('Estudio usa fotografía original y permite abrir las herramientas reales',()=>{
 const html=mirrorLayer('estudio');
 assert.match(html,/boceto-02-estudio-original\.jpeg/);
 assert.match(html,/data-action="mirror-live"/);
 assert.match(html,/data-page="diseño"/);
 assert.match(html,/data-page="herramientas"/);
 assert.match(html,/data-page="inicio"/);
});

test('El móvil recorta las pantallas originales sin sustituirlas por dibujos nuevos',()=>{
 for(const page of ['inicio','estudio']){
  const html=mirrorLayer(page);
  assert.match(html,/mirror-mobile-frame/);
  assert.match(html,/boceto-03-movil-original\.jpeg/);
  assert.match(html,/data-action="mirror-menu"/);
 }
 assert.match(css,/@media \(max-width:860px\) and \(orientation:portrait\)/);
});

test('La pantalla de carga 04 original se usa siempre, incluso en móvil',()=>{
 assert.match(app,/boceto-04-carga-original\.jpeg/);
 assert.match(app,/className='splash nexus-splash nexus-original-splash'/);
 assert.doesNotMatch(app,/nexus-energy-scene/);
 assert.match(app,/id="progressFill"/);
 assert.match(app,/id="skipSplash"/);
});

test('Sin duplicar menús, se mantiene la app interactiva debajo de la referencia',()=>{
 assert.match(app,/mirrorLayer\(state\.page/);
 assert.match(app,/underlying\.inert=mirrored/);
 assert.match(app,/mobileNative\.inert=mirrored/);
 assert.match(app,/case 'mirror-live':/);
 assert.match(app,/case 'mirror-back':/);
 assert.match(app,/case 'mirror-menu':/);
 assert.match(mirrorLayer('estudio',{menu:true}),/mirror-menu-panel/);
 assert.equal(mirrorLayer('campanas'),'');
});
