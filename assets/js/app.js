const games=[
["Expand.io","IO","Strategy",4.8,"🫧","#1aa7ff,#ffd23f"],["Volt.io","IO","Action",4.6,"⚡","#1b0f3d,#ff2d55"],
["Switch Dash","Platformer","Arcade",4.4,"🟦","#4cc9f0,#7ad36b"],["Candy Shift","Puzzle","Casual",4.7,"🍬","#ff5fa2,#8a3ffc"],
["Star Raider","Space","Arcade",4.5,"🚀","#05051a,#3a1c71"],["Night Cabin","Adventure","Minimal",4.2,"🏚️","#0b1d1a,#27455c"],
["Cube Drift","Minimal","Puzzle",4.3,"🧊","#1a1d26,#5b6478"],["Neon Snake","Arcade","Action",4.6,"🐍","#0d0221,#00f5d4"]];
const cats=["All","Popular","IO","Arcade","Puzzle","Action","Minimal"];
const catIcon={All:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2.2"/><rect x="13" y="3" width="8" height="8" rx="2.2"/><rect x="3" y="13" width="8" height="8" rx="2.2"/><rect x="13" y="13" width="8" height="8" rx="2.2"/></svg>`,Popular:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5c.4 3.3-.9 4.8-2.6 6.8C7.7 10.3 6 12.2 6 15a6 6 0 0 0 12 0c0-2.3-.9-4.2-2.3-5.700-.2 1.500-.8 2.400-1.800 3C14.400 9 13.900 4.800 12 1.500z"/><path d="M12 21a3 3 0 0 1-3-3c0-1.500 1.100-2.400 2-3.500.7 1 2 1.800 3 3A3 3 0 0 1 12 21z" fill="#fff" opacity=".55"/></svg>`,IO:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="14.500" r="6.500"/><circle cx="18" cy="7" r="4"/><circle cx="19" cy="17.500" r="2.800"/></svg>`,Arcade:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="6" r="4.200"/><rect x="10.800" y="9" width="2.400" height="7"/><rect x="3" y="14.500" width="18" height="7" rx="3.500"/><circle cx="8" cy="18" r="1.300" fill="#fff" opacity=".9"/><circle cx="16" cy="18" r="1.300" fill="#fff" opacity=".9"/></svg>`,Puzzle:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.500 11H19V7a2 2 0 0 0-2-2h-4V3.500a2.500 2.500 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.800h1.500a2.700 2.700 0 0 1 0 5.400H2V20a2 2 0 0 0 2 2h3.800v-1.500a2.700 2.700 0 0 1 5.400 0V22H17a2 2 0 0 0 2-2v-4h1.500a2.500 2.500 0 0 0 0-5z"/></svg>`,Action:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.500 2L4 13.500h6.500L9.500 22 20 9.500h-6.800z"/></svg>`,Minimal:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l9 5-9 5-9-5z" opacity=".55"/><path d="M12 12.500l9-5V17l-9 5z"/><path d="M12 12.500l-9-5V17l9 5z" opacity=".8"/></svg>`};
let cat="All",sort="Popular",q="",sq="";
const $=id=>document.getElementById(id);
var curView="home";function _show(v){curView=v;["landing","home","game","about","store","product","cart"].forEach(x=>$(x).style.display=x==v?"block":"none");if(v!="game")stopGame();document.querySelectorAll("#nv a").forEach(a=>a.classList.toggle("on",a.dataset.v==(v=="product"||v=="cart"?"store":v=="about"||v=="store"||v=="landing"?v:"home")));window.scrollTo(0,0)}
/* ---- real URLs (routing) ---- */
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
let routing=false;
function urlFor(v){
 if(v=="home")return"/";if(v=="about")return"/about/";if(v=="store")return"/store/";if(v=="cart")return"/cart/";
 if(v=="game")return"/games/"+slug(cur)+"/";
 if(v=="product")return"/store/"+slug(prods[curProd][0])+"/";
 return"/"}
function pageMeta(v){
 if(v=="game"){const n=cur,i=info[n];return[n+" - Play Free Online | UNTILS",i?i[0]:"Play "+n+" free on UNTILS."]}
 if(v=="product"){const x=prods[curProd];return[x[0]+" - Handmade "+x[1]+" | UNTILS Store",x[3]]}
 return({
  landing:["UNTILS - Unique Things. Endless Possibilities.","UNTILS is your space to play free HTML5 games and shop unique handmade things."],
  home:["UNTILS - Play Free Online Games","Play fun, free HTML5 games on UNTILS. IO, arcade, puzzle and action games that run right in your browser."],
  store:["Store - Unique Handmade Products | UNTILS","Handmade glowing lamps, decor, gadgets and art. Unique products, made with passion."],
  about:["About UNTILS - Our Story","UNTILS was born from a simple belief: even the smallest things can create the biggest impact. Meet the team and our vision."],
  cart:["Your Cart | UNTILS","Review the items in your UNTILS cart."]})[v]}
function setMeta(v){
 const m=pageMeta(v);if(!m)return;
 document.title=m[0];
 const set=(sel,a,val)=>{const e=document.querySelector(sel);if(e)e.setAttribute(a,val)};
 const u=location.origin+urlFor(v);
 set('meta[name="description"]',"content",m[1]);
 set('meta[property="og:title"]',"content",m[0]);
 set('meta[property="og:description"]',"content",m[1]);
 set('meta[property="og:url"]',"content",u);
 set('link[rel="canonical"]',"href",u);
 set('meta[name="robots"]',"content",v=="cart"?"noindex,follow":"index,follow")}
function show(v){
 _show(v);
 const u=urlFor(v);
 if(!routing&&location.pathname!==u){try{history.pushState(null,"",u)}catch(e){}}
 setMeta(v)}
function route(p){
 routing=true;
 try{
  navStack.length=0;
  const seg=p.replace(/index\.html$/,"").split("/").filter(Boolean);
  if(!seg.length)show("home");
  else if(seg[0]=="games"){
   const g=seg[1]&&games.find(x=>slug(x[0])==seg[1]);
   if(g)openGame(g[0]);else show("home")}
  else if(seg[0]=="store"||seg[0]=="cart"){try{history.replaceState(null,"","/games/")}catch(e){}show("home")}
  else if(false){
   const i=seg[1]?prods.findIndex(x=>slug(x[0])==seg[1]):-1;
   if(i>=0)openProduct(i,true);else show("store")}
  else if(seg[0]=="about")show("about");
  else if(seg[0]=="cart"){renderCart();show("cart")}
  else show("home");
 }finally{routing=false}}
function go(p){try{history.pushState(null,"",p)}catch(e){}route(p)}
addEventListener("popstate",()=>route(location.pathname));
document.addEventListener("click",e=>{
 const a=e.target.closest("a[data-spa]");
 if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
 e.preventDefault();go(a.getAttribute("href"))});
function render(){
 $("bar").innerHTML='<div class="pills">'+cats.map(c=>`<button class="pill ${c==cat?"on":""}" data-c="${c}" aria-label="${c}" title="${c}"><span class="pic">${catIcon[c]}</span><span class="ptx">${c.toUpperCase()}</span></button>`).join("")+'</div>'+`<div class="dd">SORT BY<button class="ddb" id="ddb" aria-expanded="false" aria-haspopup="listbox">${sort}<svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l4 4 4-4"/></svg></button><ul class="ddm" id="ddm" role="listbox" hidden>${["Popular","Rating","Name"].map(s=>`<li role="option" data-s="${s}" class="${s==sort?"on":""}">${s}</li>`).join("")}</ul></div>`;
 let l=games.filter(g=>cat=="All"||cat=="Popular"?g[3]>=(cat=="Popular"?4.5:0):[g[1],g[2]].includes(cat));
 if(q)l=l.filter(g=>g[0].toLowerCase().includes(q));
 if(sort=="Name")l.sort((a,b)=>a[0].localeCompare(b[0]));else l.sort((a,b)=>b[3]-a[3]);
 $("grid").innerHTML=l.map(g=>`<button class="card" data-g="${g[0]}"><div class="th" style="background:linear-gradient(135deg,${g[5]})">${g[4]}</div><div class="cb"><h3>${g[0].toUpperCase()}</h3><small>${g[1].toUpperCase()} | ${g[2].toUpperCase()}</small><div class="row"><span><i><svg viewBox="0 0 10 10" width="9" height="9" fill="currentColor"><polygon points="2.6,1.2 8.6,5 2.6,8.8"/></svg></i>PLAY NOW</span><span>★ ${g[3]}</span></div></div></button>`).join("")||"<p style='color:var(--mut)'>No games in this category yet.</p>";
}
$("bar").onclick=e=>{
 if(e.target.closest("#ddb")){const o=$("ddm").hidden;$("ddm").hidden=!o;$("ddb").setAttribute("aria-expanded",o);return}
 const s=e.target.closest("[data-s]");if(s){sort=s.dataset.s;render();return}
 const cb=e.target.closest("[data-c]");const c=cb&&cb.dataset.c;if(c){cat=c;render()}};
