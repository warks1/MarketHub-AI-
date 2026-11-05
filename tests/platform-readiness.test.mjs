import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('src/app.js'),sw=read('sw.js'),html=read('index.html');

test('El arranque no tiene imports repetidos ni errores sintácticos',()=>{
 const imports=app.match(/^import[^\n]*$/gm)||[];
 assert.equal(new Set(imports).size,imports.length,'Importación duplicada puede causar pantalla blanca');
 assert.doesNotThrow(()=>new Function(app.replace(/^import[^\n]*\n/gm,'')));
 assert.doesNotThrow(()=>new Function(read('src/nexus-ui.js').replace(/\bexport\s+(?=function|const|class)/g,'')));
 assert.match(app,/nexusHome\(/);
 assert.match(app,/nexusStudio\(/);
});

test('Se conservan los cuatro bocetos originales y su visor',()=>{
 for(const n of ['01-inicio','02-estudio','03-movil','04-carga']){
  for(const ext of ['webp','original.jpeg']){
   const file='assets/boceto-'+n+(ext==='webp'?'.webp':'-'+ext);
   assert.ok(fs.existsSync(path.join(root,file)),'Falta '+file);
   assert.ok(fs.statSync(path.join(root,file)).size>20000,'Imagen incompleta: '+file);
  }
  assert.ok(read('referencias.html').includes('assets/boceto-'+n+'-original.jpeg'));
 }
 assert.match(app,/assets\/boceto-04-carga\.webp/);
 assert.match(html,/src\/reference\.css/);
});

test('PWA de Microsoft y navegadores con iconos y rutas coherentes',()=>{
 for(const f of ['manifest.webmanifest','sw.js','public/sw.js','icon-192.png','icon-512.png','public/icon-192.png','public/icon-512.png'])
  assert.ok(fs.existsSync(path.join(root,f)),'Falta '+f);
 const m=JSON.parse(read('manifest.webmanifest'));
 assert.equal(m.scope,'./');assert.equal(m.start_url,'./');assert.equal(m.display,'standalone');
 for(const n of [192,512]){
  const b=fs.readFileSync(path.join(root,'icon-'+n+'.png'));
  assert.equal(b.subarray(1,4).toString('ascii'),'PNG');
  assert.equal(b.readUInt32BE(16),n);
  assert.equal(b.readUInt32BE(20),n);
  assert.ok(m.icons.some(icon=>icon.sizes===n+'x'+n));
 }
 assert.equal(sw,read('public/sw.js'));
});

test('La caché prioriza versiones nuevas y no mezcla módulos antiguos',()=>{
 assert.match(sw,/await fetch\(req,\{cache:'no-cache'\}\)/);
 assert.match(sw,/await caches\.match\(req\)/);
 assert.doesNotMatch(sw,/caches\.match\(req,\{ignoreSearch:true\}\)/);
 assert.match(sw,/req\.method!=='GET'/);
 assert.match(sw,/url\.origin!==self\.location\.origin/);
 assert.match(app,/!window\.Capacitor\?\.isNativePlatform\?\.\(\)/);
});

test('Hay breakpoints y criterios de publicación en Apple Google y Microsoft',()=>{
 const css=read('src/nexus.css');
 for(const size of [1360,980,680,385])assert.ok(css.includes('max-width:'+size+'px'),'Falta breakpoint '+size);
 const docs=read('docs/PLATAFORMAS_Y_TIENDAS.md');
 for(const item of ['Windows','Mac','iPhone','iPad','Android','Microsoft Store','Google Play','App Store'])
  assert.ok(docs.includes(item),'Falta cobertura '+item);
 assert.match(html,/name="viewport"/);
 assert.match(app,/mobile-bottom/);
});
