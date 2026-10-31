// Pure expression-to-NFA construction and set-based string recognition.
// Adapted from the Java implementation retained in reference/java.
// @excerpt representation
export type Edge = {from:number; to:number; symbol:'a'|'d'|'ε'};
export type Machine = {states:number[]; start:number; finals:number[]; edges:Edge[]};
export type Frame = {active:number[]; before:number[]; moved:number[]; consumed:number; character?:string; symbol?:string; phase:string; edges:number[]};
export type Construction = {operation:'symbol'|'concatenation'|'union'|'star'; expression:string; machine:Machine};
// @endexcerpt
export function compile(expression:string, onConstruction?:(stage:Construction)=>void):Machine {
 // @excerpt expression
 if(expression.length>48) throw Error('Use at most 48 expression characters to keep the diagram readable.');
 if(!/^[ad]+(?:\*)?$/.test(expression) && !/^(?:[ad]\*?|\([ad]+\)\*)+(?:U(?:[ad]\*?|\([ad]+\)\*)+)*$/.test(expression)) throw Error('Use a, d, *, U, and groups such as (ad)*. Groups cannot contain U, *, or other groups.');
 // @endexcerpt
 let id=0;
 const record=(operation:Construction['operation'],exp:string,m:Machine)=>{
  if(onConstruction) onConstruction({operation,expression:exp,machine:{states:[...m.states],start:m.start,finals:[...m.finals],edges:m.edges.map(e=>({...e}))}});
 };
 const base=():Machine=>{const start=id++;return {states:[start],start,finals:[],edges:[]}};
 const merge=(a:Machine,b:Machine)=>{a.states.push(...b.states);a.edges.push(...b.edges)};
 const edge=(m:Machine,from:number,to:number,symbol:Edge['symbol']='ε')=>m.edges.push({from,to,symbol});
 // @excerpt star
 const star=(m:Machine)=>{
  const old=m.start;const next=id++;m.states.push(next);
  edge(m,next,old);m.finals.forEach(f=>edge(m,f,old));
  m.start=next;m.finals.push(next);
 };
 // @endexcerpt
 // @excerpt concatenation
 const concat=(a:Machine,b:Machine)=>{
  merge(a,b);a.finals.forEach(f=>edge(a,f,b.start));a.finals=[...b.finals];
 };
 // @endexcerpt
 const build=(exp:string):Machine=>{
  // @excerpt union
  if(exp.includes('U')){
   const parts=exp.split('U');const a=build(parts[0]);
   for(let i=1;i<parts.length;i++){
    const b=build(parts[i]);merge(a,b);const s=id++,f=id++;a.states.push(s,f);
    edge(a,s,a.start);edge(a,s,b.start);
    [...a.finals,...b.finals].forEach(q=>edge(a,q,f));a.start=s;a.finals=[f];
    record('union',parts.slice(0,i+1).join('U'),a);
   }return a;
  }
  // @endexcerpt
  let m:Machine,rest:string;
  if(exp[0]==='('){
   const close=exp.indexOf(')');m=build(exp.slice(1,close));star(m);
   record('star',exp.slice(0,close+2),m);rest=exp.slice(close+2);
  }else {
   // @excerpt symbol
   m=base();const f=id++;m.states.push(f);m.finals=[f];
   edge(m,m.start,f,exp[0] as 'a'|'d');record('symbol',exp[0],m);
   // @endexcerpt
   const starred=exp[1]==='*';
   if(starred){star(m);record('star',exp.slice(0,2),m)}
   rest=exp.slice(starred?2:1);
  }
  // @excerpt construction
  if(rest){concat(m,build(rest));record('concatenation',exp,m)}
  return m;
  // @endexcerpt
 };return build(expression);
}
export function trace(m:Machine,input:string):Frame[]{
 // @excerpt closure
 const closure=(initial:number[])=>{
  const set=new Set(initial);let changed=true;
  while(changed){
   changed=false;
   for(const e of m.edges)if(e.symbol==='ε'&&set.has(e.from)&&!set.has(e.to)){
    set.add(e.to);changed=true;
   }
  }return [...set].sort((a,b)=>a-b);
 };
 // @endexcerpt
 let active=closure([m.start]);
 const frames:Frame[]=[{active,before:[m.start],moved:[m.start],consumed:0,phase:'Initial ε-closure',edges:[]}];
 // @excerpt transition
 for(let i=0;i<input.length;i++){
  const c=input[i];
  const symbol=/[a-z]/.test(c)?'a':/[0-9]/.test(c)?'d':c;
  const before=[...active];
  const edges=m.edges.flatMap((e,j)=>e.symbol===symbol&&active.includes(e.from)?[j]:[]);
  const moved=[...new Set(edges.map(j=>m.edges[j].to))];
  active=closure(moved);
  frames.push({active,before,moved,character:c,symbol,consumed:i+1,
   phase:`Read “${c}” → ${symbol}; then ε-closure`,edges});
 }
 // @endexcerpt
 return frames;
}
// @excerpt acceptance
export function accepts(m:Machine,input:string){
 const frames=trace(m,input);
 return frames.at(-1)!.active.some(q=>m.finals.includes(q));
}
// @endexcerpt
