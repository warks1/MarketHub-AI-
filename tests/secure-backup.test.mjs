import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {encryptBackupJSON,decryptBackupJSON,ENCRYPTED_BACKUP_FORMAT,
 encryptedBackupsAvailable,BACKUP_KDF_ITERATIONS} from '../src/secure-backup.js';

const password='Clave sólida con 25 caracteres 🔐';
const payload={format:'markethub-ai-local-backup',version:1,
 modules:{'markethub-ai-demo-v1':{plan:'free',posts:[{title:'Información privada de campaña'}]}}};

test('AES-256-GCM protege los datos de marketing sin incluirlos en claro en el archivo',async()=>{
 const encrypted=await encryptBackupJSON(payload,password,{cryptoImpl:webcrypto});
 assert.equal(encrypted.format,ENCRYPTED_BACKUP_FORMAT);
 assert.equal(encrypted.cipher,'AES-256-GCM');
 assert.equal(encrypted.iterations,BACKUP_KDF_ITERATIONS);
 assert.ok(!JSON.stringify(encrypted).includes('Información privada'));
 assert.deepEqual(await decryptBackupJSON(encrypted,password,{cryptoImpl:webcrypto}),payload);
});

test('Cada respaldo usa sal e IV únicos y detecta alteraciones o contraseñas incorrectas',async()=>{
 const a=await encryptBackupJSON(payload,password,{cryptoImpl:webcrypto});
 const b=await encryptBackupJSON(payload,password,{cryptoImpl:webcrypto});
 assert.notEqual(a.salt,b.salt);
 assert.notEqual(a.iv,b.iv);
 assert.notEqual(a.ciphertext,b.ciphertext);
 await assert.rejects(()=>decryptBackupJSON(a,'contraseña equivocada de prueba',{cryptoImpl:webcrypto}),/Contraseña incorrecta/);
 const tampered={...a,ciphertext:a.ciphertext.slice(0,-8)+'QUJDREVG'};
 await assert.rejects(()=>decryptBackupJSON(tampered,password,{cryptoImpl:webcrypto}));
});

test('Archivos malformados o con parámetros inseguros se rechazan',async()=>{
 assert.equal(encryptedBackupsAvailable(webcrypto),true);
 assert.equal(encryptedBackupsAvailable(null),false);
 await assert.rejects(()=>encryptBackupJSON(payload,'corta',{cryptoImpl:webcrypto}),/12 a 256/);
 await assert.rejects(()=>decryptBackupJSON({format:'no'},password,{cryptoImpl:webcrypto}),/compatible/);
 const encrypted=await encryptBackupJSON(payload,password,{cryptoImpl:webcrypto});
 await assert.rejects(()=>decryptBackupJSON({...encrypted,iterations:10},password,{cryptoImpl:webcrypto}),/compatible/);
 await assert.rejects(()=>decryptBackupJSON({...encrypted,iv:'a'},password,{cryptoImpl:webcrypto}));
});
