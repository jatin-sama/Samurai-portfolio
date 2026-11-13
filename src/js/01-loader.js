
(function(){
'use strict';
var L=document.getElementById('ldr');if(!L)return;
var doc=document,root=doc.documentElement,body=doc.body,T0=performance.now();
var reduce=false;try{reduce=(window.__RM===true)}catch(e){}
var fast=false;try{fast=!!sessionStorage.getItem('jt_ldr')||(location.hash&&location.hash!=='#top'&&location.hash!=='#')}catch(e){}
window.__ldrHold=true;setTimeout(function(){window.__ldrHold=false},30000);
(function(){var h='',i;for(i=0;i<11;i++)h+='<i style="--x:'+(Math.random()*100).toFixed(1)+'%;--s:'+(5+Math.random()*5).toFixed(1)+'px;--t:'+(7+Math.random()*6).toFixed(1)+'s;--l:-'+(Math.random()*12).toFixed(1)+'s;--dx:'+((Math.random()-.3)*220).toFixed(0)+'px"></i>';L.querySelector('.pts').innerHTML=h})();
var ST={fonts:0,boot:0,sam:0,frm:0},W={fonts:.15,boot:.2,sam:.5,frm:.15};
function target(){var t=0,k;for(k in W)t+=W[k]*ST[k];return t}
try{Promise.race([doc.fonts.load('300 20px Jost'),new Promise(function(r){setTimeout(r,3000)})]).then(function(){ST.fonts=1},function(){ST.fonts=1})}catch(e){ST.fonts=1}
function allDone(){ST.fonts=ST.boot=ST.sam=ST.frm=1}
var samSeen=false,held=[];
var poll=setInterval(function(){
 if(window.__samAB&&!samSeen){samSeen=true;ST.boot=1;
  window.__samAB.then(function(){requestAnimationFrame(function(){requestAnimationFrame(function(){requestAnimationFrame(function(){ST.sam=1;ST.frm=1})})})},function(){ST.sam=1;ST.frm=1})}
 if(root.classList.contains('nofx'))allDone();
 if(performance.now()-T0>16000)allDone()
},60);
doc.addEventListener('DOMContentLoaded',function(){
 [].forEach.call(body.children,function(el){if(el===L||el.tagName==='SCRIPT'||el.tagName==='STYLE'||el.hasAttribute('inert'))return;el.setAttribute('inert','');held.push(el)});
 setTimeout(function(){if(!window.__samAB)allDone()},700)});
function unhold(){held.forEach(function(el){el.removeAttribute('inert')});held=[]}
var N=doc.getElementById('ldrN'),B=doc.getElementById('ldrBar'),p=0,lastN=-1,lastA=-1,t0=performance.now(),phase=0,minT=fast?300:2200;
function frame(now){
 var dt=Math.min((now-t0)/1000,.1);t0=now;
 var done=ST.fonts&&ST.boot&&ST.sam&&ST.frm,tg=target(),ceil=done?1:Math.min(.97,tg+.07);
 p+=(ceil-p)*(1-Math.exp(-dt*(p<tg?3.2:.3)));if(done&&p>.995)p=1;
 L.style.setProperty('--p',p.toFixed(4));
 var n=Math.round(p*100);if(n!==lastN){lastN=n;N.textContent=n;if(n%10===0&&n!==lastA){lastA=n;B.setAttribute('aria-valuenow',n)}}
 if(!phase&&done&&p>=1&&performance.now()-T0>=minT){phase=1;finish();return}
 if(phase!==3)requestAnimationFrame(frame)}
requestAnimationFrame(function(n){t0=n;frame(n)});
function finish(){
 L.classList.add('done');L.setAttribute('aria-busy','false');
 if(!reduce&&navigator.vibrate)try{navigator.vibrate(16)}catch(e){}
 setTimeout(enter,reduce?150:750)}
function release(){
 window.__ldrHold=false;window.__ldrT=2;unhold();
 try{sessionStorage.setItem('jt_ldr','1')}catch(e){}
 L.style.display='none';setTimeout(function(){if(L.parentNode)L.parentNode.removeChild(L);var c=doc.getElementById('ldr-css');if(c&&c.parentNode)c.parentNode.removeChild(c)},60)}
function enter(){
 if(phase===3)return;phase=3;clearInterval(poll);unhold();
 var go=false;function once(){if(go)return;go=true;release()}
 if(!reduce&&typeof window.Slash==='function'){try{window.Slash(once)}catch(e){once()};setTimeout(once,900)}
 else{L.classList.add('out');setTimeout(once,650)}}
})();
