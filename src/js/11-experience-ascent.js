
/* Experience: "The Crossing to the Keep". The oni gate (closed at the end of Projects) opens, then each role gets its own bridge over the moat:
   role 1 = red arched bridge, role 2 = covered wooden bridge, plus a short "what's next" bridge into the keep. A lantern with the role title and dates
   lights as you reach each bridge, torii mark the change between roles. After the last bridge the camera rises past the red bridges to the keep door,
   then climbs fast to the roof, where the Skills fall begins.
   Driven by window.__expVal (0..1) from the walk-the-path controls (10-gate-lanterns.js); falls back to the scroll cards. */
(function(){
var body=document.body,panel=document.getElementById('experience'),cv=document.getElementById('x3');
if(!panel||!cv||!window.THREE||!window.__torii||!window.__lanternGeo)return;
if((window.__RM===true))return;
var T=window.THREE,S=null,running=false,failed=false,px=0,py=0,hudCh='';
function on(){return body.classList.contains('jv')&&!body.classList.contains('jdone')}
function cTex(w,h,fn){var c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return new T.CanvasTexture(c)}
function sm(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
function lerp(a,b,t){return a+(b-a)*t}
/* ---- layout (world units; the walk runs along -z) ---- */
var GATE_Z=0,MOAT_Z=-32,B1=[-32,-64],L1=-70,B2=[-76,-112],L2=-118,B3=[-124,-138],END_Z=-142,H1=3.2;
var CAST_S=34,CAST_Z=-157,CAST_X=4.4,CAST_Y=-2.5;            /* castle scale + position: its front torii lands at the end of bridge 3 */
var SERIF='"Cormorant Garamond","Hoefler Text",Georgia,serif',SANS='Jost,"Helvetica Neue",Arial,sans-serif';
function deckY(z){
 if(z<=B1[0]&&z>=B1[1]){var t=(B1[0]-z)/(B1[0]-B1[1]);return H1*4*t*(1-t)}
 if(z<=B3[0]&&z>=B3[1]){var t3=(B3[0]-z)/(B3[0]-B3[1]);return -.7*t3}
 return z<B3[1]?-.7:0}
function roles(){return [].slice.call(document.querySelectorAll('#tl li.xp')).map(function(li){var q=function(s){var e=li.querySelector(s);return e?e.textContent:''};return{t:q('.xtt'),o:q('.org'),d:q('.dt')}})}
function label(t1,t2){return cTex(640,200,function(g,w,h){g.textAlign='left';g.textBaseline='alphabetic';
 var fs=62;g.font='600 '+fs+'px '+SERIF;while(g.measureText(t1).width>600&&fs>34){fs-=3;g.font='600 '+fs+'px '+SERIF}
 g.shadowColor='rgba(0,0,0,.9)';g.shadowBlur=14;g.fillStyle='#f3e8d6';g.fillText(t1,18,84);
 g.fillStyle='#e0343f';g.fillRect(18,102,70,3);
 g.shadowBlur=10;g.fillStyle='#d8c9b0';var f2=34;g.font='400 '+f2+'px '+SANS;while(g.measureText(t2).width>600&&f2>20){f2-=2;g.font='400 '+f2+'px '+SANS}g.fillText(t2,18,152)})}
function init(){
 var R=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
 if(!R.getContext())throw new Error('no gl');
 R.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));R.setClearColor(0x05070b,1);
 var scene=new T.Scene(),cam=new T.PerspectiveCamera(60,1,.1,520),i,k;scene.add(cam);
 var fogC=new T.Color(0x05070b);scene.background=fogC.clone();scene.fog=new T.FogExp2(0x05070b,.0105);
 var amb=new T.AmbientLight(0x7a89aa,.62);scene.add(amb);
 var moonL=new T.DirectionalLight(0x8aa0d8,.55);moonL.position.set(-30,70,40);scene.add(moonL);
 var lamp=new T.PointLight(0xffa862,1.4,18);lamp.position.set(.4,-.1,-1);cam.add(lamp);
 var glow=cTex(64,64,function(g){var r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
 var D=new T.Object3D();
 var wood=new T.MeshLambertMaterial({color:0x3b2a1f}),woodD=new T.MeshLambertMaterial({color:0x24170f}),red=new T.MeshLambertMaterial({color:0xa81c26,emissive:0x2a0509}),stone=new T.MeshLambertMaterial({color:0x2b2a33}),stoneL=new T.MeshLambertMaterial({color:0x4a4752});
 function box(w,h,d,m,x,y,z,parent){var b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);(parent||scene).add(b);return b}
 /* ---- sky: blood moon behind the keep, stars, ridges ---- */
 var kx=CAST_X,kz=CAST_Z-6,moon=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,opacity:0}));
 moon.center.set(.5-.81/89.3,.5+3.43/59.5);
 window.__jtData('bloodMoonData').then(function(b64){new T.TextureLoader().load('data:image/jpeg;base64,'+b64.trim(),function(tx){tx.minFilter=T.LinearFilter;tx.generateMipmaps=false;moon.material.map=tx;moon.material.opacity=1;moon.material.needsUpdate=true})});
 moon.position.set(kx,38,kz-150);moon.scale.set(150,100,1);scene.add(moon);
 var halo=new T.Sprite(new T.SpriteMaterial({map:glow,color:0xff2a32,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.34,fog:false}));halo.position.copy(moon.position);halo.position.z+=2;halo.scale.set(220,220,1);scene.add(halo);
 var sg=new T.BufferGeometry(),sa=new Float32Array(360*3);for(i=0;i<360;i++){var th=Math.random()*6.283,ph=Math.acos(Math.random()*.85+.1);sa[i*3]=Math.cos(th)*Math.sin(ph)*400;sa[i*3+1]=Math.cos(ph)*300;sa[i*3+2]=Math.sin(th)*Math.sin(ph)*400-90}
 sg.setAttribute('position',new T.BufferAttribute(sa,3));scene.add(new T.Points(sg,new T.PointsMaterial({color:0xcfd8ee,size:1.5,sizeAttenuation:false,fog:false,transparent:true,opacity:.6})));
 var rm=new T.MeshBasicMaterial({color:0x070a10});
 for(i=0;i<14;i++){var sd=i%2?1:-1,c=new T.Mesh(new T.ConeGeometry(30+Math.random()*26,60+Math.random()*50,6),rm);c.position.set(sd*(70+Math.random()*70),-14,-20-i*17);scene.add(c)}
 /* ---- moat ---- */
 var water=new T.Mesh(new T.PlaneGeometry(420,420),new T.ShaderMaterial({uniforms:{uTime:{value:0}},
  vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'varying vec3 vW;uniform float uTime;void main(){float d=length(vW.xz-cameraPosition.xz);float s=exp(-pow((vW.x-4.)*.05,2.))*(.3+.7*smoothstep(.1,.9,sin(vW.z*1.05+uTime*.8+sin(vW.x*.9+uTime)*1.6)*.5+.5))*smoothstep(4.,60.,d);vec3 c=vec3(.015,.022,.035)+vec3(.85,.12,.18)*s*.75;c=mix(c,vec3(.027,.035,.05),1.-exp(-d*.01));gl_FragColor=vec4(c,1.);}'}));
 water.rotation.x=-Math.PI/2;water.position.set(0,-1.4,-110);scene.add(water);
 /* ---- outer wall, courtyard, landings ---- */
 box(64,.6,46,stone,0,-.3,-9);                              /* courtyard ground, gate to moat edge */
 box(7,.04,46,stoneL,0,.02,-9);                             /* paved path */
 box(60,7,2.6,stone,-36.5,3.5,-.4);box(60,7,2.6,stone,36.5,3.5,-.4);          /* wall either side of the gate */
 box(60,1,1.4,woodD,-36.5,7.4,-.4);box(60,1,1.4,woodD,36.5,7.4,-.4);
 [L1,L2].forEach(function(z){box(15,.7,12,stone,0,-.35,z);box(17,1.6,.7,stone,0,-.6,z+6.2);box(17,1.6,.7,stone,0,-.6,z-6.2)});
 box(12,.7,7,stone,0,-1.05,END_Z+1);
 /* ---- oni gate, now the castle's closed outer gate, and its doors ---- */
 var oni=window.__oni?window.__oni({scale:15.5,y:0,glowMap:glow}):null;if(oni){oni.position.z=GATE_Z;scene.add(oni)}
 var doorM=new T.MeshLambertMaterial({color:0x2a1210,emissive:0x120505}),leaves=[];
 [-1,1].forEach(function(sd){var pv=new T.Group();pv.position.set(sd*5.9,0,-.5);var lf=new T.Mesh(new T.BoxGeometry(5.8,5.7,.4),doorM);lf.position.set(-sd*2.9,2.85,0);pv.add(lf);
  for(var r=0;r<3;r++)for(var c=0;c<4;c++){var st=new T.Mesh(new T.SphereGeometry(.11,6,5),red);st.position.set(-sd*(.7+c*1.4),1.2+r*1.6,.22);pv.add(st)}
  scene.add(pv);leaves.push({pv:pv,sd:sd})});
 var seam=new T.Sprite(new T.SpriteMaterial({map:glow,color:0xff4a30,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.5,fog:false}));seam.scale.set(7,12,1);seam.position.set(0,3,-.3);scene.add(seam);
 /* ---- lantern helper ---- */
 var lg=window.__lanternGeo('lo'),lm=window.__lanternMat(),lanterns=[];
 function lantern(x,y,z,sc,lab){var m=lg&&lm?new T.Mesh(lg,lm):new T.Mesh(new T.SphereGeometry(.2,8,6),new T.MeshBasicMaterial({color:0xff9a4a}));m.scale.setScalar(sc||.9);m.position.set(x,y,z);scene.add(m);
  var sp=new T.Sprite(new T.SpriteMaterial({map:glow,color:0xff8a40,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.18,fog:false}));sp.position.set(x,y+.2,z);sp.scale.set(3,3,1);scene.add(sp);
  var e={sp:sp,m:m,lab:null,on:0,ph:Math.random()*6};
  if(lab){var ls=new T.Sprite(new T.SpriteMaterial({map:lab.tex,transparent:true,depthWrite:false,opacity:0,fog:false}));ls.scale.set(lab.w,lab.w*200/640,1);ls.position.set(x+(lab.dx||0),y+(lab.dy||0),z);scene.add(ls);e.lab=ls}
  lanterns.push(e);return e}
 function post(x,z,y0,h){box(.3,h,.3,woodD,x,y0+h/2,z)}
 /* ---- bridge 1: red arched bridge ---- */
 (function(){var L=B1[0]-B1[1],N=Math.round(L/.55),pl=new T.InstancedMesh(new T.BoxGeometry(4.4,.18,L/N+.02),red,N),pts=[],c=new T.Color();
  for(i=0;i<N;i++){var t=(i+.5)/N,z=B1[0]-L*t,y=deckY(z),t2=Math.min(1,t+.01),z2=B1[0]-L*t2,dy=deckY(z2)-y;D.position.set(0,y,z);D.rotation.set(Math.atan2(dy,L*.01),0,0);D.scale.set(1,1,1);D.updateMatrix();pl.setMatrixAt(i,D.matrix);var b=.8+.2*Math.random();c.setRGB(b,b*.7,b*.7);pl.setColorAt(i,c)}
  pl.frustumCulled=false;scene.add(pl);
  [-1,1].forEach(function(sd){var rp=[];for(i=0;i<=24;i++){var z=B1[0]-L*i/24;rp.push(new T.Vector3(sd*2.15,deckY(z)+1.05,z))}scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(rp),48,.08,6,false),red));
   for(i=0;i<=8;i++){var z=B1[0]-L*i/8;box(.2,1.1,.2,red,sd*2.15,deckY(z)+.55,z)}
   var arch=new T.Mesh(new T.TorusGeometry(1,.2,6,32,Math.PI),woodD);arch.scale.set(L/2,H1*1.05,1);arch.rotation.y=Math.PI/2;arch.position.set(sd*1.9,-.08,B1[0]-L/2);scene.add(arch)});
  box(5.2,2.6,1.6,stone,0,-.6,B1[0]+.6);box(5.2,2.6,1.6,stone,0,-.6,B1[1]-.6)})();
 /* ---- bridge 2: covered wooden bridge ---- */
 (function(){var z0=B2[0],z1=B2[1],L=z0-z1,mid=(z0+z1)/2;
  box(4.6,.3,L,wood,0,-.15,mid);box(4.2,.05,L,woodD,0,.02,mid);
  for(var z=z0-2;z>z1+1;z-=4.5){[-1,1].forEach(function(sd){post(sd*2.3,z,0,5.2)});box(5.1,.22,.3,woodD,0,5.1,z);box(4.3,.16,.22,woodD,0,3.6,z)}
  [-1,1].forEach(function(sd){box(.12,.12,L,woodD,sd*2.3,1.05,mid);box(.12,.12,L,woodD,sd*2.3,.5,mid);box(.2,.2,L,woodD,sd*2.3,5.2,mid);
   var rf=new T.Mesh(new T.BoxGeometry(3.4,.2,L+1.6),new T.MeshLambertMaterial({color:0x14100e}));rf.position.set(sd*1.55,5.7,mid);rf.rotation.z=-sd*.34;scene.add(rf)});
  box(.4,.3,L+1.6,woodD,0,6.45,mid);
  for(var z=z0-6;z>z1+3;z-=9)lantern(0,3.7,z,.7)})();
 /* ---- bridge 3: the short "what's next" bridge into the keep ---- */
 (function(){var L=B3[0]-B3[1],N=Math.round(L/.6),pl=new T.InstancedMesh(new T.BoxGeometry(3.6,.14,L/N+.02),wood,N),c=new T.Color();
  for(i=0;i<N;i++){var t=(i+.5)/N,z=B3[0]-L*t,t2=Math.min(1,t+.01),dy=deckY(B3[0]-L*t2)-deckY(z);D.position.set(0,deckY(z),z);D.rotation.set(Math.atan2(dy,L*.01),0,0);D.updateMatrix();pl.setMatrixAt(i,D.matrix);var b=.75+.3*Math.random();c.setRGB(b,b*.9,b*.85);pl.setColorAt(i,c)}
  pl.frustumCulled=false;scene.add(pl);
  [-1,1].forEach(function(sd){for(i=0;i<=5;i++){var z=B3[0]-L*i/5;post(sd*1.7,z,deckY(z),1.1)}
   var rp=[];for(i=0;i<=8;i++){var z=B3[0]-L*i/8;rp.push(new T.Vector3(sd*1.7,deckY(z)+1,z))}scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(rp),16,.05,5,false),woodD))});
  box(4.2,1.8,1.4,stone,0,-1,B3[0]+.6)})();
 /* ---- torii mark the change between roles, plus the one at the foot of the crag ---- */
 [[L1,7.2],[L2,7.2]].forEach(function(q){var g=window.__torii({scale:q[1],lod:'lo'});if(g){g.position.set(0,0,q[0]);scene.add(g)}});
 /* ---- the castle ---- */
 var castle=window.__castle?window.__castle({glowMap:glow,k:1}):null;
 if(castle){castle.scale.setScalar(CAST_S);castle.position.set(CAST_X,CAST_Y,CAST_Z);scene.add(castle);castle.userData.lights(1)}
 var kp=function(a){return new T.Vector3(CAST_X+a[0]*CAST_S,CAST_Y+a[1]*CAST_S,CAST_Z+a[2]*CAST_S)};
 var DOOR=kp([0,.49,-.06]),TOP=kp([-.01,.83,-.2]);
 /* ---- lanterns with titles: one at the head of each bridge ---- */
 var RL=roles(),heads=[B1[0]+1.6,B2[0]+1.6,B3[0]+1.6],lanT=[],lanE=[];
 var info=[];RL.slice(0,2).forEach(function(r){info.push([r.t||'Role',[r.o,r.d].filter(Boolean).join('  ·  ')])});
 while(info.length<2)info.push(['Role','']);
 info.push(['What’s next','The keep awaits']);
 info.forEach(function(q,n){var z=heads[n];
  lanE.push(lantern(-2.6,2.4,z,.95,{tex:label(q[0],q[1]),w:9.4,dx:-5.6,dy:.9}))});
 /* extra bridge lanterns: posts on bridge 1 and 3 */
 for(i=0;i<5;i++){var z=B1[0]-3-i*6;[-1,1].forEach(function(sd){lantern(sd*2.15,deckY(z)+1.45,z,.5)})}
 [-1,1].forEach(function(sd){lantern(sd*1.7,deckY(B3[0]-5)+1.4,B3[0]-5,.5)});
 [-1,1].forEach(function(sd){lantern(sd*6.4,.8,L1+4,.7);lantern(sd*6.4,.8,L2+4,.7)});
 [-1,1].forEach(function(sd){for(i=0;i<4;i++)lantern(sd*4,.9,-6-i*8,.6)});
 /* ---- camera path: along the bridges, then up the front of the crag ---- */
 var pts=[];
 [11,2,-8,-20,-30].forEach(function(z){pts.push(new T.Vector3(0,1.9,z))});
 for(var z=-32;z>=-140;z-=5)pts.push(new T.Vector3(Math.sin(z*.05)*.25,deckY(z)+(z<B3[0]?1.7:1.9),z));
 var door0=new T.Vector3(0,DOOR.y-.4,-135),roof0=new T.Vector3(2,TOP.y+5,-137);
 pts.push(new T.Vector3(-.5,5,-135.5));pts.push(new T.Vector3(-1,9,-135));pts.push(door0);pts.push(new T.Vector3(1,19,-135.5));pts.push(roof0);
 var curve=new T.CatmullRomCurve3(pts,false,'catmullrom',.5),LEN=curve.getLength(),NS=2400,samp=[];
 for(i=0;i<=NS;i++)samp.push(curve.getPointAt(i/NS));
 function nearest(x,y,z){var b=0,bd=1e9,p=new T.Vector3(x,y,z);for(var j=0;j<=NS;j++){var d=samp[j].distanceToSquared(p);if(d<bd){bd=d;b=j}}return b/NS}
 var sB1=nearest(0,1.9,B1[0]),sB2=nearest(0,1.9,B2[0]),sB3=nearest(0,1.9,B3[0]),sE3=nearest(0,1.05,-137),sD=nearest(door0.x,door0.y,door0.z);
 /* walk value (0..1) -> arc position: lantern 1 and 2 light at the walk controls' own thresholds (1/3 and 2/3) */
 var KEY=[[0,0],[1/3,sB1+.004],[2/3,sB2+.004],[.8,sB3+.004],[.87,sE3],[.94,sD],[1,1]];
 function arc(v){for(var j=1;j<KEY.length;j++)if(v<=KEY[j][0]){var a=KEY[j-1],b=KEY[j],t=(v-a[0])/(b[0]-a[0]);return lerp(a[1],b[1],t)}return 1}
 /* ---- weather: rain streaks around the camera, lightning now and then ---- */
 var NR=360,ra=new Float32Array(NR*6),rs=[];for(i=0;i<NR;i++)rs.push({x:(Math.random()-.5)*34,y:Math.random()*20-4,z:-Math.random()*40+6,v:16+Math.random()*10});
 var rg=new T.BufferGeometry();rg.setAttribute('position',new T.BufferAttribute(ra,3));var rain=new T.LineSegments(rg,new T.LineBasicMaterial({color:0x9fb4d8,transparent:true,opacity:.28,fog:false,depthWrite:false}));rain.frustumCulled=false;cam.add(rain);
 var NE=200,ea=new Float32Array(NE*3);for(i=0;i<NE;i++){ea[i*3]=(Math.random()-.5)*18;ea[i*3+1]=-3+Math.random()*10;ea[i*3+2]=-26+Math.random()*28}
 var eg=new T.BufferGeometry();eg.setAttribute('position',new T.BufferAttribute(ea,3));
 var em=new T.Points(eg,new T.PointsMaterial({map:glow,color:0xff8a4a,size:.38,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending,fog:false}));em.frustumCulled=false;cam.add(em);
 S={R:R,scene:scene,cam:cam,curve:curve,LEN:LEN,arc:arc,leaves:leaves,seam:seam,oni:oni,castle:castle,lanE:lanE,lanterns:lanterns,rs:rs,ra:ra,rg:rg,ea:ea,eg:eg,amb:amb,lamp:lamp,fogC:fogC,water:water,moon:moon,halo:halo,DOOR:DOOR,TOP:TOP,u:0,last:0,flash:0,nextFlash:6,dist:0,pz:0};
 size();return S}
