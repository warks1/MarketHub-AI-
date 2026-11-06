import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PLATFORMS_DRAFT,PLATFORMS_DISPLAY,PLATFORMS_ALL,hasSocialBrand,socialBrandIcon} from '../src/social-brand-icons.js';
import {liveHome,liveInbox} from '../src/live-ui.js';
import {nexusHome,nexusStudio} from '../src/nexus-ui.js';

test('Se renderizan siluetas SVG vectoriales de 13 redes sin peticiones externas',()=>{
 assert.ok(PLATFORMS_ALL.length>=13);
 for(const name of ['Instagram','TikTok','YouTube','Facebook','LinkedIn','X','WhatsApp','Threads','Pinterest','Snapchat','Bluesky','Twitch','Telegram']){
  assert.equal(hasSocialBrand(name),true,name);
  const badge=socialBrandIcon(name,{decorative:false});
  assert.match(badge,/social-brand-icon/);
  assert.match(badge,/<svg viewBox="0 0 24 24"/);
  assert.match(badge,/<path d="[A-Za-z0-9+.,\s-]+"/);
  assert.ok(badge.includes('aria-label="'+name+'"'));
  assert.doesNotMatch(badge,/https?:|<script|onerror|<img/i);
 }
 assert.equal(hasSocialBrand('Contenidos inventados'),false);
 assert.doesNotMatch(socialBrandIcon('<img src=x onerror=alert(1)>'),/onerror|<img/);
});
test('Los tamaños accesibles no interrumpen el flujo y los seis destinos siguen siendo válidos',()=>{
 assert.deepEqual(PLATFORMS_DRAFT,['Instagram','TikTok','YouTube','Facebook','LinkedIn','X']);
 assert.equal(PLATFORMS_DISPLAY.length,7);
 assert.match(socialBrandIcon('TikTok',{size:'tiny'}),/social-brand-icon--tiny/);
 assert.match(socialBrandIcon('YouTube',{size:'large'}),/social-brand-icon--large/);
 assert.match(socialBrandIcon('X'),/aria-hidden="true"/);
});
test('Panel activo: iconos y acciones para borradores locales, sin fingir una cuenta conectada',()=>{
 const content=liveHome({posts:[{title:'Imagen propia',date:'2026-11-06',platform:'TikTok',status:'Borrador'}],
  campaigns:[{name:'Campaña',channel:'YouTube',status:'Borrador'}]});
 for(const name of PLATFORMS_DISPLAY){
  assert.ok(content.includes('social-brand-icon--'+name.toLowerCase().replace(' ','-')),name);
 }
 for(const name of PLATFORMS_DRAFT)assert.ok(content.includes('data-platform="'+name+'"'),name);
 assert.match(content,/Sin conectar/);
 assert.match(content,/social-brand-icon--tiktok/);
 assert.match(content,/social-brand-icon--youtube/);
 assert.doesNotMatch(content,/data-action="connect-social"/);
});
test('Los layouts NEXUS e Inbox conservan módulos y muestran logotipos',()=>{
 const home=nexusHome({posts:[{platform:'Instagram',title:'Prueba',date:'2026-11-10'}]});
 const studio=nexusStudio();
 const inbox=liveInbox({messages:[{id:'123',contact:'Cliente',network:'Instagram',body:'Consulta',status:'Pendiente'}]});
 for(const text of ['social-brand-icon--instagram','social-brand-icon--tiktok','social-brand-icon--linkedin']){
  assert.ok(home.includes(text),text);
 }
 assert.match(studio,/social-brand-icon--youtube/);
 assert.match(inbox,/social-brand-icon--instagram/);
 assert.match(home,/data-action="start-platform-draft"/);
});
test('Responsive, navegación real y cache PWA mantienen iconos nativos sin CDN',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const stylesheet=readFileSync(new URL('../src/social-brand-icons.css',import.meta.url),'utf8');
 const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const worker=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
 assert.match(app,/case 'start-platform-draft'/);
 assert.match(app,/case 'select-post-platform'/);
 assert.match(app,/function syncPostPlatform/);
 assert.match(app,/data-action="select-post-platform"/);
 assert.match(app,/aria-pressed/);
 assert.match(stylesheet,/@media\(max-width:460px\)/);
 assert.match(index,/social-brand-icons\.css\?v=20261106r/);
 assert.match(worker,/\.\/src\/social-brand-icons\.js/);
 assert.match(worker,/\.\/src\/social-brand-icons\.css/);
 assert.doesNotMatch(app,/cdn\..*instagram/);
});
