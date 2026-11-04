import test from 'node:test';
import assert from 'node:assert/strict';

const backing=new Map();
globalThis.localStorage={
 getItem:key=>backing.has(key)?backing.get(key):null,
 setItem:(key,value)=>backing.set(key,String(value)),
 removeItem:key=>backing.delete(key)
};
globalThis.FormData=class FakeFormData{
 constructor(form){this.fields=form.fields??{}}
 get(key){return this.fields[key]??null}
};
let confirmation=false;
globalThis.window={confirm:()=>confirmation};
const {growthPage,growthOpenTab,growthClick,growthSubmit,analyzeCaption,validHttps,buildEmailHtml,buildBioHtml}=await import('../src/growth.js');
const responses=[],ctx={
 toast:m=>responses.push(m),
 refresh:()=>responses.push('REFRESH'),
 newPost:s=>responses.push('NEW_POST '+s)
};
const form=(id,fields)=>({id,fields});
const saved=()=>JSON.parse(backing.get('markethub-growth-local-v1')??'null');
const submit=(id,fields,plan='free')=>growthSubmit(form(id,fields),plan,ctx);

test('El laboratorio muestra seis pestañas y aviso de alcance local',()=>{
 growthOpenTab('campanas');
 const html=growthPage('free');
 for(const tab of ['campanas','utm','seo','emails','reutilizar','bio'])assert.ok(html.includes('data-growth-action="tab-'+tab+'"'));
 assert.match(html,/100 % local/);
 assert.match(html,/sin campañas enviadas/);
});

