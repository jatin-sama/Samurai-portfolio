
/* Skills depth dive: scroll flies the camera through every skill (liquid title adapted from the supplied hero) */
(function(){
var T=window.THREE,panel=document.getElementById('skills'),cv=document.getElementById('sk3'),track=panel.querySelector('.sk3-track');
document.getElementById('skgo').onclick=function(){window.Slash?Slash(function(){location.hash='experience'}):location.hash='experience'};
document.getElementById('sk3skip').onclick=function(){panel.scrollTo({top:track.offsetHeight,behavior:'smooth'})};
if(!T||!cv){panel.classList.add('nogl');return}
var G=[].map.call(document.querySelectorAll('#groups .grp'),function(g){return{g:g.querySelector('h3').textContent,it:[].map.call(g.querySelectorAll('.sk'),function(b){return{n:b.querySelector('.nm').textContent,l:b.querySelectorAll('.lv i.on').length}})}});
var INK='#efe6d6',RED='#e0343f',SERIF='"Cormorant Garamond","Hoefler Text",Georgia,serif',SANS='Jost,Arial,sans-serif',SP=7.5,reduce=(window.__RM===true);
var r,sc,cam,hero,hm,ready=false,building=false,on=false,running=false,raf=0,t0=0,p=0,tp=0,mx=0,my=0,tx=0,ty=0,ox=.5,oy=.5,Z=0,marks=[],sv=new T.Vector2(),pv=new T.Vector2();
var M=document.getElementById('sk3m'),B=document.getElementById('sk3b'),GL=document.getElementById('sk3g'),H=document.getElementById('sk3h').parentNode;
function tex(w,h,fn){var c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'));var t=new T.CanvasTexture(c);t.anisotropy=4;return t}
function ss(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
function ls(c,v){try{c.letterSpacing=v}catch(e){}}
function build(){
 try{r=new T.WebGLRenderer({canvas:cv,antialias:true})}catch(e){panel.classList.add('nogl');return false}
 r.setPixelRatio(Math.min(devicePixelRatio,2));r.setClearColor(0x05070b,1);
 sc=new T.Scene();sc.fog=new T.Fog(0x05070b,10,46);cam=new T.PerspectiveCamera(50,1,.1,200);cam.position.z=8;
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
 hero=new T.Mesh(new T.PlaneGeometry(1,.5),hm);sc.add(hero);
 var k=0;
 G.forEach(function(gr){
  var z=-12-k*SP,tt=tex(2048,512,function(c){c.textAlign='center';c.textBaseline='middle';var fs=300;c.font='600 '+fs+'px '+SERIF;while(c.measureText(gr.g).width>1900&&fs>80){fs-=10;c.font='600 '+fs+'px '+SERIF}c.fillStyle=INK;c.fillText(gr.g,1024,200);c.fillStyle=RED;c.font='400 70px '+SANS;ls(c,'12px');c.fillText(gr.it.length+' skills',1024,420)});
  var m=new T.Mesh(new T.PlaneGeometry(12,3),new T.MeshBasicMaterial({map:tt,transparent:true,depthWrite:false}));m.position.set(0,0,z);sc.add(m);
  var ring=new T.Mesh(new T.TorusGeometry(6.4,.02,6,120),new T.MeshBasicMaterial({color:0xe0343f}));ring.position.z=z+3.2;sc.add(ring);
  marks.push(gr.g);k++;
  gr.it.forEach(function(s,i){var z2=-12-k*SP,t=tex(1024,320,function(c){c.textAlign='center';c.textBaseline='middle';var fs=190,two=null,F=function(){c.font='600 '+fs+'px '+SERIF};F();
    while(c.measureText(s.n).width>900&&fs>110){fs-=8;F()}
    if(c.measureText(s.n).width>900){var wd=s.n.split(' '),best=null,bd=1e9,q;
     for(q=1;q<wd.length;q++){var a1=wd.slice(0,q).join(' '),b1=wd.slice(q).join(' '),d1=Math.abs(c.measureText(a1).width-c.measureText(b1).width);if(d1<bd){bd=d1;best=[a1,b1]}}
     two=best||[s.n];fs=120;F();while(fs>40&&two.some(function(l){return c.measureText(l).width>900})){fs-=4;F()}}
    c.fillStyle=s.l===5?RED:INK;
    if(two){c.fillText(two[0],512,64);if(two[1])c.fillText(two[1],512,64+fs*.92)}else c.fillText(s.n,512,110);
    for(var j=0;s.l&&j<5;j++){c.save();c.translate(512+(j-2)*56,262);c.rotate(Math.PI/4);if(j<s.l){c.fillStyle=RED;c.fillRect(-11,-11,22,22)}else{c.strokeStyle='rgba(239,230,214,.45)';c.lineWidth=3;c.strokeRect(-11,-11,22,22)}c.restore()}});
   var w=new T.Mesh(new T.PlaneGeometry(5.6,1.75),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:2})),a=k*2.4,rad=3.4+(k%3)*.9;
   w.position.set(Math.cos(a)*rad,Math.sin(a)*rad*.7,z2);w.lookAt(0,0,z2+7);w.rotateZ(Math.sin(k*3.1)*.3);sc.add(w);marks.push(gr.g);k++})});
 Z=12+k*SP+8;
 var n=1400,pa=new Float32Array(n*3);for(var i=0;i<n;i++){var a2=Math.random()*6.28,rd=2.5+Math.random()*14;pa[i*3]=Math.cos(a2)*rd;pa[i*3+1]=Math.sin(a2)*rd;pa[i*3+2]=10-Math.random()*(Z+20)}
 var pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));sc.add(new T.Points(pg,new T.PointsMaterial({color:0xefe6d6,size:.06,transparent:true,opacity:.7})));
 return true}
