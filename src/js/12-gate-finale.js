
/* Gate 6 / Finale: hold 2s -> seam flares -> doors part -> red light floods -> letter rises. */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,body=document.body,root=document.documentElement,btn=document.getElementById('copen'),snd=document.getElementById('snd');
function opened(){return body.classList.contains('copen')}
/* sound (only when the #snd toggle is on) */
/* embers + scene glow engine (runs only while Contact is on screen) */
var cv=document.getElementById('cember'),cx=cv.getContext('2d'),P=[],W=0,H=0,run=false,lt=0,g=0,openedAt=0,spr=(function(){var s=document.createElement('canvas');s.width=s.height=48;var x=s.getContext('2d'),r=x.createRadialGradient(24,24,0,24,24,24);r.addColorStop(0,'rgba(255,235,220,1)');r.addColorStop(.25,'rgba(255,120,100,.8)');r.addColorStop(.6,'rgba(224,52,63,.25)');r.addColorStop(1,'rgba(224,52,63,0)');x.fillStyle=r;x.fillRect(0,0,48,48);return s})();
window.__gateGlow=0;
function size(){var d=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0)}
function spark(x,y,vx,vy,l,r){if(P.length<220)P.push({x:x,y:y,vx:vx,vy:vy,t:0,l:l,r:r,f:Math.random()*6})}
function burst(){for(var i=0;i<120;i++){var s=Math.random()<.5?-1:1;spark(W/2+(Math.random()-.5)*20,Math.random()*H,s*(40+Math.random()*420),-(10+Math.random()*140),.9+Math.random()*1.1,4+Math.random()*9)}}
function tick(now){if(!run)return;var dt=Math.min((now-lt)/1000,.05);lt=now;
 var cvw=body.classList.contains('cv'),op=opened(),hp=parseFloat(root.style.getPropertyValue('--hp'))||0;
 var tg=!cvw?0:op?(.42+.58*Math.exp(-(now-openedAt)/1400)):hp*.4+(body.classList.contains('cflare')?.5:0);
 g+=(tg-g)*(1-Math.exp(-dt*6));window.__gateGlow=g;
 if(cvw){if(!op&&hp>.15&&Math.random()<hp*dt*40)spark(W/2+(Math.random()-.5)*14,Math.random()*H,(Math.random()-.5)*60,-30-Math.random()*60,.8,3+Math.random()*4);
  if(op&&Math.random()<dt*7)spark(Math.random()*W,H+10,(Math.random()-.5)*30,-(25+Math.random()*50),4+Math.random()*3,3+Math.random()*5)}
 cx.clearRect(0,0,W,H);cx.globalCompositeOperation='lighter';
 for(var i=P.length-1;i>=0;i--){var p=P[i];p.t+=dt;if(p.t>=p.l){P.splice(i,1);continue}
  p.vx*=1-dt*(p.l<2?2.2:.3);p.x+=p.vx*dt+Math.sin(p.f+p.t*2)*8*dt;p.y+=p.vy*dt;var k=p.t/p.l,a=k<.15?k/.15:1-(k-.15)/.85;
  cx.globalAlpha=Math.max(0,a)*.9;var r=p.r*(1-.4*k)*2;cx.drawImage(spr,p.x-r,p.y-r,r*2,r*2)}
 cx.globalAlpha=1;
 if(!cvw&&g<.004&&!P.length){window.__gateGlow=0;run=false;cx.clearRect(0,0,W,H);return}
 requestAnimationFrame(tick)}
function start(){if(run||reduce)return;run=true;size();lt=performance.now();requestAnimationFrame(tick)}
addEventListener('resize',function(){if(run)size()});
/* the beat */
function openGate(){if(opened())return;
 if(navigator.vibrate)navigator.vibrate([30,40,80]);
 body.classList.add('cflare');JSND.play('gate');
 setTimeout(function(){body.classList.remove('cflare');openedAt=performance.now();body.classList.add('copen');burst();setTimeout(burst,420)},520)}
if(reduce){body.classList.add('copen')}else{HoldGate(btn,openGate)}
document.addEventListener('portfolio:view',function(e){var c=e.detail.id==='contact';body.classList.toggle('cv',c);
 if(c)start();if(reduce)window.__gateGlow=(c&&opened())?.35:0});
if(location.hash==='#contact'){body.classList.add('cv');start();if(reduce)window.__gateGlow=.35}
/* the seal: thud, shake, haptic, optional sound */
window.Finale={
 prime:function(){JSND.unlock()},
 stamp:function(letter,done){letter.classList.add('stamping');
  setTimeout(function(){body.classList.add('shake');if(navigator.vibrate)navigator.vibrate([40,30,70]);JSND.play('nameReveal');letter.classList.remove('thud');void letter.offsetWidth;letter.classList.add('thud');setTimeout(function(){body.classList.remove('shake')},300)},300);
  setTimeout(function(){letter.classList.remove('thud');done()},1500)}};
/* end of the road: sheathe, slash, replay the intro */
document.getElementById('creturn').addEventListener('click',function(){
 JSND.play('on',{vol:.55});
 Slash(function(){body.classList.remove('ui-in');body.classList.add('replay');location.hash='top';
  var en=document.getElementById('enter');if(en)en.focus({preventScroll:true});
  setTimeout(function(){body.classList.remove('replay');body.classList.add('ui-in')},500)})});
})();
