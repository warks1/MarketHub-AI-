import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const publicSw=readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('Los dos service workers usan la misma revisión posterior a v0.7.8',()=>{
 assert.equal(sw,publicSw,'La copia del public/ debe ser idéntica a sw.js');
 assert.match(sw,/const CACHE = 'markethub-nexus-pulse-shell-v0\.7\.32'/);
 assert.doesNotMatch(sw,/shell-v0\.7\.4['"]/);
});
test('La actualización reemplaza el shell anterior pero conserva datos locales',()=>{
 assert.match(sw,/self\.skipWaiting\(\)/);
 assert.match(sw,/self\.clients\.claim\(\)/);
 assert.match(sw,/caches\.delete\(name\)/);
 assert.match(sw,/name!==CACHE/);
 assert.doesNotMatch(sw,/localStorage\.clear\(/);
 assert.match(sw,/'\.\/src\/app\.js'/);
 assert.match(sw,/'\.\/src\/visual\.js'/);
 assert.match(sw,/'\.\/src\/engine-lab\.js'/);
 assert.match(sw,/'\.\/src\/marketing-engines\.js'/);
 assert.match(sw,/'\.\/src\/advanced-engines\.js'/);
 assert.match(sw,/'\.\/src\/advanced-engine-lab\.js'/);
});
test('Se invalida la versión de carga del JS sin romper las rutas relativas',()=>{
 assert.match(html,/src="\.\/src\/app\.js\?v=20261107a"/);
 assert.match(html,/version: '20261107a'/);
 assert.match(html,/reparacion=20261107a/);
});
