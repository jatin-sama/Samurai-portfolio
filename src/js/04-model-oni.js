
/* Oni torii (from torii_gate_3d_model.glb): the last gate of the Crossing. window.__oni({scale,y,glowMap,tint}) -> Group|null.
   group.userData.pulse(seconds) animates the oni-face glow, lantern flicker and rising embers. */
(function(){
 var geoP=null;
 function getGeo(){
  if(geoP)return geoP;var T=window.THREE;
  geoP=new Promise(function(res,rej){try{
   var el=document.getElementById('oniData'),bin=atob(el.textContent.trim()),u=new Uint8Array(bin.length);
   for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
   var dv=new DataView(u.buffer),nv=dv.getUint32(0,true),nt=dv.getUint32(4,true),mn=[],mx=[],k;
   for(k=0;k<3;k++){mn.push(dv.getFloat32(8+k*4,true));mx.push(dv.getFloat32(20+k*4,true))}
   new Response(new Blob([u.subarray(32)]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer().then(function(ab){try{
    var r=new Uint8Array(ab),off=0,ch=[];
    for(var c=0;c<5;c++){var lo=r.subarray(off,off+nv),hi=r.subarray(off+nv,off+2*nv);off+=2*nv;
     var a=new Uint16Array(nv),v=0;for(var i=0;i<nv;i++){v=(v+(lo[i]|(hi[i]<<8)))&65535;a[i]=v}ch.push(a)}
    var pos=new Float32Array(nv*3),uv=new Float32Array(nv*2);
    for(var i=0;i<nv;i++){for(k=0;k<3;k++)pos[i*3+k]=mn[k]+ch[k][i]/65535*(mx[k]-mn[k]);uv[i*2]=ch[3][i]/65535;uv[i*2+1]=ch[4][i]/65535}
    var d=[];for(c=0;c<3;c++){var p0=r.subarray(off,off+nt),p1=r.subarray(off+nt,off+2*nt),p2=r.subarray(off+2*nt,off+3*nt),p3=r.subarray(off+3*nt,off+4*nt);off+=4*nt;
     var a2=new Int32Array(nt);for(var i=0;i<nt;i++)a2[i]=p0[i]|(p1[i]<<8)|(p2[i]<<16)|(p3[i]<<24);d.push(a2)}
    var idx=nv<65536?new Uint16Array(nt*3):new Uint32Array(nt*3),a=0;
    for(var i=0;i<nt;i++){a+=d[0][i];idx[i*3]=a;idx[i*3+1]=a+d[1][i];idx[i*3+2]=a+d[2][i]}
    var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));
    g.setIndex(new T.BufferAttribute(idx,1));g.computeBoundingSphere();g.computeBoundingBox();res(g)}catch(e){rej(e)}},rej);
  }catch(e){rej(e)}});
  return geoP;
 }
 window.__oni=function(o){
  o=o||{};var T=window.THREE;
  try{
   if(!window.DecompressionStream)return null;
   var img=new Image(),tx=new T.Texture(img);tx.flipY=false;tx.anisotropy=16;tx.generateMipmaps=true;tx.minFilter=T.LinearMipmapLinearFilter;tx.magFilter=T.LinearFilter;
   var mat=new T.MeshBasicMaterial({color:o.tint==null?new T.Color(1.2,1.14,1.14):o.tint});
   /* crisper texture: sharper mip selection + gentle unsharp mask so the carving and oni face stay legible */
   mat.onBeforeCompile=function(sh){sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',
    '#ifdef USE_MAP\n vec4 tc0=texture2D(map,vUv,-1.1);vec2 px=vec2(.00065);\n vec4 bl=(texture2D(map,vUv+vec2(px.x,0.),-.4)+texture2D(map,vUv-vec2(px.x,0.),-.4)+texture2D(map,vUv+vec2(0.,px.y),-.4)+texture2D(map,vUv-vec2(0.,px.y),-.4))*.25;\n vec4 sampledDiffuseColor=clamp(tc0+(tc0-bl)*.85,0.,1.);diffuseColor*=sampledDiffuseColor;\n#endif')};
   img.onload=function(){tx.needsUpdate=true;mat.map=tx;mat.needsUpdate=true};
   img.src='data:image/jpeg;base64,'+document.getElementById('oniTex').textContent.trim();
   var g=new T.Group(),mesh=new T.Mesh(new T.BufferGeometry(),mat);mesh.frustumCulled=false;g.add(mesh);
   getGeo().then(function(ge){mesh.geometry=ge}).catch(function(e){window.__oniErr=e;try{console.error('oni gate decode failed',e)}catch(x){}});
   var gm=o.glowMap,glows=[];
   function glow(x,y,z,size,col,op,kind,ph){
    if(!gm)return null;
    var sp=new T.Sprite(new T.SpriteMaterial({map:gm,color:col,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:op,fog:false}));
    sp.scale.set(size,size,1);sp.position.set(x,y,z);g.add(sp);glows.push({sp:sp,op:op,size:size,kind:kind,ph:ph||0});return sp;
   }
   /* oni face: wide red aura behind the mask, hot core on the face, two burning eyes */
   glow(0,.575,.06,.34,0xff1f2a,.34,'aura',0);
   glow(0,.558,.155,.15,0xff5a24,.5,'face',1);
   glow(-.021,.563,.158,.05,0xffd27a,.9,'eye',2);
   glow(.021,.563,.158,.05,0xffd27a,.9,'eye',3.3);
   /* lanterns */
   glow(0,.442,.12,.15,0xffa24a,.55,'lamp',.4);
   glow(-.428,.368,.1,.1,0xffa24a,.5,'lamp',1.7);glow(.433,.37,.1,.1,0xffa24a,.5,'lamp',2.6);
   glow(-.369,.146,.13,.11,0xff9040,.5,'lamp',3.9);glow(.367,.146,.13,.11,0xff9040,.5,'lamp',5.2);
   /* embers drifting up past the oni */
   var N=46,ep=new Float32Array(N*3),es=[];
   for(var i=0;i<N;i++)es.push({x:(Math.random()-.5)*.34,y:.42+Math.random()*.32,z:.1+Math.random()*.08,v:.015+Math.random()*.03,p:Math.random()*6});
   var eg=new T.BufferGeometry();eg.setAttribute('position',new T.BufferAttribute(ep,3));
   var em=new T.Points(eg,new T.PointsMaterial({map:gm||null,color:0xff7a3a,size:.55,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
   em.frustumCulled=false;g.add(em);
   var last=0;
   g.userData.pulse=function(t){
    var dt=Math.min(.1,Math.max(0,t-last));last=t;
    glows.forEach(function(e){
     var m=e.sp.material,s=Math.sin;
     if(e.kind==='aura'){m.opacity=e.op*(.8+.35*s(t*1.1));var k=1+.06*s(t*1.1);e.sp.scale.set(e.size*k,e.size*k,1)}
     else if(e.kind==='face'){m.opacity=e.op*(.75+.3*s(t*1.7+e.ph)+.1*s(t*7.3))}
     else if(e.kind==='eye'){m.opacity=Math.min(1,e.op*(.8+.25*s(t*3.1+e.ph)+.15*s(t*11+e.ph*2)))}
     else{m.opacity=e.op*(.82+.14*s(t*5.2+e.ph)+.08*s(t*13.7+e.ph*3))}
    });
    for(var i=0;i<N;i++){var e=es[i];e.y+=e.v*dt;if(e.y>.8){e.y=.42;e.x=(Math.random()-.5)*.34}
     ep[i*3]=e.x+Math.sin(t*.8+e.p)*.01;ep[i*3+1]=e.y;ep[i*3+2]=e.z}
    eg.attributes.position.needsUpdate=true;
   };
   g.userData.pulse(0);
   g.scale.setScalar(o.scale||1);g.position.y=o.y||0;
   return g;
  }catch(e){window.__oniErr=e;try{console.error('oni gate failed',e)}catch(x){}return null}
 };
})();