test('Brief de campaña se guarda y el contenido peligroso se escapa al mostrarlo',()=>{
 submit('growth-brief',{briefName:'Promo <script>alert(1)</script>',briefGoal:'Ventas',briefBrand:'Marca',briefAudience:'Público',briefOffer:'Oferta',briefChannel:'Instagram',briefBudget:'250',briefDate:'2026-11-16',briefCta:'Reserva'});
 const item=saved().briefs[0];
 assert.equal(item.budget,250);assert.equal(item.channel,'Instagram');
 const output=growthPage('free');
 assert.ok(output.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
 assert.ok(!output.includes('Promo <script>'));
});

test('No se admite un presupuesto negativo',()=>{
 const previous=saved().briefs.length;
 submit('growth-brief',{briefName:'Mal',briefAudience:'Cliente',briefOffer:'Servicio',briefBudget:'-100',briefDate:'2026-11-16'});
 assert.equal(saved().briefs.length,previous);
 assert.match(responses.at(-1),/presupuesto/i);
});

test('Eliminar un brief exige confirmación del usuario',()=>{
 const id=saved().briefs[0].id;
 const button={dataset:{growthAction:'delete-brief',id}};
 confirmation=false;growthClick(button,ctx);assert.equal(saved().briefs.length,1);
 confirmation=true;growthClick(button,ctx);assert.equal(saved().briefs.length,0);
});

test('URL con parámetros UTM codifica correctamente acentos y espacios',()=>{
 submit('growth-utm',{utmBase:'https://ejemplo.es/pagina?producto=1',utmSource:'instagram',utmMedium:'social',utmCampaign:'Otoño 2026',utmContent:'vídeo principal',utmTerm:''});
 const link=saved().utms[0].link,u=new URL(link);
 assert.equal(u.searchParams.get('producto'),'1');
 assert.equal(u.searchParams.get('utm_campaign'),'Otoño 2026');
 assert.equal(u.searchParams.get('utm_content'),'vídeo principal');
 assert.equal(u.searchParams.get('utm_source'),'instagram');
 assert.equal(u.searchParams.get('utm_medium'),'social');
});

test('Bloqueo de enlaces javascript, http y URLs con credenciales',()=>{
 assert.equal(validHttps('javascript:alert(1)'),null);
 assert.equal(validHttps('http://ejemplo.es'),null);
 assert.equal(validHttps('https://user:pass@ejemplo.es'),null);
 assert.equal(validHttps('https://ejemplo.es/'),'https://ejemplo.es/');
 const before=saved().utms.length;
 submit('growth-utm',{utmBase:'javascript:alert(1)',utmSource:'x',utmMedium:'social',utmCampaign:'test'});
 assert.equal(saved().utms.length,before);
});

test('Una UTM con parámetros anteriores evita duplicados y borra opcionales ausentes',()=>{
 submit('growth-utm',{utmBase:'https://ejemplo.es/?utm_source=antiguo&utm_term=antiguo',utmSource:'nuevo',utmMedium:'referral',utmCampaign:'Promo'});
 const url=new URL(saved().utms.at(-1).link);
 assert.deepEqual(url.searchParams.getAll('utm_source'),['nuevo']);
 assert.equal(url.searchParams.has('utm_term'),false);
});

test('La calculadora SEO es orientativa y produce hallazgos verificables',()=>{
 const r=analyzeCaption('Descubre nuestros nuevos productos para esta temporada. Reserva ahora. #marketing','productos','Instagram');
 assert.equal(r.charCount,77);
 assert.equal(r.tagCount,1);
 assert.equal(r.score,100);
 assert.deepEqual(r.findings.length,1);
 const low=analyzeCaption('Hola','servicio','TikTok');
 assert.ok(low.score<100);
 assert.ok(low.findings.some(x=>x.includes('palabra clave')));
});

test('Analizador SEO guarda texto y métricas sin llamar a proveedores',()=>{
 submit('growth-seo',{seoCaption:'Descubre nuestra promoción especial. Reserva y comparte. #novedades',seoKeyword:'promoción',seoPlatform:'TikTok'});
 growthOpenTab('seo');
 assert.match(growthPage('free'),/Índice orientativo/);
 assert.equal(saved().seo.platform,'TikTok');
});

test('Plantilla de email escapa HTML malicioso',()=>{
 const email={subject:'<img src=x onerror=alert(1)>',preheader:'Hola',message:'Oferta <script>alert(1)</script>',cta:'Ver <x>',url:'https://example.com/'};
 const html=buildEmailHtml(email);
 assert.ok(!html.includes('<script>alert(1)</script>'));
 assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
 assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
 assert.ok(html.includes('&lt;x&gt;'));
});

test('La edición de email rechaza destinos inseguros sin borrar el anterior',()=>{
 const before=saved().email.subject;
 submit('growth-email',{emailSubject:'Test',emailMessage:'Texto',emailUrl:'http://insegura.es'});
 assert.equal(saved().email.subject,before);
 submit('growth-email',{emailSubject:'Nuevo boletín',emailPreheader:'Resumen',emailMessage:'Contenido para el boletín',emailCta:'Ir a web',emailUrl:'https://ejemplo.es'});
 assert.equal(saved().email.subject,'Nuevo boletín');
});

test('Reutiliza una idea en tres formatos editables',()=>{
 submit('growth-repurpose',{repIdea:'Lanzamos nuestro nuevo servicio',repAudience:'profesionales',repTone:'Profesional'});
 assert.equal(saved().repurpose.length,3);
 growthOpenTab('reutilizar');
 const html=growthPage('free');
 assert.match(html,/LinkedIn/);
 assert.match(html,/TikTok/);
 assert.match(html,/Instagram/);
});

test('Link en bio valida varias URLs y escapa los títulos',()=>{
 submit('growth-bio',{bioName:'Mi <b>Marca</b>',bioDescription:'Aquí estamos',bioTitle0:'Tienda',bioUrl0:'https://ejemplo.es',bioTitle1:'Llamar',bioUrl1:'https://ejemplo.es/contacto'});
 assert.equal(saved().bio.links.length,2);
 const html=buildBioHtml();
 assert.ok(html.includes('Mi &lt;b&gt;Marca&lt;/b&gt;'));
 assert.ok(!html.includes('<h1>Mi <b>Marca</b></h1>'));
 assert.match(html,/https:\/\/ejemplo\.es\/contacto/);
});

test('Link en bio no sobreescribe datos si alguna URL es insegura',()=>{
 const before=saved().bio.name;
 submit('growth-bio',{bioName:'Mal',bioTitle0:'Ir',bioUrl0:'javascript:alert(1)'});
 assert.equal(saved().bio.name,before);
 assert.match(responses.at(-1),/HTTPS válida/);
});

test('Todas las pestañas se renderizan en modo FREE y PRO',()=>{
 for(const tab of ['campanas','utm','seo','emails','reutilizar','bio']){
  growthOpenTab(tab);
  for(const plan of ['free','pro'])assert.ok(growthPage(plan).includes('GROWTH LAB'));
 }
});
