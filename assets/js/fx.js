/* UNTILS click effects: the icon inside any button/link pops when tapped */
(function(){
  function pop(el){
    if(!el)return;
    el.classList.remove("ic-pop");void el.offsetWidth;el.classList.add("ic-pop");
    el.addEventListener("animationend",function f(){el.classList.remove("ic-pop");el.removeEventListener("animationend",f)});
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest("button,a.btn,nav a,.pill");
    if(!b)return;
    if(b.dataset&&b.dataset.c){            /* category pills get re-rendered, so animate the new one */
      var c=b.dataset.c;
      setTimeout(function(){var n=document.querySelector('.pill[data-c="'+c+'"] .pic');pop(n)},0);
      return;
    }
    pop(b.querySelector("svg,.pic"));
  });
  /* Accounts is a normal page link: let the icon play before leaving */
  document.addEventListener("click",function(e){
    var a=e.target.closest('nav a[href="/developers/"]');
    if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    e.preventDefault();setTimeout(function(){location.href=a.href},280);
  });
})();
