
/* Projects · The Crossing: scroll walks a night bridge; each project hangs as a scroll.
   Adapted from the supplied reference, wired into the portfolio's hold-to-draw gate,
   slash transition, case-study routes and sound toggle. */
(()=>{
const T=window.THREE,panel=document.getElementById('projects'),cv=document.getElementById('pbc'),track=panel.querySelector('.pb-track'),stage=document.getElementById('pbstage');
const PR=window.__PROJECTS||[];
const $=id=>document.getElementById(id);
const skipBtn=$('pbskip'),listEl=panel.querySelector('.pb-list');
skipBtn.onclick=()=>panel.scrollTo({top:track.offsetHeight,behavior:'smooth'});
if(!T||!cv||!PR.length){panel.classList.add('pb-nogl');return}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,snd=$('snd');
const info=$('pbinfo'),intro=$('pbintro'),outro=$('pbouts'),fade=$('pbfade'),ticks=$('pbticks'),hint=$('pbhint'),goBtn=$('pbgo');
const GLY={digistall:'店',poha:'食',cosdvl:'美',tap2bill:'払',edge:'道',truthpulse:'真'};
const ACC=['#e0343f','#5b8def','#e0a84a','#2fb7a3','#9a74ea','#e8567a'];
const NUM=['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'];
const P=PR.map((p,i)=>({id:p.id,n:p.name,full:p.full||'',cat:p.cat||'',role:p.role||'',d:p.desc||'',s:p.stack||[],live:p.live,repo:p.repo,g:GLY[p.id]||p.name.charAt(0).toUpperCase(),c:ACC[i%ACC.length]}));
const n=P.length,m=n+2,S=24,zB=i=>-(i+1)*S,zR=zB(n-1)-34,stops=[0,...P.map((_,i)=>zB(i)+5),zR-8],gates=[...P.map((_,i)=>zB(i)-4),zR];
$('pbh2').textContent=(NUM[n]||n)+' builds. One crossing.';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const SERIF='"Cormorant Garamond","Hoefler Text",Georgia,serif',SANS='Jost,"Helvetica Neue",Arial,sans-serif',CJK='"Shippori Mincho B1","Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif';
let renderer,scene,cam,lamp,moon,halo,stars,water,gateGlow,fog0,B=[],PP=[],lg,lp,ls,eg,ep,es,ronin,rgl,fov0=55,LN=70,EN=420;
let ready=false,building=false,on=false,running=false,raf=0,act=-1,cur=0,tgt=0,mx=0,my=0,pz=0,dist=0,pulse=0,prevZ=0,hoverI=-1;
const tmp=new T.Vector3(),bp=new T.Vector3(),accC=P.map(p=>new T.Color(p.c)),base=new T.Color(0xffa862),tc=new T.Color();
const span=()=>Math.max(1,track.offsetHeight-panel.clientHeight);
const go=i=>panel.scrollTo({top:span()*i/(m-1),behavior:reduce?'auto':'smooth'});
const read=()=>{tgt=clamp(panel.scrollTop/span(),0,1)*(m-1)};
/* ---------- sound (only when the SND toggle is on) ---------- */
const sGate=()=>{JSND.play('mask1',{vol:.6});HAP(12)},sFocus=()=>{JSND.play('hover',{vol:1.2});HAP(5,90)};
/* ---------- textures ---------- */
function glowTex(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c)}
function bannerTex(p,i){const c=document.createElement('canvas');c.width=512;c.height=1024;const x=c.getContext('2d');
 x.fillStyle='#e8dec7';x.fillRect(0,0,512,1024);
 for(let k=0;k<500;k++){x.strokeStyle='rgba(120,100,70,'+Math.random()*.08+')';x.lineWidth=1;const px=Math.random()*512,py=Math.random()*1024;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.random()*30-15,py+Math.random()*30-15);x.stroke()}
 x.fillStyle='#14181f';x.fillRect(0,0,512,96);x.fillRect(0,924,512,100);x.fillStyle='#b8923c';x.fillRect(0,96,512,3);x.fillRect(0,921,512,3);
 x.textAlign='center';x.textBaseline='alphabetic';
 x.fillStyle='#d9b24c';x.font='500 30px '+SANS;x.fillText('No. '+String(i+1).padStart(2,'0'),256,46);
 x.fillStyle='#a79f8e';x.font='400 20px '+SANS;x.fillText(p.cat.toUpperCase(),256,78);
 x.fillStyle='#17120e';x.font='800 330px '+CJK;x.fillText(p.g,256,400);
 x.fillStyle=p.c;x.fillRect(372,430,84,84);x.fillStyle='#f3ead6';x.font='800 54px '+CJK;x.fillText(p.g,414,492);
 x.fillStyle='#17120e';x.font='600 62px '+SERIF;
 const w=p.n.split(' ');let ln=[],cu='';for(const s of w){const t=cu?cu+' '+s:s;if(x.measureText(t).width>440&&cu){ln.push(cu);cu=s}else cu=t}ln.push(cu);ln=ln.slice(0,3);
 ln.forEach((l,k)=>x.fillText(l,256,600+k*64));
 x.fillStyle='#5a4a36';x.font='500 26px '+SANS;
 if(p.role){const rw=p.role.split(' ');let rl=[],rc='';for(const s of rw){const t=rc?rc+' '+s:s;if(x.measureText(t).width>440&&rc){rl.push(rc);rc=s}else rc=t}rl.push(rc);
  if(rl.length>3){rl=rl.slice(0,3);rl[2]=rl[2].replace(/\s*\S*$/,'')+'…'}
  rl.forEach((l,k)=>x.fillText(l,256,600+ln.length*64+10+k*32))}
 x.fillStyle='#e8dec7';let st=p.s.join(' · '),sz=22,cut;
 for(;sz>15;sz--){x.font='400 '+sz+'px '+SANS;if(x.measureText(st).width<=470)break}
 cut=st;while(x.measureText(cut).width>470&&st.length>6){st=st.slice(0,-1);cut=st+'…'}
 x.fillText(cut,256,985);
 const t=new T.CanvasTexture(c);t.anisotropy=8;t.generateMipmaps=false;t.minFilter=T.LinearFilter;return t}