document.addEventListener("click",e=>{if(!e.target.closest(".dd")&&$("ddm")){$("ddm").hidden=true;$("ddb").setAttribute("aria-expanded",false)}});
$("sb").onclick=()=>{if(matchMedia("(max-width:900px)").matches){const o=$("sr").classList.toggle("open");if(o)$("q").focus();else{$("q").value="";q="";sq="";render()}}else $("q").focus()};
$("q").oninput=e=>{
 const t=e.target.value.trim().toLowerCase();q=t;sq=t;
 const gm=!t||games.some(g=>g[0].toLowerCase().includes(t)),pm=!t||prods.some(x=>(x[0]+" "+x[1]+" "+x[3]).toLowerCase().includes(t));
 const toStore=curView=="store"?(pm||!gm):(!gm&&pm);
 show("home");render();renderStore()};
$("grid").onclick=e=>{const c=e.target.closest(".card");if(c)openGame(c.dataset.g)};

/* ---- Untils SDK (demo) ---- */
function log(t){console.log("[untils-sdk] "+t)}
const UntilsSDK={
 gameplayStart(){log("sdk.gameplayStart()")},
 gameplayStop(){log("sdk.gameplayStop()")},
 _ad(kind,done){
  log("sdk."+kind+"() -> game paused + muted");
  let n=3;$("ad").classList.add("show");
  const t=()=>{$("adt").textContent="Ad ends in "+n+"s";if(n--<=0){clearInterval(i);$("ad").classList.remove("show");log("ad finished -> game resumed");done(true)}};
  t();const i=setInterval(t,1000)},
 commercialBreak(cb){this._ad("commercialBreak",cb)},
 rewardedBreak(cb){this._ad("rewardedBreak",ok=>{log("reward granted: true");cb(ok)})}
};

/* ---- Demo game ---- */
const cv=$("cv"),cx=cv.getContext("2d");
let GW=800,GH=500,score=0,time=15,orb,run=false,paused=false,raf,last;
const isMobile=()=>innerWidth<=800||(matchMedia("(pointer:coarse)").matches&&innerHeight<=520);
function sizeCanvas(){
 const st=$("stage");let w=800,hh=500;
 if(st.classList.contains("fs")){const W=st.clientWidth||innerWidth,H=st.clientHeight||innerHeight,k=Math.min(1,1280/Math.max(W,H));w=Math.round(W*k);hh=Math.round(H*k)}
 if(cv.width!=w||cv.height!=hh){GW=w;GH=hh;cv.width=w;cv.height=hh;if(orb)spawn();draw()}
}
function spawn(){const r=34*Math.min(GW,GH)/500;orb={x:r+20+Math.random()*(GW-2*r-40),y:r+60+Math.random()*(GH-2*r-80),r}}
function draw(){const f=Math.max(14,Math.round(GH/26));cx.fillStyle="#04060c";cx.fillRect(0,0,GW,GH);
 if(run){cx.shadowColor="#2f7bff";cx.shadowBlur=30;cx.fillStyle="#4d93ff";cx.beginPath();cx.arc(orb.x,orb.y,orb.r,0,7);cx.fill();cx.shadowBlur=0}
 cx.fillStyle="#fff";cx.font=f+"px sans-serif";cx.textAlign="left";cx.fillText("Score "+score,20,f+16);cx.textAlign="right";cx.fillText("Time "+Math.max(0,time).toFixed(1),GW-20,f+16)}
