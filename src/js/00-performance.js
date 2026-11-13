/* Performance guard.
   1) On 100 Hz+ displays the animation loop is capped (a 165 Hz screen otherwise renders the 3D scene 165 times a second).
   2) If the frame rate stays low, the 3D resolution is lowered step by step (and the glow layer is dropped). Quality is never raised again in the same session.
   Add ?jtdebug to the URL to log what it decides. */
(function(){
'use strict';
var w=window,d=document,root=d.documentElement,debug=/[?&]jtdebug\b/.test(location.search),
 nRAF=w.requestAnimationFrame.bind(w),nCAF=w.cancelAnimationFrame.bind(w);
function log(){if(debug)try{console.log.apply(console,['[perf]'].concat([].slice.call(arguments)))}catch(e){}}
function track(n,p){try{if(w.JT)w.JT.track(n,p)}catch(e){}}
try{var meta=d.querySelector('meta[name="jt-build"]');if(meta)log('build',meta.content)}catch(e){}

/* ---- 1. frame limiter for high-refresh displays ---- */
var limit=false,minInt=0,nid=1073741824,live={},lastRun=new WeakMap();
w.requestAnimationFrame=function(cb){
 if(!limit||typeof cb!=='function')return nRAF(cb);
 var id=++nid;
 function tick(t){
  var l=lastRun.get(cb);
  if(l!==undefined&&t-l<minInt){live[id]=nRAF(tick);return}
  lastRun.set(cb,t);delete live[id];cb(t)}
 live[id]=nRAF(tick);return id};
w.cancelAnimationFrame=function(id){if(live[id]!==undefined){nCAF(live[id]);delete live[id]}else nCAF(id)};

var dts=[],prev=0,probes=0;
function measure(t){
 if(prev&&!d.hidden){var dt=t-prev;if(dt>1&&dt<100)dts.push(dt)}
 prev=t;probes++;
 if(dts.length>=150||probes>500){decide();return}
 nRAF(measure)}
function decide(){
 if(dts.length<20)return;
 dts.sort(function(a,b){return a-b});
 var p25=dts[Math.floor(dts.length*.25)]||16.7,hz=1000/p25;
 log('display about',Math.round(hz),'Hz');
 if(hz>=100){var n=Math.max(2,Math.round(hz/72));minInt=(n-.5)*1000/hz;limit=true;log('frame limiter on: scene runs every',n,'frames (~'+Math.round(hz/n)+' fps)');track('perf_limiter',{v:Math.round(hz)+'hz'})}}
nRAF(measure);

/* ---- 2. adaptive resolution ---- */
var STEPS=[1.5,1.25,1,.85,.7],level=0,started=false,bad=0,frames=0,wStart=0,hiddenFlag=false,settle=0;
d.addEventListener('visibilitychange',function(){hiddenFlag=true});
function curPR(){try{return w.__getPR?w.__getPR():(w.devicePixelRatio||1)}catch(e){return 1}}
function downgrade(fps){
 var cur=curPR(),next=0,i;
 for(i=0;i<STEPS.length;i++){if(STEPS[i]<cur-.05){next=STEPS[i];break}}
 level++;
 if(next&&w.__setPR){try{w.__setPR(next)}catch(e){}}
 if(level>=2||!next)root.classList.add('perf-low');
 log('low frame rate (~'+Math.round(fps)+' fps): resolution',cur.toFixed(2),'->',next||'(minimum)','level',level);
 track('perf_downgrade',{v:String(level),fps:Math.round(fps),pr:next||cur})}
function watch(t){
 if(!wStart){wStart=t;frames=0}
 frames++;
 if(hiddenFlag||!d.hasFocus()){hiddenFlag=false;wStart=t;frames=0;nRAF(watch);return}
 if(t-wStart>=2000){
  var fps=frames*1000/(t-wStart);wStart=t;frames=0;
  if(t<settle){nRAF(watch);return}
  if(fps<24)bad+=2;else if(fps<42)bad++;else bad=0;
  if(bad>=2){bad=0;settle=t+2500;downgrade(fps)}
  if(level>=STEPS.length+1)return}
 nRAF(watch)}
function start(){if(started)return;started=true;setTimeout(function(){wStart=0;nRAF(watch)},2500)}
function arm(){
 if(root.classList.contains('nofx'))return;
 if(d.body.classList.contains('ui-in'))return start();
 var mo=new MutationObserver(function(){if(d.body.classList.contains('ui-in')){mo.disconnect();start()}});
 mo.observe(d.body,{attributes:true,attributeFilter:['class']})}
if(d.body)arm();else d.addEventListener('DOMContentLoaded',arm);
w.__perf={level:function(){return level},limited:function(){return limit}};
})();
