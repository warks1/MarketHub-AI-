import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {IOS_LAUNCH_SIZES,launchPresets,makeLaunchPNG} from '../scripts/generate-ios-launch.mjs';

const page=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const root=new URL('../ios-launch/',import.meta.url);
const publicRoot=new URL('../public/ios-launch/',import.meta.url);
const magic='89504e470d0a1a0a';
function inspectPNG(bytes){
 assert.equal(bytes.subarray(0,8).toString('hex'),magic,'firma PNG requerida');
 let i=8,width=0,height=0;const idat=[];
 while(i<bytes.length){
  const len=bytes.readUInt32BE(i),type=bytes.toString('ascii',i+4,i+8);
  assert.ok(len>=0&&len<8000000);
  const payload=bytes.subarray(i+8,i+8+len);
  if(type==='IHDR'){width=payload.readUInt32BE(0);height=payload.readUInt32BE(4);
   assert.equal(payload[8],8);assert.equal(payload[9],2)}
  if(type==='IDAT')idat.push(payload);
  i+=12+len;
  if(type==='IEND')break;
 }
 assert.equal(i,bytes.length,'PNG no debe tener cola inesperada');
 return {width,height,raw:inflateSync(Buffer.concat(idat))};
}
test('Metadatos iOS dan fondo oscuro nativo y mantienen intacto el splash animado NEXUS × PULSE',()=>{
 for(const part of ['name="color-scheme" content="dark"',
  'name="apple-mobile-web-app-capable" content="yes"',
  'name="apple-mobile-web-app-status-bar-style" content="black"',
  'name="apple-mobile-web-app-title" content="MarketHub AI"',
  'rel="apple-touch-icon"'])
  assert.ok(page.includes(part),part);
 assert.match(page,/src="\.\/src\/app\.js\?v=20261106r"/);
 assert.match(page,/src\/splash-responsive\.css/);
 const css=readFileSync(new URL('../src/splash-responsive.css',import.meta.url),'utf8');
 assert.match(css,/mh-splash-feature/);
 assert.equal(pkg.scripts.prebuild,'npm run generate:ios-launch');
 assert.equal(pkg.scripts.pretest,'npm run generate:ios-launch');
 assert.equal(pkg.scripts.predev,'npm run generate:ios-launch');
});
test('Enlaza 17 imágenes con resolución física exacta y orientación iPhone o iPad',()=>{
 const sizes=launchPresets();
 assert.equal(IOS_LAUNCH_SIZES.length,13);
 assert.equal(sizes.length,17);
 assert.equal((page.match(/rel="apple-touch-startup-image"/g)||[]).length,sizes.length);
 for(const {w,h,dpr,width,height,orientation} of sizes){
  const name='launch-'+width+'x'+height+'.png';
  const media='(device-width: '+w+'px) and (device-height: '+h+'px) and (-webkit-device-pixel-ratio: '+dpr+') and (orientation: '+orientation+')';
  assert.ok(page.includes(media),name+' media');
  assert.ok(page.includes('href="./ios-launch/'+name+'"'),name+' href');
  assert.ok(sw.includes("'./ios-launch/"+name+"'"),name+' offline');
  const src=new URL(name,root),dist=new URL(name,publicRoot);
  assert.ok(existsSync(src),name+' debe existir en raíz para GitHub Pages');
  assert.ok(existsSync(dist),name+' debe existir para Vite');
  const rootBuffer=readFileSync(src),publicBuffer=readFileSync(dist);
  assert.ok(rootBuffer.equals(publicBuffer),name+' debe ser idéntico en ambas rutas');
  assert.equal(rootBuffer.readUInt32BE(16),width,name+' anchura');
  assert.equal(rootBuffer.readUInt32BE(20),height,name+' altura');
 }
});
test('Los PNG no son archivos falsos: la carga nativa se descomprime correctamente',()=>{
 for(const name of ['launch-1290x2796.png','launch-1320x2868.png','launch-1668x2388.png']){
  const b=readFileSync(new URL(name,root));
  const png=inspectPNG(b);
  assert.equal(png.raw.byteLength,png.height*(png.width*3+1));
  assert.equal(png.raw[0],0,'primer scanline filtro válido');
  assert.ok(b.length>5000);
 }
 const tiny=makeLaunchPNG(640,1136);
 assert.equal(inspectPNG(tiny).width,640);
 assert.throws(()=>makeLaunchPNG(0,800),/Dimensiones/);
});