function loop(t){if(!run)return;time-=(t-last)/1000;last=t;draw();if(time<=0){end();return}raf=requestAnimationFrame(loop)}
function begin(){score=0;time=15;sizeCanvas();spawn();resume()}
function resume(){["start","over","pause"].forEach(i=>$(i).classList.remove("show"));paused=false;run=true;UntilsSDK.gameplayStart();last=performance.now();raf=requestAnimationFrame(loop)}
function end(){run=false;draw();UntilsSDK.gameplayStop();UntilsSDK.commercialBreak(()=>{$("sc").textContent="You scored "+score;$("over").classList.add("show")})}
function pauseGame(){if(!run)return;run=false;cancelAnimationFrame(raf);UntilsSDK.gameplayStop();paused=true;$("pause").classList.add("show")}
function stopGame(){if(run){run=false;cancelAnimationFrame(raf);UntilsSDK.gameplayStop()}paused=false;$("pause").classList.remove("show");$("over").classList.remove("show");$("start").classList.add("show");$("ad").classList.remove("show")}
cv.onpointerdown=e=>{if(!run)return;const b=cv.getBoundingClientRect(),x=(e.clientX-b.left)*GW/b.width,y=(e.clientY-b.top)*GH/b.height;if(Math.hypot(x-orb.x,y-orb.y)<orb.r+10){score++;spawn()}};
const inFsNow=()=>$("stage").classList.contains("fs");
$("play").onclick=()=>{if(isMobile())enterFs();begin()};
$("again").onclick=()=>{if(isMobile()&&!inFsNow())enterFs();begin()};
$("pause").onclick=()=>{if(isMobile()&&!inFsNow())enterFs();if(paused)resume()};
$("rw").onclick=()=>{$("over").classList.remove("show");UntilsSDK.rewardedBreak(()=>{time=5;resume()})};
document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseGame()});

/* ---- game page: details, votes, more games ---- */
const info={
"Expand.io":["Grow your blob by claiming open space without getting cut off by rivals.","Studio Nova"],
"Volt.io":["Charge up, dodge rivals and zap anything smaller than you in a neon arena.","Arc Labs"],
"Switch Dash":["Flip gravity, hop the spikes and collect every coin on the way to the exit.","Pixel Forge"],
"Candy Shift":["Swap candies to match three or more and clear the board before moves run out.","Sweet Byte"],
"Star Raider":["Pilot a fighter through asteroid fields and take down waves of raiders.","Orbit Works"],
"Night Cabin":["Explore a quiet forest cabin and find what is hiding in the dark.","Lantern Games"],
"Cube Drift":["Slide the cubes into place with as few moves as you can.","Mono Studio"],
"Neon Snake":["Eat the glowing dots, grow longer and avoid your own tail.","Studio Nova"]};
let cur=games[0][0],votes={},live=0;
try{votes=JSON.parse(localStorage.getItem("untils_votes")||"{}")}catch(e){}
const hash=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
const fmt=n=>n.toLocaleString("en-IN");
function paintVotes(){
 const v=votes[cur]||0,l=0,d=0;
 $("lkc").textContent=fmt(l+(v==1?1:0));$("dlc").textContent=fmt(d+(v==-1?1:0));
 $("lk").classList.toggle("on",v==1);$("dl").classList.toggle("on",v==-1);
 $("lk").setAttribute("aria-pressed",v==1);$("dl").setAttribute("aria-pressed",v==-1);
}
function vote(x){votes[cur]=(votes[cur]==x)?0:x;try{localStorage.setItem("untils_votes",JSON.stringify(votes))}catch(e){}paintVotes()}
$("lk").onclick=()=>vote(1);$("dl").onclick=()=>vote(-1);
function openGame(name){
 const g=games.find(x=>x[0]==name);if(!g)return;
 cur=name;live=180+hash(name)%2400;stopGame();$("gt").textContent=name;
 const i=info[name]||["A fun game from the Untils catalogue.","Untils Studio"],h=hash(name);
 $("info").innerHTML=`<h2>${name.toUpperCase()}</h2>
 <div class="chips"><span class="chip">${g[1].toUpperCase()}</span><span class="chip">${g[2].toUpperCase()}</span><span>★ ${g[3]}</span></div>
 <h4>ABOUT</h4><p>${i[0]}</p>
 <h4>HOW TO PLAY</h4><p>Click or tap the glowing orb as fast as you can. You get 15 seconds. After each round you can watch an ad to earn 5 extra seconds.</p>
 <h4>DETAILS</h4><dl class="dl"><div><dt>DEVELOPER</dt><dd>${i[1]}</dd></div><div><dt>CATEGORY</dt><dd>${g[1]} / ${g[2]}</dd></div><div><dt>PLATFORMS</dt><dd>Desktop, mobile</dd></div><div><dt>CONTROLS</dt><dd>Mouse or touch</dd></div></dl>
 <p class="note">Prototype note: every game in this demo loads the same Tap Rush sample.</p>`;
 $("more").innerHTML=games.filter(x=>x[0]!=name).slice(0,7).map(x=>`<button class="mg" data-g="${x[0]}"><span class="mt" style="background:linear-gradient(135deg,${x[5]})">${x[4]}</span><span><b>${x[0]}</b><small>${x[1]} | ${x[2]} &nbsp;★ ${x[3]}</small></span></button>`).join("");
 paintVotes();show("game");
}
$("more").onclick=e=>{const b=e.target.closest(".mg");if(b)openGame(b.dataset.g)};

