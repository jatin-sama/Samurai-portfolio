
(function(){
'use strict';
var O=document.getElementById('dojo'),opener=document.getElementById('dojoOpen');if(!O||!opener)return;
var cv=document.getElementById('dgCv'),cx=cv.getContext('2d'),$=function(i){return document.getElementById(i)};
var reduce=false;try{reduce=(window.__RM===true)}catch(e){}
/* ---------- songs: public-domain melodies and one original ---------- */
var NT={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function midi(n){var m=/^([A-G][#b]?)(\d)$/.exec(n);return NT[m[1]]+(+m[2]+1)*12}
function parse(str){var out=[],b=0;str.trim().split(/\s+/).forEach(function(t){var a=t.split(':'),d=a[1]?parseFloat(a[1]):1;if(a[0]!=='R'){var m=midi(a[0]);out.push({m:m,f:440*Math.pow(2,(m-69)/12),b:b,d:d})}b+=d});return{notes:out,len:b}}
function up(s){return s.replace(/([A-G][#b]?)(\d)/g,function(_,n,o){return n+(+o+1)})}
var B1='D4:.5 F4:.5 A4:.5 Bb4:.5 A4:.5 F4:.5 E4:1',B2='D4:.5 F4:.5 A4:.5 Bb4:.5 D5:1 A4:1',B3='Bb4:.5 A4:.5 F4:.5 E4:.5 F4:.5 A4:.5 Bb4:1',B4='A4:.5 F4:.5 E4:.5 D4:.5 E4:1 D4:1',B5='D5:.5 Bb4:.5 A4:.5 F4:.5 A4:.5 Bb4:.5 D5:1',B6='F5:.5 E5:.5 D5:.5 Bb4:.5 A4:1 F4:1',B7='D4:.5 F4:.5 A4:.5 D5:.5 Bb4:.5 A4:.5 F4:.5 E4:.5',B8='D4:1 A4:1 D5:2';
var SONGS=[
{id:'sakura',name:'Sakura Sakura',by:'Traditional \u00B7 Japan',lv:'Easy',bpm:88,ke:2,fall:1.9,seq:'A4:1 A4:1 B4:2 A4:1 A4:1 B4:2 A4:1 B4:1 C5:1 B4:1 A4:1 B4:1 A4:1 F4:1 E4:2 R:2 E4:1 F4:1 A4:1 B4:2 R:1 B4:1 C5:1 B4:1 A4:1 F4:1 E4:2 R:1 A4:1 A4:1 B4:2 A4:1 A4:1 B4:2 A4:1 B4:1 C5:1 B4:1 A4:1 B4:1 A4:1 F4:1 E4:3'},
{id:'ode',name:'Ode to Joy',by:'Beethoven',lv:'Easy',bpm:112,ke:1,fall:1.7,seq:'E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 E4:1.5 D4:.5 D4:2 E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 D4:1.5 C4:.5 C4:2 D4:1 D4:1 E4:1 C4:1 D4:1 E4:.5 F4:.5 E4:1 C4:1 D4:1 E4:.5 F4:.5 E4:1 D4:1 C4:1 D4:1 G3:2 E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 D4:1.5 C4:.5 C4:2'},
{id:'elise',name:'F\u00FCr Elise',by:'Beethoven',lv:'Medium',bpm:200,ke:2,fall:1.5,seq:'E5:1 D#5:1 E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 A4:2 R:1 C4:1 E4:1 A4:1 B4:2 R:1 E4:1 G#4:1 B4:1 C5:2 R:1 E4:1 E5:1 D#5:1 E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 A4:2 R:1 C4:1 E4:1 A4:1 B4:2 R:1 E4:1 C5:1 B4:1 A4:3'},
{id:'ronin',name:'Ronin Run',by:'Original \u00B7 Hirajoshi scale',lv:'Hard',bpm:138,ke:1,fall:1.45,seq:[B1,B2,B3,B4,up(B1),up(B2),up(B3),up(B4),B5,B6,B7,B8].join(' ')}
];
/* ---------- audio ---------- */
var AC=null,master=null,nb=null;
function ac(){if(!AC){var C=window.AudioContext||window.webkitAudioContext;AC=new C();master=AC.createGain();master.gain.value=.9;var cp=AC.createDynamicsCompressor();master.connect(cp);cp.connect(AC.destination)}if(AC.state==='suspended')AC.resume();return AC}
function pluck(f,t,g,soft){var o=AC.createOscillator(),o2=AC.createOscillator(),gn=AC.createGain(),fl=AC.createBiquadFilter(),g2=AC.createGain();
 o.type='triangle';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2;g2.gain.value=.25;
 fl.type='lowpass';fl.frequency.setValueAtTime(soft?900:3400,t);fl.frequency.exponentialRampToValueAtTime(soft?380:650,t+.5);
 gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(g,t+.008);gn.gain.exponentialRampToValueAtTime(.0008,t+(soft?.5:1));
 o.connect(fl);o2.connect(g2);g2.connect(fl);fl.connect(gn);gn.connect(master);o.start(t);o2.start(t);o.stop(t+1.1);o2.stop(t+1.1)}
function kick(t){var o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(master);o.start(t);o.stop(t+.22)}
function hat(t,v){if(!nb){nb=AC.createBuffer(1,Math.floor(AC.sampleRate*.1),AC.sampleRate);var d=nb.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 var s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=nb;f.type='highpass';f.frequency.value=6500;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+.06)}
/* ---------- state ---------- */
var G=null,paused=false,raf=0,W=0,H=0,aw=0,lw=0,x0=0,hy=0,th=0,heldEls=[],amb=false,idle=[],PERF=.07,GOOD=.14;
var KEYS={KeyD:0,KeyF:1,KeyJ:2,KeyK:3,ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3},LBL=['D','F','J','K'];
function best(id,v){try{var o=JSON.parse(localStorage.getItem('jt_dojo')||'{}');if(v==null)return o[id]||0;if(v>(o[id]||0)){o[id]=v;localStorage.setItem('jt_dojo',JSON.stringify(o));return true}return false}catch(e){return v==null?0:false}}
function buildMenu(){var h='';SONGS.forEach(function(s,i){var b=best(s.id);h+='<li><button type="button" class="sg" data-i="'+i+'"><b>'+s.name+'</b><i>'+s.by+'</i><span><em>'+s.lv+' \u00B7 '+s.bpm+' bpm</em><u>'+(b?'Best '+b:'Not played')+'</u></span></button></li>'});$('dgList').innerHTML=h}
function fit(){var d=Math.min(2,window.devicePixelRatio||1);W=O.clientWidth;H=O.clientHeight;cv.width=Math.round(W*d);cv.height=Math.round(H*d);cx.setTransform(d,0,0,d,0,0);aw=Math.min(W*.94,520);lw=aw/4;x0=(W-aw)/2;hy=H*.8;th=Math.max(54,Math.min(lw*.95,104))}
function show(id,on){$(id).hidden=!on}
function start(si){
 var S=SONGS[si],p=parse(S.seq);ac();
 var spb=60/S.bpm,lead=3.4,mids=[];
 p.notes.forEach(function(n){if(mids.indexOf(n.m)<0)mids.push(n.m)});mids.sort(function(a,b){return a-b});
 var t0=AC.currentTime+.15;
 var tiles=p.notes.map(function(n){return{f:n.f,lane:Math.min(3,Math.floor(mids.indexOf(n.m)*4/mids.length)),time:t0+lead+n.b*spb,done:0}});
 var iv=S.ke*spb,endT=t0+lead+p.len*spb+1;
 for(var tt=t0+lead-Math.floor((lead-.2)/iv)*iv;tt<endT;tt+=iv){kick(tt);hat(tt+iv/2,.06)}
 G={S:S,si:si,tiles:tiles,t0:t0,lead:lead,F:S.fall,dur:p.len*spb,score:0,combo:0,maxc:0,perf:0,good:0,miss:0,left:tiles.length,fx:[],pt:[],lf:[0,0,0,0],endAt:0,over:false};
 paused=false;show('dgMenu',false);show('dgPop',false);show('dgEnd',false);show('dgPause',true)}
function mult(){return Math.min(4,1+Math.floor(G.combo/10))}
function judge(txt,lane,col){G.fx.push({t:AC.currentTime,x:x0+(lane+.5)*lw,txt:txt,col:col})}
function burst(lane,col){if(reduce)return;for(var i=0;i<9;i++)G.pt.push({x:x0+(lane+.5)*lw,y:hy,vx:(Math.random()-.5)*220,vy:-60-Math.random()*190,r:2+Math.random()*3,l:0,c:col,rot:Math.random()*6})}
function hit(lane){
 if(!G||paused||G.over||!AC)return;var now=AC.currentTime,bt=null,bd=9,i,t;G.lf[lane]=now;
 for(i=0;i<G.tiles.length;i++){t=G.tiles[i];if(t.done||t.lane!==lane)continue;var d=Math.abs(t.time-now);if(d<bd){bd=d;bt=t}if(t.time-now>GOOD)break}
 if(!bt||bd>GOOD)return;
 bt.done=1;G.left--;
 if(bd<=PERF){G.perf++;G.score+=100*mult();judge('PERFECT',lane,'#ffb4a8');try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}}
 else{G.good++;G.score+=60*mult();judge('GOOD',lane,'#efe6d6')}
 G.combo++;if(G.combo>G.maxc)G.maxc=G.combo;
 pluck(bt.f,now+.005,.36,false);burst(lane,bd<=PERF?'#ff6a5e':'#efe6d6')}
function miss(t){t.done=1;G.left--;G.miss++;G.combo=0;judge('MISS',t.lane,'#8a8f99');pluck(t.f,AC.currentTime+.01,.1,true)}
function finish(){
 G.over=true;show('dgPause',false);
 var total=G.tiles.length,acc=(G.perf+G.good*.6)/total,g=acc>=.95?'S':acc>=.85?'A':acc>=.7?'B':acc>=.5?'C':'D';
 $('dgEs').textContent=G.S.name;$('dgGr').textContent=g;$('dgSc').textContent=G.score;$('dgAc').textContent=Math.round(acc*100)+'%';$('dgMc').textContent=G.maxc;$('dgPf').textContent=G.perf+' / '+total;
 var nb2=best(G.S.id,G.score);$('dgBest').textContent=nb2?'New best score':'Best '+best(G.S.id);show('dgEnd',true);try{$('dgRetry').focus({preventScroll:true})}catch(e){}}
function pause(){if(!G||G.over||paused)return;paused=true;try{AC.suspend()}catch(e){}show('dgPop',true);try{$('dgRes').focus({preventScroll:true})}catch(e){}}
function resume(){if(!paused)return;paused=false;try{AC.resume()}catch(e){}show('dgPop',false)}
function toMenu(){G=null;paused=false;if(AC){try{AC.close()}catch(e){}AC=null;nb=null}show('dgPop',false);show('dgEnd',false);show('dgPause',false);buildMenu();show('dgMenu',true);var f=O.querySelector('.sg');if(f)try{f.focus({preventScroll:true})}catch(e){}}
/* ---------- drawing ---------- */
function rr(x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
var lastT=0;
function draw(){
 raf=requestAnimationFrame(draw);if(O.hidden)return;
 var rt=performance.now()/1000,dt=Math.min(.05,rt-lastT);lastT=rt;
 var now=G&&AC?AC.currentTime:rt,combo=G?G.combo:0,i,t;
 cx.clearRect(0,0,W,H);
 var bg=cx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a0508');bg.addColorStop(1,'#05070b');cx.fillStyle=bg;cx.fillRect(0,0,W,H);
 var mr=Math.min(W,H)*.24,ma=.22+Math.min(combo,40)/40*.4,mg=cx.createRadialGradient(W/2,H*.2,0,W/2,H*.2,mr);
 mg.addColorStop(0,'rgba(224,52,63,'+ma+')');mg.addColorStop(.55,'rgba(150,20,34,'+ma*.5+')');mg.addColorStop(1,'rgba(90,10,22,0)');cx.fillStyle=mg;cx.fillRect(0,0,W,H);
 if(!G){ /* idle petals behind the song list */
  if(!reduce){if(idle.length<26&&Math.random()<.2)idle.push({x:Math.random()*W,y:-10,vx:(Math.random()-.3)*30,vy:25+Math.random()*40,r:2+Math.random()*3,rot:Math.random()*6});
   idle.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt;cx.fillStyle='rgba(255,120,140,.6)';cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.fillRect(-p.r,-p.r*.6,p.r*2,p.r*1.2);cx.restore()});idle=idle.filter(function(p){return p.y<H+10})}
  return}
 /* lanes */
 cx.strokeStyle='rgba(239,230,214,.08)';cx.lineWidth=1;for(i=0;i<=4;i++){cx.beginPath();cx.moveTo(x0+i*lw,0);cx.lineTo(x0+i*lw,H);cx.stroke()}
 for(i=0;i<4;i++){var fa=Math.max(0,1-(now-G.lf[i])/.22);if(fa>0){var lg=cx.createLinearGradient(0,hy-H*.4,0,hy);lg.addColorStop(0,'rgba(224,52,63,0)');lg.addColorStop(1,'rgba(224,52,63,'+.3*fa+')');cx.fillStyle=lg;cx.fillRect(x0+i*lw,hy-H*.4,lw,H*.4)}}
 /* hit line */
 var hl=cx.createLinearGradient(x0,0,x0+aw,0);hl.addColorStop(0,'rgba(224,52,63,0)');hl.addColorStop(.5,'rgba(255,110,100,.95)');hl.addColorStop(1,'rgba(224,52,63,0)');cx.fillStyle=hl;cx.shadowColor='#e0343f';cx.shadowBlur=14;cx.fillRect(x0,hy-1,aw,2);cx.shadowBlur=0;
 /* tiles + misses */
 var span=hy+th;
 for(i=0;i<G.tiles.length;i++){t=G.tiles[i];if(t.done)continue;
  if(!paused&&now>t.time+GOOD){miss(t);continue}
  var ty=hy-(t.time-now)/G.F*span;if(ty<-th)break;if(ty>H+th)continue;
  var tx=x0+t.lane*lw+4,tw=lw-8,tg=cx.createLinearGradient(0,ty-th/2,0,ty+th/2);tg.addColorStop(0,'#ff5a52');tg.addColorStop(1,'#a3161f');
  cx.fillStyle=tg;rr(tx,ty-th/2,tw,th,9);cx.fill();cx.strokeStyle='rgba(255,230,220,.55)';cx.lineWidth=1.2;cx.stroke();
  cx.fillStyle='rgba(255,255,255,.18)';rr(tx+5,ty-th/2+5,tw-10,th*.22,5);cx.fill()}
 /* pads */
 var py=hy+th*.55,ph=Math.min(lw*.8,64);
 for(i=0;i<4;i++){var pa=Math.max(0,1-(now-G.lf[i])/.15);cx.fillStyle='rgba(239,230,214,'+(.05+.18*pa)+')';rr(x0+i*lw+4,py,lw-8,ph,10);cx.fill();cx.strokeStyle='rgba(239,230,214,'+(.18+.5*pa)+')';cx.lineWidth=1;cx.stroke();
  cx.fillStyle='rgba(239,230,214,.55)';cx.font='400 14px Jost,sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(LBL[i],x0+(i+.5)*lw,py+ph/2)}
 /* particles + judgements */
 for(i=0;i<G.pt.length;i++){var p=G.pt[i];p.l+=dt;p.vy+=520*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*6;var al=Math.max(0,1-p.l/.7);cx.globalAlpha=al;cx.fillStyle=p.c;cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.fillRect(-p.r,-p.r*.6,p.r*2,p.r*1.2);cx.restore()}
 cx.globalAlpha=1;G.pt=G.pt.filter(function(p){return p.l<.7});
 cx.textAlign='center';cx.textBaseline='middle';
 for(i=0;i<G.fx.length;i++){var f=G.fx[i],a=Math.min(1,(now-f.t)/.6);cx.globalAlpha=1-a;cx.fillStyle=f.col;cx.font='500 15px Jost,sans-serif';cx.fillText(f.txt.split('').join(String.fromCharCode(8202)),f.x,hy-th*.9-a*26)}
 cx.globalAlpha=1;G.fx=G.fx.filter(function(f){return now-f.t<.6});
 /* HUD */
 var st=(window.visualViewport?0:0)+30;cx.textAlign='left';cx.fillStyle='rgba(239,230,214,.5)';cx.font='300 11px Jost,sans-serif';cx.fillText('SCORE',x0,st+8);
 cx.fillStyle='#efe6d6';cx.font='500 30px "Cormorant Garamond",Georgia,serif';cx.fillText(String(G.score),x0,st+36);
 if(combo>1){cx.textAlign='center';cx.fillStyle='rgba(239,230,214,.14)';cx.font='500 '+Math.round(Math.min(W,H)*.16)+'px "Cormorant Garamond",Georgia,serif';cx.fillText(combo,W/2,H*.4);cx.fillStyle='rgba(255,140,130,.7)';cx.font='400 12px Jost,sans-serif';cx.fillText('COMBO  x'+mult(),W/2,H*.4+Math.min(W,H)*.1)}
 var pr=Math.max(0,Math.min(1,(now-G.t0-G.lead)/G.dur));cx.fillStyle='#e0343f';cx.fillRect(0,0,W*pr,2);
 /* countdown */
 var cd=G.t0+G.lead-now;if(cd>-.5&&!paused||cd>-.5){var big=cd>2?'3':cd>1?'2':cd>0?'1':'GO';cx.textAlign='center';cx.globalAlpha=cd>0?.9:Math.max(0,1+cd*2);cx.fillStyle='#efe6d6';cx.font='300 '+Math.round(Math.min(W,H)*.2)+'px Jost,sans-serif';cx.fillText(big,W/2,H*.4);cx.globalAlpha=1}
 if(!G.over&&G.left<=0){if(!G.endAt)G.endAt=now+1;else if(now>=G.endAt)finish()}}
/* ---------- input ---------- */
function laneAt(x){var l=Math.floor((x-x0)/lw);return l<0||l>3?-1:l}
cv.addEventListener('pointerdown',function(e){if(!G)return;var r=cv.getBoundingClientRect(),l=laneAt(e.clientX-r.left);if(l>=0)hit(l);e.preventDefault()});
function onKey(e){if(O.hidden)return;
 if(e.key==='Escape'){e.stopPropagation();e.preventDefault();if(G&&!G.over){paused?resume():pause()}else if(G&&G.over)toMenu();else close();return}
 if(e.code in KEYS&&G&&!paused&&!e.repeat){hit(KEYS[e.code]);e.preventDefault()}
 e.stopPropagation()}
document.addEventListener('keydown',onKey,true);
['pointerdown','pointermove','pointerup','click','wheel','touchstart','touchmove','mousedown','mousemove'].forEach(function(n){O.addEventListener(n,function(e){e.stopPropagation()},{passive:true})});
document.addEventListener('visibilitychange',function(){if(document.hidden)pause()});
addEventListener('resize',function(){if(!O.hidden)fit()});
$('dgList').addEventListener('click',function(e){var b=e.target.closest('.sg');if(b)start(+b.dataset.i)});
$('dgPause').addEventListener('click',pause);$('dgRes').addEventListener('click',resume);
$('dgSongs1').addEventListener('click',toMenu);$('dgSongs2').addEventListener('click',toMenu);
$('dgRetry').addEventListener('click',function(){if(G)start(G.si)});
$('dgClose').addEventListener('click',close);
/* ---------- open / close ---------- */
function open(){
 if(!O.hidden)return;
 heldEls=[];[].forEach.call(document.body.children,function(el){if(el===O||el.tagName==='SCRIPT'||el.tagName==='STYLE'||el.hasAttribute('inert'))return;el.setAttribute('inert','');heldEls.push(el)});
 var sb=document.getElementById('snd');amb=!!(sb&&sb.getAttribute('aria-pressed')==='true');
 if(amb&&typeof JSND!=='undefined')try{JSND.ambient(false)}catch(e){}
 O.hidden=false;fit();toMenu();cancelAnimationFrame(raf);lastT=performance.now()/1000;raf=requestAnimationFrame(draw)}
function close(){
 cancelAnimationFrame(raf);G=null;paused=false;if(AC){try{AC.close()}catch(e){}AC=null;nb=null}
 O.hidden=true;heldEls.forEach(function(el){el.removeAttribute('inert')});heldEls=[];
 if(amb&&typeof JSND!=='undefined')try{JSND.ambient(true)}catch(e){}
 try{opener.focus({preventScroll:true})}catch(e){}}
opener.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open()});
})();
