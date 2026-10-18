'use strict';
// Snapshot the currently painted position, then animate to the next real state.
// Stable item identities distinguish equal numbers during sorting.
const LabMotion = (() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = true, scene = null, lastPosition = -1;
  try { enabled = localStorage.getItem('cs408-motion') !== 'off'; } catch {}
  const active = () => enabled && !preference.matches;
  const duration = () => Math.min(620, Math.max(180, Number(document.querySelector('#speed').value) * .76));
  const easing = 'cubic-bezier(.22,1,.36,1)';
  const nodes = root => [...root.querySelectorAll('[data-motion]')];
  function syncButton() {
    document.body.classList.toggle('motion-off', !active());
    const button = document.querySelector('#motion-toggle');
    if (button) { button.textContent = active() ? '✦ 动效开启' : '✧ 简洁动效'; button.setAttribute('aria-pressed', String(active())); }
  }
  function cancel() {
    document.querySelectorAll('.motion-ghost,.motion-packet,.celebration').forEach(el => el.remove());
    document.querySelectorAll('#visual,#visual *,#step-title,#step-description,.variable,.page-heading,.fact,.experiment,.tab-panel').forEach(el => el.getAnimations().forEach(a => a.cancel()));
  }
  function toggle() { enabled = !active(); try { localStorage.setItem('cs408-motion', enabled ? 'on' : 'off'); } catch {} cancel(); syncButton(); }
  function reveal(el, delay = 0) {
    if (active() && el) {
      el.getAnimations().forEach(animation=>animation.cancel());
      el.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}], {duration:Math.min(duration(),360),delay,easing});
    }
  }
  function enterLesson(group) {
    scene = null; lastPosition = -1;
    document.body.dataset.subject = group;
    cancel(); syncButton();
    reveal(document.querySelector('.page-heading'));
    document.querySelectorAll('.fact').forEach((el,i) => reveal(el,70+i*45));
    reveal(document.querySelector('.experiment'),100);
  }
  function decorate(root,s) {
    const key = (el,id) => { if(el) el.dataset.motion=id; };
    if(s.kind==='bars') root.querySelectorAll('.bar').forEach((el,i)=>key(el,'bar:'+(s.ids?.[i]??i)));
    if(['array','queue'].includes(s.kind)) root.querySelectorAll('.cell').forEach((el,i)=>key(el,'slot:'+i));
    if(s.kind==='stack') root.querySelectorAll('.stack .cell').forEach((el,i)=>key(el,'stack:'+i));
    if(s.kind==='lru') root.querySelectorAll('.array-row .cell').forEach((el,i)=>key(el,s.frames[i]===null?'empty:'+i:'page:'+s.frames[i]));
    if(s.kind==='graph') {root.querySelectorAll('circle').forEach((el,i)=>key(el,'vertex:'+i));root.querySelectorAll('.edge').forEach((el,i)=>key(el,'edge:'+i));}
    if(s.kind==='tcp') root.querySelectorAll('line[marker-end]').forEach((el,i)=>key(el,'packet-line:'+i));
    root.querySelectorAll('.matrix tbody tr').forEach((row,r)=>row.querySelectorAll('td').forEach((el,c)=>key(el,s.kind==='pipeline'&&el.classList.contains('active')?'instruction:'+r:`table:${r}:${c}`)));
    root.querySelectorAll('.gantt-block').forEach((el,i)=>key(el,'run:'+i));
    root.querySelectorAll('.metric-chip').forEach((el,i)=>key(el,'process:'+i));
  }
  function sendPacket(line,ms,reverse=false) {
    const svg=line.ownerSVGElement;if(!svg)return;
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('r','4');dot.setAttribute('class','motion-packet');dot.setAttribute('aria-hidden','true');svg.append(dot);
    const from=`translate(${line.getAttribute(reverse?'x2':'x1')}px,${line.getAttribute(reverse?'y2':'y1')}px)`;
    const to=`translate(${line.getAttribute(reverse?'x1':'x2')}px,${line.getAttribute(reverse?'y1':'y2')}px)`;
    const animation=dot.animate([{transform:from,opacity:0},{transform:from,opacity:1,offset:.08},{transform:to,opacity:1,offset:.9},{transform:to,opacity:0}],{duration:ms,easing:'ease-in-out'});
    animation.onfinish=()=>dot.remove();
  }
  function render(root,html,s,lessonId,position,total) {
    const sameScene=scene===lessonId, changed=lastPosition!==position;
    const old=new Map();
    if(sameScene) nodes(root).forEach(el=>old.set(el.dataset.motion,{rect:el.getBoundingClientRect(),className:el.getAttribute('class'),text:el.textContent,background:getComputedStyle(el).backgroundColor,clone:el.cloneNode(true)}));
    root.querySelectorAll('.motion-ghost').forEach(el=>el.remove());
    const previousPosition=lastPosition;
    root.innerHTML=html;decorate(root,s);scene=lessonId;lastPosition=position;
    root.dataset.kind=s.kind;
    const completed=position===total-1;
    document.querySelector('.experiment').classList.toggle('is-complete',completed);
    document.querySelector('#scene-progress').style.width=(position/(total-1)*100)+'%';
    document.querySelector('#stage-step').textContent=String(position+1).padStart(2,'0');
    if(!active()||!changed&&sameScene)return;
    const ms=duration(), current=new Set();
    nodes(root).forEach((el,i)=>{
      const id=el.dataset.motion;current.add(id);let before=old.get(id);
      // A sequential-list shift is a copy operation, so animate its destination
      // from the source slot while retaining the source until the next copy.
      if(s.kind==='array'&&position===previousPosition+1&&s.active.length===2) {
        const [a,b]=s.active;const dest=s.line===6?b:a,source=s.line===6?a:b;
        if(id==='slot:'+dest)before=old.get('slot:'+source);
      }
      if(el.tagName.toLowerCase()==='line') {
        if((s.kind==='tcp'||el.classList.contains('done'))&&(!before||before.className!==el.getAttribute('class'))) {
          const len=Math.hypot(Number(el.getAttribute('x2'))-Number(el.getAttribute('x1')),Number(el.getAttribute('y2'))-Number(el.getAttribute('y1')));
          const edge=s.kind==='graph'?EDGES[Number(id.split(':')[1])]:null;
          const reverse=edge&&s.parents[edge[0]]===edge[1];
          el.animate([{strokeDasharray:len,strokeDashoffset:reverse?-len:len},{strokeDasharray:len,strokeDashoffset:0}],{duration:ms,easing});sendPacket(el,ms,reverse);
        }return;
      }
      const after=el.getBoundingClientRect();
      if(before) {
        const dx=before.rect.left-after.left,dy=before.rect.top-after.top;
        if(Math.abs(dx)+Math.abs(dy)>1) {
          // A small lifted arc makes exchanges legible without changing values.
          const arc=s.kind==='bars'?(dx>0?-24:24):-10;
          el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:`translate(${dx*.5}px,${dy*.5+arc}px)`,offset:.45},{transform:'translate(0,0)'}],{duration:ms,easing});
        } else if(before.text!==el.textContent||before.className!==el.getAttribute('class')) {
          if(el.tagName.toLowerCase()==='circle')el.animate([{strokeWidth:2,filter:'brightness(1)'},{strokeWidth:6,filter:'brightness(1.8)'},{strokeWidth:2,filter:'brightness(1)'}],{duration:ms});
          else el.animate([{backgroundColor:before.background,filter:'brightness(1)'},{filter:'brightness(1.3)',offset:.35},{backgroundColor:getComputedStyle(el).backgroundColor,filter:'brightness(1)'}],{duration:ms,easing});
        }
      } else if(el.tagName.toLowerCase()!=='circle') {
        el.animate([{opacity:0,transform:`translateY(${s.kind==='stack'?-45:16}px) scale(.88)`},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:ms,delay:sameScene?0:Math.min(i*22,180),easing});
      }
    });
    if(sameScene&&['stack','lru'].includes(s.kind)) {
      const area=root.getBoundingClientRect();
      old.forEach((item,id)=>{if(current.has(id)||!id.startsWith(s.kind==='stack'?'stack:':'page:'))return;
        const ghost=item.clone;ghost.classList.add('motion-ghost');ghost.removeAttribute('data-motion');ghost.setAttribute('aria-hidden','true');
        Object.assign(ghost.style,{position:'absolute',left:item.rect.left-area.left+'px',top:item.rect.top-area.top+'px',width:item.rect.width+'px',height:item.rect.height+'px',margin:0,pointerEvents:'none'});root.append(ghost);
        const a=ghost.animate([{opacity:.85,transform:'translate(0,0)'},{opacity:0,transform:'translate(35px,-45px) scale(.8)'}],{duration:ms,easing});a.onfinish=()=>ghost.remove();
      });
    }
    reveal(document.querySelector('#step-title'));reveal(document.querySelector('#step-description'),25);
    document.querySelectorAll('.variable').forEach((el,i)=>reveal(el,Math.min(i*20,80)));
    if(completed&&position!==previousPosition) celebrate(root);
  }
  function celebrate(root) {
    if(!active())return;
    const layer=document.createElement('div');layer.className='celebration';layer.setAttribute('aria-hidden','true');root.append(layer);
    for(let i=0;i<16;i++) {const dot=document.createElement('i');dot.style.background=['#5ce6c3','#a99bff','#ffcc72','#71c8ff'][i%4];layer.append(dot);const angle=i*Math.PI/8;const a=dot.animate([{transform:'translate(0,0) scale(0)',opacity:0},{opacity:1,offset:.15},{transform:`translate(${Math.cos(angle)*135}px,${Math.sin(angle)*75}px) rotate(${i*35}deg) scale(.7)`,opacity:0}],{duration:850,easing:'cubic-bezier(.1,.8,.3,1)'});if(i===15)a.onfinish=()=>layer.remove();}
  }
  preference.addEventListener('change',()=>{cancel();syncButton();});
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||!active())return;button.animate([{scale:'.96'},{scale:'1'}],{duration:250,easing});if(button.matches('[data-tab]'))requestAnimationFrame(()=>reveal(document.querySelector('.tab-panel:not([hidden])')));});
  return {render,enterLesson,toggle,syncButton,reset:()=>{scene=null;lastPosition=-1;},cancel};
})();
