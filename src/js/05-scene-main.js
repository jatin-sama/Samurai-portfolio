
(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var coarse=matchMedia('(pointer: coarse)').matches;
var body=document.body, veil=$('#veil'), toastEl=$('#toast');
$('#hint').textContent=coarse?'Drag to look around':'Move to look around';

/* ---- Config: set roninGLB to a model path to replace the procedural prototype ---- */
var CONFIG={roninGLB:'embedded',T:7.4};

function toast(msg){toastEl.textContent=msg;toastEl.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(function(){toastEl.classList.remove('on')},2400)}
function revealUI(){body.classList.add('ui-in')}
function go(id){document.dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{id:id}}));
  location.hash=id;return true}
document.querySelectorAll('[data-go]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();go(a.dataset.go)})});

function fallback(){document.documentElement.classList.add('nofx');revealUI()}
if(!window.THREE){fallback();return}
var renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('#c'),antialias:true,powerPreference:'high-performance'});if(!renderer.getContext())throw 0}catch(e){fallback();return}
$('#c').addEventListener('webglcontextlost',function(e){e.preventDefault();fallback()});

/* ---- Renderer / scene ---- */
var FOG=0x1a2739, DENS=0.016;
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,((navigator.hardwareConcurrency||8)<=4||coarse)?1.5:1.75));
var scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(FOG,DENS);
(function(){var c=document.createElement('canvas');c.width=4;c.height=512;var g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,512);
 gr.addColorStop(0,'#03050a');gr.addColorStop(.22,'#0a111c');gr.addColorStop(.4,'#1a2739');gr.addColorStop(1,'#1a2739');g.fillStyle=gr;g.fillRect(0,0,4,512);scene.background=new THREE.CanvasTexture(c)})();
var camera=new THREE.PerspectiveCamera(36,1,.1,400);

function glowTex(inner,outer){var c=document.createElement('canvas');c.width=c.height=128;var g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,inner);r.addColorStop(1,outer);g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
function mistTex(){var c=document.createElement('canvas');c.width=256;c.height=64;var g=c.getContext('2d');
 for(var i=0;i<14;i++){var x=20+Math.random()*216,y=18+Math.random()*28,rr=22+Math.random()*26,gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,64)}
 return new THREE.CanvasTexture(c)}
function rnd(a,b){return a+Math.random()*(b-a)}

/* ---- Lights ---- */
var hemi=new THREE.HemisphereLight(0x3a4d6e,0x0a0c10,.0);scene.add(hemi);
var moonLight=new THREE.DirectionalLight(0x9db4e0,0);moonLight.position.set(-12,14,-18);moonLight.target.position.set(0,2.4,0);scene.add(moonLight,moonLight.target);
var lampLight=new THREE.PointLight(0xff9a48,0,10,1.6);lampLight.position.set(3.2,3.5,1.9);scene.add(lampLight);
var heroRed=new THREE.PointLight(0xff2a1a,0,6,1.6);heroRed.position.set(.6,3.3,.8);scene.add(heroRed);

/* ---- Sky: moon ---- */
var moon=new THREE.Mesh(new THREE.CircleGeometry(4.6,48),new THREE.MeshBasicMaterial({color:0xdfe7fb,fog:false}));moon.position.set(-26,27,-110);scene.add(moon);
var moonGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex('rgba(150,175,225,.55)','rgba(150,175,225,0)'),fog:false,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.55}));
moonGlow.position.copy(moon.position);moonGlow.scale.set(60,60,1);scene.add(moonGlow);

/* ---- Water ---- */
var waterU={t:{value:0},fogC:{value:new THREE.Color(FOG)},dens:{value:DENS},moon:{value:new THREE.Vector2(-26,-110)},warm:{value:0}};
var water=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.ShaderMaterial({uniforms:waterU,
vertexShader:'varying vec3 wp;void main(){vec4 w=modelMatrix*vec4(position,1.);wp=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
fragmentShader:'uniform float t;uniform vec3 fogC;uniform float dens;uniform vec2 moon;uniform float warm;varying vec3 wp;'+
'void main(){float d=distance(cameraPosition,wp);'+
'float r=sin(wp.x*1.3+t*.7)*.5+sin(wp.z*1.9-t*.55)*.5+.45*sin((wp.x*.8+wp.z)*3.7+t*1.1);'+
'vec3 col=mix(vec3(.012,.018,.03),vec3(.03,.045,.07),smoothstep(0.,60.,d));'+
'vec2 dir=moon-cameraPosition.xz;float s=(wp.z-cameraPosition.z)/dir.y;float lx=cameraPosition.x+dir.x*s;'+
'float w=.5+abs(wp.z-cameraPosition.z)*.05;float q=(wp.x-lx+r*.12)/w;float streak=s>0.?exp(-q*q):0.;'+
'streak*=smoothstep(.1,.9,r*.5+.5)*(1.-smoothstep(60.,140.,d));col+=vec3(.5,.62,.85)*streak*.5;'+
'float a=wp.x-3.,b=wp.z-.3;float lamp=exp(-a*a*.5-b*b*.18);col+=vec3(1.,.5,.18)*lamp*warm*.35*(.45+.55*smoothstep(-.2,.9,r));'+
'float f=1.-exp(-pow(dens*d,2.));gl_FragColor=vec4(mix(col,fogC,f),1.);}'}));
water.rotation.x=-Math.PI/2;scene.add(water);

/* ---- Distant ridges + trees ---- */
var ridgeMat=new THREE.MeshBasicMaterial({color:0x06090f});
function ridgeY(x,base,amp,s){return base+amp*(.5+.5*Math.sin(x*.05+s))+amp*.5*Math.sin(x*.13+s*2.3)+amp*.22*Math.sin(x*.31+s*1.7)}
[[-28,4,3.4,1],[-44,7,5,2.7],[-64,10,6.5,4.1],[-88,14,7,5.9]].forEach(function(L,li){
 var z=L[0],sh=new THREE.Shape();sh.moveTo(-170,0);
 for(var x=-170;x<=170;x+=4)sh.lineTo(x,Math.max(1,ridgeY(x,L[1],L[2],L[3])));
 sh.lineTo(170,0);sh.closePath();var m=new THREE.Mesh(new THREE.ShapeGeometry(sh),ridgeMat);m.position.z=z;scene.add(m);
 if(li<2){var n=90,tr=new THREE.InstancedMesh(new THREE.ConeGeometry(.5,2.4,6).translate(0,1.2,0),new THREE.MeshBasicMaterial({color:0x04070b}),n),d=new THREE.Object3D();
  for(var i=0;i<n;i++){var x=rnd(-100,100),s=rnd(1,2.5);d.position.set(x,Math.max(1,ridgeY(x,L[1],L[2],L[3]))-.4,z+rnd(-2,2));d.scale.set(s*rnd(.8,1.2),s,s);d.updateMatrix();tr.setMatrixAt(i,d.matrix)}
  scene.add(tr)}
});

