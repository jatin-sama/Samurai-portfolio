
/* =====================================================================
   BLOOD SCYTHE · cinematic replacement for the hero "draw the sword" slash.
   - Own transparent Three.js layer (scythe GLB, ribbon trail, particles)
   - GSAP master timeline sequences every beat
   - The trail ribbon, the crack line and the screen-splitting clip-path are
     all generated from ONE baked sampling of the scythe's real transform
     (tip + blade anchors per step), so slash direction/curvature always
     matches the blade's actual movement.
   - window.ScytheSlash(mid) is a drop-in for window.Slash(mid); it falls back
     to the original Slash if anything (WebGL, GSAP, decoding) is unavailable.
   ===================================================================== */
(function(){
'use strict';
var doc=document,body=doc.body,enter=doc.getElementById('enter');
if(!enter)return;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,
    coarse=matchMedia('(pointer: coarse)').matches,
    lite=(navigator.hardwareConcurrency||8)<=2;
var DEG=Math.PI/180,FOV=32,Z0=10,SP0=-.07,SP1=1.06,NB=120,CUTB=.35;
/* master timeline beats (seconds after the tap) */
var T_SW=2.2,D_SW=.72,
    T_CUT=T_SW+D_SW*Math.sqrt((1-SP0)/(SP1-SP0)),   /* swing ease is power1.in (== p^2): s(p)=SP0+(SP1-SP0)*p^2 */
    T_MID=T_CUT-.2,T_DIS=T_CUT+.08,T_CARD=T_CUT-.05,T_END=T_CUT+2.9;
var COLS=[-.45,-.14,0,.3,.65,1,1.28];
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,t){return a+(b-a)*t}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ===================== PURE GEOMETRY (no DOM / no THREE) ===================== */
/*GEO-START*/
function makeGeo(w,h,meta){
 var asp=w/h,H0=2*Z0*Math.tan(FOV*DEG/2),W0=H0*asp,S=Math.min(.58*H0,1.05*W0),
     offx=-S*(.22+.28*clamp(1-asp,0,1)),G=meta.grip;
 var PATH=[[.40,.18],[.2,.02],[-.25,-.2],[-.95,-.75]];
 var LT=[(meta.tip[0]-G[0])*S,(meta.tip[1]-G[1])*S,(meta.tip[2]-G[2])*S],
     LI=[(meta.inner[0]-G[0])*S,(meta.inner[1]-G[1])*S,(meta.inner[2]-G[2])*S];
 /* rig pose at swing parameter s (bezier across the viewport + roll sweep) */
 function pose(s){var u=1-s,b0=u*u*u,b1=3*u*u*s,b2=3*u*s*s,b3=s*s*s;
  var nx=b0*PATH[0][0]+b1*PATH[1][0]+b2*PATH[2][0]+b3*PATH[3][0],
      ny=b0*PATH[0][1]+b1*PATH[1][1]+b2*PATH[2][1]+b3*PATH[3][1];
  return{x:nx*W0/2+offx,y:ny*H0/2,roll:(25+(-95)*s)*DEG,pitch:-15*DEG,yaw:8*DEG}}
 /* R = Rz(roll) * Rx(pitch) * Ry(yaw) */
 function lin(p,v){var cy=Math.cos(p.yaw),sy=Math.sin(p.yaw),cx=Math.cos(p.pitch),sx=Math.sin(p.pitch),cz=Math.cos(p.roll),sz=Math.sin(p.roll);
  var x=v[0]*cy+v[2]*sy,z=-v[0]*sy+v[2]*cy,y=v[1],y2=y*cx-z*sx,z2=y*sx+z*cx;
  return[x*cz-y2*sz,x*sz+y2*cz,z2]}
 function rot(p,v){var r=lin(p,v);return[r[0]+p.x,r[1]+p.y,r[2]]}
 function mat(p){var a=lin(p,[1,0,0]),b=lin(p,[0,1,0]),c=lin(p,[0,0,1]);
  return[a[0],b[0],c[0],p.x, a[1],b[1],c[1],p.y, a[2],b[2],c[2],0, 0,0,0,1]}
 function proj(P){var k=Z0/(Z0-P[2]);return[(P[0]*k/(W0/2)*.5+.5)*w,(.5-P[1]*k/(H0/2)*.5)*h]}
 /* ---- bake: tip + inner-blade anchors for every step ---- */
 var T=[],I=[],C=[],i,s,p,q;
 for(i=0;i<=NB;i++){s=SP0+(SP1-SP0)*i/NB;p=pose(s);T.push(rot(p,LT));I.push(rot(p,LI));
  q=[T[i][0]+CUTB*(I[i][0]-T[i][0]),T[i][1]+CUTB*(I[i][1]-T[i][1]),T[i][2]+CUTB*(I[i][2]-T[i][2])];C.push(proj(q))}
 /* ---- cut polyline in screen px, extended past the viewport on both ends ---- */
 /* smooth the baked samples with a least-squares cubic bezier (removes the hook/kink at the start, keeps ends tangent-continuous) */
  (function(){var n=C.length,u=[0],k,d;for(k=1;k<n;k++)u.push(u[k-1]+Math.hypot(C[k][0]-C[k-1][0],C[k][1]-C[k-1][1]));var Lc=u[n-1];for(k=0;k<n;k++)u[k]/=Lc;
   var P0=C[0].slice(),P3=C[n-1].slice(),out=[],a11=0,a12=0,a22=0,r1=[0,0],r2=[0,0];
   for(k=0;k<n;k++){var t=u[k],mt=1-t,b0=mt*mt*mt,b1=3*mt*mt*t,b2=3*mt*t*t,b3=t*t*t;
    a11+=b1*b1;a12+=b1*b2;a22+=b2*b2;
    for(d=0;d<2;d++){var rr=C[k][d]-b0*P0[d]-b3*P3[d];r1[d]+=b1*rr;r2[d]+=b2*rr}}
   var det=a11*a22-a12*a12||1,P1=[],P2=[];for(d=0;d<2;d++){P1[d]=(r1[d]*a22-r2[d]*a12)/det;P2[d]=(a11*r2[d]-a12*r1[d])/det}
   for(k=0;k<n;k++){var t2=u[k],m2=1-t2,q0=m2*m2*m2,q1=3*m2*m2*t2,q2=3*m2*t2*t2,q3=t2*t2*t2;
    out.push([q0*P0[0]+q1*P1[0]+q2*P2[0]+q3*P3[0],q0*P0[1]+q1*P1[1]+q2*P2[1]+q3*P3[1]])}
   for(k=0;k<n;k++)C[k]=out[k];
   C.tan0=[P0[0]-P1[0],P0[1]-P1[1]];C.tan1=[P3[0]-P2[0],P3[1]-P2[1]]})();
  var ext=Math.hypot(w,h)*1.3;
 function dir(a,b){var dx=a[0]-b[0],dy=a[1]-b[1],l=Math.hypot(dx,dy)||1;return[dx/l,dy/l]}
 var d0=dir(C.tan0,[0,0]),d1=dir(C.tan1,[0,0]),
     P0=[C[0][0]+d0[0]*ext,C[0][1]+d0[1]*ext],P1=[C[NB][0]+d1[0]*ext,C[NB][1]+d1[1]*ext],
     pts=[P0].concat(C,[P1]),cl=[0];
 for(i=1;i<pts.length;i++)cl.push(cl[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
 var L=cl[cl.length-1];
 function frac(sv){var f=clamp((sv-SP0)/(SP1-SP0),0,1)*NB,i0=Math.min(NB-1,Math.floor(f)),t=f-i0;return(lerp(cl[1+i0],cl[2+i0],t))/L}
 var dd=[P1[0]-P0[0],P1[1]-P0[1]],dl=Math.hypot(dd[0],dd[1])||1,nA=[-dd[1]/dl,dd[0]/dl],big=Math.max(w,h)*4;
 function r2(v){return Math.round(v*10)/10}
 function pstr(a){var o='M',k;for(k=0;k<a.length;k++)o+=(k?'L':'')+r2(a[k][0])+' '+r2(a[k][1]);return o}
 function poly(sg){var n=[nA[0]*sg*big,nA[1]*sg*big];return pts.concat([[P1[0]+n[0],P1[1]+n[1]],[P0[0]+n[0],P0[1]+n[1]]])}
 var polyA=poly(1),polyB=poly(-1);
 var mid=T[Math.round(NB*.55)],mi=I[Math.round(NB*.55)];
 return{w:w,h:h,W0:W0,H0:H0,S:S,pose:pose,mat:mat,rot:rot,lin:lin,T:T,I:I,C:C,pts:pts,cl:cl,L:L,frac:frac,e0:cl[1]/L,
  nA:nA,edgeD:pstr(pts),pathA:pstr(polyA)+'Z',pathB:pstr(polyB)+'Z',
  polyA:polyA.map(function(a){return r2(a[0])+'px '+r2(a[1])+'px'}).join(','),
  polyB:polyB.map(function(a){return r2(a[0])+'px '+r2(a[1])+'px'}).join(','),
  cutMid:[(mid[0]+mi[0])/2,(mid[1]+mi[1])/2,(mid[2]+mi[2])/2],LT:LT,LI:LI}}
function tOfS(s){return T_SW+D_SW*Math.sqrt(clamp((s-SP0)/(SP1-SP0),0,1))}
/*GEO-END*/

/* ===================== SHADERS ===================== */
var NOISE=['float hh(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
 'float nz3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);',
 'return mix(mix(mix(hh(i),hh(i+vec3(1.,0.,0.)),f.x),mix(hh(i+vec3(0.,1.,0.)),hh(i+vec3(1.,1.,0.)),f.x),f.y),',
 'mix(mix(hh(i+vec3(0.,0.,1.)),hh(i+vec3(1.,0.,1.)),f.x),mix(hh(i+vec3(0.,1.,1.)),hh(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}'].join('\n');
var RIB_VS='attribute float aS;attribute float aT;varying float vS;varying float vT;void main(){vS=aS;vT=aT;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
var RIB_FS=['uniform float uHead,uLen,uFade,uDis,uTime;varying float vS;varying float vT;',NOISE,
 'float h2(vec2 p){p=fract(p*vec2(.1031,.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}',
 'float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),f.x),f.y);}',
 'void main(){',
 ' if(uHead<=0.0||vS>uHead)discard;',
 ' float age=uHead-vS;float life=clamp(1.0-age/uLen,0.0,1.0);',
 ' float dn=n2(vec2(vS*38.,vT*9.))*.6+n2(vec2(vS*120.,vT*30.+4.))*.4;',
 ' float q=vS*.8+dn*.4,cut=uDis*1.2;if(q<cut)discard;float edge=1.0-smoothstep(.0,.1,q-cut);',
 ' float cu=(vT+.015)/.05,core=exp(-cu*cu);',
 ' float body=(1.0-smoothstep(.05,1.02,vT))*smoothstep(-.18,.02,vT);',
 ' float g1=(vT+.1)/.32,g2=(vT-1.05)/.26,glow=exp(-g1*g1)*.55+exp(-g2*g2)*.25;',
 ' float fl=.88+.12*n2(vec2(vS*70.-uTime*6.,vT*5.));',
 ' float hot=1.0-smoothstep(.0,.07,age);',
 ' vec3 col=mix(vec3(.55,.03,.06),vec3(1.,.26,.16),body*fl);',
 ' col+=vec3(1.,.82,.62)*core*1.4+vec3(1.,.5,.25)*hot*1.2+vec3(1.,.55,.2)*edge*1.6;',
 ' float a=(core*1.2+body*.95+glow)*(.3+.7*life)*uFade+edge*.9+hot*.8;',
 ' gl_FragColor=vec4(col,clamp(a,0.,1.));}'].join('\n');
var PT_VS=['uniform float uT,uPx;attribute vec3 aVel;attribute vec4 aMeta;attribute vec2 aMisc;varying float vA;varying vec3 vC;',
 'void main(){float age=uT-aMeta.x,k=age/aMeta.y;',
 ' if(age<0.0||k>=1.0){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;vA=0.;vC=vec3(0.);return;}',
 ' float dr=2.4,tt=(1.0-exp(-dr*age))/dr;vec3 p=position+aVel*tt;p.y-=aMisc.x*.5*age*age;p.x+=sin(age*5.+aMisc.y*6.28)*.05*k;',
 ' vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;',
 ' float f=1.0-k;vA=f*f*(.62+.38*sin(age*38.+aMisc.y*40.));',
 ' vec3 hot=vec3(1.,.86,.55),mid=vec3(1.,.28,.08),cold=vec3(.55,.03,.06);',
 ' vC=k<.35?mix(hot,mid,k/.35):mix(mid,cold,(k-.35)/.65);',
 ' gl_PointSize=aMeta.z*uPx*(1.0-.55*k);}'].join('\n');
var PT_FS='varying float vA;varying vec3 vC;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=1.0-smoothstep(0.,.5,d);a*=a;gl_FragColor=vec4(vC*(.7+a),a*vA);}';
var CRK_VS='attribute float aS;attribute float aT;varying float vS;varying float vT;void main(){vS=aS;vT=aT;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
var CRK_FS=['uniform float uA,uB,uFade;varying float vS;varying float vT;',
 'void main(){if(vS<uA||vS>uB)discard;float d=abs(vT);float core=exp(-d*d*70.),mid=exp(-d*d*10.),gl=exp(-d*d*2.4);',
 'float head=1.0-smoothstep(0.,.045,uB-vS);',
 'vec3 col=vec3(1.,.92,.82)*core*1.7+vec3(1.,.32,.22)*mid*1.0+vec3(.85,.06,.12)*gl*.55+vec3(1.,.85,.65)*head*1.3;',
 'float a=(core+mid*.75+gl*.4+head*.6)*uFade;gl_FragColor=vec4(col,clamp(a,0.,1.));}'].join('\n');
var RING_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
var RING_FS='uniform float uA;varying vec2 vUv;void main(){gl_FragColor=vec4(vec3(1.,.28,.2)*1.4,uA);}';

/* ===================== STATE ===================== */
var st={p:null,failed:false,busy:false},A=null,X=null;
window.__scyBusy=false;

function b64ToBytes(s){var bin=atob(s),u=new Uint8Array(bin.length),i;for(i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u}
function gunzip(u8){return new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()}
function loadImg(bytes,mime){return new Promise(function(res,rej){var u=URL.createObjectURL(new Blob([bytes],{type:mime})),im=new Image();
 im.onload=function(){URL.revokeObjectURL(u);res(im)};im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('scythe texture'))};im.src=u})}
function glowTex(){var c=doc.createElement('canvas');c.width=c.height=128;var g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);
 r.addColorStop(0,'rgba(255,235,210,1)');r.addColorStop(.25,'rgba(255,90,60,.65)');r.addColorStop(1,'rgba(255,20,30,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}

/* ===================== ASSET + RENDERER SETUP (idle-time) ===================== */
function prepare(){
 if(st.p)return st.p;
 st.p=new Promise(function(res,rej){
  if(reduce||!window.THREE||!window.gsap||!window.DecompressionStream||doc.documentElement.classList.contains('nofx')){rej(new Error('scythe: unsupported'));return}
  var el=doc.getElementById('scytheData');if(!el){rej(new Error('scythe: no data'));return}
  var u8;try{u8=b64ToBytes(el.textContent.trim())}catch(e){rej(e);return}
  gunzip(u8).then(function(ab){
   var dv=new DataView(ab),hl=dv.getUint32(0,true),meta=JSON.parse(new TextDecoder().decode(new Uint8Array(ab,4,hl))),base=4+hl,Ly=meta.layout,n=meta.n,i;
   var q=new Uint16Array(ab,base+Ly.pos[0],n*3),nr=new Int8Array(ab,base+Ly.nrm[0],n*4),uv=new Uint16Array(ab,base+Ly.uv[0],n*2),ix=new Uint32Array(ab,base+Ly.idx[0],meta.ni);
   var pos=new Float32Array(n*3),mn=meta.min,mx=meta.max,sx=(mx[0]-mn[0])/65535,sy=(mx[1]-mn[1])/65535,sz=(mx[2]-mn[2])/65535;
   for(i=0;i<n;i++){pos[3*i]=mn[0]+q[3*i]*sx;pos[3*i+1]=mn[1]+q[3*i+1]*sy;pos[3*i+2]=mn[2]+q[3*i+2]*sz}
   function by(k){return new Uint8Array(ab,base+Ly[k][0],Ly[k][1])}
   return Promise.all([loadImg(by('tex_base'),'image/jpeg'),loadImg(by('tex_normal'),'image/jpeg'),loadImg(by('tex_rm'),'image/jpeg'),loadImg(by('tex_emis'),'image/jpeg')]).then(function(im){
    if(im.some(function(i){return!i.naturalWidth}))throw new Error('scythe texture empty');var nf=new Float32Array(n*3),uf=new Float32Array(n*2);for(i=0;i<n;i++){nf[3*i]=nr[4*i]/127;nf[3*i+1]=nr[4*i+1]/127;nf[3*i+2]=nr[4*i+2]/127;uf[2*i]=uv[2*i]/65535;uf[2*i+1]=uv[2*i+1]/65535}
    A={meta:meta,pos:pos,nrm:nf,uv:uf,idx:ix,img:im};res(setup())})
  }).catch(rej)});
 st.p.catch(function(e){st.failed=true;try{console.warn('Scythe cinematic unavailable, using classic slash:',e&&e.message||e)}catch(x){}});
 return st.p}

function setup(){
 var cv=doc.createElement('canvas');cv.id='scy-gl';
 var ov=doc.createElement('div');ov.id='scy';ov.setAttribute('aria-hidden','true');
 var seam=doc.createElement('div');seam.className='sc-seam';
 var dim=doc.createElement('div');dim.className='sc-dim';
 var fl=doc.createElement('div');fl.className='sc-flash';var dk=doc.createElement('div');dk.className='sc-dark';
 ov.appendChild(seam);ov.appendChild(dim);ov.appendChild(cv);ov.appendChild(fl);ov.appendChild(dk);body.appendChild(ov);
 var R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true,powerPreference:'high-performance',premultipliedAlpha:true});
 R.setClearColor(0x000000,0);R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.NoToneMapping;
 R.setPixelRatio(Math.min(window.devicePixelRatio||1,lite?1.5:2));
 var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(FOV,1,.1,60);cam.position.set(0,0,Z0);
 scene.add(new THREE.HemisphereLight(0xffffff,0x40181c,1.1));
 var key=new THREE.DirectionalLight(0xffffff,1.6);key.position.set(-2,3,5);scene.add(key);
 var rim=new THREE.DirectionalLight(0xff4a3a,1.5);rim.position.set(3,-1,-3);scene.add(rim);
 var fill=new THREE.DirectionalLight(0x9db4ff,.6);fill.position.set(-4,1,3);scene.add(fill);
 /* textures */
 var an=R.capabilities.getMaxAnisotropy();
 function tex(im,srgb){var cc=doc.createElement('canvas');cc.width=im.naturalWidth;cc.height=im.naturalHeight;cc.getContext('2d').drawImage(im,0,0);var t=new THREE.Texture(cc);t.flipY=false;t.anisotropy=an;if(srgb)t.encoding=THREE.sRGBEncoding;t.needsUpdate=true;return t}
 var tB=tex(A.img[0],true),tN=tex(A.img[1],false),tR=tex(A.img[2],false),tE=tex(A.img[3],true);
 var U={uRv:{value:0},uRim:{value:0}};
 var mat=new THREE.MeshStandardMaterial({map:tB,normalMap:tN,roughnessMap:tR,metalnessMap:tR,roughness:1,metalness:.5,emissive:new THREE.Color(1,.42,.16),emissiveMap:tE,emissiveIntensity:0,side:THREE.DoubleSide,envMapIntensity:1.0});
 mat.onBeforeCompile=function(sh){sh.uniforms.uRv=U.uRv;sh.uniforms.uRim=U.uRim;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vOP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vOP;uniform float uRv,uRim;\n'+NOISE)
   .replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfloat dsF=(1.0-clamp(vOP.y,0.,1.))*.8+nz3(vOP*14.)*.32;float dsE=uRv*1.15-dsF;if(dsE<0.0)discard;')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat rimF=pow(1.0-clamp(abs(dot(normalize(normal),normalize(vViewPosition))),0.,1.),4.5);totalEmissiveRadiance+=vec3(1.,.1,.08)*rimF*uRim*.9;totalEmissiveRadiance+=vec3(1.,.38,.1)*(1.0-smoothstep(0.,.07,dsE))*1.6;')};
 var crkU={uA:{value:0},uB:{value:-1},uFade:{value:1}},crkM=new THREE.ShaderMaterial({uniforms:crkU,vertexShader:CRK_VS,fragmentShader:CRK_FS,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 var ribU={uHead:{value:0},uLen:{value:1.6},uFade:{value:1},uDis:{value:0},uTime:{value:0}},
  ribM=new THREE.ShaderMaterial({uniforms:ribU,vertexShader:RIB_VS,fragmentShader:RIB_FS,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),
  ptU={uT:{value:0},uPx:{value:1}},
  ptM=new THREE.ShaderMaterial({uniforms:ptU,vertexShader:PT_VS,fragmentShader:PT_FS,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending});
 var geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.BufferAttribute(A.pos,3));
 geo.setAttribute('normal',new THREE.BufferAttribute(A.nrm,3));
 geo.setAttribute('uv',new THREE.BufferAttribute(A.uv,2));
 geo.setIndex(new THREE.BufferAttribute(A.idx,1));
 var mg=A.meta,gp=mg.grip;
 geo.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,.5,0),.8);
 var model=new THREE.Mesh(geo,mat);model.frustumCulled=false;model.position.set(-gp[0],-gp[1],-gp[2]);
 var holder=new THREE.Group();holder.add(model);
 var rig=new THREE.Group();rig.matrixAutoUpdate=false;rig.add(holder);scene.add(rig);
 /* demon eyes */
 var gt=glowTex(),eyes=mg.eyes.map(function(e){var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:0xff3322,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending}));
  sp.position.set(e[0],e[1],e[2]);sp.scale.setScalar(.0001);model.add(sp);return sp});
 var eyeL=new THREE.PointLight(0xff2a1a,0,5,1.6);eyeL.position.set(-.2,.87,.03);model.add(eyeL);
 var aura=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:0xff2a2a,transparent:true,opacity:0,depthTest:true,depthWrite:false,blending:THREE.AdditiveBlending}));aura.position.set(.12,.5,-.3);aura.scale.set(1.9,1.9,1);model.add(aura);
 /* tip flare (follows the real blade tip) */
 var flare=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,color:0xffd2b0,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending}));flare.scale.setScalar(.0001);flare.renderOrder=9;scene.add(flare);
 /* shock ring */
 var ringMat=new THREE.ShaderMaterial({uniforms:{uA:{value:0}},vertexShader:RING_VS,fragmentShader:RING_FS,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 var ring=new THREE.Mesh(new THREE.RingGeometry(.94,1,64),ringMat);ring.visible=false;ring.renderOrder=8;scene.add(ring);
 /* warm up: compile + upload textures while hidden */
 var dz=new THREE.Mesh(new THREE.PlaneGeometry(.001,.001),ribM),dp=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(3),3)),ptM);dz.frustumCulled=dp.frustumCulled=false;scene.add(dz);scene.add(dp);var dc=new THREE.Mesh(new THREE.PlaneGeometry(.001,.001),crkM);dc.frustumCulled=false;scene.add(dc);ring.visible=true;ring.scale.setScalar(.001);
 try{[tB,tN,tR,tE].forEach(function(t){R.initTexture(t)});R.setSize(64,36,false);cam.aspect=64/36;cam.updateProjectionMatrix();rig.matrix.identity();rig.matrixWorldNeedsUpdate=true;holder.scale.setScalar(.001);R.render(scene,cam)}catch(e){}
 try{var pg=R.info&&R.info.programs;if(Array.isArray(pg)&&pg.some(function(p){return p.diagnostics&&p.diagnostics.runnable===false}))throw new Error('scythe shader failed to compile')}catch(e){if(/compile/.test(e.message))throw e}
 scene.remove(dz);scene.remove(dp);scene.remove(dc);dz.geometry.dispose();dp.geometry.dispose();dc.geometry.dispose();ring.visible=false;

 X={dark:dk,aura:aura,crkU:crkU,crkM:crkM,ribU:ribU,ribM:ribM,ptU:ptU,ptM:ptM,cv:cv,ov:ov,seam:seam,dim:dim,flash:fl,R:R,scene:scene,cam:cam,mat:mat,U:U,rig:rig,holder:holder,model:model,eyes:eyes,eyeL:eyeL,flare:flare,ring:ring,ringMat:ringMat,gt:gt,key:key,rim:rim};
 window.__scyKit={geo:geo,tB:tB,tN:tN,tR:tR,tE:tE,meta:mg,NOISE:NOISE};
 try{doc.dispatchEvent(new CustomEvent('scythe:ready'))}catch(e){}
 return X}

