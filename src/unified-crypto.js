// Copias integrales cifradas: AES-256-GCM por bloques + PBKDF2-SHA256.
// Datos binarios locales: sin red, sin guardar la contraseña ni cifrado falso.
// Nonce único por bloque: prefijo aleatorio de 64 bits + contador de 32 bits.
// El encabezado, su tamaño y el orden de bloques están autenticados como AAD.
export const SECURE_UNIFIED_MAGIC='MHUBSEC1';
export const SECURE_UNIFIED_EXTENSION='.mhubsecure';
export const SECURE_UNIFIED_KDF_ROUNDS=310000;
export const SECURE_UNIFIED_CHUNK_BYTES=1024*1024;
export const SECURE_UNIFIED_HEADER_BYTES=52;
export const SECURE_UNIFIED_MAX_PLAINTEXT=245*1024*1024;
export const SECURE_UNIFIED_MAX_CIPHERTEXT=SECURE_UNIFIED_MAX_PLAINTEXT+
  SECURE_UNIFIED_HEADER_BYTES+16*Math.ceil(SECURE_UNIFIED_MAX_PLAINTEXT/SECURE_UNIFIED_CHUNK_BYTES);
const encoder=new TextEncoder();
const TAG_SIZE=16;
const fail=message=>new Error(message);
function getCrypto(override){
 const c=override||globalThis.crypto;
 if(!c?.subtle||typeof c.getRandomValues!=='function')throw fail('Cifrado no disponible: utiliza HTTPS y un navegador compatible');
 return c;
}
export function secureUnifiedSupported(impl=globalThis.crypto){
 return !!impl?.subtle&&typeof impl.getRandomValues==='function';
}
function checkPassword(password){
 if(typeof password!=='string'||password.length<12||password.length>256)
  throw fail('La contraseña debe contener entre 12 y 256 caracteres');
 return password;
}
async function derive(c,password,salt,rounds){
 const keyMaterial=await c.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
 return c.subtle.deriveKey({name:'PBKDF2',salt,iterations:rounds,hash:'SHA-256'},
  keyMaterial,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
function nonce(prefix,index){
 const value=new Uint8Array(12);value.set(prefix);
 new DataView(value.buffer).setUint32(8,index,false);
 return value;
}
function aad(header,index){
 const bytes=new Uint8Array(header.length+4);bytes.set(header);
 new DataView(bytes.buffer).setUint32(header.length,index,false);
 return bytes;
}
function writeHeader(c,length){
 const chunks=Math.ceil(length/SECURE_UNIFIED_CHUNK_BYTES),header=new Uint8Array(SECURE_UNIFIED_HEADER_BYTES);
 header.set(encoder.encode(SECURE_UNIFIED_MAGIC));
 const v=new DataView(header.buffer);
 header[8]=1;header[9]=1; // formato 1, AES-256-GCM
 v.setUint32(12,SECURE_UNIFIED_KDF_ROUNDS,true);
 v.setUint32(16,SECURE_UNIFIED_CHUNK_BYTES,true);
 v.setUint32(20,length,true);
 v.setUint32(24,chunks,true);
 header.set(c.getRandomValues(new Uint8Array(16)),28);
 header.set(c.getRandomValues(new Uint8Array(8)),44);
 return header;
}
function parseHeader(bytes,fileSize){
 if(bytes.length!==SECURE_UNIFIED_HEADER_BYTES||fileSize>SECURE_UNIFIED_MAX_CIPHERTEXT)
  throw fail('Copia integral cifrada demasiado grande o incompleta');
 if(new TextDecoder().decode(bytes.subarray(0,8))!==SECURE_UNIFIED_MAGIC||
   bytes[8]!==1||bytes[9]!==1||bytes[10]!==0||bytes[11]!==0)
  throw fail('Formato de copia integral cifrada desconocido');
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const rounds=v.getUint32(12,true),chunk=v.getUint32(16,true),
  original=v.getUint32(20,true),chunks=v.getUint32(24,true);
 if(rounds!==SECURE_UNIFIED_KDF_ROUNDS||chunk!==SECURE_UNIFIED_CHUNK_BYTES||
    original<100||original>SECURE_UNIFIED_MAX_PLAINTEXT||
    chunks!==Math.ceil(original/SECURE_UNIFIED_CHUNK_BYTES)||
    fileSize!==SECURE_UNIFIED_HEADER_BYTES+original+TAG_SIZE*chunks)
  throw fail('La copia integral cifrada tiene cabeceras o tamaños inválidos');
 return {salt:bytes.subarray(28,44),prefix:bytes.subarray(44,52),original,chunks};
}
export async function encryptUnifiedBlob(plain,password,{cryptoImpl}={}){
 checkPassword(password);
 if(!(plain instanceof Blob)||plain.size<100||plain.size>SECURE_UNIFIED_MAX_PLAINTEXT)
  throw fail('Selecciona una copia integral ZIP de hasta 245 MB');
 const c=getCrypto(cryptoImpl),header=writeHeader(c,plain.size);
 const key=await derive(c,password,header.subarray(28,44),SECURE_UNIFIED_KDF_ROUNDS);
 const out=[header],prefix=header.subarray(44,52),chunks=Math.ceil(plain.size/SECURE_UNIFIED_CHUNK_BYTES);
 for(let i=0;i<chunks;i++){
  const start=i*SECURE_UNIFIED_CHUNK_BYTES,end=Math.min(plain.size,start+SECURE_UNIFIED_CHUNK_BYTES);
  const part=await plain.slice(start,end).arrayBuffer();
  const enc=await c.subtle.encrypt({name:'AES-GCM',iv:nonce(prefix,i),
    additionalData:aad(header,i),tagLength:128},key,part);
  out.push(enc);
 }
 return new Blob(out,{type:'application/octet-stream'});
}
export async function decryptUnifiedBlob(file,password,{cryptoImpl}={}){
 checkPassword(password);
 if(!(file instanceof Blob)||file.size<SECURE_UNIFIED_HEADER_BYTES+100+TAG_SIZE||
    file.size>SECURE_UNIFIED_MAX_CIPHERTEXT)throw fail('Copia integral cifrada inválida o demasiado grande');
 const c=getCrypto(cryptoImpl),header=new Uint8Array(await file.slice(0,SECURE_UNIFIED_HEADER_BYTES).arrayBuffer());
 const info=parseHeader(header,file.size);
 const key=await derive(c,password,info.salt,SECURE_UNIFIED_KDF_ROUNDS);
 const decrypted=[];let pos=SECURE_UNIFIED_HEADER_BYTES;
 for(let i=0;i<info.chunks;i++){
  const size=Math.min(SECURE_UNIFIED_CHUNK_BYTES,info.original-i*SECURE_UNIFIED_CHUNK_BYTES)+TAG_SIZE;
  const block=await file.slice(pos,pos+size).arrayBuffer();
  let plain;
  try{
   plain=await c.subtle.decrypt({name:'AES-GCM',iv:nonce(info.prefix,i),
    additionalData:aad(header,i),tagLength:128},key,block);
  }catch{
   throw fail('Contraseña incorrecta o copia integral alterada');
  }
  decrypted.push(plain);pos+=size;
 }
 if(pos!==file.size)throw fail('Copia integral incompleta');
 return new Blob(decrypted,{type:'application/zip'});
}
