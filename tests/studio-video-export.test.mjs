import test from 'node:test';
import assert from 'node:assert/strict';
import {VIDEO_LIMITS,supportedVideoMime,videoFormatDimensions,validateVideoExport,sceneAtTime} from '../src/studio-video-export.js';

const scenes=[{title:'Inicio',duration:2,theme:'Neón'},
 {title:'Lanzamiento',duration:3,theme:'Violeta'},
 {title:'Cierre',duration:1,theme:'Océano'}];

test('Vídeo exportable en 9:16 y 16:9 a 720p sin ocultar formato',()=>{
 assert.deepEqual(videoFormatDimensions('9:16'),[720,1280]);
 assert.deepEqual(videoFormatDimensions('16:9'),[1280,720]);
 assert.equal(VIDEO_LIMITS.framesPerSecond,24);
 const report=validateVideoExport(scenes,'9:16');
 assert.equal(report.totalSeconds,6);
 assert.equal(report.width,720);
});

test('Exportación local rechaza proyectos demasiado largos para teléfonos',()=>{
 assert.ok(validateVideoExport([], '9:16').error);
 assert.ok(validateVideoExport(scenes, 'invalid').error);
 assert.ok(validateVideoExport([{duration:0}],'16:9').error);
 assert.ok(validateVideoExport([{duration:61}],'16:9').error);
 assert.ok(validateVideoExport(Array.from({length:13},()=>({duration:1})),'9:16').error);
 assert.ok(validateVideoExport([{duration:35},{duration:15}],'9:16').error);
 assert.deepEqual(validateVideoExport([{duration:1}], '16:9'),{totalSeconds:1,width:1280,height:720});
});

test('Selección temporal respeta escenas y transiciones sin invertir duración',()=>{
 assert.deepEqual(sceneAtTime(scenes,0),{index:0,sceneTime:0,duration:2});
 assert.deepEqual(sceneAtTime(scenes,1.7),{index:0,sceneTime:1.7,duration:2});
 assert.deepEqual(sceneAtTime(scenes,2),{index:1,sceneTime:0,duration:3});
 assert.deepEqual(sceneAtTime(scenes,5.2),{index:2,sceneTime:0.20000000000000018,duration:1});
 assert.equal(sceneAtTime(scenes,100).index,2);
});

test('Detección real del códec sin mentir sobre compatibilidad Safari/Android',()=>{
 assert.equal(supportedVideoMime(null),null);
 assert.equal(supportedVideoMime({isTypeSupported:()=>false}),null);
 assert.equal(supportedVideoMime({isTypeSupported:t=>t==='video/webm'}),'video/webm');
 assert.equal(supportedVideoMime({isTypeSupported:t=>t==='video/mp4'}),'video/mp4');
});
