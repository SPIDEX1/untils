const games=[],L={};
const cats=["All","Popular","Arcade","Action","Adventure","Puzzle","Racing","Space","Casual"];
const catIcon={Adventure:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 20l7-13 4 7 3-4 6 10z"/></svg>`,Racing:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="2" width="2" height="20" rx="1"/><rect x="8" y="4" width="12" height="10" rx="1" opacity=".3"/><rect x="8" y="4" width="3" height="2.5"/><rect x="14" y="4" width="3" height="2.5"/><rect x="11" y="6.5" width="3" height="2.5"/><rect x="17" y="6.5" width="3" height="2.5"/><rect x="8" y="9" width="3" height="2.5"/><rect x="14" y="9" width="3" height="2.5"/><rect x="11" y="11.5" width="3" height="2.5"/><rect x="17" y="11.5" width="3" height="2.5"/></svg>`,Space:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c3 2.5 4.5 6 4.5 9.5V16h-9v-4.5C7.5 8 9 4.5 12 2z"/><path d="M7.5 12.5L4.5 17v2.5l3-1.5zM16.5 12.5l3 4.500v2.500l-3-1.500z"/><path d="M10 17.500h4L12 22z"/></svg>`,Casual:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16z"/><circle cx="9" cy="10" r="1.400"/><circle cx="15" cy="10" r="1.400"/><path d="M8 14.500c1 2 2.400 3 4 3s3-1 4-3z"/></svg>`,All:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2.2"/><rect x="13" y="3" width="8" height="8" rx="2.2"/><rect x="3" y="13" width="8" height="8" rx="2.2"/><rect x="13" y="13" width="8" height="8" rx="2.2"/></svg>`,Popular:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5c.4 3.3-.9 4.8-2.6 6.8C7.7 10.3 6 12.2 6 15a6 6 0 0 0 12 0c0-2.3-.9-4.2-2.3-5.700-.2 1.500-.8 2.400-1.800 3C14.400 9 13.900 4.800 12 1.500z"/><path d="M12 21a3 3 0 0 1-3-3c0-1.500 1.100-2.400 2-3.500.7 1 2 1.800 3 3A3 3 0 0 1 12 21z" fill="#fff" opacity=".55"/></svg>`,IO:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="14.500" r="6.500"/><circle cx="18" cy="7" r="4"/><circle cx="19" cy="17.500" r="2.800"/></svg>`,Arcade:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="6" r="4.200"/><rect x="10.800" y="9" width="2.400" height="7"/><rect x="3" y="14.500" width="18" height="7" rx="3.500"/><circle cx="8" cy="18" r="1.300" fill="#fff" opacity=".9"/><circle cx="16" cy="18" r="1.300" fill="#fff" opacity=".9"/></svg>`,Puzzle:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.500 11H19V7a2 2 0 0 0-2-2h-4V3.500a2.500 2.500 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.800h1.500a2.700 2.700 0 0 1 0 5.400H2V20a2 2 0 0 0 2 2h3.800v-1.500a2.700 2.700 0 0 1 5.400 0V22H17a2 2 0 0 0 2-2v-4h1.500a2.500 2.500 0 0 0 0-5z"/></svg>`,Action:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.500 2L4 13.500h6.500L9.500 22 20 9.500h-6.800z"/></svg>`,Minimal:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l9 5-9 5-9-5z" opacity=".55"/><path d="M12 12.500l9-5V17l-9 5z"/><path d="M12 12.500l-9-5V17l9 5z" opacity=".8"/></svg>`};
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
 $("bar").innerHTML='<div class="pills">'+cats.map(c=>`<button class="pill ${c==cat?"on":""}" data-c="${c}" aria-label="${c}" title="${c}"><span class="pic">${catIcon[c]||catIcon.All}</span><span class="ptx">${c.toUpperCase()}</span></button>`).join("")+'</div>'+`<div class="dd">SORT BY<button class="ddb" id="ddb" aria-expanded="false" aria-haspopup="listbox">${sort}<svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l4 4 4-4"/></svg></button><ul class="ddm" id="ddm" role="listbox" hidden>${["Popular","Rating","Name"].map(s=>`<li role="option" data-s="${s}" class="${s==sort?"on":""}">${s}</li>`).join("")}</ul></div>`;
 let l=games.filter(g=>cat=="All"||cat=="Popular"?g[3]>=(cat=="Popular"?4.5:0):[g[1],g[2]].includes(cat));
 if(q)l=l.filter(g=>g[0].toLowerCase().includes(q));
 if(sort=="Name")l.sort((a,b)=>a[0].localeCompare(b[0]));else l.sort((a,b)=>b[3]-a[3]);
 $("grid").innerHTML=l.map(g=>`<button class="card" data-g="${g[0]}"><div class="th" style="background:linear-gradient(135deg,${g[5]})">${g[4]}</div><div class="cb"><h3>${g[0].toUpperCase()}</h3><small>${g[1].toUpperCase()} | ${g[2].toUpperCase()}</small><div class="row"><span><i><svg viewBox="0 0 10 10" width="9" height="9" fill="currentColor"><polygon points="2.6,1.2 8.6,5 2.6,8.8"/></svg></i>PLAY NOW</span></div></div></button>`).join("")||"<p style='color:var(--mut)'>No live games here yet. Check back soon!</p>";
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
function stopGame(){killFrame();if(run){run=false;cancelAnimationFrame(raf);UntilsSDK.gameplayStop()}paused=false;$("pause").classList.remove("show");$("over").classList.remove("show");$("start").classList.add("show");$("ad").classList.remove("show")}
cv.onpointerdown=e=>{if(!run)return;const b=cv.getBoundingClientRect(),x=(e.clientX-b.left)*GW/b.width,y=(e.clientY-b.top)*GH/b.height;if(Math.hypot(x-orb.x,y-orb.y)<orb.r+10){score++;spawn()}};
const inFsNow=()=>$("stage").classList.contains("fs");
const MOBDEV=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&Math.min(screen.width,screen.height)<820);
function killFrame(){const f=$("gf");if(f)f.remove()}
$("play").onclick=()=>{const g=L[cur];if(!g)return;const p=$("start").querySelector("p");
 if(g.device=="desktop"&&MOBDEV){p.textContent="\ud83d\udeab This game is not for mobile. Please play it on a desktop (PC).";p.style.color="#ff8a8a";return}
 if(isMobile())enterFs();killFrame();const f=document.createElement("iframe");f.id="gf";f.className="gfr";
 f.setAttribute("sandbox","allow-scripts allow-popups allow-pointer-lock");f.setAttribute("allow","fullscreen; autoplay; gamepad");f.setAttribute("allowfullscreen","");
 f.src="/live/"+g.key+"/index.html";$("stage").appendChild(f);$("start").classList.remove("show")};