/* ---- Torii and pagoda silhouettes ---- */
var darkMat=new THREE.MeshStandardMaterial({color:0x0b0e14,roughness:1});
var toriiMat=new THREE.MeshStandardMaterial({color:0x4a0d12,roughness:.85});
(function(){var g=window.__torii&&window.__torii({scale:7.8,y:-.2,tint:0xb8aeb0});
 if(!g){g=new THREE.Group();
 [-2,2].forEach(function(x){var p=new THREE.Mesh(new THREE.CylinderGeometry(.26,.3,5.6,10),toriiMat);p.position.set(x,2.5,0);g.add(p)});
 var k=new THREE.Mesh(new THREE.BoxGeometry(7.4,.42,.55),toriiMat);k.position.y=5.5;g.add(k);
 var k2=new THREE.Mesh(new THREE.BoxGeometry(6.2,.34,.4),toriiMat);k2.position.y=4.5;g.add(k2)}
 g.position.x=-7.5;g.position.z=-9;g.rotation.y=.25;scene.add(g)})();
(function(){var g=new THREE.Group(),winMat=new THREE.MeshBasicMaterial({color:0xffa24d});
 for(var i=0;i<3;i++){var w=4.2-i*.8,b=new THREE.Mesh(new THREE.BoxGeometry(w*.7,1.5,w*.7),darkMat);b.position.y=1.2+i*2.3;g.add(b);
  var r=new THREE.Mesh(new THREE.ConeGeometry(w*.95,1.1,4),darkMat);r.rotation.y=Math.PI/4;r.scale.y=.8;r.position.y=2.35+i*2.3;g.add(r);
  var wn=new THREE.Mesh(new THREE.BoxGeometry(.25,.4,.05),winMat);wn.position.set(0,1.2+i*2.3,w*.35+.02);g.add(wn)}
 var f=new THREE.Mesh(new THREE.CylinderGeometry(.04,.08,2.2,6),darkMat);f.position.y=9.6;g.add(f);
 g.position.set(15,0,-34);scene.add(g)})();

/* ---- Bridge ---- */
var BR={half:14,N:60,w:2.8};
function archY(x){return .9+1.15*(1-(x/BR.half)*(x/BR.half))}
function slope(x){return -2.3*x/(BR.half*BR.half)}
function plankX(i){return -BR.half+(i+.5)*(2*BR.half/BR.N)}
var dm=new THREE.Object3D(),col=new THREE.Color();
var woodMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95});
var planks=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.12,BR.w),woodMat,BR.N);
var rails=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.09,.09),woodMat,BR.N*4);
var posts=[],ri=0;
for(var i=0;i<BR.N;i++){
 var x=plankX(i),y=archY(x),a=Math.atan(slope(x)),sw=2*BR.half/BR.N;
 dm.position.set(x,y-.06,0);dm.rotation.set(0,0,a);dm.scale.set(sw*.94,1,1);dm.updateMatrix();planks.setMatrixAt(i,dm.matrix);
 planks.setColorAt(i,col.setHSL(.07,.3,rnd(.07,.14)));
 [-1.35,1.35].forEach(function(z){[1.0,.55].forEach(function(h){dm.position.set(x,y+h,z);dm.rotation.set(0,0,a);dm.scale.set(sw*1.02,1,1);dm.updateMatrix();rails.setMatrixAt(ri,dm.matrix);rails.setColorAt(ri,col.setHSL(.07,.3,.1));ri++})});
 if(i%6===0)posts.push(i);
}
scene.add(planks,rails);
var postMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.13,1.2,.13),woodMat,posts.length*2),pi=0;
posts.forEach(function(i){var x=plankX(i);[-1.35,1.35].forEach(function(z){dm.position.set(x,archY(x)+.55,z);dm.rotation.set(0,0,0);dm.scale.set(1,1,1);dm.updateMatrix();postMesh.setMatrixAt(pi,dm.matrix);postMesh.setColorAt(pi,col.setHSL(.07,.3,.09));pi++})});
scene.add(postMesh);
var pil=new THREE.InstancedMesh(new THREE.CylinderGeometry(.22,.28,1,8),new THREE.MeshStandardMaterial({color:0x1a130e,roughness:1}),10),pj=0;
[-12,-6,0,6,12].forEach(function(x){[-1.1,1.1].forEach(function(z){var top=archY(x)-.12,h=top+.8;dm.position.set(x,top-h/2,z);dm.rotation.set(0,0,0);dm.scale.set(1,h,1);dm.updateMatrix();pil.setMatrixAt(pj++,dm.matrix)})});
scene.add(pil);
[-1,1].forEach(function(s){var b=new THREE.Mesh(new THREE.BoxGeometry(26.5,1,16),new THREE.MeshStandardMaterial({color:0x0b0f0c,roughness:1}));b.position.set(s*27,.4,-2);scene.add(b)});

/* ---- Lanterns ---- */
var glowMap=glowTex('rgba(255,170,80,.9)','rgba(255,150,60,0)'),lanternGlows=[];
[[36,1.35],[24,-1.35],[48,-1.35],[6,1.35],[12,-1.35]].forEach(function(L){
 var x=plankX(L[0]),y=archY(x)+1.42,g=new THREE.Group();
 var lm=window.__lantern&&window.__lantern({scale:.66,y:-.33,lod:'hi'});
 if(lm)g.add(lm);else{
 var body=new THREE.Mesh(new THREE.BoxGeometry(.26,.36,.26),new THREE.MeshBasicMaterial({color:0xffb45e}));g.add(body);
 var cap=new THREE.Mesh(new THREE.BoxGeometry(.38,.07,.38),new THREE.MeshStandardMaterial({color:0x120d0a}));cap.position.y=.22;g.add(cap);
 var base=cap.clone();base.position.y=-.21;g.add(base)}
 var gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,fog:false,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.6}));gl.scale.set(1.9,1.9,1);g.add(gl);lanternGlows.push(gl);
 g.position.set(x,y,L[1]);scene.add(g)});

/* ---- Maple island ---- */
(function(){var g=new THREE.Group();
 var rock=new THREE.Mesh(new THREE.CylinderGeometry(2.4,3,1,10),new THREE.MeshStandardMaterial({color:0x0b0e0d,roughness:1}));rock.position.y=.1;g.add(rock);
 var tr=new THREE.Mesh(new THREE.CylinderGeometry(.14,.24,2.6,7),new THREE.MeshStandardMaterial({color:0x140e0b}));tr.position.y=1.7;tr.rotation.z=.12;g.add(tr);
 var lm=new THREE.MeshStandardMaterial({color:0x7a1018,roughness:1,flatShading:true});
 [[0,3.3,0,1.2],[-.9,2.9,.3,.9],[.9,3.1,-.2,1],[.2,3.9,.2,.8]].forEach(function(b){var m=new THREE.Mesh(new THREE.IcosahedronGeometry(b[3],1),lm);m.position.set(b[0],b[1],b[2]);m.scale.y=.7;g.add(m)});
 g.position.set(6.8,0,-6.5);scene.add(g)})();

/* ---- Mist ---- */
var mistM=mistTex(),mist=[];
for(var i=0;i<9;i++){var s=new THREE.Sprite(new THREE.SpriteMaterial({map:mistM,color:0x93a5bf,fog:false,depthWrite:false,opacity:rnd(.1,.2)}));
 var z=-3-i*5;s.position.set(rnd(-14,14),rnd(.5,2.2),z);s.scale.set(rnd(22,34),rnd(5,8),1);s.userData.v=rnd(.15,.45)*(Math.random()<.5?-1:1);scene.add(s);mist.push(s)}
