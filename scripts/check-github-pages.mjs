// GitHub Pages can publish source directly. Ensure native ES modules and relative URLs.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),failures=[],visited=new Set();
const check=(okay,why)=>{if(!okay)failures.push(why)};
const refs=[...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)].map(x=>x[1]);
check(html.includes('id="app"'),'Falta nodo app');
check(html.includes('boot-fallback'),'Falta UI de recuperación');
check(refs.includes('./src/app.js'),'Script del proyecto debe ser relativo');
for(const href of refs)if(href.startsWith('./'))check(fs.existsSync(path.join(root,href)),'Falta recurso '+href);
function scan(file){
 if(visited.has(file))return;
 visited.add(file);
 const js=read(file);
 for(const x of js.matchAll(/^\s*import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/gm)){
  const imp=x[1];
  if(!imp.startsWith('.')){failures.push('Dependencia no compilada en '+file+': '+imp);continue}
  if(imp.endsWith('.css')){failures.push('Importación CSS desde JS en '+file+': '+imp);continue}
  const next=path.posix.normalize(path.posix.join(path.posix.dirname(file),imp));
  if(!next.startsWith('src/')||!fs.existsSync(path.join(root,next))){failures.push('Módulo faltante '+next);continue}
  scan(next);
 }
}
scan('src/app.js');
check(fs.existsSync(path.join(root,'logo.svg')),'Logo ausente en raíz');
check(fs.existsSync(path.join(root,'manifest.webmanifest')),'Manifest ausente en raíz');
const m=JSON.parse(read('manifest.webmanifest'));
check(m.start_url==='./'&&m.scope==='./','Scope PWA no relativo');
check(!read('src/app.js').includes('src="/logo.svg"'),'Logo de ruta absoluta');
if(failures.length){for(const e of failures)console.error('Regresión GitHub Pages:',e);process.exit(1)}
console.log('Compatibilidad GitHub Pages OK: '+visited.size+' módulos nativos y '+refs.length+' enlaces');
