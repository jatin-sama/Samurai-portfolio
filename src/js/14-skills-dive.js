
/* Skills descent v2: scroll drops the camera through the floors of a ruined castle tower.
   One floor per discipline, each floor has a broken hole you fall through; skills are carved plaques lying on the planks.
   (liquid title adapted from the supplied hero, unchanged) */
(function(){
var T=window.THREE,panel=document.getElementById('skills'),cv=document.getElementById('sk3'),track=panel.querySelector('.sk3-track');
document.getElementById('skgo').onclick=function(){window.Slash?Slash(function(){location.hash='experience'}):location.hash='experience'};
document.getElementById('sk3skip').onclick=function(){panel.scrollTo({top:track.offsetHeight,behavior:'smooth'})};
if(!T||!cv){panel.classList.add('nogl');return}
var G=[].map.call(document.querySelectorAll('#groups .grp'),function(g){return{g:g.querySelector('h3').textContent,it:[].map.call(g.querySelectorAll('.sk'),function(b){return{n:b.querySelector('.nm').textContent,l:b.querySelectorAll('.lv i.on').length}})}});
var INK='#efe6d6',RED='#e0343f',SERIF='"Cormorant Garamond","Hoefler Text",Georgia,serif',SANS='Jost,Arial,sans-serif',reduce=(window.__RM===true);
var FH=16,HALF=11,HY=3.4,P0=.07,PE=.84,S=G.length+1,BASE=G.length+1;
var r,sc,cam,hero,hm,lamp,fl,pl,dust,embers,deb,ready=false,building=false,on=false,running=false,raf=0,t0=0,p=0,tp=0,mx=0,my=0,tx=0,ty=0,ox=.5,oy=.5,sv=new T.Vector2(),pv=new T.Vector2();
var samG=null,samIn=null,samRL=null,lastNow=0,pPrev=0,fxS=0,HH=8.5,tau=.3,oz=1,portrait=null,plq=[],titles=[],sway=[],woodT,woodB,woodStd,darkWood,freshWood,hangWood,plugs=[],ex0=null,dec0=null,crk0=null,burst=null,hx=[],hz=[],dj=.7,dum,dp=[];
var M=document.getElementById('sk3m'),B=document.getElementById('sk3b'),GL=document.getElementById('sk3g'),H=document.getElementById('sk3h').parentNode;
for(var fi=0;fi<=BASE;fi++){hx[fi]=0;hz[fi]=0}
function tex(w,h,fn){var c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),c);var t=new T.CanvasTexture(c);t.anisotropy=4;return t}
function ss(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
function ls(c,v){try{c.letterSpacing=v}catch(e){}}
function cl(v,a,b){return Math.max(a,Math.min(b,v))}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rrect(c,x,y,w,h,rad){c.beginPath();c.moveTo(x+rad,y);c.arcTo(x+w,y,x+w,y+h,rad);c.arcTo(x+w,y+h,x,y+h,rad);c.arcTo(x,y+h,x,y,rad);c.arcTo(x,y,x+w,y,rad);c.closePath()}
function glowTex(stops){return tex(128,128,function(c){var g=c.createRadialGradient(64,64,0,64,64,64);stops.forEach(function(s){g.addColorStop(s[0],s[1])});c.fillStyle=g;c.fillRect(0,0,128,128)})}
function std(o){return new T.MeshStandardMaterial(o)}

/* ---------- textures ---------- */
function woodTex(){var R=rng(7);return tex(1024,1024,function(c){
 for(var i=0;i<16;i++){var y=i*64,l=8+R()*7,hu=26+R()*8;c.fillStyle='hsl('+hu+','+(24+R()*10)+'%,'+l+'%)';c.fillRect(0,y,1024,64);
  for(var k=0;k<48;k++){var lt=R()>.5;c.strokeStyle=lt?'rgba(210,160,110,'+(.03+R()*.05)+')':'rgba(0,0,0,'+(.06+R()*.14)+')';c.lineWidth=.6+R()*1.6;c.beginPath();var yy=y+3+R()*58,ph=R()*6;c.moveTo(0,yy);for(var x=0;x<=1024;x+=64)c.lineTo(x,yy+Math.sin(x*.012+ph)*(1+R()*1.5));c.stroke()}
  var g=c.createLinearGradient(0,y,0,y+64);g.addColorStop(0,'rgba(0,0,0,.28)');g.addColorStop(.12,'rgba(0,0,0,0)');g.addColorStop(.88,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.34)');c.fillStyle=g;c.fillRect(0,y,1024,64);
  c.fillStyle='#050302';c.fillRect(0,y,1024,3);var jx=80+R()*860;c.fillRect(jx,y,3,64);
  c.fillStyle='rgba(0,0,0,.55)';[jx-12,jx+15].forEach(function(nx){c.beginPath();c.arc(nx,y+12,2.6,0,6.3);c.arc(nx,y+52,2.6,0,6.3);c.fill()})}
 for(var s2=0;s2<22;s2++){c.fillStyle='rgba(0,0,0,'+(.05+R()*.09)+')';c.beginPath();c.ellipse(R()*1024,R()*1024,30+R()*90,10+R()*28,R()*3,0,6.3);c.fill()}
 for(var kn=0;kn<7;kn++){var kx=R()*1024,ky=R()*1024;c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1.6;for(var rr=2;rr<10;rr+=2.5){c.beginPath();c.ellipse(kx,ky,rr*2.2,rr*.9,0,0,6.3);c.stroke()}}})}
function woodBump(){var R=rng(11);return tex(512,512,function(c){c.fillStyle='#808080';c.fillRect(0,0,512,512);
 for(var i=0;i<16;i++){var y=i*32,l=118+R()*20;c.fillStyle='rgb('+l+','+l+','+l+')';c.fillRect(0,y+2,512,30);
  for(var k=0;k<10;k++){c.strokeStyle='rgba(0,0,0,'+(.05+R()*.08)+')';c.lineWidth=1;c.beginPath();var yy=y+3+R()*26;c.moveTo(0,yy);c.lineTo(512,yy+R()*3-1.5);c.stroke()}
  c.fillStyle='#000';c.fillRect(0,y,512,2)}})}
function wallTex(){return tex(1024,604,function(c){
 c.fillStyle='#0d0807';c.fillRect(0,0,1024,604);
 var g=c.createRadialGradient(512,300,20,512,300,420);g.addColorStop(0,'rgba(255,160,70,.3)');g.addColorStop(1,'rgba(255,160,70,0)');c.fillStyle=g;c.fillRect(0,0,1024,604);
 c.fillStyle='#4a1017';c.fillRect(0,0,56,604);c.fillRect(968,0,56,604);
 c.fillStyle='#d9a441';c.fillRect(54,0,3,604);c.fillRect(967,0,3,604);
 var wg=c.createLinearGradient(0,110,0,490);wg.addColorStop(0,'#c99a5e');wg.addColorStop(1,'#7a5230');c.fillStyle=wg;c.globalAlpha=.6;c.fillRect(160,110,704,380);c.globalAlpha=1;
 c.fillStyle='rgba(20,10,6,.35)';c.beginPath();c.moveTo(560,110);c.lineTo(620,300);c.lineTo(600,490);c.lineTo(640,490);c.lineTo(690,300);c.lineTo(640,110);c.fill();
 c.strokeStyle='#150b07';c.lineWidth=7;for(var i=0;i<=8;i++){c.beginPath();c.moveTo(160+i*88,110);c.lineTo(160+i*88,490);c.stroke()}for(var j=0;j<=4;j++){c.beginPath();c.moveTo(160,110+j*95);c.lineTo(864,110+j*95);c.stroke()}
 c.lineWidth=16;c.strokeStyle='#22130d';c.strokeRect(160,110,704,380);
 c.fillStyle='#3d0d13';c.fillRect(0,0,1024,40);c.fillRect(0,560,1024,44);c.fillStyle='rgba(217,164,65,.7)';c.fillRect(0,38,1024,3);c.fillRect(0,558,1024,3)})}
function stoneTex(){var R=rng(3);return tex(512,512,function(c){c.fillStyle='#0c0e12';c.fillRect(0,0,512,512);
 for(var y=0;y<8;y++)for(var x=0;x<8;x++){var l=9+R()*8;c.fillStyle='hsl(220,10%,'+l+'%)';c.fillRect(x*64+2,y*64+2,60,60)}
 c.strokeStyle='rgba(0,0,0,.6)';for(var k=0;k<16;k++){c.lineWidth=1+R()*2;c.beginPath();var sx=R()*512,sy=R()*512;c.moveTo(sx,sy);for(var q=0;q<5;q++){sx+=(R()-.5)*70;sy+=(R()-.5)*70;c.lineTo(sx,sy)}c.stroke()}})}
function sealTex(){return tex(1024,1024,function(c){var g=c.createRadialGradient(512,512,0,512,512,500);g.addColorStop(0,'rgba(224,52,63,.4)');g.addColorStop(1,'rgba(224,52,63,0)');c.fillStyle=g;c.fillRect(0,0,1024,1024);
 c.strokeStyle='rgba(224,52,63,.9)';[460,400,300].forEach(function(rd,i){c.lineWidth=i?4:8;c.beginPath();c.arc(512,512,rd,0,6.3);c.stroke()});
 c.lineWidth=3;for(var i=0;i<12;i++){var a=i*Math.PI/6;c.beginPath();c.moveTo(512+Math.cos(a)*300,512+Math.sin(a)*300);c.lineTo(512+Math.cos(a)*400,512+Math.sin(a)*400);c.stroke()}
 c.beginPath();for(var k=0;k<8;k++){var b=k*3*Math.PI/4;c.lineTo(512+Math.cos(b)*290,512+Math.sin(b)*290)}c.closePath();c.stroke();
 c.beginPath();c.arc(512,512,80,0,6.3);c.stroke()})}
function titleTex(name,sub,acc){return tex(2048,340,function(c){c.textAlign='center';c.textBaseline='middle';var fs=230;c.font='600 '+fs+'px '+SERIF;while(c.measureText(name).width>1880&&fs>80){fs-=10;c.font='600 '+fs+'px '+SERIF}
 c.shadowColor=acc?acc+'8c':'rgba(224,52,63,.55)';c.shadowBlur=36;c.fillStyle=INK;c.fillText(name,1024,125);c.shadowColor='rgba(0,0,0,.9)';c.shadowBlur=14;c.fillText(name,1024,125);c.shadowBlur=0;c.fillStyle=acc||RED;c.font='400 58px '+SANS;ls(c,'14px');c.fillText(sub,1024,284);c.fillRect(824,234,400,3)})}
function plaqueTex(s,th){return tex(1024,353,function(c){
 var g=c.createLinearGradient(0,0,0,353);g.addColorStop(0,'#2a1812');g.addColorStop(1,'#0e0707');c.fillStyle=g;rrect(c,6,6,1012,341,26);c.fill();
 c.globalAlpha=.18;for(var k=0;k<22;k++){c.strokeStyle=k%2?'#000':'#a8703c';c.lineWidth=1;c.beginPath();var yy=14+k*15;c.moveTo(12,yy);c.lineTo(1012,yy+Math.sin(k)*5);c.stroke()}c.globalAlpha=1;
 c.strokeStyle=s.l===5?(th&&th.acc||'#e0343f'):(th&&th.bor||'#8f1c26');c.lineWidth=7;rrect(c,16,16,992,321,20);c.stroke();
 c.strokeStyle='rgba(217,164,65,.5)';c.lineWidth=2;rrect(c,34,34,956,285,12);c.stroke();
 c.fillStyle='#d9a441';[[40,40],[984,40],[40,313],[984,313]].forEach(function(n){c.beginPath();c.arc(n[0],n[1],6,0,6.3);c.fill()});
 c.textAlign='center';c.textBaseline='middle';var fs=150,two=null,F=function(){c.font='600 '+fs+'px '+SERIF};F();
 while(c.measureText(s.n).width>820&&fs>104){fs-=8;F()}
 if(c.measureText(s.n).width>820){var wd=s.n.split(' '),best=null,bd=1e9,q;for(q=1;q<wd.length;q++){var a1=wd.slice(0,q).join(' '),b1=wd.slice(q).join(' '),d1=Math.abs(c.measureText(a1).width-c.measureText(b1).width);if(d1<bd){bd=d1;best=[a1,b1]}}
  two=best||[s.n];fs=104;F();while(fs>44&&two.some(function(l){return c.measureText(l).width>820})){fs-=4;F()}}
 var hasL=s.l>0,cy=hasL?138:176;c.fillStyle=s.l===5?(th&&th.acc||RED):INK;c.shadowColor='rgba(0,0,0,.8)';c.shadowBlur=8;
 if(two){c.fillText(two[0],512,cy-fs*.52);c.fillText(two[1]||'',512,cy+fs*.52)}else c.fillText(s.n,512,cy);c.shadowBlur=0;
 for(var j=0;hasL&&j<5;j++){c.save();c.translate(512+(j-2)*52,282);c.rotate(Math.PI/4);if(j<s.l){c.fillStyle=th&&th.acc||RED;c.fillRect(-10,-10,20,20)}else{c.strokeStyle='rgba(239,230,214,.45)';c.lineWidth=3;c.strokeRect(-10,-10,20,20)}c.restore()}})}
function paperTex(c1,c2){return tex(128,256,function(c){var g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,c1||'#a8360f');g.addColorStop(.5,c2||'#ffb35a');g.addColorStop(1,c1||'#a8360f');c.fillStyle=g;c.fillRect(0,0,128,256);
 c.strokeStyle='rgba(70,18,6,.7)';c.lineWidth=3;for(var y=14;y<256;y+=22){c.beginPath();c.moveTo(0,y);c.lineTo(128,y);c.stroke()}c.fillStyle='rgba(60,10,4,.55)';c.fillRect(0,0,128,26);c.fillRect(0,230,128,26)})}
