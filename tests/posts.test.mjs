import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {draftLimit,findPost,validatePost,postsToCSV} from '../src/post-manager.js';

test('FREE y PRO tienen límites distintos solo para los borradores locales',()=>{
  assert.equal(draftLimit('free'),20);
  assert.equal(draftLimit('pro'),500);
});

test('Se encuentran borradores por id sin fallar ante datos antiguos defectuosos',()=>{
  const sample=[null,5,{id:45,title:'A'}, {id:'otro',title:'B'}];
  assert.equal(findPost(sample,'45').title,'A');
  assert.equal(findPost(sample,'otro').title,'B');
  assert.equal(findPost(sample,'inexistente'),null);
  assert.equal(findPost(null,'otro'),null);
});

test('Los datos de publicaciones se validan antes de guardarse',()=>{
  const valid=validatePost({title:'  Hola Mundo  ',platform:'Instagram',date:'2026-11-20',status:'Borrador'});
  assert.deepEqual(valid.value,{title:'Hola Mundo',platform:'Instagram',date:'2026-11-20',status:'Borrador'});
  assert.ok(validatePost({title:' ',platform:'Instagram',date:'2026-11-20'}).error);
  assert.ok(validatePost({title:'Hola',platform:'Desconocida',date:'2026-11-20'}).error);
  assert.ok(validatePost({title:'Hola',platform:'TikTok',date:'2026-02-30'}).error);
  assert.ok(validatePost({title:'Hola',platform:'TikTok',date:'2026-99-99'}).error);
});

test('El CSV es UTF-8 y neutraliza fórmulas en las hojas de cálculo',()=>{
  const csv=postsToCSV([
    {id:1,title:'"Nuevo", lanzamiento',platform:'TikTok',date:'2026-11-20',status:'Borrador'},
    {id:2,title:'=HYPERLINK("https://malicioso.example")',platform:'Instagram',date:'2026-11-21',status:'Programada'}
  ]);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"""Nuevo"", lanzamiento"'));
  assert.ok(csv.includes('HYPERLINK'));
  assert.ok(csv.includes('"\'=HYPERLINK'));
  assert.ok(csv.includes('\r\n'));
});

test('La página conserva acciones de edición, duplicación, eliminación y exportación',()=>{
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const app=readFileSync(path.join(root,'src/app.js'),'utf8');
  for(const action of ['edit-post','cancel-edit','duplicate-post','delete-post','confirm-delete-post','export-posts'])
    assert.ok(app.includes(action),'Falta '+action);
  assert.match(app,/case 'confirm-delete-post':/);
  assert.match(app,/const result=validatePost/);
  assert.match(app,/state\.editPostId=null/);
  assert.match(app,/No se envían a las redes sociales/);
  assert.match(app,/const todayLocal=/);
  assert.doesNotMatch(app,/toLocaleDateString\('en-CA'\)/);
});
