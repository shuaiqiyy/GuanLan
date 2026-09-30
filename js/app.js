/* ============================================================
 * app.js — 路由 + 全局启动
 * deps: config.js, effects.js, portal.js, laptop.js
 * 职责：DOMContentLoaded 时调用 GLN.init()
 * ============================================================ */
window.GLN = window.GLN || {};

const routes = {
  "/": viewHome,
  "/notice/2027-088": viewNotice,
  "/news/guanlan": viewGuanlanNews,
  "/news/rumor": viewRumorNews,
  "/exam": viewExam,
  "/archive": viewArchive,
  "/room": viewRoom,
  "/room/301": viewRoom,
  "/about": viewAbout,
  "/news": viewNews,
  "/schedule": viewSchedule,
  "/tieba": viewTieba,
  "/doc1923": viewDoc1923,
  "/login": viewLogin,
  "/class": viewClass,
  "/admin": viewAdmin,
  "/admin/incident": viewAdminIncident,
  "/admin/camera": viewAdminCamera,
  "/admin/logs": viewAdminLogs,
  "/admin/roster": viewAdminRoster,
  "/admin/dashboard": viewAdminDashboard,
  "/admin/attendance": viewAdminAttendance,
  "/admin/students": viewAdminStudents,
  "/admin/courses": viewAdminCourses,
  "/admin/card": viewAdminCard,
  "/admin/notice": viewAdminNotice,
  "/admin/system": viewAdminSystem,
  "/admin/mirror": viewAdminMirror,
  "/teachers": viewTeachers,
  "/campus": viewCampus,
  "/campus/map": viewCampusMap,
  "/admission": viewAdmission,
  "/clubs": viewClubs,
  "/calendar": viewCalendar,
  "/contact": viewContact,
  "/canteen": viewCanteen,
  "/library": viewLibrary,
  "/health": viewHealth,
  "/lostandfound": viewLost,
  "/rules": viewRules,
  "/404": view404
};

/* 标题即线索：进井页时，其他字都被刮掉，只剩校名 */
const titles = {
  "/": "致稳中学 · 校园门户",
  "/exam": "成绩查询 - 致稳中学",
  "/archive": "校史馆 - 致稳中学",
  "/404": "该生不存在",
  "/about": "学校概况 - 致稳中学",
  "/news": "校务灵通 - 致稳中学",
  "/schedule": "作息时间 - 致稳中学",
  "/canteen": "师生餐厅 - 致稳中学",
  "/library": "图书馆 - 致稳中学",
  "/rules": "考核细则 - 致稳中学",
  "/teachers": "师资队伍 - 致稳中学",
  "/admin": "观澜 · 校务后台",
  "/login": "教职工入口 - 致稳中学"
};