function bannerTex(base,trim){return tex(256,1024,function(c){c.fillStyle=base||'#7a1520';c.fillRect(0,0,256,1024);var g=c.createLinearGradient(0,0,256,0);g.addColorStop(0,'rgba(0,0,0,.45)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');c.fillStyle=g;c.fillRect(0,0,256,1024);
 c.strokeStyle=trim||'#d9a441';c.lineWidth=6;c.strokeRect(14,14,228,996);c.lineWidth=2;c.strokeRect(26,26,204,972);
 c.strokeStyle='#efe6d6';c.lineWidth=7;c.beginPath();c.arc(128,330,70,0,6.3);c.stroke();c.fillStyle='#efe6d6';for(var i=0;i<3;i++){var a=i*2.094-1.57;c.beginPath();c.arc(128+Math.cos(a)*34,330+Math.sin(a)*34,20,0,6.3);c.fill()}
 c.fillStyle='rgba(239,230,214,.85)';for(var k=0;k<5;k++)c.fillRect(100,520+k*70,56,10);
 c.fillStyle='#1b0508';c.beginPath();c.moveTo(0,1024);c.lineTo(32,990);c.lineTo(64,1024);c.lineTo(96,990);c.lineTo(128,1024);c.lineTo(160,990);c.lineTo(192,1024);c.lineTo(224,990);c.lineTo(256,1024);c.fill()})}
function scrollTex(){var R=rng(61);return tex(256,768,function(c){c.fillStyle='#d9ccb0';c.fillRect(0,0,256,768);c.fillStyle='#7a1f26';c.fillRect(0,0,256,70);c.fillRect(0,698,256,70);c.fillStyle='#c9b998';c.fillRect(0,70,256,628);
 c.strokeStyle='rgba(25,18,14,.85)';c.lineCap='round';for(var i=0;i<4;i++){c.lineWidth=5+R()*14;c.beginPath();var x=60+R()*140,y=110+i*30;c.moveTo(x,y);c.bezierCurveTo(x+R()*80-40,y+120,x+R()*80-40,y+260,x+R()*60-30,y+460);c.stroke()}
 c.fillStyle='rgba(25,18,14,.75)';for(var k=0;k<7;k++){c.beginPath();c.ellipse(70+R()*120,170+k*70+R()*20,8+R()*14,3+R()*5,R()*3,0,6.3);c.fill()}
 c.fillStyle='#b3202c';c.fillRect(176,610,34,34);c.fillStyle='#d9ccb0';c.fillRect(184,618,8,18)})}
function sealBeamTex(){return tex(64,256,function(c){var h=c.createLinearGradient(0,0,64,0);h.addColorStop(0,'rgba(255,50,60,0)');h.addColorStop(.5,'rgba(255,75,85,1)');h.addColorStop(1,'rgba(255,50,60,0)');c.fillStyle=h;c.fillRect(0,0,64,256);
 c.globalCompositeOperation='destination-in';var v=c.createLinearGradient(0,0,0,256);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.5,'rgba(0,0,0,.28)');v.addColorStop(.85,'rgba(0,0,0,.75)');v.addColorStop(1,'rgba(0,0,0,1)');c.fillStyle=v;c.fillRect(0,0,64,256)})}
function sealRingTex(){return tex(512,512,function(c){var g=c.createRadialGradient(256,256,0,256,256,256);g.addColorStop(0,'rgba(255,60,70,0)');g.addColorStop(.8,'rgba(255,60,70,0)');g.addColorStop(.895,'rgba(255,70,80,.85)');g.addColorStop(.93,'rgba(255,60,70,.25)');g.addColorStop(1,'rgba(255,60,70,0)');c.fillStyle=g;c.fillRect(0,0,512,512)})}
function decalTex(){var R=rng(21);return tex(512,512,function(c){var g=c.createRadialGradient(256,256,0,256,256,256);g.addColorStop(0,'rgba(0,0,0,.9)');g.addColorStop(.42,'rgba(0,0,0,.62)');g.addColorStop(.62,'rgba(0,0,0,.22)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,512,512);
 c.lineCap='round';for(var i=0;i<14;i++){var a=R()*6.283,rd=96+R()*70,x=256+Math.cos(a)*rd,y=256+Math.sin(a)*rd,len=26+R()*70,dir=Math.cos(a)>0?1:-1;c.strokeStyle='rgba(0,0,0,'+(.45+R()*.3)+')';c.lineWidth=1+R()*1.4;c.beginPath();c.moveTo(x,y);c.lineTo(x+dir*len*.5,y+(R()-.5)*3);c.lineTo(x+dir*len,y+(R()-.5)*5);c.stroke()}})}
function crackTex(){var R=rng(33);return tex(512,512,function(c){c.lineCap='round';c.lineJoin='round';
 function bolt(x,y,a,len,w,depth){var pts=[[x,y]],i,n=Math.max(3,Math.round(len/22));for(i=0;i<n;i++){a+=(R()-.5)*.55;x+=Math.cos(a)*len/n;y+=Math.sin(a)*len/n;pts.push([x,y]);if(depth<2&&R()>.62)bolt(x,y,a+(R()>.5?1:-1)*(.5+R()*.6),len*.45,w*.6,depth+1)}
  [['rgba(210,170,120,.22)',w+2.2],['rgba(0,0,0,.92)',w]].forEach(function(st){c.strokeStyle=st[0];c.lineWidth=st[1];c.beginPath();pts.forEach(function(q,j){j?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])});c.stroke()})}
 for(var i=0;i<11;i++)bolt(256,256,i/11*6.283+R()*.4,150+R()*100,2.4,0)})}