function size(){if(!S)return;var w=panel.clientWidth||innerWidth,h=panel.clientHeight||innerHeight;S.R.setSize(w,h,false);S.cam.aspect=w/h;S.cam.fov=w/h<.8?76:60;S.cam.updateProjectionMatrix()}
var NAMES=null,V=new window.THREE.Vector3(),VL=new window.THREE.Vector3();
function stage(v,rl){var a=rl[0]?rl[0].o:'The First Role',b=rl[1]?rl[1].o:'The Second Role';
 return v<.12?'The Outer Gate':v<.3?'The Moat':v<.62?a:v<.78?b:v<.86?'What’s next':v<.95?'The Keep':'The Roof'}
function frame(now){
 if(!running)return;requestAnimationFrame(frame);
 if(!on()){running=false;return}
 var dt=Math.min((now-S.last)/1000,.05);S.last=now;var tgt=window.__expVal||0;
 S.u+=(tgt-S.u)*(1-Math.exp(-dt*3));var v=S.u,t=now/1000,s=S.arc(v);
 var p=S.curve.getPointAt(s),q=S.curve.getPointAt(Math.min(1,s+.018)),bob=Math.sin(t*2.2)*.025,old=S.pz;
 S.cam.position.set(p.x,p.y+bob,p.z);
 /* look ahead along the path; near the keep, look at the door and then the roof */
 var kd=sm(.8,.92,v),kr=sm(.93,1,v);
 VL.set(q.x+px*3,q.y+.05+bob-py*1.2,q.z);
 V.copy(S.DOOR);VL.lerp(V,kd*(1-kr));V.copy(S.TOP);VL.lerp(V,kr);
 S.cam.lookAt(VL);
 S.dist+=Math.abs(p.z-old)+Math.abs(p.y-S.py||0);S.pz=p.z;S.py=p.y;
 /* gate doors open as the walk begins */
 var op=sm(.0,.1,v),ang=op*1.5;S.leaves.forEach(function(l){l.pv.rotation.y=-l.sd*ang});
 S.seam.material.opacity=.55*(1-op);
 if(S.oni&&S.oni.userData.pulse)S.oni.userData.pulse(t);if(S.castle&&S.castle.userData.pulse)S.castle.userData.pulse(t);
 /* lanterns light when reached */
 S.lanterns.forEach(function(e){var d=e.m.position.z-p.z,tg=(!e.lab||d>-1.5)?1:0;e.on+=(tg-e.on)*Math.min(1,dt*3);
  e.sp.material.opacity=(.14+.62*e.on)*(.85+.1*Math.sin(t*5+e.ph)+.05*Math.sin(t*13+e.ph*2));if(e.lab)e.lab.material.opacity=Math.max(0,Math.min(1,(e.on-.15)/.7))*(1-sm(26,46,d))});
 /* lightning */
 S.nextFlash-=dt;if(S.nextFlash<0){S.nextFlash=9+Math.random()*9;S.flash=1;try{document.dispatchEvent(new CustomEvent('jt:strike',{detail:{dist:.35}}))}catch(e){}
  setTimeout(function(){if(window.JSND)JSND.play('thunder2')},700)}
 S.flash*=Math.pow(.02,dt);
 S.fogC.setRGB(.02+.09*S.flash,.027+.11*S.flash,.043+.2*S.flash);S.scene.background.copy(S.fogC);S.scene.fog.color.copy(S.fogC);S.amb.intensity=.62+S.flash*1.5;
 S.lamp.intensity=1.3+.2*Math.sin(t*9)+.1*Math.sin(t*23);
 S.water.material.uniforms.uTime.value=t;
 S.moon.position.y=34+10*v;S.halo.position.y=S.moon.position.y;
 /* rain + embers travel with the camera */
 var ra=S.ra,rs=S.rs;for(var i=0;i<rs.length;i++){var r=rs[i];r.y-=r.v*dt;if(r.y<-5){r.y=15+Math.random()*4;r.x=(Math.random()-.5)*34}ra[i*6]=r.x;ra[i*6+1]=r.y;ra[i*6+2]=r.z;ra[i*6+3]=r.x-.04;ra[i*6+4]=r.y-.55;ra[i*6+5]=r.z}
 S.rg.attributes.position.needsUpdate=true;
 var ea=S.ea;for(i=0;i<ea.length;i+=3){ea[i+1]+=dt*(.35+(i%5)*.07);ea[i]+=Math.sin(t+i)*dt*.18;if(ea[i+1]>7)ea[i+1]=-3}
 S.eg.attributes.position.needsUpdate=true;
 var alt=document.getElementById('xalt'),bar=document.getElementById('xbar'),ch=document.getElementById('xch');
 if(alt)alt.textContent=Math.round(S.dist*.5)+' m';if(bar)bar.style.width=Math.round(v*100)+'%';
 var rl=NAMES||(NAMES=roles()),name=stage(v,rl);if(ch&&name!==hudCh){hudCh=name;ch.textContent=name}
 S.R.render(S.scene,S.cam)}
function activate(){
 if(failed||!on())return;
 try{if(!S)init();body.classList.add('x3d');size();if(!running){running=true;S.last=performance.now();requestAnimationFrame(frame)}window.__cov11=true}
 catch(e){failed=true;window.__cov11=false;body.classList.remove('x3d');running=false;try{console.error('Crossing unavailable, using scroll cards',e)}catch(x){}}}
document.addEventListener('portfolio:view',function(e){if(e.detail&&e.detail.id==='experience')setTimeout(activate,0);else{running=false;window.__cov11=false}});
if(location.hash==='#experience')setTimeout(activate,60);
addEventListener('resize',size);
panel.addEventListener('pointermove',function(e){px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5});
var ty=null;panel.addEventListener('touchstart',function(e){ty=e.target.closest&&e.target.closest('#tl')?null:e.touches[0].clientY},{passive:true});
panel.addEventListener('touchmove',function(e){if(ty==null||!running)return;var y=e.touches[0].clientY,dy=ty-y;ty=y;if(window.__expSet)window.__expSet((window.__expVal||0)+dy/650)},{passive:true});
document.addEventListener('visibilitychange',function(){if(document.hidden)running=false;else if(on()&&S&&!failed)activate()});
})();
