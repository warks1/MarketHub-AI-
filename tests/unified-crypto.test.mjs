import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {encryptUnifiedBlob,decryptUnifiedBlob,secureUnifiedSupported,
 SECURE_UNIFIED_MAGIC,SECURE_UNIFIED_HEADER_BYTES,SECURE_UNIFIED_CHUNK_BYTES,
 SECURE_UNIFIED_MAX_CIPHERTEXT} from '../src/unified-crypto.js';
import {unifiedBackupSettingsHTML} from '../src/unified-backup.js';

const password='Contraseña extensa y única para MarketHub AI 2026!';
const options={cryptoImpl:webcrypto};
test('Copia integral: cifrado y descifrado sin alterar bytes a través de varios bloques',async()=>{
 const contents=new Uint8Array(SECURE_UNIFIED_CHUNK_BYTES+157);
 for(let i=0;i<contents.length;i++)contents[i]=i%251;
 const archive=new Blob([contents],{type:'application/zip'});
 const encrypted=await encryptUnifiedBlob(archive,password,options);
 assert.equal(encrypted.type,'application/octet-stream');
 assert.equal(encrypted.size,SECURE_UNIFIED_HEADER_BYTES+contents.length+2*16);
 const head=new Uint8Array(await encrypted.slice(0,8).arrayBuffer());
 assert.equal(new TextDecoder().decode(head),SECURE_UNIFIED_MAGIC);
 const decrypted=await decryptUnifiedBlob(encrypted,password,options);
 assert.equal(decrypted.type,'application/zip');
 assert.deepEqual(new Uint8Array(await decrypted.arrayBuffer()),contents);
 const encryptedAgain=await encryptUnifiedBlob(archive,password,options);
 assert.notDeepEqual(new Uint8Array(await encryptedAgain.slice(0,SECURE_UNIFIED_HEADER_BYTES).arrayBuffer()),
  new Uint8Array(await encrypted.slice(0,SECURE_UNIFIED_HEADER_BYTES).arrayBuffer()),
  'Cada respaldo debe utilizar sal y nonce aleatorios nuevos');
});
test('Contraseñas incorrectas y archivos manipulados no revelan el contenido',async()=>{
 const archive=new Blob([new Uint8Array(220).fill(42)]);
 const encrypted=await encryptUnifiedBlob(archive,password,options);
 await assert.rejects(()=>decryptUnifiedBlob(encrypted,'Otra contraseña suficientemente larga',options),
  /Contraseña incorrecta|alterada/);
 const bytes=new Uint8Array(await encrypted.arrayBuffer());
 const modified=bytes.slice();modified[SECURE_UNIFIED_HEADER_BYTES+5]^=1;
 await assert.rejects(()=>decryptUnifiedBlob(new Blob([modified]),password,options),/alterada/);
 const headerChanged=bytes.slice();headerChanged[44]^=1;
 await assert.rejects(()=>decryptUnifiedBlob(new Blob([headerChanged]),password,options),/alterada/);
 const cut=bytes.slice(0,-12);
 await assert.rejects(()=>decryptUnifiedBlob(new Blob([cut]),password,options),/cabeceras|tamaños/);
});
test('Cifrado exige una contraseña segura y WebCrypto real',async()=>{
 assert.equal(secureUnifiedSupported(webcrypto),true);
 assert.equal(secureUnifiedSupported(null),false);
 const zip=new Blob([new Uint8Array(110)]);
 await assert.rejects(()=>encryptUnifiedBlob(zip,'123',options),/12 y 256/);
 await assert.rejects(()=>encryptUnifiedBlob(zip,password,{cryptoImpl:{}}),/Web Crypto|HTTPS|navegador compatible/);
 assert.equal(SECURE_UNIFIED_MAX_CIPHERTEXT>245*1024*1024,true);
});
test('Configuración ofrece cifrado completo y mantiene la copia sin cifrar con avisos',()=>{
 const html=unifiedBackupSettingsHTML();
 assert.match(html,/data-action="unified-backup-encrypted-export"/);
 assert.match(html,/data-action="unified-backup-export"/);
 assert.match(html,/id="unifiedBackupPassword"/);
 assert.match(html,/data-unified-backup-import/);
 assert.match(html,/\.mhubsecure/);
 assert.match(html,/\.mhubfull/);
 assert.match(html,/no se almacena/);
});
