import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spanishMonthYear} from '../src/date-label.js';
import {liveHome} from '../src/live-ui.js';
import {nexusHome} from '../src/nexus-ui.js';
import {unifiedBackupSettingsHTML} from '../src/unified-backup.js';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const officeCSS=readFileSync(new URL('../src/office.css',import.meta.url),'utf8');
const styleCSS=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const liveCSS=readFileSync(new URL('../src/live-ui.css',import.meta.url),'utf8');
const nexusCSS=readFileSync(new URL('../src/nexus-ui.css',import.meta.url),'utf8');

test('El botón de respaldo cifrado puede ajustarse a ancho móvil sin scroll horizontal',()=>{
 assert.match(unifiedBackupSettingsHTML(),/Descargar copia integral CIFRADA \(\.mhubsecure\)/);
 assert.match(officeCSS,/\.workspace-actions>button,\.workspace-actions>label\{[^}]*max-width:100%/);
 assert.match(officeCSS,/\.workspace-actions>\[data-action="unified-backup-encrypted-export"\]\{[^}]*flex:1 1 250px/);
 assert.match(officeCSS,/@media\(max-width:680px\)/);
});
test('El fondo queda inerte, se bloquea el scroll y el foco entra en diálogos y menús',()=>{
 assert.match(app,/underlying\.inert=mirrored\|\|opened/);
 assert.match(app,/mobileNative\.inert=mirrored\|\|opened/);
 assert.match(app,/classList\.toggle\('mh-overlay-open',opened\)/);
 assert.match(app,/dialogTabStops\(dialog\)\[0\]/);
 assert.match(app,/document\.activeElement===last/);
 assert.match(app,/document\.activeElement===first/);
 assert.match(app,/findOverlayFocusReturn\(\)/);
 assert.match(styleCSS,/html\.mh-overlay-open,body\.mh-overlay-open\{overflow:hidden/);
});
test('Biblioteca tiene buscador móvil y filtra en vivo sin reiniciar el input',()=>{
 assert.match(app,/id="librarySearch"/);
 assert.match(app,/id="libraryResults"/);
 assert.match(app,/function updateLibraryResults\(\)/);
 assert.match(app,/if\(e\.target\.id==='librarySearch'\)\{state\.search=e\.target\.value;updateLibraryResults\(\);return\}/);
 assert.match(app,/state\.search\.toLowerCase\(\)/);
});
test('Los meses en castellano capitalizan solo la primera letra y respetan la preposición',()=>{
 assert.equal(spanishMonthYear(new Date(2026,10,6)),'Noviembre de 2026');
 assert.equal(spanishMonthYear(new Date(2026,0,2)),'Enero de 2026');
 assert.match(liveHome({posts:[]}),/Selecciona un día para preparar contenido/);
 assert.match(nexusHome({posts:[]}),/No se publica automáticamente en redes/);
 assert.match(nexusCSS,/\.nexus-cal-month\{text-transform:none\}/);
});
test('Vista previa de Estudio no rompe palabras y etiqueta de versión coincide con package.json',()=>{
 assert.match(liveCSS,/\.live-editor-text h3,\.live-editor-text p\{[^}]*word-break:normal/);
 assert.match(liveCSS,/\.live-editor-text h3,\.live-editor-text p\{[^}]*overflow-wrap:break-word/);
 const version=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8')).version;
 assert.match(app,new RegExp('NEXUS × PULSE · v'+version.replace(/\./g,'\\.')));
 assert.doesNotMatch(app,/NEXUS × PULSE · v0\.3\.2/);
});
