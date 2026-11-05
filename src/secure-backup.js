// MarketHub AI · copias de seguridad cifradas por contraseña en el dispositivo.
// AES-256-GCM + PBKDF2-SHA256, sal e IV aleatorios por archivo.
// La contraseña NO se guarda ni se envía; no existe recuperación si se pierde.
export const ENCRYPTED_BACKUP_FORMAT='markethub-ai-encrypted-backup';
export const BACKUP_KDF_ITERATIONS=250000;
export const MAX_ENCRYPTED_BACKUP_SIZE=5*1024*1024;
const encoder=new TextEncoder(),decoder=new TextDecoder();
const safeCrypto=impl=>{
 const c=impl||globalThis.crypto;
 if(!c?.subtle||typeof c.getRandomValues!=='function')
  throw Error('Tu navegador requiere HTTPS y Web Crypto para cifrar copias de seguridad.');
 return c;
};
function toBase64(bytes){
 let out='';
 for(let i=0;i<bytes.length;i+=8192)out+=String.fromCharCode(...bytes.slice(i,i+8192));
 return btoa(out);
}
function fromBase64(value,limit){
 if(typeof value!=='string'||value.length>Math.ceil(limit*4/3)+10||!/^[A-Za-z0-9+/]+={0,2}$/.test(value))
  throw Error('El archivo cifrado contiene campos inválidos.');
 try{
  const binary=atob(value);
  if(binary.length>limit)throw Error('Archivo cifrado demasiado grande.');
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
 }catch(error){throw Error('No se ha podido leer el archivo cifrado.')}
}
const secret=password=>{
 if(typeof password!=='string'||password.length<12||password.length>256)
  throw Error('Escribe una contraseña de 12 a 256 caracteres.');
 return password;
};
async function deriveKey(password,salt,cryptoImpl){
 const material=await cryptoImpl.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
 return cryptoImpl.subtle.deriveKey(
  {name:'PBKDF2',salt,iterations:BACKUP_KDF_ITERATIONS,hash:'SHA-256'},material,
  {name:'AES-GCM',length:256},false,['encrypt','decrypt']
 );
}
export function encryptedBackupsAvailable(impl=globalThis.crypto){return !!impl?.subtle&&typeof impl.getRandomValues==='function'}
export async function encryptBackupJSON(payload,password,{cryptoImpl}={}){
 secret(password);
 const c=safeCrypto(cryptoImpl);
 const plaintext=encoder.encode(JSON.stringify(payload));
 if(plaintext.byteLength>3*1024*1024)throw Error('Copia demasiado grande para cifrar (máximo 3 MB).');
 const salt=c.getRandomValues(new Uint8Array(16)),iv=c.getRandomValues(new Uint8Array(12));
 const key=await deriveKey(password,salt,c);
 const encrypted=new Uint8Array(await c.subtle.encrypt({name:'AES-GCM',iv},key,plaintext));
 return {
  format:ENCRYPTED_BACKUP_FORMAT,
  version:1,
  cipher:'AES-256-GCM',
  kdf:'PBKDF2-SHA256',
  iterations:BACKUP_KDF_ITERATIONS,
  salt:toBase64(salt),
  iv:toBase64(iv),
  ciphertext:toBase64(encrypted),
  exportedAt:new Date().toISOString()
 };
}
export async function decryptBackupJSON(envelope,password,{cryptoImpl}={}){
 secret(password);
 const c=safeCrypto(cryptoImpl);
 if(!envelope||typeof envelope!=='object'||Array.isArray(envelope)||
    envelope.format!==ENCRYPTED_BACKUP_FORMAT||envelope.version!==1||
    envelope.cipher!=='AES-256-GCM'||envelope.kdf!=='PBKDF2-SHA256'||
    envelope.iterations!==BACKUP_KDF_ITERATIONS)
  throw Error('El archivo no es una copia cifrada compatible de MarketHub AI.');
 const salt=fromBase64(envelope.salt,16),iv=fromBase64(envelope.iv,12);
 const cipher=fromBase64(envelope.ciphertext,MAX_ENCRYPTED_BACKUP_SIZE);
 if(salt.length!==16||iv.length!==12||cipher.length<17)throw Error('La copia cifrada está incompleta.');
 const key=await deriveKey(password,salt,c);
 let output;
 try{output=await c.subtle.decrypt({name:'AES-GCM',iv},key,cipher)}
 catch{throw Error('Contraseña incorrecta o archivo cifrado alterado.')}
 try{return JSON.parse(decoder.decode(output))}
 catch{throw Error('Los datos recuperados no tienen un formato JSON válido.')}
}
