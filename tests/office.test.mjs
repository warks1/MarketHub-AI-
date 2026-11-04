// Node 22 tests: real local features, honest state, XSS-safe rendering and persistence.
// No network, advertising provider or cloud account required.
import test from 'node:test';
import assert from 'node:assert/strict';

const storage=new Map();
globalThis.localStorage={
 getItem:k=>storage.get(k)??null,
 setItem:(k,v)=>storage.set(k,String(v)),
 removeItem:k=>storage.delete(k)
};
globalThis.FormData=class MockFormData{
 constructor(form){this.fields=form.fields||{}}
 get(key){return this.fields[key]??null}
};
let approved=false;
globalThis.window={confirm:()=>approved};
const {officePage,officeOpenTab,officeSubmit,officeChange,officeClick}=await import('../src/office.js');
const notices=[];
let refreshCount=0;
const ctx={refresh:()=>refreshCount++,toast:m=>notices.push(m),newPost:s=>notices.push('DRAFT '+s)};
const form=(id,fields)=>({id,fields});
const getWorkspace=()=>JSON.parse(storage.get('markethub-ai-office-v1'));

test('La página de oficina muestra advertencias de almacenamiento local',()=>{
 const page=officePage('free');
 assert.match(page,/Sin nube/);
 assert.match(page,/No utilices datos reales/);
 assert.match(page,/Oficina de marketing/);
});
test('Se puede navegar por las siete secciones de oficina',()=>{
 for(const tab of ['resumen','copys','crm','tareas','landing','calculadora','marca']){
  officeOpenTab(tab);
  assert.ok(officePage('free').includes('data-office-action="tab-'+tab+'"'));
 }
 assert.ok(refreshCount>=0);
});
test('Generador de copys crea tres variantes y escapa contenido HTML en el DOM',()=>{
 officeSubmit(form('office-copy-form',{copyBrand:'Marca <img src=x onerror=alert(1)>',copyProduct:'Servicio <script>alert(1)</script>',copyAudience:'personas',copyPlatform:'Instagram',copyGoal:'Vender'}),'free',ctx);
 const w=getWorkspace();assert.equal(w.copies.length,3);
 officeOpenTab('copys');const page=officePage('free');
 assert.ok(page.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
 assert.ok(!page.includes('<script>alert(1)</script>'));
 assert.match(notices.at(-1),/plantillas locales/);
});
test('Los contactos se almacenan localmente y se puede cambiar el estado',()=>{
 officeSubmit(form('office-lead-form',{leadName:'Cliente de prueba',leadEmail:'cliente@example.com',leadSource:'Web'}),'free',ctx);
 const before=getWorkspace();assert.equal(before.leads.length,1);
 assert.equal(before.leads[0].status,'Nuevo');
 const leadId=before.leads[0].id;
 officeChange({dataset:{officeChange:'lead-status',id:leadId},value:'Contactado'},ctx);
 assert.equal(getWorkspace().leads[0].status,'Contactado');
 officeOpenTab('crm');assert.match(officePage('free'),/Cliente de prueba/);
});
test('La eliminación de contactos requiere confirmación explícita',()=>{
 const id=getWorkspace().leads[0].id;const target={dataset:{officeAction:'delete-lead',id}};
 approved=false;officeClick(target,ctx);assert.equal(getWorkspace().leads.length,1);
 approved=true;officeClick(target,ctx);assert.equal(getWorkspace().leads.length,0);
});
test('Las tareas permiten prioridades, fechas y completado',()=>{
 officeSubmit(form('office-task-form',{taskTitle:'Preparar publicación',taskDue:'2026-11-12',taskPriority:'Alta'}),'free',ctx);
 const t=getWorkspace().tasks[0];assert.equal(t.done,false);assert.equal(t.priority,'Alta');
 officeChange({dataset:{officeChange:'task-done',id:t.id},checked:true},ctx);
 assert.equal(getWorkspace().tasks[0].done,true);
 officeOpenTab('tareas');assert.match(officePage('free'),/Preparar publicación/);
});
test('Kit de marca valida colores y escapa marca en HTML',()=>{
 officeSubmit(form('office-brand-form',{brandName:'Mi Marca <b>Test</b>',brandTagline:'Prueba',brandTone:'Elegante',brandPrimary:'#123456',brandAccent:'background:red;'}),'free',ctx);
 const b=getWorkspace().brand;
 assert.equal(b.primary,'#123456');
 assert.equal(b.accent,'#28ddef');
 officeOpenTab('marca');const page=officePage('free');
 assert.ok(page.includes('Mi Marca &lt;b&gt;Test&lt;/b&gt;'));
 assert.ok(!page.includes('Mi Marca <b>Test</b>'));
});
test('La landing permite una URL HTTPS y muestra contenido escapado',()=>{
 officeSubmit(form('office-landing-form',{landingTitle:'Oferta <script>alert(1)</script>',landingSubtitle:'Texto descriptivo',landingButton:'Conoce más',landingUrl:'https://example.com/landing'}),'free',ctx);
 assert.equal(getWorkspace().landing.url,'https://example.com/landing');
 officeOpenTab('landing');const page=officePage('free');
 assert.ok(page.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
 assert.ok(!page.includes('Oferta <script>'));
});
test('La landing rechaza enlaces inseguros',()=>{
 const previous=getWorkspace().landing.url;
 officeSubmit(form('office-landing-form',{landingTitle:'Otro',landingUrl:'javascript:alert(1)'}),'free',ctx);
 assert.equal(getWorkspace().landing.url,previous);
 assert.match(notices.at(-1),/https/);
});
test('La calculadora guarda cifras y no divide por cero',()=>{
 officeSubmit(form('office-calc-form',{calcSpend:'100',calcRevenue:'250',calcLeads:'10',calcOrders:'2'}),'free',ctx);
 const c=getWorkspace().calculation;assert.deepEqual(c,{spend:100,revenue:250,leads:10,orders:2});
 officeOpenTab('calculadora');
 const page=officePage('free');assert.match(page,/2.50×/);assert.match(page,/150.0%/);
 assert.match(page,/25.0€/);
 officeSubmit(form('office-calc-form',{calcSpend:'0',calcRevenue:'0',calcLeads:'0',calcOrders:'0'}),'free',ctx);
 assert.match(officePage('free'),/No calculable/);
});
test('No se aceptan estados de CRM fuera del listado permitido',()=>{
 officeSubmit(form('office-lead-form',{leadName:'Segundo contacto',leadSource:'Otro'}),'free',ctx);
 const id=getWorkspace().leads[0].id;
 officeChange({dataset:{officeChange:'lead-status',id},value:'PAGO ADMIN'},ctx);
 assert.equal(getWorkspace().leads[0].status,'Nuevo');
});
test('Las pantallas funcionan tanto en FREE como PRO sin habilitar pagos',()=>{
 officeOpenTab('resumen');
 assert.match(officePage('free'),/FREE y PRO/);
 assert.match(officePage('pro'),/PRO/);
 assert.match(officePage('pro'),/En FREE se permiten/);
});