/* ===================== PER-RUN BUILDERS ===================== */
function buildRibbon(B){
 var rows=NB+1,cols=COLS.length,pos=new Float32Array(rows*cols*3),aS=new Float32Array(rows*cols),aT=new Float32Array(rows*cols),i,j,k=0;
 for(i=0;i<rows;i++)for(j=0;j<cols;j++){var t=COLS[j],a=B.T[i],b=B.I[i];
  pos[k*3]=a[0]+(b[0]-a[0])*t;pos[k*3+1]=a[1]+(b[1]-a[1])*t;pos[k*3+2]=a[2]+(b[2]-a[2])*t;aS[k]=i/NB;aT[k]=t;k++}
 var idx=[];for(i=0;i<NB;i++)for(j=0;j<cols-1;j++){var a0=i*cols+j,b0=a0+1,c0=a0+cols,d0=c0+1;idx.push(a0,b0,c0,b0,d0,c0)}
 var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aS',new THREE.BufferAttribute(aS,1));g.setAttribute('aT',new THREE.BufferAttribute(aT,1));
 g.setIndex(new THREE.BufferAttribute(new Uint16Array(idx),1));
 var u=X.ribU;u.uHead.value=0;u.uDis.value=0;u.uFade.value=1;
 var mesh=new THREE.Mesh(g,X.ribM);mesh.frustumCulled=false;mesh.renderOrder=5;return{mesh:mesh,u:u,g:g}}

