import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(path.join(root,'index.html'),'utf8');
const app=readFileSync(path.join(root,'src/app.js'),'utf8');

test('El arranque contiene interfaz HTML accesible aunque fallen los módulos',()=>{
  assert.match(html,/id="app"/);
  assert.match(html,/id="bootStatus"/);
  assert.match(html,/diagnostico\.html/);
  assert.match(html,/markethubBootFailed/);
});

test('Las hojas de estilo y el módulo principal usan rutas relativas y revisión de caché',()=>{
  for(const name of ['style','office','growth','visual'])
    assert.match(html,new RegExp('href="\\./src/'+name+'\\.css\\?v=\\d{8}[a-z]?"'));
  assert.match(html,/src="\.\/src\/app\.js\?v=\d{8}[a-z]?"/);
});

test('El detector de errores arranca, avisa y respeta el estado ready',()=>{
  const source=html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(source,'Falta el detector de arranque');
  const script=new Script(source[1]);
  const alerts={};
  const elements={
    app:{appendChild(){}},
    bootStatus:{textContent:''},
    bootHelp:{hidden:true,appendChild(child){elements[child.id]=child;}}
  };
  let timer;
  const win={addEventListener(name,cb){alerts[name]=cb;},setTimeout(cb){timer=cb;}};
  const doc={getElementById(id){return elements[id]||null;},createElement(){return {id:'',style:{},textContent:''};}};
  script.runInNewContext({window:win,document:doc});
  assert.equal(win.__MARKETHUB_BOOT__.ready,false);
  assert.equal(typeof win.markethubBootFailed,'function');
  alerts.error({target:win,message:'Prueba controlada'});
  assert.match(elements.bootStatus.textContent,/No se ha podido completar/);
  assert.equal(elements.bootHelp.hidden,false);
  assert.match(elements.bootDetail.textContent,/Prueba controlada/);
  win.__MARKETHUB_BOOT__.ready=true;
  const before=elements.bootDetail.textContent;
  timer();
  assert.equal(elements.bootDetail.textContent,before);
});

test('La recuperación evita borrar borradores y tolera datos malformados',()=>{
  assert.doesNotMatch(html,/localStorage\.clear\s*\(/);
  assert.match(app,/state\.posts\.some\(p=>p && typeof p==='object'/);
  assert.match(app,/filterLocalPosts\(state\.posts,state\.search\)/);
  assert.match(readFileSync(path.join(root,'src/post-manager.js'),'utf8'),/if\(!p\|\|typeof p!=='object'\)return false/);
  assert.match(app,/__MARKETHUB_BOOT__\.ready = true/);
});

test('La compilación genera la aplicación de producción en lugar de arrancar Vite Dev',()=>{
  const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
  assert.equal(pkg.scripts.build,'vite build');
});