/* ---------- models ---------- */
function mkToro(){var g=new T.Group(),st=std({color:0x4a4e57,roughness:.95,metalness:0}),fire=new T.MeshBasicMaterial({color:0xffb560});
 function add(geo,m,y){var o=new T.Mesh(geo,m);o.position.y=y;g.add(o);return o}
 add(new T.CylinderGeometry(.55,.68,.26,6),st,.13);add(new T.CylinderGeometry(.17,.21,1.05,8),st,.78);add(new T.CylinderGeometry(.52,.4,.2,6),st,1.4);
 add(new T.BoxGeometry(.5,.5,.5),fire,1.75);var rf=add(new T.ConeGeometry(.8,.5,4),st,2.25);rf.rotation.y=Math.PI/4;add(new T.SphereGeometry(.11,10,8),st,2.58);
 var s=new T.Sprite(new T.SpriteMaterial({map:glowTex([[0,'rgba(255,210,140,.95)'],[.35,'rgba(255,150,60,.4)'],[1,'rgba(255,120,40,0)']]),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,opacity:.7}));s.scale.set(5.5,5.5,1);s.position.y=1.8;g.add(s);return g}
function mkLantern(ph,th){var g=new T.Group(),bk=mkLantern.bk||(mkLantern.bk=std({color:0x15100d,roughness:.7})),pm=th._pm||(th._pm=new T.MeshBasicMaterial({map:paperTex(th.p1,th.p2),side:T.DoubleSide}));
 var cord=new T.Mesh(new T.CylinderGeometry(.015,.015,2.4,4),bk);cord.position.y=1.2;g.add(cord);
 g.add(new T.Mesh(new T.CylinderGeometry(.46,.46,1.1,18,1,true),pm));
 [.56,-.56].forEach(function(y){var cap=new T.Mesh(new T.CylinderGeometry(.34,.34,.1,14),bk);cap.position.y=y;g.add(cap)});
 var tz=new T.Mesh(new T.CylinderGeometry(.01,.03,.5,4),new T.MeshBasicMaterial({color:0xc0242e}));tz.position.y=-.9;g.add(tz);
 var s=new T.Sprite(th._sp||(th._sp=new T.SpriteMaterial({map:glowTex(th.glow),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,opacity:.6})));s.scale.set(4.2,4.2,1);g.add(s);
 var root=new T.Group();g.position.y=-2.4;root.add(g);sway.push({o:root,a:'z',ph:ph,k:.06});return root}
function mkBanner(face,ph,th){var piv=new T.Group();piv.rotation.order='YXZ';piv.rotation.y=face;
 var m=new T.Mesh(new T.PlaneGeometry(1.7,7),th._bm||(th._bm=new T.MeshBasicMaterial({map:bannerTex(th.ban,th.trim),side:T.DoubleSide})));m.position.y=-3.5;piv.add(m);
 var rod=new T.Mesh(new T.CylinderGeometry(.07,.07,2,6),darkWood);rod.rotation.z=Math.PI/2;piv.add(rod);sway.push({o:piv,a:'x',ph:ph,k:.05});return piv}
var THEME=[],anim=[],fx=null,lastBump=0,sealFx=null;
var CYCLE=[
 {kind:'study',fog:0x05070b,lamp:0xffd2a0,wall:[1,1,1],acc:'#e0343f',bor:'#8f1c26',wood:0xffffff,emi:null,ban:'#7a1520',trim:'#d9a441',p1:'#a8360f',p2:'#ffb35a',glow:[[0,'rgba(255,200,120,.9)'],[.35,'rgba(255,150,60,.35)'],[1,'rgba(255,120,40,0)']]},
 {kind:'forge',fog:0x05070b,lamp:0xffd2a0,wall:[1,1,1],acc:'#e0343f',bor:'#8f1c26',wood:0xffffff,emi:null,ban:'#7a1520',trim:'#d9a441',p1:'#a8360f',p2:'#ffb35a',glow:[[0,'rgba(255,170,90,.9)'],[.35,'rgba(255,110,40,.4)'],[1,'rgba(255,90,30,0)']]},
 {kind:'spirit',fog:0x05070b,lamp:0xffd2a0,wall:[1,1,1],acc:'#e0343f',bor:'#8f1c26',wood:0xffffff,emi:null,ban:'#7a1520',trim:'#d9a441',p1:'#a8360f',p2:'#ffb35a',glow:[[0,'rgba(150,230,255,.95)'],[.35,'rgba(80,190,255,.4)'],[1,'rgba(60,160,255,0)']]}];
function initThemes(){var hall={kind:'hall',fog:0x05070b,lamp:0xffd2a0,wall:[1,1,1],acc:'#e0343f',bor:'#8f1c26',ban:'#7a1520',trim:'#d9a441',p1:'#a8360f',p2:'#ffb35a',glow:CYCLE[0].glow},
  base={kind:'base',fog:0x07070c,lamp:0xffc8b0,wall:[1,.8,.82],acc:'#e0343f',bor:'#8f1c26',ban:'#7a1520',trim:'#d9a441',p1:'#a8360f',p2:'#ffb35a',glow:CYCLE[0].glow},f;
 THEME=[hall];for(f=1;f<=G.length;f++)THEME.push(CYCLE[(f-1)%3]);THEME.push(base);
 THEME.forEach(function(t){t.fogC=new T.Color(t.fog);t.lampC=new T.Color(t.lamp)})}
function floorMat(f){return woodStd}
var tfog=null,tlamp=null;
function themeFx(u){var n=Math.round(u),w=ss(-.08,.08,u-n),A=THEME[cl(n,0,BASE)],B=THEME[cl(n+1,0,BASE)];
 if(!tfog){tfog=new T.Color();tlamp=new T.Color()}tfog.copy(A.fogC).lerp(B.fogC,w);tlamp.copy(A.lampC).lerp(B.lampC,w);sc.fog.color.copy(tfog);r.setClearColor(tfog,1);lamp.color.copy(tlamp);return w>.5?cl(n+1,0,BASE):cl(n,0,BASE)}
/* rising specks (forge sparks, spirit motes) */
function risePts(g,N,r0,r1,H,color,size,v0,v1,seed){var q=rng(seed),a=new Float32Array(N*3),d=[],i;
 for(i=0;i<N;i++){var an=q()*6.283,rd=r0+q()*(r1-r0);d.push({x:Math.cos(an)*rd,z:Math.sin(an)*rd,y:q()*H,v:v0+q()*(v1-v0),ph:q()*6.28})}
 var geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(a,3));
 var pt=new T.Points(geo,new T.PointsMaterial({map:glowTex([[0,'rgba(255,255,255,1)'],[.45,'rgba(255,255,255,.5)'],[1,'rgba(255,255,255,0)']]),color:color,size:size,transparent:true,opacity:.9,depthWrite:false,blending:T.AdditiveBlending}));pt.frustumCulled=false;g.add(pt);
 anim.push(function(t){for(var i=0;i<N;i++){var e=d[i];a[i*3]=e.x+Math.sin(t*.6+e.ph)*.35;a[i*3+1]=(e.y+t*e.v)%H;a[i*3+2]=e.z+Math.cos(t*.5+e.ph)*.35}geo.attributes.position.needsUpdate=true})}
function gearGeo(R,n){var sh=new T.Shape(),ri=R*.8,i,w=6.2832/n;
 for(i=0;i<n;i++){var a=i*w;[[-.3,ri],[-.15,R],[.15,R],[.3,ri]].forEach(function(o,j){var an=a+o[0]*w,x=Math.cos(an)*o[1],y=Math.sin(an)*o[1];(i||j)?sh.lineTo(x,y):sh.moveTo(x,y)})}
 var h=new T.Path();h.absarc(0,0,R*.2,0,6.2832,true);sh.holes.push(h);
 for(i=0;i<5;i++){var hp=new T.Path(),an=i/5*6.2832;hp.absarc(Math.cos(an)*R*.52,Math.sin(an)*R*.52,R*.12,0,6.2832,true);sh.holes.push(hp)}
 var g=new T.ExtrudeGeometry(sh,{depth:.4,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:1,curveSegments:8});g.translate(0,0,-.2);return g}
function propsStudy(f,th){var g=new T.Group(),q=rng(900+f),ceil=FH-.8,i;g.position.y=-f*FH;sc.add(g);
 var sm=new T.MeshBasicMaterial({map:scrollTex(),side:T.DoubleSide}),rod=std({color:0x2a1a10,roughness:.7});
 [[-6.4,-4.2],[6.4,-4.6],[-6.9,3.6],[6.9,3.2],[-3.8,-8.4],[3.8,-8.6]].forEach(function(pz,k){var len=3.4+q()*1.6,pv=new T.Group();pv.position.set(pz[0],ceil,pz[1]);pv.rotation.order='YXZ';pv.rotation.y=Math.atan2(-pz[0],-pz[1]);
  var cd=new T.Mesh(new T.CylinderGeometry(.012,.012,.7,4),rod);cd.position.y=-.35;pv.add(cd);
  var sc2=new T.Mesh(new T.PlaneGeometry(1.05,len),sm);sc2.position.y=-.7-len/2;pv.add(sc2);
  [-.7,-.7-len].forEach(function(y){var rr=new T.Mesh(new T.CylinderGeometry(.045,.045,1.25,8),rod);rr.rotation.z=Math.PI/2;rr.position.y=y;pv.add(rr)});
  g.add(pv);sway.push({o:pv,a:'x',ph:k*1.3,k:.04})});
 var N=26,ps=new T.InstancedMesh(new T.PlaneGeometry(.34,.46),new T.MeshBasicMaterial({color:0xe9dcc2,side:T.DoubleSide,transparent:true,opacity:.85}),N),dm=new T.Object3D(),pd=[];
 for(i=0;i<N;i++){var h=1+q()*13;pd.push({a:q()*6.28,r:h<8?6.6+q()*2.6:3.2+q()*5.5,h:h,w:.15+q()*.25,ph:q()*6.28,sp:.2+q()*.35})}
 ps.frustumCulled=false;g.add(ps);
 anim.push(function(t){for(var i=0;i<N;i++){var d=pd[i];dm.position.set(Math.cos(d.a+t*d.w)*d.r,d.h+Math.sin(t*d.sp+d.ph)*.7,Math.sin(d.a+t*d.w)*d.r);dm.rotation.set(t*d.sp*2+d.ph,t*d.sp*1.6,d.ph);dm.scale.set(1,1,1);dm.updateMatrix();ps.setMatrixAt(i,dm.matrix)}ps.instanceMatrix.needsUpdate=true})}