function rs(){if(!r)return;var w=cv.parentNode.clientWidth,h=cv.parentNode.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
 var vh=2*8*Math.tan(25*Math.PI/180),vw=vh*cam.aspect,W=Math.min(vw*.96,vh*1.7);hero.scale.set(W,W,1)}
function sp(){var m=track.offsetHeight-panel.clientHeight;tp=m>0?Math.min(1,Math.max(0,panel.scrollTop/m)):0}
panel.addEventListener('scroll',sp,{passive:true});addEventListener('resize',function(){rs();sp()});
panel.addEventListener('pointermove',function(e){var b=cv.getBoundingClientRect(),nx=(e.clientX-b.left)/b.width,ny=1-(e.clientY-b.top)/b.height;tx=nx-.5;ty=.5-ny;pv.x+=(nx-ox)*2.2;pv.y+=(ny-oy)*2.2;ox=nx;oy=ny});
function loop(now){raf=requestAnimationFrame(loop);var t=(now-t0)/1000;p+=(tp-p)*(reduce?1:.08);mx+=(tx-mx)*.06;my+=(ty-my)*.06;
 sv.x+=(pv.x-sv.x)*.18;sv.y+=(pv.y-sv.y)*.18;pv.multiplyScalar(.86);
 var u=hm.uniforms;u.uT.value=t;u.uM.value.set(ox,oy);u.uV.value.set(Math.max(-.25,Math.min(.25,sv.x)),Math.max(-.25,Math.min(.25,sv.y)));u.uP.value=p;u.uR.value=reduce?1:Math.min(1,t/2.4);u.uFade.value=1-ss(.015,.075,p);
 hero.rotation.y=mx*.28;hero.rotation.x=my*.16;
 cam.position.set(mx*1.1,-my*.8,8-p*Z);cam.rotation.set(my*.07,-mx*.1,-mx*.08+p*1.1);
 var k=Math.round((p*Z-20)/SP);GL.textContent=p>.03&&k>=-1?marks[Math.max(0,Math.min(marks.length-1,k))]:'';
 M.textContent=Math.round(p*Z)+' m';B.style.width=(p*100)+'%';H.style.opacity=1-ss(0,.04,p);H.style.pointerEvents=p>.04?'none':'auto';
 r.render(sc,cam)}
function run(){if(!ready||running)return;running=true;window.__cov14=true;rs();sp();p=tp=0;t0=performance.now();cv.classList.add('on');raf=requestAnimationFrame(loop);panel.focus({preventScroll:true})}
function start(){if(ready){run();return}if(building)return;building=true;
 Promise.race([Promise.all([document.fonts.load('500 100px "Cormorant Garamond"'),document.fonts.load('600 100px "Cormorant Garamond"'),document.fonts.load('300 20px Jost')]),new Promise(function(s){setTimeout(s,1500)})]).then(function(){ready=build();building=false;if(ready&&on)run()})}
function stop(){running=false;window.__cov14=false;cancelAnimationFrame(raf);cv.classList.remove('on')}
document.addEventListener('portfolio:view',function(e){var now=e.detail.id==='skills'&&!e.detail.cs;if(now===on)return;on=now;if(on)start();else stop()});
if(panel.classList.contains('on')){on=true;start()}
})();