function buildCrack(B){
 var pts=B.pts,n=pts.length,pos=new Float32Array(n*2*3),aS=new Float32Array(n*2),aT=new Float32Array(n*2),hw=B.H0*.034,i,idx=[];
 var W=[];for(i=0;i<n;i++)W.push([(pts[i][0]/B.w-.5)*B.W0,(.5-pts[i][1]/B.h)*B.H0]);
 for(i=0;i<n;i++){var a=W[Math.max(0,i-1)],b=W[Math.min(n-1,i+1)],tx=b[0]-a[0],ty=b[1]-a[1],l=Math.hypot(tx,ty)||1,nx=-ty/l*hw,ny=tx/l*hw;
  pos.set([W[i][0]+nx,W[i][1]+ny,0,W[i][0]-nx,W[i][1]-ny,0],i*6);aS[2*i]=aS[2*i+1]=B.cl[i]/B.L;aT[2*i]=1;aT[2*i+1]=-1;
  if(i<n-1){var q=2*i;idx.push(q,q+1,q+2,q+1,q+3,q+2)}}
 var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aS',new THREE.BufferAttribute(aS,1));g.setAttribute('aT',new THREE.BufferAttribute(aT,1));g.setIndex(new THREE.BufferAttribute(new Uint16Array(idx),1));
 var m=new THREE.Mesh(g,X.crkM);m.frustumCulled=false;m.renderOrder=7;return{mesh:m,g:g,u:X.crkU}}