/* ---- maximize / back button ---- */
const stage=$("stage"),fsb=$("fsb"),M=12;let pseudo=false,pos={x:0,y:0,set:false},drag=null;
const inFs=()=>stage.classList.contains("fs");
const nativeFs=()=>document.fullscreenElement||document.webkitFullscreenElement;
function range(){return{mx:Math.max(stage.clientWidth-fsb.offsetWidth-M*2,0),my:Math.max(stage.clientHeight-fsb.offsetHeight-M*2,0)}}
function placeBtn(){
 if(!pos.set){fsb.style.left=M+"px";fsb.style.top=M+"px";return}
 const r=range();fsb.style.left=(M+pos.x*r.mx)+"px";fsb.style.top=(M+pos.y*r.my)+"px";
}
function refit(){sizeCanvas();placeBtn()}
function enterFs(){
 stage.classList.add("fs");
 const rq=stage.requestFullscreen||stage.webkitRequestFullscreen;
 const fallback=()=>{pseudo=true;stage.classList.add("pfs");refit()};
 if(rq){try{Promise.resolve(rq.call(stage)).catch(fallback)}catch(e){fallback()}}else fallback();
 setTimeout(refit,150);setTimeout(refit,500);
}
function leftFs(){stage.classList.remove("fs","pfs");pseudo=false;pauseGame();setTimeout(sizeCanvas,60)}
function exitFs(){
 if(nativeFs()){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}}
 if(inFs())leftFs();
}
["fullscreenchange","webkitfullscreenchange"].forEach(ev=>document.addEventListener(ev,()=>{
 if(!nativeFs()&&!pseudo&&inFs())leftFs();else setTimeout(refit,100)}));
document.addEventListener("keydown",e=>{if(e.key=="Escape"&&inFs()){e.preventDefault();exitFs()}});
["resize","orientationchange"].forEach(ev=>window.addEventListener(ev,()=>{if(inFs())setTimeout(refit,120)}));
$("mx").onclick=enterFs;
fsb.addEventListener("pointerdown",e=>{fsb.style.transition="none";drag={sx:e.clientX,sy:e.clientY,ox:fsb.offsetLeft,oy:fsb.offsetTop,moved:false};fsb.setPointerCapture(e.pointerId)});
fsb.addEventListener("pointermove",e=>{
 if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;
 if(Math.hypot(dx,dy)>6)drag.moved=true;if(!drag.moved)return;
 const r=range();
 fsb.style.left=Math.min(Math.max(drag.ox+dx,M),M+r.mx)+"px";fsb.style.top=Math.min(Math.max(drag.oy+dy,M),M+r.my)+"px";
});
function snap(){
 const r=range(),x=fsb.offsetLeft-M,y=fsb.offsetTop-M;
 const d={l:x,r:r.mx-x,t:y,b:r.my-y},k=Object.keys(d).sort((p,q)=>d[p]-d[q])[0];
 let nx=Math.min(Math.max(x,0),r.mx),ny=Math.min(Math.max(y,0),r.my);
 if(k=="l")nx=0;else if(k=="r")nx=r.mx;else if(k=="t")ny=0;else ny=r.my;
 pos={x:r.mx?nx/r.mx:0,y:r.my?ny/r.my:0,set:true};
 fsb.style.transition="left .22s ease,top .22s ease";placeBtn();
}
fsb.addEventListener("pointerup",()=>{const d=drag;drag=null;if(!d)return;if(d.moved)snap();else exitFs()});
fsb.addEventListener("pointercancel",()=>{if(drag&&drag.moved)snap();drag=null});
fsb.addEventListener("keydown",e=>{if(e.key=="Enter"||e.key==" "){e.preventDefault();exitFs()}});

$("nv").onclick=e=>{const a=e.target.closest("a");if(a&&a.dataset.v){e.preventDefault();navStack.length=0;show(a.dataset.v)}};
let tt;function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>e.classList.remove("show"),2400)}
$("sell").onclick=e=>{e.preventDefault();toast("Seller page is coming soon.")};

