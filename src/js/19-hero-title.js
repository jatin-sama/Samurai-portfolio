
/* hero title: JAMTIN <-> ジャムティン every 3 seconds, forever */
(function(){var h=document.querySelector('h1[data-lang]');if(!h)return;var b=document.body,last=0;
setInterval(function(){if(document.hidden||!b.classList.contains('ui-in')){last=0;return}
var n=performance.now();if(!last){last=n;return}
if(n-last>=3000){last=n;h.classList.add('swapped');h.setAttribute('data-lang',h.getAttribute('data-lang')==='en'?'jp':'en')}},200)})();
