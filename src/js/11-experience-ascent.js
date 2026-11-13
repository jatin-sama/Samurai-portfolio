
/* Experience: "The Ascent" - a lantern-lit climb through torii gates toward the blood moon.
   Driven by window.__expVal (0..1) from the walk-the-path controls; falls back to the scroll cards. */
(function(){
var body=document.body,panel=document.getElementById('experience'),cv=document.getElementById('x3');
if(!panel||!cv||!window.THREE||!window.__torii||!window.__lanternGeo)return;
if((window.__RM===true))return;
var T=window.THREE,S=null,running=false,failed=false,px=0,py=0,hudCh='';
var CAMMAX=.9;
function on(){return body.classList.contains('jv')&&!body.classList.contains('jdone')}
function cTex(w,h,fn){var c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return new T.CanvasTexture(c)}
function init(){
 var R=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
 if(!R.getContext())throw new Error('no gl');
 R.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));R.setClearColor(0x06030a,1);
 var scene=new T.Scene(),cam=new T.PerspectiveCamera(62,1,.1,260);scene.add(cam);
 scene.background=cTex(4,256,function(g,w,h){var r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'#04020a');r.addColorStop(.55,'#12060d');r.addColorStop(1,'#42101a');g.fillStyle=r;g.fillRect(0,0,w,h)});
 scene.fog=new T.FogExp2(0x1c080d,.021);
 scene.add(new T.AmbientLight(0x4a2230,.9));
 var lamp=new T.PointLight(0xff9a5a,1.5,17);lamp.position.set(.4,-.1,-1);cam.add(lamp);
 var glow=cTex(64,64,function(g){var r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
 /* path */
 var pts=[[0,0,6],[0,.4,-14],[7,2,-32],[3,4.2,-52],[-7,6.6,-72],[-5,9,-92],[3,11.4,-108],[1,13.6,-126]].map(function(v){return new T.Vector3(v[0],v[1],v[2])});
 var curve=new T.CatmullRomCurve3(pts,false,'catmullrom',.5),LEN=curve.getLength();
 function P(u){return curve.getPointAt(Math.max(0,Math.min(1,u)))}
 function TG(u){return curve.getTangentAt(Math.max(0,Math.min(1,u)))}
 /* stairs */
 var N=Math.round(LEN/.74),stepG=new T.BoxGeometry(3.3,.22,LEN/N),stepM=new T.MeshLambertMaterial({color:0x4a3434});
 var steps=new T.InstancedMesh(stepG,stepM,N),D=new T.Object3D(),col=new T.Color(),i,k;
 for(i=0;i<N;i++){var u=(i+.5)/N,p=P(u),tg=TG(u);D.position.set(p.x,p.y-.11,p.z);D.rotation.set(0,Math.atan2(tg.x,tg.z),0);D.updateMatrix();steps.setMatrixAt(i,D.matrix);
  var b=.72+.28*Math.random();col.setRGB(b,b*.92,b*.9);steps.setColorAt(i,col)}
 steps.frustumCulled=false;scene.add(steps);
 /* railings, posts, lanterns */
 var postG=new T.BoxGeometry(.17,1.15,.17),postM=new T.MeshLambertMaterial({color:0x2a1215}),lg=window.__lanternGeo('lo'),lm=window.__lanternMat();
 var postPts=[],rails=[[],[]];
 for(i=0;i<N;i+=1){var u2=(i+.5)/N,p2=P(u2),t2=TG(u2),sx=t2.z,sz=-t2.x,sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
  [-1,1].forEach(function(sd,j){var X=p2.x+sx*sd*1.8,Z=p2.z+sz*sd*1.8;if(i%4===0)rails[j].push(new T.Vector3(X,p2.y+.95,Z));if(i%7===0)postPts.push([X,p2.y,Z,sd])})}
 var posts=new T.InstancedMesh(postG,postM,postPts.length),lans=lg&&lm?new T.InstancedMesh(lg,lm,postPts.length):null;
 var glows=[];
 postPts.forEach(function(q,n){D.position.set(q[0],q[1]+.55,q[2]);D.rotation.set(0,0,0);D.scale.setScalar(1);D.updateMatrix();posts.setMatrixAt(n,D.matrix);
  if(lans){D.position.set(q[0],q[1]+1.12,q[2]);D.scale.setScalar(.52);D.updateMatrix();lans.setMatrixAt(n,D.matrix);D.scale.setScalar(1)}
  var sp=new T.Sprite(new T.SpriteMaterial({map:glow,color:0xff8a40,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.55,fog:false}));
  sp.position.set(q[0],q[1]+1.4,q[2]);sp.scale.set(1.9,1.9,1);scene.add(sp);glows.push({sp:sp,ph:n*1.7})});
 posts.frustumCulled=false;scene.add(posts);if(lans){lans.frustumCulled=false;scene.add(lans)}
 var railM=new T.MeshLambertMaterial({color:0x7a1018,emissive:0x1a0408});
 rails.forEach(function(r){scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(r),r.length*3,.05,5,false),railM))});
 /* gates: plain vermilion ones form the tunnel, the model gate marks each chapter */
 var gm=new T.MeshLambertMaterial({color:0x9a1119,emissive:0x240509}),km=new T.MeshLambertMaterial({color:0x140809});
 function plain(){var g=new T.Group(),c=new T.CylinderGeometry(.17,.2,4.5,10);
  [-2.15,2.15].forEach(function(x){var m=new T.Mesh(c,gm);m.position.set(x,2.25,0);g.add(m)});
  var a=new T.Mesh(new T.BoxGeometry(5.7,.3,.62),km);a.position.y=4.7;g.add(a);
  var b=new T.Mesh(new T.BoxGeometry(5.2,.26,.5),gm);b.position.y=4.38;g.add(b);
  var n=new T.Mesh(new T.BoxGeometry(4.6,.2,.3),gm);n.position.y=3.5;g.add(n);return g}
 var lis=[].slice.call(document.querySelectorAll('#tl li')),nL=lis.length,stations=[];
 lis.forEach(function(li,idx){if(li.classList.contains('xp'))stations.push((idx+1)/(nL+1))});
 var stU=stations.map(function(v){return v*CAMMAX+.032}),gates=[];
 function place(g,u,front){var p=P(u),tg=TG(u);g.position.set(p.x,p.y-.12,p.z);g.rotation.y=front?Math.atan2(-tg.x,-tg.z):Math.atan2(tg.x,tg.z);scene.add(g)}
 for(var tu=.07;tu<.9;tu+=.058){if(stU.some(function(s){return Math.abs(s-tu)<.05}))continue;place(plain(),tu,false)}
 stU.forEach(function(u,n){var g=window.__torii({scale:9.2,lod:'lo'});if(!g){g=plain()}else{
   var sp=new T.Sprite(new T.SpriteMaterial({map:glow,color:0xff6a30,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0,fog:false}));
   sp.position.set(0,.545,.1);sp.scale.set(.34,.34,1);g.add(sp);g.userData.sp=sp}
  place(g,u,true);gates.push({g:g,u:u})});
 var fin=window.__torii({scale:12,lod:'lo'});if(fin)place(fin,.945,true);
 /* sky: blood moon, stars, distant ridges */
 var endP=P(1),endT=TG(1);
 var moon=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,opacity:0}));
 moon.center.set(.5-.81/89.3,.5+3.43/59.5);
 new T.TextureLoader().load('data:image/jpeg;base64,'+document.getElementById('bloodMoonData').textContent.trim(),function(tx){tx.minFilter=T.LinearFilter;tx.generateMipmaps=false;moon.material.map=tx;moon.material.opacity=1;moon.material.needsUpdate=true});
 moon.position.set(endP.x+endT.x*60,endP.y+26,endP.z+endT.z*60);moon.scale.set(89.3,59.5,1);scene.add(moon);
 var halo=new T.Sprite(new T.SpriteMaterial({map:glow,color:0xff2a32,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.42,fog:false}));
 halo.position.copy(moon.position);halo.scale.set(130,130,1);scene.add(halo);
 var sg=new T.BufferGeometry(),sa=new Float32Array(420*3);for(i=0;i<420;i++){var th=Math.random()*6.283,ph=Math.acos(Math.random()*.9+.05);sa[i*3]=Math.cos(th)*Math.sin(ph)*220;sa[i*3+1]=Math.cos(ph)*200;sa[i*3+2]=Math.sin(th)*Math.sin(ph)*220-60}
 sg.setAttribute('position',new T.BufferAttribute(sa,3));var stars=new T.Points(sg,new T.PointsMaterial({color:0xffe8dc,size:1.6,sizeAttenuation:false,fog:false,transparent:true,opacity:.8}));scene.add(stars);
 var rm=new T.MeshBasicMaterial({color:0x0b0509});
 for(i=0;i<12;i++){var side=i%2?1:-1,u3=.05+i*.075,pp=P(u3),c=new T.Mesh(new T.ConeGeometry(26+Math.random()*22,50+Math.random()*40,6),rm);c.position.set(pp.x+side*(46+Math.random()*40),pp.y-18,pp.z-10);scene.add(c)}
 /* embers carried along with the camera */
 var NE=240,ea=new Float32Array(NE*3);for(i=0;i<NE;i++){ea[i*3]=(Math.random()-.5)*20;ea[i*3+1]=-3+Math.random()*10;ea[i*3+2]=-28+Math.random()*30}
 var eg=new T.BufferGeometry();eg.setAttribute('position',new T.BufferAttribute(ea,3));
 var em=new T.Points(eg,new T.PointsMaterial({map:glow,color:0xff8a4a,size:.42,transparent:true,opacity:.9,depthWrite:false,blending:T.AdditiveBlending,fog:false}));em.frustumCulled=false;cam.add(em);
 S={R:R,scene:scene,cam:cam,P:P,TG:TG,LEN:LEN,gates:gates,glows:glows,ea:ea,eg:eg,u:0,last:0,lamp:lamp,stars:stars,moon:moon};
 size();return S}
