
/* Torii gate model (decimated from torii_gate_3d_model.glb, original UVs + 2048px texture).
   window.__torii({scale,y,lod:'hi'|'lo',tint}) -> THREE.Group, or null if it can't be built (callers keep their fallback). */
(function(){
 var cache={},tex=null,mats=[];
 function getTex(){
  if(tex)return tex;var T=window.THREE,img=new Image();
  tex=new T.Texture(img);tex.flipY=false;tex.anisotropy=8;
  img.onload=function(){tex.needsUpdate=true;mats.forEach(function(m){m.map=tex;m.needsUpdate=true})};
  img.src='data:image/jpeg;base64,'+document.getElementById('toriiTex').textContent.trim();
  return tex;
 }
 function parse(id){
  var T=window.THREE,el=document.getElementById(id);if(!T||!el)return null;
  var bin=atob(el.textContent.trim()),u=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  var dv=new DataView(u.buffer),nv=dv.getUint32(0,true),nt=dv.getUint32(4,true),mn=[],mx=[],k;
  for(k=0;k<3;k++){mn.push(dv.getFloat32(8+k*4,true));mx.push(dv.getFloat32(20+k*4,true))}
  var off=32;
  var q=new Uint16Array(u.buffer.slice(off,off+nv*6));off+=nv*6;
  var uq=new Uint16Array(u.buffer.slice(off,off+nv*4));off+=nv*4;
  var idx=new Uint16Array(u.buffer.slice(off,off+nt*6));
  var pos=new Float32Array(nv*3),uv=new Float32Array(nv*2);
  for(var v=0;v<nv;v++){for(k=0;k<3;k++)pos[v*3+k]=mn[k]+q[v*3+k]/65535*(mx[k]-mn[k]);uv[v*2]=uq[v*2]/65535;uv[v*2+1]=uq[v*2+1]/65535}
  var g=new T.BufferGeometry();
  g.setAttribute('position',new T.BufferAttribute(pos,3));
  g.setAttribute('uv',new T.BufferAttribute(uv,2));
  g.setIndex(new T.BufferAttribute(idx,1));
  g.computeBoundingSphere();g.computeBoundingBox();
  return g;
 }
 window.__torii=function(o){
  o=o||{};var T=window.THREE,id='toriiLowData';
  try{
   if(!cache[id])cache[id]=parse(id);
   if(!cache[id])return null;
   var t=getTex(),mat=new T.MeshBasicMaterial({color:o.tint==null?0xd8d0d0:o.tint});
   if(t.image&&t.image.complete&&t.image.naturalWidth)mat.map=t;else mats.push(mat);
   var g=new T.Group();g.add(new T.Mesh(cache[id],mat));
   if(window.__lantern){[-1,1].forEach(function(sx){var l=window.__lantern({scale:.095,lod:o.lod==='lo'?'lo':'hi',tint:o.tint});if(l){l.position.set(sx*.33,.35,0);g.add(l)}})}
   g.scale.setScalar(o.scale||1);g.position.y=o.y||0;
   return g;
  }catch(e){return null}
 };
})();