function router(){
  let h = location.hash.replace(/^#/, "") || "/";
  // 首次进入强制起始页
  // 先无条件清掉后台深色，避免从 admin 进 laptop/jing 时扫描线叠在最上层
  document.body.classList.remove("admin");

  // 井：全屏黑页（z=200）
  if(h === "/jing"){ openJing(); document.title = "致稳中学"; return; }
  document.getElementById("jingPage").style.display = "none";

  // 笔记本模式（z=300）
  if(h === "/laptop"){ openLaptop(); return; }
  document.getElementById("laptopScreen").style.display = "none";
  // 顶部 chrome 统一在此控制：贴吧为无 chrome 独立页
  document.getElementById("portalRoot").style.display = "";
  const chromeLess = (h === "/tieba");
  document.querySelector("header").style.display = chromeLess ? "none" : "";
  document.querySelector("footer").style.display = chromeLess ? "none" : "";

  // 后台路由 -> 深色主题；其余 -> 亮色门户
  const isAdmin = h.startsWith("/admin");
  document.body.classList.toggle("admin", isAdmin);

  (routes[h] || view404)();
  document.title = titles[h] || (routes[h] ? "致稳中学" : "该生不存在");
  window.scrollTo(0, 0);

  // 恐怖等级：高档=笔记本/井，中档=root 已解，低档=门户
  const fl = GLN.P.prog;
  let lv = 1;
  if(h === "/laptop" || h === "/jing") lv = 3;
  else if(fl.root) lv = 2;
  if(GLN.effects && GLN.effects.setLevel) GLN.effects.setLevel(lv);
  if(GLN.portal && GLN.portal.glBubbleSync) GLN.portal.glBubbleSync(h!=="/laptop" && h!=="/jing");
}

/* 直连路径转 hash：/doc1923 -> #/doc1923 */
(function(){
  var p=location.pathname||"/";
  if(p!=="/" && !/index\.html$/.test(p) && !location.hash){ location.replace("#"+p); }
})();
window.addEventListener("hashchange", router);

/* ---- /laptop ---- */
function openLaptop(){
  document.getElementById("portalRoot").style.display = "none";
  const ls = document.getElementById("laptopScreen");
  ls.style.display = "block";
  ls.setAttribute("aria-hidden","false");
  if(!document.getElementById("desktop").innerHTML) buildDesktop();
  startLaptop();
}

/* ---- /jing ---- */
function stayEnding(){
  const jp=document.getElementById("jingPage");
  if(!jp) return;
  jp.innerHTML=`<div style="position:absolute;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#888;font-family:SimSun,serif;">
    <p id="stayLine" style="opacity:0;transition:opacity 2s;"></p>
    <button id="stayBtn" style="margin-top:50px;background:transparent;border:1px solid #333;color:#666;padding:8px 20px;opacity:0;transition:opacity 2s;">留下来</button>
  </div>`;
  const inner=jp.firstChild;
  setTimeout(()=>{
    const sl=document.getElementById("stayLine"); if(!sl) return;
    const t="每一轮，都有一个人是自己走进去的。"; sl.style.opacity=1;
    let i=0; const iv=setInterval(()=>{ sl.textContent=t.slice(0,++i); if(i>=t.length) clearInterval(iv); },200);
  },9000);
  setTimeout(()=>{
    const b=document.getElementById("stayBtn");
    if(b) b.style.opacity=1;
    b.onclick=()=>{ localStorage.removeItem("gln_prog"); jp.innerHTML=`<div style="position:absolute;inset:0;background:#000;color:#555;display:flex;align-items:center;justify-content:center;font-size:13px;">你还在这里。<a href="javascript:void(0)" onclick="GLN.showCredits()" style="position:absolute;bottom:40px;color:#333;font-size:11px;">结束</a></div>`; };
  },15000);
}
function openJing(){
  if(!GLN.P.prog.root){
    location.hash = "#/404";
    return;
  }
  document.getElementById("portalRoot").style.display = "none";
  document.getElementById("portalRoot").setAttribute("aria-hidden","true");
  const jp = document.getElementById("jingPage");
  jp.style.display = "flex";
  jp.style.backgroundImage = "url('assets/well.jpg')";
  jp.style.backgroundSize = "cover";
  jp.style.backgroundPosition = "center";
  const input = document.getElementById("jingInput");
  input.value = ""; setTimeout(()=> input.focus(), 50);
  const spot = document.getElementById("jingSpot");
  jp.onmousemove = e=>{
    spot.style.setProperty("--mx", e.clientX+"px");
    spot.style.setProperty("--my", e.clientY+"px");
  };
  document.getElementById("jingMsg").textContent = "";
  let jt="井里的先生在等人。<br>说一个名字。";
  if(P.p().incident) jt+="<br><span style='color:#555;font-size:12px;'>你查过 1923 年的编号了。</span>";
  document.querySelector("#jingBox p").innerHTML = jt;
  const hr = new Date().getHours();
  if(hr>=22||hr<5){ document.querySelector("#jingBox p").innerHTML = "终于等到你了。<br>说一个名字。"; }
  input.onkeydown = e=>{
    if(e.key !== "Enter") return;
    const name = input.value.trim();
    const msg = document.getElementById("jingMsg");
    if(name === GLN.CONFIG.jingName){
      msg.innerHTML = `<span style="color:#c9d4d8;">……你叫出了她的名字。</span>`;
      GLN.P.prog.jing = true; GLN.save();
      setTimeout(()=> location.hash = "#/laptop", 1300);
    } else if(name === "我自己" || (GLN.P.prog.pname && name === GLN.P.prog.pname)){
      GLN.P.prog.stayed = true; GLN.save();
      stayEnding();
    } else if(name === "我不知道"){
      GLN.P.prog.escape = (GLN.P.prog.escape||0)+1; GLN.save();
      msg.textContent = GLN.P.prog.escape >= 3
        ? "……你不想去看。也行。井里的先生不勉强。"
        : `（井里没有回答。你已经说了 ${GLN.P.prog.escape} 次"我不知道"。）`;
      if(GLN.P.prog.escape >= 3) setTimeout(()=> location.hash = "#/", 1500);
    } else if(name){
      msg.innerHTML = `<span class="red">井里没有人叫 ${name}。</span>`;
    }
  };
}

/* ---- 全局启动：填充安全条 → 各模块 init → 路由 ---- */
GLN.router = router;
GLN.init = function(){
  if(GLN._booted) return;
  // 起始页：首次访问拦截
  if(!localStorage.getItem("gln_started")){
    const ss = document.getElementById("startScreen");
    ss.style.display = "flex";
    document.getElementById("startEnter").onclick = ()=>{
      localStorage.setItem("gln_started","1");
      ss.classList.add("fade-out");
      setTimeout(()=>{ ss.classList.add("hidden"); bootMain(); }, 800);
    };
    document.getElementById("startLeave").onclick = ()=>{
      ss.innerHTML = '<div style="text-align:center;color:#3a4a54;font-size:13px;letter-spacing:4px;">感谢访问。<br><br>此页面可以关闭。</div>';
    };
    return;
  }
  bootMain();
};
GLN.showCredits = function(){
  if(document.getElementById('creditsScreen')) return;
  document.body.classList.add("credits-open");
  const C = GLN.CREDITS || {
    title:"观 澜", subtitle:"", authors:[], publisher:{name:"——"},
    thanks:[], testers:[], footer:"感谢游玩", closedText:"此页面可以关闭"
  };
  // testers 去重
  const seen = new Set();
  const uniq = C.testers.filter(t=>{ if(seen.has(t.name)) return false; seen.add(t.name); return true; });
  let testerLine = "内测支持　（自由添加）";
  if(uniq.length) testerLine = "内测支持　" + uniq.map(t=>t.name).join("、");
  let html = '<div id="creditsScreen"><div class="credits-bg"></div><div class="credits-inner">';
  html += '<div class="credits-logo">'+C.title+'</div>';
  html += '<div class="credits-sub">'+C.subtitle+'</div>';
  html += '<div class="credits-divider"></div>';
  html += '<div class="credits-block"><div class="credits-label">制 作</div>';
  C.authors.forEach(a=>{ html += '<div class="credits-names credits-names-lg">'+a.name+'</div>'; });
  html += '</div><div class="credits-divider"></div>';
  html += '<div class="credits-block"><div class="credits-label">出 品</div><div class="credits-names credits-names-lg">'+C.publisher.name+'</div></div>';
  html += '<div class="credits-divider"></div>';
  html += '<div class="credits-block"><div class="credits-label">特 别 致 谢</div>';
  C.thanks.forEach(t=>{ html += '<div class="credits-names">'+t.role+'　'+t.name+'</div>'; });
  html += '<div class="credits-names">'+testerLine+'</div>';
  html += '</div>';
  html += '<div class="credits-thanks">'+C.footer+'</div>';
  html += '<div class="credits-btns"><button id="creditsRestart" class="credits-btn">再 次 进 入</button><button id="creditsClose" class="credits-btn credits-btn-close">关 闭</button></div>';
  html += '</div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
  document.getElementById("creditsRestart").onclick = ()=>{
    localStorage.removeItem("gln_prog");
    location.hash = "#/";
    location.reload();
  };
  document.getElementById("creditsClose").onclick = ()=>{
    document.body.classList.remove("credits-open");
    document.getElementById("creditsScreen").innerHTML =
      '<div style="text-align:center;color:#3a4a54;font-size:12px;letter-spacing:8px;">'+C.closedText+'</div>';
  };
};
function bootMain(){
  if(GLN._booted) return;
  GLN._booted = true;
  document.getElementById("safetyBar").textContent = GLN.TEXT.safety;
  GLN.effects.init();
  GLN.laptop.init();
  GLN.portal.init();
  router();
  document.body.addEventListener("click", ()=> GLN.effects.sndHum(), {once:true});
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", GLN.init);
} else {
  GLN.init();
}
