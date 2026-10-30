// Pure expression-to-NFA construction and set-based string recognition.
// Adapted from the Java implementation retained in reference/java.
export type Edge = {from:number; to:number; symbol:'a'|'d'|'ε'};
export type Machine = {states:number[]; start:number; finals:number[]; edges:Edge[]};
export type Frame = {active:number[]; consumed:number; phase:string; edges:number[]};
export function compile(expression:string):Machine {
 if(expression.length>48) throw Error('Use at most 48 expression characters to keep the diagram readable.');
 if(!/^[ad]+(?:\*)?$/.test(expression) && !/^(?:[ad]\*?|\([ad]+\)\*)+(?:U(?:[ad]\*?|\([ad]+\)\*)+)*$/.test(expression)) throw Error('Use a, d, *, U, and groups such as (ad)*. Groups cannot contain U, *, or other groups.');
 let id=0;
 const base=():Machine=>{const start=id++;return {states:[start],start,finals:[],edges:[]}};
 const merge=(a:Machine,b:Machine)=>{a.states.push(...b.states);a.edges.push(...b.edges)};
 const edge=(m:Machine,from:number,to:number,symbol:Edge['symbol']='ε')=>m.edges.push({from,to,symbol});
 const star=(m:Machine)=>{const old=m.start;const next=id++;m.states.push(next);edge(m,next,old);m.finals.forEach(f=>edge(m,f,old));m.start=next;m.finals.push(next)};
 const concat=(a:Machine,b:Machine)=>{merge(a,b);a.finals.forEach(f=>edge(a,f,b.start));a.finals=[...b.finals]};
 const build=(exp:string):Machine=>{
  if(exp.includes('U')){const parts=exp.split('U');const a=build(parts[0]);for(const part of parts.slice(1)){const b=build(part);merge(a,b);const s=id++,f=id++;a.states.push(s,f);edge(a,s,a.start);edge(a,s,b.start);[...a.finals,...b.finals].forEach(q=>edge(a,q,f));a.start=s;a.finals=[f]}return a}
  let m:Machine,rest:string;
  if(exp[0]==='('){const close=exp.indexOf(')');m=build(exp.slice(1,close));star(m);rest=exp.slice(close+2)}
  else {m=base();const f=id++;m.states.push(f);m.finals=[f];edge(m,m.start,f,exp[0] as 'a'|'d');const starred=exp[1]==='*';if(starred)star(m);rest=exp.slice(starred?2:1)}
  if(rest)concat(m,build(rest));return m;
 }; return build(expression);
}
export function trace(m:Machine,input:string):Frame[]{
 const closure=(initial:number[])=>{const set=new Set(initial);let changed=true;while(changed){changed=false;for(const e of m.edges)if(e.symbol==='ε'&&set.has(e.from)&&!set.has(e.to)){set.add(e.to);changed=true}}return [...set].sort((a,b)=>a-b)};
 let active=closure([m.start]);const frames:Frame[]=[{active,consumed:0,phase:'Initial ε-closure',edges:[]}];
 for(let i=0;i<input.length;i++){const c=input[i];const symbol=/[a-z]/.test(c)?'a':/[0-9]/.test(c)?'d':c;const edges=m.edges.flatMap((e,j)=>e.symbol===symbol&&active.includes(e.from)?[j]:[]);active=closure(edges.map(j=>m.edges[j].to));frames.push({active,consumed:i+1,phase:`Read “${c}” → ${symbol}; then ε-closure`,edges})}return frames;
}
export function accepts(m:Machine,input:string){const frames=trace(m,input);return frames.at(-1)!.active.some(q=>m.finals.includes(q))}