$("again").onclick=()=>{if(isMobile()&&!inFsNow())enterFs();begin()};
$("pause").onclick=()=>{if(isMobile()&&!inFsNow())enterFs();if(paused)resume()};
$("rw").onclick=()=>{$("over").classList.remove("show");UntilsSDK.rewardedBreak(()=>{time=5;resume()})};
document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseGame()});

/* ---- game page: details, votes, more games ---- */
const info={};
let cur="",votes={},live=0,VC={l:0,d:0};
const vid=(()=>{try{let x=localStorage.getItem("untils_vid");if(!x){x=Array.from(crypto.getRandomValues(new Uint8Array(10)),b=>b.toString(16).padStart(2,"0")).join("");localStorage.setItem("untils_vid",x)}return x}catch(e){return"anon"+Math.random().toString(36).slice(2,14).padEnd(12,"0")}})();
try{votes=JSON.parse(localStorage.getItem("untils_votes")||"{}")}catch(e){}
const hash=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
const fmt=n=>n.toLocaleString("en-IN");
function paintVotes(){
 const v=votes[cur]||0;
 $("lkc").textContent=fmt(VC.l);$("dlc").textContent=fmt(VC.d);
 $("lk").classList.toggle("on",v==1);$("dl").classList.toggle("on",v==-1);
 $("lk").setAttribute("aria-pressed",v==1);$("dl").setAttribute("aria-pressed",v==-1);
}
function vote(x){const g=L[cur];if(!g)return;const nv=(votes[cur]==x)?0:x;
 fetch("/api/votes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({g:g.key,vid,v:nv})}).then(r=>r.json()).then(d=>{if(d.error)return;votes[cur]=d.mine;VC={l:d.l,d:d.d};try{localStorage.setItem("untils_votes",JSON.stringify(votes))}catch(e){}paintVotes()}).catch(()=>toast("No internet connection"))}
$("lk").onclick=()=>vote(1);$("dl").onclick=()=>vote(-1);
function openGame(name){
 const g=games.find(x=>x[0]==name);if(!g)return;
 cur=name;live=180+hash(name)%2400;stopGame();$("gt").textContent=name;
 const i=info[name]||["A fun game from the Untils catalogue.","Untils Studio"],h=hash(name);
 $("info").innerHTML=`<h2>${name.toUpperCase()}</h2>
 <div class="chips"><span class="chip">${g[1].toUpperCase()}</span><span class="chip">${g[2].toUpperCase()}</span></div>
 <h4>ABOUT</h4><p>${i[0]}</p>
 <h4>DETAILS</h4><dl class="dl"><div><dt>DEVELOPER</dt><dd>${i[1]}</dd></div><div><dt>CATEGORY</dt><dd>${g[1]}</dd></div><div><dt>PLATFORMS</dt><dd>${L[name].device=="desktop"?"Desktop only":"Desktop, mobile"}</dd></div></dl>`;
 $("more").innerHTML=games.filter(x=>x[0]!=name).slice(0,8).map(x=>`<button class="tile" data-g="${x[0]}" style="background:linear-gradient(135deg,${x[5]})" aria-label="Play ${x[0]}"><span class="te">${x[4]}</span><b>${x[0]}</b></button>`).join("");
 $("start").style.setProperty("--gbg","linear-gradient(135deg,"+g[5]+")");$("gemo").innerHTML=g[4];{const sp=$("start").querySelector("p");sp.textContent=i[0].replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,"\"").replace(/&#39;/g,"'");sp.style.color=""}
 $("gemo").classList.toggle("gimg",String(g[4]).startsWith("<img"));
 {const dn=$("dnote")||(()=>{const e=document.createElement("div");e.id="dnote";$("start").appendChild(e);return e})();const bl=L[name].device=="desktop"&&MOBDEV;$("start").classList.toggle("dsk",bl);dn.textContent=bl?"\ud83d\udda5 This game is for desktop (PC) only. Please open UNTILS on a computer to play it.":""};
 VC={l:0,d:0};paintVotes();show("game");
 fetch("/api/votes?g="+L[name].key+"&vid="+vid).then(r=>r.json()).then(d=>{if(cur==name&&!d.error){VC={l:d.l,d:d.d};votes[name]=d.mine;paintVotes()}}).catch(()=>{});
 if(!isMobile()&&!(L[name].device=="desktop"&&MOBDEV))setTimeout(()=>{if(cur==name&&!run)$("play").click()},80);
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



/* ---- popular banner ---- */
function buildBanner(){try{
 const box=document.getElementById("pban");if(!box)return;
 const pop=games.filter(g=>L[g[0]].popular).slice(0,5);
 if(!pop.length)pop.push(["Your Game Here","DEMO BANNER","",0,"","#1aa7ff,#7a3ffc"]);/* demo slide: delete this line later */
 const hb=g=>L[g[0]]&&L[g[0]].banner,bg=g=>hb(g)?`background:linear-gradient(90deg,rgba(0,0,20,.65),rgba(0,0,20,.05) 65%),url(${L[g[0]].banner}) center/cover`:g[0]=="Your Game Here"?"background:url(/assets/img/demo-banner.png) center/cover":`background:linear-gradient(110deg,${g[5]})`;
 const play='<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path transform="translate(-1.4 0)" d="M8 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>';
 box.innerHTML=pop.map((g,i)=>`<div class="pb-s${i?"":" on"}" data-g="${g[0]}" style="${bg(g)}"><div class="pb-t"><span class="pb-tag">POPULAR</span><h2>${g[0]}</h2><p>${g[1]}</p><button class="pb-b" tabindex="-1">${play}<span>Play Now</span></button></div><div class="pb-e">${hb(g)?"":g[4]}</div></div>`).join("")+'<div class="pb-d">'+pop.map((g,i)=>`<i data-i="${i}"${i?"":' class="on"'}></i>`).join("")+'</div>';
 const slides=box.querySelectorAll(".pb-s"),dots=box.querySelectorAll(".pb-d i");let cur=0,timer;
 const go=n=>{slides[cur].classList.remove("on");dots[cur].classList.remove("on");cur=(n+slides.length)%slides.length;slides[cur].classList.add("on");dots[cur].classList.add("on")};
 const start=()=>{clearInterval(timer);timer=setInterval(()=>go(cur+1),4500)};
 box.onmouseenter=()=>clearInterval(timer);box.onmouseleave=start;start();
 box.onclick=e=>{const d=e.target.closest(".pb-d i");if(d){go(+d.dataset.i);start();return}const sl=e.target.closest(".pb-s");if(sl)openGame(sl.dataset.g)};
}catch(err){console.error(err)}}

function startApp(){render();draw();buildBanner();route(location.pathname)}
const SU="https://fjfkwfklglovuxeecxsg.supabase.co/storage/v1/object/public/game-icons/";
const esc=t=>String(t==null?"":t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
fetch("/api/live").then(r=>r.json()).then(d=>{(d.games||[]).forEach(x=>{
 const n=String(x.title||"").replace(/[<>&"'`\\$]/g,"").trim();if(!n||L[n])return;
 L[n]={key:x.key,device:x.device,popular:!!x.popular,banner:x.banner?SU+x.banner:""};
 games.push([n,x.category,x.device=="desktop"?"PC":"Mobile + PC",x.popular?5:0,x.icon?`<img class="gi" src="${SU+x.icon}" alt="">`:"\ud83c\udfae","#1aa7ff,#7a3ffc"]);
 info[n]=[esc(x.description),esc(x.studio||"Indie developer")]})}).catch(()=>{}).then(startApp);

