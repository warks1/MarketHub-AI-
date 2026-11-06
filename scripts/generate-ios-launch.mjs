// Pantalla de arranque nativa para PWA instaladas en iPhone/iPad.
// Apple muestra esta imagen ANTES de cargar HTML/JS. No es la pantalla animada del sitio.
// PNG generado en build/dev/test sin binarios versionados ni dependencias gráficas.
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {deflateSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';

export const IOS_LAUNCH_SIZES=[
 // CSS px × escala → imagen PNG exacta. Añadir tamaños al aparecer nuevos dispositivos.
 {w:440,h:956,dpr:3},  // iPhone 16 Pro Max y similares
 {w:420,h:912,dpr:3},  // iPhone Air
 {w:402,h:874,dpr:3},  // iPhone 16 Pro
 {w:430,h:932,dpr:3},  // iPhone 15 Pro Max / 16 Plus: dispositivo del vídeo
 {w:393,h:852,dpr:3},  // iPhone 15 Pro
 {w:428,h:926,dpr:3},  // iPhone 13 Pro Max / 14 Plus
 {w:390,h:844,dpr:3},  // iPhone 12/13/14
 {w:375,h:812,dpr:3},  // iPhone X/11 Pro
 {w:375,h:667,dpr:2},  // iPhone SE
 {w:768,h:1024,dpr:2}, // iPad 9.7"
 {w:744,h:1133,dpr:2}, // iPad mini
 {w:820,h:1180,dpr:2}, // iPad 10.9"
 {w:834,h:1194,dpr:2}, // iPad Pro 11"
];
const glyphs={
 'A':['01110','10001','10001','11111','10001','10001','10001'],
 'B':['11110','10001','10001','11110','10001','10001','11110'],
 'C':['01111','10000','10000','10000','10000','10000','01111'],
 'E':['11111','10000','10000','11110','10000','10000','11111'],
 'H':['10001','10001','10001','11111','10001','10001','10001'],
 'I':['11111','00100','00100','00100','00100','00100','11111'],
 'K':['10001','10010','10100','11000','10100','10010','10001'],
 'L':['10000','10000','10000','10000','10000','10000','11111'],
 'M':['10001','11011','10101','10101','10001','10001','10001'],
 'N':['10001','11001','10101','10011','10001','10001','10001'],
 'P':['11110','10001','10001','11110','10000','10000','10000'],
 'R':['11110','10001','10001','11110','10100','10010','10001'],
 'S':['01111','10000','10000','01110','00001','00001','11110'],
 'T':['11111','00100','00100','00100','00100','00100','00100'],
 'U':['10001','10001','10001','10001','10001','10001','01110'],
 'X':['10001','10001','01010','00100','01010','10001','10001'],
 '-':['00000','00000','00000','11111','00000','00000','00000'],
 ' ':['00000','00000','00000','00000','00000','00000','00000'],
};
const crcTable=Uint32Array.from({length:256},(_,n)=>{
 let c=n;for(let i=0;i<8;i++)c=(c&1)?0xEDB88320^(c>>>1):c>>>1;return c>>>0;
});
function crc(bytes){
 let c=0xFFFFFFFF;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;
}
function pngChunk(name,bytes){
 const type=Buffer.from(name,'ascii'),size=Buffer.alloc(4),sum=Buffer.alloc(4);
 size.writeUInt32BE(bytes.length);sum.writeUInt32BE(crc(Buffer.concat([type,bytes])));
 return Buffer.concat([size,type,bytes,sum]);
}
function clamp(v){return Math.max(0,Math.min(255,Math.round(v)))}
function distance(px,py,ax,ay,bx,by){
 const dx=bx-ax,dy=by-ay;
 const t=Math.min(1,Math.max(0,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));
 return Math.hypot(px-ax-t*dx,py-ay-t*dy);
}
export function makeLaunchPNG(width,height){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<500||height<500||width*height>7000000)
  throw Error('Dimensiones de imagen de arranque incorrectas');
 const stride=width*3+1,raw=Buffer.alloc(stride*height);
 const cx=width/2,cy=height*.41,side=Math.min(width,height);
 const xr=side*.205,yr=side*.176;
 const edges=[
  [-.56,.32,-.28,-.32],
  [-.28,-.32,-.04,.15],
  [-.04,.15,.22,-.32],
  [.22,-.32,.53,.32],
 ];
 for(let y=0;y<height;y++){
  const base=y*stride;raw[base]=0;
  const yy=Math.abs((y-height*.43)/(height*.8));
  for(let x=0;x<width;x++){
   const xx=Math.abs((x-cx)/(width*.9));
   const bg=Math.max(0,1-xx-yy)*.8;
   let red=5+bg*20,green=10+bg*15,blue=32+bg*42;
   const dx=(x-cx)/xr,dy=(y-cy)/yr;
   if(Math.abs(dx)<1.55&&Math.abs(dy)<1.65){
    const r=Math.hypot(dx,dy);
    const ring=Math.max(0,1-Math.abs(r-1)/.036);
    const halo=Math.max(0,1-Math.abs(r-1)/.29);
    const hue=(dx+1)/2;
    red+=ring*(90+hue*140)+halo*12;
    green+=ring*(190-hue*110)+halo*10;
    blue+=ring*205+halo*35;
    let min=10;
    for(const [ax,ay,bx,by] of edges)
     min=Math.min(min,distance(dx,dy,ax,ay,bx,by));
    const line=Math.max(0,1-min/.05),aura=Math.max(0,1-min/.18);
    red+=line*(45+hue*210)+aura*19;
    green+=line*(235-hue*90)+aura*15;
    blue+=line*210+aura*24;
   }
   const offset=base+1+x*3;
   raw[offset]=clamp(red);raw[offset+1]=clamp(green);raw[offset+2]=clamp(blue);
  }
 }
 function writePixel(x,y,r,g,b){
  if(x<0||x>=width||y<0||y>=height)return;
  const i=y*stride+1+x*3;raw[i]=r;raw[i+1]=g;raw[i+2]=b;
 }
 function writeText(label,centerY,scale,from=[240,245,255],to=from){
  const text=label.toUpperCase();
  const charW=6*scale,totalWidth=(text.length*6-1)*scale;
  const beginX=Math.round((width-totalWidth)/2),beginY=Math.round(centerY-3.5*scale);
  for(let n=0;n<text.length;n++){
   const letter=glyphs[text[n]]||glyphs[' '];
   const mix=n/Math.max(1,text.length-1);
   const color=from.map((a,i)=>clamp(a+(to[i]-a)*mix));
   for(let line=0;line<7;line++)for(let pos=0;pos<5;pos++){
    if(letter[line][pos]!=='1')continue;
    const left=beginX+(n*6+pos)*scale,top=beginY+line*scale;
    for(let py=0;py<scale;py++)for(let px=0;px<scale;px++)writePixel(left+px,top+py,...color);
   }
  }
 }
 const large=Math.max(5,Math.round(side/155));
 const small=Math.max(3,Math.round(side/255));
 writeText('MARKETHUB AI',height*.646,large,[94,227,255],[242,109,238]);
 writeText('NEXUS - PULSE',height*.72,small,[163,184,233],[210,160,231]);
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);
 ihdr[8]=8;ihdr[9]=2; // RGB truecolor
 return Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  pngChunk('IHDR',ihdr),
  pngChunk('IDAT',deflateSync(raw,{level:9})),
  pngChunk('IEND',Buffer.alloc(0))
 ]);
}
export function launchPresets(){
 const items=[];
 for(const spec of IOS_LAUNCH_SIZES){
  items.push({...spec,width:spec.w*spec.dpr,height:spec.h*spec.dpr,orientation:'portrait'});
  if(spec.w>=744)items.push({...spec,width:spec.h*spec.dpr,height:spec.w*spec.dpr,orientation:'landscape'});
 }
 return items;
}
export async function generateLaunchImages(directory=resolve('public','ios-launch')){
 await mkdir(directory,{recursive:true});
 const items=launchPresets();
 for(const {width,height} of items)await writeFile(resolve(directory,'launch-'+width+'x'+height+'.png'),makeLaunchPNG(width,height));
 return items.length;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const count=await generateLaunchImages();
 console.log('Generadas '+count+' pantallas de arranque iOS. Los originales no se modifican.');
}
