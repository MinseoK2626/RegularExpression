import source from './engine.ts?raw';
// Named boundaries live in the real source, so snippets cannot diverge from it.
export function excerpt(name:string){
 const lines=source.split('\n');const start=lines.findIndex(l=>l.trim()===`// @excerpt ${name}`);
 if(start<0)throw Error(`Missing engine excerpt: ${name}`);
 const end=lines.findIndex((l,i)=>i>start&&l.trim()==='// @endexcerpt');
 if(end<0)throw Error(`Unterminated engine excerpt: ${name}`);
 return {code:lines.slice(start+1,end).join('\n'),line:start+2};
}
