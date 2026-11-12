/* JT: tiny analytics layer. Provider-agnostic, no cookies of its own, no personal data.
   Provider comes from the build (analytics.config.json or ANALYTICS_* env vars) as window.__JT_ANALYTICS.
   Add ?jtdebug to any URL to log events to the console. Visit ?notrack=1 once to exclude your own browser (?notrack=0 undoes it). */
(function(){
'use strict';
var w=window,d=document,root=d.documentElement,cfg=w.__JT_ANALYTICS||{},P=String(cfg.provider||'none').toLowerCase(),
 debug=/[?&]jtdebug\b/.test(location.search),q=[],ready=false,sent={};
try{if(/[?&]notrack=1\b/.test(location.search))localStorage.setItem('jt_notrack','1');if(/[?&]notrack=0\b/.test(location.search))localStorage.removeItem('jt_notrack')}catch(e){}
var off=false;try{off=navigator.doNotTrack==='1'||w.doNotTrack==='1'||localStorage.getItem('jt_notrack')==='1'}catch(e){}
function bucket(ms){var s=ms/1000;return s<2?'<2s':s<4?'2-4s':s<8?'4-8s':s<16?'8-16s':'16s+'}
function now(){return Math.round(performance.now())}

/* ---- provider glue ---- */
function dispatch(n,p){
 try{
  if(P==='umami'){if(w.umami&&w.umami.track)w.umami.track(n,p);else return false}
  else if(P==='goatcounter'){if(w.goatcounter&&w.goatcounter.count)w.goatcounter.count({path:'event/'+n+(p&&p.v!=null?'/'+p.v:''),title:n,event:true});else return false}
  else if(P==='plausible'){w.plausible(n,{props:p})}
  else if(P==='ga4'){w.gtag('event',n,p)}
 }catch(e){}
 return true}
function flush(){ready=true;while(q.length){var e=q.shift();dispatch(e[0],e[1])}}
function loadProvider(){
 if(off||P==='none'||!cfg.id)return;
 var s=d.createElement('script');s.async=true;
 if(P==='umami'){s.src=cfg.src||'https://cloud.umami.is/script.js';s.setAttribute('data-website-id',cfg.id);s.onload=flush}
 else if(P==='goatcounter'){s.src=cfg.src||'https://gc.zgo.at/count.js';s.setAttribute('data-goatcounter','https://'+cfg.id+'.goatcounter.com/count');s.onload=flush}
 else if(P==='plausible'){w.plausible=w.plausible||function(){(w.plausible.q=w.plausible.q||[]).push(arguments)};s.src=cfg.src||'https://plausible.io/js/script.js';s.setAttribute('data-domain',cfg.id);ready=true}
 else if(P==='ga4'){w.dataLayer=w.dataLayer||[];w.gtag=function(){w.dataLayer.push(arguments)};w.gtag('js',new Date());
  w.gtag('config',cfg.id,{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false});
  s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(cfg.id);ready=true}
 else return;
 s.onerror=function(){q.length=0};
 (d.head||root).appendChild(s)}

function track(n,p){
 p=p||{};
 if(debug)try{console.log('[JT]',n,p)}catch(e){}
 if(off||P==='none'||!cfg.id)return;
 if(ready){dispatch(n,p)}else if(q.length<60){q.push([n,p])}}
function once(n,p,key){key=key||n;if(sent[key])return;sent[key]=1;track(n,p)}
w.JT={track:track,once:once,bucket:bucket};
loadProvider();

/* ---- session context ---- */
var c=navigator.connection||{},ref='';try{ref=d.referrer?new URL(d.referrer).hostname.replace(/^www\./,''):'direct'}catch(e){ref='?'}
if(ref===location.hostname)ref='internal';
track('session_start',{v:w.innerWidth<700?'mobile':w.innerWidth<1100?'tablet':'desktop',net:c.effectiveType||'?',save:c.saveData?1:0,ref:ref,fast:(function(){try{return sessionStorage.getItem('jt_ldr')?'return':'new'}catch(e){return'?'}})()});

/* ---- loader funnel ---- */
var ldrN=function(){var e=d.getElementById('ldrN');return e?parseInt(e.textContent,10)||0:0},
 loaderDone=false,homeReady=false,lastChapter='',chapters=0;
function stage(){return !loaderDone?'loader':!homeReady?'intro':(lastChapter||'home')}
var bodyObs=new MutationObserver(function(){
 if(!loaderDone&&!d.getElementById('ldr')){
  loaderDone=true;var ms=now();
  track('loader_done',{v:bucket(ms),ms:ms,failopen:ms>=16000?1:0});
  if(root.classList.contains('nofx'))track('fallback_mode',{v:'no3d'})}
 if(!homeReady&&d.body.classList.contains('ui-in')){
  homeReady=true;var t=now();track('scene_ready',{v:bucket(t),ms:t})}
 if(loaderDone&&homeReady)bodyObs.disconnect()});
function startObs(){bodyObs.observe(d.body,{childList:true,attributes:true,attributeFilter:['class']});if(d.body.classList.contains('ui-in'))homeReady=true}
if(d.body)startObs();else d.addEventListener('DOMContentLoaded',startObs);
setTimeout(function(){if(!loaderDone)once('loader_slow',{v:String(ldrN()),pct:ldrN()})},8000);

/* ---- journey ---- */
var sections=['about','projects','skills','experience','contact','case'];
function caseName(){var e=d.querySelector('#cs h1,#cs h2,#cs h3');return e?e.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,30):''}
function watchSections(){
 sections.forEach(function(id){
  var el=d.getElementById(id);if(!el)return;
  new MutationObserver(function(){
   if(el.hasAttribute('inert'))return;
   if(id==='case'){setTimeout(function(){track('project_open',{v:caseName()||'unknown'})},120);return}
   lastChapter=id;if(!sent['ch_'+id]){chapters++}once('chapter',{v:id},'ch_'+id)
  }).observe(el,{attributes:true,attributeFilter:['inert']})})}
d.addEventListener('DOMContentLoaded',function(){
 watchSections();
 var e=d.getElementById('enter');if(e)e.addEventListener('pointerdown',function(){once('begin_hold_start',{v:bucket(now())})},{passive:true});
 var j=w.JSND;
 if(j&&j.holdDone&&!j.__jt){var o=j.holdDone;j.__jt=1;j.holdDone=function(skip){try{if(skip)once('final_gate_open',{v:'open'});else once('journey_begin',{v:bucket(now())})}catch(x){}return o.apply(this,arguments)}}
});

/* ---- interactions ---- */
d.addEventListener('click',function(e){
 var t=e.target;if(!t||!t.closest)return;
 if(t.closest('#snd')){setTimeout(function(){var b=d.getElementById('snd');track('sound',{v:b&&b.getAttribute('aria-pressed')==='true'?'on':'off'})},0);return}
 if(t.closest('[data-copy]')){track('email_copy',{v:'copy'});return}
 var a=t.closest('a[href]');if(!a)return;
 var h=a.getAttribute('href')||'';
 if(h.indexOf('mailto:')===0){track('link',{v:'mailto'});return}
 if(/\.pdf($|\?)/i.test(h)||a.hasAttribute('download')){track('link',{v:'resume'});return}
 try{var u=new URL(a.href,location.href);if(u.hostname&&u.hostname!==location.hostname)track('link',{v:u.hostname.replace(/^www\./,'')})}catch(x){}
},true);
d.addEventListener('focusin',function(e){if(e.target&&e.target.closest&&e.target.closest('#cf'))once('contact_start',{v:'focus'})});

/* ---- engagement, exits, errors ---- */
var active=0;setInterval(function(){if(d.hidden)return;active++;if(active===30)track('engaged',{v:'30s'});if(active===120)track('engaged',{v:'2min'})},1000);
function bye(){if(sent.bye)return;sent.bye=1;track('session_end',{v:stage(),s:Math.round(performance.now()/1000),chapters:chapters});
 if(!loaderDone)track('loader_exit',{v:Math.floor(ldrN()/25)*25+'%',pct:ldrN()})}
d.addEventListener('visibilitychange',function(){if(d.visibilityState==='hidden')bye()});
w.addEventListener('pagehide',bye);
var errs=0;
w.addEventListener('error',function(e){if(errs++>=3||!e.message)return;track('js_error',{v:String(e.message).slice(0,60),src:String(e.filename||'').split('/').pop().slice(0,30),line:e.lineno||0})});
w.addEventListener('unhandledrejection',function(e){if(errs++>=3)return;var r=e&&e.reason;track('js_error',{v:String(r&&r.message||r||'rejection').slice(0,60),src:'promise'})});
d.addEventListener('webglcontextlost',function(){once('webgl_lost',{v:'lost'})},true);
})();
