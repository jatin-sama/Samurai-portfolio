/* Polish layer: custom cursor + touch ripple, magnetic buttons, hover/click sounds. Everything is wrapped so a failure never affects the site. */
(function(){
'use strict';
var d=document,root=d.documentElement,
 fine=matchMedia('(hover:hover) and (pointer:fine)').matches&&!!(window.CSS&&CSS.supports&&CSS.supports('translate','1px 1px')),
 reduce=(window.__RM===true);

/* ---------- sound feedback (JSND only plays while the SND toggle is on) ---------- */
var SND='.nav a.l,.seal,.cta,.btn:not(.hold),#pbticks a,#pbticks button',lastS=0,hovEl=null;
function snd(k,v){try{var n=performance.now();if(n-lastS<90)return;lastS=n;if(window.JSND&&window.JSND.play)window.JSND.play(k,{vol:v})}catch(e){}}
d.addEventListener('pointerover',function(e){
 if(e.pointerType!=='mouse')return;
 var t=e.target.closest&&e.target.closest(SND);
 if(t&&t!==hovEl){hovEl=t;snd('hover',.5)}else if(!t){hovEl=null}
},{passive:true});
d.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest(SND);if(t)snd('tick',.8)},{passive:true});

/* ---------- touch ripple ---------- */
d.addEventListener('pointerdown',function(e){
 if(e.pointerType==='mouse'||reduce)return;
 try{var r=d.createElement('div');r.className='kc-rip';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';d.body.appendChild(r);setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r)},760)}catch(x){}
},{passive:true});

/* ---------- custom cursor ---------- */
var kc=d.getElementById('kc');
if(!kc)return;
if(!fine){if(kc.parentNode)kc.parentNode.removeChild(kc)}
else try{
 if(getComputedStyle(kc).display==='none')return;
 var dot=kc.querySelector('.d'),ring=kc.querySelector('.r'),blade=kc.querySelector('.s'),lab=ring.querySelector('b'),
  x=-100,y=-100,rx=-100,ry=-100,on=false,raf=0,down=false,lastC=0,STATES=['is-link','is-hold','is-drag','is-aim','is-text','is-off'];
 function frame(){
  rx+=(x-rx)*(reduce?1:.2);ry+=(y-ry)*(reduce?1:.2);
  ring.style.translate=rx+'px '+ry+'px';
  var dx=x-rx,dy=y-ry,len=Math.sqrt(dx*dx+dy*dy);
  if(len>3&&!reduce){
   var L=Math.min(len,140),a=Math.atan2(dy,dx);
   blade.style.translate=(x-Math.cos(a)*L)+'px '+(y-Math.sin(a)*L)+'px';
   blade.style.rotate=a+'rad';blade.style.scale=(L/100)+' 1';
   blade.style.opacity=Math.min(1,(len-3)/28)*.9}
  else blade.style.opacity=0;
  raf=(len>.1)?requestAnimationFrame(frame):0}
 function kick(){if(!raf)raf=requestAnimationFrame(frame)}
 function setState(t){
  var c='',label='',cur='';
  /* the system cursor is forced to none while kc-hide is on, so lift it for one synchronous style read */
  try{root.classList.remove('kc-hide');cur=getComputedStyle(t).cursor}catch(e){}
  root.classList.add('kc-hide');
  if(t.closest&&t.closest('.hold,#enter')){c='is-hold'}
  else if(cur==='grab'||cur==='grabbing'||cur==='move'){c='is-drag';label='DRAG'}
  else if(cur==='text'){c='is-text'}
  else if(cur==='pointer'){c='is-link'}
  else if(cur==='crosshair'){c='is-aim'}
  else if(cur==='not-allowed'){c='is-off'}
  STATES.forEach(function(s){kc.classList.remove(s)});
  if(c)kc.classList.add(c);
  lab.textContent=label}
 d.addEventListener('pointermove',function(e){
  if(e.pointerType!=='mouse')return;
  x=e.clientX;y=e.clientY;
  dot.style.translate=x+'px '+y+'px';
  if(!on){on=true;rx=x;ry=y;root.classList.add('kc-on');setState(e.target)}
  else if(e.target.tagName==='CANVAS'){var n=performance.now();if(n-lastC>90){lastC=n;setState(e.target)}}
  kc.classList.remove('away');kick()},{passive:true});
 d.addEventListener('pointerover',function(e){if(on&&e.pointerType==='mouse')setState(e.target)},{passive:true});
 d.addEventListener('pointerdown',function(e){
  if(e.pointerType!=='mouse')return;
  down=true;kc.classList.add('down');
  if(!reduce&&!kc.classList.contains('is-text'))try{var c=d.createElement('div');c.className='kc-cut';c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';d.body.appendChild(c);setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c)},460)}catch(x){}
 },{passive:true});
 d.addEventListener('pointerup',function(){down=false;kc.classList.remove('down')},{passive:true});
 d.addEventListener('pointercancel',function(){down=false;kc.classList.remove('down')},{passive:true});
 d.addEventListener('mouseleave',function(){kc.classList.add('away')});
 window.addEventListener('blur',function(){kc.classList.add('away');down=false;kc.classList.remove('down')});
}catch(e){root.classList.remove('kc-on');root.classList.remove('kc-hide')}

/* ---------- magnetic buttons ---------- */
if(fine&&!reduce)try{
 var MAG='.cta,.btn:not(.hold),.seal,#snd',mEl=null,PULL=.22,MAXD=7;
 var cl=function(v){return Math.max(-MAXD,Math.min(MAXD,v))};
 var num=function(el,k){return parseFloat(el.style.getPropertyValue(k))||0};
 var release=function(el){
  var a=num(el,'--mx'),b=num(el,'--my');
  el.style.setProperty('--mx','0px');el.style.setProperty('--my','0px');
  try{el.animate([{translate:a+'px '+b+'px'},{translate:'0px 0px'}],{duration:380,easing:'cubic-bezier(.2,.8,.2,1)'})}catch(e){}};
 d.addEventListener('pointermove',function(e){
  if(e.pointerType!=='mouse')return;
  var t=e.target.closest&&e.target.closest(MAG);
  if(mEl&&mEl!==t){release(mEl);mEl=null}
  if(!t)return;
  mEl=t;
  var r=t.getBoundingClientRect(),cx=r.left+r.width/2-num(t,'--mx'),cy=r.top+r.height/2-num(t,'--my');
  t.style.setProperty('--mx',cl((e.clientX-cx)*PULL)+'px');
  t.style.setProperty('--my',cl((e.clientY-cy)*PULL)+'px')},{passive:true});
 d.addEventListener('mouseleave',function(){if(mEl){release(mEl);mEl=null}});
}catch(e){}
})();
