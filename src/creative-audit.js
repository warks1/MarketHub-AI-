// AUDITOR VISUAL PULSE · revisiones geométricas reales, sin datos de red.
// Estas comprobaciones NO certifican requisitos editoriales ni accesibilidad.
export function auditCreative({sourceWidth,sourceHeight,targetWidth,targetHeight,caption='',mask='completa',safezone='off'}={}){
 const fields=[sourceWidth,sourceHeight,targetWidth,targetHeight];
 if(fields.some(n=>!Number.isFinite(n)||n<=0||n>50000))throw Error('Introduce dimensiones de imagen válidas');
 const factor=Math.max(targetWidth/sourceWidth,targetHeight/sourceHeight);
 const retained=Math.min(1,(targetWidth/factor)*(targetHeight/factor)/(sourceWidth*sourceHeight));
 const upsample=factor>1.25;
 const text=String(caption).trim(),characters=[...text].length;
 const findings=[];
 const add=(pass,label,detail,penalty=0)=>findings.push({pass,label,detail,penalty:pass?0:penalty});
 add(retained>=.72,'Área visible de fotografía',retained>=.72?'El encuadre mantiene una parte amplia de la fotografía.':'El recorte centrado conserva aproximadamente '+Math.round(retained*100)+' % del área original.',22);
 add(!upsample,'Resolución para exportación',upsample?'La imagen necesita ampliarse '+factor.toFixed(1)+' veces; puede perder nitidez.':'No se requiere una ampliación importante.',17);
 add(characters<=58,'Texto legible y conciso',characters<=58?'Longitud de texto apropiada para una creatividad breve.':'El texto contiene '+characters+' caracteres: podría ocupar demasiado espacio en móvil.',15);
 add(!text||safezone==='on','Guías SafeFrame',!text?'No se ha superpuesto texto.':safezone==='on'?'La guía de márgenes está activada.':'Activa SafeFrame PULSE para colocar el texto lejos de las zonas de interfaz.',12);
 add(!['estrella','triangulo','diamante','corazon'].includes(mask),'Recorte decorativo',
  ['estrella','triangulo','diamante','corazon'].includes(mask)?'Esta máscara puede ocultar detalles cerca de los bordes. Comprueba la vista previa.':'La geometría seleccionada es relativamente amplia.',8);
 return {score:Math.max(0,100-findings.reduce((total,x)=>total+x.penalty,0)),retainedRatio:retained,upscaleFactor:factor,findings};
}