var lowMist=new THREE.Sprite(new THREE.SpriteMaterial({map:mistM,color:0x93a5bf,fog:false,depthWrite:false,opacity:.14}));lowMist.position.set(0,.6,3);lowMist.scale.set(30,3.5,1);scene.add(lowMist);

/* ---- Leaves ---- */
var leafTex=(function(){var c=document.createElement('canvas');c.width=c.height=128;var g=c.getContext('2d');
 var gr=g.createLinearGradient(64,10,64,120);gr.addColorStop(0,'#ffffff');gr.addColorStop(.6,'#ffe9ef');gr.addColorStop(1,'#f4b6c6');g.fillStyle=gr;
 g.beginPath();g.moveTo(64,118);g.bezierCurveTo(12,92,10,36,40,12);g.quadraticCurveTo(52,8,64,26);g.quadraticCurveTo(76,8,88,12);g.bezierCurveTo(118,36,116,92,64,118);g.closePath();g.fill();
 g.strokeStyle='rgba(225,120,150,.35)';g.lineWidth=2;g.beginPath();g.moveTo(64,112);g.quadraticCurveTo(62,70,64,34);g.stroke();
 var t=new THREE.CanvasTexture(c);t.anisotropy=4;return t})();
var low=coarse||(navigator.hardwareConcurrency||8)<=4,NL=low?48:90,leaves=new THREE.InstancedMesh(new THREE.PlaneGeometry(.2,.2),new THREE.MeshBasicMaterial({map:leafTex,alphaTest:.35,side:THREE.DoubleSide}),NL),ld=[];
for(var i=0;i<NL;i++){ld.push({x:rnd(-12,12),y:rnd(.6,9),z:rnd(-14,6),v:rnd(.12,.34),ph:rnd(0,6.28),f:rnd(.4,1),rx:rnd(-1,1),ry:rnd(-1,1),rz:rnd(-1,1)});leaves.setColorAt(i,col.setHSL(rnd(.93,.99),rnd(.55,.85),rnd(.72,.88)))}
scene.add(leaves);

/* ---- Weather: 18s of falling sakura, then a 40s storm (rain wall, lightning, thunder), looping ----
   Edit PETAL_S / STORM_S to change the timing. Add ?storm to the URL to preview the storm straight away. */
var WX=(function(){
 var PETAL_S=18,STORM_S=40,FADE=5,on=!reduce,home=true;
 var cyc=/[?&]storm/.test(location.search)?PETAL_S-1:0,w=0,wasStorm=false,nextStrike=0,strikes=[];
 var N=low?900:2200,H=13,pos=new Float32Array(N*6),sd=new Float32Array(N*2),en=new Float32Array(N*2);
 for(var i=0;i<N;i++){var x=rnd(-15,15),y=rnd(0,H),z=rnd(-22,8),r=Math.random();
  for(var k=0;k<2;k++){var q=i*2+k;pos[q*3]=x;pos[q*3+1]=y;pos[q*3+2]=z;sd[q]=r;en[q]=k}}
 var rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(pos,3));rg.setAttribute('aSeed',new THREE.BufferAttribute(sd,1));rg.setAttribute('aEnd',new THREE.BufferAttribute(en,1));
 var ru={uT:{value:0},uI:{value:0},uSl:{value:.22}};
 var rain=new THREE.LineSegments(rg,new THREE.ShaderMaterial({uniforms:ru,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:'attribute float aSeed;attribute float aEnd;uniform float uT;uniform float uI;uniform float uSl;varying float vA;void main(){float sp=10.+aSeed*7.;float y=mod(position.y-uT*sp,13.);vec3 p=vec3(position.x+y*uSl,y-.3,position.z);float len=.55+aSeed*.7;p+=vec3(uSl,1.,0.)*len*aEnd*.5;vec4 mv=modelViewMatrix*vec4(p,1.);float d=-mv.z;vA=uI*(.10+.32*aSeed)*(1.-.8*aEnd)*smoothstep(48.,8.,d)*smoothstep(.4,2.,d);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float vA;void main(){gl_FragColor=vec4(.66,.76,.95,vA);}'}));
 rain.frustumCulled=false;rain.visible=false;rain.renderOrder=6;scene.add(rain);
 /* lightning: rim light from behind, a cool ambient lift, and a glow across the sky */
 var fLight=new THREE.DirectionalLight(0xb4c8ff,0);fLight.position.set(0,10,-14);scene.add(fLight);
 var fAmb=new THREE.AmbientLight(0x6f86c8,0);scene.add(fAmb);
 var gT=(function(){var c=document.createElement('canvas');c.width=c.height=128;var g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(190,210,255,.5)');r.addColorStop(1,'rgba(120,150,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();
 var glow=new THREE.Sprite(new THREE.SpriteMaterial({map:gT,color:0xa9c0ff,fog:false,depthWrite:false,blending:THREE.AdditiveBlending,transparent:true,opacity:0}));
 glow.scale.set(120,60,1);glow.position.set(0,20,-75);scene.add(glow);
 var mistO=mist.map(function(m){return m.material.opacity}),fogA=new THREE.Color(FOG),fogB=new THREE.Color(0x0d1520);
 function seg(x0,y0,x1,y1,d,o,n){if(n===0){o.push(x0,y0,-70,x1,y1,-70);return}var mx=(x0+x1)/2+rnd(-d,d),my=(y0+y1)/2+rnd(-d*.25,d*.25);seg(x0,y0,mx,my,d*.56,o,n-1);seg(mx,my,x1,y1,d*.56,o,n-1)}
 function makeBolt(bx){var o=[];seg(bx,34,bx+rnd(-5,5),5,6,o,5);
  for(var b=0;b<3;b++){var a=Math.floor(rnd(4,o.length/6-4))*6,sx=o[a],sy=o[a+1];seg(sx,sy,sx+rnd(-9,9),sy-rnd(6,12),3,o,3)}
  var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(o),3));
  var grp=new THREE.Group();[[0xffffff,0,1],[0x86a4ff,.14,.5],[0x86a4ff,-.14,.5]].forEach(function(c){var m=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:c[0],transparent:true,opacity:0,fog:false,depthWrite:false,blending:THREE.AdditiveBlending}));m.position.x=c[1];m.userData.k=c[2];m.frustumCulled=false;grp.add(m)});
  grp.userData.g=g;scene.add(grp);return grp}
 function strike(){var dist=Math.random(),sheet=Math.random()<.25,bx=rnd(-10,10);if(sheet)dist=.6+dist*.4;
  var S={t:0,bolt:sheet?null:makeBolt(bx),gx:bx,p:[{t0:0,a:1,tau:.09},{t0:.24,a:.55,tau:.13}]};glow.position.x=bx;strikes.push(S);
  var delay=.3+dist*2.2,name=dist<.3?'thunder3':dist<.65?'thunder2':'thunder1';
  setTimeout(function(){if(window.JSND)JSND.play(name);if(dist<.35&&window.HAP)HAP([20,40,45],0)},delay*1000)}
 function env(S){var f=0;for(var i=0;i<S.p.length;i++){var p=S.p[i],u=S.t-p.t0;if(u>=0)f+=p.a*Math.min(1,u/.02)*Math.exp(-u/p.tau)}return Math.min(1,f)}
 document.addEventListener('portfolio:view',function(e){var d=e.detail||{};home=(d.id==='top'||d.id==='home'||!d.id)&&!d.cs});
 return{update:function(dt){
  if(!on)return;
  if(home&&t>=T&&!pause&&!document.hidden){cyc+=dt;if(cyc>=PETAL_S+STORM_S)cyc-=PETAL_S+STORM_S}
  var inStorm=home&&cyc>=PETAL_S&&cyc<PETAL_S+STORM_S;
  w+=((inStorm?1:0)-w)*(1-Math.exp(-dt/(FADE*.4)));if(w<.001)w=0;
  if(inStorm!==wasStorm){wasStorm=inStorm;if(window.JSND)JSND.storm(inStorm);if(inStorm)nextStrike=cyc+rnd(2.5,4.5)}
  /* petals give way to the rain */
  leaves.material.transparent=w>0;leaves.material.opacity=1-w;leaves.visible=w<.995;
  /* rain wall */
  rain.visible=w>.01;ru.uT.value=clk;ru.uI.value=w*(.88+.12*Math.sin(clk*.4));ru.uSl.value=.2+.07*Math.sin(clk*.45);
  /* the world dims and thickens */
  scene.fog.density=DENS*(1+.55*w);scene.fog.color.copy(fogA).lerp(fogB,w);
  moonLight.intensity*=1-.5*w;hemi.intensity*=1-.3*w;
  for(var m=0;m<mist.length;m++)mist[m].material.opacity=mistO[m]*(1+1.1*w);
  /* lightning */
  if(inStorm&&w>.7&&cyc>=nextStrike&&cyc<PETAL_S+STORM_S-4){strike();nextStrike=cyc+rnd(5,11)}
  var f=0;for(var i=strikes.length-1;i>=0;i--){var S=strikes[i];S.t+=dt;var v=env(S);if(v>f)f=v;
   if(S.bolt)S.bolt.children.forEach(function(c){c.material.opacity=Math.min(1,v*1.4)*c.userData.k});
   if(S.t>1.1){if(S.bolt){scene.remove(S.bolt);S.bolt.userData.g.dispose();S.bolt.children.forEach(function(c){c.material.dispose()})}strikes.splice(i,1)}}
  fLight.intensity=1.7*f;fAmb.intensity=.55*f;glow.material.opacity=.5*f}}
})();

