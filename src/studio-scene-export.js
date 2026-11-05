// Exportación de imagen auténtica desde el storyboard local.
// No envía contenido a servidores ni afirma que exporta vídeo.
const PALETTES={
 'Neón':['#071536','#14dffe','#ed31dd'],
 'Violeta':['#120f40','#8b41ff','#f451ca'],
 'Océano':['#062342','#12e5f5','#347bdb'],
 'Lima':['#0f2c38','#a0fa46','#31d6ba']
};
export function sceneDimensions(format){return format==='16:9'?[1920,1080]:[1080,1920]}
function wrap(ctx,text,maxWidth,maxLines=5){
 const words=String(text??'').split(/\s+/).filter(Boolean),lines=[];let line='';
 for(const word of words){
  const next=line?line+' '+word:word;
  if(line&&ctx.measureText(next).width>maxWidth){lines.push(line);line=word}else line=next;
  if(lines.length>=maxLines)break;
 }
 if(line&&lines.length<maxLines)lines.push(line);
 return lines;
}
export function drawScene(ctx,scene={},format='9:16'){
 const [w,h]=sceneDimensions(format);
 const colors=PALETTES[scene.theme]||PALETTES.Neón;
 ctx.clearRect(0,0,w,h);
 const bg=ctx.createLinearGradient(0,0,w,h);
 bg.addColorStop(0,colors[0]);bg.addColorStop(.53,'#19114b');bg.addColorStop(1,colors[2]);
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 const circles=[
  [w*.12,h*.22,w*.64,colors[1]],
  [w*.87,h*.72,w*.6,colors[2]]
 ];
 for(const [x,y,r,color] of circles){
  const halo=ctx.createRadialGradient(x,y,0,x,y,r);
  halo.addColorStop(0,color+'88');halo.addColorStop(1,color+'00');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 }
 ctx.strokeStyle=colors[1];ctx.lineWidth=Math.max(6,w*.008);ctx.globalAlpha=.8;
 ctx.beginPath();ctx.ellipse(w*.55,h*.57,w*.42,h*.22,-.27,0,Math.PI*2);ctx.stroke();
 ctx.strokeStyle=colors[2];ctx.lineWidth=Math.max(6,w*.007);ctx.beginPath();ctx.ellipse(w*.5,h*.52,w*.46,h*.2,.28,0,Math.PI*2);ctx.stroke();
 ctx.globalAlpha=1;
 const titleSize=Math.round(Math.min(w*.07,h*.065));
 ctx.font='800 '+titleSize+'px system-ui,sans-serif';
 ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.shadowColor=colors[2];ctx.shadowBlur=18;ctx.fillStyle='#ffffff';
 const titles=wrap(ctx,String(scene.title||'Nuevo contenido').slice(0,90),w*.82,4);
 const capSize=Math.round(Math.min(w*.038,h*.034));
 ctx.font='500 '+capSize+'px system-ui,sans-serif';
 const caps=wrap(ctx,String(scene.caption||'').slice(0,180),w*.78,4);
 const total=titles.length*titleSize*1.25+caps.length*capSize*1.4+28;
 let y=(h-total)/2;
 ctx.font='800 '+titleSize+'px system-ui,sans-serif';
 for(const t of titles){ctx.fillText(t,w/2,y+titleSize/2);y+=titleSize*1.25}
 y+=35;ctx.shadowBlur=0;ctx.font='500 '+capSize+'px system-ui,sans-serif';ctx.fillStyle='#f1eafc';
 for(const t of caps){ctx.fillText(t,w/2,y+capSize/2);y+=capSize*1.4}
 ctx.textAlign='left';ctx.fillStyle='#b7ebff';ctx.font='700 '+Math.round(w*.026)+'px system-ui,sans-serif';
 ctx.fillText('MarketHub AI',w*.075,h*.07);
 ctx.font='700 '+Math.round(w*.016)+'px system-ui,sans-serif';
 ctx.fillText('NEXUS × PULSE',w*.075,h*.94);
}
export async function downloadScenePNG(scene,format){
 if(!scene)throw Error('Añade una escena antes de exportar.');
 const [w,h]=sceneDimensions(format);
 const canvas=document.createElement('canvas');
 canvas.width=w;canvas.height=h;
 const context=canvas.getContext('2d');
 if(!context)throw Error('No se pudo iniciar el editor gráfico.');
 drawScene(context,scene,format);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('No se pudo convertir el diseño a PNG.')),'image/png'));
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='markethub-escena-'+new Date().toISOString().slice(0,10)+'.png';
 document.body.append(link);link.click();link.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 return {width:w,height:h,bytes:blob.size};
}
