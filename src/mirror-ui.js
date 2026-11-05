// MarketHub AI · FIDELIDAD VISUAL: capas de interacción sobre los JPEG originales
// aprobados. No se recalculan ni se recolorean los píxeles de los bocetos.
// La interfaz real de edición permanece accesible a través de las zonas activas.
const IMAGE_W=1448,IMAGE_H=1086;
const SRC={
 inicio:'./assets/boceto-01-inicio-original.jpeg',
 estudio:'./assets/boceto-02-estudio-original.jpeg',
 movil:'./assets/boceto-03-movil-original.jpeg'
};
const NAV=[
 ['inicio','Inicio',184,37],
 ['estudio','Estudio IA',224,37],
 ['diseño','Crear diseño',265,37],
 ['crear','Programar contenido',305,37],
 ['campanas','Campañas',344,37],
 ['analitica','Analítica',382,37],
 ['escucha','Social Listening',423,37],
 ['bandeja','Bandeja',462,37],
 ['competencia','Competencia',496,37],
 ['automatizaciones','Automatizaciones',534,37],
 ['biblioteca','Biblioteca',571,37],
 ['ajustes','Ajustes',609,37]
];
const pct=(n,total)=>(100*n/total).toFixed(5)+'%';
const clean=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function desktopHit(label,page,x,y,w,h,action=false){
 return '<button class="mirror-hit" type="button" '+
 (action?'data-action="'+page+'"':'data-page="'+page+'"')+
 ' aria-label="'+clean(label)+'" title="'+clean(label)+'" style="left:'+pct(x,IMAGE_W)+';top:'+pct(y,IMAGE_H)+';width:'+pct(w,IMAGE_W)+';height:'+pct(h,IMAGE_H)+'"></button>';
}
function desktopHits(page){
 const all=NAV.map(([route,label,y,height])=>desktopHit('Abrir '+label,route,26,y,180,height));
 if(page==='inicio'){
  all.push(
   desktopHit('Ver analítica', 'analitica',226,251,1150,113),
   desktopHit('Abrir rendimiento por plataforma','analitica',226,375,450,261),
   desktopHit('Abrir calendario y programar','crear',685,376,405,260),
   desktopHit('Explorar asistente y herramientas','herramientas',1100,375,278,348),
   desktopHit('Ver próximos contenidos','crear',228,648,310,207),
   desktopHit('Administrar campañas','campanas',546,648,285,207),
   desktopHit('Ver Social Listening','escucha',839,648,249,207),
   desktopHit('Ver bandeja unificada','bandeja',225,865,420,113),
   desktopHit('Gestionar plataformas','ajustes',651,865,726,113),
   desktopHit('Explorar herramientas de IA','herramientas',40,825,172,37),
   desktopHit('Entrar a los controles editables del panel principal','mirror-live',466,990,486,64,true)
  );
 }else{
  all.push(
   desktopHit('Abrir estudio creativo funcional','mirror-live',551,261,409,310,true),
   desktopHit('Editar contenido en diseñador','diseño',230,237,150,327),
   desktopHit('Abrir herramientas de edición','mirror-live',388,237,156,327,true),
   desktopHit('Abrir herramientas de IA','herramientas',975,232,162,333),
   desktopHit('Abrir Growth Lab','laboratorio',1144,234,236,364),
   desktopHit('Abrir editor funcional y línea de tiempo','mirror-live',229,577,902,192,true),
   desktopHit('Abrir plantillas y diseñador','diseño',228,902,1148,71),
   desktopHit('Explorar herramientas de IA','herramientas',32,823,177,43)
  );
 }
 return all.join('');
}
// Coordenadas exactas del interior de los tres móviles del boceto 03.
// Los recortes son CSS: el archivo JPEG original no se modifica.
const CROPS={
 inicio:{x:229,y:179,w:271,h:728},
 estudio:{x:559,y:154,w:300,h:760}
};
function mobileHit(label,page,x,y,w,h,crop,action=false){
 const left=(x-crop.x)*100/crop.w,top=(y-crop.y)*100/crop.h;
 return '<button class="mirror-hit" type="button" '+(action?'data-action="'+page+'"':'data-page="'+page+'"')+
 ' aria-label="'+clean(label)+'" title="'+clean(label)+'" style="left:'+left.toFixed(5)+'%;top:'+top.toFixed(5)+'%;width:'+(100*w/crop.w).toFixed(5)+'%;height:'+(100*h/crop.h).toFixed(5)+'%"></button>';
}
function mobileHits(page){
 const home=page==='inicio',crop=CROPS[page];
 const controls=[];
 if(home){
  controls.push(
   mobileHit('Abrir menú de módulos','mirror-menu',236,206,34,37,crop,true),
   mobileHit('Ver datos de analítica','analitica',236,318,262,260,crop),
   mobileHit('Ver próximas publicaciones','crear',236,591,262,92,crop),
   mobileHit('Abrir herramientas de IA','herramientas',236,688,262,58,crop),
   mobileHit('Crear contenido','estudio',239,778,57,59,crop),
   mobileHit('Planificar contenido','crear',302,778,57,59,crop),
   mobileHit('Publicar: abrir planificador local','crear',368,778,62,59,crop),
   mobileHit('Abrir analítica','analitica',443,778,55,59,crop),
   mobileHit('Inicio','inicio',237,851,48,54,crop),
   mobileHit('Crear','estudio',289,851,48,54,crop),
   mobileHit('Planificar','crear',343,851,52,54,crop),
   mobileHit('Bandeja','bandeja',399,851,49,54,crop),
   mobileHit('Más herramientas','mirror-menu',454,851,46,54,crop,true)
  );
 }else{
  controls.push(
   mobileHit('Abrir menú de módulos','mirror-menu',555,192,37,43,crop,true),
   mobileHit('Entrar al editor creativo funcional','mirror-live',551,268,305,34,crop,true),
   mobileHit('Abrir diseñador de imagen','diseño',554,320,304,276,crop),
   mobileHit('Abrir editor de contenido','mirror-live',553,619,303,166,crop,true),
   mobileHit('Crear con herramientas locales','diseño',552,791,304,53,crop),
   mobileHit('Inicio','inicio',558,856,52,51,crop),
   mobileHit('Crear','estudio',614,856,59,51,crop),
   mobileHit('Planificar','crear',680,856,52,51,crop),
   mobileHit('Bandeja','bandeja',740,856,53,51,crop),
   mobileHit('Más herramientas','mirror-menu',798,856,55,51,crop,true)
  );
 }
 return controls.join('');
}
function mobileImage(page){
 const crop=CROPS[page];
 const imgWidth=(IMAGE_W/crop.w*100).toFixed(5);
 const left=(-crop.x/crop.w*100).toFixed(5);
 const top=(-crop.y/crop.h*100).toFixed(5);
 return '<div class="mirror-mobile-frame mirror-mobile-'+page+'" style="aspect-ratio:'+crop.w+'/'+crop.h+'">'+
 '<img class="mirror-mobile-original" src="'+SRC.movil+'" width="'+IMAGE_W+'" height="'+IMAGE_H+'" '+
 'alt="Imagen original del diseño móvil seleccionado, recortada para mostrar una pantalla" '+
 'style="width:'+imgWidth+'%;left:'+left+'%;top:'+top+'%" draggable="false" fetchpriority="high">'+
 mobileHits(page)+'</div>';
}
function fixedMobileNav(page){
 const crop=page==='inicio'?{x:229,y:839,w:271,h:83}:{x:559,y:841,w:300,h:84};
 const imgWidth=(IMAGE_W/crop.w*100).toFixed(5);
 const left=(-crop.x/crop.w*100).toFixed(5);
 const top=(-crop.y/crop.h*100).toFixed(5);
 const base=page==='inicio'?[
  ['Inicio','inicio',237,852,48],['Crear','estudio',290,852,49],
  ['Planificar','crear',343,852,53],['Bandeja','bandeja',398,852,51],
  ['Más herramientas','mirror-menu',451,852,48,true]
 ]:[
  ['Inicio','inicio',558,853,52],['Crear','estudio',614,853,59],
  ['Planificar','crear',680,853,52],['Bandeja','bandeja',739,853,54],
  ['Más herramientas','mirror-menu',796,853,56,true]
 ];
 const hits=base.map(([label,route,x,y,w,action])=>mobileHit(label,route,x,y,w,55,crop,Boolean(action))).join('');
 return '<nav class="mirror-mobile-fixednav" aria-label="Navegación principal móvil" style="aspect-ratio:'+crop.w+'/'+crop.h+'">'+
 '<img class="mirror-fixednav-original" src="'+SRC.movil+'" width="'+IMAGE_W+'" height="'+IMAGE_H+'" draggable="false" alt="" '+
 'style="width:'+imgWidth+'%;left:'+left+'%;top:'+top+'%">'+hits+'</nav>';
}
const MENU=[
 ['inicio','Inicio'],['estudio','Estudio IA'],['diseño','Crear y diseñar'],['crear','Planificar publicaciones'],
 ['campanas','Campañas'],['analitica','Analítica'],['escucha','Social Listening'],['bandeja','Bandeja'],
 ['automatizaciones','Automatizaciones'],['competencia','Competencia'],['biblioteca','Biblioteca'],
 ['oficina','Oficina de marketing'],['laboratorio','Growth Lab'],['herramientas','Todas las herramientas'],
 ['planes','FREE / PRO'],['ajustes','Ajustes']
];
function menuHTML(){
 return '<div class="mirror-menu-backdrop"><div class="mirror-menu-panel" role="dialog" aria-modal="true" aria-label="Todos los módulos">'+
 '<div class="mirror-menu-heading"><strong>MarketHub AI · Módulos</strong>'+
 '<button type="button" data-action="mirror-close-menu" aria-label="Cerrar menú">✕</button></div>'+
 '<nav class="mirror-menu-list" aria-label="Herramientas disponibles">'+MENU.map(([id,label])=>
 '<button type="button" data-page="'+id+'">'+clean(label)+'</button>').join('')+
 '</nav><button class="mirror-menu-native" type="button" data-action="mirror-live">Abrir controles editables del panel</button></div></div>';
}
export function mirrorLayer(page,{menu=false}={}){
 if(!['inicio','estudio'].includes(page))return '';
 const src=SRC[page];
 return '<div class="mirror-overlay" role="region" aria-label="Interfaz original de MarketHub AI">'+
 '<main class="mirror-stage" aria-label="'+(page==='inicio'?'Pantalla principal':'Estudio creativo')+'">'+
 '<div class="mirror-desktop-view"><div class="mirror-desktop-board">'+
 '<img class="mirror-desktop-original" src="'+src+'" width="1448" height="1086" alt="Diseño original aprobado de MarketHub AI. Los indicadores de la imagen son ilustrativos." draggable="false" fetchpriority="high">'+
 desktopHits(page)+'</div></div>'+
 '<div class="mirror-mobile-view">'+mobileImage(page)+fixedMobileNav(page)+'</div>'+
 '</main>'+
 '<p class="mirror-a11y-note">La apariencia reproduce el archivo original aprobado. Las cifras e indicadores incrustados en la imagen son ejemplos, no conexiones activas. Toca los módulos para abrir las herramientas funcionales.</p>'+
 (menu?menuHTML():'')+
 '</div>';
}
