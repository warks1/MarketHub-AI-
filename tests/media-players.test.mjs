import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PLAYER_MAX_IMAGES,PLAYER_MAX_IMAGE_BYTES,PLAYER_MAX_AUDIO_BYTES,
 imageMimeSupported,nextImageIndex,clampZoom,formatMediaTime,playerPage,playerFile} from '../src/media-players.js';
import {forgeTab,forgePage} from '../src/media-forge.js';
test('Visor de imagen valida tipos y tiene límites claros',()=>{
 assert.equal(PLAYER_MAX_IMAGES,10);
 assert.equal(PLAYER_MAX_IMAGE_BYTES,100*1024*1024);
 assert.equal(PLAYER_MAX_AUDIO_BYTES,60*1024*1024);
 for(const type of ['image/jpeg','image/png','image/webp','image/gif'])assert.equal(imageMimeSupported(type),true);
 for(const type of ['image/svg+xml','text/html','application/pdf',''])assert.equal(imageMimeSupported(type),false);
});
test('Navegación, zoom y tiempos son matemáticamente estables',()=>{
 assert.equal(nextImageIndex(0,-1,4),3);
 assert.equal(nextImageIndex(3,1,4),0);
 assert.equal(nextImageIndex(2,1,0),0);
 assert.equal(clampZoom(-1),1);
 assert.equal(clampZoom(2.5),2.5);
 assert.equal(clampZoom(99),5);
 assert.equal(clampZoom('abc'),1);
 assert.equal(formatMediaTime(0),'0:00');
 assert.equal(formatMediaTime(73.95),'1:13');
 assert.equal(formatMediaTime(NaN),'0:00');
});
test('La nueva pestaña se añade sin retirar foto, audio, vídeo, PDF, biblioteca ni proyectos',()=>{
 const page=playerPage();
 for(const key of ['player-images','player-audio','player-visualize','player-slideshow','player-zoom-in','player-rotate','player-expand','player-spectrum','player-waveform'])
  assert.ok(page.includes(key),key);
 const tab=forgePage();
 assert.match(tab,/data-forge-tab="players"/);
 for(const old of ['photo','audio','video','pdf','subs','vault','projects'])assert.ok(tab.includes('data-forge-tab="'+old+'"'));
 forgeTab('players',()=>{});
 assert.match(forgePage(),/id="forgePlayerGallery"/);
 assert.match(forgePage(),/id="forgePlayerSpectrum"/);
 forgeTab('audio',()=>{});
 assert.match(forgePage(),/Convertir \/ recortar a WAV/);
 forgeTab('photo',()=>{});
 assert.match(forgePage(),/forgeCanvas/);
});
test('Los títulos de ficheros no se interpolan sin escapar, y la API distingue tipos',async()=>{
 const page=playerPage();
 assert.doesNotMatch(page,/<script/);
 const result=await playerFile({dataset:{forgeFile:'invalid'},files:[{name:'bad'}]},{toast:()=>{},refresh:()=>{}});
 assert.equal(result,false);
});
test('La app mantiene dispatch de eventos y precarga local',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const worker=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
 assert.match(app,/forgeTab\(forgeTabTarget.dataset.forgeTab,render\)/);
 assert.match(app,/forgeClick\(forgeActionTarget/);
 assert.match(app,/forgeFile\(e.target/);
 assert.match(worker,/\.\/src\/media-players\.js/);
 assert.match(worker,/\.\/src\/media-players\.css/);
});
