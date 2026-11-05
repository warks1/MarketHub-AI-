import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSubtitles,convertSubtitles} from '../src/subtitle-tools.js';
import {forgePage,forgeTab,forgeInput} from '../src/media-forge.js';

const example='1\n00:00:01,250 --> 00:00:04,500\n¡Hola MarketHub AI!\n\n2\n00:00:05,000 --> 00:00:07,600\nTus campañas en un solo lugar.';
test('SRT pasa a WebVTT con tiempos y textos correctos',()=>{
 const vtt=convertSubtitles(example,'vtt');
 assert.match(vtt,/^WEBVTT\n\n00:00:01\.250 --> 00:00:04\.500/);
 assert.match(vtt,/¡Hola MarketHub AI!/);
 assert.equal(parseSubtitles(vtt).length,2);
 assert.equal(convertSubtitles(vtt,'srt'),example+'\n');
});
test('SRT/VTT valida marcas de tiempo y no genera archivos corruptos',()=>{
 for(const source of ['', '1\n00:00:05,000 --> 00:00:01,000\nPrueba',
  '1\n00:00:99,000 --> 00:01:00,000\nPrueba',
  '1\n00:00:01,000 --> 00:00:02,000',
  'abc\ntexto sin marcas de tiempo']){
  assert.throws(()=>convertSubtitles(source,'vtt'));
 }
 assert.throws(()=>convertSubtitles(example,'docx'));
});
test('Los subtítulos están integrados en Media Forge sin sustituir las pestañas anteriores',()=>{
 forgeTab('subs',()=>{});
 const html=forgePage();
 assert.match(html,/Subtítulos SRT \/ VTT/);
 assert.match(html,/data-forge-action="srt"/);
 assert.match(html,/data-forge-action="vtt"/);
 assert.match(html,/data-forge-input="subtitle"/);
 assert.match(html,/data-forge-file="subs"/);
 assert.equal(forgeInput({dataset:{forgeInput:'subtitle'},value:example}),true);
 assert.match(forgePage(),/2 fragmentos reconocidos/);
 forgeTab('photo',()=>{});
 assert.match(forgePage(),/PULSE PACK/);
});

test('Los selectores multimedia no muestran etiquetas undefined ni valores rotos',()=>{
 for(const tab of ['photo','audio','video','pdf','subs','vault','projects']){
  forgeTab(tab,()=>{});
  const html=forgePage();
  assert.doesNotMatch(html,/\bundefined\b|\bNaN\b|\[object Object\]/,'Texto roto en '+tab);
 }
 forgeTab('subs',()=>{});
 assert.match(forgePage(),/Abrir subtítulos/);
 forgeTab('photo',()=>{});
});
