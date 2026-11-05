// MarketHub AI · Estudio creativo realmente editable (storyboard local).
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=x=>Array.isArray(x)?x.filter(z=>z&&typeof z==='object'):[];
const navigate=(label,page,cls='live-outline')=>'<button type="button" class="'+cls+'" data-page="'+page+'">'+label+'</button>';
const act=(label,id,cls='live-outline',props='')=>'<button type="button" class="'+cls+'" data-action="'+id+'" '+props+'>'+label+'</button>';
const panel=(title,rest,children,klass='')=>'<section class="live-panel '+klass+'"><div class="live-panel-heading"><h2>'+title+'</h2>'+(rest||'')+'</div>'+children+'</section>';
export const STUDIO_THEMES=['Neón','Violeta','Océano','Lima'];
export function createScene(title='Nuevo lanzamiento'){
 return {id:Date.now()+'-'+Math.random().toString(36).slice(2,7),title,caption:'Presenta tu producto o servicio',duration:5,theme:'Neón'};
}
export function parseScene(values){
 const title=String(values.title??'').trim().slice(0,90);
 const caption=String(values.caption??'').trim().slice(0,180);
 const duration=Number(values.duration);
 const theme=String(values.theme??'Neón');
 if(!title)return {error:'Escribe un título para la escena.'};
 if(!Number.isFinite(duration)||duration<1||duration>60)return {error:'La duración debe estar entre 1 y 60 segundos.'};
 if(!STUDIO_THEMES.includes(theme))return {error:'Elige un estilo válido.'};
 return {value:{title,caption,duration,theme}};
}
function option(name,selected){return '<option value="'+name+'"'+(selected===name?' selected':'')+'>'+name+'</option>'}
export function liveStudio({scenes=[],current=0,format='9:16',mode='Video / Reels',posts=[]}={}){
 const frames=list(scenes);
 const index=Math.max(0,Math.min(frames.length-1,Number(current)||0)),chosen=frames[index];
 const theme=STUDIO_THEMES.includes(chosen?.theme)?chosen.theme:'Neón';
 const duration=frames.reduce((s,f)=>s+Math.max(1,Number(f.duration)||1),0);
 const kinds=['Video / Reels','Imagen','Diseño','Texto / Copy','Voz IA','Ideas','Plantillas'];
 const menu=kinds.map((x,i)=>'<button type="button" class="live-studio-switch'+(mode===x?' selected':'')+'" data-mode="'+x+'">'+
 ['▷','▧','✦','T','♫','✧','▤'][i]+' '+x+'</button>').join('');
 const tools=[
  ['✂ Editar duración','studio-focus-duration'],['T Editar texto','studio-focus-title'],
  ['✧ Cambiar colores','studio-theme'],['▤ Alternar formato','format'],
  ['▣ Duplicar escena','storyboard-duplicate'],['↑ Reordenar','storyboard-move-left'],
  ['↧ Exportar proyecto','storyboard-export']
 ].map(([name,id])=>act(name,id,'live-studio-switch')).join('');
 const editor='<div class="live-editor-canvas '+(format==='9:16'?'portrait':'landscape')+' live-style-'+
 ['Neón','Violeta','Océano','Lima'].indexOf(theme)+'">'+
 '<div class="live-orbit" aria-hidden="true"></div><span class="live-editor-corner">MarketHub <b>AI</b> · PROYECTO LOCAL</span>'+
 '<div class="live-editor-text"><span>✦</span><h3>'+esc(chosen?.title||'Crea tu primera escena')+'</h3>'+
 '<p>'+esc(chosen?.caption||'Un storyboard editable para tu próximo lanzamiento')+'</p></div>'+
 '<div class="live-editor-bottom">▲ NEXUS × PULSE</div></div>';
 const transport='<div class="live-editor-transport">'+act('◀','storyboard-prev','live-outline','aria-label="Escena anterior"')+
 '<span>'+ (frames.length?index+1:0)+' / '+frames.length+' · '+duration+' s</span>'+
 act('▶','storyboard-next','live-outline','aria-label="Siguiente escena"')+
 act('9:16 / 16:9','format','live-outline')+act('⬇ Exportar PNG','storyboard-export-png','live-primary')+'</div>';
 const ai=['Generar guion con IA','Crear copies con IA','Subtítulos automáticos','Eliminación de silencios',
  'Voz en off realista','Redimensionar vídeo'].map(t=>act(esc(t)+' <span>›</span>','studio-unavailable','live-studio-switch')).join('');
 const recommendation='<div class="live-studio-reco"><strong>'+ (chosen?.title?.length>=15?'Texto bien definido':'Añade más detalles')+'</strong>'+
 '<p>Comprobación local de tu proyecto</p></div><ul class="live-studio-reco-list">'+
 ['Formato: '+format,'Escenas: '+frames.length,'Duración: '+duration+' segundos',chosen?.title?'Título editable':'Añade un título'].map(x=>'<li>✓ '+esc(x)+'</li>').join('')+'</ul>'+
 navigate('Crear PNG en diseñador','diseño','live-primary');
 const form='<form class="live-scene-form" id="storyboardForm">'+
 '<label for="live-scene-title">Título de escena</label>'+
 '<input class="input" id="live-scene-title" name="title" maxlength="90" required value="'+esc(chosen?.title||'')+'">'+
 '<label for="live-scene-caption">Descripción</label>'+
 '<textarea class="input" id="live-scene-caption" rows="2" name="caption" maxlength="180">'+esc(chosen?.caption||'')+'</textarea>'+
 '<div class="live-scene-pair"><div><label for="live-scene-duration">Duración (s)</label>'+
 '<input class="input" id="live-scene-duration" type="number" name="duration" min="1" max="60" required value="'+esc(chosen?.duration||5)+'"></div>'+
 '<div><label for="live-scene-theme">Paleta de colores</label><select class="input" name="theme" id="live-scene-theme">'+
 STUDIO_THEMES.map(x=>option(x,theme)).join('')+'</select></div></div>'+
 '<button class="live-primary" type="submit"'+(!chosen?' disabled':'')+'>Guardar cambios</button></form>';
 const clips='<div class="live-timeline-track">'+(frames.length?frames.map((scene,i)=>
  '<button type="button" class="live-timeline-clip'+(index===i?' selected':'')+'" data-action="storyboard-select" data-index="'+i+'">'+
  '<span>▤ Escena '+(i+1)+'</span><b>'+esc(scene.title||'Sin título')+'</b><small>'+esc(scene.duration)+' s</small></button>').join(''):
  '<p class="live-empty">Añade una escena y aparecerá aquí.</p>')+'</div>';
 const timeline='<div class="live-timeline-head"><strong>Línea de tiempo · Edición local</strong><span>'+duration+' segundos</span></div>'+
 '<div class="live-timeline-scroll">'+clips+'</div><div class="live-timeline-actions">'+
 act('＋ Añadir','storyboard-add','live-primary')+
 act('← Mover','storyboard-move-left')+act('Mover →','storyboard-move-right')+
 act('Duplicar','storyboard-duplicate')+act('Eliminar','storyboard-remove')+'</div>';
 return '<div class="live-studio"><div class="live-heading"><div><span class="live-eyebrow">BOCETO 02 · NEXUS + PULSE</span>'+
 '<h1>▣ Estudio creativo</h1><p>Diseña tu contenido. Aquí los controles y la línea de tiempo son editables.</p></div>'+
 navigate('Abrir diseñador de imágenes','diseño','live-primary')+'</div>'+
 '<div class="live-studio-grid">'+panel('Crear contenido','',menu,'live-studio-menu')+
 panel('Herramientas de edición','',tools,'live-studio-tools')+
 panel('▣ Vista previa','<span class="live-tag">'+format+'</span>',
 '<div class="live-preview-surface">'+editor+'</div>'+transport,'live-studio-preview')+
 panel('✦ IA creativa <small>PRÓXIMAMENTE</small>','',
 '<p class="live-muted">Las herramientas de IA externas requieren integración y autorización.</p>'+ai,'live-studio-ia')+
 panel('◎ Recomendaciones','',recommendation,'live-studio-recommend')+'</div>'+
 '<div class="live-studio-work">'+panel('✎ Propiedades de la escena','',form,'live-studio-properties')+
 panel('▤ Línea de tiempo',act('Exportar JSON','storyboard-export'),timeline,'live-studio-timeline')+'</div>'+
 '<div class="live-studio-lower">'+panel('▧ Contenido guardado',navigate('Biblioteca','biblioteca'),
 '<strong class="live-number">'+list(posts).length+'</strong><p class="live-muted">Publicaciones locales.</p>')+
 panel('✦ Edición de imagen real',navigate('Diseñador PNG','diseño'),
 '<p class="live-muted">Puedes editar fotografías, textos y colores en el diseñador PNG. El storyboard actual se exporta como JSON: aún no renderiza vídeo.</p>')+'</div></div>';
}
