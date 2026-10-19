const games=[
["Expand.io","IO","Strategy",4.8,"🫧","#1aa7ff,#ffd23f"],["Volt.io","IO","Action",4.6,"⚡","#1b0f3d,#ff2d55"],
["Switch Dash","Platformer","Arcade",4.4,"🟦","#4cc9f0,#7ad36b"],["Candy Shift","Puzzle","Casual",4.7,"🍬","#ff5fa2,#8a3ffc"],
["Star Raider","Space","Arcade",4.5,"🚀","#05051a,#3a1c71"],["Night Cabin","Adventure","Minimal",4.2,"🏚️","#0b1d1a,#27455c"],
["Cube Drift","Minimal","Puzzle",4.3,"🧊","#1a1d26,#5b6478"],["Neon Snake","Arcade","Action",4.6,"🐍","#0d0221,#00f5d4"]];
const cats=["All","Popular","IO","Arcade","Puzzle","Action","Minimal"];
const catIcon={All:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2.2"/><rect x="13" y="3" width="8" height="8" rx="2.2"/><rect x="3" y="13" width="8" height="8" rx="2.2"/><rect x="13" y="13" width="8" height="8" rx="2.2"/></svg>`,Popular:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5c.4 3.3-.9 4.8-2.6 6.8C7.7 10.3 6 12.2 6 15a6 6 0 0 0 12 0c0-2.3-.9-4.2-2.3-5.700-.2 1.500-.8 2.400-1.800 3C14.400 9 13.900 4.800 12 1.500z"/><path d="M12 21a3 3 0 0 1-3-3c0-1.500 1.100-2.400 2-3.500.7 1 2 1.800 3 3A3 3 0 0 1 12 21z" fill="#fff" opacity=".55"/></svg>`,IO:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="14.500" r="6.500"/><circle cx="18" cy="7" r="4"/><circle cx="19" cy="17.500" r="2.800"/></svg>`,Arcade:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="6" r="4.200"/><rect x="10.800" y="9" width="2.400" height="7"/><rect x="3" y="14.500" width="18" height="7" rx="3.500"/><circle cx="8" cy="18" r="1.300" fill="#fff" opacity=".9"/><circle cx="16" cy="18" r="1.300" fill="#fff" opacity=".9"/></svg>`,Puzzle:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.500 11H19V7a2 2 0 0 0-2-2h-4V3.500a2.500 2.500 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.800h1.500a2.700 2.700 0 0 1 0 5.400H2V20a2 2 0 0 0 2 2h3.800v-1.500a2.700 2.700 0 0 1 5.400 0V22H17a2 2 0 0 0 2-2v-4h1.500a2.500 2.500 0 0 0 0-5z"/></svg>`,Action:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.500 2L4 13.500h6.500L9.500 22 20 9.500h-6.800z"/></svg>`,Minimal:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l9 5-9 5-9-5z" opacity=".55"/><path d="M12 12.500l9-5V17l-9 5z"/><path d="M12 12.500l-9-5V17l9 5z" opacity=".8"/></svg>`};
let cat="All",sort="Popular",q="",sq="";
const $=id=>document.getElementById(id);
var curView="home";function _show(v){curView=v;["home","game","about"].forEach(x=>$(x).style.display=x==v?"block":"none");if(v!="game")stopGame();document.querySelectorAll("#nv a").forEach(a=>a.classList.toggle("on",a.dataset.v==(v=="product"||v=="cart"?"store":v=="about"||v=="store"||v=="landing"?v:"home")));window.scrollTo(0,0)}
/* ---- real URLs (routing) ---- */
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
let routing=false;
function urlFor(v){
 if(v=="home")return"/";if(v=="about")return"/about/";
 if(v=="game")return"/games/"+slug(cur)+"/";
 return"/"}
function pageMeta(v){
 if(v=="game"){const n=cur,i=info[n];return[n+" - Play Free Online | UNTILS",i?i[0]:"Play "+n+" free on UNTILS."]}
 return({
  home:["UNTILS - Play Free Online Games","Play fun, free HTML5 games on UNTILS. IO, arcade, puzzle and action games that run right in your browser."],
  about:["About UNTILS - Our Story","UNTILS was born from a simple belief: even the smallest things can create the biggest impact. Meet the team and our vision."],
})[v]}
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
  
  const seg=p.replace(/index\.html$/,"").split("/").filter(Boolean);
  if(!seg.length)show("home");
  else if(seg[0]=="games"){
   const g=seg[1]&&games.find(x=>slug(x[0])==seg[1]);
   if(g)openGame(g[0]);else show("home")}
  else if(seg[0]=="store"||seg[0]=="cart"){try{history.replaceState(null,"","/")}catch(e){}show("home")}
  else if(seg[0]=="about")show("about");
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
 show("home");render()};
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
 $("more").innerHTML=games.filter(x=>x[0]!=name).slice(0,8).map(x=>`<button class="tile" data-g="${x[0]}" style="background:linear-gradient(135deg,${x[5]})" aria-label="Play ${x[0]}"><span class="te">${x[4]}</span><b>${x[0]}</b></button>`).join("");
 $("start").style.setProperty("--gbg","linear-gradient(135deg,"+g[5]+")");$("gemo").textContent=g[4];
 paintVotes();show("game");
 if(!isMobile())setTimeout(()=>{if(cur==name&&!run)$("play").click()},80);
}
$("more").onclick=e=>{const b=e.target.closest(".tile");if(b)openGame(b.dataset.g)};

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

$("nv").onclick=e=>{const a=e.target.closest("a");if(a&&a.dataset.v){e.preventDefault();show(a.dataset.v)}};
let tt;function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>e.classList.remove("show"),2400)}


render();draw();
route(location.pathname);
