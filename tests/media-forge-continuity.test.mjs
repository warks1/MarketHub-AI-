import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {forgePage,forgeTab,SAFEFRAME_GUIDES,SIZES} from '../src/media-forge.js';

test('SafeFrame PULSE cubre los cinco formatos de campaña y mantiene márgenes legibles',()=>{
 for(const name of Object.keys(SIZES)){
  const m=SAFEFRAME_GUIDES[name];assert.ok(m,'Falta guía para '+name);
  assert.ok(m.left+m.right<.5&&m.top+m.bottom<.65);
  for(const key of ['top','bottom','left','right'])assert.ok(m[key]>0&&m[key]<.4);
 }
 forgeTab('photo',()=>{});
 const html=forgePage();
 assert.match(html,/SafeFrame PULSE/);
 assert.match(html,/data-forge-input="safezone"/);
 assert.match(html,/data-forge-action="studio"/);
 assert.match(html,/PULSE PACK/);
});
test('Transferencia directa de Media Forge a Estudio mantiene comprobación de tamaño y guardado local',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const media=readFileSync(new URL('../src/media-forge.js',import.meta.url),'utf8');
 assert.match(app,/sendStudioImage:async\(blob\)/);
 assert.match(app,/imageFileToSceneData\(file\)/);
 assert.match(app,/canStoreSceneImage\(state\.storyboard,scene\.id,data\)/);
 assert.match(app,/if\(!save\(\)\)/);
 assert.match(media,/ctx\.sendStudioImage\(blob\)/);
 assert.match(media,/opts\.preview&&s\.safezone==='on'/);
});
