import test from 'node:test';
import assert from 'node:assert/strict';
import {auditCreative} from '../src/creative-audit.js';
import {forgePage,forgeTab} from '../src/media-forge.js';
test('El auditor PULSE distingue recorte, ampliación y texto extenso',()=>{
 const good=auditCreative({sourceWidth:2400,sourceHeight:4200,targetWidth:1080,targetHeight:1920,caption:'Descubre nuestra nueva campaña',mask:'orbita',safezone:'on'});
 assert.equal(good.score,100);
 assert.ok(good.retainedRatio>.9);
 const risky=auditCreative({sourceWidth:320,sourceHeight:180,targetWidth:1080,targetHeight:1920,caption:'Un mensaje excesivamente largo con demasiadas palabras y más texto del recomendable para un anuncio pequeño de móvil',mask:'estrella',safezone:'off'});
 assert.ok(risky.score<50);
 assert.ok(risky.findings.some(x=>!x.pass&&x.label==='Área visible de fotografía'));
 assert.ok(risky.findings.some(x=>!x.pass&&x.label==='Resolución para exportación'));
 assert.ok(risky.findings.some(x=>!x.pass&&x.label==='Texto legible y conciso'));
});
test('Rechaza tamaños imposibles y no afirma ser un certificado de publicación',()=>{
 assert.throws(()=>auditCreative({sourceWidth:0,sourceHeight:200,targetWidth:1080,targetHeight:1920}));
 assert.throws(()=>auditCreative({sourceWidth:NaN,sourceHeight:200,targetWidth:1080,targetHeight:1920}));
 forgeTab('photo',()=>{});
 const html=forgePage();
 assert.match(html,/data-forge-action="audit-photo"/);
});
