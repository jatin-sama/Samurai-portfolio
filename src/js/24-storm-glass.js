/* Rain on the glass. While the storm is on, droplets bead up on the "window" in front of the scene, the bigger ones slide down and leave a trail,
   and every lightning strike lights them up for a moment. Driven by window.__wxW (storm strength 0..1, set by the weather code in 05-scene-main.js)
   and the 'jt:storm' / 'jt:strike' events. Costs nothing outside the storm (the loop stops itself). Off with ?reduce=1 or when 3D is unavailable. */
(function(){
'use strict';
var d=document,cv=d.getElementById('drops');if(!cv)return;
if(window.__RM===true){cv.parentNode.removeChild(cv);return}
var cx=cv.getContext('2d');if(!cx)return;
var coarse=matchMedia('(pointer: coarse)').matches,low=coarse||(navigator.hardwareConcurrency||8)<=4,MAX=low?20:42,W=0,H=0,drops=[],run=false,last=0,flash=0,stormOn=false;
function rnd(a,b){return a+Math.random()*(b-a)}
function size(){W=cv.width=innerWidth;H=cv.height=innerHeight}size();addEventListener('resize',size);
function spawn(){var big=Math.random()<.28;drops.push({x:rnd(0,W),y:rnd(-10,H*.92),r:big?rnd(4.5,8):rnd(1.4,3.6),age:0,grow:rnd(.5,1.1),slideAt:big?rnd(1.2,5):1e9,vy:0,y0:0,sliding:false,life:rnd(6,13),k:rnd(.7,1)})}
function draw(dt){
 var w=window.__wxW||0;
 flash=Math.max(0,flash-dt*1.9);
 cx.clearRect(0,0,W,H);
 var target=Math.round(MAX*w);
 if(drops.length<target&&Math.random()<dt*10)spawn();
 for(var i=drops.length-1;i>=0;i--){var p=drops[i];p.age+=dt;
  var g=Math.min(1,p.age/p.grow),out=p.age>p.life-1.2?Math.max(0,(p.life-p.age)/1.2):1,a=Math.min(1,w*1.6)*out*p.k;
  if(!p.sliding&&p.age>p.slideAt){p.sliding=true;p.y0=p.y}
  if(p.sliding){p.vy=Math.min(260,p.vy+dt*(120+p.r*30));p.y+=p.vy*dt;p.x+=Math.sin(p.y*.05+i)*dt*6}
  if(p.age>p.life||p.y>H+20||(w<.02&&a<.01)){drops.splice(i,1);continue}
  var r=p.r*(.35+.65*g),f=flash*.55;
  if(p.sliding&&p.y>p.y0){cx.strokeStyle='rgba(170,195,235,'+(.07+f*.1)*a+')';cx.lineWidth=Math.max(1,r*.55);cx.lineCap='round';cx.beginPath();cx.moveTo(p.x,p.y0);cx.lineTo(p.x,p.y);cx.stroke()}
  cx.fillStyle='rgba(150,180,230,'+(.09+f*.16)*a+')';cx.strokeStyle='rgba(215,230,255,'+(.24+f*.5)*a+')';cx.lineWidth=1;
  cx.beginPath();cx.ellipse(p.x,p.y,r*.82,r*(p.sliding?1.25:1.05),0,0,6.2832);cx.fill();cx.stroke();
  cx.fillStyle='rgba(255,255,255,'+(.4+f*.5)*a+')';cx.beginPath();cx.arc(p.x-r*.28,p.y-r*.34,Math.max(.6,r*.2),0,6.2832);cx.fill()}
 if(!stormOn&&w<.02&&!drops.length){cx.clearRect(0,0,W,H);run=false}}
function loop(now){if(!run)return;var dt=Math.min(.06,(now-last)/1000||.016);last=now;if(!d.hidden)draw(dt);requestAnimationFrame(loop)}
function start(){if(run)return;run=true;last=performance.now();requestAnimationFrame(loop)}
d.addEventListener('jt:storm',function(e){stormOn=!!(e.detail&&e.detail.on);if(stormOn)start()});
d.addEventListener('jt:strike',function(e){flash=1;start()});
d.addEventListener('visibilitychange',function(){if(!d.hidden&&(window.__wxW||0)>.02)start()});
if((window.__wxW||0)>.02)start();
})();
