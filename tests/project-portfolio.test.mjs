import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCreativePortfolio,parseCreativePortfolio,crc32,MAX_PORTFOLIO_BYTES} from '../src/project-portfolio.js';
import {forgePage,forgeTab} from '../src/media-forge.js';
const photo=new Uint8Array([137,80,78,71,13,10,26,10,1,3,5,7,9,11,13,15,17]);
const photo2=new Uint8Array([255,216,255,224,1,2,3,4,5,6,7,8,9,10]);
const settings={format:'4:5',mask:'orbita',look:'editorial',safezone:'on',caption:'Campaña editable',
 brandActive:true,brandPrimary:'#1234AB',brandAccent:'#FFAACC'};
const item=(name,bytes,type)=>({name,file:new Blob([bytes],{type}),settings});
test('ZIP MHUBPACK recupera todas las imágenes originales, máscaras, textos y formatos sin compresión',async()=>{
 const archive=await createCreativePortfolio([item('Campaña noviembre',photo,'image/png'),item('Campaña diciembre',photo2,'image/jpeg')]);
 assert.equal(archive.type,'application/zip');
 const bytes=new Uint8Array(await archive.arrayBuffer());
 const dv=new DataView(bytes.buffer);
 assert.equal(dv.getUint32(0,true),0x04034b50);
 assert.equal(dv.getUint32(bytes.length-22,true),0x06054b50);
 const restored=parseCreativePortfolio(bytes);
 assert.equal(restored.length,2);
 assert.equal(restored[0].name,'Campaña noviembre');
 assert.equal(restored[1].name,'Campaña diciembre');
 assert.deepEqual(restored[0].settings,settings);
 assert.deepEqual(new Uint8Array(await restored[0].file.arrayBuffer()),photo);
 assert.deepEqual(new Uint8Array(await restored[1].file.arrayBuffer()),photo2);
 assert.ok(bytes.length<2000,'El ZIP no debe codificar imágenes como base64');
});
test('Rechaza una copia dañada o truncada en vez de restaurar proyectos parciales',async()=>{
 const backup=await createCreativePortfolio([item('Primer diseño',photo,'image/png')]);
 const bytes=new Uint8Array(await backup.arrayBuffer());
 const mutated=bytes.slice();const pos=Buffer.from(mutated).indexOf(Buffer.from(photo));
 assert.ok(pos>0);
 mutated[pos+3]^=0xff;
 assert.throws(()=>parseCreativePortfolio(mutated),/CRC|dañada/);
 assert.throws(()=>parseCreativePortfolio(bytes.slice(0,-7)),/ZIP/);
 assert.throws(()=>parseCreativePortfolio(new Uint8Array([1,2,3,4])),/ZIP/);
 const wrongVersion=bytes.slice();
 assert.ok(wrongVersion.length>30);
 assert.ok(MAX_PORTFOLIO_BYTES>=90*1024*1024);
});
test('No permite formatos peligrosos, estructuras inválidas ni paquetes vacíos',async()=>{
 await assert.rejects(()=>createCreativePortfolio([]),/No hay proyectos/);
 await assert.rejects(()=>createCreativePortfolio(Array.from({length:13},(_,i)=>item('Proyecto '+i,photo,'image/png'))),/Demasiados proyectos/);
 await assert.rejects(()=>createCreativePortfolio([item('Ejecutable',new Uint8Array([1,2,3]),'image/svg+xml')]),/imagen JPG/);
 assert.throws(()=>parseCreativePortfolio('{}'),/ZIP/);
});
test('El catálogo conserva proyectos individuales y añade copias completas no destructivas',()=>{
 forgeTab('projects',()=>{});
 const html=forgePage();
 assert.match(html,/data-forge-action="project-export"/);
 assert.match(html,/data-forge-action="project-batch-export"/);
 assert.match(html,/data-forge-file="portfolio"/);
 assert.match(html,/data-forge-file="project"/);
 assert.match(html,/nunca reemplaza los existentes/);
 const source=readFileSync(new URL('../src/creative-projects.js',import.meta.url),'utf8');
 assert.match(source,/export async function importCreativeProjectBatch/);
 assert.match(source,/db\.transaction\(STORE,'readwrite'\)/);
 assert.match(source,/prepared\.forEach/);
 assert.match(source,/existing\.length\+prepared\.length>MAX_PROJECTS/);
 assert.match(source,/total>MAX_PROJECT_TOTAL_BYTES/);
});
test('CRC32 coincide con referencia estándar ZIP',()=>{
 assert.equal(crc32(new TextEncoder().encode('123456789')),0xcbf43926);
});
