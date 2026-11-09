
/* Kitsune guide: after the home intro ends, she points the visitor at the sound button. Shows once per visitor. */
(function(){
var KEY='jamtin_kg_seen',body=document.body,snd=document.getElementById('snd'),kg=document.getElementById('kg');
if(!snd||!kg)return;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,shown=false,done=false,timers=[],typeT=null,skipped=false;
function seen(){try{return localStorage.getItem(KEY)==='1'}catch(e){return false}}
function mark(){try{localStorage.setItem(KEY,'1')}catch(e){}}
function soundOn(){return snd.getAttribute('aria-pressed')==='true'}
function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t}
var tx=document.getElementById('kgTx');
function type(html,cb){
 clearInterval(typeT);tx.innerHTML='';
 var tmp=document.createElement('div');tmp.innerHTML=html;var plain=tmp.textContent;
 var sr=document.getElementById('kgSr');if(sr)sr.textContent=plain;
 if(reduce){tx.innerHTML=html;if(cb)cb();return}
 var i=0;tx.classList.add('type');
 typeT=setInterval(function(){i++;tx.textContent=plain.slice(0,i);
  if(i>=plain.length){clearInterval(typeT);tx.classList.remove('type');tx.innerHTML=html;if(cb)cb()}},26)}
function bell(){try{
 var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;var c=new AC(),t=c.currentTime,m=c.createGain();m.gain.value=.5;m.connect(c.destination);
 [0,.16,.34].forEach(function(d,k){[[1320,.5],[3640,.22],[7100,.08]].forEach(function(p){
  var o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=p[0]*(1+k*.012);
  g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(p[1]*.5,t+d+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d+1.1);
  o.connect(g);g.connect(m);o.start(t+d);o.stop(t+d+1.2)})});
 setTimeout(function(){try{c.close()}catch(e){}},2200)}catch(e){}}
function finish(){
 if(done)return;done=true;mark();timers.forEach(clearTimeout);clearInterval(typeT);
 kg.classList.add('out');body.classList.remove('kg-on');
 document.removeEventListener('keydown',onKey);
 setTimeout(function(){kg.classList.remove('on','in','out','shut','blink');kg.style.display='none'},900)}
function onKey(e){if(e.key==='Escape'&&shown&&!done)decline()}
function decline(){
 if(done)return;done=true;mark();timers.forEach(clearTimeout);
 document.removeEventListener('keydown',onKey);
 type('Very well\u2026 but you\u2019ll miss the best part.',function(){later(function(){done=false;finish()},1300)})}
function accepted(){
 if(done)return;timers.forEach(clearTimeout);clearInterval(typeT);tx.classList.remove('type');
 kg.classList.add('shut');bell();
 type('Mm\u2026 <b>perfect</b>. Listen well, and enjoy.',function(){later(finish,1400)})}
function show(){
 if(shown||seen()||soundOn())return;shown=true;
 kg.classList.add('on');body.classList.add('kg-on');
 requestAnimationFrame(function(){requestAnimationFrame(function(){kg.classList.add('in')})});
 document.addEventListener('keydown',onKey);
 later(function(){
  type('Psst\u2026 before you go further, <b>turn on the sound</b>.',function(){
   later(function(){type('The bells, the blades, the whispers: this place was made to be <b>heard</b>.')},700)})},900);
 if(!reduce){(function bl(){later(function(){if(done)return;if(!kg.classList.contains('shut')){kg.classList.add('blink');later(function(){kg.classList.remove('blink')},130)}bl()},3200+Math.random()*1600)})()}
 later(function(){if(!done)decline()},22000)}
snd.addEventListener('click',function(){if(!shown||done)return;setTimeout(function(){if(soundOn())accepted()},0)});
document.getElementById('kgDim').addEventListener('click',decline);
document.getElementById('kgLater').addEventListener('click',decline);
var sk=document.getElementById('skip');if(sk)sk.addEventListener('click',function(){skipped=true});
var armed=false;
function arm(){if(armed)return;armed=true;mo.disconnect();
 /* ui-in lands ~1.8s before the zoom finishes; add 1s after the zoom (shorter when skipped or reduced motion / no WebGL) */
 var fast=reduce||skipped||document.documentElement.classList.contains('nofx');
 setTimeout(show,fast?1000:2800)}
var mo=new MutationObserver(function(){if(body.classList.contains('ui-in'))arm()});
mo.observe(body,{attributes:true,attributeFilter:['class']});
if(body.classList.contains('ui-in'))arm();
})();
