// Slice the complete method from the real file; keep physical source line numbers.
export function methodSource(source:string,name:string){
 const lines=source.split('\n');
 const start=lines.findIndex(l=>new RegExp(`public (?:static )?\\w+(?:<[^>]+>)? ${name}\\(`).test(l));
 if(start<0)throw Error(`Missing Java method ${name}`);
 let depth=0,end=start;
 for(;end<lines.length;end++){
  // Java methods here have no braces in string literals; strip comments first.
  const code=lines[end].replace(/\/\/.*$/,'').replace(/\/\*.*?\*\//g,'');
  depth+=(code.match(/\{/g)||[]).length-(code.match(/\}/g)||[]).length;
  if(depth===0)break;
 }
 return {line:start+1,lines:lines.slice(start,end+1)};
}
