import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const app=read('src/app.js'),css=read('src/splash-responsive.css'),html=read('index.html');

test('Los seis banners de carga aparecen completos y nunca se omiten en teléfono/tablet',()=>{
 const names=['Analítica inteligente','IA creativa','Campañas con IA',
 'Social Listening','Contenido creativo','Planificación y automatización'];
 for(const n of names)assert.ok(app.includes(n),'Falta el texto del banner '+n);
 for(const id of ['analytics','creative','campaigns','social','content','planning'])
  assert.ok(css.includes('.mh-feature-'+id+'{grid-area:'+id+'}'),id+' sin celda visible');
 assert.match(app,/const compact=/);
 assert.match(app,/overlay.innerHTML=compact/);
 assert.doesNotMatch(app,/const wide=/);
 assert.doesNotMatch(app,/segment\('mirror-splash-(?:hero|brand|status)'/);
});

test('Móvil y tablet tienen composiciones que NO ocultan tarjetas a los lados',()=>{
 assert.match(css,/grid-template-areas:[\s\S]*"analytics orb creative"[\s\S]*"campaigns orb social"[\s\S]*"content orb planning"/);
 assert.match(css,/@media\(max-width:699px\)/);
 assert.match(css,/grid-template-areas:[\s\S]*"orb orb"[\s\S]*"analytics creative"[\s\S]*"campaigns social"[\s\S]*"content planning"/);
 assert.match(css,/overflow-y:auto/);
 assert.match(css,/overflow-x:hidden/);
 assert.match(css,/font-size:clamp\(12px,3\.4vw,15px\)/);
});

test('Esfera y paleta son las mismas del original, progreso y entrada funcionales',()=>{
 assert.match(app,/boceto-04-carga-original\.jpeg/);
 assert.match(app,/mh-splash-orb-crop/);
 assert.match(css,/#32e8ff/);
 assert.match(css,/#eb4afb/);
 assert.match(css,/filter:none!important/);
 for(const id of ['progressFill','progressPercent','progressLabel','skipSplash'])
  assert.ok(app.includes(id),'Falta '+id);
 assert.match(app,/aria-valuenow/);
});

test('Los nuevos estilos están cargados y el Service Worker no puede ignorarlos',()=>{
 assert.match(html,/src\/splash-responsive\.css/);
 assert.match(read('sw.js'),/src\/splash-responsive\.css/);
 assert.equal(read('sw.js'),read('public/sw.js'));
});

test('La animación respeta el boceto y es accesible',()=>{
 assert.match(css,/@keyframes mh-splash-feature-glow/);
 assert.match(css,/@keyframes mh-splash-orb-light/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/animation:none!important/);
 assert.match(css,/min-height:44px;touch-action:manipulation/);
});

test('El relleno de progreso tiene altura real y el conjunto se centra en tablet',()=>{
 assert.match(css,/\.mh-splash-track > \.progress-fill/);
 assert.match(css,/height:calc\(100% - 8px\)!important/);
 assert.match(css,/transform:scaleX\(var\(--splash-progress,0\)\)!important/);
 assert.match(app,/bar\.style\.setProperty\('--splash-progress'/);
 assert.match(css,/@media\(min-width:700px\) and \(max-width:1199px\)/);
 assert.match(css,/min-height:100dvh;justify-content:center/);
});

test('La vista previa no corta palabras y los indicadores no duplican ejemplo',()=>{
 const growth=read('src/growth.css'),office=read('src/office.css');
 assert.doesNotMatch(growth,/word-break:break-all/);
 assert.match(growth,/word-break:normal/);
 assert.match(office,/workspace-landing-preview h2/);
 const snippet=app.match(/function kpi\([\s\S]*?\n}/)?.[0];
 assert.ok(snippet,'No se encontró el indicador de campañas');
 assert.match(snippet,/detail\.toLowerCase\(\)==='ejemplo'/);
});
