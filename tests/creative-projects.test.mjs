import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeProjectSettings,validateCreativeProject,parsePortableCreativeProject,MAX_PROJECTS,MAX_PROJECT_IMAGE_BYTES,MAX_PROJECT_TOTAL_BYTES} from '../src/creative-projects.js';
import {forgePage,forgeTab} from '../src/media-forge.js';

const settings={format:'4:5',mask:'estrella',look:'editorial',safezone:'on',caption:'Creatividad editable',
 brandActive:true,brandPrimary:'#123abc',brandAccent:'#ff00aa'};
test('Los proyectos validan solo máscaras, formatos, estilos y colores admitidos',()=>{
 const actual=normalizeProjectSettings(settings);
 assert.deepEqual(actual,{...settings,brandPrimary:'#123ABC',brandAccent:'#FF00AA'});
 for(const field of ['format','mask','look','safezone']){
  assert.throws(()=>normalizeProjectSettings({...settings,[field]:'<script>'}));
 }
 assert.throws(()=>normalizeProjectSettings({...settings,brandPrimary:'red'}));
 assert.deepEqual(normalizeProjectSettings({}).format,'9:16');
 assert.equal(MAX_PROJECTS,12);
 assert.equal(MAX_PROJECT_IMAGE_BYTES,8*1024*1024);
 assert.equal(MAX_PROJECT_TOTAL_BYTES,80*1024*1024);
});
test('La imagen original y los ajustes están incluidos en la copia editable .mhub',async()=>{
 const bytes=Uint8Array.from([137,80,78,71,0,2,4,8,16,32,64,128,255]);
 const source={app:'MarketHub AI',format:'mhub-creative-project',version:1,
  name:'Campaña de otoño',sourceType:'image/png',sourceBase64:Buffer.from(bytes).toString('base64'),settings};
 const restored=parsePortableCreativeProject(JSON.stringify(source));
 assert.equal(restored.name,'Campaña de otoño');
 assert.equal(restored.type,'image/png');
 assert.equal(restored.settings.caption,'Creatividad editable');
 assert.equal(restored.settings.mask,'estrella');
 assert.deepEqual(new Uint8Array(await restored.file.arrayBuffer()),bytes);
 assert.deepEqual(validateCreativeProject({name:restored.name,file:restored.file,settings:restored.settings}).settings,restored.settings);
});
test('No se importan proyectos manipulados ni archivos con código ejecutable',()=>{
 const base={app:'MarketHub AI',format:'mhub-creative-project',version:1,
  name:'Campaña segura',sourceType:'image/png',sourceBase64:'AQIDBA==',settings};
 for(const broken of [
  {...base,app:'Otro programa'}, {...base,version:2},{...base,sourceType:'image/svg+xml'},
  {...base,sourceBase64:'<script>alert(1)</script>'},{...base,settings:{...settings,mask:'desconocida'}},
  {...base,sourceBase64:'AQID!'}
 ])assert.throws(()=>parsePortableCreativeProject(JSON.stringify(broken)));
 assert.throws(()=>parsePortableCreativeProject('no es json'));
 assert.throws(()=>validateCreativeProject({name:'X',file:new Blob(['abc'],{type:'image/png'}),settings}));
});
test('El editor mantiene las herramientas antiguas y ofrece acciones reales para reanudar y recuperar proyectos',()=>{
 forgeTab('photo',()=>{});
 const html=forgePage();
 assert.match(html,/data-forge-action="project-save"/);
 assert.match(html,/data-forge-action="project-list"/);
 assert.match(html,/data-forge-input="projectName"/);
 assert.match(html,/data-forge-action="pack"/);
 assert.match(html,/SafeFrame PULSE/);
 const source=readFileSync(new URL('../src/media-forge.js',import.meta.url),'utf8');
 assert.match(source,/data-forge-action="project-open"/);
 assert.match(source,/data-forge-action="project-export"/);
 assert.match(source,/data-forge-action="project-delete"/);
 assert.match(source,/data-forge-file="project"/);
 assert.match(source,/keepProject:true/);
 assert.match(source,/s\.projectId=null;s\.projectName=/);
 const projectDb=readFileSync(new URL('../src/creative-projects.js',import.meta.url),'utf8');
 assert.match(projectDb,/markethub-creative-projects-v1/);
 assert.match(projectDb,/const bytes=await file\.arrayBuffer/);
 assert.doesNotMatch(projectDb,/store\.put\(\{[^}]*file/);
});
