import test from 'node:test';
import assert from 'node:assert/strict';
import {createUnifiedArchive,parseUnifiedArchive,MAX_UNIFIED_BYTES,unifiedBackupSettingsHTML} from '../src/unified-backup.js';
import {readFileSync} from 'node:fs';
const png=Uint8Array.from([137,80,78,71,13,10,26,10,1,2,3,4,5]);
const jpg=Uint8Array.from([255,216,255,224,5,6,7,8,9,10,255,217]);
const settings={format:'4:5',mask:'orbita',look:'neon',safezone:'on',caption:'Campaña de otoño',
 brandActive:true,brandPrimary:'#1199AA',brandAccent:'#BB55CC'};
const brand={name:'Mi Estudio',primary:'#1177AA',accent:'#BB22FF',tone:'Elegante',cta:'Reserva ahora'};
const workspace={format:'markethub-ai-local-backup',version:1,modules:{
 'markethub-ai-office-v1':{tasks:[{title:'Trabajo guardado'}]},
 'markethub-growth-local-v1':{notes:['Objetivo semanal']}
}};
const sample=()=>({
 projects:[{name:'Campaña A',file:new Blob([png],{type:'image/png'}),settings}],
 assets:[{name:'Cartel principal.png',blob:new Blob([png],{type:'image/png'})},
   {name:'Audio final.wav',blob:new Blob([jpg],{type:'audio/wav'})}],
 brands:[brand],workspace
});
test('La copia integral reúne proyectos, medios, marcas y módulos locales sin modificar los originales',async()=>{
 const archive=await createUnifiedArchive(sample());
 assert.equal(archive.type,'application/zip');
 const result=parseUnifiedArchive(await archive.arrayBuffer());
 assert.equal(result.projects.length,1);
 assert.equal(result.assets.length,2);
 assert.equal(result.brands[0].id,'mi-estudio');
 assert.equal(result.workspace['markethub-ai-office-v1'],JSON.stringify(workspace.modules['markethub-ai-office-v1']));
 assert.equal(result.projects[0].settings.caption,'Campaña de otoño');
 assert.deepEqual(new Uint8Array(await result.projects[0].file.arrayBuffer()),png);
 assert.deepEqual(new Uint8Array(await result.assets[1].blob.arrayBuffer()),jpg);
 assert.ok(archive.size<3000);
});
test('Se permite respaldar un solo conjunto y se comprueba que los archivos ausentes son válidos',async()=>{
 const archive=await createUnifiedArchive({projects:[],assets:[],brands:[],workspace:null});
 assert.deepEqual(parseUnifiedArchive(await archive.arrayBuffer()),{projects:[],assets:[],brands:[],workspace:null});
 assert.ok(MAX_UNIFIED_BYTES>=245*1024*1024);
});
test('Rechaza ZIP dañados, truncados o con entradas alteradas',async()=>{
 const archive=await createUnifiedArchive(sample()),raw=new Uint8Array(await archive.arrayBuffer());
 const changed=raw.slice(),position=Buffer.from(raw).indexOf(Buffer.from(png));
 assert.ok(position>0);changed[position+3]^=0x10;
 assert.throws(()=>parseUnifiedArchive(changed),/CRC|dañado/);
 assert.throws(()=>parseUnifiedArchive(raw.slice(0,-20)),/ZIP/);
 assert.throws(()=>parseUnifiedArchive(new Uint8Array([0,0,0])),/ZIP/);
});
test('Rechaza un tipo multimedia no admitido, marcas duplicadas y datos externos',async()=>{
 const source=sample();
 source.assets[0].blob=new Blob(['svg'],{type:'image/svg+xml'});
 await assert.rejects(()=>createUnifiedArchive(source),/Formato no permitido/);
 const duplicate=sample();duplicate.brands.push({...brand});
 await assert.rejects(()=>createUnifiedArchive(duplicate),/duplicadas/);
 const external=sample();external.workspace.modules['otra-app-externa']={secret:'x'};
 await assert.rejects(()=>createUnifiedArchive(external),/módulo desconocido/);
});
test('Se conserva la copia cifrada JSON y la nueva interfaz explica la privacidad',()=>{
 const page=unifiedBackupSettingsHTML();
 assert.match(page,/data-action="unified-backup-export"/);
 assert.match(page,/data-unified-backup-import/);
 assert.match(page,/SIN cifrar/);
 assert.match(page,/data-action="unified-backup-encrypted-export"/);
 assert.match(page,/sin reemplazar/);
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/backupSettingsHTML\(\)\+unifiedBackupSettingsHTML\(\)/);
 assert.match(app,/case 'backup-encrypted-export'/);
 assert.match(app,/case 'unified-backup-export'/);
 assert.match(app,/restoreUnifiedBackup\(archive\)/);
 assert.match(app,/decryptUnifiedBlob\(file,password\)/);
 const db=readFileSync(new URL('../src/media-vault.js',import.meta.url),'utf8');
 assert.match(db,/saveVaultAssetsBatch/);
 assert.match(db,/removeVaultAssetsBatch/);
});