function propsForge(f,th){var g=new T.Group(),q=rng(950+f),i;g.position.y=-f*FH;sc.add(g);
 var iron=std({color:0x3b3633,metalness:.6,roughness:.5,emissive:0x1d0a03}),gl=new T.SpriteMaterial({map:glowTex(th.glow),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,opacity:.4}),gears=[];
 [[1,-3.5,5,3.2,14,1],[1,1.3,5,2,9,-1],[1,-6.5,11.5,2.2,10,1],[-1,3.6,5.5,3,13,-1],[-1,-1.4,5.5,1.9,8,1],[-1,6.5,11.5,2.2,10,-1]].forEach(function(o,k){
  var pv=new T.Group();pv.position.set(o[0]*10.3,o[2],o[1]);pv.rotation.y=-o[0]*Math.PI/2;var m=new T.Mesh(gearGeo(o[3],o[4]),iron);pv.add(m);
  var s2=new T.Sprite(gl);s2.scale.set(o[3]*3.2,o[3]*3.2,1);s2.position.z=.5;pv.add(s2);g.add(pv);gears.push({m:m,R:o[3],d:o[5],ph:q()*6})});
 anim.push(function(t){for(var i=0;i<gears.length;i++){var e=gears[i];e.m.rotation.z=e.d*(e.ph+(t*.18+p*28)*(3.2/e.R))}});
 var lk=new T.TorusGeometry(.13,.035,6,10);
 [[-5.5,-6.5],[5.5,-6.5],[-5.5,6.5],[5.5,6.5]].forEach(function(pz,k){var ch=new T.Group();ch.position.set(pz[0],FH-.8,pz[1]);for(var j=0;j<14;j++){var l=new T.Mesh(lk,iron);l.position.y=-.12-j*.2;l.rotation.y=j%2?Math.PI/2:0;ch.add(l)}g.add(ch);sway.push({o:ch,a:'z',ph:k*1.7,k:.035})});
 risePts(g,80,6.8,10,FH-1,0xff8a3d,.26,.5,1.5,970+f)}
function propsSpirit(f,th){var g=new T.Group(),q=rng(990+f),i;g.position.y=-f*FH;sc.add(g);
 var core=new T.SphereGeometry(.16,10,8),cm=new T.MeshBasicMaterial({color:0xdaf6ff}),gm=new T.SpriteMaterial({map:glowTex(th.glow),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,opacity:.75}),orbs=[];
 for(i=0;i<14;i++){var hi=i%5<3,o=new T.Group();o.add(new T.Mesh(core,cm));var s2=new T.Sprite(gm);s2.scale.set(3.2,3.2,1);o.add(s2);g.add(o);orbs.push({o:o,a:q()*6.28,r:hi?3.4+q()*5:7+q()*1.8,h:hi?9+q()*4:4.5+q()*3,w:(.08+q()*.14)*(q()>.5?1:-1),ph:q()*6.28})}
 anim.push(function(t){for(var i=0;i<orbs.length;i++){var e=orbs[i];e.o.position.set(Math.cos(e.a+t*e.w)*e.r,e.h+Math.sin(t*.8+e.ph)*.6,Math.sin(e.a+t*e.w)*e.r)}});
 var rm=new T.MeshBasicMaterial({color:0x6fdcff,transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false}),rings=[];
 [[8.2,4.5,.3,.12,5.2],[5.6,11,-.35,-.17,4.2],[7,13.5,.5,.1,5.6]].forEach(function(o){var m=new T.Mesh(new T.TorusGeometry(o[0],.035,6,96,o[4]),rm);m.position.y=o[1];m.rotation.x=Math.PI/2+o[2];g.add(m);rings.push({m:m,s:o[3],b:o[2]})});
 anim.push(function(t){for(var i=0;i<rings.length;i++){var e=rings[i];e.m.rotation.z=t*e.s;e.m.rotation.x=Math.PI/2+e.b+Math.sin(t*.3+i)*.06}});
 risePts(g,90,3.5,9.5,FH-1,0x8fe3ff,.2,.25,.7,1010+f)}
function mkProps(f){var th=THEME[f];if(th.kind==='study')propsStudy(f,th);else if(th.kind==='forge')propsForge(f,th);else if(th.kind==='spirit')propsSpirit(f,th)}
var PW=11/16;
function holeOutline(f,R){var q=rng(100+f*13),nb=Math.max(2,Math.round(R*(.95+q()*.2)/PW)),nt=Math.max(2,Math.round(R*(.95+q()*.2)/PW)),rows=[],pts=[],sL=(q()-.5)*.5,sR=(q()-.5)*.5,k;
 for(k=-nb;k<nt;k++){var yb=k*PW,yc=yb+PW/2,u=Math.abs(yc)/(R*1.12),hw=R*Math.sqrt(Math.max(.1,1-u*u));
  rows.push({yb:yb,yt:yb+PW,yc:yc,xr:Math.max(.6,hw*(.82+q()*.42)+sR),xl:-Math.max(.6,hw*(.82+q()*.42)-sL),sr:(q()-.5)*1.0,sl:(q()-.5)*1.0,jr:(q()-.5)*.3,jl:(q()-.5)*.3})}
 rows.forEach(function(o){pts.push(new T.Vector2(o.xr+o.sr*.5,o.yb),new T.Vector2(o.xr+o.jr,o.yc),new T.Vector2(o.xr-o.sr*.5,o.yt))});
 for(k=rows.length-1;k>=0;k--){var o=rows[k];pts.push(new T.Vector2(o.xl-o.sl*.5,o.yt),new T.Vector2(o.xl+o.jl,o.yc),new T.Vector2(o.xl+o.sl*.5,o.yb))}
 return{pts:pts,rows:rows}}
function mkFloor(f,R){var g=new T.Group(),q=rng(50+f),D=.8,k;g.position.set(0,-f*FH,0);
 var o=holeOutline(f,R),pts=o.pts,rows=o.rows,h=HALF+.4,sh=new T.Shape();
 sh.moveTo(-h,-h);sh.lineTo(h,-h);sh.lineTo(h,h);sh.lineTo(-h,h);sh.lineTo(-h,-h);sh.holes.push(new T.Path(pts));
 var geo=new T.ExtrudeGeometry(sh,{depth:D,bevelEnabled:false,steps:1,curveSegments:1});geo.rotateX(-Math.PI/2);geo.translate(0,-D,0);
 g.add(new T.Mesh(geo,[floorMat(f),freshWood]));
 /* contact shadow hugging the exact outline of the hole */
 var os=new T.Shape();for(k=0;k<32;k++){var a=k/32*6.2832,px=Math.cos(a)*5.4,py=Math.sin(a)*5.4;k?os.lineTo(px,py):os.moveTo(px,py)}os.holes.push(new T.Path(pts));
 var dg=new T.ShapeGeometry(os),pa=dg.attributes.position,ua=dg.attributes.uv;for(k=0;k<pa.count;k++)ua.setXY(k,pa.getX(k)/10.8+.5,pa.getY(k)/10.8+.5);dg.rotateX(-Math.PI/2);dg.translate(0,.012,0);
 var dm=new T.MeshBasicMaterial({map:buildFloors.dt||(buildFloors.dt=decalTex()),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});g.add(new T.Mesh(dg,dm));
 /* hanging boards and joist stubs (kept clear of the flight path) */
 var ex=new T.Group(),ends=[];g.add(ex);
 rows.forEach(function(rw){ends.push({x:rw.xr,y:rw.yc,d:-1},{x:rw.xl,y:rw.yc,d:1})});
 var cand=ends.filter(function(e){return Math.abs(e.x)>=1.6}),pick=0;
 while(pick<3&&cand.length){var e=cand.splice(Math.floor(q()*cand.length),1)[0],tilt=.55+q()*.6,len=Math.min(1.5,(Math.abs(e.x)-1.05)/Math.max(.35,Math.cos(tilt)));if(len<.5)continue;
  var pv=new T.Group();pv.position.set(e.x,-.2,-e.y);pv.rotation.z=-e.d*tilt;
  var bd=new T.Mesh(new T.BoxGeometry(len,.11,PW*.86),hangWood);bd.position.x=e.d*len/2;pv.add(bd);
  var cp=new T.Mesh(new T.BoxGeometry(.1,.115,PW*.86),freshWood);cp.position.x=e.d*len;pv.add(cp);ex.add(pv);pick++}
 [[1,1],[-1,-1]].forEach(function(st){var sx=st[0],zz=st[1]*.9,rw=rows.filter(function(r){return -zz>=r.yb&&-zz<r.yt})[0];if(!rw)return;var xe=sx>0?rw.xr:-rw.xl,len=Math.min(1.1,xe-1.05);if(len<.4)return;
  var j=new T.Mesh(new T.BoxGeometry(len+.1,.4,.45),darkWood);j.position.set(sx*(xe-len/2+.05),-D-.2,zz);ex.add(j);
  var cp=new T.Mesh(new T.BoxGeometry(.07,.42,.47),freshWood);cp.position.set(sx*(xe-len),-D-.2,zz);ex.add(cp)});
 if(f===0){
  /* the hall floor starts whole: board-shaped plugs fill the hole, cracks spread, then it gives way on scroll */
  ex.visible=false;ex0=ex;dm.opacity=0;dec0=dm;plugs=[];
  rows.forEach(function(rw){var ps=new T.Shape();ps.moveTo(rw.xl+rw.sl*.5,rw.yb);ps.lineTo(rw.xr+rw.sr*.5,rw.yb);ps.lineTo(rw.xr+rw.jr,rw.yc);ps.lineTo(rw.xr-rw.sr*.5,rw.yt);ps.lineTo(rw.xl-rw.sl*.5,rw.yt);ps.lineTo(rw.xl+rw.jl,rw.yc);
   var pg=new T.ExtrudeGeometry(ps,{depth:D,bevelEnabled:false,steps:1,curveSegments:1});pg.rotateX(-Math.PI/2);pg.translate(0,-D,0);var cx=(rw.xl+rw.xr)/2,cz=-rw.yc;pg.translate(-cx,0,-cz);
   var pm=new T.Mesh(pg,[woodStd,freshWood]);pm.position.set(cx,0,cz);g.add(pm);plugs.push({m:pm,cx:cx,cz:cz,d:q()*.35,rx:q()-.5,rz:q()-.5,dx:q()-.5})});
  var cm=new T.MeshBasicMaterial({map:crackTex(),transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),ck=new T.Mesh(new T.PlaneGeometry(9,9),cm);ck.rotation.x=-Math.PI/2;ck.position.y=.016;g.add(ck);crk0=cm;
  var nb=110,ba=new Float32Array(nb*3),vel=[],i;for(i=0;i<nb;i++){ba[i*3]=(q()*2-1)*R*.8;ba[i*3+1]=0;ba[i*3+2]=(q()*2-1)*R*.8;vel.push([(q()-.5)*5,1.5+q()*4.5,(q()-.5)*5])}
  var bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(ba,3));var bm=new T.PointsMaterial({map:buildFloors.dp||(buildFloors.dp=glowTex([[0,'rgba(255,255,255,1)'],[.5,'rgba(255,255,255,.45)'],[1,'rgba(255,255,255,0)']])),color:0xc9b79a,size:.6,transparent:true,opacity:0,depthWrite:false}),bp=new T.Points(bg,bm);bp.frustumCulled=false;g.add(bp);
  burst={a:ba,o:ba.slice(),v:vel,g:bg,m:bm,n:nb}}
 return g}