/* ---------- scene ---------- */
function init(){
 try{renderer=new T.WebGLRenderer({canvas:cv,antialias:true})}catch(e){return false}
 renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,1.5),2));
 const FOG=0x05070b;scene=new T.Scene();scene.background=new T.Color(FOG);scene.fog=new T.FogExp2(FOG,.034);
 cam=new T.PerspectiveCamera(55,1,.1,700);
 scene.add(new T.AmbientLight(0x7a89aa,.5));
 lamp=new T.PointLight(0xffa862,1.5,16);scene.add(lamp);
 const gt=glowTex();
 moon=new T.Mesh(new T.CircleGeometry(24,64),new T.MeshBasicMaterial({color:0xd42a3a,fog:false}));scene.add(moon);
 {const mg=new T.PlaneGeometry(89.3,59.5);mg.translate(.81,-3.43,0);/* moon disc (48 wide) centred on the original moon position */
  new T.TextureLoader().load('data:image/jpeg;base64,'+document.getElementById('bloodMoonData').textContent.trim(),function(tx){tx.minFilter=T.LinearFilter;tx.generateMipmaps=false;
   moon.geometry.dispose();moon.geometry=mg;moon.material.dispose();
   moon.material=new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false})})}
 halo=new T.Sprite(new T.SpriteMaterial({map:gt,color:0xff2a3a,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.3,fog:false}));halo.scale.set(130,130,1);scene.add(halo);
 {const a=new Float32Array(600);for(let i=0;i<200;i++){const t=Math.random()*6.283,p=Math.random()*1.3+.1,r=320;a[i*3]=Math.cos(t)*Math.cos(p)*r;a[i*3+1]=Math.sin(p)*r*.8;a[i*3+2]=Math.sin(t)*Math.cos(p)*r}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(a,3));stars=new T.Points(g,new T.PointsMaterial({size:1.5,sizeAttenuation:false,color:0xcfd8ee,fog:false,transparent:true,opacity:.55}));scene.add(stars)}
 water=new T.Mesh(new T.PlaneGeometry(260,420),new T.ShaderMaterial({uniforms:{uTime:{value:0}},
  vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'varying vec3 vW;uniform float uTime;void main(){float d=length(vW.xz-cameraPosition.xz);float s=exp(-pow(vW.x*.07,2.))*(.3+.7*smoothstep(.1,.9,sin(vW.z*1.05+uTime*.8+sin(vW.x*.9+uTime)*1.6)*.5+.5))*smoothstep(6.,70.,d);vec3 c=vec3(.015,.022,.035)+vec3(.85,.12,.18)*s*.9;c=mix(c,vec3(.027,.035,.05),1.-exp(-d*.008));gl_FragColor=vec4(c,1.);}'}));
 water.rotation.x=-Math.PI/2;water.position.y=-.9;scene.add(water);
 /* bridge */
 const LEN=Math.ceil(-zR+50),D=new T.Object3D();
 const pn=Math.ceil(LEN/.6),planks=new T.InstancedMesh(new T.BoxGeometry(3.4,.14,.52),new T.MeshLambertMaterial({color:0xffffff}),pn);
 for(let i=0;i<pn;i++){D.position.set(0,0,3-i*.6);D.updateMatrix();planks.setMatrixAt(i,D.matrix);planks.setColorAt(i,new T.Color(0x3b2a1f).multiplyScalar(.75+Math.random()*.5))}
 scene.add(planks);
 const wood=new T.MeshLambertMaterial({color:0x2a1d15});
 for(const x of[-1.6,1.6])for(const y of[.55,.98]){const r=new T.Mesh(new T.BoxGeometry(.08,.08,LEN),wood);r.position.set(x,y,3-LEN/2);scene.add(r)}
 const pc=Math.ceil(LEN/3),posts=new T.InstancedMesh(new T.BoxGeometry(.13,1.1,.13),wood,pc*2),lan=new T.InstancedMesh((window.__lanternGeo&&window.__lanternGeo('lo'))||new T.SphereGeometry(.17,10,8),(window.__lanternGeo&&window.__lanternGeo('lo')&&window.__lanternMat&&window.__lanternMat())||new T.MeshBasicMaterial({color:0xff9a4a}),Math.ceil(pc/2)*2),legs=new T.InstancedMesh(new T.BoxGeometry(.3,2.2,.3),wood,Math.ceil(LEN/6)*2);
 let a=0,b=0,c2=0;
 for(let i=0;i<pc;i++)for(const x of[-1.6,1.6]){const z=3-i*3;D.position.set(x,.55,z);D.updateMatrix();posts.setMatrixAt(a++,D.matrix);
  if(i%2===0){const LS=(window.__lanternGeo&&window.__lanternGeo('lo'))?.5:0;D.position.set(x,LS?1.12:1.3,z);if(LS)D.scale.setScalar(LS);D.updateMatrix();lan.setMatrixAt(b++,D.matrix);D.scale.setScalar(1)}
  if(i%2===0&&c2<legs.count){D.position.set(x*.9,-1,z);D.updateMatrix();legs.setMatrixAt(c2++,D.matrix)}}
 posts.count=a;lan.count=b;legs.count=c2;scene.add(posts,lan,legs);
 /* torii */
 const red=new T.MeshLambertMaterial({color:0xb21f2c,emissive:0x2a0509}),blk=new T.MeshLambertMaterial({color:0x0c0c10});
 const toriiOld=(z,s)=>{const g=new T.Group(),bx=(w,h,d,mt,x,y)=>{const q=new T.Mesh(new T.BoxGeometry(w,h,d),mt);q.position.set(x,y,0);g.add(q)};
  for(const x of[-2.5,2.5]){const p=new T.Mesh(new T.CylinderGeometry(.17,.21,4.6,12),red);p.position.set(x,1.4,0);g.add(p)}
  bx(6.8,.28,.5,red,0,4.7);bx(7.4,.14,.62,blk,0,4.95);bx(5.4,.2,.3,red,0,3.85);g.position.z=z;g.scale.setScalar(s||1);scene.add(g)};
 const torii=(z,s)=>{const big=(s||1)>1,m=window.__torii&&window.__torii({scale:8*(s||1),y:-.9,lod:big?'hi':'lo'});if(m){m.position.z=z;scene.add(m)}else toriiOld(z,s)};
 P.forEach((_,i)=>torii(zB(i)-4));
 {const og=window.__oni&&window.__oni({scale:15.5,y:-.9,glowMap:gt});if(og){og.position.z=zR;scene.add(og);window.__oniG=og}else torii(zR,1.9)}
 gateGlow=new T.Sprite(new T.SpriteMaterial({map:gt,color:0xffa070,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.3}));gateGlow.scale.set(30,30,1);gateGlow.position.set(0,6,zR-.5);scene.add(gateGlow);
 /* scrolls */
 const rodM=new T.MeshLambertMaterial({color:0x1a120d});
 B=P.map((p,i)=>{const side=i%2?1:-1,g=new T.Group();g.position.set(side*3.6,4.3,zB(i));g.lookAt(0,4.3,zB(i)+5);
  const sw=new T.Group();g.add(sw);
  const mat=new T.MeshBasicMaterial({map:bannerTex(p,i),side:T.DoubleSide}),paper=new T.Mesh(new T.PlaneGeometry(1.8,3.6),mat);paper.position.y=-1.8;sw.add(paper);
  const r1=new T.Mesh(new T.CylinderGeometry(.06,.06,2.1,10),rodM);r1.rotation.z=Math.PI/2;sw.add(r1);
  const r2=new T.Mesh(new T.CylinderGeometry(.08,.08,2,10),rodM);r2.rotation.z=Math.PI/2;r2.position.y=-3.6;sw.add(r2);
  const hl=new T.Sprite(new T.SpriteMaterial({map:gt,color:accC[i],blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0}));hl.scale.set(8,8,1);hl.position.set(0,-1.8,-.5);sw.add(hl);
  const cord=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-.9,0,0),new T.Vector3(0,.9,0),new T.Vector3(.9,0,0)]),new T.LineBasicMaterial({color:0x6a5236}));sw.add(cord);
  paper.userData.i=i;PP.push(paper);scene.add(g);return{sw,mat,hl,paper,r2,side,u:1}});
 /* sky lanterns + embers */
 lp=new Float32Array(LN*3);ls=[];for(let i=0;i<LN;i++)ls.push({x:(Math.random()<.5?-1:1)*(3+Math.random()*14),y:Math.random()*14,z:Math.random()*70,v:.15+Math.random()*.3,p:Math.random()*6});
 lg=new T.BufferGeometry();lg.setAttribute('position',new T.BufferAttribute(lp,3));
 scene.add(new T.Points(lg,new T.PointsMaterial({map:gt,color:0xff9a4a,size:1.3,transparent:true,opacity:.75,depthWrite:false,blending:T.AdditiveBlending})));
 ep=new Float32Array(EN*3);es=[];for(let i=0;i<EN;i++)es.push({x:(Math.random()-.5)*16,y:Math.random()*8,z:Math.random()*36,v:.1+Math.random()*.25,p:Math.random()*6});
 eg=new T.BufferGeometry();eg.setAttribute('position',new T.BufferAttribute(ep,3));
 scene.add(new T.Points(eg,new T.PointsMaterial({color:0xff8a4a,size:.075,transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending})));
 /* the ronin waits before the last gate */
 {const dk=new T.MeshLambertMaterial({color:0x0b0b10}),g=new T.Group(),add=(geo,y,x,z)=>{const q=new T.Mesh(geo,dk);q.position.set(x||0,y,z||0);g.add(q);return q};
  add(new T.ConeGeometry(.4,1.4,12),.78);add(new T.CylinderGeometry(.19,.28,.5,10),1.5);add(new T.SphereGeometry(.13,10,8),1.92);add(new T.ConeGeometry(.52,.26,18),2.15);
  const kt=add(new T.BoxGeometry(.035,.035,1.05),1.12,.3,.12);kt.rotation.y=-.25;
  rgl=new T.Sprite(new T.SpriteMaterial({map:gt,color:0xff3040,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.35}));rgl.scale.set(3.4,3.4,1);rgl.position.set(0,.5,.2);g.add(rgl);
  g.position.set(-1,.07,zR+20);g.rotation.y=.15;scene.add(g);ronin=g;
  /* swap the placeholder for the samurai GLB (falls back to the placeholder if it can't load) */
  if(window.__loadSamurai)window.__loadSamurai(renderer,function(m){
   const bx=new T.Box3().setFromObject(m),sz=bx.getSize(new T.Vector3()),c=bx.getCenter(new T.Vector3()),S=2.3/sz.y;
   m.scale.setScalar(S);m.position.set(-c.x*S,-bx.min.y*S,-c.z*S);
   m.material.emissive=new T.Color(0x1a1010);m.material.emissiveIntensity=.6;
   g.children.slice().forEach(ch=>{if(ch!==rgl)g.remove(ch)});g.add(m)},function(e){console.warn('Samurai GLB (projects) failed; keeping placeholder',e&&e.message||e)})}
 size();return true}
