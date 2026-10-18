const assert = require('node:assert/strict');
const {buildSteps,EDGES}=require('../dist/engine.js');
const {LESSONS}=require('../dist/lessons.js');
let assertions=0;
function eq(a,b){assert.deepEqual(a,b);assertions++;}
function last(id,v){return buildSteps(id,v).at(-1);}
for(const l of LESSONS){const values=Object.fromEntries(l.fields.map(f=>[f.key,f.value]));const steps=buildSteps(l.id,values);assert(steps.length>1);for(const s of steps){assert(s.line>=1&&s.line<=l.code.split('\n').length,`${l.id}: invalid code line ${s.line}`);assert(s.title&&s.description&&s.kind);}assertions++;}
let seed=408;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
for(let k=0;k<300;k++){const a=Array.from({length:2+Math.floor(rand()*11)},()=>Math.floor(rand()*199)-99);eq(last('quick',{data:a.join(',')}).a,[...a].sort((a,b)=>a-b));}
for(const a of [[1,1,1],[1,2,3],[-3,-2,-1],[99,-99,0]])eq(last('quick',{data:a.join(',')}).a,[...a].sort((a,b)=>a-b));
for(let n=1;n<=10;n++)for(let p=1;p<=n+1;p++){const a=Array.from({length:n},(_,i)=>i);const b=[...a];b.splice(p-1,0,42);eq(last('seq',{data:a.join(','),pos:p,value:42,op:'insert'}).a,b);if(p<=n){const c=[...a];c.splice(p-1,1);eq(last('seq',{data:a.join(','),pos:p,value:0,op:'delete'}).a,c);}}
eq(last('stack',{data:'1,2,3',count:3}).removed,[3,2,1]);
const queue=last('queue',{data:'1,2,3,4,5,6,7,8'});eq(queue.removed,[1,2,3,4]);eq(queue.vars.size,4);eq(queue.front,4);eq(queue.rear,3);
for(let target=-4;target<=10;target++){const s=last('binary',{data:'-3,0,2,2,6,9',target});eq(s.title,[-3,0,2,6,9].includes(target)?'查找成功':'查找失败');}
eq(last('cache',{data:'0,1,4,0,1,5,1,2'}).vars.hits,1);
eq(last('lru',{data:'1,2,3,1,4',frames:3}).frames,[1,4,3]);
eq(last('lru',{data:'7,0,1,2,0,3,0,4',frames:3}).vars.faults,6);
eq(last('rr',{data:'5,3,6',quantum:2}).finish,[12,9,14]);
eq(last('rr',{data:'1',quantum:5}).finish,[1]);
eq(last('pipeline',{count:8}).cycle,12);
eq(last('tcp',{x:4294967295,y:4294967295}).nextX,0);
const floyd=Array.from({length:6},(_,i)=>Array.from({length:6},(_,j)=>i===j?0:1e6));for(const [a,b,w]of EDGES)floyd[a][b]=floyd[b][a]=w;for(let k=0;k<6;k++)for(let i=0;i<6;i++)for(let j=0;j<6;j++)floyd[i][j]=Math.min(floyd[i][j],floyd[i][k]+floyd[k][j]);
for(let i=0;i<6;i++){eq(last('dijkstra',{start:String.fromCharCode(65+i)}).dist,floyd[i]);eq(last('bfs',{start:String.fromCharCode(65+i)}).done.length,6);}
for(const [id,v] of [['quick',{data:'1,NaN'}],['quick',{data:'1'}],['seq',{data:'1',pos:0,value:1,op:'delete'}],['rr',{data:'1,0',quantum:2}],['stack',{data:'1',count:2}],['pipeline',{count:9}],['tcp',{x:-1,y:0}],['lru',{data:'-1',frames:3}]]){assert.throws(()=>buildSteps(id,v));assertions++;}
// A number's visual identity must follow the same item through every swap,
// even when different items have equal values. Backward playback reuses these snapshots.
for(const data of [[3,1,2],[5,5,1,5],[-2,0,-2,4],[4,3,2,1]]){
 const snapshots=buildSteps('quick',{data:data.join(',')});
 for(const s of snapshots){eq([...s.ids].sort((a,b)=>a-b),data.map((_,i)=>i));eq(s.ids.map(id=>data[id]),s.a);}
 const initial=[...snapshots[0].ids];snapshots.at(-1).ids[0]=-1;eq(snapshots[0].ids,initial);
}
eq(last('seq',{data:'1,2,3,4,5,6,7,8,9,10,11,12',op:'delete',pos:12,value:''}).a.length,11);
assert.throws(()=>buildSteps('seq',{data:'1,2,3,4,5,6,7,8,9,10,11,12',op:'insert',pos:1,value:8}));assertions++;
console.log(`PASS: ${assertions} checks; all 12 lessons, 304 quicksort inputs, stable motion identities, sequence positions, graph all-pairs oracle, edge cases and code-line mappings.`);