function mkBase(){var g=new T.Group(),y=-BASE*FH,q=rng(77);g.position.set(0,y+.04,0);
 var st=stoneTex();st.wrapS=st.wrapT=T.RepeatWrapping;st.repeat.set(3,3);
 var f=new T.Mesh(new T.PlaneGeometry(HALF*2,HALF*2),std({map:st,roughness:.9,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2}));f.rotation.x=-Math.PI/2;g.add(f);
 var se=new T.Mesh(new T.PlaneGeometry(14,14),new T.MeshBasicMaterial({map:sealTex(),transparent:true,depthWrite:false,blending:T.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));se.rotation.x=-Math.PI/2;se.position.y=.03;g.add(se);
 var rg=new T.Mesh(new T.PlaneGeometry(14,14),new T.MeshBasicMaterial({map:sealRingTex(),transparent:true,depthWrite:false,blending:T.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));rg.rotation.x=-Math.PI/2;rg.position.y=.045;g.add(rg);
 var bg=new T.Group(),bt=sealBeamTex(),bgeo=new T.PlaneGeometry(1,1),bmats=[0,1,2].map(function(){return new T.MeshBasicMaterial({map:bt,transparent:true,opacity:.34,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false})}),bn=30,bk;
 for(bk=0;bk<bn;bk++){var ba=bk/bn*6.2832,bh=5+q()*6.5,bw=.55+q()*.35,b1=new T.Mesh(bgeo,bmats[bk%3]),b2=new T.Mesh(bgeo,bmats[bk%3]);b1.scale.set(bw,bh,1);b2.scale.set(bw,bh,1);b2.rotation.y=Math.PI/2;b1.position.set(Math.cos(ba)*6.27,bh/2+.05,Math.sin(ba)*6.27);b2.position.copy(b1.position);bg.add(b1);bg.add(b2)}
 g.add(bg);sealFx={g:bg,m:bmats,r:rg.material};
 var tl=new T.Mesh(new T.PlaneGeometry(13,2.15),new T.MeshBasicMaterial({map:titleTex('The Foundation','ALL DISCIPLINES · ONE STACK'),transparent:true,depthWrite:false}));tl.rotation.x=-Math.PI/2;tl.position.set(0,.05,-5.5);g.add(tl);
 var plank=new T.BoxGeometry(1.1,.1,.26),i;
 for(i=0;i<26;i++){var a=q()*6.28,rd=1.6+q()*3.6,m=new T.Mesh(plank,darkWood);m.position.set(hx[G.length]+Math.cos(a)*rd,.08+q()*.18,hz[G.length]+Math.sin(a)*rd);m.rotation.set((q()-.5)*.5,q()*3.14,(q()-.5)*.5);m.scale.set(.6+q()*1.1,1,.8+q()*.8);g.add(m)}
 [[-6.6,-3],[6.6,-3]].forEach(function(p){var t=mkToro();t.position.set(p[0],0,p[1]);g.add(t)});
 return g}
function loadSamurai(){
 samRL=new T.PointLight(0xff2a3a,1.2,12,1);samRL.position.set(0,1.1,.8);samG.add(samRL);
 var gs=new T.Sprite(new T.SpriteMaterial({map:glowTex([[0,'rgba(255,70,80,.55)'],[.5,'rgba(224,52,63,.18)'],[1,'rgba(224,52,63,0)']]),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,opacity:.55}));gs.scale.set(7,7,1);gs.position.set(0,1.7,-.4);samG.add(gs);
 var sh=new T.Mesh(new T.CircleGeometry(.8,28),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.65,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));sh.rotation.x=-Math.PI/2;sh.position.y=.06;samG.add(sh);
 if(!window.__loadSamurai)return;
 try{window.__loadSamurai(r,function(m){var bx=new T.Box3().setFromObject(m),sz=bx.getSize(new T.Vector3()),c=bx.getCenter(new T.Vector3()),S=3.3/sz.y;
   m.scale.setScalar(S);m.position.set(-c.x*S,-bx.min.y*S,-c.z*S);m.material.emissive=new T.Color(0x2a1214);m.material.emissiveIntensity=.55;
   samIn=new T.Group();samIn.add(m);samIn.rotation.y=0;samG.add(samIn)},function(e){try{console.warn('[skills] samurai GLB failed',e&&e.message||e)}catch(x){}})}catch(e){}}
function buildFloors(port){
 if(fl){sc.remove(fl);fl.traverse(function(o){if(o.geometry)o.geometry.dispose()})}
 plugs=[];ex0=dec0=crk0=burst=null;fl=new T.Group();var R=port==='p'?1.3:port==='m'?1.9:2.5;for(var f=0;f<=G.length;f++)fl.add(mkFloor(f,R));fl.add(mkBase());sc.add(fl);portrait=port}
function mkShell(){var top=FH*.9,bot=-BASE*FH,wt=wallTex();wt.wrapS=wt.wrapT=T.RepeatWrapping;wt.repeat.set(1,(top-bot)/FH);
 var wgeo=new T.BoxGeometry(HALF*2,top-bot,HALF*2,1,60,1),wp=wgeo.attributes.position,wc=new Float32Array(wp.count*3),i;
 for(i=0;i<wp.count;i++){var cc=-(wp.getY(i)+(top+bot)/2)/FH,w=THEME[cl(Math.ceil(cc-.001),0,BASE)].wall;wc[i*3]=w[0];wc[i*3+1]=w[1];wc[i*3+2]=w[2]}
 wgeo.setAttribute('color',new T.BufferAttribute(wc,3));
 var wm=new T.MeshBasicMaterial({map:wt,side:T.BackSide,vertexColors:true}),hid=new T.MeshBasicMaterial({visible:false}),wall=new T.Mesh(wgeo,[wm,wm,hid,hid,wm,wm]);wall.position.y=(top+bot)/2;sc.add(wall);
 var lac=std({color:0x5a1118,roughness:.38,metalness:.1}),gold=std({color:0xc99a3e,roughness:.45,metalness:.35}),pgeo=new T.BoxGeometry(1.2,top-bot,1.2),cg=new T.BoxGeometry(1.5,.28,1.5),c=HALF-.6,k,f;
 [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(s){var pl2=new T.Mesh(pgeo,lac);pl2.position.set(s[0]*c,(top+bot)/2,s[1]*c);sc.add(pl2);
  for(f=0;f<=BASE;f++)[.9,-1.1].forEach(function(dy){var cc=new T.Mesh(cg,gold);cc.position.set(s[0]*c,-f*FH+dy,s[1]*c);sc.add(cc)})});
 /* joists, hanging lanterns and banners under every slab (themed by the room below); stone lanterns flank the hall */
 var jx=new T.BoxGeometry(HALF*2,.5,.55),jz=new T.BoxGeometry(.55,.5,HALF*2),ph=0;
 for(f=0;f<=G.length;f++){var th=THEME[Math.min(BASE,f+1)],y=-f*FH-.8,d=new T.Group();d.position.y=y;
  [-8.2,-5.4,5.4,8.2].forEach(function(z){var j=new T.Mesh(jx,darkWood);j.position.set(0,-.25,z);d.add(j)});
  [-8.2,-5.4,5.4,8.2].forEach(function(x){var j=new T.Mesh(jz,darkWood);j.position.set(x,-.55,0);d.add(j)});
  [[-8.4,-8.4],[8.4,-8.4],[8.4,8.4],[-8.4,8.4]].forEach(function(s){var l=mkLantern(ph++,th);l.position.set(s[0],-.55,s[1]);d.add(l)});
  [[0,-10.2,0],[0,10.2,Math.PI],[10.2,0,-Math.PI/2],[-10.2,0,Math.PI/2]].forEach(function(b){var bn=mkBanner(b[2],ph++,th);bn.position.set(b[0],-.55,b[1]);d.add(bn)});
  sc.add(d)}
 [-6.8,6.8].forEach(function(x){var t=mkToro();t.position.set(x,0,-1.8);sc.add(t)});
 for(f=1;f<=G.length;f++)mkProps(f)}

/* ---------- scene ---------- */
function build(){
 try{r=new T.WebGLRenderer({canvas:cv,antialias:true})}catch(e){panel.classList.add('nogl');return false}
 try{
 var nv=typeof navigator!=='undefined'?navigator:{},LOW=(nv.deviceMemory&&nv.deviceMemory<=4)||(nv.hardwareConcurrency&&nv.hardwareConcurrency<=4)||/Mobi|Android/i.test(nv.userAgent||'');r.setPixelRatio(Math.min(devicePixelRatio,LOW?1.5:2));r.setClearColor(0x05070b,1);
 sc=new T.Scene();sc.fog=new T.Fog(0x05070b,10,40);cam=new T.PerspectiveCamera(50,1,.1,200);cam.rotation.order='YXZ';cam.position.set(0,HY,8);
 var ht=tex(2048,1024,function(c){c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.font='500 640px '+SERIF;ls(c,'-10px');c.fillText('Skills',1024,600);c.font='300 64px '+SANS;ls(c,'26px');c.fillText('The Disciplines',1024,150)});
 hm=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{tex:{value:ht},uM:{value:new T.Vector2(.5,.5)},uV:{value:new T.Vector2()},uT:{value:0},uP:{value:0},uR:{value:0},uFade:{value:1},uInk:{value:new T.Color(0xefe6d6)},uHot:{value:new T.Color(0xe0343f)},uCool:{value:new T.Color(0x8a93a3)}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform sampler2D tex;uniform vec2 uM,uV;uniform float uT,uP,uR,uFade;uniform vec3 uInk,uHot,uCool;varying vec2 vUv;'+
 'void main(){vec2 uv=vUv;vec2 d=uv-uM;d.x*=2.;float rr=length(d)+.0001;float f=exp(-rr*rr*28.);'+
 'uv-=uV*f*.55;uv+=d/rr*sin(rr*38.-uT*5.)*f*.012;uv.y+=sin(uv.x*12.+uT*1.4)*.003*(1.+uP*40.);'+
 'float q=1.-uR;uv.x+=q*q*sin(uv.y*18.+uT*2.)*.25;uv.y+=q*q*q*.4;'+
 'vec2 o=normalize(uV+vec2(.0001,.0))*(.004+length(uV)*.35*f)+vec2(.003,0.);'+
 'vec3 a=vec3(texture2D(tex,uv+o).a,texture2D(tex,uv).a,texture2D(tex,uv-o).a);'+
 'float al=max(max(a.r,a.g),a.b);vec3 col=(uInk*a.g+uHot*max(a.r-a.g,0.)+uCool*max(a.b-a.g,0.))/max(al,.001);'+
 'gl_FragColor=vec4(col,al*uFade*smoothstep(0.,.5,uR));}'});
 hero=new T.Mesh(new T.PlaneGeometry(1,.5),hm);hero.position.set(0,HY,0);sc.add(hero);
 woodT=woodTex();woodT.wrapS=woodT.wrapT=T.RepeatWrapping;woodT.repeat.set(1/11,1/11);
 woodB=woodBump();woodB.wrapS=woodB.wrapT=T.RepeatWrapping;woodB.repeat.set(1/11,1/11);
 woodStd=std({map:woodT,bumpMap:woodB,bumpScale:.7,roughness:.86,metalness:0});darkWood=std({color:0x2a1a10,roughness:.9});freshWood=std({color:0x5a4430,roughness:.94});hangWood=std({color:0x3a2818,roughness:.92});
 initThemes();mkShell();buildFloors('w');samG=new T.Group();samG.position.set(0,-BASE*FH+.04,0);sc.add(samG);loadSamurai();
 /* lights: dim ambient, cold moon from above (grazes the plank relief), warm lantern travelling with the camera */
 sc.add(new T.AmbientLight(0x2c2a36,.8));sc.add(new T.HemisphereLight(0x7088c0,0x3a1010,.35));
 var moon=new T.DirectionalLight(0x9fb2ff,.7);moon.position.set(7,14,5);sc.add(moon);
 lamp=new T.PointLight(0xffd2a0,1.35,32,1);sc.add(lamp);
 /* dust, embers, falling debris */
 var dot=glowTex([[0,'rgba(255,255,255,1)'],[.4,'rgba(255,255,255,.4)'],[1,'rgba(255,255,255,0)']]),n=700,pa=new Float32Array(n*3),i;
 for(i=0;i<n;i++){pa[i*3]=(Math.random()*2-1)*(HALF-1);pa[i*3+1]=FH*.8-Math.random()*(FH*(BASE+1.8));pa[i*3+2]=(Math.random()*2-1)*(HALF-1)}
 var pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));dust=new T.Points(pg,new T.PointsMaterial({map:dot,color:0xefe6d6,size:.24,transparent:true,opacity:.5,depthWrite:false,blending:T.AdditiveBlending}));sc.add(dust);
 var ne=170,ea=new Float32Array(ne*3);for(i=0;i<ne;i++){ea[i*3]=(Math.random()*2-1)*(HALF-2);ea[i*3+1]=-BASE*FH+Math.random()*9;ea[i*3+2]=(Math.random()*2-1)*(HALF-2)}
 var eg=new T.BufferGeometry();eg.setAttribute('position',new T.BufferAttribute(ea,3));embers=new T.Points(eg,new T.PointsMaterial({map:dot,color:0xff5a3c,size:.4,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending}));sc.add(embers);
 var DN=9,dq=rng(5);deb=new T.InstancedMesh(new T.BoxGeometry(.5,.05,.16),darkWood,DN);dum=new T.Object3D();
 for(i=0;i<DN;i++)dp.push({o:dq()*FH*(BASE+1),v:.9+dq()*.9,a:(dq()-.5)*1.4,b:(dq()-.5)*1.4,rx:dq()*6,rz:dq()*6,s:.6+dq()*.45,an:dq()*6.28,rd:.8+dq()*.5});
 sc.add(deb);
 /* plaques and floor titles */
 pl=new T.Group();sc.add(pl);
 G.forEach(function(gr,gi){var f=gi+1;
  var t=new T.Mesh(new T.PlaneGeometry(13,2.15),new T.MeshBasicMaterial({map:titleTex(gr.g,'FLOOR '+(gi<9?'0':'')+f+'  ·  '+gr.it.length+' SKILLS',THEME[f].acc),transparent:true,depthWrite:false}));t.rotation.x=-Math.PI/2;pl.add(t);titles.push({m:t,f:f});
  gr.it.forEach(function(s,i){var top=new T.MeshBasicMaterial({map:plaqueTex(s,THEME[f]),transparent:true}),side=std({color:0x1c110c,roughness:.8,transparent:true});
   var m=new T.Mesh(new T.BoxGeometry(2.9,.16,1),[side,side,top,side,side,side]);m.rotation.y=Math.sin(f*7+i*2.3)*.04;pl.add(m);plq.push({m:m,f:f,i:i,rows:Math.ceil(gr.it.length/2),top:top,side:side})})});
 var vg=document.createElement('div');vg.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:1;background:linear-gradient(to top,rgba(2,3,6,.88) 0,rgba(2,3,6,0) 26%),radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 48%,rgba(2,3,6,.6) 100%)';cv.parentNode.appendChild(vg);initFx();mkSoundBtn();
 }catch(err){try{console.error('[skills]',err)}catch(e){}panel.classList.add('nogl');return false}
 document.getElementById('sk3h').textContent='Move your cursor through the title, then scroll to fall through the castle.';
 track.style.height=(S*150+320)+'vh';
 return true}

