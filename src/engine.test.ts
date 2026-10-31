import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compile,accepts,trace} from './engine';
test('recognition examples',()=>{for(const [exp,yes,no] of [['aadaUaaadaUaaadaa',['mrf8t','lab2d','bea3ch'],['mk5sc','lbh1']],['(a)*dd(a)*',['23','a56','bas98edd'],['as98f7f']]] as const){const m=compile(exp);yes.forEach(s=>assert.equal(accepts(m,s),true,s));no.forEach(s=>assert.equal(accepts(m,s),false,s))}});
test('epsilon acceptance and full-string rejection',()=>{assert(accepts(compile('(ad)*'),''));assert(accepts(compile('(ad)*'),'e1b2'));assert(!accepts(compile('(ad)*'),'e'));assert(!accepts(compile('ad'),'a1b'));assert(!accepts(compile('a'),'A'));assert(!accepts(compile('a'),'?'));assert(accepts(compile('a*d'),'7'))});
test('restricted grammar rejects unsupported forms',()=>{for(const s of ['','aU','Ua','(aUdd)*','(a*)*','((ad)*)*','(ad)','a**'])assert.throws(()=>compile(s),s)});
test('trace preserves epsilon closure and input position',()=>{const m=compile('(ad)*');const f=trace(m,'a1');assert.equal(f.length,3);assert(f[0].active.includes(m.start));assert(f[0].active.length>1);assert.equal(f[2].consumed,2);assert(f[2].active.some(q=>m.finals.includes(q)))});
test('bounded exhaustive comparison with independent language oracle',()=>{const expressions=['a','d','ad','aUdd','(ad)*','a*d','(dd)*(aa)*','a*Ud*','(ad)*aUdd'];let strings=[''];for(let n=1;n<=5;n++){const prev=strings.filter(s=>s.length===n-1);strings.push(...prev.flatMap(s=>['a','7','?'].map(c=>s+c)))}for(const exp of expressions){const m=compile(exp);const oracle=new RegExp('^(?:'+exp.replaceAll('a','[a-z]').replaceAll('d','[0-9]').replaceAll('U','|')+')$');for(const s of strings)assert.equal(accepts(m,s),oracle.test(s),exp+' / '+s)}});
test('construction tracing preserves results and immutable intermediate machines',()=>{
 for(const exp of ['a','ad','aaUdd','(ad)*','a*dUdd']){
  const stages:import('./engine').Construction[]=[];
  const machine=compile(exp,s=>stages.push(s));
  assert.deepEqual(machine,compile(exp));assert.deepEqual(stages.at(-1)!.machine,machine);
  stages.forEach(s=>{assert(s.machine.states.includes(s.machine.start));assert(s.machine.finals.every(q=>s.machine.states.includes(q)));assert(s.machine.edges.every(e=>s.machine.states.includes(e.from)&&s.machine.states.includes(e.to)))});
  assert.equal(stages[0].machine.states.length,2);assert.equal(stages[0].machine.edges.length,1);
  const original=machine.edges[0].to;stages[0].machine.edges[0].to=-1;assert.equal(machine.edges[0].to,original);
 }
 const operations=new Set<import('./engine').Construction['operation']>();compile('(ad)*Udd',s=>operations.add(s.operation));assert.deepEqual([...operations].sort(),['concatenation','star','symbol','union']);
});
test('operation metadata exposes actual before, matching edges and closure',()=>{
 const m=compile('(ad)*');const frames=trace(m,'a1?');
 for(let i=1;i<frames.length;i++){
  const f=frames[i];assert.deepEqual(f.before,frames[i-1].active);
  assert.equal(f.character,'a1?'[i-1]);
  assert.deepEqual(f.edges,m.edges.flatMap((e,j)=>e.symbol===f.symbol&&f.before.includes(e.from)?[j]:[]));
  assert.deepEqual(f.moved,[...new Set(f.edges.map(j=>m.edges[j].to))]);
  assert(f.moved.every(q=>f.active.includes(q)));
 }
 assert.deepEqual(frames.at(-1)!.active,[]);assert.equal(frames[2].symbol,'d');
});
