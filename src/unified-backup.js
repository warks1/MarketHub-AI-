// MarketHub AI · respaldo UNIFICADO offline, sin sobrescribir datos existentes.
// Archivo ZIP sin compresión. Los materiales originales quedan dentro; NO está cifrado.
import {listCreativeProjects,openCreativeProject,validateCreativeProject,importCreativeProjectBatch,
 removeCreativeProjectsBatch,MAX_PROJECTS,MAX_PROJECT_TOTAL_BYTES,MAX_PROJECT_IMAGE_BYTES} from './creative-projects.js';
import {listVaultAssets,getVaultAsset,validateVaultAsset,saveVaultAssetsBatch,
 removeVaultAssetsBatch,VAULT_MAX_ITEMS,VAULT_MAX_BYTES} from './media-vault.js';
import {readBrandProfiles,normalizeBrandProfile,mergeBrandProfilesBatch,MAX_BRANDS} from './brand-dna.js';
import {readBackup,validateBackup,backupModuleKeys} from './backup.js';
import {crc32} from './project-portfolio.js';

const TE=new TextEncoder(),TD=new TextDecoder('utf-8',{fatal:true});
const BK='markethub-brand-dna-v1';
export const UNIFIED_FORMAT='markethub-unified-local-backup';
export const MAX_UNIFIED_BYTES=245*1024*1024;
const EXT={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'};
const RENAME=/^(manifest\.json|brands\.json|workspace\.json|projects\/\d{3}\.(png|jpg|webp|gif)|media\/\d{3}\.bin)$/;
const set16=(v,p,n)=>v.setUint16(p,n,true),set32=(v,p,n)=>v.setUint32(p,n>>>0,true);
const get16=(v,p)=>v.getUint16(p,true),get32=(v,p)=>v.getUint32(p,true);
function zip(items){
 const chunks=[],dirs=[];let offset=0,total=0,dirLen=0;
 for(const {name,bytes} of items){
  const label=TE.encode(name);
  if(!RENAME.test(name)||label.length>120||!(bytes instanceof Uint8Array)||bytes.length>50*1024*1024)
   throw Error('Elemento de respaldo inválido');
  total+=bytes.length;
  if(total>MAX_UNIFIED_BYTES-100000)throw Error('El respaldo completo supera el tamaño seguro (245 MB)');
  const hash=crc32(bytes),local=new Uint8Array(30+label.length),lv=new DataView(local.buffer);
  set32(lv,0,0x04034b50);set16(lv,4,20);set16(lv,6,0x0800);
  set32(lv,14,hash);set32(lv,18,bytes.length);set32(lv,22,bytes.length);set16(lv,26,label.length);
  local.set(label,30);
  const dir=new Uint8Array(46+label.length),dv=new DataView(dir.buffer);
  set32(dv,0,0x02014b50);set16(dv,4,20);set16(dv,6,20);set16(dv,8,0x0800);
  set32(dv,16,hash);set32(dv,20,bytes.length);set32(dv,24,bytes.length);
  set16(dv,28,label.length);set32(dv,42,offset);dir.set(label,46);
  chunks.push(local,bytes);dirs.push(dir);offset+=local.length+bytes.length;dirLen+=dir.length;
 }
 const end=new Uint8Array(22),dv=new DataView(end.buffer);
 set32(dv,0,0x06054b50);set16(dv,8,items.length);set16(dv,10,items.length);
 set32(dv,12,dirLen);set32(dv,16,offset);
 const blob=new Blob([...chunks,...dirs,end],{type:'application/zip'});
 if(blob.size>MAX_UNIFIED_BYTES)throw Error('El respaldo completo supera 245 MB');
 return blob;
}
function unzip(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
 if(bytes.length<100||bytes.length>MAX_UNIFIED_BYTES)throw Error('ZIP de respaldo vacío o superior a 245 MB');
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),end=bytes.length-22;
 if(get32(v,end)!==0x06054b50||get16(v,end+20)!==0||get16(v,end+4)!==0||
    get16(v,end+6)!==0)throw Error('Formato ZIP incompatible o incompleto');
 const count=get16(v,end+10),offset=get32(v,end+16),length=get32(v,end+12);
 if(count<3||count>MAX_PROJECTS+VAULT_MAX_ITEMS+3||count!==get16(v,end+8)||
    offset+length!==end)throw Error('Directorio ZIP incorrecto');
 const found=new Map();let pos=offset,used=0;
 for(let i=0;i<count;i++){
  if(pos+46>end||get32(v,pos)!==0x02014b50)throw Error('Cabecera central ZIP incorrecta');
  const flags=get16(v,pos+8),method=get16(v,pos+10);
  const size=get32(v,pos+24),stored=get32(v,pos+20),hash=get32(v,pos+16);
  const n=get16(v,pos+28),ex=get16(v,pos+30),co=get16(v,pos+32),start=get32(v,pos+42);
  const next=pos+46+n+ex+co;
  if(flags!==0x0800||method!==0||size!==stored||n<1||n>120||next>end)
   throw Error('ZIP cifrado, comprimido o incompatible');
  const name=TD.decode(bytes.subarray(pos+46,pos+46+n));
  if(!RENAME.test(name)||found.has(name))throw Error('ZIP contiene nombres no permitidos o duplicados');
  const max=name==='manifest.json'?128*1024:name==='workspace.json'?12*1024*1024:
    name==='brands.json'?32*1024:name.startsWith('projects/')?MAX_PROJECT_IMAGE_BYTES:50*1024*1024;
  if(size>max)throw Error('Un archivo de la copia supera su límite');
  used+=size;if(used>MAX_UNIFIED_BYTES)throw Error('Contenido demasiado grande');
  if(start+30>offset||get32(v,start)!==0x04034b50||get16(v,start+6)!==flags||
     get16(v,start+8)!==0||get32(v,start+14)!==hash||get32(v,start+18)!==size||
     get32(v,start+22)!==size)throw Error('ZIP tiene cabeceras inconsistentes');
  const ln=get16(v,start+26),extra=get16(v,start+28),begin=start+30+ln+extra;
  if(begin+size>offset||TD.decode(bytes.subarray(start+30,start+30+ln))!==name)
   throw Error('Archivo del ZIP incompleto');
  const payload=bytes.subarray(begin,begin+size);
  if(crc32(payload)!==hash)throw Error('ZIP dañado: CRC incorrecto');
  found.set(name,payload);
  pos=next;
 }
 if(pos!==end)throw Error('El ZIP contiene registros inesperados');
 return found;
}
const json=x=>TE.encode(JSON.stringify(x));
const readJson=(files,name,max)=>{
 const value=files.get(name);
 if(!value||value.byteLength>max)throw Error('Falta el archivo '+name);
 try{return JSON.parse(TD.decode(value))}catch{throw Error('Datos JSON dañados en '+name)}
};
export async function createUnifiedArchive({projects=[],assets=[],brands=[],workspace=null}={}){
 if(!Array.isArray(projects)||projects.length>MAX_PROJECTS||
    !Array.isArray(assets)||assets.length>VAULT_MAX_ITEMS||
    !Array.isArray(brands)||brands.length>MAX_BRANDS)throw Error('Número de elementos de copia inválido');
 const normalizedBrands=brands.map(normalizeBrandProfile),brandIds=new Set(normalizedBrands.map(x=>x.id));
 if(brandIds.size!==normalizedBrands.length)throw Error('El respaldo contiene marcas duplicadas');
 if(workspace&&Object.keys(workspace.modules||{}).length)validateBackup(workspace);
 const manifest={format:UNIFIED_FORMAT,version:1,createdAt:new Date().toISOString(),projects:[],assets:[]},parts=[];
 let projectBytes=0,assetBytes=0;
 for(let i=0;i<projects.length;i++){
  const item=projects[i],valid=validateCreativeProject(item);
  const bytes=new Uint8Array(await item.file.arrayBuffer());
  projectBytes+=bytes.length;
  if(projectBytes>MAX_PROJECT_TOTAL_BYTES)throw Error('Los proyectos superan 80 MB');
  const source='projects/'+String(i+1).padStart(3,'0')+'.'+EXT[valid.type];
  manifest.projects.push({name:valid.name,type:valid.type,size:valid.size,source,checksum:crc32(bytes),settings:valid.settings});
  parts.push({name:source,bytes});
 }
 for(let i=0;i<assets.length;i++){
  const item=assets[i],valid=validateVaultAsset(item),bytes=new Uint8Array(await item.blob.arrayBuffer());
  assetBytes+=bytes.length;
  if(assetBytes>VAULT_MAX_BYTES)throw Error('La biblioteca supera 150 MB');
  const source='media/'+String(i+1).padStart(3,'0')+'.bin';
  manifest.assets.push({name:valid.name,type:valid.type,size:valid.size,source,checksum:crc32(bytes)});
  parts.push({name:source,bytes});
 }
 return zip([{name:'manifest.json',bytes:json(manifest)},{name:'brands.json',bytes:json(normalizedBrands)},
  {name:'workspace.json',bytes:json(workspace||null)},...parts]);
}
export async function exportUnifiedBackup(){
 const projectRefs=await listCreativeProjects(),assetRefs=await listVaultAssets();
 const [projects,assets]=await Promise.all([
  Promise.all(projectRefs.map(item=>openCreativeProject(item.id))),
  Promise.all(assetRefs.map(item=>getVaultAsset(item.id)))
 ]);
 const stored=readBackup(),workspace=Object.keys(stored.modules).length?stored:null;
 return createUnifiedArchive({projects,assets,brands:readBrandProfiles(),workspace});
}
export function parseUnifiedArchive(input){
 const files=unzip(input),manifest=readJson(files,'manifest.json',128*1024);
 if(!manifest||manifest.format!==UNIFIED_FORMAT||manifest.version!==1||
    !Array.isArray(manifest.projects)||!Array.isArray(manifest.assets)||
    manifest.projects.length>MAX_PROJECTS||manifest.assets.length>VAULT_MAX_ITEMS)
  throw Error('La copia no corresponde a MarketHub AI o tiene versión incompatible');
 const brands=readJson(files,'brands.json',32*1024);
 if(!Array.isArray(brands)||brands.length>MAX_BRANDS)throw Error('Las marcas del respaldo tienen formato inválido');
 const validBrands=brands.map(normalizeBrandProfile);
 if(new Set(validBrands.map(p=>p.id)).size!==validBrands.length)throw Error('Marcas duplicadas en respaldo');
 const workspace=readJson(files,'workspace.json',12*1024*1024);
 const validatedWorkspace=workspace===null?null:validateBackup(workspace);
 const seen=new Set(['manifest.json','brands.json','workspace.json']),projects=[],assets=[];
 let projectSize=0,assetSize=0;
 for(const [kind,list] of [['projects',manifest.projects],['media',manifest.assets]]){
  for(const item of list){
   if(!item||typeof item!=='object'||!Number.isInteger(item.size)||item.size<=0||
      !Number.isInteger(item.checksum)||item.checksum<0||item.checksum>0xffffffff||
      typeof item.source!=='string'||seen.has(item.source)||
      !new RegExp('^'+(kind==='projects'?'projects/\\d{3}\\.(png|jpg|webp|gif)':'media/\\d{3}\\.bin')+'$').test(item.source))
    throw Error('Referencia de archivo inválida o duplicada en el respaldo');
   seen.add(item.source);
   const bytes=files.get(item.source);
   if(!bytes||bytes.length!==item.size||crc32(bytes)!==item.checksum)
    throw Error('Archivo multimedia ausente o dañado');
   if(kind==='projects'){
    projectSize+=bytes.length;if(projectSize>MAX_PROJECT_TOTAL_BYTES)throw Error('Los proyectos superan 80 MB');
    if(EXT[item.type]!==item.source.split('.').at(-1))throw Error('Extensión de imagen incompatible');
    const file=new Blob([bytes],{type:item.type});
    const valid=validateCreativeProject({name:item.name,file,settings:item.settings});
    projects.push({...valid,file});
   }else{
    assetSize+=bytes.length;if(assetSize>VAULT_MAX_BYTES)throw Error('Biblioteca mayor de 150 MB');
    const blob=new Blob([bytes],{type:item.type});
    const valid=validateVaultAsset({name:item.name,blob});
    assets.push({...valid,blob});
   }
  }
 }
 if(seen.size!==files.size)throw Error('El ZIP tiene archivos inesperados');
 return {projects,assets,brands:validBrands,workspace:validatedWorkspace};
}
export async function restoreUnifiedBackup(blob){
 if(!(blob instanceof Blob)||blob.size<100||blob.size>MAX_UNIFIED_BYTES)
  throw Error('Selecciona una copia .mhubfull de hasta 245 MB');
 // Validación completa ANTES de guardar; nunca sustituye registros existentes.
 const data=parseUnifiedArchive(await blob.arrayBuffer());
 const [existingProjects,existingAssets]=await Promise.all([listCreativeProjects(),listVaultAssets()]);
 if(existingProjects.length+data.projects.length>MAX_PROJECTS||
    existingProjects.reduce((a,x)=>a+x.size,0)+data.projects.reduce((a,x)=>a+x.size,0)>MAX_PROJECT_TOTAL_BYTES)
  throw Error('No hay capacidad para sumar todos los proyectos sin eliminar los actuales');
 if(existingAssets.length+data.assets.length>VAULT_MAX_ITEMS||
    existingAssets.reduce((a,x)=>a+x.size,0)+data.assets.reduce((a,x)=>a+x.size,0)>VAULT_MAX_BYTES)
  throw Error('No hay capacidad para sumar la biblioteca multimedia sin eliminar archivos');
 const existingBrands=readBrandProfiles(),brandIds=new Set(existingBrands.map(p=>p.id));
 if(existingBrands.length+data.brands.filter(p=>!brandIds.has(p.id)).length>MAX_BRANDS)
  throw Error('No hay espacio para fusionar todas las marcas');
 const workspaceAdds=Object.entries(data.workspace||{}).filter(([key])=>backupModuleKeys.includes(key)&&localStorage.getItem(key)===null);
 // validateBackup devuelve módulos serializados, no un objeto con .modules.
 const brandBefore=localStorage.getItem(BK),projectsBefore=[],assetsBefore=[],localAdded=[];
 let brandsChanged=false;
 try{
  if(data.projects.length)projectsBefore.push(...await importCreativeProjectBatch(data.projects));
  if(data.assets.length)assetsBefore.push(...await saveVaultAssetsBatch(data.assets));
  if(data.brands.length){brandsChanged=true;mergeBrandProfilesBatch(data.brands)}
  for(const [key,value] of workspaceAdds){localStorage.setItem(key,value);localAdded.push(key)}
  return {projects:projectsBefore.length,assets:assetsBefore.length,
   brands:data.brands.filter(p=>!brandIds.has(p.id)).length,modules:localAdded.length};
 }catch(error){
  const failures=[];
  for(const key of localAdded){try{localStorage.removeItem(key)}catch(e){failures.push('datos de '+key)}}
  if(brandsChanged){try{if(brandBefore===null)localStorage.removeItem(BK);else localStorage.setItem(BK,brandBefore)}catch{failures.push('marcas')}}
  if(assetsBefore.length)try{await removeVaultAssetsBatch(assetsBefore)}catch{failures.push('biblioteca')}
  if(projectsBefore.length)try{await removeCreativeProjectsBatch(projectsBefore)}catch{failures.push('proyectos')}
  throw Error('No se completó la restauración: '+String(error.message||error)+
   (failures.length?' · Revisa '+failures.join(', ')+'; no se pudo revertir todo.':' · Se han revertido los cambios añadidos.'));
 }
}