function layout(a){
 HH=a>=1.25?8.5:8.5+Math.min(3.5,(1.25-a)*9);tau=a<.9?.2:.3;oz=a<.9?.5:1;dj=a<.9?.62:a<1.5?.8:1;
 var hh=HH*.466*a,cx=cl(hh*.7,2.2,5),sp=cl(cx/5,.5,1),tsc=cl(hh/5.5,.5,1),gap=1.1*sp+.1,zc=-1.45*cl(HH/8.5,1,1.4);
 plq.forEach(function(q){var side=q.i%2?1:-1,row=Math.floor(q.i/2),z0=zc-(q.rows-1)/2*gap;q.m.scale.set(sp,sp,sp);q.by=-q.f*FH+.08*sp;q.m.position.set(hx[q.f]+side*cx,q.by,hz[q.f]+z0+row*gap)});
 titles.forEach(function(t){t.m.scale.set(tsc,tsc,1);t.by=-t.f*FH+.05;t.m.position.set(hx[t.f],t.by,hz[t.f]-5.5*cl(HH/8.5,1,1.3))})}
function rs(){if(!r)return;var w=cv.parentNode.clientWidth,h=cv.parentNode.clientHeight;if(!w||!h)return;r.setSize(w,h,false);if(fx){var pr=r.getPixelRatio();fx.rt.setSize(Math.max(2,Math.floor(w*pr)),Math.max(2,Math.floor(h*pr)));fx.qm.uniforms.uA.value=w/h}cam.aspect=w/h;cam.updateProjectionMatrix();
 var vh=2*8*Math.tan(25*Math.PI/180),vw=vh*cam.aspect,W=Math.min(vw*.96,vh*1.7);hero.scale.set(W,W,1);
 var port=cam.aspect<.9?'p':cam.aspect<1.5?'m':'w';if(port!==portrait)buildFloors(port);layout(cam.aspect)}
