
/* JMUS: chapter music for Skills + Experience. Pure Web Audio synthesis (no files).
   Follows the existing SND toggle. Fades in/out with the panels, swells with scroll. */
(function(){
'use strict';
var AC=null,bus=null,verb=null,verbIn=null,run=null,cache={},tickId=0;
var S=[0,2,3,7,8];                               /* Hirajoshi */
var $=function(i){return document.getElementById(i)};
function on(){var b=$('snd');return !!b&&b.getAttribute('aria-pressed')==='true'}
function mhz(m){return 440*Math.pow(2,(m-69)/12)}
function deg(i,base){var o=Math.floor(i/5),d=((i%5)+5)%5;return mhz(base+12*o+S[d])}
function clamp(x,a,b){return x<a?a:x>b?b:x}

/* ---------- context + master chain ---------- */
function ctx(){
 if(!AC){try{
  AC=new(window.AudioContext||window.webkitAudioContext)();
  var comp=AC.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.3;
  bus=AC.createGain();bus.gain.value=.28;bus.connect(comp);comp.connect(AC.destination);
  /* procedural reverb */
  var len=Math.floor(AC.sampleRate*2.6),ir=AC.createBuffer(2,len,AC.sampleRate);
  for(var c=0;c<2;c++){var d=ir.getChannelData(c);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
  verb=AC.createConvolver();verb.buffer=ir;verbIn=AC.createGain();verbIn.gain.value=.34;verbIn.connect(verb);verb.connect(bus);
 }catch(e){return null}}
 if(AC.state==='suspended'){try{AC.resume()}catch(e){}}
 return AC}

/* ---------- instruments (all write into run.bus + reverb send) ---------- */
function out(g,send){g.connect(run.bus);if(send){var s=AC.createGain();s.gain.value=send;g.connect(s);s.connect(verbIn)}}
function noiseBuf(){if(cache.n)return cache.n;var b=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;return cache.n=b}
/* koto: Karplus-Strong plucked string */
function ksBuf(N){var k='k'+N;if(cache[k])return cache[k];var sr=AC.sampleRate,len=Math.floor(sr*2.6),b=AC.createBuffer(1,len,sr),d=b.getChannelData(0),r=new Float32Array(N);
 for(var i=0;i<N;i++)r[i]=Math.random()*2-1;
 for(var p=0;p<2;p++)for(var j=1;j<N;j++)r[j]=(r[j]+r[j-1])*.5;
 var q=0;for(var n=0;n<len;n++){var a=r[q],x=r[(q+1)%N];r[q]=(a+x)*.5*.9972;q=(q+1)%N;d[n]=a*(n>len-sr*.25?(len-n)/(sr*.25):1)}
 return cache[k]=b}
function koto(f,t,g,send){var sr=AC.sampleRate,N=Math.max(2,Math.round(sr/f)),s=AC.createBufferSource(),gn=AC.createGain(),lp=AC.createBiquadFilter();
 s.buffer=ksBuf(N);s.playbackRate.value=f/(sr/N);lp.type='lowpass';lp.frequency.value=5200;
 gn.gain.value=g;s.connect(lp);lp.connect(gn);out(gn,send==null?.5:send);s.start(t);s.stop(t+2.6)}
/* taiko */
function taiko(t,g,pitch){pitch=pitch||1;
 var o=AC.createOscillator(),og=AC.createGain();o.type='sine';o.frequency.setValueAtTime(130*pitch,t);o.frequency.exponentialRampToValueAtTime(46*pitch,t+.22);
 og.gain.setValueAtTime(0,t);og.gain.linearRampToValueAtTime(g,t+.004);og.gain.exponentialRampToValueAtTime(.001,t+.9);o.connect(og);out(og,.45);o.start(t);o.stop(t+1);
 var n=AC.createBufferSource(),bp=AC.createBiquadFilter(),ng=AC.createGain();n.buffer=noiseBuf();bp.type='bandpass';bp.frequency.value=900;bp.Q.value=.8;
 ng.gain.setValueAtTime(g*.5,t);ng.gain.exponentialRampToValueAtTime(.001,t+.09);n.connect(bp);bp.connect(ng);out(ng,.2);n.start(t);n.stop(t+.12)}
/* wood tick / kakegoe clack */
function tick(t,g,f){var n=AC.createBufferSource(),bp=AC.createBiquadFilter(),ng=AC.createGain();n.buffer=noiseBuf();bp.type='bandpass';bp.frequency.value=f||2600;bp.Q.value=6;
 ng.gain.setValueAtTime(g,t);ng.gain.exponentialRampToValueAtTime(.001,t+.05);n.connect(bp);bp.connect(ng);out(ng,.15);n.start(t);n.stop(t+.07)}
/* shakuhachi: breathy sine with late vibrato */
function flute(f,t,dur,g){var o=AC.createOscillator(),o2=AC.createOscillator(),gn=AC.createGain(),v=AC.createOscillator(),vg=AC.createGain(),
 n=AC.createBufferSource(),bp=AC.createBiquadFilter(),ng=AC.createGain();
 o.type='sine';o.frequency.value=f;o2.type='triangle';o2.frequency.value=f*2;
 var g2=AC.createGain();g2.gain.value=.12;o2.connect(g2);
 v.frequency.value=5.2;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.006,t+Math.min(dur*.7,.9));v.connect(vg);vg.connect(o.frequency);
 gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(g,t+.09);gn.gain.setValueAtTime(g,t+Math.max(.1,dur-.25));gn.gain.linearRampToValueAtTime(0,t+dur+.18);
 n.buffer=noiseBuf();n.loop=true;bp.type='bandpass';bp.frequency.value=f*2.1;bp.Q.value=2.5;
 ng.gain.setValueAtTime(0,t);ng.gain.linearRampToValueAtTime(g*.55,t+.04);ng.gain.exponentialRampToValueAtTime(g*.12,t+.3);ng.gain.linearRampToValueAtTime(0,t+dur+.15);
 o.connect(gn);g2.connect(gn);n.connect(bp);bp.connect(ng);ng.connect(gn);out(gn,.7);
 o.start(t);o2.start(t);v.start(t);n.start(t);var e=t+dur+.3;o.stop(e);o2.stop(e);v.stop(e);n.stop(e)}
/* swelling string pad */
function pad(freqs,t,dur,g){var lp=AC.createBiquadFilter(),gn=AC.createGain();lp.type='lowpass';lp.Q.value=.6;
 lp.frequency.setValueAtTime(350,t);lp.frequency.linearRampToValueAtTime(380+run.I*1500,t+dur*.6);lp.frequency.linearRampToValueAtTime(300,t+dur+1.4);
 gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(g,t+dur*.45);gn.gain.linearRampToValueAtTime(0,t+dur+1.4);lp.connect(gn);out(gn,.6);
 freqs.forEach(function(f){[-6,6].forEach(function(dt){var o=AC.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=dt;o.connect(lp);o.start(t);o.stop(t+dur+1.5)})})}
/* temple bell / gong */
function bell(f,t,g){[1,2.76,5.4,8.93].forEach(function(r,i){var o=AC.createOscillator(),gn=AC.createGain();o.type='sine';o.frequency.value=f*r;
 gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(g/(1+i*1.4),t+.006);gn.gain.exponentialRampToValueAtTime(.0005,t+5.2/(1+i*.5));o.connect(gn);out(gn,.8);o.start(t);o.stop(t+5.4)})}
/* continuous drone (lives for the whole theme run) */
function drone(f,g){var gn=AC.createGain(),lp=AC.createBiquadFilter(),l=AC.createOscillator(),lg=AC.createGain();lp.type='lowpass';lp.frequency.value=260;
 l.frequency.value=.11;lg.gain.value=90;l.connect(lg);lg.connect(lp.frequency);gn.gain.value=g;
 [1,2.003,.5].forEach(function(r,i){var o=AC.createOscillator();o.type=i==2?'sine':'sawtooth';o.frequency.value=f*r;var og=AC.createGain();og.gain.value=i==2?1.3:.5;o.connect(og);og.connect(lp);o.start();run.nodes.push(o)});
 l.start();run.nodes.push(l);lp.connect(gn);out(gn,.3)}

/* ---------- themes: ambient, sparse, no beat. They sit under the site's own rain/ambient bed ---------- */
var walk=3;
function rwalk(){walk=clamp(walk+(Math.random()<.5?-1:1)*(1+Math.floor(Math.random()*2)),0,9);return walk}
var THEMES={
 skills:{bpm:60,bars:8,start:function(){drone(mhz(38),.07)},
  step:function(s,t,I,sd){var bar=Math.floor(s/16)%8,st=s%16;
   /* a few soft koto notes drifting through the scale, more of them as you dive deeper */
   if((st===0||st===6||st===10)&&Math.random()<.3+I*.3)koto(deg(rwalk(),50),t+Math.random()*.15,.13+I*.05,.9);
   /* now and then a distant breath of flute */
   if(st===0&&bar%4===2&&I>.25)flute(deg(3+Math.floor(Math.random()*3),62),t,sd*10,.05+I*.03);
   /* a very low, quiet bell at the top of the loop */
   if(st===0&&bar===0)bell(mhz(38+12),t,.045)}},
 experience:{bpm:52,bars:8,start:function(){drone(mhz(31),.08)},
  step:function(s,t,I,sd){var bar=Math.floor(s/16)%8,st=s%16;
   var CH=[[43,50,55],[43,50,55],[39,46,51],[39,46,51],[46,53,58],[46,53,58],[50,57,62],[50,57,62]];
   if(st===0&&bar%2===0)pad(CH[bar].map(mhz),t,sd*28,.035+I*.02);
   if(st===0&&(bar===0||bar===4))bell(mhz(55),t,.06);
   var M=[[[0,3],[8,4]],[[4,1]],[[0,4],[8,5]],[[6,3]],[[0,5],[8,4]],[[4,6]],[[0,7],[8,5]],[[0,5]]][bar];
   M.forEach(function(n){if(n[0]===st)koto(deg(n[1],55),t,.15,.9)});
   if(I>.5&&bar===5&&st===0)flute(deg(8,55),t,sd*12,.05)}}
};

/* ---------- scheduler ---------- */
function startTheme(key){
 if(run&&run.key===key)return;stopTheme();if(!ctx())return;
 var th=THEMES[key],b=AC.createGain();b.gain.value=0;b.connect(bus);b.gain.setTargetAtTime(1,AC.currentTime,2.4);
 run={key:key,th:th,bus:b,nodes:[],I:.3,tI:.3,s:0,t:AC.currentTime+1.2,sd:60/th.bpm/4};th.start();
 run.id=setInterval(pump,45)}
function stopTheme(){
 if(!run)return;var r=run;run=null;clearInterval(r.id);
 try{r.bus.gain.cancelScheduledValues(AC.currentTime);r.bus.gain.setTargetAtTime(0,AC.currentTime,1.3)}catch(e){}
 setTimeout(function(){try{r.nodes.forEach(function(n){try{n.stop()}catch(e){}});r.bus.disconnect()}catch(e){}},8000)}
function prog(){var el=$(run.key);if(!el)return 0;var m=el.scrollHeight-el.clientHeight;return m>20?clamp(el.scrollTop/m,0,1):0}
function pump(){
 if(!run||!AC)return;
 run.tI=clamp(.3+prog()*.7,0,1);run.I+=(run.tI-run.I)*.08;
 var th=run.th,total=th.bars*16;
 while(run.t<AC.currentTime+.3){
  try{th.step(run.s%total,run.t,run.I,run.sd)}catch(e){}
  run.t+=run.sd;run.s++}}

/* ---------- which theme should be playing? ---------- */
function want(){
 if(!on()||document.hidden)return null;
 var dojo=$('dojo');if(dojo&&!dojo.hidden)return null;
 var cs=$('case');if(cs&&cs.classList.contains('on'))return null;
 if($('skills')&&$('skills').classList.contains('on'))return 'skills';
 if($('experience')&&$('experience').classList.contains('on'))return 'experience';
 return null}
function sync(){var w=want();if(w)startTheme(w);else stopTheme()}

['skills','experience','case','dojo'].forEach(function(id){var el=$(id);if(el)new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:['class','hidden']})});
var sb=$('snd');if(sb){sb.addEventListener('click',function(){setTimeout(function(){if(on())ctx();sync()},0)});new MutationObserver(sync).observe(sb,{attributes:true,attributeFilter:['aria-pressed']})}
window.addEventListener('hashchange',sync);
document.addEventListener('visibilitychange',function(){if(document.hidden){if(AC)try{AC.suspend()}catch(e){}}else{if(AC&&on())try{AC.resume()}catch(e){}}sync()});