function buildParticles(B){
 var NP=lite?420:850,P=new Float32Array(NP*3),V=new Float32Array(NP*3),M=new Float32Array(NP*4),Q=new Float32Array(NP*2),r=rng(20260611),k=0;
 function put(p,v,b,l,s,g){P[3*k]=p[0];P[3*k+1]=p[1];P[3*k+2]=p[2];V[3*k]=v[0];V[3*k+1]=v[1];V[3*k+2]=v[2];M[4*k]=b;M[4*k+1]=l;M[4*k+2]=s;M[4*k+3]=0;Q[2*k]=g;Q[2*k+1]=r();k++}
 function rs(m){return[(r()-.5)*2*m,(r()-.5)*2*m,(r()-.5)*m*.6]}
 function R2(a,b){return a+r()*(b-a)}
 var nSp=Math.round(NP*.34),nEm=Math.round(NP*.24),nSu=Math.round(NP*.16),nBu=Math.round(NP*.14),nDi=NP-nSp-nEm-nSu-nBu,n,i,a,t,T=B.T,I=B.I,pp;
 /* swing sparks along the real blade edge */
 for(n=0;n<nSp;n++){i=1+((r()*(NB-2))|0);a=R2(-.12,.55);pp=[lerp(T[i][0],I[i][0],a),lerp(T[i][1],I[i][1],a),lerp(T[i][2],I[i][2],a)];
  var tx=T[i+1][0]-T[i-1][0],ty=T[i+1][1]-T[i-1][1],tl=Math.hypot(tx,ty)||1,sp=R2(.8,3.4),rv=rs(R2(1.2,4.2));
  put(pp,[tx/tl*sp+rv[0],ty/tl*sp+rv[1],rv[2]],tOfS(SP0+(SP1-SP0)*i/NB)+r()*.04,R2(.35,1.05),R2(1.8,4.6),4.2)}
 /* trail dissolving into embers (birth follows the dissolve front tail->head) */
 for(n=0;n<nEm;n++){i=(r()*NB)|0;t=R2(-.1,1.05);pp=[lerp(T[i][0],I[i][0],t),lerp(T[i][1],I[i][1],t),lerp(T[i][2],I[i][2],t)];
  put(pp,[R2(-.35,.35),R2(.25,1.1),R2(-.2,.2)],T_DIS+.6*clamp((i/NB*.8+.2)/1.26,0,1)+r()*.05,R2(.6,1.0),R2(1.8,3.8),-.45)}
 /* summon embers swirling around the rising scythe */
 var sx=B.W0*.04+B.S*0,sy=-.02*B.H0;
 for(n=0;n<nSu;n++){a=r()*6.2832;var rr=R2(.2,1)*.55*B.S;
  put([sx+Math.cos(a)*rr*.7,sy+R2(-.5,.7)*B.S,Math.sin(a)*rr*.5],[-Math.sin(a)*R2(.6,1.4),R2(.3,1),Math.cos(a)*.4],R2(.05,1.25),R2(.9,1.7),R2(1.8,4),-.35)}
 /* impact burst along the cut */
 for(n=0;n<nBu;n++){i=10+((r()*(NB-10))|0);t=R2(0,.6);pp=[lerp(T[i][0],I[i][0],t),lerp(T[i][1],I[i][1],t),lerp(T[i][2],I[i][2],t)];
  var bx=T[i+1][0]-T[i-1][0],by2=T[i+1][1]-T[i-1][1],bl=Math.hypot(bx,by2)||1,sg=r()<.5?-1:1,mg=R2(1.5,6);
  put(pp,[-by2/bl*sg*mg+bx/bl*R2(0,2),bx/bl*sg*mg+by2/bl*R2(0,2),R2(-1,1)],T_CUT+r()*.05,R2(.5,1.0),R2(2,5),3)}
 /* the scythe itself disintegrates after the cut */
 var pf=B.pose(SP1-.02),vn=A.pos.length/3,gp=A.meta.grip;
 for(n=0;n<nDi;n++){var vi=(r()*vn)|0,lx=(A.pos[3*vi]-gp[0])*B.S,ly=(A.pos[3*vi+1]-gp[1])*B.S,lz=(A.pos[3*vi+2]-gp[2])*B.S,wp=B.rot(pf,[lx,ly,lz]);
  var dsF=(1-clamp(A.pos[3*vi+1],0,1))*.8+.16;
  put(wp,[R2(-.6,.6),R2(.2,1.2),R2(-.4,.4)],T_SW+D_SW*.78+.5*(1-dsF/1.3225)+r()*.04,R2(.6,1.1),R2(1.8,3.8),-.4)}
 var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aVel',new THREE.BufferAttribute(V,3));g.setAttribute('aMeta',new THREE.BufferAttribute(M,4));g.setAttribute('aMisc',new THREE.BufferAttribute(Q,2));
 var u=X.ptU;u.uT.value=0;u.uPx.value=X.R.getPixelRatio();
 var pts=new THREE.Points(g,X.ptM);pts.frustumCulled=false;pts.renderOrder=6;return{mesh:pts,u:u,g:g}}