/* ---- Ronin (TEMPORARY procedural prototype, not a finished model) ---- */
function limb(a,b,r1,r2,mat){var v=new THREE.Vector3().subVectors(b,a),len=v.length(),m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,len,12,1,true),mat);
 m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m}
function sword(len,hilt,dir){var g=new THREE.Group(),blk=new THREE.MeshStandardMaterial({color:0x0a0a0c,roughness:.35,metalness:.35}),wrap=new THREE.MeshStandardMaterial({color:0x1d1612,roughness:.9});
 var ts=len*.27,t=new THREE.Mesh(new THREE.BoxGeometry(.04,.04,ts),wrap);t.position.z=ts/2;g.add(t);
 var tb=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.012,14),new THREE.MeshStandardMaterial({color:0x5a4a2a,roughness:.5,metalness:.6}));tb.rotation.x=Math.PI/2;tb.position.z=ts;g.add(tb);
 var sl=len-ts,s=new THREE.Mesh(new THREE.BoxGeometry(.05,.034,sl),blk);s.position.z=ts+sl/2;g.add(s);
 g.position.copy(hilt);g.lookAt(hilt.clone().add(dir));return g}
function makeRonin(){
 var g=new THREE.Group();
 var pts=[[.001,.02],[.42,.03],[.39,.3],[.31,.62],[.245,.95],[.275,1.15],[.335,1.36],[.3,1.48],[.13,1.56],[.001,1.58]].map(function(p){return new THREE.Vector2(p[0],p[1])});
 var rg=new THREE.LatheGeometry(pts,44),pos=rg.attributes.position,cs=new Float32Array(pos.count*3),c1=new THREE.Color(0x9a1622),c2=new THREE.Color(0x3a1015),c3=new THREE.Color(0x5a2a28);
 for(var i=0;i<pos.count;i++){var x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),an=Math.atan2(z,x),k=1+.035*Math.sin(an*6+y*4)+.02*Math.sin(an*13-y*7)*(y<.9?1:.3);
  pos.setXYZ(i,x*k,y,z*k);var w=Math.min(1,Math.max(0,(.55-y)*1.4))*.6+Math.abs(Math.sin(an*9+y*11)*Math.sin(y*5))*.35,c=c1.clone().lerp(c2,w).lerp(c3,Math.max(0,Math.sin(an*5+y*9)-.5)*.5*(1-y/1.6));cs[i*3]=c.r;cs[i*3+1]=c.g;cs[i*3+2]=c.b}
 rg.setAttribute('color',new THREE.BufferAttribute(cs,3));rg.computeVertexNormals();
 var robeMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,side:THREE.DoubleSide});
 var robe=new THREE.Mesh(rg,robeMat);g.add(robe);
 var dark=new THREE.MeshStandardMaterial({color:0x140e0c,roughness:.8,side:THREE.DoubleSide});
 g.add(limb(new THREE.Vector3(-.33,1.4,0),new THREE.Vector3(-.3,.82,.12),.1,.16,robeMat));
 g.add(limb(new THREE.Vector3(.33,1.4,0),new THREE.Vector3(.14,1.06,.3),.1,.16,robeMat));
 var hand=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),dark);hand.position.set(.1,1.04,.32);g.add(hand);
 var sash=new THREE.Mesh(new THREE.CylinderGeometry(.262,.27,.15,28),new THREE.MeshStandardMaterial({color:0x0b0b0c,roughness:.6}));sash.position.y=.98;g.add(sash);
 var tail=new THREE.Mesh(new THREE.BoxGeometry(.1,.38,.025),sash.material);tail.position.set(-.1,.8,-.27);tail.rotation.z=.15;g.add(tail);
 var kat=sword(1.05,new THREE.Vector3(.08,1.04,.3),new THREE.Vector3(.45,-.28,-.85));g.add(kat);var gl=new THREE.Mesh(new THREE.BoxGeometry(.012,.01,.78),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0}));gl.position.set(0,.02,.28+.39);kat.add(gl);var tl2=new THREE.PointLight(0xff4a55,0,3,2);tl2.position.set(0,0,.9);kat.add(tl2);var dq=new THREE.Object3D();dq.position.set(.2,1.22,.42);dq.lookAt(dq.position.clone().add(new THREE.Vector3(.12,.95,.35)));var dq2=new THREE.Object3D();dq2.position.set(-.1,1.1,.62);dq2.lookAt(dq2.position.clone().add(new THREE.Vector3(-.55,-.55,.65)));g.userData.katana={g:kat,p0:kat.position.clone(),q0:kat.quaternion.clone(),p1:dq.position.clone(),q1:dq.quaternion.clone(),p2:dq2.position.clone(),q2:dq2.quaternion.clone(),gl:gl,li:tl2};
 g.add(sword(.62,new THREE.Vector3(.1,.9,.28),new THREE.Vector3(.5,-.15,-.8)));
 var head=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),new THREE.MeshBasicMaterial({color:0x040404}));head.position.y=1.6;g.add(head);
 var neck=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,.16,10),head.material);neck.position.y=1.52;g.add(neck);
 /* kasa */
 var tc=document.createElement('canvas');tc.width=512;tc.height=128;var tg=tc.getContext('2d');tg.fillStyle='#8c7248';tg.fillRect(0,0,512,128);
 for(var i=-128;i<512;i+=7){tg.strokeStyle=i%14?'rgba(40,28,14,.5)':'rgba(190,160,100,.35)';tg.beginPath();tg.moveTo(i,0);tg.lineTo(i+128,128);tg.stroke();tg.beginPath();tg.moveTo(i+128,0);tg.lineTo(i,128);tg.stroke()}
 for(var y=8;y<128;y+=10){tg.strokeStyle='rgba(30,20,10,.55)';tg.beginPath();tg.moveTo(0,y);tg.lineTo(512,y);tg.stroke()}
 var tex=new THREE.CanvasTexture(tc);tex.wrapS=THREE.RepeatWrapping;tex.repeat.set(3,1);
 var hat=new THREE.Group();
 var outer=new THREE.Mesh(new THREE.ConeGeometry(.86,.4,64,1,true).translate(0,.2,0),new THREE.MeshStandardMaterial({map:tex,color:0xb09a72,roughness:1}));hat.add(outer);
 var inner=new THREE.Mesh(new THREE.ConeGeometry(.85,.39,64,1,true).translate(0,.195,0),new THREE.MeshBasicMaterial({color:0x07070a,side:THREE.BackSide}));hat.add(inner);
 var rim=new THREE.Mesh(new THREE.TorusGeometry(.86,.014,6,64),new THREE.MeshStandardMaterial({color:0x2a1d10,roughness:1}));rim.rotation.x=Math.PI/2;hat.add(rim);
 hat.position.y=1.62;hat.rotation.x=.05;g.add(hat);
 var sh=new THREE.Mesh(new THREE.CircleGeometry(.75,28),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.55,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.02;g.add(sh);
 var eyes=new THREE.Mesh(new THREE.BoxGeometry(.15,.014,.01),new THREE.MeshBasicMaterial({color:0xe0343f,transparent:true,opacity:0}));eyes.position.set(0,1.61,.128);g.add(eyes);g.userData.eyes=eyes;g.userData.hat=hat;g.userData.robe=robe;
 return g}
