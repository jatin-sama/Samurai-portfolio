
/* Cinematic layer: slash-trail input, chapter cards, synthesized sound */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,body=document.body,card=document.getElementById('card');
/* chapter title cards */
var CH={about:['壱','Chapter I','Behind the Mask'],projects:['弐','Chapter II','The Arsenal'],skills:['参','Chapter III','The Disciplines'],experience:['肆','Chapter IV','The Journey'],contact:['伍','Chapter V','The Final Gate']},last=null;
function showChapter(c,under){card.children[0].textContent=c[0];card.children[1].textContent=c[1];card.children[2].textContent=c[2];
 card.classList.remove('on','under');void card.offsetWidth;if(under)card.classList.add('under');card.classList.add('on');if(under)setTimeout(function(){body.classList.add('cine')},900);else body.classList.add('cine');setTimeout(function(){body.classList.remove('cine');card.classList.remove('on','under')},under?2800:2250)}
/* chapter gate: the dark title card fades in FIRST, the new section is swapped in underneath it while it is fully covered, then the card lifts onto a ready section */
var gating=false,gated=false;
window.__chapterGate=function(id,cs,go){var c=CH[id];
 if(gating)return true;
 if(cs||id===last||!c||reduce||window.__cardHold)return false;
 gating=true;showChapter(c);
 setTimeout(function(){gated=true;try{go()}finally{gated=false;gating=false}},700);
 return true};
/* the scythe sequence holds the chapter card back until its slash has fully finished, then releases it */
window.__showChapter=function(under){var c=window.__cardPending;window.__cardPending=null;window.__cardHold=false;if(c)showChapter(c,!!under);return !!c};
document.addEventListener('portfolio:view',function(e){var d=e.detail,c=CH[d.id];if(gated){last=d.id;return}if(d.cs||d.id===last||!c||reduce){last=d.id;return}last=d.id;
 if(window.__cardHold){window.__cardPending=c;return}showChapter(c)});
/* audio: samples via JSND */
var on=false,btn=document.getElementById('snd');
function whoosh(){JSND.play('slash')}
btn.addEventListener('click',function(){on=!on;btn.setAttribute('aria-pressed',on);btn.style.color=on?'#e0343f':'';JSND.unlock();JSND.ambient(on);JSND.play(on?'on':'off',{force:true});HAP(on?[8,40,12]:6,0)});
window.__whoosh=whoosh;var oS=window.Slash;window.Slash=function(cb){JSND.play('slash',{delay:.14});window.__swingT=performance.now();oS(cb)};
document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.tgt,#ninja'))JSND.play('shatter',{vol:.8})},true);
/* slash-trail: drag anywhere to cut; cutting through seals and the ninja strikes them */
var cv=document.getElementById('trail'),cx=cv.getContext('2d'),pts=[],down=false,hitAt=0;
function rs(){cv.width=innerWidth;cv.height=innerHeight}rs();addEventListener('resize',rs);
addEventListener('pointerdown',function(e){down=e.pointerType==='mouse'?e.button===0:true});
addEventListener('pointerup',function(){down=false});addEventListener('pointercancel',function(){down=false});
addEventListener('pointermove',function(e){if(!down||reduce)return;pts.push({x:e.clientX,y:e.clientY,t:performance.now()});
 var el=document.elementFromPoint(e.clientX,e.clientY),t=el&&el.closest&&el.closest('.tgt,#ninja');
 if(t&&!t.disabled&&performance.now()-hitAt>380){hitAt=performance.now();t.click()}});
(function draw(){var n=performance.now();cx.clearRect(0,0,cv.width,cv.height);pts=pts.filter(function(p){return n-p.t<320});
 if(pts.length>1){for(var i=1;i<pts.length;i++){var a=pts[i-1],b=pts[i],k=1-(n-b.t)/320;cx.strokeStyle='rgba(255,236,230,'+k+')';cx.shadowColor='#e0343f';cx.shadowBlur=18;cx.lineWidth=1+4*k*(i/pts.length);cx.lineCap='round';cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
 requestAnimationFrame(draw)})();
})();