/* snapshot of the live hero canvas (retries until the WebGL buffer is readable) */
function captureHero(sw,sh,done){
 var src=doc.getElementById('c'),snap=doc.createElement('canvas'),sc=doc.createElement('canvas'),tries=0;snap.width=sw;snap.height=sh;sc.width=32;sc.height=18;
 var sx=sc.getContext('2d',{willReadFrequently:true}),gx=snap.getContext('2d');gx.fillStyle='#05070b';gx.fillRect(0,0,sw,sh);
 function attempt(){tries++;var ok=false;try{sx.clearRect(0,0,32,18);sx.drawImage(src,0,0,32,18);var d=sx.getImageData(0,0,32,18).data,k;for(k=0;k<d.length;k+=4){if(d[k+3]>0&&(d[k]+d[k+1]+d[k+2])>6){ok=true;break}}}catch(e){ok=true}
  if(ok){try{gx.drawImage(src,0,0,sw,sh)}catch(e){}done(snap,true)}
  else if(tries<12)setTimeout(function(){requestAnimationFrame(attempt)},0);else done(snap,false)}
 if(!src){done(snap,false);return}
 setTimeout(function(){requestAnimationFrame(attempt)},0)}

function cloneUI(){
 var wrap=doc.createDocumentFragment();
 ['.vig','.nav','.hero','.idx','.hint'].forEach(function(sel){var el=doc.querySelector(sel);if(!el)return;var c=el.cloneNode(true);
  var en=c.querySelector('#enter');if(en)en.setAttribute('data-cid','enter');
  c.removeAttribute('id');[].forEach.call(c.querySelectorAll('[id]'),function(n){n.removeAttribute('id')});
  [].forEach.call(c.querySelectorAll('[tabindex]'),function(n){n.removeAttribute('tabindex')});
  c.setAttribute('aria-hidden','true');c.setAttribute('inert','');wrap.appendChild(c)});
 return wrap}

