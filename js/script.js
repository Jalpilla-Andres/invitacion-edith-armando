const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

$$('[data-name]').forEach(e=>{e.innerHTML=CONFIG.nombre.split(' ').map(w=>w==='&'?'<span class="amp">&amp;</span>':'<span>'+w+'</span>').join('');e.setAttribute('aria-label',CONFIG.nombre)});
const nums=t=>t.toUpperCase().replace(/\d+/g,'<span class="num">$&</span>');
$$('[data-fecha]').forEach(e=>e.innerHTML=nums(CONFIG.fecha));
$$('[data-hora]').forEach(e=>e.innerHTML=nums(CONFIG.hora));
$('[data-lugar]').textContent=CONFIG.lugar;
$('[data-dir]').textContent=CONFIG.direccion;

function wire(btn,hint,url,msg){
  if(url){btn.href=url;btn.target='_blank';btn.rel='noopener'}
  else{btn.setAttribute('aria-disabled','true');btn.addEventListener('click',e=>e.preventDefault());hint.textContent=msg}
}
wire($('#bMapa'),$('#hMapa'),CONFIG.mapsUrl,'Ubicación próximamente');

$$('[data-words]').forEach(p=>{const o=+(p.dataset.delay||0);p.innerHTML=p.textContent.trim().split(/\s+/).map((w,i)=>`<span class="w" style="--i:${i+o}">${w}</span>`).join(' ')});
/* destellos alrededor del nombre */
$$('.nwrap').forEach(w=>{for(let i=0;i<9;i++){const s=document.createElement('i');s.className='sp';
  s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;--s:${8+Math.random()*12}px;--t:${2.5+Math.random()*2.5}s;--d:${Math.random()*4}s`;w.appendChild(s)}});

/* destellos en todo el fondo */
const sk=$('#sk');
if(!reduce){const n=innerWidth<600?16:28;for(let i=0;i<n;i++){const s=document.createElement('i');s.className='sp';s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;--s:${5+Math.random()*13}px;--t:${3+Math.random()*4}s;--d:${-Math.random()*7}s`;sk.appendChild(s)}}
/* globos */
const bl=$('#bl'),pal=[['#f3e2b8','#b8964f'],['#e8dcc6','#b9a27a'],['#e6c987','#a8823a'],['#f6efe0','#c7b28a'],['#d9c08f','#8f6f2e']];
function balloon(i,once){
  const [c1,c2]=pal[i%pal.length],left=i%2===0,w=34+Math.random()*34;
  const b=document.createElement('div');b.className='b'+(once?' once':'');
  const x=left?2+Math.random()*12:80+Math.random()*12;
  b.style.cssText=`--x:${x}%;--c1:${c1};--c2:${c2};--w:${w}px;--o:${.55+w/160};--dur:${once?9+Math.random()*5:26+Math.random()*22}s;--del:${once?Math.random()*1.8:-Math.random()*40}s`;
  b.dataset.depth=(w/70).toFixed(2);b.appendChild(document.createElement('div'));bl.appendChild(b);return b;
}
if(!reduce){for(let i=0;i<7;i++)balloon(i)}

/* parallax de globos con el scroll */
const dn=$('#dn');
function arrow(){const y=scrollY,end=document.documentElement.scrollHeight-innerHeight-40;dn.classList.toggle('show',y>innerHeight*.6&&y<end)}
dn.addEventListener('click',()=>scrollBy({top:innerHeight*.85,behavior:reduce?'auto':'smooth'}));
let tick=false;const bs=bl.getElementsByClassName('b');
addEventListener('scroll',()=>{if(tick)return;tick=true;requestAnimationFrame(()=>{const y=scrollY;for(let i=0;i<bs.length;i++){const b=bs[i];b.firstChild.style.transform=`translate3d(0,${-y*(b._k||(b._k=+b.dataset.depth))*.12}px,0)`}arrow();tick=false})},{passive:true});
addEventListener('resize',arrow);addEventListener('load',arrow);

/* confeti en canvas */
const cv=$('#cv'),cx=cv.getContext('2d');let W,H,dpr,parts=[],run=false;
function size(){dpr=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
size();addEventListener('resize',size);
const cc=['#f3e2b8','#d9c08f','#e8dcc6','#c9a96e','#fffaf0','#e6c987'];
function confetti(n,burst){
  if(reduce)return;n=Math.min(n,210-parts.length);
  for(let i=0;i<n;i++)parts.push({x:Math.random()*W,y:burst?-20-Math.random()*H*.5:-20-Math.random()*60,
    vx:(Math.random()-.5)*1.6,vy:1.2+Math.random()*2.6,w:5+Math.random()*6,h:3+Math.random()*5,r:Math.random()*6.28,vr:(Math.random()-.5)*.2,
    ph:Math.random()*6.28,c:cc[i%cc.length],life:1,age:0,max:260+Math.random()*220});
  if(!run){run=true;requestAnimationFrame(loop)}
}
let last=0;
function loop(t){
  const k=Math.min((t-(last||t))/16.67,3);last=t;
  cx.clearRect(0,0,W,H);
  parts=parts.filter(p=>p.age<p.max&&p.y<H+30);
  for(const p of parts){
    p.age+=k;p.ph+=.05*k;p.x+=(p.vx+Math.sin(p.ph)*.7)*k;p.y+=p.vy*k;p.r+=p.vr*k;
    const a=Math.min(1,(p.max-p.age)/60);
    cx.save();cx.globalAlpha=a*.95;cx.translate(p.x,p.y);cx.rotate(p.r);cx.scale(1,Math.abs(Math.cos(p.ph)));
    cx.fillStyle=p.c;cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cx.restore();
  }
  if(parts.length)requestAnimationFrame(loop);else{run=false;last=0;cx.clearRect(0,0,W,H)}
}

/* observadores */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
}),{threshold:.25});
$$('.rv,.wr').forEach(e=>io.observe(e));