function sp(){var m=track.offsetHeight-panel.clientHeight;tp=m>0?Math.min(1,Math.max(0,panel.scrollTop/m)):0}
panel.addEventListener('scroll',sp,{passive:true});addEventListener('resize',function(){rs();sp()});
panel.addEventListener('pointermove',function(e){var b=cv.getBoundingClientRect(),nx=(e.clientX-b.left)/b.width,ny=1-(e.clientY-b.top)/b.height;tx=nx-.5;ty=.5-ny;pv.x+=(nx-ox)*2.2;pv.y+=(ny-oy)*2.2;ox=nx;oy=ny});
/* ---------- speed effects: radial blur, colour split and streaks, only while moving fast or crossing a hole ---------- */
function initFx(){try{var Rt=(r.capabilities&&r.capabilities.isWebGL2&&T.WebGLMultisampleRenderTarget)?T.WebGLMultisampleRenderTarget:T.WebGLRenderTarget;
 var qm=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tD:{value:null},uS:{value:0},uP:{value:0},uA:{value:1},uT:{value:0}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:'uniform sampler2D tD;uniform float uS,uP,uA,uT;varying vec2 vUv;float hh(float n){return fract(sin(n*91.345)*47453.5453);}'+
 'void main(){vec2 uv=vUv,d=uv-.5;vec2 da=vec2(d.x*uA,d.y);float rr=length(da);float k=uS*.07+uP*.05;vec3 acc=vec3(0.);'+
 'for(int i=0;i<8;i++){float f=float(i)/7.;acc+=texture2D(tD,uv-d*k*f).rgb;}acc/=8.;'+
 'vec2 off=d*(uS*.014+uP*.03);acc.r=mix(acc.r,texture2D(tD,uv+off).r,.65);acc.b=mix(acc.b,texture2D(tD,uv-off).b,.65);'+
 'float ang=atan(da.y,da.x);float on=step(.82,hh(floor(ang*46.)+floor(uT*18.)));float st=on*smoothstep(.28,.8,rr)*(uS*.55+uP*.3);'+
 'acc+=vec3(.78,.84,1.)*st*.22;acc*=1.-smoothstep(.35,.95,rr)*(uS*.45+uP*.2);acc+=vec3(1.,.93,.85)*uP*.07*(1.-rr);gl_FragColor=vec4(acc,1.);}'});
 fx={rt:new Rt(8,8,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat}),qc:new T.OrthographicCamera(-1,1,1,-1,0,1),qs:new T.Scene(),qm:qm};
 fx.qs.add(new T.Mesh(new T.PlaneGeometry(2,2),qm))}catch(e){fx=null}}
function renderFrame(e,pun,t){if(fx&&!reduce&&(e>.02||pun>.03)){var u=fx.qm.uniforms;u.tD.value=fx.rt.texture;u.uS.value=e;u.uP.value=pun;u.uT.value=t;r.setRenderTarget(fx.rt);r.render(sc,cam);r.setRenderTarget(null);r.render(fx.qs,fx.qc)}else r.render(sc,cam)}

/* ---------- sound: everything is synthesised, no audio files ---------- */
var AU={ctx:null,on:false,ok:!!(window.AudioContext||window.webkitAudioContext),k:null,th:-1,b:[0,0,0,0,0],land:0,amb:0};
function auOn(){return AU.on&&AU.ctx&&AU.ctx.state==='running'}
function auInit(){if(AU.ctx||!AU.ok)return;var C=window.AudioContext||window.webkitAudioContext,c=new C(),i;AU.ctx=c;
 AU.m=c.createGain();AU.m.gain.value=0;AU.m.connect(c.destination);
 var len=c.sampleRate*2,nb=c.createBuffer(1,len,c.sampleRate),d=nb.getChannelData(0);for(i=0;i<len;i++)d[i]=Math.random()*2-1;AU.nb=nb;
 var il=Math.floor(c.sampleRate*1.8),ib=c.createBuffer(2,il,c.sampleRate),ch;for(ch=0;ch<2;ch++){var id=ib.getChannelData(ch);for(i=0;i<il;i++)id[i]=(Math.random()*2-1)*Math.pow(1-i/il,2.6)}
 var cv2=c.createConvolver();cv2.buffer=ib;AU.rv=c.createGain();AU.rv.gain.value=.4;AU.rv.connect(cv2);cv2.connect(AU.m);
 AU.bus=c.createGain();AU.bus.connect(AU.m);AU.bus.connect(AU.rv);
 var ws=c.createBufferSource();ws.buffer=nb;ws.loop=true;AU.wf=c.createBiquadFilter();AU.wf.type='bandpass';AU.wf.frequency.value=380;AU.wf.Q.value=.8;AU.wg=c.createGain();AU.wg.gain.value=0;ws.connect(AU.wf);AU.wf.connect(AU.wg);AU.wg.connect(AU.m);ws.start();
 if(!AU.site){var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=170;var dg=c.createGain();dg.gain.value=.06;AU.osc=[];
 [[55,'sawtooth',.4],[55.35,'sawtooth',.4],[82.4,'sine',.35]].forEach(function(o){var os=c.createOscillator();os.type=o[1];os.frequency.value=o[0];var g=c.createGain();g.gain.value=o[2];os.connect(g);g.connect(lp);os.start();AU.osc.push(os)});
 lp.connect(dg);dg.connect(AU.m)}}
function nz(dur,type,f0,f1,gain,delay,q){var c=AU.ctx,t=c.currentTime+(delay||0),s=c.createBufferSource();s.buffer=AU.nb;s.loop=true;var f=c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);if(q)f.Q.value=q;
 var g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+Math.min(.02,dur*.2));g.gain.exponentialRampToValueAtTime(.0008,t+dur);s.connect(f);f.connect(g);g.connect(AU.bus);s.start(t,Math.random()*1.5);s.stop(t+dur+.05)}
function tn(type,f0,f1,gain,dur,delay){var c=AU.ctx,t=c.currentTime+(delay||0),o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
 var g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.01);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(AU.bus);o.start(t);o.stop(t+dur+.05)}
function sfxCrack(big){nz(.05,'highpass',2600,5200,.35,0);nz(.07,'highpass',1800,4000,.3,.05);tn('sine',110,40,.5,.25,0);
 if(big){nz(1.1,'lowpass',900,120,.6,0);tn('sine',70,28,.8,.9,0);nz(.4,'bandpass',3000,800,.3,.1,1.2)}}
function sfxWhoosh(i){nz(.4,'bandpass',300,2600,.4*i,0,.9);nz(.55,'bandpass',2600,350,.3*i,.3,.9);tn('sine',90,45,.25*i,.5,.05)}
function sfxKnock(n){for(var i=0;i<Math.min(n,5);i++){tn('sine',210-i*8,90,.18,.09,i*.07);nz(.03,'lowpass',1800,600,.12,i*.07)}}
function sfxBell(f,g){tn('sine',f,f*.99,g,2.2);tn('sine',f*2.01,f*2,g*.4,1.4);tn('sine',f*3.97,f*3.9,g*.16,.8)}
function sfxClank(){nz(.12,'bandpass',2200,900,.18,0,6);tn('triangle',420,380,.05,.35);nz(.35,'highpass',4500,6000,.05,.04)}
function sfxPing(f){tn('sine',f,f,.045,1.2);tn('sine',f*1.5,f*1.5,.02,1.6,.08)}
function sfxLand(){tn('sine',60,30,.9,1.4);nz(1,'lowpass',500,80,.5,0);[784,1175,1568].forEach(function(f,i){tn('sine',f,f,.04,2,.25+i*.18)})}
function sfxAmb(kind){var P=[392,440,523.3,587.3,659.3,784],V=[1046.5,1318.5,1568,2093];if(kind==='study')sfxBell(P[Math.floor(Math.random()*P.length)],.05);else if(kind==='forge')sfxClank();else if(kind==='spirit')sfxPing(V[Math.floor(Math.random()*V.length)]);else sfxBell(Math.random()>.5?196:147,.06)}
function auFrame(t,fps,thi,cc,bk,cr){var c=AU.ctx,k=Math.floor(cc),pl=AU.on&&c.state==='running',cross=AU.k!==null&&k!==AU.k&&p>.14;AU.k=k;if(!pl)return;var now=c.currentTime,B;
 AU.wg.gain.setTargetAtTime(.012+fxS*.42,now,.1);AU.wf.frequency.setTargetAtTime(320+fxS*1900,now,.12);
 if(AU.osc&&thi!==AU.th){AU.th=thi;var roots=[[55,55.35,82.4],[49,49.3,73.4],[65.4,65.8,98]],kd=THEME[thi].kind,rr=roots[kd==='forge'?1:kd==='spirit'?2:0];AU.osc.forEach(function(o,i){o.frequency.setTargetAtTime(rr[i],now,1.2)})}
 if(p<.02)AU.b=[0,0,0,0,0];B=AU.b;
 if(!B[0]&&cr>.2){B[0]=1;sfxCrack(false)}if(!B[1]&&cr>.6){B[1]=1;sfxCrack(false)}if(!B[2]&&bk>.04){B[2]=1;sfxCrack(true)}
 if(!B[3]&&bk>.45){B[3]=1;nz(.9,'bandpass',1800,200,.35,0,.7)}if(!B[4]&&bk>.8){B[4]=1;tn('sine',60,28,.6,.9,.15)}
 if(cross&&fps>.12)sfxWhoosh(cl(fps/2.2,.3,1));
 if(p>PE&&!AU.land){AU.land=1;sfxLand()}else if(p<PE-.03)AU.land=0;
 if(!AU.site&&t>AU.amb&&p>.06){AU.amb=t+2.4+Math.random()*3.6;sfxAmb(THEME[thi].kind)}}
function auSync(){if(!AU.site)return;var sb=document.getElementById('snd'),want=!!sb&&sb.getAttribute('aria-pressed')==='true';if(want===AU.on)return;AU.on=want;
 if(want){auInit();if(AU.ctx){try{AU.ctx.resume()}catch(e){}AU.m.gain.setTargetAtTime(.85,AU.ctx.currentTime,.2)}}else if(AU.ctx)AU.m.gain.setTargetAtTime(0,AU.ctx.currentTime,.12)}