/* ---- store ---- */
const ico=d=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const sCats=[["All",'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5"/>'],["Lights",'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'],["Decor",'<path d="M3 20L12 4l9 16zM8 20l4-7 4 7"/>'],["Gadgets",'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>'],["Art",'<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="11" r="1"/>'],["Mystery",'<path d="M12 3l7 4v10l-7 4-7-4V7zM10 10a2 2 0 1 1 2.8 1.8c-.6.3-.8.7-.8 1.2M12 16h.01"/>']];
const O="#ff9a2e";
const arts={
cube:`<svg viewBox="0 0 100 100"><rect x="26" y="14" width="48" height="58" fill="#120a05" stroke="${O}" stroke-width="1.6"/><rect x="33" y="22" width="34" height="42" fill="none" stroke="#ffb457" stroke-width="1.5"/><rect x="39" y="29" width="22" height="28" fill="none" stroke="#ffc57a" stroke-width="1.5"/><rect x="44" y="35" width="12" height="16" fill="#2a1204" stroke="#ffd9a3"/><rect x="28" y="72" width="44" height="11" fill="#0d0d10" stroke="#3a3a42"/></svg>`,
tri:`<svg viewBox="0 0 100 100"><polygon points="50,14 86,72 14,72" fill="#2a2a30" stroke="#55555e"/><polygon points="50,36 66,64 34,64" fill="#0b0b0e" stroke="#44444c"/><polygon points="14,72 34,64 50,72" fill="#1b1b20"/></svg>`,
shadow:`<svg viewBox="0 0 100 100"><rect x="16" y="16" width="68" height="64" fill="#2a1608" stroke="#6b3d14" stroke-width="3"/><rect x="22" y="22" width="56" height="52" fill="#c4630f"/><polygon points="22,74 40,40 52,58 64,34 78,74" fill="#1a0d05"/><polygon points="30,74 34,60 38,74" fill="#0d0603"/><polygon points="60,74 64,56 68,74" fill="#0d0603"/></svg>`,
glass:`<svg viewBox="0 0 100 100"><rect x="22" y="16" width="56" height="52" rx="4" fill="rgba(255,150,50,.1)" stroke="#ffb457" stroke-width="1.6"/><polygon points="26,64 44,36 54,50 64,30 74,64" fill="#1a0d05" stroke="#ff9a2e"/><circle cx="66" cy="26" r="4" fill="#ffd9a3"/><rect x="26" y="68" width="48" height="10" fill="#1d1208" stroke="#4a2c10"/></svg>`,
dome:`<svg viewBox="0 0 100 100"><path d="M26 74V50a24 28 0 0 1 48 0v24z" fill="rgba(255,150,50,.08)" stroke="#d8b890" stroke-width="1.4"/><ellipse cx="50" cy="66" rx="5" ry="8" fill="#ffb457"/><path d="M42 74c0-12 4-22 8-30M58 74c0-12-4-22-8-30" stroke="#5f8a3c" stroke-width="3" fill="none"/><rect x="24" y="74" width="52" height="8" fill="#0d0d10" stroke="#3a3a42"/></svg>`,
puzzle:`<svg viewBox="0 0 100 100"><g fill="#6b3a1c" stroke="#a65e2c"><rect x="26" y="26" width="16" height="16"/><rect x="42" y="26" width="16" height="16"/><rect x="58" y="26" width="16" height="16"/><rect x="26" y="42" width="16" height="16"/><rect x="42" y="42" width="16" height="16"/><rect x="58" y="42" width="16" height="16"/><rect x="26" y="58" width="16" height="16"/><rect x="42" y="58" width="16" height="16"/><rect x="58" y="58" width="16" height="16"/></g></svg>`,
orb:`<svg viewBox="0 0 100 100"><defs><radialGradient id="og" cx="45%" cy="40%"><stop offset="0" stop-color="#ffe2b0"/><stop offset=".5" stop-color="#ff8a1e"/><stop offset="1" stop-color="#3a1204"/></radialGradient></defs><circle cx="50" cy="48" r="28" fill="url(#og)"/><path d="M30 44c10-8 18 4 30-4M34 60c10 6 20-6 30 2" stroke="#2a0d03" stroke-width="2" fill="none"/><rect x="34" y="76" width="32" height="6" fill="#0d0d10"/></svg>`,
crystal:`<svg viewBox="0 0 100 100"><polygon points="50,14 72,50 80,78 22,78 30,46" fill="#34343a" stroke="#55555e"/><polygon points="50,14 58,48 44,48" fill="#ff9a2e"/><polygon points="40,60 52,52 60,78 38,78" fill="#ff7a14" opacity=".8"/></svg>`,
mystery:`<svg viewBox="0 0 100 100"><polygon points="50,18 80,34 80,68 50,84 20,68 20,34" fill="#1a1a20" stroke="#55555e"/><path d="M20,34L50,50L80,34M50,50V84" fill="none" stroke="#55555e"/><text x="50" y="72" text-anchor="middle" font-size="22" fill="${O}" font-family="sans-serif">?</text></svg>`,
moon:`<svg viewBox="0 0 100 100"><circle cx="50" cy="46" r="26" fill="#e8d9b8"/><circle cx="42" cy="40" r="5" fill="#cdbb94"/><circle cx="58" cy="54" r="7" fill="#cdbb94"/><circle cx="56" cy="34" r="3" fill="#cdbb94"/><rect x="36" y="74" width="28" height="7" fill="#1d1208" stroke="#4a2c10"/></svg>`,
zen:`<svg viewBox="0 0 100 100"><circle cx="50" cy="42" r="14" fill="#9aa0ab"/><circle cx="50" cy="42" r="14" fill="none" stroke="#ff9a2e"/><path d="M34 78c4-18 28-18 32 0z" fill="#2a2a30" stroke="#55555e"/></svg>`,
print:`<svg viewBox="0 0 100 100"><rect x="22" y="16" width="56" height="66" fill="#1a1005" stroke="#6b3d14" stroke-width="2"/><rect x="28" y="22" width="44" height="54" fill="#8f3f08"/><polygon points="28,76 44,44 54,60 62,40 72,76" fill="#ffb457"/><circle cx="60" cy="32" r="5" fill="#ffd9a3"/></svg>`};
const prods=[
["The Last Light","Lights",1199,"A handmade infinity cube lamp that brings depth to your space.","cube"],
["Impossible Triangle","Decor",999,"A design that defies logic. A piece that sparks curiosity.","tri"],
["Forest Shadow Box","Art",1499,"Layers of light, layers of story. A scene that lives in your room.","shadow"],
["Secret Message Lamp","Gadgets",1099,"What you see is not all. The real message appears in light.","glass"],
["Glow Terrarium","Decor",1299,"A tiny garden under glass with a warm light at its heart.","dome"],
["Wooden Puzzle Cube","Gadgets",799,"A hand finished cube puzzle that rewards patient hands.","puzzle"],
["Lava Orb","Art",1799,"A glowing sphere with slow moving light inside.","orb"],
["Crystal Rock Lamp","Lights",1399,"Raw rock shape with a warm glow from within.","crystal"],
["Mystery Box","Mystery",499,"One surprise handmade item. You find out when you open it.","mystery"],
["Moon Phase Lamp","Lights",1599,"A soft moon light that changes with your mood.","moon"],
["Desk Zen Sphere","Gadgets",899,"A calm little sculpture for a busy desk.","zen"],
["Mountain Light Print","Art",1249,"A glowing mountain scene for the wall behind your bed.","print"]];
let scat="All",smin=0,smax=5000,ssortv="Featured";const wish=new Set();let cartN=0;
const heart='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/></svg>';
const cartI='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11h10l2-8H6.5M10 20h.01M17 20h.01"/></svg>';
const rup=n=>"₹"+n.toLocaleString("en-IN");
function renderStore(){
 $("stt").innerHTML=sCats.map(c=>`<button class="stab ${c[0]==scat?"on":""}" data-c="${c[0]}">${ico(c[1])}${c[0]}</button>`).join("");
 $("fcat").innerHTML=sCats.map(c=>`<div class="fr ${c[0]==scat?"on":""}" data-c="${c[0]}"><i></i>${c[0]}</div>`).join("");
 $("pminl").textContent=rup(smin);$("pmax").textContent=rup(smax)+(smax>=5000?"+":"");$("pmin").value=smin;$("pmaxr").value=smax;
 $("dfill").style.left=(smin/50)+"%";$("dfill").style.right=(100-smax/50)+"%";
 let l=prods.map((x,i)=>({x,i})).filter(o=>(scat=="All"||o.x[1]==scat)&&o.x[2]>=smin&&(smax>=5000||o.x[2]<=smax)&&(!sq||(o.x[0]+" "+o.x[1]+" "+o.x[3]).toLowerCase().includes(sq)));
 if(ssortv.includes("Low"))l.sort((a,b)=>a.x[2]-b.x[2]);else if(ssortv.includes("High"))l.sort((a,b)=>b.x[2]-a.x[2]);
 $("cnt").textContent=l.length+" PRODUCT"+(l.length==1?"":"S");
 $("sg").innerHTML=l.map(o=>`<article class="pc" data-i="${o.i}"><div class="pt">${arts[o.x[4]]}<span class="tgx">${o.x[1].toUpperCase()}</span><button class="hrt ${wish.has(o.i)?"on":""}" data-w="${o.i}" aria-label="Wishlist">${heart}</button></div><div class="pb"><h3>${o.x[0]}</h3><p>${o.x[3]}</p><div class="pf"><b>${rup(o.x[2])}</b><button class="atc" data-a="${o.i}">${cartI}Add to Cart</button></div></div></article>`).join("")||"<p style='color:var(--mut)'>No products match these filters.</p>";
}
const stClick=e=>{const c=e.target.closest("[data-c]");if(c){scat=c.dataset.c;renderStore()}};
$("stt").onclick=stClick;$("fcat").onclick=stClick;
$("pmin").oninput=e=>{smin=Math.min(+e.target.value,smax-100);renderStore()};
$("pmaxr").oninput=e=>{smax=Math.max(+e.target.value,smin+100);renderStore()};
$("ssort").onchange=e=>{ssortv=e.target.value;renderStore()};
document.addEventListener("click",e=>{if(!e.target.closest("#clr"))return;
 scat="All";smin=0;smax=5000;ssortv="Featured";$("ssort").value="Featured";sq="";q="";$("q").value="";renderStore();render()});
