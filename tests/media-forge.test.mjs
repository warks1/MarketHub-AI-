import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {forgePage,forgeTab,outputDimensions,encodeWav,MASKS,SIZES,canRecordWebM,safeFileName} from '../src/media-forge.js';

test('Media Forge reúne cuatro herramientas reales y no depende de servicios externos',()=>{
 const html=forgePage();
 assert.match(html,/MEDIA FORGE/);
 for(const name of ['Foto y máscaras','Audio y WAV','Vídeo y fotogramas','Visor PDF'])assert.ok(html.includes(name));
 assert.match(html,/data-forge-action="png"/);
 assert.match(html,/data-forge-action="jpeg"/);
 assert.match(html,/data-forge-action="webp"/);
 assert.match(html,/Sin subir archivos/);
});
test('Las pestañas mantienen el mismo espacio de trabajo sin cambiar el menú global',()=>{
 let refreshed=0;
 assert.equal(forgeTab('audio',()=>refreshed++),true);
 assert.match(forgePage(),/data-forge-action="wav"/);
 assert.match(forgePage(),/Selecciona un audio para reproducirlo/);
 assert.equal(forgeTab('video',()=>refreshed++),true);
 assert.match(forgePage(),/data-forge-action="frame"/);
 assert.match(forgePage(),/data-forge-action="webm"/);
 assert.equal(forgeTab('pdf',()=>refreshed++),true);
 assert.match(forgePage(),/Visor de documentos/);
 assert.equal(forgeTab('desconocida',()=>refreshed++),false);
 assert.equal(refreshed,3);
 forgeTab('photo',()=>{});
});
test('Exportación social mantiene resoluciones y quince máscaras',()=>{
 assert.deepEqual(outputDimensions('9:16'),[1080,1920]);
 assert.deepEqual(outputDimensions('1:1'),[1080,1080]);
 assert.deepEqual(outputDimensions('16:9'),[1920,1080]);
 assert.deepEqual(outputDimensions('no-valido'),[1080,1920]);
 assert.equal(Object.keys(SIZES).length,5);
 assert.equal(new Set(MASKS).size,15);
 assert.ok(MASKS.includes('orbita'));
});
test('La conversión WAV genera cabecera RIFF válida y respeta tiempos',()=>{
 const rate=48000;
 const track=new Float32Array(rate);
 track.fill(.5);
 const buffer={sampleRate:rate,numberOfChannels:1,length:track.length,duration:1,getChannelData:()=>track};
 const bytes=encodeWav(buffer,.2,.6),view=new DataView(bytes);
 const text=(at,n)=>String.fromCharCode(...new Uint8Array(bytes,at,n));
 assert.equal(text(0,4),'RIFF');
 assert.equal(text(8,4),'WAVE');
 assert.equal(text(36,4),'data');
 assert.equal(view.getUint16(22,true),1);
 assert.equal(view.getUint32(24,true),rate);
 assert.equal(view.getUint16(34,true),16);
 assert.equal(view.getUint32(40,true),rate*.4*2);
 assert.equal(view.getInt16(44,true),16383);
});
test('WAV rechaza intervalos inválidos para evitar resultados corruptos',()=>{
 const track=new Float32Array(500);
 const b={sampleRate:1000,numberOfChannels:1,length:500,duration:.5,getChannelData:()=>track};
 for(const [from,to] of [[.5,.2],[-1,.3],[.6,0],[.5,0],[NaN,.3]]){
  assert.throws(()=>encodeWav(b,from,to));
 }
});
test('No se inventa compatibilidad WebM ni extensiones inseguras',()=>{
 assert.equal(canRecordWebM(null),false);
 assert.equal(canRecordWebM({}),false);
 assert.equal(safeFileName('archivo <script>.png'),'archivo--script-');
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../src/media-forge.css',import.meta.url),'utf8');
 assert.match(app,/case 'multimedia':return forgePage\(\)/);
 assert.match(app,/forgeMount\(\)/);
 assert.match(app,/forgeFile\(/);
 assert.match(css,/max-width:680px/);
});