function mkSoundBtn(){if(!AU.ok)return;if(document.getElementById('snd')){AU.site=true;return}var b=document.createElement('button');b.type='button';b.id='sk3snd';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Toggle sound');b.textContent='♪  Sound off';
 b.style.cssText='position:absolute;z-index:3;top:calc(env(safe-area-inset-top,0px) + 14px);right:calc(env(safe-area-inset-right,0px) + 14px);min-height:40px;padding:.55rem .9rem;font:400 .72rem Jost,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#efe6d6;background:rgba(5,7,11,.6);border:1px solid rgba(239,230,214,.35);cursor:pointer';
 b.onclick=function(){auInit();if(!AU.ctx)return;AU.on=!AU.on;var c=AU.ctx;if(AU.on){try{c.resume()}catch(e){}AU.m.gain.setTargetAtTime(.85,c.currentTime,.2)}else AU.m.gain.setTargetAtTime(0,c.currentTime,.12);b.textContent=AU.on?'♪  Sound on':'♪  Sound off';b.setAttribute('aria-pressed',AU.on?'true':'false')};
 cv.parentNode.appendChild(b)}
function hov(f){return -f*FH+HH}
function pose(t,b){
 var q=ss(0,1,Math.min(1,p/P0)),c=Math.min(S,Math.max(0,(p-P0)/(PE-P0))*S),fr=c-Math.floor(c),cr=HH/FH,fl2=Math.floor(c);
 /* camera height is linear in scroll; only the look-down angle and sideways offset ease as a floor is crossed */
 var bump=fr<cr?ss(0,cr,fr):1-ss(cr,1,fr),y=HH-c*FH,z=oz*(1-bump);lastBump=bump;
 var pitch=-(Math.PI/2-tau*(1-.8*bump)),roll=reduce?0:(fl2%2?-1:1)*.2*Math.sin(Math.PI*bump),br=reduce?0:1-bump;
 var sk=reduce?0:Math.sin(Math.PI*cl((b-.06)/.6,0,1))*.07;
 cam.position.set(mx*.8+Math.sin(t*.5)*.07*br*q+Math.sin(t*63)*sk,HY+(y-HY)*q+Math.sin(t*.7)*.05*br*q+Math.sin(t*71)*sk,8+(z-8)*q+my*.5);
 cam.rotation.set(pitch*q+my*.05,-mx*.1+Math.sin(t*.4)*.012*br,roll-mx*.06);
 var rv=ss(0,1,cl((p-PE)/(1-PE),0,1));
 if(rv>0){
  /* landed: ease from the top-down hover to eye level and swing round to his back (the model faces +x, so the camera ends at -x) */
  var fY=-BASE*FH,rr=oz+(5.2-oz)*rv,th=-rv*Math.PI/2,px=rr*Math.sin(th),pz=rr*Math.cos(th),py=fY+HH+(1.9-HH)*rv,
   tx=0,ty=fY+1.7*rv,tz=(oz-HH*Math.tan(tau))*(1-rv),dx=tx-px,dy=ty-py,dz=tz-pz;
  cam.position.set(px+mx*.5,py+Math.sin(t*.7)*.04*rv,pz+my*.3);
  cam.rotation.set(Math.atan2(dy,Math.hypot(dx,dz))+my*.04,Math.atan2(-dx,-dz)-mx*.08,-mx*.04);y=py}
 var fv=50+(reduce?0:14*bump);if(Math.abs(cam.fov-fv)>.01){cam.fov=fv;cam.updateProjectionMatrix()}
 return y}
function breakFloor(b,cr){var i,d,bi,drop,m,s2,a,o;
 for(i=0;i<plugs.length;i++){d=plugs[i];bi=cl((b-d.d)/.65,0,1);drop=22*bi*bi;m=d.m;m.position.set(d.cx+d.dx*bi*2.2,-drop,d.cz);m.rotation.set(d.rx*bi*1.8,0,d.rz*bi*2.6);m.visible=bi<1&&drop<10}
 if(ex0)ex0.visible=b>.3;if(dec0)dec0.opacity=ss(0,.5,b);if(crk0)crk0.opacity=cr*(1-ss(0,.3,b));
 if(burst){if(b>0&&b<1){s2=b*1.6;a=burst.a;o=burst.o;for(i=0;i<burst.n;i++){a[i*3]=o[i*3]+burst.v[i][0]*s2;a[i*3+1]=burst.v[i][1]*s2-5.5*s2*s2;a[i*3+2]=o[i*3+2]+burst.v[i][2]*s2}
   burst.g.attributes.position.needsUpdate=true;burst.m.opacity=.7*(1-ss(.45,1,b))*ss(0,.08,b)}else burst.m.opacity=0}}
function reveal(y){var i,q,t,r0,a,rv;
 for(i=0;i<plq.length;i++){q=plq[i];if(q.by===undefined)continue;r0=1-ss(FH*.22,FH*.68,Math.abs(y-hov(q.f)));a=cl(r0*1.5-q.i*.06,0,1);rv=.12+.88*ss(0,1,a);
  q.top.opacity=rv;q.side.opacity=rv;q.m.position.y=q.by+(1-rv)*-.55;q.m.visible=rv>.02}
 for(i=0;i<titles.length;i++){t=titles[i];if(t.by===undefined)continue;r0=1-ss(FH*.22,FH*.68,Math.abs(y-hov(t.f)));t.m.material.opacity=.12+.88*r0;if(r0>.55&&!t.k){t.k=1;if(auOn())sfxKnock(G[t.f-1].it.length)}else if(r0<.15)t.k=0}}
function animate(t){var i,o,rg=FH*(BASE+1),top=FH*.7,d,yy;
 for(i=0;i<anim.length;i++)anim[i](t);
 for(i=0;i<sway.length;i++){o=sway[i];o.o.rotation[o.a]=Math.sin(t*.8+o.ph*1.7)*o.k}
 for(i=0;i<dp.length;i++){d=dp[i];yy=top-((d.o+t*d.v)%rg);
  dum.position.set(Math.cos(d.an)*d.rd*dj,yy,Math.sin(d.an)*d.rd*dj);dum.rotation.set(d.rx+t*d.a,0,d.rz+t*d.b);dum.scale.set(d.s,d.s,d.s);dum.updateMatrix();deb.setMatrixAt(i,dum.matrix)}
 if(samIn){var bp=(t/4.6)%1,bb=bp<.42?.5-.5*Math.cos(bp/.42*Math.PI):.5+.5*Math.cos((bp-.42)/.58*Math.PI);samIn.scale.set(1+.007*bb,1+.011*bb,1+.009*bb)}
 if(samRL)samRL.intensity=1.1+.3*Math.sin(t*1.4);
 if(sealFx){sealFx.g.rotation.y=t*.06;for(i=0;i<3;i++)sealFx.m[i].opacity=.34+.14*Math.sin(t*1.4+i*2.1);sealFx.r.opacity=.8+.2*Math.sin(t*1.1)}
 deb.instanceMatrix.needsUpdate=true;dust.rotation.y=t*.012;embers.position.y=Math.sin(t*.5)*.4}
function loop(now){raf=requestAnimationFrame(loop);var t=(now-t0)/1000;p+=(tp-p)*(reduce?1:.22);if(Math.abs(tp-p)<.0004)p=tp;var dt=Math.min(.1,Math.max(.001,(now-lastNow)/1000)),fps=Math.abs(p-pPrev)/dt*4.3;lastNow=now;pPrev=p;fxS+=(cl((fps-.5)/2.4,0,1)-fxS)*.18;mx+=(tx-mx)*.06;my+=(ty-my)*.06;
 sv.x+=(pv.x-sv.x)*.18;sv.y+=(pv.y-sv.y)*.18;pv.multiplyScalar(.86);
 var u=hm.uniforms;u.uT.value=t;u.uM.value.set(ox,oy);u.uV.value.set(cl(sv.x,-.25,.25),cl(sv.y,-.25,.25));u.uP.value=p;u.uR.value=reduce?1:Math.min(1,t/2.4);u.uFade.value=1-ss(.015,.075,p);
 hero.rotation.y=mx*.28;hero.rotation.x=my*.16;
 var bk=ss(.045,.14,p);breakFloor(bk,ss(.02,.07,p));var y=pose(t,bk);reveal(y);var cc=-y/FH,thi=themeFx(cc);if(!reduce)animate(t);
 lamp.position.set(cam.position.x,cam.position.y+1.5,cam.position.z);lamp.intensity=reduce?1.35:1.35+Math.sin(t*7.3)*.07+Math.sin(t*3.1)*.05;
 var f=Math.round((HH-y)/FH);GL.textContent=p>.05?(f<=0?'':f<=G.length?G[f-1].g:'The Foundation'):'';
 M.textContent=Math.round(Math.max(0,HH-y)*1.5)+' m';B.style.width=(p*100)+'%';H.style.opacity=1-ss(0,.04,p);H.style.pointerEvents=p>.04?'none':'auto';
 auSync();if(AU.ctx){try{auFrame(t,fps,thi,cc,bk,ss(.02,.07,p))}catch(e){}}
 renderFrame(fxS,reduce?0:Math.pow(lastBump,10)*cl(fps/1.1,0,1),t)}
function run(){if(!ready||running)return;running=true;window.__cov14=true;rs();sp();p=tp=0;pPrev=0;fxS=0;AU.k=null;t0=lastNow=performance.now();if(AU.on&&AU.ctx){try{AU.ctx.resume()}catch(e){}}cv.classList.add('on');raf=requestAnimationFrame(loop);panel.focus({preventScroll:true})}
function start(){if(ready){run();return}if(building)return;building=true;
 Promise.race([Promise.all([document.fonts.load('500 100px "Cormorant Garamond"'),document.fonts.load('600 100px "Cormorant Garamond"'),document.fonts.load('300 20px Jost')]),new Promise(function(s){setTimeout(s,1500)})]).then(function(){ready=build();building=false;if(ready&&on)run()})}
function stop(){running=false;window.__cov14=false;cancelAnimationFrame(raf);cv.classList.remove('on');if(AU.ctx){try{AU.ctx.suspend()}catch(e){}}}
document.addEventListener('portfolio:view',function(e){var now=e.detail.id==='skills'&&!e.detail.cs;if(now===on)return;on=now;if(on)start();else stop()});
if(panel.classList.contains('on')){on=true;start()}
})();
