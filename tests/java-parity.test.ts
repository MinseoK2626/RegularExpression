import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync,writeFileSync,readFileSync,openSync,closeSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {compile,accepts} from '../src/engine';

test('unmodified Java and browser recognizers agree on 3,293 valid cases; document boxed-ID defect',()=>{
 const output=mkdtempSync(join(tmpdir(),'nfa-java-'));
 try {
  const sources=['reference/java/Main.java','reference/java/NFA.java','reference/java/QSig.java','tests/JavaParity.java'];
  const args=['-d',output,...sources];
  const compiler=process.env.ECJ_JAR?spawnSync('java',['-jar',process.env.ECJ_JAR,'-21',...args],{encoding:'utf8'}):spawnSync('javac',args,{encoding:'utf8'});
  assert.equal(compiler.status,0,`Java compilation failed. Install a JDK or set ECJ_JAR. ${compiler.error||compiler.stderr}`);
  let strings=[''];for(let n=1;n<=5;n++)strings.push(...strings.filter(s=>s.length===n-1).flatMap(s=>['a','7','?'].map(c=>s+c)));
  const expressions=['a','d','ad','aUdd','(ad)*','a*d','(dd)*(aa)*','a*Ud*','(ad)*aUdd'];
  const cases=expressions.flatMap(e=>strings.map(s=>[e,s]));
  for(const e of ['aadaUaaadaUaaadaa','(a)*dd(a)*','aaUdd','a*d'])for(const s of ['mrf8t','23','97','hello7'])cases.push([e,s]);
  cases.push(['a*','e']);
  assert.equal(cases.length,3293);
  const input=cases.map(([e,s])=>`0\t${e}\t${s}`).join('\n')+'\n128\ta\tb\n';
  writeFileSync(join(output,'input.txt'),input);
  const inFd=openSync(join(output,'input.txt'),'r'),outFd=openSync(join(output,'output.txt'),'w');
  const result=spawnSync('java',['-cp',output,'JavaParity'],{stdio:[inFd,outFd,'pipe'],encoding:'utf8',timeout:30000});
  closeSync(inFd);closeSync(outFd);
  assert.equal(result.status,0,result.stderr);
  const answers=readFileSync(join(output,'output.txt'),'utf8').trim().split('\n');assert.equal(answers.length,cases.length+1);
  cases.forEach(([e,s],i)=>assert.equal(answers[i],String(accepts(compile(e),s)),`${e} / ${s}`));
  // This is an observed original-code defect, not intended regex semantics.
  assert.equal(answers.at(-1),'false','Original Java lookup fails for separately boxed state ID 128');
  assert.equal(accepts(compile('a'),'b'),true);
 } finally {rmSync(output,{recursive:true,force:true})}
});
