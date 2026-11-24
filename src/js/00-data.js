/* Model data loader.
   Lean build: the heavy base64 payloads are NOT inside index.html. They are separate cacheable files that start downloading
   the moment this script runs, in parallel, while the loader screen shows real download progress.
   - "eager" payloads (samurai, scythe, torii, lantern) are filled into their placeholder <script type="text/plain" id="..."> elements, then the
     deferred scene scripts run (window.__jtBoot, called at the end of <body>), so they see exactly the same data as the single-file build.
   - "lazy" payloads (oni gate, oni texture, blood moon) are fetched in the background after the home page is up; consumers use window.__jtData(id).
   Single-file build (--inline): window.__JT_DATA is undefined and __jtData just reads the element text. */
(function(){
'use strict';
var w=window,d=document,M=w.__JT_DATA,by={};
if(!M){w.__jtData=function(id){var e=d.getElementById(id);return Promise.resolve(e?e.textContent:'')};return}
var dl=w.__jtDl={loaded:0,total:0,last:performance.now(),failed:false};
M.forEach(function(m){by[m.id]=m;if(m.eager)dl.total+=m.size});
function recalc(){var s=0;M.forEach(function(m){if(m.eager)s+=Math.min(m.l||0,m.size)});dl.loaded=s;dl.last=performance.now()}
function get(m){
 if(m.p)return m.p;
 m.l=0;
 m.p=new Promise(function(res){
  var tries=0;
  function fail(e){tries++;m.l=0;recalc();if(tries<3)setTimeout(go,700*tries);else{m.err=e;if(m.eager)dl.failed=true;try{console.warn('data load failed',m.id,e&&e.message||e)}catch(x){}res('')}}
  function go(){
   fetch(m.url,{credentials:'same-origin'}).then(function(r){
    if(!r.ok)throw new Error('HTTP '+r.status);
    if(!r.body||!r.body.getReader||!w.TextDecoder)return r.text();
    var rd=r.body.getReader(),dec=new TextDecoder(),parts=[];
    return (function pump(){return rd.read().then(function(x){
     if(x.done){parts.push(dec.decode());return parts.join('')}
     parts.push(dec.decode(x.value,{stream:true}));m.l+=x.value.length;recalc();return pump()})})()
   }).then(function(t){if(t.length<m.size)throw new Error('truncated download');m.l=m.size;recalc();res(t)},fail)}
  go()});
 return m.p}
w.__jtData=function(id){
 var e=d.getElementById(id);if(e&&e.textContent)return Promise.resolve(e.textContent);
 var m=by[id];return m?get(m):Promise.resolve('')};
var eager=M.filter(function(m){return m.eager});
eager.forEach(get);
w.__jtBoot=function(){
 Promise.all(eager.map(get)).then(function(txt){
  eager.forEach(function(m,i){var e=d.getElementById(m.id);if(e)e.textContent=txt[i];m.p=Promise.resolve('')});
  if(dl.failed){d.documentElement.classList.add('nofx');if(d.body)d.body.classList.add('ui-in')}
  w.__jtRanAt=performance.now();
  [].slice.call(d.querySelectorAll('script[data-jt-run]')).forEach(function(p){
   var s=d.createElement('script');
   [].forEach.call(p.attributes,function(a){if(a.name!=='type'&&a.name!=='data-jt-run')s.setAttribute(a.name,a.value)});
   s.text=p.text;p.parentNode.replaceChild(s,p)});
  setTimeout(function(){M.forEach(function(m){if(!m.eager)get(m)})},1200)})};
})();