var stage=new THREE.Group();stage.position.set(0,archY(0),0);stage.rotation.y=-.2;scene.add(stage);
var ronin=makeRonin();stage.add(ronin);
/* Samurai GLB: embedded + gzipped; parsed by hand (no external loader, nothing to fetch) */
function parseSamurai(buf,R){
 var dv=new DataView(buf);if(dv.getUint32(0,true)!==0x46546C67)throw new Error('not a GLB');
 var jl=dv.getUint32(12,true),J=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl))),bo=20+jl+8;
 function acc(n,C){var a=J.accessors[n],bv=J.bufferViews[a.bufferView],o=bo+(bv.byteOffset||0)+(a.byteOffset||0),k={VEC3:3,VEC2:2,SCALAR:1}[a.type];return new C(buf,o,a.count*k)}
 var p=J.meshes[0].primitives[0],geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.BufferAttribute(acc(p.attributes.POSITION,Float32Array),3));
 if(p.attributes.NORMAL!==undefined)geo.setAttribute('normal',new THREE.BufferAttribute(acc(p.attributes.NORMAL,Float32Array),3));
 if(p.attributes.TEXCOORD_0!==undefined)geo.setAttribute('uv',new THREE.BufferAttribute(acc(p.attributes.TEXCOORD_0,Float32Array),2));
 var ia=J.accessors[p.indices];geo.setIndex(new THREE.BufferAttribute(acc(p.indices,ia.componentType===5125?Uint32Array:Uint16Array),1));
 if(p.attributes.NORMAL===undefined)geo.computeVertexNormals();
 var mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,metalness:.15});
 function img(n,cb){var im=J.images[n],bv=J.bufferViews[im.bufferView],bytes=new Uint8Array(buf,bo+(bv.byteOffset||0),bv.byteLength),mt=im.mimeType||'image/jpeg';
  function tryUrl(u,next){var I=new Image();I.onload=function(){cb(I)};I.onerror=next;I.src=u}
  tryUrl(URL.createObjectURL(new Blob([bytes],{type:mt})),function(){
   var r=new FileReader();r.onload=function(){tryUrl(r.result,function(){console.warn('Samurai texture '+n+' could not be decoded')})};r.readAsDataURL(new Blob([bytes],{type:mt}))})}
 function tex(n,srgb,set){img(J.textures[n].source,function(I){var t=new THREE.Texture(I);t.flipY=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=R.capabilities.getMaxAnisotropy();if(srgb)t.encoding=THREE.sRGBEncoding;t.needsUpdate=true;set(t);mat.needsUpdate=true})}
 var pm=J.materials[p.material||0];
 tex(pm.pbrMetallicRoughness.baseColorTexture.index,true,function(t){mat.map=t});
 if(pm.pbrMetallicRoughness.metallicRoughnessTexture)tex(pm.pbrMetallicRoughness.metallicRoughnessTexture.index,false,function(t){mat.roughnessMap=t;mat.metalnessMap=t;mat.roughness=1;mat.metalness=1});
 if(pm.normalTexture)tex(pm.normalTexture.index,false,function(t){mat.normalMap=t});
 var mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;return mesh}
function samuraiBuf(){if(!window.__samAB)window.__samAB=new Promise(function(res,rej){try{var bin=atob(document.getElementById('samuraiData').textContent.trim()),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 if(!window.DecompressionStream)throw new Error('DecompressionStream unsupported');
 new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer().then(res,rej)}catch(e){rej(e)}});return window.__samAB}
/* shared by the hero bridge and the projects "through the gate" scene: each passes its own renderer */
window.__loadSamurai=function(R,ok,err){samuraiBuf().then(function(ab){try{ok(parseSamurai(ab,R))}catch(e){err(e)}},err)};
function loadEmbedded(ok,_,err){window.__loadSamurai(renderer,function(m){ok({scene:m})},err)}
var glb=null;
if(CONFIG.roninGLB){loadEmbedded(function(gl){
  var m=gl.scene;
  /* model is ~1 unit tall with feet at y=0: scale to the old ronin's height and sit it on the bridge */
  var h=new THREE.Box3().setFromObject(m),sz=h.getSize(new THREE.Vector3()),c=h.getCenter(new THREE.Vector3()),S=1.75/sz.y;
  m.scale.setScalar(S);m.position.set(-c.x*S,-h.min.y*S,-c.z*S);
  var g=new THREE.Group();var body=new THREE.Group();body.add(m);g.add(body);g.userData.body=body;
  var sh=new THREE.Mesh(new THREE.CircleGeometry(.6,28),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.55,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.02;g.add(sh);
  /* soft glow behind the samurai so he reads against the dark scene */
  var hg=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex('rgba(255,150,110,.55)','rgba(255,150,110,0)'),fog:false,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending,opacity:.4}));
  hg.scale.set(3.4,3.4,1);hg.position.set(0,1.0,-.5);hg.renderOrder=-1;g.add(hg);g.userData.glow=hg;
  stage.remove(ronin);ronin=null;glb=g;stage.add(g)},undefined,function(e){console.warn('Samurai GLB failed to load; keeping prototype',e&&e.message||e)})}

