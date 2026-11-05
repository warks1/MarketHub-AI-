import test from 'node:test';
import assert from 'node:assert/strict';
import {drawScene,sceneDimensions} from '../src/studio-scene-export.js';

test('La imagen exportada conserva los formatos y resoluciones usados en las redes',()=>{
 assert.deepEqual(sceneDimensions('9:16'),[1080,1920]);
 assert.deepEqual(sceneDimensions('16:9'),[1920,1080]);
});

test('El exportador dibuja la composición original del usuario sin datos externos',()=>{
 const calls=[];
 const grad={addColorStop(pos,color){calls.push(['stop',pos,color])}};
 const ctx={
  clearRect(...a){calls.push(['clear',...a])},createLinearGradient(){return grad},
  createRadialGradient(){return grad},fillRect(...a){calls.push(['background',...a])},
  beginPath(){},arc(){},ellipse(){},fill(){},stroke(){},
  measureText(value){return {width:String(value).length*24}},
  fillText(text,x,y){calls.push(['text',text,x,y])},
  set fillStyle(v){this._fillStyle=v},get fillStyle(){return this._fillStyle},
  set font(v){this._font=v},get font(){return this._font},
  set strokeStyle(v){this._strokeStyle=v},get strokeStyle(){return this._strokeStyle}
 };
 drawScene(ctx,{title:'Mi propio producto',caption:'Oferta auténtica',theme:'Neón',duration:8},'16:9');
 assert.ok(calls.some(x=>x[0]==='background'&&x[3]===1920&&x[4]===1080));
 assert.ok(calls.some(x=>x[0]==='text'&&String(x[1]).includes('Mi propio producto')));
 assert.ok(calls.some(x=>x[0]==='text'&&String(x[1]).includes('Oferta auténtica')));
});
