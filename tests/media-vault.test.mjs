import test from 'node:test';
import assert from 'node:assert/strict';
import {vaultSupported,validateVaultAsset,VAULT_MAX_ITEMS,VAULT_MAX_BYTES} from '../src/media-vault.js';
import {forgePage,forgeTab} from '../src/media-forge.js';

test('La biblioteca valida tipos y límites de archivo antes de guardarlos',()=>{
 assert.deepEqual(validateVaultAsset({name:'<b>Campaña</b>.png',blob:new Blob(['foto'],{type:'image/png'})}),{
  name:'bCampañab.png',type:'image/png',size:4
 });
 assert.throws(()=>validateVaultAsset({name:'x.svg',blob:new Blob(['<svg/>'],{type:'image/svg+xml'})}),/Formato/);
 const oversized=new Blob(['x'],{type:'video/mp4'});Object.defineProperty(oversized,'size',{value:50*1024*1024+1});
 assert.throws(()=>validateVaultAsset({name:'v.mp4',blob:oversized}),/50 MB/);
 assert.throws(()=>validateVaultAsset({name:'vacío',blob:new Blob([],{type:'application/pdf'})}),/contener datos/);
 assert.equal(VAULT_MAX_ITEMS,40);
 assert.equal(VAULT_MAX_BYTES,150*1024*1024);
});
test('La galería multimedia forma parte del mismo espacio, no sustituye los demás módulos',()=>{
 assert.equal(vaultSupported(),false);
 assert.match(forgePage(),/Mi biblioteca/);
 forgeTab('photo',()=>{});
 for(const tab of ['audio','video','pdf','subs'])assert.match(forgePage(),new RegExp(tab==='subs'?'Subtítulos':'MEDIA FORGE'));
 const mediaText=awaitPage();
 assert.match(mediaText,/data-forge-tab="vault"/);
 forgeTab('photo',()=>{});
 assert.match(forgePage(),/data-forge-action="vault-save-photo"/);
});
function awaitPage(){return forgePage()}

test('Safari guarda bytes en vez de objetos File/Blob y recupera archivos antiguos',async()=>{
 const {readFileSync}=await import('node:fs');
 const source=readFileSync(new URL('../src/media-vault.js',import.meta.url),'utf8');
 assert.match(source,/const bytes=await blob\.arrayBuffer\(\)/);
 assert.match(source,/data=\{\.\.\.valid,bytes,id,createdAt:/);
 assert.match(source,/new Blob\(\[item\.bytes\],\{type:item\.type\}\)/);
 assert.match(source,/if\(item\.blob instanceof Blob\)return item/);
 assert.doesNotMatch(source,/data=\{\.\.\.valid,blob,id,createdAt:/);
});