function makeHalf(B,snap,ok,which){
 var half=doc.createElement('div');half.className='sc-half '+which;
 var cp=which==='a'?B.polyA:B.polyB;
 var usePath=window.CSS&&CSS.supports&&CSS.supports('clip-path','path("M0 0L1 1Z")');
 var v=usePath?'path("'+(which==='a'?B.pathA:B.pathB)+'")':'polygon('+cp+')';
 half.style.clipPath=v;half.style.webkitClipPath=v;
 var sn=doc.createElement('div');sn.className='sc-snap';
 var bg=doc.createElement('canvas');bg.className='sc-bg';bg.width=snap.width;bg.height=snap.height;bg.getContext('2d').drawImage(snap,0,0);sn.appendChild(bg);
 sn.appendChild(cloneUI());half.appendChild(sn);
 var ns='http://www.w3.org/2000/svg',svg=doc.createElementNS(ns,'svg');svg.setAttribute('class','sc-edge');svg.setAttribute('width',B.w);svg.setAttribute('height',B.h);svg.setAttribute('viewBox','0 0 '+B.w+' '+B.h);
 var vm=Math.min(B.w,B.h)/800,paths=[];
 [['#ff1f35',22*vm+8,.34],['#ff6a52',8*vm+3,.8],['#fff2e2',2.4*vm+1.2,1]].forEach(function(o){var p=doc.createElementNS(ns,'path');
  p.setAttribute('d',B.edgeD);p.setAttribute('pathLength','1');p.setAttribute('fill','none');p.setAttribute('stroke',o[0]);p.setAttribute('stroke-width',o[1]);p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');
  p.style.opacity=o[2];svg.appendChild(p);paths.push(p)});
 svg.style.opacity=0;half.appendChild(svg);return{el:half,sn:sn,svg:svg}}

function makeSeam(B){
 var ns='http://www.w3.org/2000/svg',svg=doc.createElementNS(ns,'svg');svg.setAttribute('width',B.w);svg.setAttribute('height',B.h);svg.setAttribute('viewBox','0 0 '+B.w+' '+B.h);svg.setAttribute('class','sc-edge');
 var vm=Math.min(B.w,B.h)/800,ps=[];
 [['#ff1f35',90*vm+30,.35],['#ff4a3a',34*vm+12,.55],['#ffd9c0',7*vm+3,.95]].forEach(function(o){var p=doc.createElementNS(ns,'path');p.setAttribute('d',B.edgeD);p.setAttribute('fill','none');p.setAttribute('stroke',o[0]);p.setAttribute('stroke-width',o[1]);p.setAttribute('stroke-linecap','round');p.style.opacity=o[2];svg.appendChild(p);ps.push(p)});
 X.seam.innerHTML='';X.seam.appendChild(svg);X.seam.style.opacity=0;return ps}

