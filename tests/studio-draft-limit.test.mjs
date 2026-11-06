import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {draftLimit} from '../src/post-manager.js';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const start=app.indexOf("case 'draft-from-studio':");
const end=app.indexOf("case 'studio-unavailable':",start);
const studio=app.slice(start,end);
test('El límite del plan FREE es 20 y el de PRO es 500',()=>{
 assert.equal(draftLimit('free'),20);
 assert.equal(draftLimit('pro'),500);
});
test('La acción oculta de Estudio comprueba el límite antes de insertar el borrador',()=>{
 assert.ok(start>=0&&end>start);
 const guarded=studio.indexOf("state.posts.length>=draftLimit(state.plan)");
 const inserted=studio.indexOf("state.posts.unshift(");
 assert.ok(guarded>=0&&inserted>guarded,'Se debe comprobar el límite antes de guardar');
 assert.match(studio,/toast\('Has alcanzado el límite/);
 assert.match(studio,/break;/);
});
test('No quedan caminos con el límite FREE 20 codificado directamente ni rutas sin límite PRO',()=>{
 assert.doesNotMatch(app,/state\.plan==='free'&&state\.posts\.length>=20/);
 const checks=[...app.matchAll(/state\.posts\.length>=draftLimit\(state\.plan\)/g)];
 assert.ok(checks.length>=6,'Se esperan las barreras del Estudio, Office, Visual, Growth y creación/duplicación');
});
