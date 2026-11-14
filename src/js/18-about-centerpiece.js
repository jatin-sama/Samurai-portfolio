
/* About centerpiece v2: heat-lit particle kanji, cursor embers, depth dust, click-to-reveal name on Unmasked, shatter sound. */
(function(){
var panel=document.getElementById('about'),cv=document.getElementById('ab3'),T=window.THREE;
if(!panel||!cv||!T)return;
var rm=(window.__RM===true),coarse=matchMedia('(pointer:coarse)').matches;
var GL=['技','美','匠','顔'],NM=['The Developer','The Designer','The Craftsman','Unmasked'],COL=[0x5b8def,0xe0a84a,0xe0343f,0xefe6d6];
var HINT=['Move through it. Click to shatter. Drag to spin.','Move through it. Click to shatter. Drag to spin.','Move through it. Click to shatter. Drag to spin.','Click to reveal the name.'];
var N=coarse?4200:7000,M=90,S=3.4,W=480,H=240,R,scene,cam,pts,pos,vel,col,base,tgt={},geo,mat,grp,on=false,raf=0,cur=0,form=0,tc=new T.Color(COL[0]),lt=0,t=0;
var ptr={tx:9,ty:9,down:false,lx:0},spin=0,spinV=0,cap,em,ep,el_,emat,dust,dp,AC=null;
function sprite(){var c=document.createElement('canvas');c.width=c.height=64;var g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new T.CanvasTexture(c)}
function pointsOf(arr,o){var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(arr,3));var p=new T.Points(g,new T.PointsMaterial(o));p.frustumCulled=false;return p}
function init(){
 try{R=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:false,powerPreference:'low-power'})}catch(e){return false}
 R.setPixelRatio(Math.min(devicePixelRatio||1,1.75));scene=new T.Scene();cam=new T.PerspectiveCamera(45,1,.1,50);cam.position.z=7;
 var map=sprite(),i;pos=new Float32Array(N*3);vel=new Float32Array(N*3);col=new Float32Array(N*3);base=new Float32Array(N);
 for(i=0;i<N;i++){var a=Math.random()*6.283,b=Math.acos(2*Math.random()-1),r=4+Math.random()*3;pos[i*3]=r*Math.sin(b)*Math.cos(a);pos[i*3+1]=r*Math.sin(b)*Math.sin(a);pos[i*3+2]=r*Math.cos(b)-2;base[i]=Math.random()<.08?1:.55+Math.random()*.4}
 pts=pointsOf(pos,{map:map,color:tc,size:.072,transparent:true,opacity:.95,depthWrite:false,blending:T.AdditiveBlending,vertexColors:true});
 geo=pts.geometry;geo.setAttribute('color',new T.BufferAttribute(col,3));mat=pts.material;
 grp=new T.Group();grp.add(pts);scene.add(grp);
 ep=new Float32Array(M*3);el_=new Float32Array(M);for(i=0;i<M;i++)ep[i*3+1]=99;
 em=pointsOf(ep,{map:map,color:0xff7a3a,size:.07,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending});scene.add(em);
 dp=new Float32Array(260*3);for(i=0;i<260;i++){dp[i*3]=(Math.random()-.5)*16;dp[i*3+1]=(Math.random()-.5)*9;dp[i*3+2]=-3+Math.random()*5}
 dust=pointsOf(dp,{map:map,color:0xefe6d6,size:.04,transparent:true,opacity:.4,depthWrite:false,blending:T.AdditiveBlending});scene.add(dust);
 cap=document.createElement('p');cap.className='ab3-cap';cap.setAttribute('aria-hidden','true');cap.innerHTML='<b></b><span></span>';panel.appendChild(cap);
 resize();return true}
function resize(){if(!R)return;var w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
 var wide=w/h>1.05;grp.position.set(wide?cam.aspect*5.8/2*.42:0,wide?0:1.1,0);grp.scale.setScalar(wide?1:.78);mat.opacity=wide?.92:.4}