$("ftg").onclick=()=>$("stf").classList.toggle("open");
$("cartb").onclick=()=>openCart();
$("sg").onclick=e=>{
 const w=e.target.closest("[data-w]");if(w){const i=+w.dataset.w;wish.has(i)?wish.delete(i):wish.add(i);w.classList.toggle("on");return}
 const a=e.target.closest("[data-a]");if(a){addCart(+a.dataset.a)}
};
renderStore();

/* ---- landing ---- */
const cp=(id,sel)=>{$(id).src=document.querySelector(sel).src};
cp("ldu",".ulogo");cp("ldl",".lamp");cp("ldlr",".lrefl");cp("ldc",".pad");cp("ldcr",".refl");
document.querySelectorAll(".ld-card").forEach(c=>{c.onclick=()=>show(c.dataset.go);c.onkeydown=e=>{if(e.key=="Enter"||e.key==" "){e.preventDefault();show(c.dataset.go)}}});

/* ---- product page ---- */
const navStack=[];let curProd=0,pIdx=0,pTab=0;
const pinfo={"The Last Light":{sub:"Infinity Cube Lamp",mrp:1499,badge:"BESTSELLER",f:["Infinity Mirror Effect","Warm LED Lights","USB / Battery Powered","Premium Build Quality"],long:"The Last Light is more than just a lamp, it's a piece of art. Designed for dreamers, creators and night thinkers. Its infinity effect creates a tunnel of light, making your space feel bigger, brighter and calmer.",title:"A Light Beyond Limits",desc:"A handmade infinity cube lamp that turns light into an endless experience. Minimal design. Maximum vibes."}};
const defF={Lights:["Warm LED Lights","USB / Battery Powered","Premium Build Quality","Handmade Finish"],Decor:["Hand Finished","Unique Design","Premium Material","Ready to Display"],Gadgets:["Smart Design","Easy to Use","Premium Build Quality","Compact Size"],Art:["Layered Artwork","Warm Backlight","Premium Frame","Wall or Desk"],Mystery:["One Surprise Item","Handmade","Gift Ready","Limited Stock"]};
const fic=[ico('<path d="M7 9a3 3 0 1 0 0 6c3 0 7-6 10-6a3 3 0 1 1 0 6c-3 0-7-6-10-6z"/>'),ico('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),ico('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),ico('<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/>')];
const pfor=[["Desk Setup",'<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>'],["Bedroom",'<path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/>'],["Gifting",'<rect x="3" y="9" width="18" height="11"/><path d="M12 9v11M3 13h18M12 9c-3 0-4-4-1.5-4S12 9 12 9zm0 0c3 0 4-4 1.5-4S12 9 12 9z"/>'],["Room Decor",'<path d="M3 11l9-7 9 7M5 10v10h14V10"/>']];
const pbg=["radial-gradient(circle at 50% 62%,rgba(255,140,30,.38),#0a0a0c 70%)","radial-gradient(circle at 30% 40%,rgba(255,120,20,.3),#08080a 70%)","radial-gradient(circle at 50% 50%,rgba(255,150,40,.42),#0b0806 75%)","linear-gradient(160deg,#1a130c,#050505)","radial-gradient(circle at 70% 60%,rgba(255,170,60,.32),#0a0a0c 70%)"];
const ptf=["scale(1)","rotate(-7deg) scale(1.08)","scale(1.7)","scale(.82) translateY(8%)","hue-rotate(-12deg) brightness(1.12)"];
const pimg=(i,k)=>`<div class="pimg" style="background:${pbg[k]}"><i style="transform:${ptf[k]}">${arts[prods[i][4]]}</i></div>`;
function pdata(i){
 const x=prods[i],hh=hash(x[0]),o=pinfo[x[0]]||{};
 const mrp=o.mrp||0;
 return{name:x[0],cat:x[1],price:x[2],mrp,off:mrp?Math.round((1-x[2]/mrp)*100):0,sub:o.sub||x[1]+" piece",badge:o.badge||"HANDMADE",
  desc:o.desc||x[3],f:o.f||defF[x[1]],title:o.title||"About this "+x[1].toLowerCase(),
  long:o.long||x[0]+" is more than just a "+x[1].toLowerCase()+" piece, it's a small work of art. "+x[3]+" Made in small batches with care.",
  spec:[["Category",x[1]],["Material","Wood, acrylic and metal"],["Power",(x[1]=="Lights"||x[1]=="Gadgets")?"USB powered":"No power needed"],...(o.size?[["Size",o.size]]:[]),...(o.weight?[["Weight",o.weight]]:[]),["Warranty","6 months"]]};
}
function pTabHTML(d){
 if(pTab==0)return`<h4>${d.title}</h4><p>${d.long}</p>`;
 if(pTab==1)return`<ul>${d.spec.map(s=>`<li><b>${s[0]}:</b> ${s[1]}</li>`).join("")}</ul>`;
 return`<ul><li>Free shipping on orders above ₹999.</li><li>Dispatched in 2 to 4 days.</li><li>7 day returns on unused items.</li><li>Careful, safe packaging.</li></ul>`;
}
function setImg(k){pIdx=(k+5)%5;$("pdi").innerHTML=pimg(curProd,pIdx);$("pctr").textContent=(pIdx+1)+" / 5";const ts=document.querySelectorAll(".pd-t");ts.forEach((t,j)=>t.classList.toggle("on",j==pIdx));const c=ts[pIdx];if(c&&c.parentNode){const r=c.parentNode;r.scrollTo({left:c.offsetLeft-r.clientWidth/2+c.offsetWidth/2,behavior:"smooth"})}}
function relHTML(i){const x=prods[i];return`<article class="pc" data-i="${i}"><div class="pt">${arts[x[4]]}<span class="tgx">${x[1].toUpperCase()}</span><button class="hrt ${wish.has(i)?"on":""}" data-w="${i}" aria-label="Wishlist">${heart}</button></div><div class="pb"><h3>${x[0]}</h3><p>${x[3]}</p><div class="pf"><b>${rup(x[2])}</b><button class="atc" data-a="${i}">${cartI}Add to Cart</button></div></div></article>`}
function openProduct(i,noPush){
 if(!noPush)navStack.push(curView=="product"?{v:"product",id:curProd}:{v:curView,y:scrollY});
 curProd=i;pTab=0;const d=pdata(i);
 $("pdbd").textContent=d.badge;
 $("pdth").innerHTML=`<button class="pd-ar" id="pup" aria-label="Previous image"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 15l6-6 6 6"/></svg></button>`+[0,1,2,3,4].map(k=>`<button class="pd-t" data-k="${k}" aria-label="Image ${k+1}">${pimg(i,k)}</button>`).join("")+`<button class="pd-ar" id="pdn" aria-label="Next image"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button>`;
 $("pdinfo").innerHTML=`<div class="eyb">UNTILS ORIGINALS</div><h1>${d.name.toUpperCase()}</h1><div class="sub">${d.sub}</div>
 <p class="dsc">${d.desc}</p>
 <div class="prc"><b>${rup(d.price)}</b>${d.mrp?`<s>${rup(d.mrp)}</s><span class="off">${d.off}% OFF</span>`:""}</div>
 <div class="feat">${d.f.map((t,k)=>`<div>${fic[k]}${t}</div>`).join("")}</div>
 <div class="cta"><button class="btn solid" id="pdadd">ADD TO CART</button><button class="btn" id="pdbuy">BUY NOW</button></div>
 <div class="mini"><button id="pdw" class="${wish.has(i)?"on":""}">${heart}Add to Wishlist</button><span>Free Shipping (Orders above ₹999)</span></div>`;
 $("pdbot").innerHTML=`<div><div class="tabs" id="ptabs"><button class="on" data-t="0">DESCRIPTION</button><button data-t="1">SPECIFICATIONS</button><button data-t="2">SHIPPING &amp; RETURNS</button></div><div class="tc" id="ptc">${pTabHTML(d)}</div></div>
 <div class="gal">${[1,2,3].map(k=>pimg(i,k)).join("")}</div>
 <div class="pf2"><div class="eyb">PERFECT FOR</div><div class="pr">${pfor.map(f=>`<div>${ico(f[1])}${f[0]}</div>`).join("")}</div><div class="bm"><img src="${document.querySelector(".logo").src}" alt="UNTILS"><span>Small details. Big emotions.</span></div></div>`;
 const rel=prods.map((x,j)=>j).filter(j=>j!=i).sort((a,b)=>(prods[b][1]==prods[i][1])-(prods[a][1]==prods[i][1])||a-b).slice(0,8);
 $("rel").innerHTML=rel.map(relHTML).join("");
 show("product");setImg(0);
}
function pBack(){const t=navStack.pop();if(!t){show("store");return}if(t.v=="product")openProduct(t.id,true);else{if(t.v=="cart")renderCart();show(t.v);setTimeout(()=>scrollTo(0,t.y||0),30)}}
$("pdb").onclick=pBack;
let tx0=null;$("pdi").addEventListener("touchstart",e=>{tx0=e.touches[0].clientX},{passive:true});
$("pdi").addEventListener("touchend",e=>{if(tx0==null)return;const dx=e.changedTouches[0].clientX-tx0;tx0=null;if(Math.abs(dx)>40)setImg(pIdx+(dx<0?1:-1))});
$("pprev").onclick=()=>setImg(pIdx-1);$("pnext").onclick=()=>setImg(pIdx+1);
$("pdth").onclick=e=>{const t=e.target.closest(".pd-t");if(t){setImg(+t.dataset.k);return}if(e.target.closest("#pup"))setImg(pIdx-1);else if(e.target.closest("#pdn"))setImg(pIdx+1)};
$("pdinfo").onclick=e=>{
 if(e.target.closest("#pdadd")){addCart(curProd)}
 else if(e.target.closest("#pdbuy")){addCart(curProd,true);openCart()}
 else if(e.target.closest("#pdw")){wish.has(curProd)?wish.delete(curProd):wish.add(curProd);$("pdw").classList.toggle("on");renderStore()}
};
$("pdbot").onclick=e=>{const t=e.target.closest("[data-t]");if(!t)return;pTab=+t.dataset.t;document.querySelectorAll("#ptabs button").forEach(b=>b.classList.toggle("on",b==t));$("ptc").innerHTML=pTabHTML(pdata(curProd))};
const gridClick=e=>{
 const w=e.target.closest("[data-w]");if(w){const i=+w.dataset.w;wish.has(i)?wish.delete(i):wish.add(i);w.classList.toggle("on");return}
 const a=e.target.closest("[data-a]");if(a){addCart(+a.dataset.a);return}
 const c=e.target.closest(".pc");if(c)openProduct(+c.dataset.i)};
