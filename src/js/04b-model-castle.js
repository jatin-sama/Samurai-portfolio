/* Castle on the rock pillars (from the supplied Tripo model: blank deck/platform texture areas repainted, 2048px texture, 16-bit positions,
   8-bit normals, delta-coded indices, gzip; 16 MB -> 4.7 MB with the same triangles).
   window.__castle({scale,tint,lit,sil,lights}) -> Promise<Group|null>. The group's origin is the bottom-centre of the castle, 1 model unit = `scale` world units.
   group.userData.set(opacity) fades it (userData.mat = material). sil:{dark,rim,mist,rimK} = dark moonlit silhouette with a red rim and a mist-faded base; lights:true adds small warm window/lantern lights (userData.flick(t,k)). The file is fetched lazily (and prefetched when the connection allows). Returns null on any failure. */
(function(){
'use strict';
var T=window.THREE,job=null;
function src(){return (window.__JT_BIN&&window.__JT_BIN.castle)||'/data/castle.bin.gz'}
function decode(buf){
 var dv=new DataView(buf),hl=dv.getUint32(0,true),o=4,H=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,o,hl)));o+=hl;
 function sec(){var l=dv.getUint32(o,true);o+=4;var s=o;o+=l+((4-l%4)%4);return[s,l]}
 var p=sec(),u=sec(),n=sec(),i=sec(),j=sec(),m=H.m,pl=new Uint8Array(buf,i[0],m*4),idx=new Uint32Array(m),prev=0,k,z,d;
 for(k=0;k<m;k++){z=(pl[k]|(pl[m+k]<<8)|(pl[2*m+k]<<16)|(pl[3*m+k]<<24))>>>0;d=(z>>>1)^-(z&1);prev+=d;idx[k]=prev}
 return{n:H.n,m:m,min:H.min,size:H.size,pos:new Uint16Array(buf,p[0],p[1]/2),uv:new Uint16Array(buf,u[0],u[1]/2),nor:new Int8Array(buf,n[0],n[1]),idx:idx,jpg:new Uint8Array(buf,j[0],j[1])}}
function fetchData(){
 if(job)return job;
 job=fetch(src()).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer()}).then(function(ab){
  var b=new Uint8Array(ab);
  if(b[0]===0x1f&&b[1]===0x8b){if(typeof DecompressionStream==='undefined')throw new Error('no gunzip');return new Response(new Blob([ab]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()}
  return ab}).then(decode);
 job.catch(function(){job=null});
 return job}
window.__castleLoad=fetchData;
window.__castle=function(o){
 o=o||{};
 if(!T||(navigator.deviceMemory&&navigator.deviceMemory<=2))return Promise.resolve(null);
 return fetchData().then(function(C){
  return new Promise(function(res){
   var img=new Image(),url=URL.createObjectURL(new Blob([C.jpg],{type:'image/jpeg'}));
   img.onload=function(){URL.revokeObjectURL(url);
    try{
     var tx=new T.Texture(img);tx.flipY=false;tx.encoding=T.sRGBEncoding;tx.anisotropy=4;tx.needsUpdate=true;
     var g=new T.BufferGeometry();
     g.setAttribute('position',new T.BufferAttribute(C.pos,3,true));g.setAttribute('normal',new T.BufferAttribute(C.nor,3,true));g.setAttribute('uv',new T.BufferAttribute(C.uv,2,true));
     g.setIndex(new T.BufferAttribute(C.idx,1));
     var mat,sil=o.sil;
     if(sil){tx.encoding=T.LinearEncoding;
      mat=new T.ShaderMaterial({transparent:true,uniforms:{map:{value:tx},uDark:{value:new T.Color(sil.dark!=null?sil.dark:0x3a3c52)},uRim:{value:new T.Color(sil.rim!=null?sil.rim:0xff3a48)},uMist:{value:new T.Color(sil.mist!=null?sil.mist:0x24182a)},uOp:{value:0},uRimK:{value:sil.rimK!=null?sil.rimK:1.4},uFlash:{value:0}},
       vertexShader:'varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying float vH;void main(){vUv=uv;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);vH=position.y;gl_Position=projectionMatrix*mv;}',
       fragmentShader:'uniform sampler2D map;uniform vec3 uDark,uRim,uMist;uniform float uOp,uRimK,uFlash;varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying float vH;void main(){vec3 tx=texture2D(map,vUv).rgb;float fr=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.2);vec3 col=tx*uDark+uRim*fr*(uRimK+uFlash*1.6)+tx*uFlash*.22;col=mix(col,uMist,(1.-smoothstep(0.,.3,vH))*.88);gl_FragColor=vec4(col,uOp*smoothstep(0.,.1,vH));}'})}
     else{mat=o.lit?new T.MeshStandardMaterial({map:tx,roughness:.95,metalness:0,transparent:true}):new T.MeshBasicMaterial({map:tx,transparent:true,fog:false});if(o.tint!=null)mat.color.set(o.tint)}
     var m=new T.Mesh(g,mat);m.frustumCulled=false;
     m.scale.set(C.size[0],C.size[1],C.size[2]);m.position.set(-C.size[0]/2,0,-C.size[2]/2);/* positions are normalised 0..1 over the bbox: origin = bottom-centre */
     var grp=new T.Group();grp.add(m);grp.scale.setScalar(o.scale||1);grp.userData.mat=mat;grp.userData.size=C.size;
     grp.userData.set=function(v){if(mat.uniforms)mat.uniforms.uOp.value=v;else mat.opacity=v};
     grp.userData.flash=function(v){if(mat.uniforms)mat.uniforms.uFlash.value=v};
     if(o.lights){/* warm lights on the platforms, bridges, keep and shrines (model coordinates -> group space) */
      var L=[[-.012,.5,.3],[-.018,.6,.2],[-.257,.418,.35],[-.316,.494,.2],[.339,.482,.35],[-.023,.441,.3],[-.152,.04,.42],[.023,.11,.4],[.129,.225,.4],[.292,.54,.2],[.2,.43,.3],[-.1,.43,.3]],
       a=new Float32Array(L.length*3),cx=C.min[0]+C.size[0]/2,cz=C.min[2]+C.size[2]/2;
      L.forEach(function(p,i){a[i*3]=p[0]-cx;a[i*3+1]=p[1]-C.min[1];a[i*3+2]=p[2]-cz});
      var lg=new T.BufferGeometry();lg.setAttribute('position',new T.BufferAttribute(a,3));
      var lm=new T.PointsMaterial({size:o.lightSize||3.2,sizeAttenuation:false,color:0xffa65a,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false}),lp=new T.Points(lg,lm);lp.frustumCulled=false;grp.add(lp);
      grp.userData.flick=function(t,k){lm.opacity=k*(.72+.2*Math.sin(t*3.1)+.08*Math.sin(t*11.3))}}
     res(grp)}catch(e){res(null)}};
   img.onerror=function(){res(null)};img.src=url})
 }).catch(function(){return null})};
/* warm the cache a little after the home page is up, only on a decent connection */
try{var cn=navigator.connection;if(!(cn&&(cn.saveData||/2g/.test(cn.effectiveType||''))))setTimeout(function(){fetchData().catch(function(){})},9000)}catch(e){}
})();