function glyph(k){if(tgt[k])return tgt[k];
 var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d',{willReadFrequently:true}),ff=getComputedStyle(document.getElementById('mkwm')||document.body).fontFamily||'serif';
 x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';
 if(k==='name'){x.font='600 58px '+ff;if('letterSpacing' in x)x.letterSpacing='7px';x.fillText('JAMTIN',W/2+4,H/2+2)}else{x.font='700 210px '+ff;x.fillText(GL[k],W/2,128)}
 var d=x.getImageData(0,0,W,H).data,L=[],p,q;for(p=0;p<W*H;p++)if(d[p*4+3]>140)L.push(p);if(!L.length)L=[H/2*W+W/2];
 var a=new Float32Array(N*3),u=S/240;
 for(q=0;q<N;q++){p=L[Math.random()*L.length|0];a[q*3]=((p%W)-W/2)*u+(Math.random()-.5)*.015;a[q*3+1]=(H/2-Math.floor(p/W))*u+(Math.random()-.5)*.015;a[q*3+2]=(Math.random()-.5)*.16}
 return tgt[k]=a}
function burst(k){for(var i=0;i<N;i++){var a=Math.random()*6.283,b=Math.random()*2-1,s=k*(.5+Math.random()),r=Math.sqrt(1-b*b);vel[i*3]+=Math.cos(a)*r*s;vel[i*3+1]+=Math.sin(a)*r*s;vel[i*3+2]+=b*s}}
function label(){if(!cap)return;cap.firstChild.textContent=form==='name'?'JAMTIN':NM[cur];cap.lastChild.textContent=coarse?(cur===3?'Tap to reveal the name':'Tap to shatter'):HINT[cur]}
function setMask(i,quiet){if(i<0||i===cur&&tgt[i]&&!quiet)return;cur=i;form=i;tc.set(COL[i]);glyph(i);label();
 if(rm){pos.set(tgt[i]);geo.attributes.position.needsUpdate=true;draw()}else burst(i===3?6:3.2)}
function world(e){var hh=Math.tan(22.5*Math.PI/180)*7;ptr.tx=((e.clientX/innerWidth)*2-1)*hh*cam.aspect;ptr.ty=(1-(e.clientY/innerHeight)*2)*hh}
function ui(e){return e.target.closest&&e.target.closest('.mk,.nav,a,button,input,textarea,select,.mk-nav')}
function local(){return[(ptr.tx-grp.position.x)/grp.scale.x,(ptr.ty-grp.position.y)/grp.scale.x]}
function shock(){var l=local(),lx=l[0],ly=l[1];
 for(var i=0;i<N;i++){var dx=pos[i*3]-lx,dy=pos[i*3+1]-ly,d=Math.sqrt(dx*dx+dy*dy)+.001;if(d<2){var f=(1-d/2)*9;vel[i*3]+=dx/d*f;vel[i*3+1]+=dy/d*f;vel[i*3+2]+=(Math.random()-.3)*f*.7}}
 JSND.play('shatter');if(coarse&&navigator.vibrate)navigator.vibrate(12)}