/** Controles de la copia integral, junto a las copias cifradas ya existentes. */
export function unifiedBackupSettingsHTML(){
 return '<div class="card"><div class="card-head"><h2>📦 Copia integral de MarketHub AI</h2><span class="tag">Local · ZIP</span></div>'+
 '<p>Una copia conjunta de: proyectos editables e imágenes fuente, Mi biblioteca multimedia, perfiles ADN de Marca y los cuatro módulos locales de publicaciones/Oficina/Visual/Growth Lab.</p>'+
 '<div class="workspace-actions"><button class="primary" type="button" data-action="unified-backup-export">Descargar copia integral (.mhubfull)</button>'+
 '<label class="secondary" for="unifiedBackupImport" style="cursor:pointer">Restaurar copia integral</label>'+
 '<input id="unifiedBackupImport" data-unified-backup-import type="file" accept=".mhubfull,application/zip" aria-label="Importar copia integral de MarketHub AI" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden"></div>'+
 '<p class="tiny muted">La restauración añade proyectos, archivos y marcas sin reemplazar los que ya tengas. Los datos de Oficina y otros módulos locales existentes también se conservan; solo se recuperan módulos que falten. Si no hay capacidad suficiente, se cancela antes de importar. El archivo no incluye servicios externos ni datos de otras apps.</p>'+
 '<div class="notice" style="margin-top:12px"><strong>Privacidad:</strong> esta copia contiene fotografías y documentos originales, no está cifrada ni se sube a Internet. Guarda el archivo de forma privada. Puede alcanzar 245 MB y necesitar memoria libre; no sustituye a la copia JSON cifrada disponible arriba. La reversión entre varias bases de datos se intenta si falla una restauración, pero no es una transacción única ante cortes inesperados.</div></div>';
}
