// BRAND DNA · Perfiles de identidad visual reutilizables en la suite creativa.
const KEY='markethub-brand-dna-v1';
export const MAX_BRANDS=12;
export const TONES=['Profesional','Cercano','Inspirador','Elegante','Enérgico'];
const COLOR=/^#[\da-fA-F]{6}$/;
export function normalizeBrandProfile(input={}){
 const name=String(input.name||'').trim().replace(/[<>\x00-\x1F]/g,'').slice(0,65);
 if(name.length<2)throw Error('Escribe un nombre de marca de al menos dos caracteres');
 const primary=String(input.primary||'').trim(),accent=String(input.accent||'').trim();
 if(!COLOR.test(primary)||!COLOR.test(accent))throw Error('Los colores deben tener formato hexadecimal #RRGGBB');
 const tone=TONES.includes(input.tone)?input.tone:TONES[0];
 const cta=String(input.cta||'').trim().replace(/[<>\x00-\x1F]/g,'').slice(0,60);
 // ID determinista: editar una marca no crea duplicados.
 const id=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64);
 if(!id)throw Error('Nombre de marca inválido');
 return {id,name,primary:primary.toUpperCase(),accent:accent.toUpperCase(),tone,cta};
}
export function readBrandProfiles(){
 try{const data=JSON.parse(localStorage.getItem(KEY)||'[]');
  if(!Array.isArray(data))return [];
  return data.slice(0,MAX_BRANDS).flatMap(item=>{
   try{const valid=normalizeBrandProfile(item);return valid.id===item.id?[valid]:[]}catch{return []}
  });
 }catch{return []}
}
export function saveBrandProfile(input){
 const profile=normalizeBrandProfile(input),items=readBrandProfiles();
 const index=items.findIndex(x=>x.id===profile.id);
 if(index<0&&items.length>=MAX_BRANDS)throw Error('Máximo de '+MAX_BRANDS+' marcas. Elimina otra para continuar');
 if(index>=0)items[index]=profile;else items.push(profile);
 try{localStorage.setItem(KEY,JSON.stringify(items))}
 catch{throw Error('No se pudo guardar el ADN de marca en este dispositivo')}
 return profile;
}
export function removeBrandProfile(id){
 const original=readBrandProfiles(),next=original.filter(item=>item.id!==id);
 if(next.length===original.length)throw Error('La marca no existe');
 try{localStorage.setItem(KEY,JSON.stringify(next))}
 catch{throw Error('No se pudo actualizar el ADN de marca')}
 return true;
}
