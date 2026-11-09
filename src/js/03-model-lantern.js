
/* Lantern model (decimated from lantern_3d_model.glb). window.__lantern({scale,y,lod,tint}) -> Mesh|null;
   window.__lanternGeo(lod) / window.__lanternMat(tint) for InstancedMesh use. Callers keep their fallbacks. */
(function(){
 var cache={},tex=null,mats=[];
 function getTex(){
  if(tex)return tex;var T=window.THREE,img=new Image();
  tex=new T.Texture(img);tex.flipY=false;tex.anisotropy=8;
  img.onload=function(){tex.needsUpdate=true;mats.forEach(function(m){m.map=tex;m.needsUpdate=true})};
  img.src='data:image/jpeg;base64,'+document.getElementById('lanternTex').textContent.trim();
  return tex;
 }
 function parse(id){
  var T=window.THREE,el=document.getElementById(id);if(!T||!el)return null;
  var bin=atob(el.textContent.trim()),u=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  var dv=new DataView(u.buffer),nv=dv.getUint32(0,true),nt=dv.getUint32(4,true),mn=[],mx=[],k;
  for(k=0;k<3;k++){mn.push(dv.getFloat32(8+k*4,true));mx.push(dv.getFloat32(20+k*4,true))}
  var off=32,q=new Uint16Array(u.buffer.slice(off,off+nv*6));off+=nv*6;
  var uq=new Uint16Array(u.buffer.slice(off,off+nv*4));off+=nv*4;
  var idx=new Uint16Array(u.buffer.slice(off,off+nt*6)),pos=new Float32Array(nv*3),uv=new Float32Array(nv*2);
  for(var v=0;v<nv;v++){for(k=0;k<3;k++)pos[v*3+k]=mn[k]+q[v*3+k]/65535*(mx[k]-mn[k]);uv[v*2]=uq[v*2]/65535;uv[v*2+1]=uq[v*2+1]/65535}
  var g=new T.BufferGeometry();
  g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));
  g.setIndex(new T.BufferAttribute(idx,1));g.computeBoundingSphere();g.computeBoundingBox();
  return g;
 }
 window.__lanternGeo=function(lod){
  var id=lod==='lo'?'lanternLowData':'lanternData';
  try{if(!cache[id])cache[id]=parse(id);return cache[id]||null}catch(e){return null}
 };
 window.__lanternMat=function(tint){
  var T=window.THREE;try{
   var t=getTex(),m=new T.MeshBasicMaterial({color:tint==null?0xffffff:tint});
   if(t.image&&t.image.complete&&t.image.naturalWidth)m.map=t;else mats.push(m);return m;
  }catch(e){return null}
 };
 window.__lantern=function(o){
  o=o||{};var g=window.__lanternGeo(o.lod),m=g&&window.__lanternMat(o.tint);if(!m)return null;
  var T=window.THREE,mesh=new T.Mesh(g,m);mesh.scale.setScalar(o.scale||1);mesh.position.y=o.y||0;return mesh;
 };
})();