function reveal(){form=form==='name'?3:'name';glyph(form);label();burst(5);JSND.play('nameReveal');HAP([12,30,22],0)}
function spawn(){for(var i=0;i<M;i++)if(el_[i]<=0){el_[i]=.9+Math.random()*.6;ep[i*3]=ptr.tx+(Math.random()-.5)*.15;ep[i*3+1]=ptr.ty+(Math.random()-.5)*.15;ep[i*3+2]=.4;return}}
function draw(){R.render(scene,cam)}
function frame(ts){if(!on)return;raf=requestAnimationFrame(frame);var dt=Math.min(.033,(ts-lt)/1000||.016);lt=ts;t+=dt;
 var tg=tgt[form],l=local(),lx=l[0],ly=l[1],K=18,D=Math.exp(-3.1*dt),RR=.8,i,j;
 for(i=0;i<N;i++){j=i*3;var vx=vel[j],vy=vel[j+1],vz=vel[j+2],px=pos[j],py=pos[j+1],pz=pos[j+2];
  vx+=(tg[j]-px)*K*dt;vy+=(tg[j+1]-py)*K*dt;vz+=(tg[j+2]-pz)*K*dt;
  var dx=px-lx,dy=py-ly,d2=dx*dx+dy*dy;
  if(d2<RR*RR){var d=Math.sqrt(d2)+.001,f=(1-d/RR);f=f*f*55*dt;vx+=dx/d*f-dy/d*f*.7;vy+=dy/d*f+dx/d*f*.7;vz+=f*.6}
  vx*=D;vy*=D;vz*=D;vel[j]=vx;vel[j+1]=vy;vel[j+2]=vz;pos[j]=px+vx*dt;pos[j+1]=py+vy*dt;pos[j+2]=pz+vz*dt;
  var h=base[i]+Math.min(.65,Math.sqrt(vx*vx+vy*vy+vz*vz)*.2);col[j]=h;col[j+1]=h;col[j+2]=h}
 geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;
 for(i=0;i<M;i++)if(el_[i]>0){el_[i]-=dt;ep[i*3+1]+=dt*.7;ep[i*3]+=Math.sin(t*3+i)*dt*.25;if(el_[i]<=0)ep[i*3+1]=99}
 em.geometry.attributes.position.needsUpdate=true;
 for(i=0;i<260;i++){dp[i*3+1]+=dt*(.05+(i%5)*.02);if(dp[i*3+1]>4.5)dp[i*3+1]=-4.5}dust.geometry.attributes.position.needsUpdate=true;
 dust.rotation.y=(ptr.tx<9?ptr.tx:0)*.012;
 spinV+=(-spin*5)*dt;spinV*=Math.exp(-2.2*dt);spin+=spinV*dt;
 mat.color.lerp(tc,Math.min(1,dt*4));
 grp.rotation.y=Math.sin(t*.4)*.16+spin+(ptr.tx<9?ptr.tx*.02:0);grp.rotation.x=(ptr.ty<9?-ptr.ty*.03:0)+Math.sin(t*.3)*.04;
 draw()}
function start(){if(on)return;if(!R&&!init()){cv.style.display='none';return}on=true;lt=performance.now();resize();setMask(cur,true);
 if(rm){pos.set(tgt[cur]);geo.attributes.position.needsUpdate=true;draw()}else raf=requestAnimationFrame(frame)}
function stop(){on=false;cancelAnimationFrame(raf)}
addEventListener('resize',resize);
document.addEventListener('pointermove',function(e){if(!on||e.pointerType==='touch'&&!ptr.down)return;world(e);if(!rm&&e.pointerType!=='touch'&&Math.random()<.6)spawn();if(ptr.down){var dx=e.clientX-ptr.lx;ptr.lx=e.clientX;spinV+=dx*.06}});
document.addEventListener('pointerdown',function(e){if(!on||ui(e))return;world(e);ptr.down=true;ptr.lx=e.clientX;if(rm)return;if(cur===3)reveal();else shock()});
document.addEventListener('pointerup',function(){ptr.down=false;ptr.tx=ptr.ty=9});
document.addEventListener('pointerleave',function(){ptr.tx=ptr.ty=9});
new MutationObserver(function(){var p=panel.querySelectorAll('.mk-p');for(var i=0;i<p.length;i++)if(p[i].classList.contains('on')){if(i!==cur&&on)setMask(i);else if(!on)cur=i;return}}).observe(panel,{subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('portfolio:view',function(e){if(e.detail.id==='about')start();else stop()});
if(panel.classList.contains('on')||location.hash==='#about')start();
})();
