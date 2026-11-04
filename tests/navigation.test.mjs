import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'src/style.css'),'utf8');
const navSource=app.match(/const nav=\[([\s\S]*?)\];/);
assert.ok(navSource,'Falta el listado de navegación principal');
const nav=[...navSource[1].matchAll(/\['([^']+)','([^']+)','([^']+)'\]/g)].map(m=>({id:m[1],label:m[2]}));
const ids=new Set(nav.map(x=>x.id));

test('La navegación principal conserva los módulos obligatorios',()=>{
 for(const id of ['inicio','estudio','diseño','crear','oficina','laboratorio','herramientas','campanas','analitica','bandeja','planes','ajustes'])
  assert.ok(ids.has(id),'Falta el módulo '+id);
});
test('No existen identificadores de navegación duplicados',()=>{
 assert.equal(ids.size,nav.length);
});
test('El menú Más genera enlaces a partir de toda la navegación',()=>{
 assert.ok(app.includes("function mobileDrawer(){"));
 assert.ok(app.includes("const links=nav.map(item=>"));
 assert.ok(app.includes('data-page="'+ "'+item[0]+'"+'"'));
 assert.ok(app.includes("state.menuMore?mobileDrawer()"));
});
test('Los accesos rápidos de móvil son estables por identificador',()=>{
 assert.ok(app.includes("const quickIds=['inicio','estudio','diseño','crear','herramientas'];"));
 assert.ok(app.includes("nav.find(n=>n[0]===id)"));
 assert.ok(!app.includes('nav[5]'),'No usar índices fijos que se desplazan al añadir pantallas');
});
test('El menú completo se puede abrir, cerrar y responde a Escape',()=>{
 assert.ok(app.includes("case 'show-mobile-menu':"));
 assert.ok(app.includes("case 'close-mobile-menu':"));
 assert.ok(app.includes("if(state.menuMore){state.menuMore=false;render()}"));
 assert.ok(css.includes(".mobile-menu-drawer"));
 assert.ok(css.includes(".mobile-drawer-grid"));
});