function size(){if(!S)return;var w=panel.clientWidth||innerWidth,h=panel.clientHeight||innerHeight;S.R.setSize(w,h,false);S.cam.aspect=w/h;S.cam.fov=w/h<.8?74:62;S.cam.updateProjectionMatrix()}
function frame(now){
 if(!running)return;requestAnimationFrame(frame);
 if(!on()){running=false;return}
 var dt=Math.min((now-S.last)/1000,.05);S.last=now;var tgt=(window.__expVal||0)*CAMMAX,old=S.u;
 S.u+=(tgt-S.u)*(1-Math.exp(-dt*3));var u=S.u,t=now/1000;
 var p=S.P(u),q=S.P(u+.035),bob=Math.sin(t*2.2)*.025;
 S.cam.position.set(p.x,p.y+1.7+bob,p.z);S.cam.lookAt(q.x+px*3,q.y+1.5+bob-py*1.2,q.z);
 S.lamp.intensity=1.4+.25*Math.sin(t*9)+.12*Math.sin(t*23);
 S.glows.forEach(function(g){g.sp.material.opacity=.5+.12*Math.sin(t*4+g.ph)+.06*Math.sin(t*13+g.ph)});
 S.gates.forEach(function(e){var sp=e.g.userData.sp;if(sp){var d=u-e.u,k=Math.max(0,Math.min(1,1-Math.abs(d)/.12)),pass=d>-.03?1:0;sp.material.opacity=(.18+.62*k)*(.8+.2*Math.sin(t*3+e.u*40))*(pass||k>0?1:.25)}});
 var dm=(u-old)*S.LEN,ea=S.ea;for(var i=0;i<ea.length;i+=3){ea[i+1]+=dt*(.35+(i%5)*.07);ea[i]+=Math.sin(t+i)*dt*.18;ea[i+2]+=dm;
  if(ea[i+1]>7)ea[i+1]=-3;if(ea[i+2]>3)ea[i+2]=-28;if(ea[i+2]<-29)ea[i+2]=3}
 S.eg.attributes.position.needsUpdate=true;
 var alt=document.getElementById('xalt'),bar=document.getElementById('xbar'),ch=document.getElementById('xch');
 if(alt)alt.textContent=Math.round(S.P(u).y*10)/10+' m';if(bar)bar.style.width=Math.round((window.__expVal||0)*100)+'%';
 var cur=document.querySelector('#tl>li.xp.cur .org'),name=cur?cur.textContent:'Trailhead';if(ch&&name!==hudCh){hudCh=name;ch.textContent=name}
 S.R.render(S.scene,S.cam)}
function activate(){
 if(failed||!on())return;
 try{if(!S)init();body.classList.add('x3d');size();if(!running){running=true;S.last=performance.now();requestAnimationFrame(frame)}window.__cov11=true}
 catch(e){failed=true;window.__cov11=false;body.classList.remove('x3d');running=false;try{console.error('Ascent unavailable, using scroll cards',e)}catch(x){}}}
document.addEventListener('portfolio:view',function(e){if(e.detail&&e.detail.id==='experience')setTimeout(activate,0);else{running=false;window.__cov11=false}});
if(location.hash==='#experience')setTimeout(activate,60);
addEventListener('resize',size);
panel.addEventListener('pointermove',function(e){px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5});
var ty=null;panel.addEventListener('touchstart',function(e){ty=e.target.closest&&e.target.closest('#tl')?null:e.touches[0].clientY},{passive:true});
panel.addEventListener('touchmove',function(e){if(ty==null||!running)return;var y=e.touches[0].clientY,dy=ty-y;ty=y;if(window.__expSet)window.__expSet((window.__expVal||0)+dy/650)},{passive:true});
document.addEventListener('visibilitychange',function(){if(document.hidden)running=false;else if(on()&&S&&!failed)activate()});
})();
