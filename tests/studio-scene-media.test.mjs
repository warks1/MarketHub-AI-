import test from 'node:test';
import assert from 'node:assert/strict';
import {isSceneImageData,sceneMediaLength,canStoreSceneImage,drawImageCover,imageFileToSceneData,MAX_TOTAL_SCENE_MEDIA} from '../src/studio-scene-media.js';
import {liveStudio} from '../src/live-studio.js';
import {drawScene} from '../src/studio-scene-export.js';
const valid='data:image/jpeg;base64,'+'A'.repeat(4000);
test('Solo se aceptan fotografías embebidas con MIME y base64 seguros',()=>{
 assert.ok(isSceneImageData(valid));
 for(const bad of ['javascript:alert(1)','data:image/svg+xml;base64,AAA','data:text/html;base64,YQ==','data:image/jpeg;base64," onerror=alert(1)','data:image/jpeg;base64,'+'A'.repeat(270001)])
  assert.equal(isSceneImageData(bad),false);
});
test('Se aplica una cuota global y se puede reemplazar una foto existente',()=>{
 const img='data:image/jpeg;base64,'+'A'.repeat(225000);
 const scenes=Array.from({length:5},(_,i)=>({id:i,imageData:img}));
 assert.equal(sceneMediaLength(scenes),img.length*5);
 assert.equal(canStoreSceneImage(scenes,1,img),true);
 assert.equal(canStoreSceneImage(scenes,5,img),false);
 assert.ok(MAX_TOTAL_SCENE_MEDIA>=1000000);
});
test('Imagen de fondo se recorta centrada sin estirar ni invertir sus píxeles',()=>{
 const operations=[];
 const canvas={drawImage(...args){operations.push(args)}};
 const original={naturalWidth:200,naturalHeight:100};
 drawImageCover(canvas,original,100,200);
 assert.equal(operations.length,1);
 assert.equal(operations[0][0],original);
 assert.deepEqual(operations[0].slice(1),[75,0,50,100,0,0,100,200]);
});
test('No permite formatos ni tamaños no admitidos',async()=>{
 await assert.rejects(()=>imageFileToSceneData({type:'image/svg+xml',size:120}));
 await assert.rejects(()=>imageFileToSceneData({type:'image/jpeg',size:9000000}));
 await assert.rejects(()=>imageFileToSceneData({type:'image/jpeg',size:0}));
});
test('Vista previa de estudio enseña fotos reales guardadas, sin HTML arbitrario',()=>{
 const html=liveStudio({scenes:[{id:'a',title:'Portada',caption:'Texto',theme:'Neón',duration:5,imageData:valid}]});
 assert.match(html,/class="live-scene-photo"/);
 assert.match(html,/id="live-scene-photo"/);
 assert.match(html,/data-scene-image/);
 assert.match(html,/data-action="storyboard-clear-photo"/);
 assert.ok(!liveStudio({scenes:[{id:'b',title:'OK',imageData:'javascript:alert(1)'}]}).includes('class="live-scene-photo"'));
});
test('Exportación PNG incorpora una foto y conserva titular y colores del proyecto',()=>{
 const calls=[];
 const gradient={addColorStop(){}};
 const ctx={
  clearRect(){},createLinearGradient(){return gradient},createRadialGradient(){return gradient},
  fillRect(){},beginPath(){},arc(){},ellipse(){},stroke(){},fill(){},measureText(t){return {width:String(t).length*20}},
  drawImage(...args){calls.push(['photo',...args])},fillText(x){calls.push(['text',x])}
 };
 const image={naturalWidth:1200,naturalHeight:800};
 drawScene(ctx,{title:'Mi campaña',caption:'Contenido propio',theme:'Violeta'},'9:16',image);
 assert.ok(calls.some(x=>x[0]==='photo'));
 assert.ok(calls.some(x=>x[0]==='text'&&x[1]==='Mi campaña'));
});
