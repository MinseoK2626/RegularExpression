import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {methodSource} from './javaSource';
import {javaNotes} from './javaNotes';
import {compile,trace} from './engine';
test('all six Java methods and annotations resolve to actual source lines',()=>{
 for(const note of javaNotes){
  const original=readFileSync(`reference/java/${note.file}`,'utf8');
  const snippet=methodSource(original,note.id);
  assert(snippet.lines.length>15);assert(snippet.lines[0].includes(`${note.id}(`));assert.equal(snippet.lines.at(-1)!.trim(),'}');
  assert.deepEqual(original.split('\n').slice(snippet.line-1,snippet.line-1+snippet.lines.length),snippet.lines);
  for(const annotation of note.annotations)assert(snippet.lines.some(l=>l.includes(annotation[0])),`${note.id}: ${annotation[0]}`);
 }
});
test('no early acceptance and closure additions match real graph reachability',()=>{
 const m=compile('ad'),frames=trace(m,'a7b');
 assert(frames[2].active.some(q=>m.finals.includes(q)));assert.equal(frames[2].consumed,2);assert.equal(frames[3].active.length,0);
 const chain={states:[0,1,2,3],start:0,finals:[3],edges:[{from:2,to:3,symbol:'ε' as const},{from:1,to:2,symbol:'ε' as const},{from:0,to:1,symbol:'ε' as const},{from:3,to:0,symbol:'ε' as const}]};
 assert.deepEqual(trace(chain,'')[0].active,[0,1,2,3]);
});
