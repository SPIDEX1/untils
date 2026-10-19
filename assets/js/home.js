/* UNTILS home: popular-games banner (uses games list + openGame from app.js) */
(function(){
  var box=document.getElementById("pban");
  if(!box||typeof games==="undefined")return;
  var pop=games.slice().sort(function(a,b){return b[3]-a[3]}).slice(0,4);
  var play='<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>';
  box.innerHTML=pop.map(function(g,i){
    return '<div class="pb-s'+(i?'':' on')+'" data-g="'+g[0]+'" style="background:linear-gradient(110deg,'+g[5]+')">'
      +'<div class="pb-t"><span class="pb-tag">POPULAR</span><h2>'+g[0]+'</h2><p>'+g[1]+' | '+g[2]+' &nbsp;★ '+g[3]+'</p>'
      +'<button class="pb-b" tabindex="-1">'+play+'<span>Play Now</span></button></div><div class="pb-e">'+g[4]+'</div></div>';
  }).join("")+'<div class="pb-d">'+pop.map(function(g,i){return '<i data-i="'+i+'"'+(i?'':' class="on"')+'></i>'}).join("")+'</div>';
  var cur=0,slides=box.querySelectorAll(".pb-s"),dots=box.querySelectorAll(".pb-d i"),timer;
  function go(n){slides[cur].classList.remove("on");dots[cur].classList.remove("on");cur=(n+slides.length)%slides.length;slides[cur].classList.add("on");dots[cur].classList.add("on")}
  function start(){clearInterval(timer);timer=setInterval(function(){go(cur+1)},4500)}
  box.onmouseenter=function(){clearInterval(timer)};box.onmouseleave=start;start();
  box.onclick=function(e){
    var d=e.target.closest(".pb-d i");if(d){go(+d.dataset.i);start();return}
    var s=e.target.closest(".pb-s");if(s&&typeof openGame==="function")openGame(s.dataset.g);
  };
})();
