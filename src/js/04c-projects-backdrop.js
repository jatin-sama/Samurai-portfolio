/* Projects backdrop: layered mountain ridges (far / mid / near, with pines and a moon-lit crest), drifting mist bands, distant village lights and a
   few crows crossing the moon. Everything is camera-relative (it rides with the camera like the moon does) and is procedural (no files).
   window.__projBackdrop(THREE,{glow}) -> {group, update(t,k,rv,flash)}   k = 0..1 ridge visibility, rv = 0..1 castle reveal, flash = lightning 0..1.
   The castle (04b) is added into `group` at 135 units; the layers are sorted by distance on purpose (moon 170, far ridge 155, castle 135, mist 128,
   crows 122, mid ridge 112, village lights 100, near ridge 80) so nothing here needs renderOrder. */
(function(){
'use strict';
function rng(seed){var s=seed>>>0||1;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function ridgeCanvas(o){
 var W=2048,H=384,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d'),r=rng(o.seed),i;
 var N=256,h=new Float32Array(N+1);h[0]=r();h[N]=r();var st=N,amp=.55;
 while(st>1){var half=st/2;for(i=half;i<N;i+=st)h[i]=(h[i-half]+h[i+half])/2+(r()-.5)*amp;st=half;amp*=(o.rough||.55)}
 var mn=1e9,mx=-1e9;for(i=0;i<=N;i++){if(h[i]<mn)mn=h[i];if(h[i]>mx)mx=h[i]}
 function prof(i){var u=i/N,v=(h[i]-mn)/(mx-mn),d=(u-.5)/(o.dipW||.17),mask=1-o.dip*Math.exp(-d*d);return(.16+.84*v)*mask}
 function Y(i){return H-prof(i)*o.hmax*H-H*.02}
 var col=o.col,g=x.createLinearGradient(0,H*(1-o.hmax),0,H);g.addColorStop(0,'rgba('+col+',1)');g.addColorStop(.62,'rgba('+col+',1)');g.addColorStop(1,'rgba('+col+',0)');
 x.fillStyle=g;x.beginPath();x.moveTo(0,H);for(i=0;i<=N;i++)x.lineTo(i/N*W,Y(i));x.lineTo(W,H);x.closePath();x.fill();
 x.fillStyle='rgba('+col+',1)';
 for(var k=0;k<(o.pines||0);k++){var u=r(),ii=Math.round(u*N);if(Math.abs(u-.5)<(o.pineGap||.12))continue;
  var px=u*W,py=Y(ii)+H*.01,ph=H*(.05+r()*.08),pw=ph*.32;
  for(var t=0;t<3;t++){var yy=py-ph*(t*.28),ww=pw*(1-t*.22),hh=ph*.42;x.beginPath();x.moveTo(px-ww,yy);x.lineTo(px,yy-hh);x.lineTo(px+ww,yy);x.closePath();x.fill()}
  x.fillRect(px-1.2,py-1,2.4,H*.012)}
 if(o.rim){x.strokeStyle=o.rim;x.lineWidth=2.2;x.beginPath();for(i=0;i<=N;i++){var X=i/N*W,Yv=Y(i);if(i)x.lineTo(X,Yv);else x.moveTo(X,Yv)}x.stroke()}
 return c}
function birdCanvas(){var c=document.createElement('canvas');c.width=64;c.height=32;var x=c.getContext('2d');x.fillStyle='#000';
 x.beginPath();x.moveTo(2,10);x.quadraticCurveTo(18,0,32,18);x.quadraticCurveTo(46,0,62,10);x.quadraticCurveTo(46,12,32,25);x.quadraticCurveTo(18,12,2,10);x.fill();return c}
var LAYERS=[
 {D:155,h:30,seed:11,col:'38,20,34',rim:'rgba(255,80,90,.38)',hmax:.86,pines:0,dip:.8},
 {D:112,h:21,seed:23,col:'22,13,25',rim:'rgba(255,60,70,.2)',hmax:.82,pines:36,dip:.86},
 {D:80,h:14,seed:37,col:'10,8,15',rim:null,hmax:.78,pines:90,dip:.9}];
window.__projBackdrop=function(T,o){
 var G=new T.Group(),gt=o.glow,rl=[],mist=[],i;
 LAYERS.forEach(function(l){var tx=new T.CanvasTexture(ridgeCanvas(l));tx.minFilter=T.LinearFilter;tx.generateMipmaps=false;
  var m=new T.Mesh(new T.PlaneGeometry(l.D*3.4,l.h),new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,fog:false,opacity:0}));
  m.position.set(0,-3.2+l.h/2,-l.D);G.add(m);rl.push(m)});
 [[128,34,1.4,.30,0x6a5878],[98,28,.5,.28,0x5a4a6a],[68,22,-.1,.26,0x4a3c5a]].forEach(function(q){
  var s=new T.Sprite(new T.SpriteMaterial({map:gt,color:q[4],transparent:true,depthWrite:false,opacity:0,fog:false}));
  s.scale.set(q[0]*2.4,q[1],1);s.position.set(0,q[2],-q[0]);s.userData={a:q[3],ph:Math.random()*6,b:0};G.add(s);mist.push(s)});
 /* village / lantern lights at the foot of the hills */
 var NV=44,va=new Float32Array(NV*3),r=rng(5);
 for(i=0;i<NV;i++){var cl=r()<.5?(r()-.5)*40:(r()-.5)*190;va[i*3]=cl;va[i*3+1]=-.8+r()*1.9;va[i*3+2]=-100+r()*8}
 var vg=new T.BufferGeometry();vg.setAttribute('position',new T.BufferAttribute(va,3));
 var vm=new T.PointsMaterial({size:2.6,sizeAttenuation:false,color:0xffb070,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false}),vp=new T.Points(vg,vm);vp.frustumCulled=false;G.add(vp);
 /* crows */
 var bt=new T.CanvasTexture(birdCanvas()),birds=[];
 for(i=0;i<6;i++){var b=new T.Sprite(new T.SpriteMaterial({map:bt,color:0x000000,transparent:true,depthWrite:false,opacity:0,fog:false}));b.userData={o:i*27+r()*10,ph:r()*6.28,s:3.8+r()*1.6,y:13+r()*8};G.add(b);birds.push(b)}
 return{group:G,update:function(t,k,rv,flash){
  for(var j=0;j<rl.length;j++)rl[j].material.opacity=k;
  for(j=0;j<mist.length;j++){var s=mist[j],u=s.userData;s.position.x=Math.sin(t*.05+u.ph)*6;s.material.opacity=u.a*(.35+.65*k)}
  vm.opacity=k*(.55+.2*Math.sin(t*2.3)+.1*Math.sin(t*7.1))*(.5+.5*rv);
  for(j=0;j<birds.length;j++){var q=birds[j],d=q.userData,x=-95+((t*4.2+d.o)%190);q.position.set(x,d.y+Math.sin(t*.6+d.ph)*2.2,-122);
   var f=.35+.65*Math.abs(Math.sin(t*5.5+d.ph));q.scale.set(d.s,d.s*.5*f+.25,1);q.material.opacity=.92*rv}
 }}};
})();