const done=new Set();
const so=new IntersectionObserver(es=>es.forEach(e=>{
  const s=e.target;s.classList.toggle('live',e.isIntersecting);
  if(!e.isIntersecting||done.has(s.id))return;
  if(s.dataset.burst){done.add(s.id);confetti(+s.dataset.burst,false)}
  if(s.hasAttribute('data-final')){done.add(s.id);
    confetti(120,true);[1200,2600,4000,5400,6800].forEach(t=>setTimeout(()=>confetti(70,true),t));
    if(!reduce)for(let i=0;i<8;i++)balloon(i+1,true);
  }
}),{threshold:.3});
$$('section').forEach(s=>so.observe(s));

/* música: se activa con la primera interacción (los navegadores no permiten sonido sin ella) */
if(CONFIG.musica){
  const au=new Audio(CONFIG.musica);au.loop=true;au.volume=CONFIG.volumen??.6;au.preload='auto';
  const w=document.createElement('div');w.id='mus';
  w.innerHTML='<span class="tip">Toca para activar la música</span><button type="button" aria-label="Música"><svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/><path class="sl" d="M3 3l18 18"/></svg></button>';
  document.body.appendChild(w);const bt=$('button',w);
  let wanted=true;
  const show=on=>{w.classList.toggle('on',on);if(on)w.classList.remove('hint')};
  const play=()=>au.play().then(()=>{show(true);off()}).catch(()=>{show(false);w.classList.add('hint')});
  const evs=['pointerup','touchend','click','keydown'];
  const first=e=>{if(bt.contains(e.target)||!wanted||!au.paused)return;play()};
  const off=()=>evs.forEach(ev=>removeEventListener(ev,first));
  evs.forEach(ev=>addEventListener(ev,first,{passive:true}));
  play();
  bt.addEventListener('click',()=>{if(au.paused){wanted=true;play()}else{wanted=false;au.pause();show(false)}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)au.pause();else if(wanted&&w.classList.contains('on'))au.play().catch(()=>{})});
  setTimeout(()=>w.classList.remove('hint'),7000);
}
