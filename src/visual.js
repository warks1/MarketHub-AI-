// MarketHub AI · Diseñador gráfico local. Crea PNG en el dispositivo, sin IA ni API externa.
const STORAGE='markethub-ai-visual-v1';
const defaults={format:'4:5',headline:'TU PRÓXIMO GRAN LANZAMIENTO',subtitle:'Convierte tus ideas en contenido que destaca.',button:'DESCÚBRELO',brand:'MARKETHUB AI',style:'Neón',primary:'#14d9f2',accent:'#f83fbf'};
let draft={...defaults},photo=null,photoName='';
try{const s=JSON.parse(localStorage.getItem(STORAGE)||'null');if(s&&typeof s==='object'&&!Array.isArray(s))for(const k of Object.keys(defaults))if(typeof s[k]==='string')draft[k]=s[k].slice(0,250)}catch{}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validHex=v=>/^#[\da-fA-F]{6}$/.test(String(v))?String(v):'#14d9f2';
const validFormats={'9:16':[1080,1920],'4:5':[1080,1350],'1:1':[1080,1080],'16:9':[1920,1080]};
export const dimensions=fmt=>validFormats[fmt]||validFormats['4:5'];
const persist=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(draft))}catch{}};
function item(label,id,type='text',max=140){
 const value=esc(draft[id]);
 return '<div class="form-field"><label for="visual-'+id+'">'+label+'</label><input class="input" id="visual-'+id+'" data-visual-field="'+id+'" type="'+type+'" '+(type==='text'?'maxlength="'+max+'"':'')+' value="'+value+'"></div>';
}
function selectItem(label,id,values){
 return '<div class="form-field"><label for="visual-'+id+'">'+label+'</label><select class="input" data-visual-field="'+id+'" id="visual-'+id+'">'+values.map(v=>'<option '+(v===draft[id]?'selected':'')+'>'+v+'</option>').join('')+'</select></div>';
}
export function visualPage(){
 const [w,h]=dimensions(draft.format);
 return '<div class="page-head"><div><span class="eyebrow">NEXUS × PULSE · HERRAMIENTA LOCAL</span><h1>Diseñador de publicaciones ✦</h1><p>Diseña una imagen y expórtala en PNG. Funciona de verdad en tu dispositivo.</p></div><span class="demo-pill">Sin IA externa</span></div>'+
 '<div class="notice" style="margin-bottom:15px">Este módulo crea y exporta diseños gráficos sencillos. No es todavía un editor profesional por capas ni genera imágenes mediante IA. La foto de fondo, si añades una, solo se conserva durante esta sesión.</div>'+
 '<div class="visual-layout"><section class="card"><div class="card-head"><h2>Personalizar diseño</h2><span class="tag green">Editor local</span></div>'+
 '<div class="visual-presets">'+[['Lanzamiento','launch'],['Oferta','sale'],['Evento','event']].map(([n,k])=>'<button class="secondary small-btn" data-visual-action="preset" data-value="'+k+'">'+n+'</button>').join('')+'</div>'+
 item('Nombre de marca','brand','text',45)+item('Título principal','headline','text',100)+
 '<div class="form-field"><label for="visual-subtitle">Descripción</label><textarea class="input" id="visual-subtitle" rows="3" data-visual-field="subtitle" maxlength="220">'+esc(draft.subtitle)+'</textarea></div>'+
 item('Llamada a la acción','button','text',45)+
 selectItem('Formato','format',['9:16','4:5','1:1','16:9'])+selectItem('Estilo','style',['Neón','Minimalista','Oscuro premium'])+
 '<div class="visual-color-row">'+item('Color principal','primary','color')+item('Color secundario','accent','color')+'</div>'+
 '<div class="form-field"><label for="visual-photo">Foto de fondo (opcional, max. 8 MB)</label><input class="input" id="visual-photo" type="file" accept="image/*" data-visual-file="photo"></div><div class="tiny muted" id="visual-photo-name">'+esc(photoName||'Sin foto: se utilizará un fondo gráfico propio')+'</div>'+
 '<div class="visual-buttons">'+
 '<button type="button" class="primary" data-visual-action="download">Descargar imagen PNG</button>'+
 '<button type="button" class="secondary" data-visual-action="draft">Guardar texto como borrador</button>'+
 '<button type="button" class="secondary" data-visual-action="reset">Restablecer diseño</button></div></section>'+
 '<section class="card visual-preview-card"><div class="card-head"><h2>Vista previa real</h2><span id="visual-dimensions" class="tag">'+w+' × '+h+' px</span></div>'+
 '<div class="visual-frame"><canvas id="visual-canvas" width="'+w+'" height="'+h+'" role="img" aria-label="Imagen de marketing editable para redes sociales" aria-describedby="visual-canvas-help">Este navegador no admite Canvas.</canvas></div>'+
 '<p class="tiny muted" id="visual-canvas-help" style="margin-top:12px">El archivo PNG se genera en resolución '+w+' × '+h+' px. Revisa el texto, las licencias de cualquier fotografía y la configuración antes de publicar.</p>'+
 '</section></div>';
}
function wrap(ctx,text,maxWidth,maxLines){
 const words=String(text).split(/\s+/).filter(Boolean),lines=[];let line='';
 for(const word of words){
  const candidate=line?line+' '+word:word;
  if(ctx.measureText(candidate).width<=maxWidth){line=candidate;continue}
  if(line){lines.push(line);line=''}
  if(ctx.measureText(word).width<=maxWidth)line=word;
  else{
   let chunk='';
   for(const char of word){
    if(ctx.measureText(chunk+char).width>maxWidth&&chunk){lines.push(chunk);chunk=char}else chunk+=char;
    if(lines.length>=maxLines)return lines.slice(0,maxLines);
   }
   line=chunk;
  }
  if(lines.length>=maxLines)return lines.slice(0,maxLines);
 }
 if(line&&lines.length<maxLines)lines.push(line);
 return lines;
}
export function drawVisual(canvas){
 if(!canvas||typeof canvas.getContext!=='function')return false;
 const [w,h]=dimensions(draft.format);
 canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');
 if(!ctx)return false;
 const primary=validHex(draft.primary),accent=validHex(draft.accent);
 const grad=ctx.createLinearGradient(0,0,w,h);
 const minimal=draft.style==='Minimalista',premium=draft.style==='Oscuro premium';
 if(minimal){grad.addColorStop(0,'#f9fcff');grad.addColorStop(1,'#e7eafa')}
 else if(premium){grad.addColorStop(0,'#080d22');grad.addColorStop(.6,'#191033');grad.addColorStop(1,'#101932')}
 else {grad.addColorStop(0,'#091b3d');grad.addColorStop(.5,'#27144c');grad.addColorStop(1,'#060e2c')}
 ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 if(photo){
  const ratio=Math.max(w/photo.width,h/photo.height),srcW=photo.width*ratio,srcH=photo.height*ratio;
  ctx.save();ctx.globalAlpha=.48;ctx.drawImage(photo,(w-srcW)/2,(h-srcH)/2,srcW,srcH);ctx.restore();
  const dark=ctx.createLinearGradient(0,0,0,h);dark.addColorStop(0,'#05091a35');dark.addColorStop(1,'#020714dd');ctx.fillStyle=dark;ctx.fillRect(0,0,w,h);
 }
 // Soft radial gradients and rings produce an original abstract visual, with no external imagery.
 if(!minimal){
  ctx.save();ctx.globalAlpha=premium?.55:.8;ctx.filter='blur('+Math.round(w*.08)+'px)';
  for(const [x,y,r,c] of [[w*.15,h*.18,w*.38,primary],[w*.82,h*.69,w*.4,accent],[w*.76,h*.06,w*.18,primary]]){
   ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();
  }ctx.restore();
  ctx.save();ctx.translate(w*.68,h*.35);ctx.rotate(-.43);ctx.strokeStyle=primary;ctx.lineWidth=Math.max(5,w*.006);
  for(let i=0;i<3;i++){ctx.globalAlpha=.6-i*.14;ctx.beginPath();ctx.ellipse(0,0,w*(.31+i*.05),h*(.15+i*.01),0,0,2*Math.PI);ctx.stroke()}ctx.restore();
 }
 const ink=minimal?'#1b2244':'#ffffff',secondary=minimal?'#3b4664':'#e0e9ff';
 const margin=w*.075;
 const brandSize=Math.round(w*.034),headlineSize=Math.round(w*(draft.format==='16:9'?.065:.084));
 ctx.textBaseline='top';ctx.fillStyle=ink;ctx.font='800 '+brandSize+'px system-ui,Arial,sans-serif';
 ctx.fillText(String(draft.brand||'TU MARCA').toLocaleUpperCase('es').slice(0,45),margin,h*.095);
 ctx.fillStyle=primary;ctx.fillRect(margin,h*.075,w*.11,Math.max(7,w*.01));
 const limit=draft.format==='16:9'?4:5;
 ctx.font='800 '+headlineSize+'px system-ui,Arial,sans-serif';
 const lines=wrap(ctx,draft.headline||'TU PRÓXIMO LANZAMIENTO',w-margin*2,limit);
 const headlineTop=h*(draft.format==='16:9'?.36:.39);
 const step=headlineSize*1.15;
 ctx.save();ctx.fillStyle=ink;
 if(!minimal){ctx.shadowColor='#060b26';ctx.shadowBlur=21}
 lines.forEach((line,i)=>ctx.fillText(line,margin,headlineTop+i*step,w-margin*2));ctx.restore();
 const subStart=Math.min(headlineTop+lines.length*step+headlineSize*.35,h*.75);
 const bodySize=Math.round(w*(draft.format==='16:9'?.026:.036));
 ctx.font='500 '+bodySize+'px system-ui,Arial,sans-serif';ctx.fillStyle=secondary;
 wrap(ctx,draft.subtitle||'Descubre más',w-margin*2,3).forEach((line,i)=>ctx.fillText(line,margin,subStart+i*bodySize*1.44,w-margin*2));
 const buttonTop=Math.min(h*.89,subStart+bodySize*3.1);
 const buttonFont=Math.round(w*.027),padX=w*.032,buttonHeight=buttonFont*2.35;
 ctx.font='800 '+buttonFont+'px system-ui,Arial,sans-serif';
 const label=String(draft.button||'DESCÚBRELO').toLocaleUpperCase('es').slice(0,45);
 const labelWidth=Math.min(ctx.measureText(label).width,w-margin*2-padX*2);
 ctx.fillStyle=primary;ctx.beginPath();ctx.roundRect(margin,buttonTop,labelWidth+padX*2,buttonHeight,buttonHeight*.25);ctx.fill();
 ctx.fillStyle='#07142f';ctx.fillText(label,margin+padX,buttonTop+buttonFont*.6,labelWidth);
 ctx.fillStyle=minimal?'#425276':'#b6ccf4';ctx.font='600 '+Math.round(w*.018)+'px system-ui,Arial,sans-serif';
 ctx.fillText('CREADO CON MARKETHUB AI · DISEÑO LOCAL',margin,h*.966,w-margin*2);
 return true;
}
export function visualMount(){
 const canvas=document.getElementById('visual-canvas');
 if(canvas)drawVisual(canvas);
}
const onFormField=target=>{
 const key=target.dataset.visualField;
 if(!(key in defaults))return false;
 let value=String(target.value||'');
 if(key==='primary'||key==='accent')value=validHex(value);
 if(key==='format'&&!validFormats[value])return true;
 if(key==='style'&&!['Neón','Minimalista','Oscuro premium'].includes(value))return true;
 draft[key]=value.slice(0,key==='subtitle'?220:key==='headline'?100:70);
 persist();visualMount();
 const dim=document.getElementById('visual-dimensions'),help=document.getElementById('visual-canvas-help');
 if(dim&&key==='format'){const [w,h]=dimensions(draft.format);dim.textContent=w+' × '+h+' px';if(help)help.textContent='El archivo PNG se genera en resolución '+w+' × '+h+' px. Revisa tus textos antes de publicar.'}
 return true;
};
export function visualInput(target){if(!target?.dataset?.visualField)return false;return onFormField(target)}
export function visualFile(target,ctx){
 if(target?.dataset?.visualFile!=='photo')return false;
 const file=target.files?.[0];
 if(!file){photo=null;photoName='';visualMount();return true}
 if(!file.type.startsWith('image/')||file.size>8*1024*1024){ctx.toast('Elige una imagen de hasta 8 MB.');target.value='';return true}
 const url=URL.createObjectURL(file),image=new Image();
 image.onload=()=>{photo=image;photoName=file.name.slice(0,80);const label=document.getElementById('visual-photo-name');if(label)label.textContent='Foto de sesión: '+photoName;visualMount();URL.revokeObjectURL(url);ctx.toast('Imagen añadida solo a esta sesión.');};
 image.onerror=()=>{URL.revokeObjectURL(url);ctx.toast('No se pudo abrir esta imagen.')};
 image.src=url;return true;
}
export function visualClick(target,ctx){
 const action=target?.dataset?.visualAction;if(!action)return false;
 if(action==='preset'){
  const presets={
   launch:{headline:'NUEVO LANZAMIENTO',subtitle:'Una nueva forma de crear, conectar y crecer.',button:'DESCÚBRELO'},
   sale:{headline:'OFERTA ESPECIAL',subtitle:'Una oportunidad para disfrutar de lo que te gusta.',button:'VER OFERTA'},
   event:{headline:'NO TE LO PIERDAS',subtitle:'Te esperamos en nuestro próximo evento.',button:'RESERVA TU SITIO'}
  };draft={...draft,...(presets[target.dataset.value]||presets.launch)};persist();ctx.refresh();return true;
 }
 if(action==='reset'){
  if(!window.confirm('¿Restablecer este diseño? Se perderán los cambios del editor.'))return true;
  draft={...defaults};photo=null;photoName='';persist();ctx.refresh();return true;
 }
 if(action==='draft'){
  const text=[draft.headline,draft.subtitle,draft.button].filter(Boolean).join('\n');
  ctx.newPost(text.slice(0,240));return true;
 }
 if(action==='download'){
  const canvas=document.getElementById('visual-canvas');
  if(!canvas){ctx.toast('La vista previa no está disponible.');return true}
  try{
   canvas.toBlob(blob=>{
    if(!blob){ctx.toast('No se ha podido exportar PNG.');return}
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='markethub-diseno-'+draft.format.replace(':','x')+'.png';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),700);ctx.toast('Imagen PNG generada. Comprueba la descarga en tu dispositivo.');
   },'image/png');
  }catch{ctx.toast('Este dispositivo no permite la exportación desde Canvas.')}
  return true;
 }
 return false;
}
