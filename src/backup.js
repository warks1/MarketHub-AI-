import {isSceneImageData} from './studio-scene-media.js';
import {encryptBackupJSON,decryptBackupJSON,ENCRYPTED_BACKUP_FORMAT,encryptedBackupsAvailable,MAX_ENCRYPTED_BACKUP_SIZE} from './secure-backup.js';
// MarketHub AI — Copia de seguridad local: demo v0.3.
// Operación explícita del usuario, no sube datos ni hace ninguna red.
// Las copias JSON no están cifradas; tratar como información privada.
const keys=[
 'markethub-ai-demo-v1',
 'markethub-ai-office-v1',
 'markethub-ai-visual-v1',
 'markethub-growth-local-v1'
];
const MAX_FILE=3*1024*1024;
const safeObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function scan(value,depth=0,key=''){
 if(depth>12)throw new Error('Estructura demasiado anidada.');
 if(value===null||typeof value==='boolean')return;
 if(typeof value==='string'){if(key==='imageData'&&isSceneImageData(value))return;if(value.length>40000)throw new Error('Texto demasiado largo.');return}
 if(typeof value==='number'){if(!Number.isFinite(value))throw new Error('Número no válido.');return}
 if(Array.isArray(value)){
  if(value.length>4000)throw new Error('Lista demasiado extensa.');
  for(const v of value)scan(v,depth+1,key);
  return;
 }
 if(safeObject(value)){
  const names=Object.keys(value);
  if(names.length>250)throw new Error('Objeto demasiado grande.');
  for(const name of names){
   if(['__proto__','constructor','prototype'].includes(name))throw new Error('Clave no autorizada.');
   scan(value[name],depth+1,name);
  }
  return;
 }
 throw new Error('Tipo de dato no admitido.');
}
export function readBackup(){
 const modules={};
 for(const key of keys){const value=localStorage.getItem(key);if(typeof value==='string'){const parsed=JSON.parse(value);scan(parsed);modules[key]=parsed}}
 return {
  format:'markethub-ai-local-backup',
  version:1,
  exportedAt:new Date().toISOString(),
  scope:'Datos locales sin cifrado; no aptos para información sensible.',
  modules
 };
}
export function validateBackup(raw){
 if(!safeObject(raw)||raw.format!=='markethub-ai-local-backup'||raw.version!==1||!safeObject(raw.modules))
  throw new Error('Archivo de copia no reconocido o versión incompatible.');
 const normalized={};
 for(const key of Object.keys(raw.modules)){
  if(!keys.includes(key))throw new Error('El archivo contiene un módulo desconocido.');
  const value=raw.modules[key];
  if(!safeObject(value))throw new Error('El módulo '+key+' no tiene un formato válido.');
  scan(value);
  const serialized=JSON.stringify(value);
  if(serialized.length>MAX_FILE)throw new Error('Módulo demasiado grande.');
  normalized[key]=serialized;
 }
 if(Object.keys(normalized).length===0)throw new Error('La copia no contiene módulos de MarketHub AI.');
 return normalized;
}
export function backupExport(ctx){
 try{
  const payload=readBackup();
  if(Object.keys(payload.modules).length===0){ctx.toast('No hay contenido local que copiar.');return false}
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='MarketHub-AI-respaldo-local-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),900);
  ctx.toast('Copia local descargada. Guárdala en un lugar privado y seguro.');
  return true;
 }catch(e){ctx.toast('No se pudo exportar: '+String(e.message||e).slice(0,130));return false}
}
export async function backupEncryptedExport(ctx){
 if(!encryptedBackupsAvailable()){ctx.toast('Este navegador no permite cifrar: utiliza HTTPS.');return false}
 try{
  const payload=readBackup();
  if(Object.keys(payload.modules).length===0){ctx.toast('No hay datos para respaldar.');return false}
  const encrypted=await encryptBackupJSON(payload,ctx.password||'');
  const blob=new Blob([JSON.stringify(encrypted)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='MarketHub-AI-copia-CIFRADA-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
  ctx.toast('Copia cifrada descargada. No pierdas la contraseña.');return true;
 }catch(error){ctx.toast('Error al cifrar: '+String(error.message||error).slice(0,145));return false}
}
export async function backupImport(file,ctx){
 if(!file){ctx.toast('Selecciona un archivo JSON.');return false}
 if(typeof file.size!=='number'||file.size<=0||file.size>MAX_ENCRYPTED_BACKUP_SIZE){ctx.toast('Archivo vacío o superior a 5 MB.');return false}
 let modules;
 try{
  const raw=await file.text();
  // Las copias normales mantienen el límite original de 3 MB; solo el
  // envoltorio cifrado firmado por nuestra app puede ocupar hasta 5 MB.
  if(file.size>MAX_FILE&&!/^\s*\{\s*"format"\s*:\s*"markethub-ai-encrypted-backup"/.test(raw.slice(0,256))){
   ctx.toast('La copia sin cifrar supera los 3 MB.');return false
  }
  const parsed=JSON.parse(raw);
  if(parsed?.format===ENCRYPTED_BACKUP_FORMAT){
   if(!ctx.password){ctx.toast('Escribe la contraseña de la copia cifrada antes de restaurarla.');return false}
   modules=validateBackup(await decryptBackupJSON(parsed,ctx.password));
  }else{
   if(file.size>MAX_FILE){ctx.toast('La copia sin cifrar supera los 3 MB.');return false}
   modules=validateBackup(parsed);
  }
 }catch(e){ctx.toast('Copia no válida: '+String(e.message||e).slice(0,125));return false}
 const entries=Object.entries(modules);
 const existing=entries.filter(([key])=>localStorage.getItem(key)!==null).length;
 const warning='Esta copia restaurará '+entries.length+' módulos y sobrescribirá '+existing+' módulos locales existentes. Antes de continuar guarda otra copia si necesitas conservarlos. ¿Confirmas la restauración?';
 if(!window.confirm(warning)){ctx.toast('Restauración cancelada; tus datos no han cambiado.');return false}
 const snapshot=new Map(entries.map(([key])=>[key,localStorage.getItem(key)]));
 try{
  for(const [key,value] of entries)localStorage.setItem(key,value);
 }catch(e){
  for(const [key,previous] of snapshot){try{if(previous===null)localStorage.removeItem(key);else localStorage.setItem(key,previous)}catch{}}
  ctx.toast('Falló el almacenamiento. Se ha intentado restaurar el estado anterior.');
  return false;
 }
 ctx.toast('Copia restaurada. Se actualizará la aplicación.');
 window.location.reload();
 return true;
}
export function backupSettingsHTML(){
 const available=encryptedBackupsAvailable();
 return '<div class="card"><div class="card-head"><h2>🗂 Copia de seguridad y protección</h2><span class="tag">Local · Beta</span></div>'+
 '<div class="notice" style="margin-bottom:13px">Respalda publicaciones, campañas, fotos del storyboard, analítica, mensajes, Oficina, Estudio Visual y Growth Lab. '+
 '<strong>La copia cifrada con contraseña es la opción recomendada.</strong> Se conserva la opción sin cifrar por compatibilidad.</div>'+
 '<div class="form-field"><label for="backupPassword">Contraseña para cifrar o restaurar una copia protegida</label>'+
 '<input class="input" id="backupPassword" type="password" minlength="12" maxlength="256" autocomplete="new-password" placeholder="12 o más caracteres">'+
 '<p class="tiny muted">No se guarda la contraseña. Si la pierdes, la copia no se puede recuperar.</p></div>'+
 '<div class="workspace-actions">'+
 '<button class="primary" type="button" data-action="backup-encrypted-export"'+(available?'':' disabled')+'>🔒 Descargar copia cifrada (.json)</button>'+
 '<button class="secondary" type="button" data-action="backup-export">Descargar copia SIN cifrar</button>'+
 '<label class="secondary" for="localBackupImport" style="cursor:pointer">Restaurar archivo JSON</label>'+
 '<input id="localBackupImport" data-backup-import aria-label="Seleccionar archivo de copia de seguridad" accept="application/json,.json" type="file" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden">'+
 '</div><p class="tiny muted" style="margin-top:12px">AES-256-GCM y PBKDF2-SHA256. Todo se realiza en el dispositivo, sin subir los archivos. Restaurar requiere confirmación y puede sobrescribir datos locales. Límite: 3 MB para copias normales y 5 MB para cifradas.'+
 (available?'':' El cifrado necesita HTTPS y un navegador compatible.')+'</p></div>';
}
export { keys as backupModuleKeys };