/* ===================== THE SEQUENCE ===================== */
function play(mid){
 var w=innerWidth,h=innerHeight,B=makeGeo(w,h,A.meta),ctl=doc.getElementById('charge'),midDone=false;
 function doMid(){if(midDone)return;midDone=true;try{mid&&mid()}catch(e){console.error(e)}}
 window.__scyBusy=true;window.__swingT=null;window.__cardHold=true;window.__cardPending=null;
 var R=X.R,cam=X.cam,scene=X.scene;
 R.setPixelRatio(Math.min(window.devicePixelRatio||1,lite?1.5:2));R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
 X.holder.scale.setScalar(B.S);
 var rib=buildRibbon(B),par=buildParticles(B),ck=buildCrack(B);scene.add(ck.mesh);scene.add(rib.mesh);scene.add(par.mesh);
 var p0=parseFloat(ctl.style.getPropertyValue('--p'))||0;ctl.style.setProperty('--p',0);
 var S={rv:0,glow:0,eye:0,rim:0,s:SP0,crk:0,dis:0,fade:1,ring:0,dimv:p0*.7,flash:0,fin:0,edge:0,dark:0},darkOK=false,glClear=false,
     Dp={v:window.__drawT||0},RG={x:0,y:0,roll:0,pitch:0,yaw:0},halves=null,snapRes=null,swingOn=false,finished=false,last={};
 var a1={x:B.W0*.06,y:-.02*B.H0,roll:-6*DEG,pitch:-10*DEG,yaw:12*DEG},
     a0={x:a1.x+B.W0*.1,y:-.62*B.H0,roll:-16*DEG,pitch:-26*DEG,yaw:-105*DEG},
     st0=B.pose(SP0);
 var dm=window.__scyDormant,dOK=!!(dm&&dm.ok&&performance.now()-dm.t<500);window.__scyDormant=null;
 /* pulled free: begin exactly where the dormant scythe stood in the hero scene (screen position, size, roll) instead of rising from below */
 if(dOK){a0={x:clamp(dm.nx,-.9,.9)*B.W0/2,y:clamp(dm.ny,-.9,.9)*B.H0/2,roll:dm.roll,pitch:0,yaw:dm.yaw,sc:clamp(dm.hf*B.H0/B.S,.4,1.6)};S.rv=1.15;S.glow=.55;S.rim=.3}else a0.sc=1;
 RG={x:a0.x,y:a0.y,roll:a0.roll,pitch:a0.pitch,yaw:a0.yaw,sc:a0.sc};
 X.ov.classList.add('on');body.classList.add('scy-run');X.ring.visible=false;X.ringMat.uniforms.uA.value=0;
 X.dim.style.opacity=S.dimv;X.flash.style.opacity=0;X.aura.material.opacity=0;
 function sty(el,k,v){if(last[k]!==v){last[k]=v;el.style.opacity=v}}
 /* ---- per-frame update: every value is derived from timeline state, nothing is allocated ---- */
 function frame(){
  if(finished)return;
  var t=tl.time(),U=X.U,gl=S.glow,pn=performance.now();
  if(!last.q){if(t>.5&&t<1.7&&last.pn){last.sum=(last.sum||0)+(pn-last.pn);last.n=(last.n||0)+1}
   if(t>=1.7){last.q=1;if(last.n>8&&last.sum/last.n>20&&R.getPixelRatio()>1){R.setPixelRatio(1);R.setSize(w,h,false);par.u.uPx.value=1}}}
  last.pn=pn;
  var fk=gl*(.92+.08*Math.sin(t*37)*Math.sin(t*11));
  U.uRv.value=S.rv;U.uRim.value=S.rim*(.8+.2*Math.sin(t*9));
  X.mat.emissiveIntensity=fk*1.5;X.aura.material.opacity=Math.min(1,S.rv)*(.06+.16*Math.min(1,gl));
  X.holder.scale.setScalar(B.S*(RG.sc||1));
  var m=B.mat(RG);X.rig.matrix.set(m[0],m[1],m[2],m[3],m[4],m[5],m[6],m[7],m[8],m[9],m[10],m[11],m[12],m[13],m[14],m[15]);X.rig.matrixWorldNeedsUpdate=true;
  var es=.15*S.eye*(1+.18*Math.sin(t*14));X.eyes.forEach(function(e){e.scale.setScalar(Math.max(.0001,es))});X.eyeL.intensity=S.eye*2.0*(1+.2*Math.sin(t*13));
  var hd=clamp((S.s-SP0)/(SP1-SP0),0,1),ru=rib.u;ru.uHead.value=swingOn?hd:0;ru.uDis.value=S.dis;ru.uFade.value=S.fade;ru.uTime.value=t;
  var fi=Math.min(NB,Math.max(0,Math.round(hd*NB))),tp=B.T[fi];
  if(swingOn&&S.dis<.05){X.flare.position.set(tp[0],tp[1],tp[2]);X.flare.scale.setScalar(1.1+.12*Math.sin(t*50))}else X.flare.scale.setScalar(.0001);
  par.u.uT.value=t;
  if(S.ring>0&&S.ring<1){X.ring.visible=true;X.ring.position.set(B.cutMid[0],B.cutMid[1],B.cutMid[2]);var sc=lerp(.3,Math.hypot(B.W0,B.H0)*.75,1-Math.pow(1-S.ring,3));X.ring.scale.set(sc,sc,1);X.ringMat.uniforms.uA.value=Math.pow(1-S.ring,2)*.5}else X.ring.visible=false;
  /* crack: revealed exactly as far as the blade has travelled, then runs out to both screen edges (all in WebGL) */
  var a=B.e0*(1-S.crk),b=swingOn?B.frac(S.s)+(1-B.frac(SP1))*S.crk:-1;ck.u.uA.value=a;ck.u.uB.value=b;ck.u.uFade.value=1-S.edge;
  if(halves){var eo=Math.round(S.edge*100)/100;if(last.eo!==eo){last.eo=eo;halves[0].svg.style.opacity=eo;halves[1].svg.style.opacity=eo}}
  sty(X.seam,'seam',Math.round(S.fin*100)/100);sty(X.dark,'dk',darkOK?Math.round(S.dark*100)/100:0);sty(X.dim,'dim',Math.round(S.dimv*100)/100);sty(X.flash,'fl',Math.round(S.flash*100)/100);
  window.__drawT=Dp.v;
  /* once the slash visuals are finished, stop drawing WebGL so the chapter card has the whole frame budget */
  if(t>T_CUT+1.5){if(!glClear){glClear=true;R.clear()}return}
  R.render(scene,cam)}
 /* ---- timeline ---- */
 var tl=gsap.timeline({paused:true,onUpdate:frame,onComplete:finish});
 /* 1 · summon: rises out of the dark, materialises bottom -> top, embers swirl, hero camera pushes in */
 tl.fromTo(RG,{x:a0.x,y:a0.y,roll:a0.roll,pitch:a0.pitch,yaw:a0.yaw,sc:a0.sc},{x:a1.x,y:a1.y,roll:a1.roll,pitch:a1.pitch,yaw:a1.yaw,sc:1,duration:1.0,ease:'power3.out',immediateRender:false},0);
 if(dOK){tl.to(S,{flash:.28,duration:.07,ease:'none'},0);tl.to(S,{flash:0,duration:.35,ease:'power2.out'},.07)}
 tl.to(S,{rv:1.15,duration:1.0,ease:'power2.out'},.05);
 tl.to(S,{dimv:.75,duration:1,ease:'power2.inOut'},0);
 tl.to(Dp,{v:1,duration:.95,ease:'power2.inOut'},0);
 /* 2 · rotate into the attacking stance; engravings + demon eyes ignite and hold for a readable beat */
 tl.to(RG,{x:st0.x,y:st0.y,roll:st0.roll,pitch:st0.pitch,yaw:st0.yaw,duration:.95,ease:'power3.inOut',immediateRender:false},1.0);
 tl.to(S,{glow:1,duration:.8,ease:'power2.out'},1.1);
 tl.to(S,{rim:1,duration:.6,ease:'power1.out'},1.15);
 tl.to(S,{eye:1,duration:.5,ease:'back.out(3)'},1.3);
 tl.to(S,{glow:1.3,duration:.18,ease:'power1.in'},1.98);
 /* 3 · freeze the page into two clipped halves while the user watches the stance (keeps the swing itself hitch-free) */
 tl.call(function(){var cw=Math.round(w*Math.min(1,1400/Math.max(w,h)));captureHero(cw,Math.round(h*cw/w),function(sn,ok){snapRes={s:sn,ok:ok}})},null,1.05);
 tl.call(function(){
   var sn=snapRes||{s:doc.createElement('canvas'),ok:false};if(!snapRes){sn.s.width=8;sn.s.height=8}
   halves=[makeHalf(B,sn.s,sn.ok,'a'),makeHalf(B,sn.s,sn.ok,'b')];halves.forEach(function(hv){X.ov.insertBefore(hv.el,X.dim)});makeSeam(B);
   if(snapRes&&snapRes.ok)window.__heroHold=true},null,1.5);
 /* heavy next-view work (3D scene build, layout) runs now, hidden behind the frozen halves, instead of during the swing/impact */
 tl.call(function(){if(halves)doMid()},null,1.85);
 /* 4 · the swing: eased along the baked pose function; trail + crack read the same samples */
 tl.call(function(){swingOn=true;window.__swingT=performance.now();if(window.__whoosh)window.__whoosh();if(navigator.vibrate)navigator.vibrate([20,30,50])},null,T_SW);
 tl.fromTo(S,{s:SP0},{s:SP1,duration:D_SW,ease:'power1.in',immediateRender:false,onUpdate:function(){var p=B.pose(S.s);RG.x=p.x;RG.y=p.y;RG.roll=p.roll;RG.pitch=p.pitch;RG.yaw=p.yaw}},T_SW);
 tl.to(S,{flash:.22,duration:.08,ease:'none'},T_SW).to(S,{flash:0,duration:.25},T_SW+.08);
 /* the scythe dissolves head-first into embers as it leaves the frame */
 tl.to(S,{rv:0,duration:.5,ease:'power1.in'},T_SW+D_SW*.78);
 /* 5 · impact: crack runs to both screen edges, flash, transform-only shake + distortion pulse, shockwave */
 tl.to(S,{crk:1,duration:.14,ease:'power2.out'},T_CUT-.02);
 tl.call(function(){if(navigator.vibrate)navigator.vibrate([40,30,70]);
   gsap.fromTo(X.ov,{x:0,y:0,scale:1},{x:function(){return(Math.random()-.5)*16},y:function(){return(Math.random()-.5)*12},scale:1.016,duration:.045,repeat:7,yoyo:true,repeatRefresh:true,ease:'none',onComplete:function(){gsap.set(X.ov,{x:0,y:0,scale:1})}})},null,T_CUT);
 tl.to(S,{flash:.5,duration:.05,ease:'none'},T_CUT).to(S,{flash:0,duration:.35,ease:'power2.out'},T_CUT+.05);
 tl.to(S,{ring:1,duration:.75,ease:'none'},T_CUT);
 tl.to(S,{edge:1,duration:.1,ease:'none'},T_CUT+.02);
 /* 6 · navigate underneath, then split the site open along the very same curve */
 tl.call(doMid,null,T_MID);
 tl.to(S,{fin:1,duration:.12,ease:'none'},T_CUT);
 tl.call(function(){var D=Math.hypot(w,h)*1.02,nA=B.nA;
   gsap.to(halves[0].el,{x:nA[0]*D,y:nA[1]*D,rotation:-1.6,duration:1.05,ease:'power3.inOut'});
   gsap.to(halves[1].el,{x:-nA[0]*D,y:-nA[1]*D,rotation:1.6,duration:1.05,ease:'power3.inOut'})},null,T_CUT+.06);
 tl.to(S,{fin:0,duration:.5,ease:'power2.in'},T_CUT+.55);
 tl.to(S,{dimv:0,duration:.7,ease:'power2.inOut'},T_CUT+.15);
 /* 7 · the energy trail dissolves into red particles */
 tl.to(S,{dis:1.05,duration:.6,ease:'none'},T_DIS);
 tl.call(function(){X.ov.style.pointerEvents='none';window.__heroHold=false;body.classList.remove('scy-run')},null,T_CUT+1.2);
 tl.to(Dp,{v:0,duration:.9,ease:'power2.out'},T_CUT+.1);
 /* 8 · chapter beat: the card is already waiting UNDER the two halves, so the split reveals the chapter card first; it then lifts onto the ready page (no flash of page content, no second load) */
 
 
 tl.call(function(){if(window.__showChapter)window.__showChapter(true)},null,T_CARD);
 
 tl.to({},{duration:.01},T_END);
 function finish(){
  if(finished)return;finished=true;
  try{tl.kill()}catch(e){}
  doMid();window.__heroHold=false;if(window.__cardHold&&window.__showChapter)window.__showChapter();window.__cardHold=false;
  scene.remove(rib.mesh);scene.remove(par.mesh);scene.remove(ck.mesh);[rib.g,par.g,ck.g].forEach(function(o){o.dispose()});
  gsap.killTweensOf(halves?[halves[0].el,halves[1].el,X.ov]:[X.ov]);gsap.set(X.ov,{clearProps:'transform'});
  [].forEach.call(X.ov.querySelectorAll('.sc-half'),function(n){n.remove()});X.seam.innerHTML='';
  X.R.clear();X.ov.style.pointerEvents='';X.ov.classList.remove('on');body.classList.remove('scy-run');
  X.holder.scale.setScalar(.001);X.ring.visible=false;X.flare.scale.setScalar(.0001);X.aura.material.opacity=0;
  window.__drawT=0;enter.style.setProperty('--p',0);ctl.style.setProperty('--p',0);doc.documentElement.style.setProperty('--hp',0);
  window.__scyBusy=false;st.busy=false}
 window.__scyAbort=function(){doMid();finish()};
 frame();tl.play(0);
 return true}