$("sg").onclick=gridClick;$("rel").onclick=gridClick;

/* ---- cart ---- */
let cart={},coupon="",cpnOpen=false;
try{cart=JSON.parse(localStorage.getItem("untils_cart")||"{}")}catch(e){}
const brandOf={Lights:"UNTILS ORIGINALS",Decor:"UNTILS ORIGINALS",Art:"UNTILS ORIGINALS",Gadgets:"UNTILS ESSENTIALS",Mystery:"UNTILS SURPRISE"};
const cic=d=>`<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const trash='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
const cartCount=()=>Object.values(cart).reduce((a,b)=>a+b,0);
function cartUI(){
 const n=cartCount();$("cartn").textContent=n;$("hcn").textContent=n;$("hcn").classList.toggle("on",n>0);
 try{localStorage.setItem("untils_cart",JSON.stringify(cart))}catch(e){}
}
function addCart(i,silent){cart[i]=Math.min((cart[i]||0)+1,10);cartUI();if(!silent)toast(prods[i][0]+" added to cart")}
function openCart(){
 if(curView=="cart")return;
 navStack.push(curView=="product"?{v:"product",id:curProd}:{v:curView,y:scrollY});
 renderCart();show("cart");
}
function renderCart(){
 cartUI();const ids=Object.keys(cart).filter(k=>cart[k]>0).map(Number);
 if(!ids.length){
  $("ctw").innerHTML=`<div class="cempty">${cic('<path d="M3 4h2l2.4 11h10l2-8H6.5M10 20h.01M17 20h.01"/>').replace('width="30" height="30"','width="54" height="54"')}<h2>YOUR CART IS EMPTY</h2><p>Looks like you haven't added anything yet.</p><button class="btn" id="cshop">START SHOPPING</button></div>`;
  return;
 }
 let sub=0;
 const rows=ids.map(i=>{const x=prods[i],d=pdata(i),q=cart[i],t=x[2]*q;sub+=t;
  return`<div class="cr" data-i="${i}"><div class="ci" data-open="${i}"><div class="cth">${arts[x[4]]}</div><div class="cm"><small>${brandOf[x[1]]}</small><b>${x[0].toUpperCase()}</b><span>${d.sub}</span><em class="bdg">${d.badge}</em><span class="up">${rup(x[2])} each</span></div></div><div class="cp">${rup(x[2])}</div><div class="cq"><button data-q="-1" aria-label="Decrease">&minus;</button><span>${q}</span><button data-q="1" aria-label="Increase">+</button></div><div class="ctt">${rup(t)}</div><button class="cdel" data-del aria-label="Remove ${x[0]}">${trash}</button></div>`}).join("");
 const disc=coupon=="UNTILS10"?Math.round(sub*0.10):0,net=sub-disc,ship=sub>=999?0:99,tax=Math.round(net*0.18),total=net+ship+tax;
 const left=999-sub;
 const fsp=left>0?`<div class="fsp">Add ${rup(left)} more for free shipping<div><i style="width:${Math.min(100,sub/999*100)}%"></i></div></div>`:`<div class="fsp">You've unlocked free shipping<div><i style="width:100%"></i></div></div>`;
 const cp=cpnOpen?`<div class="cpn"><input id="cin" placeholder="COUPON CODE" value="${coupon}" aria-label="Coupon code"><button class="btn" id="capp">APPLY</button></div><div class="cph">Try UNTILS10 for 10% off (demo).</div>`:"";
 $("ctw").innerHTML=`<div class="ct-list"><div class="ch"><span>ITEM</span><span>PRICE</span><span>QUANTITY</span><span>TOTAL</span><span></span></div>${rows}<button class="ct-back" id="cshop">${'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>'}Continue Shopping</button></div>
 <aside class="ct-sum"><h2>ORDER SUMMARY</h2>${fsp}<div class="sl"><span>Subtotal</span><span>${rup(sub)}</span></div>${disc?`<div class="sl dc"><span>Coupon ${coupon}</span><span>&minus;${rup(disc)}</span></div>`:""}<div class="sl"><span>Shipping</span><span>${ship?rup(ship):"FREE"}</span></div><div class="sl"><span>Taxes (18%)</span><span>${rup(tax)}</span></div><div class="sl tot"><span>Total</span><span>${rup(total)}</span></div>
 <button class="btn solid" id="cout">PROCEED TO CHECKOUT</button><button class="btn" id="ccpn">${coupon?"CHANGE COUPON":"APPLY COUPON"}</button>${cp}
 <div class="cf"><div>${cic('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7zM7 19h.01M17 19h.01"/>').replace('width="30" height="30"','width="26" height="26"')}<span>Free Shipping<small>On all orders above ₹999</small></span></div><div>${cic('<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6zM9 12l2 2 4-4"/>').replace('width="30" height="30"','width="26" height="26"')}<span>Secure Payments<small>100% safe &amp; encrypted</small></span></div><div>${cic('<path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H4zM17 14h3v5h-3zM17 19c0 1.5-2 2-4 2"/>').replace('width="30" height="30"','width="26" height="26"')}<span>24/7 Support<small>We're here to help</small></span></div></div></aside>`;
}
$("ctw").onclick=e=>{
 const r=e.target.closest(".cr");
 const qb=e.target.closest("[data-q]");
 if(qb&&r){const i=+r.dataset.i;cart[i]=Math.min(10,Math.max(1,(cart[i]||1)+ +qb.dataset.q));renderCart();return}
 if(e.target.closest("[data-del]")&&r){delete cart[+r.dataset.i];renderCart();return}
 const o=e.target.closest("[data-open]");if(o){openProduct(+o.dataset.open);return}
 if(e.target.closest("#cshop")){navStack.length=0;show("store");return}
 if(e.target.closest("#cout")){toast("Checkout and payment will be added later.");return}
 if(e.target.closest("#ccpn")){cpnOpen=!cpnOpen;renderCart();if(cpnOpen)$("cin").focus();return}
 if(e.target.closest("#capp")){const v=$("cin").value.trim().toUpperCase();if(v=="UNTILS10"){coupon=v;cpnOpen=false;renderCart();toast("Coupon applied: 10% off")}else{toast("Invalid coupon code")}}
};
$("cbk").onclick=pBack;
$("hc").onclick=openCart;
cartUI();

render();draw();
route(location.pathname);