/* ---- Dormant scythe: the samurai's weapon waits beside him. Holding the gate wakes it (it lifts, turns to face us,
   ember tether to his hand, red light on him). The cinematic then starts from this exact screen position, size and
   roll (window.__scyDormant), so the scythe never spawns from nowhere. Built only once the cinematic asset is ready. ---- */
var HS=null;
function buildHeroScythe(K){
 if(HS||!K||reduce)return;
 function shrink(t,sz,srgb){var c=document.createElement('canvas');c.width=c.height=sz;c.getContext('2d').drawImage(t.image,0,0,sz,sz);var n=new THREE.Texture(c);n.flipY=false;n.anisotropy=4;if(srgb)n.encoding=THREE.sRGBEncoding;n.needsUpdate=true;return n}
 var tB=shrink(K.tB,1024,true),tN=shrink(K.tN,512,false),tR=shrink(K.tR,512,false),tE=shrink(K.tE,512,true),U={uRv:{value:0},uRim:{value:.3}};
 var mat=new THREE.MeshStandardMaterial({map:tB,normalMap:tN,roughnessMap:tR,metalnessMap:tR,roughness:1,metalness:.5,emissive:new THREE.Color(1,.42,.16),emissiveMap:tE,emissiveIntensity:.5,side:THREE.DoubleSide});
 mat.onBeforeCompile=function(sh){sh.uniforms.uRv=U.uRv;sh.uniforms.uRim=U.uRim;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vOP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vOP;uniform float uRv,uRim;\n'+K.NOISE)
   .replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfloat dsF=(1.0-clamp(vOP.y,0.,1.))*.8+nz3(vOP*14.)*.32;float dsE=uRv*1.15-dsF;if(dsE<0.0)discard;')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat rimF=pow(1.0-clamp(abs(dot(normalize(normal),normalize(vViewPosition))),0.,1.),4.5);totalEmissiveRadiance+=vec3(1.,.1,.08)*rimF*uRim*.9;totalEmissiveRadiance+=vec3(1.,.38,.1)*(1.0-smoothstep(0.,.07,dsE))*1.6;')};
 var gp=K.meta.grip,model=new THREE.Mesh(K.geo,mat);model.frustumCulled=false;model.position.set(-gp[0],-gp[1],-gp[2]);
 var rig=new THREE.Group();rig.rotation.order='ZYX';rig.add(model);rig.visible=false;scene.add(rig);
 var gt=glowTex('rgba(255,120,90,.9)','rgba(255,20,30,0)');
 var aura=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:0xff2a2a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));aura.position.set(.2,.42,-.12);aura.scale.set(1.5,1.5,1);rig.add(aura);
 var eyes=(K.meta.eyes||[]).map(function(e){var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:0xff3322,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));sp.position.set(e[0]-gp[0],e[1]-gp[1],e[2]-gp[2]);sp.scale.setScalar(.0001);rig.add(sp);return sp});
 /* embers: the first NT stream from the samurai to the scythe (the tether), the rest drift up around the blade */
 var NP=coarse?30:46,NT=Math.round(NP*.65),pa=new Float32Array(NP*3),pc=new Float32Array(NP*3),pg=new THREE.BufferGeometry();
 pg.setAttribute('position',new THREE.BufferAttribute(pa,3));pg.setAttribute('color',new THREE.BufferAttribute(pc,3));
 var pm=new THREE.PointsMaterial({map:glowTex('rgba(255,190,140,1)','rgba(255,50,30,0)'),size:.16,sizeAttenuation:true,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
 var pts=new THREE.Points(pg,pm);pts.frustumCulled=false;pts.visible=false;scene.add(pts);
 var st={p:0,rv:0,hid:false},V1=new THREE.Vector3(),V2=new THREE.Vector3(),V3=new THREE.Vector3(),src=new THREE.Vector3(),dst=new THREE.Vector3(),btn=$('#enter');
 var api={update:function(dt){
  var tp=window.__drawT||0,t=clk,i;
  if(!tp&&btn){try{if(btn.matches(':hover')||document.activeElement===btn)tp=.14}catch(x){}}
  st.p+=(tp-st.p)*(1-Math.exp(-dt*(tp>st.p?9:3.5)));
  var p=st.p,e=p*p*(3-2*p),busy=!!window.__scyBusy;
  /* pose from the viewport: sit beside him on wide screens, step in front of him on narrow ones */
  var a=camera.aspect||1.78,halfW=2.6*a,s=1.25*Math.min(1.7,Math.max(1,(.9*halfW-.45)/.675)),
      xs0=Math.max(.68,Math.min(1.25,.45+.23*s+.18,.9*halfW-.445*s)),x1=Math.min(.84,Math.max(0,1.15*a*.42)),sy=stage.position.y;
  if(busy){if(!st.hid){st.hid=true;rig.visible=false;pts.visible=false;window.__scyDormant=null}}
  else{if(st.hid){st.hid=false;st.rv=0}st.rv=Math.min(1.15,st.rv+dt*.55)}
  var rvN=Math.min(1,st.rv/1.15),bob=reduce?0:Math.sin(t*1.1)*.035*(1-e)+Math.sin(t*.7+1)*.015,jit=e*e*.012;
  /* the samurai reacts: his glow turns blood red and a red light spills over him as the blade wakes */
  heroRed.position.set(.5+.25*e,sy+1.3,.8);heroRed.intensity=e*2.6*(.92+.08*Math.sin(t*9))*Math.min(1,st.rv/.6);
  var gl=glb&&glb.userData.glow;if(gl){gl.material.color.setRGB(1,1-.5*e,1-.65*e);gl.material.opacity+=.3*e}
  if(busy)return;
  rig.visible=st.rv>.02;pts.visible=rig.visible;
  rig.position.set(xs0+(x1-xs0)*e+Math.sin(t*61)*jit,sy+.12+.34*s+.22*s*e+bob+Math.cos(t*53)*jit,.25+.2*e);
  rig.rotation.set(0,-.55*(1-e)+.05*Math.sin(t*.5)*(1-e),.08+.12*e+.02*Math.sin(t*.9)*(1-e));
  rig.scale.setScalar(s);
  U.uRv.value=st.rv;U.uRim.value=.35+.85*e;mat.emissiveIntensity=(.45+1.25*e)*(.93+.07*Math.sin(t*23)*Math.sin(t*7));
  aura.material.opacity=rvN*(.05+.22*e+.03*Math.sin(t*1.3));
  var es=.13*(.15+.9*e)*(1+.15*Math.sin(t*14));eyes.forEach(function(sp){sp.scale.setScalar(Math.max(.0001,es));sp.material.opacity=rvN*Math.min(1,.1+e*1.4)});
  /* embers */
  src.set(.15,sy+1.1,.25);dst.copy(rig.position);
  for(i=0;i<NT;i++){var u=((i/NT)+t*(.12+.5*e))%1,wob=Math.sin(u*Math.PI)*(.07+.06*Math.sin(t*3+i*1.7))*(1.2-.6*e),f=Math.sqrt(Math.sin(u*Math.PI))*(.12+.88*e);
   pa[3*i]=src.x+(dst.x-src.x)*u+Math.sin(i*12.9+t*2.1)*wob;pa[3*i+1]=src.y+(dst.y-src.y)*u+Math.cos(i*7.3+t*1.7)*wob;pa[3*i+2]=src.z+(dst.z-src.z)*u+Math.sin(i*5.1+t*1.3)*wob*.6;
   pc[3*i]=f;pc[3*i+1]=f*.36;pc[3*i+2]=f*.22}
  for(i=NT;i<NP;i++){var j=i-NT,k=(t*.16+j*.173)%1,f2=Math.sin(k*Math.PI)*(.35+.4*e);
   pa[3*i]=dst.x+.15*s+Math.sin(j*9.7+t*.8)*.38;pa[3*i+1]=dst.y-.4+k*1.3*s;pa[3*i+2]=dst.z+Math.cos(j*4.3+t)*.2;
   pc[3*i]=f2;pc[3*i+1]=f2*.36;pc[3*i+2]=f2*.22}
  pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;pm.opacity=rvN;
  /* hand-off data for the cinematic: where the grip is on screen, how big the staff is, and its roll */
  rig.updateMatrixWorld(true);camera.updateMatrixWorld();
  V1.copy(rig.position).project(camera);V2.set(0,-.34,0).applyMatrix4(rig.matrixWorld).project(camera);V3.set(0,.66,0).applyMatrix4(rig.matrixWorld).project(camera);
  window.__scyDormant={ok:st.rv>=1.1,nx:V1.x,ny:V1.y,hf:Math.hypot((V3.x-V2.x)*camera.aspect/2,(V3.y-V2.y)/2),roll:rig.rotation.z,yaw:rig.rotation.y,t:performance.now()};
 }};
 /* upload textures + compile across a few frames so there is no single big hitch, then start */
 var q=[tB,tN,tR,tE];(function step(){if(q.length){try{renderer.initTexture(q.shift())}catch(x){}requestAnimationFrame(step);return}
  try{renderer.compile(scene,camera)}catch(x){}HS=api})()}
document.addEventListener('scythe:ready',function(){buildHeroScythe(window.__scyKit)});
if(window.__scyKit)buildHeroScythe(window.__scyKit);

/* ---- Camera rig ---- */
var startPos=new THREE.Vector3(-3,3.9,22),startLook=new THREE.Vector3(0,3.8,-6),endPos=new THREE.Vector3(0,2.7,8),endLook=new THREE.Vector3(0,2.3,0);
function resize(){var w=innerWidth,h=innerHeight,a=w/h;renderer.setSize(w,h,false);camera.aspect=a;
 camera.fov=36+(1-Math.min(a,1))*14;endPos.z=a<1?8.6:8;camera.updateProjectionMatrix();
 var mx=-26*Math.min(1,Math.max(.18,a/1.78));moon.position.x=mx;moonGlow.position.x=mx;waterU.moon.value.set(mx,-110)}
addEventListener('resize',resize);resize();
window.__getPR=function(){return renderer.getPixelRatio()};window.__setPR=function(p){try{renderer.setPixelRatio(p);resize()}catch(e){}};

var ptr={x:0,y:0},sm={x:0,y:0};
addEventListener('pointermove',function(e){ptr.x=(e.clientX/innerWidth-.5)*2;ptr.y=(e.clientY/innerHeight-.5)*2},{passive:true});
var T=CONFIG.T,t=reduce?T:0,clk=0,skipping=0,push=0,pushT=0,camP=startPos.clone(),camL=startLook.clone(),uiShown=false;
if(reduce){veil.style.opacity=0;revealUI();uiShown=true;camP.copy(endPos);camL.copy(endLook)}
function sstep(x){x=Math.min(1,Math.max(0,x));return x*x*x*(x*(x*6-15)+10)}
function skip(){if(t<T){t=T;skipping=1.8;revealUI();uiShown=true}}
$('#skip').addEventListener('click',skip);
addEventListener('keydown',function(e){if(e.key==='Escape')skip()});
$('#enter').addEventListener('click',function(){
 if(go('about'))return;pushT=1;setTimeout(function(){pushT=0},1700)});

var pause=false,vo2={x:0,y:0,z:0,cx:0},vt={x:0,y:0,z:0,cx:0};
document.addEventListener('portfolio:view',function(e){var id=e.detail.id,w=e.detail.wide;vt={x:0,y:0,z:0,cx:0};
 if(id==='about'&&w)vt={x:-.7,y:.1,z:-.5,cx:-2.3};else if(id==='projects')vt={x:0,y:.5,z:3.5,cx:0};else if(id==='skills'&&w)vt={x:.8,y:.1,z:-.3,cx:2.4};else if(id==='experience')vt={x:0,y:.3,z:1.5,cx:0};else if(id==='contact'&&w)vt={x:-1.2,y:-.1,z:-.8,cx:-3};pause=!!e.detail.cs||e.detail.id==='projects'});
var lerp=THREE.MathUtils.lerp,tmpP=new THREE.Vector3(),tmpL=new THREE.Vector3(),last=performance.now(),dum=new THREE.Object3D();
var lvl={hemi:0,moon:0,lamp:0},__mk=0,__ap=0;
function frame(now){
 requestAnimationFrame(frame);
 var dt=Math.min((now-last)/1000,.05);last=now;clk+=dt;if(window.__ldrT){if(t<window.__ldrT)t=window.__ldrT;window.__ldrT=0}if(t<T&&!window.__ldrHold)t+=dt;if(skipping>0)skipping-=dt;
 if(!uiShown&&t>=5.6){revealUI();uiShown=true}
 var u=sstep((t-.5)/(T-.7));
 tmpP.lerpVectors(startPos,endPos,u);tmpL.lerpVectors(startLook,endLook,u);
 tmpP.x+=Math.sin(u*Math.PI)*-1.2;
 push+=(pushT-push)*(1-Math.exp(-dt*2.2));__ap+=((window.__aboutPush||0)-__ap)*(1-Math.exp(-dt*1.6));
 tmpP.z-=push*2.2+__ap*1.3;tmpL.y+=push*.5+__ap*.16;
 var kv=1-Math.exp(-dt*(reduce?30:1.6));for(var q in vt)vo2[q]+=(vt[q]-vo2[q])*kv;tmpP.x+=vo2.x;tmpP.y+=vo2.y;tmpP.z+=vo2.z;tmpL.x+=vo2.cx;
 var rate=skipping>0?2.4:12,k=1-Math.exp(-dt*rate);camP.lerp(tmpP,k);camL.lerp(tmpL,k);
 var pm=reduce?0:1;sm.x+=(ptr.x-sm.x)*(1-Math.exp(-dt*3));sm.y+=(ptr.y-sm.y)*(1-Math.exp(-dt*3));
 var dx=reduce?0:Math.sin(clk*.23)*.18,dy=reduce?0:Math.sin(clk*.17)*.07,ap=u;
 camera.position.set(camP.x+(sm.x*.55*pm+dx)*ap,camP.y+(-sm.y*.22*pm+dy)*ap,camP.z);
 camera.lookAt(camL.x+sm.x*.18*pm*ap,camL.y-sm.y*.08*pm*ap,camL.z);
 /* reveal */
 var vo=reduce?0:1-sstep((t-.3)/2.4);veil.style.opacity=vo.toFixed(3);if(vo===0&&t>=T)veil.style.display='none';
 var tm=sstep((t-.2)/3.5),tl=sstep((t-4.2)/2.4),kk=1-Math.exp(-dt*3);
 lvl.hemi+=(.3*tm-lvl.hemi)*kk;lvl.moon+=(.62*tm-lvl.moon)*kk;lvl.lamp+=(1.7*tl-lvl.lamp)*kk;
 var fl=1+.05*Math.sin(clk*11.3)+.035*Math.sin(clk*17.1+1)+.02*Math.sin(clk*5.3);
 var __gg=window.__gateGlow||0;hemi.intensity=lvl.hemi;moonLight.intensity=lvl.moon;lampLight.intensity=lvl.lamp*fl+__gg*2.6;lampLight.color.setRGB(1,.604-__gg*.3,.282-__gg*.12);
 var __mc=window.__maskC||[1,.6,.28];__mk+=((window.__maskK||0)-__mk)*(1-Math.exp(-dt*3));
 if(__mk>.002){var __lc=lampLight.color;__lc.setRGB(__lc.r+(__mc[0]-__lc.r)*__mk,__lc.g+(__mc[1]-__lc.g)*__mk,__lc.b+(__mc[2]-__lc.b)*__mk);lampLight.intensity+=__mk*1.6}
 moonLight.color.setRGB(.616+(__mc[0]-.616)*__mk*.5,.706+(__mc[1]-.706)*__mk*.5,.878+(__mc[2]-.878)*__mk*.5);
 waterU.warm.value=lvl.lamp/1.7*fl;waterU.t.value=clk*(reduce?.3:1);
 lanternGlows.forEach(function(g,i){g.material.opacity=.6*(lvl.lamp/1.7)*(1+.05*Math.sin(clk*9+i*2))+__gg*.3;g.material.color.setRGB(1,1-__gg*.45,1-__gg*.55)});
 /* life */
 if(ronin&&ronin.userData.hat){var h=ronin.userData.hat;var hy=window.__hatY||0,ht=window.__hatT||0;hy+=(ht-hy)*(1-Math.exp(-dt*(ht>=1?3:8)));window.__hatY=hy;h.position.y=1.62+hy*1.5;h.position.x=hy*.4;h.rotation.x=.05-hy*.45;if(!reduce){h.rotation.z=.012*Math.sin(clk*.7);ronin.scale.y=1+.005*Math.sin(clk*1.3);ronin.userData.robe.rotation.y=.012*Math.sin(clk*.5)}}
 if(ronin&&ronin.userData.katana||glb){var K=ronin&&ronin.userData.katana,dp=window.__drawT||0,de=dp*dp*(3-2*dp),sw=window.__swingT?(performance.now()-window.__swingT)/300:2,se=sw>=0&&sw<=1?1-Math.pow(1-sw,3):(sw>1?1:0);
  if(K){K.g.position.lerpVectors(K.p0,K.p1,de);K.g.quaternion.copy(K.q0).slerp(K.q1,de);
  if(sw>=0&&sw<1.6&&dp>.5){K.g.position.lerpVectors(K.p1,K.p2,se);K.g.quaternion.copy(K.q1).slerp(K.q2,se);ronin.position.z=Math.sin(Math.min(sw,1)*Math.PI)*.55;ronin.rotation.y=-se*.5;K.gl.material.opacity=1;K.li.intensity=9}
  else{ronin.position.z*=.9;ronin.rotation.y*=.92;K.gl.material.opacity=Math.max(0,(dp-.3)/.7);K.li.intensity=dp*dp*3}
  var hy2=window.__hatY||0;ronin.userData.eyes.material.opacity=Math.max(0,Math.min(1,(hy2-.5)*3))*(.8+.2*Math.sin(clk*3));
  }
  if(glb&&glb.userData.glow)glb.userData.glow.material.opacity=reduce?.4:.4+.06*Math.sin(clk*1.1);
  if(glb&&!reduce){glb.position.y=.005*Math.sin(clk*1.3);glb.rotation.y=.02*Math.sin(clk*.4)}
   /* breathing: slow ~4.6s cycle, inhale a touch slower than the exhale; chest swells, shoulders rise, feet stay planted */
   if(glb&&glb.userData.body&&!reduce){var bp=(clk/4.6)%1,bb=bp<.42?.5-.5*Math.cos(bp/.42*Math.PI):.5+.5*Math.cos((bp-.42)/.58*Math.PI);
    glb.userData.body.scale.set(1+.007*bb,1+.011*bb,1+.009*bb);glb.userData.body.rotation.x=-.006*bb;
    if(glb.userData.glow)glb.userData.glow.material.opacity+=.05*bb}
  var ds=dp*dp;camera.position.z-=ds*3.4;camera.position.y-=ds*.35;camera.fov=36-ds*8;camera.updateProjectionMatrix();
  camera.lookAt(camL.x*(1-ds)+stage.position.x*ds,camL.y*(1-ds)+(stage.position.y+1.15)*ds,camL.z*(1-ds)+stage.position.z*ds)}
 if(HS)HS.update(dt);
 mist.forEach(function(s){if(!reduce)s.position.x+=s.userData.v*dt;if(s.position.x>22)s.position.x=-22;if(s.position.x<-22)s.position.x=22});
 var sp=reduce?.25:1;
 for(var i=0;i<NL;i++){var d=ld[i];d.y-=d.v*dt*sp;d.x+=(.18+Math.sin(clk*d.f+d.ph)*.35)*dt*sp;d.z+=Math.cos(clk*d.f*.7+d.ph)*.08*dt*sp;
  if(d.y<.15){d.y=rnd(8,10);d.x=rnd(-12,12)}if(d.x>13)d.x=-13;
  dum.position.set(d.x,d.y,d.z);dum.rotation.set(clk*d.rx*1.4+d.ph,clk*d.ry*1.2,clk*d.rz);dum.updateMatrix();leaves.setMatrixAt(i,dum.matrix)}
 leaves.instanceMatrix.needsUpdate=true;
 WX.update(dt);
 if(!pause&&!window.__heroHold)renderer.render(scene,camera);
 if(t>=T&&!frame.done){frame.done=true;document.dispatchEvent(new CustomEvent('portfolio:hero-ready'))}
}
requestAnimationFrame(function(n){last=n;frame(n)});
})();
