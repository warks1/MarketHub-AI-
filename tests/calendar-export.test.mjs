import test from 'node:test';
import assert from 'node:assert/strict';
import {exportEditorialICS,foldICS,icsEscape} from '../src/calendar-export.js';
const planned=[{id:1,title:'Campaña de invierno',platform:'Instagram',date:'2026-11-15',status:'Programada'}];
const opts={now:new Date('2026-11-05T09:00:00Z')};
test('Genera un evento iCalendar válido de todo el día, sin publicar en redes',()=>{
 const {content,count,error}=exportEditorialICS(planned,opts);
 assert.equal(error,null);assert.equal(count,1);
 for(const token of ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','DTSTART;VALUE=DATE:20261115',
  'DTEND;VALUE=DATE:20261116','STATUS:TENTATIVE','SUMMARY:Campaña de invierno','END:VEVENT','END:VCALENDAR'])
  assert.ok(content.includes(token),token);
 assert.match(content,/Recordatorio editorial\\, no publicación automática/);
 assert.ok(content.endsWith('\r\n'));
});
test('No incluye borradores ni fechas inexistentes',()=>{
 const rows=[...planned,{date:'2026-11-12',status:'Borrador',title:'Borrador'},{
  date:'2026-02-30',status:'Programada',title:'Inexistente'}];
 assert.equal(exportEditorialICS(rows,opts).count,1);
 assert.ok(exportEditorialICS([rows[1]],opts).error);
});
test('El calendario respeta cambio de mes y año bisiesto',()=>{
 const rows=[{id:7,date:'2028-02-29',title:'Bisiesto',status:'Planificada'}];
 const report=exportEditorialICS(rows,opts);
 assert.match(report.content,/DTEND;VALUE=DATE:20280301/);
 assert.equal(report.count,1);
});
test('Neutraliza saltos de línea e inyecciones de propiedades ICS',()=>{
 const danger='Reel\nBEGIN:VEVENT\nSUMMARY:Hack;X,Y';
 const report=exportEditorialICS([{id:'x@evil',title:danger,date:'2026-12-01',platform:'X',status:'Programada'}],opts);
 assert.equal((report.content.match(/BEGIN:VEVENT/g)||[]).length,1);
 assert.match(report.content,/Reel\\nBEGIN:VEVENT\\nSUMMARY:Hack\\;X\\,Y/);
 assert.ok(!report.content.includes('UID:markethub-x@evil'));
 assert.ok(icsEscape('a;b,c')==='a\\;b\\,c');
});
test('Las líneas largas usan plegado RFC 5545 en 75 bytes UTF-8',()=>{
 const line=foldICS('SUMMARY:'+'Á'.repeat(80));
 for(const part of line.split('\r\n')){
  assert.ok(new TextEncoder().encode(part).length<=75);
 }
});