/* ===================== PUBLIC ENTRY ===================== */
function classic(mid){window.__scyBusy=false;window.__cardHold=false;if(typeof window.Slash==='function')window.Slash(mid);else try{mid&&mid()}catch(e){}}
window.ScytheSlash=function(mid){
 if(window.__scyBusy||st.busy)return;
 if(reduce||st.failed||!window.THREE||!window.gsap){classic(mid);return}
 st.busy=true;window.__scyBusy=true;
 var go=function(){try{play(mid)}catch(e){console.error('Scythe sequence failed, falling back',e);window.__cardHold=false;try{if(X){X.ov.classList.remove('on');body.classList.remove('scy-run')}}catch(x){}st.busy=false;classic(mid)}};
 if(X){go();return}
 var to=setTimeout(function(){to=0;st.busy=false;classic(mid)},3200);
 prepare().then(function(){if(!to)return;clearTimeout(to);to=0;go()},function(){if(!to)return;clearTimeout(to);to=0;st.busy=false;classic(mid)})};

/* the sequence starts from the 1.5s hold on the button (HoldGate); here we only preload on first intent */
enter.addEventListener('pointerdown',function(){prepare().catch(function(){})});
enter.addEventListener('pointerenter',function(){prepare().catch(function(){})},{once:true});
enter.addEventListener('focus',function(){prepare().catch(function(){})},{once:true});
/* decode + compile at idle once the intro is over, so the first tap has no hitch */
function idle(){var f=function(){prepare().catch(function(){})};if(window.requestIdleCallback)requestIdleCallback(f,{timeout:2500});else setTimeout(f,900)}
doc.addEventListener('portfolio:hero-ready',idle,{once:true});
addEventListener('resize',function(){if(window.__scyBusy&&window.__scyAbort){window.__scyAbort()}});
})();
