#!/usr/bin/env node
// Smoke checks: detect obvious loss of mandatory UI modules in the prototype.
// These checks are NOT end-to-end tests. Functional changes require real tests.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const contract=JSON.parse(fs.readFileSync(path.join(root,'docs/CONTRATO_CONTINUIDAD.json'),'utf8'));
let failures=0;
for(const file of contract.mustExist){
 if(!fs.existsSync(path.join(root,file))){console.error('FALTA ARCHIVO:',file);failures++;}
}
for(const item of contract.requiredScreens){
 const target=path.join(root,item.file);
 if(!fs.existsSync(target)){console.error('FALTA MÓDULO:',item.id,item.label);failures++;continue;}
 const source=fs.readFileSync(target,'utf8');
 for(const token of item.tokens){
  if(!source.includes(token)){console.error('POSIBLE REGRESIÓN:',item.id,item.label,'en',item.file,'→ falta',JSON.stringify(token));failures++;}
 }
}
if(failures){
 console.error('\nDetectadas '+failures+' posibles regresiones. Comprobar paridad antes de editar el contrato.');
 process.exit(1);
}
console.log('Contrato de continuidad: '+contract.requiredScreens.length+' módulos estructurales presentes.');
console.log('ATENCIÓN: superar esta prueba no demuestra funcionamiento; requiere pruebas de integración, UI y dispositivos.');
