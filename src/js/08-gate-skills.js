
/* Gate 4: throw shuriken at each seal to reveal skills, then defeat the ninja */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,body=document.body;
var sks=[].slice.call(document.querySelectorAll('#sk3-none')),left=sks.length,hp=3,ninja=null,hit=false,msg=document.querySelector('#sgate p');
var NIN='<svg viewBox="0 0 120 170" aria-hidden="true"><path d="M72 36q32-4 46 14q-20-4-32 8z"/><ellipse cx="60" cy="30" rx="15" ry="17"/><path d="M44 50q16-9 32 0l9 44q-25 12-50 0z"/><path d="M78 56l24-26 5 5-22 31z"/><path d="M46 58l-20 24 7 6 21-17z"/><path d="M44 92l-28 54 12 7 26-42 8 42h13l-3-50z"/><path d="M72 96l32 42-9 9-36-38z"/><path d="M101 33L117 3l3 2-13 33z" fill="#dfe6f2"/><path d="M48 27h24l-3 7H51z" fill="#e0343f"/></svg>';
function say(){msg.textContent=left>0?'Tap each seal to unlock a discipline ('+left+' left)':(hp>0?'Ambush! Tap the ninja ('+hp+' hits left)':'')}
function throwAt(el,cb){var r=el.getBoundingClientRect(),x=r.left+r.width/2-14,y=r.top+r.height/2-14,s=document.createElement('i');s.className='shu';body.appendChild(s);
 var a=s.animate([{transform:'translate('+(innerWidth/2-14)+'px,'+innerHeight+'px) rotate(0deg) scale(.7)'},{transform:'translate('+x+'px,'+y+'px) rotate(900deg) scale(1)'}],{duration:360,easing:'cubic-bezier(.3,.7,.4,1)',fill:'forwards'});
 a.onfinish=function(){s.remove();cb()}}
function shake(){body.classList.add('shake');setTimeout(function(){body.classList.remove('shake')},300)}
function spawn(){ninja=document.createElement('button');ninja.id='ninja';ninja.type='button';ninja.setAttribute('aria-label','Ninja ambush: tap to strike');ninja.innerHTML=NIN;body.appendChild(ninja);
 ninja.animate([{transform:'translateY(-110vh)'},{transform:'translateY(0)',offset:.7},{transform:'translateY(-14px)',offset:.85},{transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.5,0,.8,.6)'});
 setTimeout(function(){shake();if(navigator.vibrate)navigator.vibrate([40,30,40])},480);say();ninja.addEventListener('click',strike)}
function strike(){if(hit||hp<=0)return;hit=true;throwAt(ninja,function(){hp--;if(navigator.vibrate)navigator.vibrate(25);ninja.classList.remove('hurt');void ninja.offsetWidth;ninja.classList.add('hurt');hit=false;say();
  if(hp===0){ninja.disabled=true;ninja.animate([{opacity:1,transform:'rotate(0)'},{opacity:0,transform:'translateY(40px) rotate(70deg)'}],{duration:600,fill:'forwards'});
   setTimeout(function(){Slash(function(){location.hash='experience';ninja.remove();body.classList.add('sdone')})},550)}})}
if(reduce||!sks.length){body.classList.add('sdone')}else{
 sks.forEach(function(b){var li=b.parentNode,t=document.createElement('button');li.classList.add('hast');b.classList.add('sealed');t.type='button';t.className='tgt';t.setAttribute('aria-label','Throw a shuriken at the seal to reveal '+li.firstChild.textContent);li.appendChild(t);
  t.addEventListener('click',function(){if(t.disabled)return;t.disabled=true;throwAt(t,function(){t.classList.add('hit');if(navigator.vibrate)navigator.vibrate(18);b.classList.remove('sealed');setTimeout(function(){t.remove()},420);left--;say();if(left===0)setTimeout(spawn,900)})})});
 say()}
document.addEventListener('portfolio:view',function(e){body.classList.toggle('skv',e.detail.id==='skills')});
if(location.hash==='#skills')body.classList.add('skv');
})();
/* Gate system: hold 2s -> slash -> next scene. window.Slash(cb) is reusable for every chapter. */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,HOLD=2000;
var sl=document.getElementById('slash'),body=document.body,busy=false;
window.Slash=function(mid){
 if(busy)return;busy=true;sl.className='on';
 var W=innerWidth,H=innerHeight,sp=sl.querySelector('.sparks'),h='',k,x,y,ang=-12*Math.PI/180;
 for(k=0;k<18;k++){x=W*(.12+.76*Math.random());y=H/2+(x-W/2)*Math.tan(ang);
  var dir=(Math.random()<.5?-1:1),v=60+Math.random()*160,r=(dir*(20+Math.random()*50)-12);
  h+='<i class="sp" style="left:'+x.toFixed(0)+'px;top:'+y.toFixed(0)+'px;--l:'+(8+Math.random()*16).toFixed(0)+'px;--r:'+r.toFixed(0)+'deg;--sx:'+((Math.random()-.5)*v*1.6).toFixed(0)+'px;--sy:'+(dir*v*(.4+Math.random()*.8)).toFixed(0)+'px;animation:sl-sp '+(.35+Math.random()*.35).toFixed(2)+'s ease-out '+(.14+x/W*.06).toFixed(2)+'s forwards"></i>'}
 sp.innerHTML=h;void sl.offsetWidth;sl.classList.add('go');
 if(navigator.vibrate)navigator.vibrate([20,30,50]);
 setTimeout(function(){try{mid&&mid()}catch(e){}},210);
 setTimeout(function(){sl.classList.add('open')},430);
 setTimeout(function(){sl.className='';sp.innerHTML='';busy=false},1500)};
