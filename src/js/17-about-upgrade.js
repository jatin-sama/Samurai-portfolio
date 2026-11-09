
/* About upgrade: cursor-lit tilt card, katana cut between masks, decoded quotes, stamped seals, progress, sakura finale, magnetic buttons, keys 1-4 */
(function(){
var mk=document.getElementById('mk');if(!mk)return;
var st=document.getElementById('mkstage'),pans=[].slice.call(mk.querySelectorAll('.mk-p')),tabs=[].slice.call(mk.querySelectorAll('.mk-tab')),
rm=matchMedia('(prefers-reduced-motion: reduce)').matches,last=-1;
function el(t,c){var e=document.createElement(t);e.className=c;e.setAttribute('aria-hidden','true');return e}
var glow=el('span','mk-glow'),cv=el('canvas','mk-petals'),prog=el('div','mk-prog');
prog.innerHTML='<b></b><b></b><b></b><b></b><em></em>';
st.insertBefore(glow,st.firstChild);st.appendChild(cv);st.insertBefore(prog,st.querySelector('.mk-panels'));
pans.forEach(function(p){[].forEach.call(p.querySelectorAll('.mk-chips li'),function(li,i){li.style.setProperty('--i',i)})});
var G='ｱｲｳｴｵｶｷｸｹｺ01<>/{}#';
function decode(p){var q=p.querySelector('.mk-q');if(!q||rm)return;var full=q.dataset.t||(q.dataset.t=q.textContent),L=full.length,n=0;clearInterval(q._t);
q._t=setInterval(function(){n+=Math.ceil(L/20);var s='';for(var i=0;i<L;i++){var c=full[i];s+=(i<n||c===' ')?c:G[Math.random()*G.length|0]}q.textContent=n>=L?full:s;if(n>=L)clearInterval(q._t)},32)}
function petals(){if(rm)return;var w=cv.width=st.clientWidth,h=cv.height=st.clientHeight,x=cv.getContext('2d'),P=[],i;
for(i=0;i<46;i++)P.push({x:Math.random()*w,y:-Math.random()*h*.8,r:3+Math.random()*5,vy:40+Math.random()*60,vx:(Math.random()-.3)*30,a:Math.random()*6,s:1+Math.random()*2});
var t0=performance.now(),lt=t0;(function f(t){var dt=Math.min(.05,(t-lt)/1000);lt=t;x.clearRect(0,0,w,h);
P.forEach(function(p){p.y+=p.vy*dt;p.x+=p.vx*dt+Math.sin(p.a)*.4;p.a+=p.s*dt;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.scale(1,Math.abs(Math.cos(p.a))*.7+.3);x.fillStyle='rgba(240,150,170,.8)';x.beginPath();x.ellipse(0,0,p.r,p.r*.6,0,0,6.28);x.fill();x.restore()});
if(t-t0<4500&&mk.classList.contains('lifted'))requestAnimationFrame(f);else x.clearRect(0,0,w,h)})(t0)}
function onShow(i){if(i<0||i===last)return;last=i;
decode(pans[i]);
var n=0;[0,1,2].forEach(function(k){if(tabs[k].classList.contains('seen'))n++});
[].forEach.call(prog.querySelectorAll('b'),function(b,k){b.classList.toggle('on',k===i||tabs[k].classList.contains('seen'))});
prog.lastChild.textContent='Masks found '+n+' of 3';
tabs[3].classList.toggle('ready',n===3&&i!==3);
if(i===3)petals()}
function active(){for(var i=0;i<pans.length;i++)if(pans[i].classList.contains('on'))return i;return -1}
new MutationObserver(function(){onShow(active())}).observe(mk,{subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('portfolio:view',function(e){if(e.detail.id==='about'){last=-1;setTimeout(function(){onShow(active())},60)}});
/* tilt + light follow the pointer (mouse and pen only) */
st.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;var r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
st.style.setProperty('--mx',x*100+'%');st.style.setProperty('--my',y*100+'%');st.style.setProperty('--px',x-.5);st.style.setProperty('--py',y-.5);
st.style.setProperty('--ry',((x-.5)*6)+'deg');st.style.setProperty('--rx',((.5-y)*4)+'deg')});
st.addEventListener('pointerleave',function(){['--rx','--ry','--px','--py'].forEach(function(k){st.style.removeProperty(k)})});
/* magnetic buttons */
mk.addEventListener('pointermove',function(e){var b=e.target.closest&&e.target.closest('.mk-nav .btn,.mk-cta .btn');if(!b||e.pointerType==='touch')return;var r=b.getBoundingClientRect();b.style.translate=((e.clientX-r.left-r.width/2)*.2)+'px '+((e.clientY-r.top-r.height/2)*.3)+'px'});
mk.addEventListener('pointerout',function(e){var b=e.target.closest&&e.target.closest('.btn');if(b)b.style.translate=''});
/* keys 1-4 jump to a mask */
document.addEventListener('keydown',function(e){if(e.altKey||e.ctrlKey||e.metaKey||!document.getElementById('about').classList.contains('on'))return;
if(e.target.closest&&e.target.closest('input,textarea,select'))return;var k=+e.key;if(k>=1&&k<=4){tabs[k-1].click()}});
var h=document.getElementById('mkhint');if(h&&h.textContent.indexOf('1–4')<0)h.dataset.k=1;
})();
