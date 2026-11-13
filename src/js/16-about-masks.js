
/* About · Three Masks. Tap, swipe or arrow keys change the mask; the last step lifts the hat. */
(function(){
var panel=document.getElementById('about'),mk=document.getElementById('mk');
if(!panel||!mk)return;
/* ---- edit me: the short personal line shown on the final step ---- */
var ABOUT={note:'Open to Product Design, Associate Product Manager, Full-Stack (MERN) Developer and Product Intern roles.'};
var reduce=(window.__RM===true),snd=document.getElementById('snd');
var $=function(id){return document.getElementById(id)};
var tabs=[].slice.call(mk.querySelectorAll('.mk-tab')),pans=[].slice.call(mk.querySelectorAll('.mk-p')),stage=$('mkstage'),wm=$('mkwm'),back=$('mkback'),next=$('mknext'),hint=$('mkhint'),st=$('mkst');
var STEPS=[
 {name:'The Developer',g:'技',c:'#5b8def',rgb:[.36,.55,.93],k:.55,push:.25,hat:0},
 {name:'The Designer',g:'美',c:'#e0a84a',rgb:[.88,.66,.29],k:.55,push:.5,hat:0},
 {name:'The Craftsman',g:'匠',c:'#e0343f',rgb:[.88,.2,.25],k:.6,push:.75,hat:0},
 {name:'Unmasked',g:'顔',c:'#efe6d6',rgb:[1,.85,.66],k:.4,push:1,hat:1.25}];
var N=STEPS.length,cur=-1,on=false,seen={};
$('mknote').textContent=ABOUT.note||'';if(!ABOUT.note)$('mknote').hidden=true;
/* ---- soft sound, only when the SND toggle is on ---- */
/* ---- scene hooks (all optional; the hero scene reads these) ---- */
function scene(i){var s=STEPS[i];window.__maskC=s.rgb;window.__maskK=s.k;window.__aboutPush=s.push;window.__hatT=s.hat}
function clearScene(keepHat){window.__maskK=0;window.__aboutPush=0;if(!keepHat)window.__hatT=0}
/* ---- state ---- */
function show(i,dir,quiet){
 i=(i+N)%N;if(i===cur)return;var old=cur,s=STEPS[i];
 mk.style.setProperty('--mc',s.c);mk.style.setProperty('--dx',(dir<0?-26:26)+'px');
 tabs.forEach(function(t,k){var a=k===i;t.setAttribute('aria-selected',a);t.tabIndex=a?0:-1;if(a)seen[k]=1;t.classList.toggle('seen',!!seen[k])});
 pans.forEach(function(p,k){if(k===i){p.classList.remove('lv');p.classList.add('on')}else if(k===old){p.classList.remove('on');p.classList.add('lv');setTimeout(function(){p.classList.remove('lv')},560)}else p.classList.remove('on','lv')});
 wm.textContent=s.g;
 mk.classList.toggle('lifted',i===3);
 back.disabled=i===0;next.textContent=i===2?'Lift the mask →':i===3?'Start over ↺':'Next mask →';
 hint.textContent=i===3?'The hat is off. Take a look around.':'Swipe, tap, or press 1–4';
 st.textContent='Mask '+(i+1)+' of '+N+': '+s.name;
 cur=i;scene(i);
 if(!quiet){if(i===3){JSND.play('unmasked');if(navigator.vibrate)navigator.vibrate([20,40,60])}else{JSND.play(['mask2','mask3','mask1'][i]);HAP(10,0)}}}
function go(d){show(cur+d,d)}
/* ---- input ---- */
tabs.forEach(function(t){t.addEventListener('click',function(){var i=+t.dataset.i;show(i,i>cur?1:-1)});
 t.addEventListener('keydown',function(e){var k=e.key,i=cur;if(k==='ArrowRight')i=cur+1;else if(k==='ArrowLeft')i=cur-1;else if(k==='Home')i=0;else if(k==='End')i=N-1;else return;e.preventDefault();if(i<0||i>N-1)return;show(i,i>cur?1:-1);tabs[cur].focus()})});
next.addEventListener('click',function(){if(cur===N-1)show(0,-1);else go(1)});
back.addEventListener('click',function(){go(-1)});
document.addEventListener('keydown',function(e){if(!on||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey)return;
 var t=e.target;if(t&&t.closest&&t.closest('input,textarea,select,[role=tablist]'))return;
 if(e.key==='ArrowRight'&&cur<N-1){go(1);e.preventDefault()}else if(e.key==='ArrowLeft'&&cur>0){go(-1);e.preventDefault()}});
(function(){var x0=0,y0=0,id=null;
 stage.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'||e.button>0)return;id=e.pointerId;x0=e.clientX;y0=e.clientY});
 stage.addEventListener('pointerup',function(e){if(e.pointerId!==id)return;id=null;var dx=e.clientX-x0,dy=e.clientY-y0;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.4){if(dx<0&&cur<N-1)go(1);else if(dx>0&&cur>0)go(-1)}});
 stage.addEventListener('pointercancel',function(){id=null})})();
/* ---- lifecycle ---- */
document.addEventListener('portfolio:view',function(e){var now=e.detail.id==='about';
 if(now&&!on){on=true;seen={};cur=-1;window.__hatT=0;show(0,1,true)}
 else if(!now&&on){on=false;clearScene(true)}});
if(panel.classList.contains('on')||location.hash==='#about'){on=true;show(0,1,true)}
else show(0,1,true),clearScene(true);
})();
