/* UNTILS home: colourful game tiles (uses the games list from app.js) */
(function(){
  var box=document.getElementById("ltiles");
  if(!box||typeof games==="undefined")return;
  box.innerHTML=games.map(function(g){
    return '<button class="tile" data-g="'+g[0]+'" style="background:linear-gradient(135deg,'+g[5]+')" aria-label="Play '+g[0]+'"><span class="te">'+g[4]+'</span><b>'+g[0]+'</b></button>';
  }).join("");
  box.onclick=function(e){var t=e.target.closest(".tile");if(t&&typeof openGame==="function")openGame(t.dataset.g)};
})();