function size(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;fov0=w/h<.8?72:55;cam.fov=fov0;cam.updateProjectionMatrix();track.style.height=(m*h)+'px'}
/* ---------- ticks, card, input ---------- */
const tb=P.map((p,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Go to '+p.n);b.onclick=()=>go(i+1);ticks.appendChild(b);return b});
function setCard(i){const p=P[i];info.style.setProperty('--pa',p.c);$('pbno').textContent='No. '+String(i+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');$('pbn').textContent=p.n;
 $('pbfull').textContent=p.full;$('pbfull').hidden=!p.full;$('pbk').textContent=[p.cat,p.role].filter(Boolean).join('  ·  ');$('pbd').textContent=p.d;
 const ch=$('pbch');ch.innerHTML='';p.s.slice(0,6).forEach(s=>{const li=document.createElement('li');li.textContent=s;ch.appendChild(li)});
 const l=$('pbl');l.innerHTML='';[['Live',p.live],['Source',p.repo]].forEach(x=>{if(x[1]){const a=document.createElement('a');a.href=x[1];a.target='_blank';a.rel='noopener noreferrer';a.textContent=x[0];a.setAttribute('aria-label',x[0]+' · '+p.n+' (opens in a new tab)');l.appendChild(a)}});
 goBtn.setAttribute('aria-label','Hold to draw and open '+p.n);info.classList.toggle('r',B[i]&&B[i].side<0)}
const open=()=>{if(act>=0)location.hash='projects/'+P[act].id};
if(window.HoldGate)HoldGate(goBtn,()=>{if(act<0)return;const id=P[act].id;Slash(()=>{location.hash='projects/'+id})});
goBtn.addEventListener('click',()=>{if(reduce)open()});
panel.addEventListener('scroll',read,{passive:true});
addEventListener('resize',()=>{if(running){size();read()}});
panel.addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
addEventListener('keydown',e=>{if(!running||e.target.closest&&e.target.closest('input,textarea'))return;
 if(e.key==='ArrowRight'){go(Math.min(m-1,Math.round(cur)+1));e.preventDefault()}else if(e.key==='ArrowLeft'){go(Math.max(0,Math.round(cur)-1));e.preventDefault()}});
const ray=new T.Raycaster(),v2=new T.Vector2();
const pick=e=>{const r=cv.getBoundingClientRect();v2.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(v2,cam);const h=ray.intersectObjects(PP)[0];return h?h.object.userData.i:-1};
cv.addEventListener('click',e=>{const i=pick(e);if(i<0)return;if(i===act){goBtn.classList.remove('nudge');void goBtn.offsetWidth;goBtn.classList.add('nudge');goBtn.focus({preventScroll:true})}else go(i+1)});
cv.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;hoverI=pick(e);cv.style.cursor=hoverI>=0?'pointer':'default'});
/* ---------- loop ---------- */
function tick(ts){if(!running)return;raf=requestAnimationFrame(tick);const t=ts/1000;
 cur+=(tgt-cur)*(reduce?1:.07);if(Math.abs(tgt-cur)<.0004)cur=tgt;
 const i0=Math.min(Math.floor(cur),m-2),f=cur-i0,e=f*f*f*(f*(6*f-15)+10),z=stops[i0]+(stops[i0+1]-stops[i0])*(.65*e+.35*f);
 const sp=Math.abs(z-pz);
 for(let i=0;i<gates.length;i++)if(prevZ>gates[i]&&z<=gates[i]&&sp<30){pulse=1;sGate()}
 prevZ=z;pz=z;dist+=sp;pulse*=reduce?0:.94;
 const bob=reduce?0:Math.sin(dist*2.4)*.03*Math.min(sp*6,1);
 cam.position.set(Math.sin(z*.06)*.12+mx*.4,1.7+bob-my*.12,z);
 cam.fov=fov0+(reduce?0:Math.min(sp*5,6)+pulse*2.5);cam.updateProjectionMatrix();
 let bi=0,bk=0;for(let i=0;i<n;i++){const k=sm(1-Math.abs(z-stops[i+1])/8);if(k>bk){bk=k;bi=i}}
 tmp.set(cam.position.x,1.6-my*.4,z-20);bp.set(B[bi].side*3.5,fov0>60?1.15:2.3,zB(bi));tmp.lerp(bp,bk);cam.lookAt(tmp);
 /* accent-tinted lamp */
 tc.copy(base).lerp(accC[bi],.45*bk);lamp.color.copy(tc);lamp.position.set(cam.position.x,2.2,z-1.5);lamp.intensity=1.5+Math.sin(t*7)*.08+Math.sin(t*13.1)*.05+pulse*1.4;
 const my2=20+cur*.7;moon.position.set(0,my2,z-170);halo.position.set(0,my2,z-168);stars.position.set(0,0,z);water.position.z=z-120;water.material.uniforms.uTime.value=t;
 B.forEach((b,i)=>{const k=i===bi?bk:0,near=sm(1-Math.abs(z-stops[i+1])/20),u=.1+.9*near;
  b.sw.rotation.z=reduce?0:Math.sin(t*1.1+i*2)*.035;b.sw.rotation.x=reduce?0:Math.sin(t*.8+i)*.02;
  b.paper.scale.y=u;b.paper.position.y=-1.8*u;b.r2.position.y=-3.6*u;   /* the scroll unfurls as you approach */
  b.mat.color.setScalar(.5+.5*k+(hoverI===i?.18:0));b.hl.material.opacity=.4*k+(hoverI===i?.12:0)});
 const fd=clamp((zR+12-z)/20,0,1);fade.style.opacity=fd;gateGlow.material.opacity=.25+.55*clamp(1-(z-zR)/60,0,1);if(window.__oniG&&window.__oniG.userData.pulse)window.__oniG.userData.pulse(performance.now()/1000);halo.material.opacity=.3+.4*fd+pulse*.15;
 if(ronin){ronin.scale.y=1+(reduce?0:Math.sin(t*1.3)*.006);rgl.material.opacity=.3+.12*Math.sin(t*2.2)}
 for(let i=0;i<LN;i++){const s=ls[i],rel=((s.z-z)%70+70)%70-62;lp[i*3]=s.x+Math.sin(t*.4+s.p)*.6;lp[i*3+1]=2.5+(s.y+(reduce?0:t*s.v))%14;lp[i*3+2]=z+rel}
 lg.attributes.position.needsUpdate=true;
 for(let i=0;i<EN;i++){const s=es[i],rel=((s.z-z)%36+36)%36-30;ep[i*3]=s.x+Math.sin(t*.5+s.p)*.5;ep[i*3+1]=(s.y+(reduce?0:t*s.v))%8;ep[i*3+2]=z+rel}
 eg.attributes.position.needsUpdate=true;
 intro.style.opacity=clamp(1+z/8,0,1);outro.style.opacity=clamp((zR+34-z)/8,0,1)*(1-fd);hint.style.opacity=cur<.15?1:0;
 const io=clamp((bk-.45)/.35,0,1);info.style.opacity=io;info.style.transform='translateY('+((1-io)*16)+'px)';
 if(bi!==act){act=bi;setCard(bi);if(bk>.5)sFocus()}
 info.style.pointerEvents=bk>.7?'auto':'none';info.inert=bk<=.7;
 tb.forEach((b,i)=>b.classList.toggle('on',i===bi&&bk>.5));
 renderer.render(scene,cam)}
function run(){if(!ready||running)return;running=true;size();read();cur=tgt;pz=prevZ=stops[Math.min(Math.floor(cur),m-2)];cv.classList.add('on');raf=requestAnimationFrame(tick);if(!panel.contains(document.activeElement))panel.focus({preventScroll:true})}
function stop(){running=false;cancelAnimationFrame(raf);cv.classList.remove('on')}
function start(){if(ready){run();return}if(building)return;building=true;
 Promise.race([Promise.all([document.fonts.load('600 60px "Cormorant Garamond"'),document.fonts.load('800 60px "Shippori Mincho B1"'),document.fonts.load('400 20px Jost')]),new Promise(s=>setTimeout(s,1500))]).then(()=>{
  ready=init();building=false;if(!ready)panel.classList.add('pb-nogl');else if(on)run()})}
document.addEventListener('portfolio:view',e=>{const now=e.detail.id==='projects'&&!e.detail.cs&&!document.getElementById('case').classList.contains('on');if(now===on)return;on=now;if(on)start();else stop()});
if(panel.classList.contains('on')&&!document.getElementById('case').classList.contains('on')){on=true;start()}
})();
