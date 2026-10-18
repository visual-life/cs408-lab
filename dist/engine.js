'use strict';
const EDGES = [[0,1,4],[0,2,2],[1,2,1],[1,3,5],[2,3,8],[2,4,10],[3,4,2],[3,5,6],[4,5,3]];
const letter = n => String.fromCharCode(65+n);
function int(value,label,min,max){const n=Number(value);if(String(value).trim()===''||!Number.isInteger(n)||n<min||n>max)throw new Error(`${label}须为 ${min}～${max} 的整数。`);return n;}
function numbers(raw,minCount=1,maxCount=12,min=-99,max=99){if(!String(raw).trim())throw new Error('请先输入一组整数。');const pieces=String(raw).trim().split(/[,，\s]+/);if(pieces.some(x=>x===''))throw new Error('请检查多余的分隔符。');if(pieces.length<minCount||pieces.length>maxCount)throw new Error(`请输入 ${minCount}～${maxCount} 个整数。`);return pieces.map(x=>int(x,'元素',min,max));}
function buildSteps(id,values){
 const out=[];
 const add=(title,description,state={},vars={},line=1)=>{out.push(JSON.parse(JSON.stringify({title,description,vars,line,...state})));};
 if(id==='quick'){
  const a=numbers(values.data,2,12),done=[],ids=a.map((_,i)=>i);
  const shot=(title,desc,active=[],pivot=-1,lo=0,hi=a.length-1,vars={},line=1)=>add(title,desc,{kind:'bars',a,ids,active,pivot,done,lo,hi},vars,line);
  shot('准备划分','从整个数组开始，先选择当前区间的最后一个元素为基准。',[],-1,0,a.length-1,{'区间':`[0, ${a.length-1}]`},15);
  function sort(lo,hi){if(lo>hi)return;if(lo===hi){done.push(lo);shot('单元素区间','只有一个元素的区间天然有序。',[],-1,lo,hi,{},16);return;}let i=lo-1,pivot=a[hi];
   shot('选定基准',`选取 A[${hi}] = ${pivot} 为 pivot。紫色表示基准元素。`,[],hi,lo,hi,{lo,hi,i,pivot},5);
   for(let j=lo;j<hi;j++){
    shot('比较当前元素',`比较 A[${j}] = ${a[j]} 与 pivot = ${pivot}。`,[j],hi,lo,hi,{i,j,pivot},7);
    if(a[j]<pivot){i++;[a[i],a[j]]=[a[j],a[i]];[ids[i],ids[j]]=[ids[j],ids[i]];shot(i===j?'扩展较小区域':'交换到左侧',i===j?`元素已在正确一侧，i 增加到 ${i}。`:`交换 A[${i}] 和 A[${j}]，使 [${lo}, ${i}] 都小于基准。`,[i,j],hi,lo,hi,{i,j,pivot},9);}
    else shot('保留在右侧',`${a[j]} 不小于 ${pivot}，i 保持不变，继续扫描。`,[j],hi,lo,hi,{i,j,pivot},7);
   }
   const p=i+1;[a[p],a[hi]]=[a[hi],a[p]];[ids[p],ids[hi]]=[ids[hi],ids[p]];done.push(p);shot('基准归位',`基准 ${pivot} 位于下标 ${p}，这一位置已经最终确定。`,[p],-1,lo,hi,{p,pivot},12);
   sort(lo,p-1);sort(p+1,hi);
  }sort(0,a.length-1);shot('排序完成','所有基准和子区间都已确定，数组已按升序排列。',[],-1,0,a.length-1,{'元素数':a.length},20);
 }
 if(id==='seq'){
  const a=numbers(values.data,1,12),original=a.length,insert=values.op==='insert',pos=int(values.pos,'位置',1,original+(insert?1:0)),x=insert?int(values.value,'插入值',-99,99):0;let n=original;
  if(insert&&n===12)throw new Error('顺序表已满（容量 12），无法继续插入。');
  const shot=(t,d,active,line)=>add(t,d,{kind:'array',a,active,done:[],slots:Math.min(12,Math.max(original+1,a.length)),n},{length:n,position:pos},line);
  shot('初始顺序表',`有效长度为 ${n}，目标位置 ${pos} 对应下标 ${pos-1}。`,[],insert?4:12);
  if(insert){for(let j=n;j>=pos;j--){a[j]=a[j-1];shot('元素向右移动',`将下标 ${j-1} 的 ${a[j-1]} 复制到下标 ${j}，为插入腾出空间。`,[j-1,j],6);}a[pos-1]=x;shot('写入新元素',`将 ${x} 写到下标 ${pos-1}。`,[pos-1],7);n++;shot('插入完成',`长度变为 ${n}，共移动 ${original-pos+1} 个元素。`,[pos-1],8);}
  else{const removed=a[pos-1];for(let j=pos;j<n;j++){a[j-1]=a[j];shot('元素向左移动',`将下标 ${j} 的 ${a[j]} 复制到下标 ${j-1}。`,[j-1,j],14);}a.pop();n--;shot('删除完成',`已删除 ${removed}，长度变为 ${n}，共移动 ${original-pos} 个元素。`,[],15);}
 }
 if(id==='stack'){
  const data=numbers(values.data,1,8),count=int(values.count,'出栈个数',0,data.length),a=[],removed=[];
  const shot=(t,d,line)=>add(t,d,{kind:'stack',a,removed,active:a.length-1},{top:a.length-1,size:a.length},line);
  shot('初始化空栈','top = −1，代表栈中没有元素。',3);
  for(const x of data){a.push(x);shot('入栈 Push',`先将 top 加 1，再把 ${x} 写入栈顶。`,6);}
  for(let i=0;i<count;i++){const x=a.pop();removed.push(x);shot('出栈 Pop',`取出栈顶 ${x}，随后 top 减 1。`,11);}
  shot('操作完成',`栈中剩余 ${a.length} 个元素，出栈序列：${removed.join(' → ')||'空'}。`,12);
 }
 if(id==='queue'){
  const data=numbers(values.data,4,8),a=Array(5).fill(null),removed=[];let front=0,rear=0;
  const shot=(t,d,active=[],line=3)=>add(t,d,{kind:'queue',a,front,rear,active,removed},{front,rear,size:(rear-front+5)%5},line);
  shot('初始化循环队列','front 与 rear 都为 0。数组有 5 个槽位，可存 4 个元素。');
  for(const x of data){if((rear+1)%5===front){const old=front,y=a[front];removed.push(y);a[front]=null;front=(front+1)%5;shot('队满，先出队',`队满条件成立。取出队头 ${y}，front 前进一格。`,[old],13);}const idx=rear;a[rear]=x;rear=(rear+1)%5;shot('元素入队',`在槽位 ${idx} 写入 ${x}，rear = (${idx}+1) mod 5 = ${rear}。`,[idx],7);}
  shot('操作完成','front 指向队头，rear 指向下次插入的位置；指针通过取模循环。');
 }
 if(id==='binary'){
  const a=numbers(values.data,1,12).sort((x,y)=>x-y),target=int(values.target,'目标值',-99,99);let lo=0,hi=a.length-1,found=-1;
  const shot=(t,d,mid=-1,line=2)=>add(t,d,{kind:'bars',a,active:mid<0?[]:[mid],done:found<0?[]:[found],lo,hi,pivot:-1},{lo,hi,mid:mid<0?'—':mid,target},line);
  shot('建立有序区间','输入已升序排列，开始在整个闭区间 [lo, hi] 中查找。');
  while(lo<=hi){const mid=lo+Math.floor((hi-lo)/2);shot('检查中间元素',`mid = ${mid}，A[mid] = ${a[mid]}，目标为 ${target}。`,mid,4);if(a[mid]===target){found=mid;shot('查找成功',`在下标 ${mid}（第 ${mid+1} 个位置）找到 ${target}。`,mid,5);break;}if(a[mid]<target){lo=mid+1;shot('缩小到右半区',`${a[mid]} < ${target}，更新 lo = ${lo}。`, -1,7);}else{hi=mid-1;shot('缩小到左半区',`${a[mid]} > ${target}，更新 hi = ${hi}。`,-1,9);}}
  if(found<0)shot('查找失败','lo > hi，候选区间为空，返回 −1。',-1,11);
 }
 if(id==='bfs'){
  const s='ABCDEF'.indexOf(values.start);if(s<0)throw new Error('请选择有效起点。');const q=[s],seen=[s],done=[],parents=Array(6).fill(-1);let active=s;
  const shot=(t,d,line)=>add(t,d,{kind:'graph',done,seen,active,parents,weighted:false,queue:q},{'队列':q.map(letter).join(' → ')||'空','已访问':done.map(letter).join(' ')||'无'},line);
  shot('起点入队',`标记 ${letter(s)} 为已发现，将它加入队列。`,5);
  while(q.length){const u=q.shift();active=u;done.push(u);shot('取出队头',`访问 ${letter(u)}，按字母顺序检查它的邻接点。`,7);const neighbors=EDGES.filter(e=>e[0]===u||e[1]===u).map(e=>e[0]===u?e[1]:e[0]).sort((a,b)=>a-b);for(const v of neighbors){if(!seen.includes(v)){seen.push(v);parents[v]=u;q.push(v);shot('发现新顶点',`${letter(v)} 首次被发现，立即标记并加入队尾。`,13);}}}
  active=-1;shot('遍历完成',`队列为空，访问顺序为 ${done.map(letter).join(' → ')}。`,17);
 }
 if(id==='cache'){
  const data=numbers(values.data,1,20,0,99),lines=Array.from({length:4},()=>({block:null,tag:null}));let hits=0,misses=0;
  const shot=(t,d,index=-1,line=1,hit=null)=>add(t,d,{kind:'cache',lines,data,index,active:index<0?-1:data[index]%4,hit},{hits,misses,'命中率':(hits+misses?100*hits/(hits+misses):0).toFixed(1)+'%'},line);
  shot('Cache 为空','4 行的有效位均为 0，首次访问任意块都不命中。');
  data.forEach((b,i)=>{const row=b%4,tag=Math.floor(b/4);shot('定位 Cache 行',`块 ${b} → 行 ${row}，标记为 ${tag}，比较有效位与标记。`,i,4);if(lines[row].block===b){hits++;shot('Cache 命中',`行 ${row} 有效且标记匹配，直接读取块 ${b}。`,i,6,true);}else{const old=lines[row].block;misses++;lines[row]={block:b,tag};shot(old===null?'装入空闲行':'发生冲突替换',old===null?`将块 ${b} 装入行 ${row}，设置标记与有效位。`:`块 ${old} 与块 ${b} 映射到同一行 ${row}，原块被覆盖。`,i,9,false);}});
  shot('访问结束',`共 ${data.length} 次访问，${hits} 次命中，${misses} 次不命中。`,data.length-1,11);
 }
 if(id==='pipeline'){
  const n=int(values.count,'指令条数',2,8);for(let cycle=0;cycle<=n+4;cycle++)add(cycle===0?'准备执行':cycle===n+4?'全部指令完成':`第 ${cycle} 个时钟周期`,cycle===0?'每条指令依次经过 IF、ID、EX、MEM、WB 五个阶段。':`本周期最多有 5 条指令处于不同阶段，已完成 ${Math.min(n,Math.max(0,cycle-4))} 条。`,{kind:'pipeline',n,cycle},{cycle,completed:Math.min(n,Math.max(0,cycle-4)),'串行周期':5*n,'理想总周期':n+4},cycle===0?1:6);
 }
 if(id==='lru'){
  const data=numbers(values.data,1,20,0,99),n=int(values.frames,'页框数',2,4),frames=Array(n).fill(null),times=Array(n).fill(-1),history=[];let hits=0,faults=0;
  const shot=(t,d,index=-1,active=-1,line=1)=>add(t,d,{kind:'lru',data,frames,times,history,index,active},{hits,faults,'缺页率':(hits+faults?100*faults/(hits+faults):0).toFixed(1)+'%'},line);
  shot('页框初始化','所有页框为空，开始按顺序访问页面。');
  data.forEach((page,i)=>{let slot=frames.indexOf(page),hit=slot!==-1,old=null;if(hit){hits++;times[slot]=i;}else{faults++;slot=frames.indexOf(null);if(slot===-1)slot=times.indexOf(Math.min(...times));old=frames[slot];frames[slot]=page;times[slot]=i;}history.push({frames:[...frames],hit,slot});shot(hit?'页面命中':old===null?'缺页，装入页面':'缺页，LRU 置换',hit?`页 ${page} 已在页框 ${slot} 中，更新最近使用时间。`:old===null?`页 ${page} 不在内存中，装入空页框 ${slot}。`:`页 ${old} 最久未被访问，将它替换为页 ${page}。`,i,slot,hit?6:12);});
  shot('访问结束',`共 ${faults} 次缺页与 ${hits} 次命中。最近访问时间越小，下次越优先被淘汰。`,data.length-1,-1,13);
 }
 if(id==='rr'){
  const bursts=numbers(values.data,1,5,1,12),quantum=int(values.quantum,'时间片',1,5),remaining=[...bursts],ready=bursts.map((_,i)=>i),finish=Array(bursts.length).fill(null),gantt=[];let clock=0;
  const shot=(t,d,active=-1,line=1)=>add(t,d,{kind:'rr',remaining,ready,finish,bursts,gantt,active,clock},{clock,quantum,'就绪队列':ready.map(i=>'P'+(i+1)).join(' → ')||'空'},line);
  shot('进程全部到达','所有进程在 t=0 到达，按 P1、P2… 的顺序等待。');
  while(ready.length){const p=ready.shift(),run=Math.min(quantum,remaining[p]);shot('分配 CPU',`P${p+1} 剩余 ${remaining[p]}，本轮运行 ${run} 个时间单位。`,p,5);const start=clock;clock+=run;remaining[p]-=run;gantt.push({p,start,end:clock});if(remaining[p]>0){ready.push(p);shot('时间片用尽',`P${p+1} 尚余 ${remaining[p]}，回到就绪队列尾部。`,p,9);}else{finish[p]=clock;shot('进程完成',`P${p+1} 在 t=${clock} 完成，等待时间为 ${clock-bursts[p]}。`,p,11);}}
  shot('调度完成',`总耗时 ${clock}，平均周转时间 ${(finish.reduce((a,b)=>a+b,0)/finish.length).toFixed(2)}。`,-1,12);
 }
 if(id==='tcp'){
  const x=int(values.x,'客户端序号',0,4294967295),y=int(values.y,'服务端序号',0,4294967295),nextX=(x+1)%4294967296,nextY=(y+1)%4294967296;
  const phases=[['等待连接','客户端主动打开之前，服务端已处于监听状态。','CLOSED','LISTEN',1],['发送 SYN',`客户端发送 SYN，seq=${x}，进入 SYN-SENT。`,'SYN-SENT','LISTEN',2],['发送 SYN + ACK',`服务端收到 SYN，返回 seq=${y}、ack=${nextX}，进入 SYN-RECEIVED。`,'SYN-SENT','SYN-RECEIVED',4],['发送 ACK',`客户端收到应答，发送 seq=${nextX}、ack=${nextY} 的纯 ACK，进入 ESTABLISHED。`,'ESTABLISHED','SYN-RECEIVED',7],['连接建立','服务端收到第三次握手的 ACK，双方均进入 ESTABLISHED。','ESTABLISHED','ESTABLISHED',10]];
  phases.forEach((p,phase)=>add(p[0],p[1],{kind:'tcp',phase,x,y,nextX,nextY,client:p[2],server:p[3]},{'客户端':p[2],'服务端':p[3]},p[4]));
 }
 if(id==='dijkstra'){
  const s='ABCDEF'.indexOf(values.start);if(s<0)throw new Error('请选择有效源点。');const dist=Array(6).fill(1000000),done=[],parents=Array(6).fill(-1);dist[s]=0;
  const shot=(t,d,active=-1,line=6)=>add(t,d,{kind:'graph',dist,done,parents,active,weighted:true},{'源点':letter(s),'已确定':done.map(letter).join(' ')||'无'},line);
  shot('初始化距离',`源点 ${letter(s)} 的距离为 0，其他顶点的距离为 ∞。`);
  for(let k=0;k<6;k++){let u=-1;for(let v=0;v<6;v++)if(!done.includes(v)&&(u===-1||dist[v]<dist[u]))u=v;if(u===-1||dist[u]===1000000)break;done.push(u);shot('确定最近顶点',`顶点 ${letter(u)} 在未确定集合中距离最小，最短距离 ${dist[u]} 被确定。`,u,12);for(const [a,b,w]of EDGES){if(a!==u&&b!==u)continue;const v=a===u?b:a;if(!done.includes(v)&&dist[u]+w<dist[v]){const old=dist[v];dist[v]=dist[u]+w;parents[v]=u;shot('松弛相邻边',`经由 ${letter(u)} 到达 ${letter(v)} 的距离为 ${dist[u]}+${w}=${dist[v]}，优于原距离 ${old===1000000?'∞':old}。`,v,15);}}}
  shot('最短路径计算完成','所有顶点的最短距离已确定，绿色边组成最短路径树。',-1,19);
 }
 if(!out.length)throw new Error('未找到实验。');return out;
}
if(typeof module!=='undefined')module.exports={buildSteps,numbers,EDGES};
