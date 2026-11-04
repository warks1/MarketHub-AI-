import test from 'node:test';
import assert from 'node:assert/strict';

const memory=new Map();
globalThis.localStorage={
 getItem:k=>memory.get(k)??null,
 setItem:(k,v)=>memory.set(k,String(v)),
 removeItem:k=>memory.delete(k)
};
let confirms=true;
globalThis.window={confirm:()=>confirms};
globalThis.document={getElementById:()=>null};
const {dimensions,visualPage,drawVisual,visualInput,visualClick}=await import('../src/visual.js');
const messages=[];
const ctx={refresh:()=>{},toast:m=>messages.push(m),newPost:s=>messages.push('BORRADOR '+s)};
function fakeCanvas(){
 const ops=[];
 const ctx=new Proxy({},{
  get(target,key){
   if(key==='createLinearGradient')return ()=>({addColorStop(){}});
   if(key==='measureText')return text=>({width:String(text).length*29});
   if(key==='ellipse'||key==='arc'||key==='fillRect'||key==='fillText'||key==='fill'||key==='stroke'||key==='beginPath'||key==='save'||key==='restore'||key==='translate'||key==='rotate'||key==='roundRect')return (...args)=>{ops.push([key,...args])};
   return target[key];
  },
  set(target,key,value){target[key]=value;return true}
 });
 return {canvas:{width:0,height:0,getContext:()=>ctx},ops};
}
test('Proporciona tamaños exactos para cuatro formatos de redes',()=>{
 assert.deepEqual(dimensions('9:16'),[1080,1920]);
 assert.deepEqual(dimensions('4:5'),[1080,1350]);
 assert.deepEqual(dimensions('1:1'),[1080,1080]);
 assert.deepEqual(dimensions('16:9'),[1920,1080]);
 assert.deepEqual(dimensions('unknown'),[1080,1350]);
});
test('El diseñador explica que es local y exporta PNG, sin prometer IA real',()=>{
 const html=visualPage();
 assert.match(html,/Diseñador de publicaciones/);
 assert.match(html,/Descargar imagen PNG/);
 assert.match(html,/No es todavía un editor profesional/);
 assert.match(html,/data-visual-file="photo"/);
});
test('Dibuja un diseño con Canvas sin acceder a APIs externas',()=>{
 const {canvas,ops}=fakeCanvas();
 assert.equal(drawVisual(canvas),true);
 assert.equal(canvas.width,1080);
 assert.equal(canvas.height,1350);
 assert.ok(ops.some(x=>x[0]==='fillRect'));
 assert.ok(ops.some(x=>x[0]==='fillText'));
});
test('Cambiar formato actualiza las dimensiones reales del dibujo',()=>{
 assert.equal(visualInput({dataset:{visualField:'format'},value:'16:9'}),true);
 const {canvas}=fakeCanvas();assert.equal(drawVisual(canvas),true);
 assert.deepEqual([canvas.width,canvas.height],[1920,1080]);
});
test('Evita valores de estilo no admitidos',()=>{
 assert.equal(visualInput({dataset:{visualField:'style'},value:'<script>alert(1)</script>'}),true);
 const html=visualPage();
 assert.ok(!html.includes('<script>alert(1)</script>'));
});
test('Escapa los valores del usuario en el HTML de edición',()=>{
 visualInput({dataset:{visualField:'brand'},value:'<img src=x onerror=alert(1)>'});
 const html=visualPage();
 assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
 assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
});
test('Los presets muestran texto prediseñado editable',()=>{
 assert.equal(visualClick({dataset:{visualAction:'preset',value:'sale'}},ctx),true);
 assert.match(visualPage(),/OFERTA ESPECIAL/);
});
test('No se pierde el diseño si se cancela restablecer',()=>{
 confirms=false;visualClick({dataset:{visualAction:'reset'}},ctx);
 assert.match(visualPage(),/OFERTA ESPECIAL/);
 confirms=true;visualClick({dataset:{visualAction:'reset'}},ctx);
 assert.match(visualPage(),/PRÓXIMO GRAN LANZAMIENTO/);
});
test('Permite mandar un texto a un borrador sin prometer subir la imagen',()=>{
 visualClick({dataset:{visualAction:'draft'}},ctx);
 assert.ok(messages.some(x=>x.startsWith('BORRADOR ')));
});
