
/* Castle (from the Tripo GLB, reduced from 500k to 44k triangles and packed like the oni gate): the keep on its crag.
   window.__castle({glowMap,tint}) -> Group|null, built in model units (about 0.8 wide, 0.84 tall, front face toward +z).
   group.userData.look(k)        0 = invisible black silhouette ... 1 = full colour (the mist parting)
   group.userData.lights(k)      0..1: the keep windows light up one by one
   group.userData.pulse(seconds) window flicker, call every frame
   group.userData.keep           [x,y,z] of the roof tip and door, in model units: TOP, DOOR, TORII (front gate near the water) */
(function(){
 var geoP=null,texP=null;
 var TOP=[-.01,.83,-.2],DOOR=[0,.49,-.06],TORII=[-.13,.06,.41];
 /* window glows on the keep's front face: [x,y,z,size] */
 var WIN=[[-.012,.775,-.125,.03],[-.05,.705,-.1,.03],[.035,.705,-.1,.03],[-.09,.635,-.09,.03],[-.01,.635,-.09,.034],[.07,.635,-.09,.03],[-.115,.565,-.085,.03],[-.04,.565,-.085,.034],[.04,.565,-.085,.034],[.1,.565,-.085,.03]];
 function getGeo(){
  if(geoP)return geoP;var T=window.THREE;
  geoP=window.__jtData('castleData').then(function(b64){return new Promise(function(res,rej){try{
   var bin=atob(b64.trim()),u=new Uint8Array(bin.length);
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
  }catch(e){rej(e)}})});
  return geoP;
 }
 function getTex(){
  if(texP)return texP;var T=window.THREE;
  texP=window.__jtData('castleTex').then(function(b64){return new Promise(function(res){
   var img=new Image(),tx=new T.Texture(img);tx.flipY=false;tx.anisotropy=4;tx.generateMipmaps=true;tx.minFilter=T.LinearMipmapLinearFilter;tx.magFilter=T.LinearFilter;
   if(T.sRGBEncoding)tx.encoding=T.sRGBEncoding;else if(T.SRGBColorSpace)tx.colorSpace=T.SRGBColorSpace;
   img.onload=function(){tx.needsUpdate=true;res(tx)};img.onerror=function(){res(null)};
   img.src='data:image/jpeg;base64,'+b64.trim()})});
  return texP;
 }
 window.__castle=function(o){
  o=o||{};var T=window.THREE;
  try{
   if(!window.DecompressionStream)return null;
   var base=o.tint||new T.Color(1,1,1),mat=new T.MeshBasicMaterial({color:new T.Color(0,0,0),fog:false}),g=new T.Group(),mesh=new T.Mesh(new T.BufferGeometry(),mat);
   mesh.frustumCulled=false;g.add(mesh);
   getTex().then(function(tx){if(tx){mat.map=tx;mat.needsUpdate=true}});
   getGeo().then(function(ge){mesh.geometry=ge;g.userData.ready=true}).catch(function(e){window.__castleErr=e;try{console.error('castle decode failed',e)}catch(x){}});
   /* look(k): black silhouette in the mist -> moonlit colour. tint is the colour at k=1 (multiplies the texture) */
   var cool=new T.Color(.55,.62,.9),one=new T.Color(1,1,1),tmp=new T.Color(),tmp2=new T.Color();
   g.userData.look=function(k,boost){k=Math.max(0,Math.min(1,k));tmp.copy(base).multiply(tmp2.copy(cool).lerp(one,k*k));
    mat.color.copy(tmp).multiplyScalar(k*(1+(boost||0)))};
   g.userData.look(o.k==null?1:o.k);
   var gm=o.glowMap,wins=[];
   if(gm){
    WIN.forEach(function(w,i){var sp=new T.Sprite(new T.SpriteMaterial({map:gm,color:0xffb560,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0,fog:false}));
     sp.scale.set(w[3]*2.6,w[3]*2.6,1);sp.position.set(w[0],w[1],w[2]+.012);g.add(sp);wins.push({sp:sp,s:w[3]*2.6,ph:i*1.9,on:0})});
   }
   var lit=0;
   g.userData.lights=function(k){lit=Math.max(0,Math.min(1,k))};
   g.userData.pulse=function(t){
    for(var i=0;i<wins.length;i++){var e=wins[i],tg=Math.max(0,Math.min(1,lit*(wins.length+1)-i));
     e.on+=(tg-e.on)*.18;
     var fl=.82+.14*Math.sin(t*4.1+e.ph)+.07*Math.sin(t*11.3+e.ph*2.7);
     e.sp.material.opacity=e.on*fl;var s=e.s*(.85+.15*e.on);e.sp.scale.set(s,s,1)}};
   g.userData.keep={top:TOP,door:DOOR,torii:TORII};
   g.userData.windows=wins.length;
   return g;
  }catch(e){window.__castleErr=e;try{console.error('castle failed',e)}catch(x){}return null}
 };
})();
