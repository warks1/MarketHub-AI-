// MarketHub AI · copia de TODOS los proyectos de Media Forge en ZIP portable.
// Sin red, sin sincronización y sin reemplazar proyectos ya existentes.
import {listCreativeProjects,openCreativeProject,importCreativeProjectBatch,validateCreativeProject,
 MAX_PROJECTS,MAX_PROJECT_IMAGE_BYTES,MAX_PROJECT_TOTAL_BYTES} from './creative-projects.js';
export const PORTFOLIO_FORMAT='markethub-creative-portfolio',PORTFOLIO_VERSION=1;
export const MAX_PORTFOLIO_BYTES=90*1024*1024;
const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
const read16=(dv,pos)=>dv.getUint16(pos,true),read32=(dv,pos)=>dv.getUint32(pos,true);
const write16=(dv,pos,n)=>dv.setUint16(pos,n,true),write32=(dv,pos,n)=>dv.setUint32(pos,n>>>0,true);
const CRC=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let n=0;n<8;n++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0});
export function crc32(bytes){
 let c=0xffffffff;
 for(const b of bytes)c=CRC[(c^b)&255]^(c>>>8);
 return (c^0xffffffff)>>>0;
}
function zipStore(items){
 if(!Array.isArray(items)||items.length<2||items.length>MAX_PROJECTS+1)throw Error('Número de ficheros de respaldo incorrecto');
 const chunks=[],central=[];let offset=0,centralBytes=0,stored=0;
 for(const {name,bytes} of items){
  const filename=enc.encode(name);
  if(!/^(manifest\.json|images\/[0-9]{3}\.(png|jpg|webp|gif))$/.test(name)||filename.length>180||
     !(bytes instanceof Uint8Array)||bytes.length>MAX_PROJECT_IMAGE_BYTES)throw Error('Elemento de copia inválido');
  stored+=bytes.length;if(stored>MAX_PROJECT_TOTAL_BYTES+100000)throw Error('Los proyectos superan el máximo de 80 MB');
  const crc=crc32(bytes),local=new Uint8Array(30+filename.length),lv=new DataView(local.buffer);
  write32(lv,0,0x04034b50);write16(lv,4,20);write16(lv,6,0x0800);write16(lv,8,0);
  write32(lv,14,crc);write32(lv,18,bytes.length);write32(lv,22,bytes.length);
  write16(lv,26,filename.length);local.set(filename,30);
  const dir=new Uint8Array(46+filename.length),dv=new DataView(dir.buffer);
  write32(dv,0,0x02014b50);write16(dv,4,20);write16(dv,6,20);write16(dv,8,0x0800);
  write32(dv,16,crc);write32(dv,20,bytes.length);write32(dv,24,bytes.length);
  write16(dv,28,filename.length);write32(dv,42,offset);dir.set(filename,46);
  chunks.push(local,bytes);central.push(dir);offset+=local.length+bytes.length;centralBytes+=dir.length;
 }
 const end=new Uint8Array(22),view=new DataView(end.buffer);
 write32(view,0,0x06054b50);write16(view,8,items.length);write16(view,10,items.length);
 write32(view,12,centralBytes);write32(view,16,offset);
 return new Blob([...chunks,...central,end],{type:'application/zip'});
}
const extensions={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'};
export async function createCreativePortfolio(projects){
 if(!Array.isArray(projects)||!projects.length)throw Error('No hay proyectos editables que respaldar');
 if(projects.length>MAX_PROJECTS)throw Error('Demasiados proyectos');
 const entries=[],manifest={format:PORTFOLIO_FORMAT,version:PORTFOLIO_VERSION,createdAt:new Date().toISOString(),projects:[]};
 let total=0;
 for(let i=0;i<projects.length;i++){
  const p=projects[i],valid=validateCreativeProject(p);
  const bytes=new Uint8Array(await p.file.arrayBuffer());
  total+=bytes.length;if(total>MAX_PROJECT_TOTAL_BYTES)throw Error('El respaldo supera 80 MB');
  const filename='images/'+String(i+1).padStart(3,'0')+'.'+extensions[valid.type];
  manifest.projects.push({name:valid.name,source:filename,type:valid.type,size:bytes.length,checksum:crc32(bytes),settings:valid.settings});
  entries.push({name:filename,bytes});
 }
 const header=enc.encode(JSON.stringify(manifest));
 if(header.length>65536)throw Error('Metadatos de respaldo demasiado grandes');
 return zipStore([{name:'manifest.json',bytes:header},...entries]);
}
export async function exportCreativePortfolio(){
 const items=await listCreativeProjects();
 return createCreativePortfolio(await Promise.all(items.map(item=>openCreativeProject(item.id))));
}
function parseZip(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.byteLength<100||bytes.byteLength>MAX_PORTFOLIO_BYTES)
  throw Error('El respaldo ZIP está vacío o supera 90 MB');
 const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),length=bytes.length;
 const eocd=length-22;
 if(read32(dv,eocd)!==0x06054b50||read16(dv,eocd+20)!==0||
    read16(dv,eocd+4)!==0||read16(dv,eocd+6)!==0)
  throw Error('El archivo no es un ZIP compatible sin comentarios ni discos múltiples');
 const count=read16(dv,eocd+10),directoryLength=read32(dv,eocd+12),dirStart=read32(dv,eocd+16);
 if(count<2||count>MAX_PROJECTS+1||read16(dv,eocd+8)!==count||
    dirStart+directoryLength!==eocd)throw Error('Directorio ZIP incorrecto');
 const files=new Map();let cursor=dirStart;
 for(let i=0;i<count;i++){
  if(cursor+46>eocd||read32(dv,cursor)!==0x02014b50)throw Error('Cabecera del ZIP incorrecta');
  const method=read16(dv,cursor+10),flags=read16(dv,cursor+8),size=read32(dv,cursor+24);
  const compressed=read32(dv,cursor+20),crc=read32(dv,cursor+16);
  const nameLen=read16(dv,cursor+28),extraLen=read16(dv,cursor+30),commentLen=read16(dv,cursor+32);
  const localOffset=read32(dv,cursor+42),end=cursor+46+nameLen+extraLen+commentLen;
  if(end>eocd||method!==0||flags!==0x0800||size!==compressed||size>MAX_PROJECT_IMAGE_BYTES||
    nameLen<1||nameLen>180)throw Error('ZIP comprimido, cifrado o con entradas no admitidas');
  const filename=dec.decode(bytes.subarray(cursor+46,cursor+46+nameLen));
  if(!/^(manifest\.json|images\/[0-9]{3}\.(png|jpg|webp|gif))$/.test(filename)||files.has(filename))
   throw Error('Nombre duplicado o ruta no permitida en el respaldo');
  if(localOffset+30>dirStart||read32(dv,localOffset)!==0x04034b50||
     read16(dv,localOffset+6)!==flags||read16(dv,localOffset+8)!==0||
     read32(dv,localOffset+14)!==crc||read32(dv,localOffset+18)!==size||
     read32(dv,localOffset+22)!==size)throw Error('Entrada ZIP inconsistente');
  const ln=read16(dv,localOffset+26),le=read16(dv,localOffset+28),dataAt=localOffset+30+ln+le;
  if(dataAt+size>dirStart||dec.decode(bytes.subarray(localOffset+30,localOffset+30+ln))!==filename)
   throw Error('Entrada ZIP truncada o inconsistente');
  const payload=bytes.subarray(dataAt,dataAt+size);
  if(crc32(payload)!==crc)throw Error('La copia de seguridad está dañada: CRC incorrecto');
  files.set(filename,payload);cursor=end;
 }
 if(cursor!==eocd)throw Error('Directorio ZIP contiene datos inesperados');
 return files;
}
export function parseCreativePortfolio(buffer){
 const bytes=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer);
 const files=parseZip(bytes),raw=files.get('manifest.json');
 if(!raw||raw.length>65536)throw Error('Falta el manifiesto del respaldo');
 let manifest;try{manifest=JSON.parse(dec.decode(raw))}catch{throw Error('El manifiesto de copia no es JSON válido')}
 if(!manifest||manifest.format!==PORTFOLIO_FORMAT||manifest.version!==1||
    !Array.isArray(manifest.projects)||manifest.projects.length!==files.size-1||
    manifest.projects.length<1||manifest.projects.length>MAX_PROJECTS)
  throw Error('La copia de seguridad no es de MarketHub AI o tiene una versión incompatible');
 const projects=[],seen=new Set();let total=0;
 for(const p of manifest.projects){
  if(!p||typeof p!=='object'||!/^images\/[0-9]{3}\.(png|jpg|webp|gif)$/.test(p.source)||
     seen.has(p.source)||!extensions[p.type]||p.source.split('.').at(-1)!==extensions[p.type])
   throw Error('Referencia de imagen inválida o duplicada');
  seen.add(p.source);const data=files.get(p.source);
  if(!data||data.length!==p.size||crc32(data)!==p.checksum)throw Error('Imagen faltante o dañada en el respaldo');
  total+=data.length;if(total>MAX_PROJECT_TOTAL_BYTES)throw Error('La copia supera el límite de proyectos');
  const file=new Blob([data],{type:p.type});
  const entry=validateCreativeProject({name:p.name,file,settings:p.settings});
  projects.push({...entry,file});
 }
 return projects;
}
export async function importCreativePortfolio(blob){
 if(!(blob instanceof Blob)||blob.size>MAX_PORTFOLIO_BYTES||blob.size<100)
  throw Error('Archivo de copia no válido o superior a 90 MB');
 // Validar todo el ZIP ANTES de modificar la base. Importación posterior atómica.
 const projects=parseCreativePortfolio(await blob.arrayBuffer());
 const ids=await importCreativeProjectBatch(projects);
 return {count:ids.length};
}
