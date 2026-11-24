/* Rain on the glass. While the storm is on, droplets bead up on the "window" in front of the scene: they swell in, the bigger ones slide down in
   stop-and-go bursts, leave a thin wet trail and a few tiny beads behind, and every lightning strike catches their highlights.
   Droplets are drawn from a few pre-rendered sprites (dark refracting top, bright lower rim, specular dot), so it stays cheap on phones.
   Driven by window.__wxW (storm strength 0..1, set in 05-scene-main.js) and the 'jt:storm' / 'jt:strike' events. The loop stops itself outside the storm.
   Off with ?reduce=1 or when 3D is unavailable. */
(function(){
'use strict';
var d=document,cv=d.getElementById('drops');if(!cv)return;
if(window.__RM===true){cv.parentNode.removeChild(cv);return}
var cx=cv.getContext('2d');if(!cx)return;
var coarse=matchMedia('(pointer: coarse)').matches,low=coarse||(navigator.hardwareConcurrency||8)<=4,
 MAX=low?30:58,DPR=Math.min(window.devicePixelRatio||1,low?1.5:2),W=0,H=0,drops=[],trails=[],run=false,last=0,flash=0,stormOn=false,SP=[],HL;
function rnd(a,b){return a+Math.random()*(b-a)}
function size(){W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cx.setTransform(DPR,0,0,DPR,0,0)}size();addEventListener('resize',size);

/* ---- sprites: a droplet seen on dark glass ---- */
function mk(hx,hy,tilt){
 var S=96,c=document.createElement('canvas');c.width=c.height=S;var g=c.getContext('2d'),m=S/2;
 var body=g.createLinearGradient(0,10,0,S-10);body.addColorStop(0,'rgba(4,7,14,.46)');body.addColorStop(.45,'rgba(96,126,176,.10)');body.addColorStop(.82,'rgba(160,190,240,.26)');body.addColorStop(1,'rgba(205,224,255,.5)');
 g.fillStyle=body;g.beginPath();g.ellipse(m,m+1,36,38,0,0,6.2832);g.fill();
 g.lineWidth=2;g.strokeStyle='rgba(185,208,248,.2)';g.stroke();
 g.save();g.beginPath();g.ellipse(m,m+1,35,37,0,0,6.2832);g.clip();
 var rim=g.createRadialGradient(m+6,m+16,8,m+6,m+14,40);rim.addColorStop(0,'rgba(0,0,0,0)');rim.addColorStop(1,'rgba(0,0,0,.34)');g.fillStyle=rim;g.fillRect(0,0,S,S);g.restore();
 g.fillStyle='rgba(0,0,0,0)';
 g.shadowColor='rgba(255,255,255,.9)';g.shadowBlur=5;g.fillStyle='rgba(255,255,255,.92)';
 g.beginPath();g.ellipse(m-hx,m-hy,9,5,tilt,0,6.2832);g.fill();
 g.shadowBlur=0;g.fillStyle='rgba(235,244,255,.5)';g.beginPath();g.ellipse(m+hx*.7,m+24,6,2.6,-tilt*.6,0,6.2832);g.fill();
 return c}
function mkHL(){var S=96,c=document.createElement('canvas');c.width=c.height=S;var g=c.getContext('2d'),m=S/2;
 var l=g.createRadialGradient(m,m+22,2,m,m+22,30);l.addColorStop(0,'rgba(190,215,255,.55)');l.addColorStop(1,'rgba(190,215,255,0)');g.fillStyle=l;g.fillRect(0,0,S,S);
 g.shadowColor='#fff';g.shadowBlur=6;g.fillStyle='#fff';g.beginPath();g.ellipse(m-14,m-16,8,4.5,-.5,0,6.2832);g.fill();return c}
SP=[mk(14,15,-.5),mk(10,17,-.3),mk(16,12,-.7)];HL=mkHL();

function spawn(tiny,x,y){
 var big=!tiny&&Math.random()<.24,r=tiny?rnd(1,2.1):big?rnd(6.5,10.5):rnd(2.7,5.4);
 drops.push({x:x==null?rnd(0,W):x,y:y==null?rnd(-10,H*.94):y,r:r,age:0,grow:tiny?.25:rnd(.6,1.3),slideAt:big?rnd(1.5,6):1e9,vy:0,tv:0,mode:0,mt:0,y0:0,sliding:false,
  life:tiny?rnd(5,10):rnd(7,15),k:rnd(.75,1),sp:SP[(Math.random()*SP.length)|0],tx:0,dist:0})}
function endTrail(p){if(p.sliding&&p.y>p.y0+6)trails.push({x:p.x,y0:p.y0,y1:p.y,w:Math.max(.8,p.r*.5),ttl:3.2,t:0})}

function draw(dt){
 var w=window.__wxW||0,i,p;
 flash=Math.max(0,flash-dt*1.7);
 cx.clearRect(0,0,W,H);
 var target=Math.round(MAX*w);
 if(drops.length<target&&Math.random()<dt*9)spawn(false);
 /* trails left behind by drops that have finished */
 for(i=trails.length-1;i>=0;i--){var tr=trails[i];tr.t+=dt;if(tr.t>tr.ttl){trails.splice(i,1);continue}
  var ta=(1-tr.t/tr.ttl)*Math.min(1,w*1.6),gr=cx.createLinearGradient(0,tr.y0,0,tr.y1);gr.addColorStop(0,'rgba(170,195,235,0)');gr.addColorStop(1,'rgba(170,195,235,'+(.11+flash*.1)*ta+')');
  cx.strokeStyle=gr;cx.lineWidth=tr.w;cx.lineCap='round';cx.beginPath();cx.moveTo(tr.x,tr.y0);cx.lineTo(tr.x,tr.y1);cx.stroke()}
 for(i=drops.length-1;i>=0;i--){p=drops[i];p.age+=dt;
  var gk=Math.min(1,p.age/p.grow),gs=1-Math.pow(1-gk,3),out=p.age>p.life-1.4?Math.max(0,(p.life-p.age)/1.4):1,a=Math.min(1,w*1.7)*out*p.k;
  if(!p.sliding&&p.age>p.slideAt){p.sliding=true;p.y0=p.y;p.mode=1;p.mt=rnd(.25,.7);p.tv=rnd(70,190)*(.6+p.r/9)}
  if(p.sliding){
   p.mt-=dt;if(p.mt<=0){if(p.mode===1){p.mode=0;p.mt=rnd(.2,.9);p.tv=0}else{p.mode=1;p.mt=rnd(.25,.8);p.tv=rnd(70,210)*(.6+p.r/9)}}
   p.vy+=(p.tv-p.vy)*Math.min(1,dt*(p.tv>p.vy?7:4));var dy=p.vy*dt;p.y+=dy;p.dist+=dy;p.x+=Math.sin(p.y*.045+i)*dt*5;
   if(p.dist>26&&drops.length<MAX*2.2){p.dist=0;spawn(true,p.x+rnd(-p.r*.6,p.r*.6),p.y-p.r*1.2)}
   if(p.y>p.y0+4){var gr2=cx.createLinearGradient(0,p.y0,0,p.y);gr2.addColorStop(0,'rgba(170,195,235,0)');gr2.addColorStop(1,'rgba(170,195,235,'+(.12+flash*.1)*a+')');
    cx.strokeStyle=gr2;cx.lineWidth=Math.max(.8,p.r*.5);cx.lineCap='round';cx.beginPath();cx.moveTo(p.x,p.y0);cx.lineTo(p.x,p.y);cx.stroke()}}
  if(p.age>p.life||p.y>H+20||(!stormOn&&w<.02&&a<.01)){endTrail(p);drops.splice(i,1);continue}
  var r=p.r*(.3+.7*gs),sw=1.1+Math.min(.5,p.vy/380),sh=(p.sliding?1.12+Math.min(.5,p.vy/260):1.04),
      dw=r*2.3*sw*.9,dh=r*2.3*sh;
  cx.globalAlpha=Math.min(1,a*(.9+flash*.5));cx.drawImage(p.sp,p.x-dw/2,p.y-dh/2,dw,dh)}
 /* lightning: the highlights and lower rims catch the light */
 if(flash>.03){cx.globalCompositeOperation='lighter';
  for(i=0;i<drops.length;i++){p=drops[i];if(p.r<2)continue;var r2=p.r*(.3+.7*Math.min(1,p.age/p.grow));cx.globalAlpha=Math.min(1,flash*.85)*Math.min(1,w*1.7);cx.drawImage(HL,p.x-r2*1.3,p.y-r2*1.3,r2*2.6,r2*2.6)}
  cx.globalCompositeOperation='source-over'}
 cx.globalAlpha=1;
 if(!stormOn&&w<.02&&!drops.length&&!trails.length){cx.clearRect(0,0,W,H);run=false}}
function loop(now){if(!run)return;var dt=Math.min(.06,(now-last)/1000||.016);last=now;if(!d.hidden)draw(dt);requestAnimationFrame(loop)}
function start(){if(run)return;run=true;last=performance.now();requestAnimationFrame(loop)}
d.addEventListener('jt:storm',function(e){stormOn=!!(e.detail&&e.detail.on);if(stormOn)start()});
d.addEventListener('jt:strike',function(){flash=1;start()});
d.addEventListener('visibilitychange',function(){if(!d.hidden&&(window.__wxW||0)>.02)start()});
if((window.__wxW||0)>.02)start();
})();