/* ---------- soft stingers ---------- */
document.addEventListener('click',function(e){
 if(!run||!AC||!e.target.closest)return;var t=AC.currentTime+.01;
 if(e.target.closest('.sk'))koto(deg(Math.floor(Math.random()*8),run.key==='skills'?62:67),t,.14,.9);
 else if(e.target.closest('.xhead'))bell(mhz(67),t,.05)},true);
function watchText(id,fn){var el=$(id);if(!el)return;var last=el.textContent;new MutationObserver(function(){var n=el.textContent;if(n!==last){last=n;fn()}}).observe(el,{childList:true,characterData:true,subtree:true})}
watchText('xch',function(){if(run&&run.key==='experience'&&AC)bell(mhz(67),AC.currentTime+.02,.055)});
watchText('sk3g',function(){if(run&&run.key==='skills'&&AC)koto(deg(2+Math.floor(Math.random()*5),50),AC.currentTime+.02,.14,.9)});

/* ---------- fix: experience card text stayed invisible (opacity 0 from #tl .xl>li beat the open rule) ---------- */
(function(){var tl=$('tl');if(!tl||!window.MutationObserver)return;
 function openLive(){[].forEach.call(tl.querySelectorAll('li.xp.cur,li.xp.lit'),function(li){if(!li.classList.contains('open')){li.classList.add('open');var h=li.querySelector('.xhead');if(h)h.setAttribute('aria-expanded','true')}})}
 new MutationObserver(openLive).observe(tl,{attributes:true,attributeFilter:['class'],subtree:true});
 new MutationObserver(function(){if(document.body.classList.contains('jdone'))[].forEach.call(tl.querySelectorAll('li.xp'),function(li){li.classList.add('open')})}).observe(document.body,{attributes:true,attributeFilter:['class']});
 openLive()})();
sync();
})();