/* Gate: hold a button to commit */
window.HoldGate=function(btn,onDone,dur){
 var raf=0,t0=0,done=false,ms=0,fired=false;
 function buzz(v){if(!reduce&&navigator.vibrate)try{navigator.vibrate(v)}catch(e){}}
 function set(p){btn.classList.toggle('holding',p>0);btn.style.setProperty('--p',p);document.getElementById('charge').style.setProperty('--p',p);document.documentElement.style.setProperty('--hp',p);if(btn.id==='enter')window.__drawT=p}
 function tick(n){var p=Math.min(1,(n-t0)/(dur||HOLD));set(p);var m=Math.floor(p*4);if(m>ms&&p<1){ms=m;buzz(8+m*5)}if(p>=1){done=true;fired=true;buzz([20,30,50]);JSND.holdDone(btn.id==='copen');onDone();setTimeout(function(){done=false;if(!window.__scyBusy)set(0)},900);return}raf=requestAnimationFrame(tick)}
 function start(e){if(done||busy||(e.type==='keydown'&&(e.repeat||(e.key!==' '&&e.key!=='Enter'))))return;if(e.type==='pointerdown'){if(e.button>0)return;try{btn.setPointerCapture(e.pointerId)}catch(x){}}
  if(e.type==='keydown')e.preventDefault();cancelAnimationFrame(raf);ms=0;fired=false;buzz(10);JSND.holdStart();t0=performance.now();raf=requestAnimationFrame(tick)}
 function stop(){if(done)return;cancelAnimationFrame(raf);if(navigator.vibrate)try{navigator.vibrate(0)}catch(e){}var p=parseFloat(btn.style.getPropertyValue('--p'))||0;JSND.holdStop(fired?0:p);(function back(){p-=.06;set(Math.max(0,p));if(p>0&&!done)requestAnimationFrame(back)})()}
 btn.addEventListener('pointerdown',start);btn.addEventListener('keydown',start);
 ['pointerup','pointercancel','keyup','blur'].forEach(function(ev){btn.addEventListener(ev,stop)});
 btn.addEventListener('contextmenu',function(e){e.preventDefault()});
 /* block the plain click so the scene only changes through the gate */
 document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#'+btn.id)&&!window.__gateOK&&!reduce){e.stopImmediatePropagation();e.preventDefault()}},true)};
var enter=document.getElementById('enter');
HoldGate(enter,function(){var go=function(){window.__gateOK=true;enter.click();window.__gateOK=false};(window.ScytheSlash||Slash)(go)},1500);
/* Gate 3: hold a project's button to draw the weapon, slash opens the case study */
var stage=document.getElementById('stage');
if(stage){var bl=document.createElement('i');bl.id='blade';stage.appendChild(bl)}
document.querySelectorAll('#plist .btn[href^="#projects/"]').forEach(function(a,i){
 var nm=a.closest('.row').querySelector('.t').textContent;
 a.id='draw'+i;a.classList.add('hold');a.draggable=false;a.setAttribute('aria-label','Hold to draw and open '+nm);a.innerHTML='<span class="lb">Hold to draw</span>';
 HoldGate(a,function(){var h=a.getAttribute('href');Slash(function(){location.hash=h.slice(1)})})});
})();
