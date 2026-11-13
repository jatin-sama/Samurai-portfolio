/* Diagnostics panel. Does nothing unless the URL contains ?diag
   Extra test switches (combine with &): pr=1 (force 3D resolution), noperf (no frame cap / auto quality), nolimit (no frame cap), noglow, nocursor.
   Example: jamtin.me/?diag&pr=1 */
(function(){
'use strict';
var w=window,d=document,q=location.search;
if(!/[?&]diag\b/.test(q))return;
function param(k){var m=new RegExp('[?&]'+k+'=([^&]*)').exec(q);return m?decodeURIComponent(m[1]):null}
function has(k){return new RegExp('[?&]'+k+'\\b').test(q)}
var logs=[],longTasks=0;
function push(t,a){try{logs.push(t+': '+[].slice.call(a).map(function(x){return x&&x.message?x.message:String(x)}).join(' ').slice(0,150));if(logs.length>6)logs.shift()}catch(e){}}
['warn','error'].forEach(function(k){var o=console[k];console[k]=function(){push(k,arguments);return o.apply(console,arguments)}});
w.addEventListener('error',function(e){push('error',[(e.message||'?')+' @'+String(e.filename||'').split('/').pop()+':'+(e.lineno||0)])});
w.addEventListener('unhandledrejection',function(e){push('promise',[e.reason])});
try{new PerformanceObserver(function(l){longTasks+=l.getEntries().length}).observe({entryTypes:['longtask']})}catch(e){}

/* experiments */
var st=d.createElement('style'),css='';
if(has('noglow'))css+='#kglow{display:none!important}';
if(has('nocursor'))css+='#kc{display:none!important}html.kc-on{cursor:auto!important}';
if(css){st.textContent=css;(d.head||d.documentElement).appendChild(st)}
var pr=parseFloat(param('pr'));
if(pr>0){var tries=0,iv=setInterval(function(){if(w.__setPR){clearInterval(iv);try{w.__setPR(pr)}catch(e){}}else if(++tries>120)clearInterval(iv)},500)}

/* measurements */
var fps=0,dts=[],prev=0,fr=0,fs=0;
function tick(t){if(prev){var dt=t-prev;if(dt>1&&dt<100){dts.push(dt);if(dts.length>400)dts.shift()}}prev=t;fr++;if(!fs)fs=t;
 if(t-fs>=1000){fps=fr*1000/(t-fs);fr=0;fs=t}requestAnimationFrame(tick)}
function gpu(){
 var c=d.getElementById('c'),gl=null,tmp=false;
 try{if(c){gl=c.getContext('webgl2')||c.getContext('webgl')}}catch(e){}
 if(!gl){try{c=d.createElement('canvas');tmp=true;gl=c.getContext('webgl2')||c.getContext('webgl')}catch(e){}}
 if(!gl)return{name:'NO WEBGL',ver:'-',soft:true};
 var ext=gl.getExtension('WEBGL_debug_renderer_info'),name=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
 var ver=gl.getParameter(gl.VERSION);
 return{name:String(name),ver:String(ver).slice(0,40),soft:/swiftshader|llvmpipe|software|basic render|microsoft/i.test(String(name)),intel:/intel/i.test(String(name)),tmp:tmp}}
var G=null;
function lines(){
 if(!G)G=gpu();
 var sorted=dts.slice().sort(function(a,b){return a-b}),p25=sorted.length?sorted[Math.floor(sorted.length*.25)]:0,
  hz=p25?Math.round(1000/p25):0,
  worst=sorted.length?Math.round(1000/sorted[sorted.length-1]):0,
  m=d.querySelector('meta[name="jt-build"]'),mem=(performance&&performance.memory)?Math.round(performance.memory.usedJSHeapSize/1048576)+' MB':'n/a',
  ver=(navigator.userAgent.match(/(Chrome|Firefox|Edg|Safari)\/[\d.]+/g)||[]).slice(-2).join(' ');
 var out=[
  ['build',m?m.content:'MISSING (old deploy?)'],
  ['browser',ver],
  ['GPU',G.name+(G.soft?'   <<< SOFTWARE RENDERING':G.intel?'   (integrated GPU)':'')],
  ['WebGL',G.ver],
  ['screen',screen.width+'x'+screen.height+' @'+(w.devicePixelRatio||1)+'x, viewport '+innerWidth+'x'+innerHeight],
  ['3D pixel ratio',w.__getPR?w.__getPR().toFixed(2):'n/a (scene not running)'],
  ['live fps',fps?fps.toFixed(0):'...'],
  ['display rate','~'+hz+' Hz, slowest recent frame ~'+worst+' fps'],
  ['frame cap',w.__perf?(w.__perf.limited()?'ON':'off')+', quality level '+w.__perf.level():'n/a'],
  ['cpu / ram',(navigator.hardwareConcurrency||'?')+' threads / '+(navigator.deviceMemory||'?')+' GB'],
  ['reduced motion',matchMedia('(prefers-reduced-motion: reduce)').matches?'YES (many animations are skipped!)':'no'],
  ['THREE / gsap',(!!w.THREE)+' / '+(!!w.gsap)],
  ['decompression',typeof w.DecompressionStream==='function'?'ok':'MISSING'],
  ['no-3D mode',d.documentElement.classList.contains('nofx')?'YES':'no'],
  ['scythe ready',!!w.__scyKit],
  ['long tasks',longTasks+' (JS heap '+mem+')']];
 logs.forEach(function(l){out.push(['log',l])});
 return out}
function build(){
 var box=d.createElement('div');box.id='jt-diag';
 box.style.cssText='position:fixed;right:8px;bottom:8px;z-index:2147483000;width:min(94vw,390px);max-height:70vh;overflow:auto;padding:10px 12px;background:rgba(0,0,0,.88);color:#d7f5e0;font:11px/1.45 ui-monospace,Consolas,monospace;border:1px solid #3a7;border-radius:6px;pointer-events:auto;cursor:auto';
 var pre=d.createElement('div'),bar=d.createElement('div');bar.style.cssText='display:flex;gap:8px;margin-top:8px';
 function btn(t,fn){var b=d.createElement('button');b.type='button';b.textContent=t;b.style.cssText='font:inherit;padding:6px 10px;min-height:32px;background:#133;color:#d7f5e0;border:1px solid #3a7;border-radius:4px;cursor:pointer';b.onclick=fn;bar.appendChild(b)}
 function text(){return lines().map(function(r){return r[0]+': '+r[1]}).join('\n')}
 btn('Copy report',function(){try{navigator.clipboard.writeText(text())}catch(e){}});
 btn('Close',function(){box.remove()});
 box.appendChild(pre);box.appendChild(bar);d.body.appendChild(box);
 function paint(){pre.innerHTML='';lines().forEach(function(r){var row=d.createElement('div'),k=d.createElement('span'),v=d.createElement('span');
  k.textContent=r[0]+': ';k.style.color='#7fd';v.textContent=r[1];if(/SOFTWARE|MISSING|YES|false/.test(r[1]))v.style.color='#ff8a7a';row.appendChild(k);row.appendChild(v);pre.appendChild(row)})}
 paint();setInterval(paint,1000)}
requestAnimationFrame(tick);
if(d.body)setTimeout(build,1200);else d.addEventListener('DOMContentLoaded',function(){setTimeout(build,1200)});
})();
