import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBrandProfile,readBrandProfiles,saveBrandProfile,removeBrandProfile,TONES,MAX_BRANDS} from '../src/brand-dna.js';
import {forgePage,forgeTab} from '../src/media-forge.js';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v))};
test('Brand DNA valida nombre, colores y tono para una identidad reutilizable',()=>{
 const a=normalizeBrandProfile({name:'  Mi Estudio  ',primary:'#12aabb',accent:'#AA22ff',tone:'Elegante',cta:'Reserva ahora'});
 assert.deepEqual(a,{id:'mi-estudio',name:'Mi Estudio',primary:'#12AABB',accent:'#AA22FF',tone:'Elegante',cta:'Reserva ahora'});
 for(const profile of [{name:'X',primary:'#000000',accent:'#123456'},{name:'Empresa',primary:'red',accent:'#ffffff'}]){
  assert.throws(()=>normalizeBrandProfile(profile));
 }
 assert.equal(MAX_BRANDS,12);assert.ok(TONES.includes('Profesional'));
});
test('Guardar, actualizar y eliminar marca conserva la identidad sin duplicarla',()=>{
 let p=saveBrandProfile({name:'Marca Prueba',primary:'#112233',accent:'#445566',tone:'Cercano',cta:'Visítanos'});
 assert.equal(readBrandProfiles().length,1);
 assert.equal(p.id,'marca-prueba');
 p=saveBrandProfile({...p,accent:'#778899'});
 assert.equal(readBrandProfiles().length,1);
 assert.equal(readBrandProfiles()[0].accent,'#778899');
 assert.equal(removeBrandProfile(p.id),true);
 assert.deepEqual(readBrandProfiles(),[]);
});
test('El panel de marca pertenece a Media Forge, sin eliminar las máscaras o el pack',()=>{
 forgeTab('photo',()=>{});
 const html=forgePage();
 assert.match(html,/ADN Creativo de Marca/);
 assert.match(html,/data-forge-action="brand-save"/);
 assert.match(html,/data-forge-action="brand-apply"/);
 assert.match(html,/data-forge-input="brandPrimary"/);
 assert.match(html,/PULSE PACK/);
 assert.match(html,/data-forge-tab="vault"/);
});
