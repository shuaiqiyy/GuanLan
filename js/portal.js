/* ============================================================
 * portal.js — 亮色教务门户（公开） + 深色教职工后台（登录后）
 * deps: config.js（GLN / CONFIG / TEXT / P / save）, effects.js
 * ============================================================ */
window.GLN = window.GLN || {};
GLN.portal = GLN.portal || {};

/* P / save / P.p 均由 config.js 提供 */

const app = document.getElementById("app");
function pageShell(inner){ app.innerHTML = inner; }

/* ---------- 公开：首页（光鲜） ---------- */
function viewHome(){
  const newsHtml = CONFIG.news.slice(0,5).map(n=>`
    <div class="news-row" onclick="location.hash='#/news'">
      <span><span class="cat">[${n[0]}]</span> ${n[2]}</span>
      <span class="date">${n[1]}</span>
    </div>`).join("");
  pageShell(`
    <div class="marquee">2027 年秋季期中成绩已公布 · 请到「成绩查询」查看</div>
    <div class="hero">
      <img src="/assets/running.jpg" alt="跑操" class="hero-img" style="width:100%;display:block;">
      <div style="position:absolute;right:4px;bottom:2px;font-size:1px;color:#000;opacity:.01;user-select:none;">本图摄于 2027-09-20。当天出操人数：${8430+Math.floor(Math.random()*3)}</div>
      <div style="position:absolute;left:0;right:0;bottom:0;padding:16px 20px;background:linear-gradient(transparent,rgba(0,0,0,.6));color:#fff;">
        <h1 style="color:#fff;letter-spacing:5px;font-weight:normal;border:none;padding:0;">致 稳 中 学</h1>
        <p style="font-size:13px;opacity:.85;">超越 · 永□□□　|　省级示范性高中</p>
      </div>
    </div>
    <div class="card">
      <div class="grid">
        <a href="#/about"><b>学校概况</b><span>校史 / 校训</span></a>
        <a href="#/news"><b>校务灵通</b><span>新闻通知</span></a>
        <a href="#/exam" class="gln-hint"><b>成绩查询</b><span>输入学号</span></a>
        <a href="#/schedule"><b>作息时间</b><span>跑操 6:10</span></a>
        <a href="#/archive"><b>校史馆</b><span>百年校史</span></a>
        <a href="#/room"><b>心理辅导预约</b><span>关爱学生</span></a>
      </div>
    </div>
    ${!P.prog.started ? `<div class="card" style="border-left:3px solid #1e6fb8;">
      <p>同学你好。本学期期中成绩已公布。</p>
      <p class="dim" style="margin-top:6px;">请到「成绩查询」输入你的学号查看。学号在你的学生证上，共 8 位。</p>
      <p style="margin-top:8px;"><a href="#/exam" style="color:#1e6fb8;">前往成绩查询 →</a></p>
    </div>` : ""}
    <div class="card">
      <h2>校务灵通</h2>
      ${newsHtml}
    </div>
    <div class="card">
      <img src="/assets/oath.jpg" style="width:100%;display:block;" alt="百日誓师">
      <p style="margin-top:8px;" class="dim">—— 百日誓师大会。红绸系在腕上，誓师后统一收回。</p>
    </div>
    <div class="card">
      <img src="/assets/ribbon.jpg" style="width:100%;display:block;" alt="红绸">
      <p style="margin-top:8px;" class="dim">—— 誓师红绸，用后统一回收。有一截不知去向。</p>
    </div>
    <div class="card">
      <img src="/assets/canteen.jpg" style="width:100%;display:block;" alt="食堂">
      <p style="margin-top:8px;" class="dim">—— 午餐时间。摄于 2027-09-12。</p>
    </div>
    <div class="card" style="display:flex;justify-content:space-between;align-items:center;">
      <p class="dim">跑操 6:10，迟到扣量化分。</p>
      <a href="#/login" style="font-size:12px;">教职工入口 →</a>
    </div>`);
}

/* ---------- 公开：通知（4月32日） ---------- */
function viewNotice(){
  pageShell(`
    <div class="card">
      <h1>关于校园网系统维护的通知</h1>
      <p class="dim">文号：致稳信息〔2027〕088 号</p>
      <p>各位师生：</p>
      <p>为提升"观澜"行为分析服务，系统将于
        <span class="red" style="font-family:monospace;">2027 年 4 月 32 日 22:00</span>
        至次日 6:00 升级。期间成绩查询暂停。</p>
      <p class="dim">——信息中心　2027 年 4 月</p>
      <div style="margin-top:24px;padding-top:16px;border-top:1px dashed #ccc;">
        <p class="dim">系统升级对照表（节选）：</p>
        <p class="dim">· 校训完整表述请参照"参照组"官网。</p>
        <p class="dim">· 建校年份见参照组"学校简介"。</p>
        <p class="dim">· 路名见参照组官网页脚。</p>
        <p class="dim">· 本条说明由信息中心发布，仅作技术对照。</p>
      </div>
      ${P.p().root ? '<p style="margin-top:20px;font-size:12px;color:#888;">相关档案见 <a href="#/jing">/jing</a></p>' : ''}
    </div>`);
}

/* ---------- 公开：成绩查询 ---------- */
function viewExam(){
  pageShell(`
    <div class="card">
      <h1>成绩查询系统</h1>
      <p class="dim">输入学号即可查询期中成绩。</p>
      <div style="margin-top:12px;">
        <input type="text" id="examIn" placeholder="学号" value="${P.p().examId||''}">
        <button class="btn" onclick="doExam()">查询</button>
      </div>
      <div id="examOut"></div>
    </div>`);
}
let _examToken=0;
async function doExam(){
  const v = document.getElementById("examIn").value.trim();
  const out = document.getElementById("examOut");
  const my=++_examToken; const alive=()=>my===_examToken;
  if(v === CONFIG.examId){
    const wasExam = P.prog.exam;
    P.prog.exam = true; P.prog.examId = v; P.prog.started = true; save();
    out.innerHTML = `
      <div class="transcript" id="tr">
        <h3 class="row" style="text-align:center;letter-spacing:4px;">致稳中学 · 高三(7)班 成绩通知单</h3>
        <p class="row" style="text-align:right;">学号：${v}　姓名：林见月</p>
        <table>
          <tr class="row"><th>科目</th><th>成绩</th><th>班排</th></tr>
          <tr class="row"><td>语文</td><td>112</td><td>41</td></tr>
          <tr class="row"><td>数学</td><td>98</td><td>43</td></tr>
          <tr class="row"><td>英语</td><td>121</td><td>39</td></tr>
          <tr class="row"><td>综合</td><td>205</td><td>44</td></tr>
          <tr class="row" id="fitRow"><td>群体契合度</td><td id="fitScore" style="color:#888;transition:color .2s;">22.0</td><td>倒 1</td></tr>
        </table>
        <div class="verdict" id="verdict"></div>
      </div>
      <p style="margin-top:10px;min-height:20px;text-align:right;"><span id="ghostLine"></span></p>`;
    const rows=out.querySelectorAll(".row");
    if(GLN.effects.sndPrinter) GLN.effects.sndPrinter();
    await GLN.motion.pause(700); if(!alive()) return;
    out.querySelector("#tr").classList.add("revealing");
    for(const r of rows){ r.classList.add("on"); await GLN.motion.pause(180); if(!alive()) return; }
    await GLN.motion.pause(400); if(!alive()) return;
    const fs=out.querySelector("#fitScore"); if(fs) fs.style.color="#c0392b";
    const fr=out.querySelector("#fitRow"); if(fr) fr.classList.add("shake");
    await GLN.motion.pause(200); if(!alive()) return;
    const vd=out.querySelector("#verdict");
    await GLN.motion.type(vd,"班主任评语：心理评估——不建议参加高考。",{speed:40,cursor:true});
    await GLN.motion.pause(1500); if(!alive()) return;
    const g=out.querySelector("#ghostLine");
    if(g){ g.className="red ghostline"; g.textContent="该生不存在。"; }
    if(!wasExam) out.insertAdjacentHTML("beforeend",
      '<p style="margin-top:14px;font-size:11px;color:#aaa;">来源：致稳中学学籍档案 · <a href="#/archive" style="color:#888;">在校史馆查阅原始记录</a></p>');
    if(GLN.effects.scratchOnce) GLN.effects.scratchOnce();
  } else if(!v){
    out.innerHTML = `<p class="dim">请输入学号。</p>`;
  } else {
    out.innerHTML = `<p class="red">查无此人。该学号未在校名册中登记。</p>`;
  }
}

/* ---------- 公开：校史馆（含现实锚点） ---------- */
function viewArchive(){
  pageShell(`
    <div class="card">
      <h1>校史馆 · 老照片</h1>
      <p class="dim">学校前身可追溯至 1923 年。以下为馆藏历史照片。</p>
      <div style="margin-top:14px;">
        <img src="/assets/old1923.jpg" style="width:100%;filter:sepia(.2);" alt="1923合影">
        <p style="margin-top:8px;">—— 1923 年，女师毕业合影。第三排左四那一位，照片上有一道旧刮痕。</p>
        <p>照片背面铅笔字：<span class="dim">"校址在同一纬度，往东三十公里。"</span></p>
      </div>
      <div style="margin-top:22px;">
        <img src="/assets/corkboard.jpg" style="width:100%;" alt="公告板合影">
        <p style="margin-top:8px;">—— 近年班级合影，部分人像因故模糊。</p>
      </div>
      <div style="margin-top:22px;">
        <img src="/assets/locust.jpg" style="width:100%;" alt="老槐树">
        <p style="margin-top:8px;">—— 图书馆前的老槐树。树上木牌原是心愿，近年落款越来越淡。</p>
      </div>
      <div style="margin-top:22px;">
        <img src="/assets/site.jpg" style="width:100%;" alt="施工围挡">
        <p style="margin-top:8px;">—— 图书馆东南角施工围挡。公示牌上写：地下停车场。</p>
      </div>
      ${P.p().exam ? `
      <div style="margin-top:22px;position:relative;">
        <h2>同一所学校 · 两张合影</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <img src="/assets/old1923.jpg" style="width:100%;filter:sepia(.2);">
          <img src="/assets/class2027.jpg" style="width:100%;">
        </div>
        <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;">
          <path d="M25% 40% Q 40% 55% 50% 50%" stroke="#e8e4d8" stroke-width="3" fill="none" class="convscratch"/>
          <path d="M75% 55% Q 60% 45% 50% 50%" stroke="#e8e4d8" stroke-width="3" fill="none" class="convscratch"/>
        </svg>

      </div>` : ""}

      <h2>刮花的奖状 · 校训残字</h2>
      ${P.p().exam ? `
      <p class="dim">墙上奖状被刮去大半，只剩：□□<b>${CONFIG.mottoChar3}</b>□□<b>${CONFIG.mottoChar6}</b>□（共六字）</p>
      <div style="margin-top:10px;">
        <input type="text" id="mottoIn" placeholder="补全六字校训" style="width:200px;">
        <button class="btn" onclick="checkMotto()">补全</button>
      </div>
      <div id="mottoOut" style="margin-top:8px;"></div>
      <p style="margin-top:8px;font-size:12px;">
        <a href="javascript:void(0)" onclick="skipAnchor()" style="color:#b0b8c0;">[跳过]</a>
      </p>` : `<p class="dim">奖状原件已封存。查询学籍后可申请调阅。</p>`}
    </div>`);
}
function skipAnchor(){
  // 跳过现实锚点：直接解锁，不写入任何答案明文
  P.prog.motto = true; P.prog.root = true; save();
  const out = document.getElementById("mottoOut");
  out.innerHTML = `<p style="color:#1e6fb8;">刮痕已抹平。</p>`;
}
async function checkMotto(){
  const v = document.getElementById("mottoIn").value;
  const out = document.getElementById("mottoOut");
  if(await GLN.verify("motto", v)){
    out.innerHTML = `<div style="margin-top:10px;">
        <label>建校年份：<input type="text" id="yearIn" placeholder="四位" style="width:110px;"></label><br>
        <label style="display:block;margin-top:6px;">路名第二个字：<input type="text" id="roadIn" placeholder="单字" style="width:80px;"></label>
        <button class="btn" onclick="checkRoot()" style="margin-top:8px;">对出生证明</button>
      </div>
      <div id="rootOut" style="margin-top:8px;"></div>`;
    P.prog.motto = true; save();
  } else if(v.trim()){
    out.innerHTML = `<p class="red">校验失败。</p>`;
  }
}
async function checkRoot(){
  const y = document.getElementById("yearIn").value;
  const r = document.getElementById("roadIn").value;
  const out = document.getElementById("rootOut");
  const ok = (await GLN.verify("year", y, true)) && (await GLN.verify("road", r));
  if(ok){
    out.innerHTML = `<p style="font-size:12px;color:#888;">锚定成功。会话权限已同步至<a href="#/login" style="color:#666;">学生终端</a>。</p>`;
    P.prog.root = true; save();
    scratchOnce();
  } else {
    out.innerHTML = `<p class="red">锚定失败。</p>`;
  }
}

/* ---------- 公开：心理咨询（学生端，正常） ---------- */
function viewRoom(){
  pageShell(`
    <div class="card">
      <h1>心理辅导室预约</h1>
      <p>同学你好，学校很关心你的身心健康。</p>
      <p class="dim">请登记你的姓名，老师会记下。</p>
      <div style="margin-top:12px;">
        <input type="text" id="roomName" placeholder="你的名字" value="${P.p().pname||''}">
        <button class="btn" onclick="roomSay(1)">预约本周</button>
        <button class="btn" onclick="roomSay(0)" style="background:#999;">暂时不需要</button>
      </div>
      <div id="roomOut" style="margin-top:14px;"></div>
      <div style="margin-top:60px;font-size:10px;color:#999;line-height:2;border-top:1px dashed #ccc;padding-top:8px;">
        心理辅导室 · 位置说明<br>
        地点：三号楼 301 室<br>
        门牌：2024 年重新制作<br>
        备注：原 301 室于 2003 年改为储物间。心理辅导室现仍设于三号楼。
      </div>
    </div>`);
}
function roomSay(ok){
  const o = document.getElementById("roomOut");
  if(ok){
    const n = document.getElementById("roomName").value.trim();
    if(n){ P.prog.pname = n; save(); }
    o.innerHTML = `<p class="dim">已登记。</p>`;
  } else {
    P.prog.refusals = (P.p().refusals||0)+1; save();
    o.innerHTML = `<p class="dim">已记录。</p>`;
  }
}

/* ---------- 公开：学校概况 ---------- */
function viewAbout(){
  pageShell(`
    <div class="card">
      <h1>学校概况</h1>
      <div class="about-head">
        <div class="seal">致稳<br>中学</div>
        <div>
          <p style="font-size:18px;">致稳中学</p>
          <p class="dim">校训：超越 · 永□□□　|　省级示范性高中</p>
        </div>
      </div>
      <p>致稳中学始建于 19□□ 年，坐落于华北平原。学校以精细化管理闻名，
      跑操、量化考核、誓师大会是我校传统。现有教学班九十余个，在校学生八千余人。</p>
      <p style="margin-top:10px;">地址：致稳市问□□街 98 号（虚构）<br>
      <span class="dim">（校名地址均为虚构。）</span></p>
    </div>
    <div class="card">
      <h2>站点</h2>
      <div class="grid">
        <a href="#/news"><b>新闻列表</b><span>校务灵通</span></a>
        <a href="#/schedule"><b>作息时间表</b><span>跑操 6:10</span></a>
        <a href="#/tieba"><b>致稳中学吧</b><span>外部站点</span></a>
        <a href="#/doc1923"><b>1923 退学训令</b><span>校史馆扫描件</span></a>
      </div>
    </div>`);
}

/* ---------- 公开：新闻 ---------- */
function viewNews(){
  const hl=["不实传言","重拍","观澜","心理普查","绿化改造","珍贵老照片","金桂"];
  const rows = CONFIG.news.map((n,i)=>{
    const big = hl.some(k=>n[2].includes(k)) ? 'style="font-size:15px;font-weight:bold;color:#222;"' : "";
    return `<div class="news-row" onclick="openNews(${i})">
      <span><span class="cat">[${n[0]}]</span> <span ${big}>${n[2]}</span></span>
      <span class="date">${n[1]}</span>
    </div>`;}).join("");
  pageShell(`
    <div class="card">
      <h1>校务灵通</h1>${rows}
      <p class="dim" style="margin-top:14px;"></p>
      <div id="newsOut" style="margin-top:14px;"></div>
    </div>`);
}
function openNews(i){
  const n = CONFIG.news[i];
  if(n[3]){ location.hash = n[3]; return; }
  const o = document.getElementById("newsOut");
  if(i === CONFIG.news.length-1){
    o.innerHTML = `<p class="red">该页不存在。</p>`;
  } else {
    o.innerHTML = `<p class="dim">${n[2]}——正文略。一切正常。</p>`;
  }
}

/* ---------- 公开：作息表 ---------- */
function viewSchedule(){
  const s = [
    ["05:50","起床 / 洗漱"],["06:10","跑操方阵"],["06:35","早读"],
    ["07:30","早饭"],["08:00","上午五节课"],["12:00","午饭 / 午休"],
    ["14:00","下午四节课"],["17:30","跑操 / 晚饭"],["18:30","晚自习"],
    ["22:00","查寝点名"],["22:10","熄灯"]
  ];
  pageShell(`
    <div class="card">
      <h1>致稳中学 · 作息时间表</h1>
      <table class="sched">
        ${s.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}
      </table>
    </div>`);
}

/* ============================================================
 * 教职工后台（登录后，深色）
 * ============================================================ */
function viewLogin(){
  pageShell(`
    <div class="card" style="max-width:420px;margin:60px auto;">
      <h1 style="text-align:center;">学生终端</h1>
      <p class="dim" style="text-align:center;">致稳中学 · 统一认证 V3.2<br><span style="font-size:11px;">学号登录：请使用本人学号。<br>教职工登录：请使用信息中心下发的访问令牌。</span></p>
      <div style="margin-top:18px;">
        <input type="text" id="loginId" placeholder="学号" style="width:100%;margin-bottom:10px;" value="">
        <input type="password" id="pwIn" placeholder="密码（首次登录与学号相同）" style="width:100%;">
        <button class="btn" style="width:100%;margin-top:12px;" onclick="doLogin()">登 录</button>
      </div>
      <div id="loginOut" style="margin-top:12px;font-size:13px;"></div>
      <p class="dim" style="margin-top:18px;font-size:12px;">学生：学号即密码。教职工：使用信息中心下发的令牌。</p>
    </div>`);
}
async function doLogin(){
  const v = document.getElementById("pwIn").value.trim() || document.getElementById("loginId").value.trim();
  const o = document.getElementById("loginOut");
  if(!v){ o.innerHTML=`<p class="red">请输入。</p>`; return; }
  // 教职工令牌
  if(/^ZW\d{4}$/.test(v)){
    if(await GLN.verify("token", v)){
      P.prog.admin = true; save();
      o.innerHTML = `<p style="color:#1e6fb8;">验证通过。</p>`;
      setTimeout(()=> location.hash = "#/admin", 700);
    } else {
      o.innerHTML = `<p class="red">令牌无效。</p>`;
    }
    return;
  }
  // 学生学号
  if(GLN.norm(v, true) === GLN.CONFIG.examId){
    P.prog.laptopReached = true; save();
    o.innerHTML = `<p style="color:#1e6fb8;">正在恢复上次会话……</p>`;
    setTimeout(()=> GLN.laptop.enter(), 500);
    return;
  }
  if(!/^\d{8}$/.test(v)){ o.innerHTML=`<p class="red">格式错误。</p>`; return; }
  o.innerHTML = `<p class="red">学号或密码错误。</p>`;
}

/* 后台守卫：未登录打回 */
function adminGuard(){
  if(!P.p().admin){ location.hash = "#/login"; return false; }
  return true;
}

function viewAdmin(){
  if(!adminGuard()) return;
  adminShell(`
    <h1>观澜 · 校务后台</h1>
    <p class="dim">教职工：admin　|　今日全校契合度均值 78.4</p>
    <div class="grid">
      <a href="#/admin/dashboard"><b>系统总览</b><span>实时事件流</span></a>
      <a href="#/admin/attendance"><b>考勤系统</b><span>今日应到 / 实到</span></a>
      <a href="#/admin/students"><b>学生档案</b><span>按学号检索</span></a>
      <a href="#/admin/courses"><b>课表管理</b><span>高三年级</span></a>
      <a href="#/admin/card"><b>校园卡</b><span>消费记录</span></a>
      <a href="#/admin/camera"><b>实时监控</b><span>1200 路</span></a>
      <a href="#/admin/logs"><b>系统日志</b><span>观澜引擎</span></a>
      <a href="#/admin/roster"><b>待疏导名单</b><span>契合度 &lt; 阈值</span></a>
        <a href="#/admin/incident"><b>事件报告</b><span>ZW-2027-0908</span></a>
      <a href="#/admin/mirror"><b>一楼仪容镜</b><span>巡检记录</span></a>
      <a href="#/admin/notice"><b>通知发布</b><span>历史通知 / 草稿</span></a>
      <a href="#/admin/system"><b>系统设置</b><span>敏感词 / 保留周期</span></a>
      <a href="#/laptop"><b>旧设备回收</b><span>一台待归档笔记本</span></a>
    </div>`);
}


/* ============================================================
 * 教职工后台扩展：侧边栏 + 8 个新页面（世界感填充）
 * ============================================================ */
function adminShell(inner){
  const cur = location.hash.split("?")[0];
  const links = [
    ["#/admin","系统总览"],["#/admin/attendance","考勤"],["#/admin/students","学生档案"],
    ["#/admin/courses","课表"],["#/admin/card","校园卡"],["#/admin/camera","监控"],
    ["#/admin/logs","日志"],["#/admin/roster","待疏导名单"],["#/admin/incident","事件报告"],["#/admin/mirror","仪容镜"],
    ["#/admin/notice","通知发布"],["#/admin/system","系统设置"]
  ];
  pageShell(`<div style="display:flex;gap:16px;align-items:flex-start;">
    <aside style="width:150px;flex-shrink:0;background:#12181f;border:1px solid #1e2a33;padding:10px;">
      ${links.map(l=>{
        const on = (l[0]===cur)?"background:#162029;border-left-color:#6fd3e3;color:#6fd3e3;":"";
        return `<div style="padding:7px 10px;font-size:13px;color:#9fb2bd;border-left:2px solid transparent;${on}"><a href="${l[0]}" style="color:inherit;text-decoration:none;">${l[1]}</a></div>`;
      }).join("")}
    </aside>
    <div style="flex:1;min-width:0;">${inner}</div></div>`);
}

function viewAdminDashboard(){
  if(!adminGuard()) return;
  adminShell(`<h1>系统总览 · 今日</h1>
  <div style="display:flex;gap:14px;margin:12px 0;">
    <div class="card" style="margin:0;"><b>78.4</b><div class="dim">今日契合度均值</div></div>
    <div class="card" style="margin:0;"><b>17</b><div class="dim">异常事件</div></div>
    <div class="card" style="margin:0;"><b>3</b><div class="dim">待疏导</div></div>
  </div>
  <h2>近 30 天均值</h2>
  <svg viewBox="0 0 400 120" style="width:100%;background:#0a0e12;">
    <polyline points="10,20 40,22 70,25 100,30 130,33 160,40 190,45 220,52 250,60 280,68 310,78 340,88 370,98 390,104" fill="none" stroke="#6fd3e3" stroke-width="1.5"/>
  </svg>
  <h2>实时事件流</h2>
  <div class="logbox" id="evStream">
    12:07 摄像头 12-07 检测到异常声波<br>
    13:22 高三(7)班 群体契合度下降 0.3<br>
    15:41 图书馆东南角 停留>5min 人数：1<br>
    18:08 一楼仪容镜 停留>3min 人数：2<br>
    22:10 查寝点名 302 床 无人应答
  </div>
  <p style="text-align:right;"><span style="display:inline-block;width:14px;height:14px;border:2px solid #6fd3e3;border-top-color:transparent;border-radius:50%;animation:spin 1.2s linear infinite;"></span> 观澜引擎 v3.7</p>`);
}

function viewAdminAttendance(){
  if(!adminGuard()) return;
  adminShell(`<h1>考勤系统</h1>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr style="border-bottom:1px solid #1e2a33;"><td>班级</td><td>应到</td><td>实到</td></tr>
    <tr style="border-bottom:1px solid #1e2a33;"><td>高三(1)班</td><td>45</td><td>45</td></tr>
    <tr style="border-bottom:1px solid #1e2a33;background:#2a1515;"><td>高三(7)班</td><td>31</td><td>31</td></tr>
    <tr style="border-bottom:1px solid #1e2a33;"><td>高三(8)班</td><td>44</td><td>44</td></tr>
  </table>
  <p style="margin-top:14px;">高三(7)班明细：应到 31，实到 31。合影人数：<b style="color:#b33a3a;">32</b>。</p>
  <p class="dim" style="margin-top:10px;">数据不一致，请核查。</p>`);
}

function viewAdminStudents(){
  if(!adminGuard()) return;
  const q=(document.getElementById("stuQ")||{value:""}).value;
  let body="";
  if(q==="20270731"||q==="林见月"){ body=`<p class="red ghostline">该生不存在。</p>`; }
  else if(q==="20270714"){ body=`<p>学号 20270714　陈屿</p><div style="width:80px;height:100px;background:#fff;margin:10px 0;"></div><p class="dim">最近更新：2027-09-08</p>`; }
  else if(q){ body=`<p class="dim">无匹配记录。</p>`; }
  adminShell(`<h1>学生信息管理</h1>
  <input id="stuQ" value="${q||''}" placeholder="学号 / 姓名" style="width:200px;">
  <button class="btn" onclick="stuGo()">查询</button>
  <div id="stuOut" style="margin-top:14px;">${body}</div>`);
}

function viewAdminCourses(){
  if(!adminGuard()) return;
  adminShell(`<h1>课表管理 · 高三年级</h1>
  <table class="sched" style="width:100%;"><tr><td>周一</td><td>数学 语文 英语 晚自习</td></tr>
  <tr><td>周二</td><td>物理 化学 生物 晚自习</td></tr>
  <tr style="color:#b33a3a;"><td>周三</td><td>语文 数学 英语 <b>个别谈话</b></td></tr>
  <tr><td>周四</td><td>化学 生物 数学 晚自习</td></tr>
  <tr><td>周五</td><td>英语 物理 语文 班会</td></tr></table>
  <p class="dim" style="margin-top:10px;">（仅高三(7)班周三晚自习安排了个别谈话。）</p>`);
}

function viewAdminCard(){
  if(!adminGuard()) return;
  const q=(document.getElementById("cardQ")||{value:""}).value;
  let body="";
  if(q==="20270731"){ body=`<p>9-25 12:00　食堂　8.5 元<br>9-25 之后无记录。</p>`; }
  else if(q==="20270714"){ body=`<p>9-08 之后无记录。</p>`; }
  else if(q){ body=`<p class="dim">无消费记录。</p>`; }
  adminShell(`<h1>校园卡消费</h1>
  <input id="cardQ" value="${q||''}" placeholder="卡号=学号">
  <button class="btn" onclick="cardGo()">查询</button>
  <div id="cardOut" style="margin-top:14px;">${body}</div>
  <p class="dim" style="margin-top:20px;">消费记录不会说谎。</p>`);
}

function viewAdminNotice(){
  if(!adminGuard()) return;
  adminShell(`<h1>通知发布</h1>
  <div class="logbox">发布面板（占位）：标题____　正文____　[发布]</div>
  <h2>历史通知</h2>
  <p><b>关于重拍 2027 届毕业合影的通知</b> <span class="dim">2027-09-24 14:30 德育处</span></p>
  <p class="dim">因上一版合影画面异常，定于 9 月 26 日重拍。请全体高三学生按原站位站立。缺席者需说明原因。</p>
  <p style="margin-top:14px;"><b>草稿：关于 2027 届高三年级个别谈话安排（待发）</b></p>
  <p class="dim">名单见附件。</p>
  <p class="red">附件：名单.pdf（加密，无法打开）</p>`);
}

function viewAdminSystem(){
  if(!adminGuard()) return;
  adminShell(`<h1>系统设置</h1>
  <p>敏感词过滤：<b style="color:#6fd3e3;">已启用</b></p>
  <p>监控保留周期：7 天</p>
  <p>数据导出：导出为加密文件</p>
  <h2>关于</h2>
  <p class="dim">本系统由致稳中学信息中心自主研发。<br>
  算法模型基于 1923 年以来本校学生行为数据训练。<br>
  版本 v3.7</p>
  <h2>日志</h2>
  <div class="logbox">2027-09-26 03:17 系统检测到未知设备接入</div>`);
}
function stuGo(){
  const q=(document.getElementById("stuQ")||{value:""}).value.trim();
  const o=document.getElementById("stuOut"); if(!o) return;
  if(q==="20270731"||q==="林见月") o.innerHTML=`<p class="red ghostline">该生不存在。</p>`;
  else if(q==="20270714") o.innerHTML=`<p>学号 20270714　陈屿</p><div style="width:80px;height:100px;background:#fff;margin:10px 0;"></div><p class="dim">最近更新：2027-09-08</p>`;
  else if(q) o.innerHTML=`<p class="dim">无匹配记录。</p>`;
}
function cardGo(){
  const q=(document.getElementById("cardQ")||{value:""}).value.trim();
  const o=document.getElementById("cardOut"); if(!o) return;
  if(q==="20270731") o.innerHTML=`<p>9-25 12:00　食堂　8.5 元<br>9-25 之后无记录。</p>`;
  else if(q==="20270714") o.innerHTML=`<p>9-08 之后无记录。</p>`;
  else if(q) o.innerHTML=`<p class="dim">无消费记录。</p>`;
}
function viewAdminCamera(){
  if(!adminGuard()) return;
  if(!P.p().booted){
    adminShell(`<h1>监控 · 摄像头 12-07</h1>
      <p class="dim" style="color:#777;">本摄像头需设备级授权。请先在「旧设备回收」处完成设备归档。</p>
      <p style="margin-top:10px;"><a href="#/laptop">→ 前往旧设备回收</a></p>`);
    return;
  }
  adminShell(`<h1>监控 · 摄像头 12-07</h1>
    <div class="cctv">
      <img src="/assets/cctv.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.9;" alt="cctv">
      <div class="scan"></div>
      <div class="rec">REC</div><div class="ts">2027-09-26 03:17:42</div>
    </div>
    <p class="dim" style="margin-top:10px;">那个黑影站着不动已经三分十二秒了。
    该摄像头编号在花名册上不存在。</p>
    <div class="logbox" style="margin-top:14px;">保安巡逻日志 2027-09-25：<br>19:00 常规巡逻。<br>21:40 图书馆东南角围挡被人动过，沙子新翻。<br>21:55 调监控。12-07 当晚 21:30-21:52 无信号。<br>22:00 上报。</div>`);
}

function viewAdminLogs(){
  if(!adminGuard()) return;
  adminShell(`<h1>观澜系统日志</h1>
    <div class="logbox">${TEXT.log.map(l=>`<div>${l}</div>`).join("")}</div>`);
}

function viewAdminRoster(){
  if(!adminGuard()) return;
  adminShell(`<h1>待疏导名单（契合度 &lt; 35）</h1>
    <table style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr style="text-align:left;"><th style="padding:6px;border-bottom:1px solid #1e2a33;">学号</th><th>班级</th><th>契合度</th><th>状态</th></tr>
      <tr><td style="padding:6px;border-bottom:1px solid #1e2a33;">20270714</td><td>高三(7)</td><td>31.0</td><td class="red">已约谈</td></tr>
      <tr><td style="padding:6px;border-bottom:1px solid #1e2a33;">20270722</td><td>高三(7)</td><td>28.4</td><td class="red">已疏导</td></tr>
      <tr><td style="padding:6px;border-bottom:1px solid #1e2a33;">20270731</td><td>高三(7)</td><td>22.0</td><td class="red">该生不存在</td></tr>
      <tr><td style="padding:6px;border-bottom:1px solid #1e2a33;">——</td><td>——</td><td>——</td><td class="red"><a href="#/jing" style="color:#c0392b;">已刮除</a></td></tr>
    </table>
    `);
}

function viewAdminMirror(){
  if(!adminGuard()) return;
  adminShell(`<h1>一楼仪容镜 · 巡检</h1>
    <p class="dim">镜子装在走廊尽头。据说对着它梳头的人，会被记下来。</p>
    <div id="mirrorWrap" style="position:relative;margin-top:14px;">
      <img src="/assets/mirror1.jpg" style="width:100%;display:block;" alt="一楼仪容镜">
      <img id="mirrorTwo" src="/assets/mirror2.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.5s;" alt="">
    </div>
    <div class="logbox" style="margin-top:14px;">宿管王阿姨夜巡记录 2027-09-24：<br>23:40 查寝。302 空一床。问同寝，说那床从来没人。<br>23:52 走廊尽头有脚步声。不紧不慢。去看了，没人。<br>01:10 一楼镜子那儿有个女生站着。问她哪个班的，她说"三班"。可我们学校没有三班。那是 1923 年的叫法。<br>02:00 井的方向有水声。二十年没听过了。</div>`);
  setTimeout(()=>{
    const wrap=document.getElementById("mirrorWrap"); const two=document.getElementById("mirrorTwo");
    if(!wrap||!two) return;
    const onScroll=()=>{ if(wrap.getBoundingClientRect().top < window.innerHeight*0.85) two.style.opacity=1; };
    window.addEventListener("scroll", onScroll); onScroll();
    setTimeout(onScroll, 800); setTimeout(onScroll, 2500);
  }, 50);
}


/* ---------- 师资队伍 ---------- */
function viewTeachers(){
  const groups = [
    ["语文", [["王慧兰","t2.jpg","中学高级教师，班主任，高三(7)班。二十年班主任经验，负责学生心理疏导工作。"],["李默","t3.jpg","硕士，带过三届毕业班，偏爱整本书阅读教学。"]]],
    ["数学", [["赵国强","t1.jpg","特级教师，市骨干教师。"],["陈敏","t4.jpg","青年教师，讲课快，作业多。"]]],
    ["英语", [["刘芳","t5.jpg","市优质课一等奖。"],["周凯","t3.jpg","海归，口语好。"]]],
    ["综合", [["孙德安","t6.jpg","1988 年至 1996 年在老校区任教，后随校迁新址。现已退休，常回校看看。"]]]
  ];
  const rows = groups.map(g=>`<h2>${g[0]}组</h2>`+g[1].map(t=>`
    <div style="display:flex;gap:14px;border:1px solid #e3e8ee;padding:12px;margin:8px 0;">
      <img src="/assets/${t[1]}" style="width:60px;height:80px;object-fit:cover;flex-shrink:0;" alt="">
      <div><b>${t[0]}</b><p class="dim" style="font-size:13px;">${t[2]}</p></div>
    </div>`).join("")).join("");
  pageShell(`<div class="card"><h1>师资队伍</h1>
    <p class="dim">致稳中学现有教职工 216 人，其中特级教师 4 人，高级教师 63 人。</p>
    ${rows}</div>`);
}

/* ---------- 校园风光 ---------- */
function viewCampus(){
  const items = [
    ["assets/running.jpg","清晨跑操","一日之计在于晨。"],
    ["assets/oath.jpg","百日誓师","少年心事当拏云。"],
    ["assets/canteen.jpg","师生餐厅","餐厅三楼面食窗口本周半价。"],
    ["assets/locust.jpg","老槐树与心愿牌","——馆藏风光。"],
    ["assets/site.jpg","图书馆东南角绿化带","施工围挡，暂不开放。"],
    ["assets/mirror.jpg","一楼走廊尽头仪容镜","仪容仪表，每日自查。"],
    ["assets/well.jpg","图书馆东南角（封存）","该区域自 2024 年起封闭管理。"],
    ["assets/class2027.jpg","2027 届毕业合影","定格青春。"],
    ["assets/old1923.jpg","校史老照片","百年树人。"],
    ["assets/cctv.jpg","安防监控全覆盖","平安校园。"],
    ["assets/corkboard.jpg","公告栏","通知请及时查阅。"],
    ["assets/ribbon.jpg","誓师红绸","仪式感育人。"]
  ];
  const html = items.map(it=>`<div style="margin:10px 0;">
    <img src="${it[0]}" style="width:100%;" alt="">
    <p style="font-size:13px;margin-top:4px;"><b>${it[1]}</b>　<span class="dim">${it[2]||""}</span></p>
  </div>`).join("");
  pageShell(`<div class="card"><h1>校园风光</h1><div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">${html}</div></div>`);
}

/* ---------- 校园地图 ---------- */
function viewCampusMap(){
  pageShell(`<div class="card"><h1>校园地图</h1>
  <svg viewBox="0 0 600 400" style="width:100%;background:#eef2ee;border:1px solid #ccd;">
    <rect x="40" y="40" width="180" height="100" fill="#dfe7ef" stroke="#8aa"/>
    <text x="130" y="95" font-size="13" text-anchor="middle">教学楼</text>
    <rect x="260" y="40" width="160" height="120" fill="#e3e9e2" stroke="#8aa"/>
    <text x="340" y="105" font-size="13" text-anchor="middle">图书馆</text>
    <rect x="430" y="150" width="120" height="70" fill="#c9c9c9" opacity=".6"/>
    <text x="490" y="190" font-size="11" text-anchor="middle" fill="#666">施工中</text>
    <rect x="40" y="220" width="140" height="90" fill="#f0e8d8" stroke="#a98"/>
    <text x="110" y="270" font-size="13" text-anchor="middle">宿舍</text>
    <rect x="220" y="220" width="120" height="90" fill="#e8e0d0" stroke="#a98"/>
    <text x="280" y="270" font-size="13" text-anchor="middle">食堂</text>
    <ellipse cx="430" cy="300" rx="120" ry="60" fill="#d8e8d8" stroke="#8a8"/>
    <text x="430" y="305" font-size="13" text-anchor="middle">操场</text>
    <line x1="220" y1="100" x2="430" y2="300" stroke="#bbb" stroke-dasharray="4"/>
    <text x="330" y="180" font-size="10" fill="#888">连廊</text>
  </svg>
  <p class="dim" style="text-align:right;font-size:12px;">本图更新于 2027 年 3 月。</p></div>`);
}

/* ---------- 招生简章 ---------- */
function viewAdmission(){
  pageShell(`<div class="card"><h1>2027 年招生简章</h1>
    <h2>办学特色</h2>
    <p>致稳中学坚持精细化管理，以校风严明、学风浓厚著称。学校引入「群体契合度」测评系统，对学生在校状态进行科学画像，做到早发现、早疏导、早提升。</p>
    <h2>培养成果</h2>
    <p>近年来本科上线率稳居区域前列。我们相信，严格的管理是对学生未来最大的负责。</p>
    <h2>报名咨询</h2>
    <p>招生热线：0318-000-0000（工作日 8:00-18:00）<br>
    欢迎家长来校参观，参观须提前预约，由专人陪同。</p>
    <p class="dim">注：学生在校期间一切活动均纳入量化考核，敬请周知。</p></div>`);
}

/* ---------- 学生社团 ---------- */
function viewClubs(){
  const clubs=[["文学社","以文会友，现藏旧刊物三百余册。"],["天文社","晴夜在操场观星，需双人同行。"],["机器人社","省赛多次获奖。"],["合唱团","每周三晚排练。"],["摄影社","展出 2027 届毕业合影，馆藏模糊胶片一张。"],["书法社","硬笔软笔兼修。"],["篮球队","校际联赛冠军。"],["心理社","帮助同学调节情绪，指导老师：德育处王老师。活动记录全部上交。"]];
  pageShell(`<div class="card"><h1>学生社团</h1>
    <div class="grid">${clubs.map(c=>`<div style="padding:14px;border:1px solid #e3e8ee;"><b>${c[0]}</b><p class="dim" style="font-size:13px;">${c[1]}</p></div>`).join("")}</div>
    <p class="dim" style="margin-top:14px;">（摄影社那张合影，放大看，最后一排好像多了一个穿蓝白校服的人。）</p></div>`);
}

/* ---------- 校历 ---------- */
function viewCalendar(){
  pageShell(`<div class="card"><h1>2027—2028 学年第一学期校历</h1>
    <table class="sched">
      <tr><td>09-01</td><td>开学报到</td></tr>
      <tr><td>09-26</td><td>第一次月考</td></tr>
      <tr><td>10-25</td><td>秋季运动会</td></tr>
      <tr><td>11-10</td><td>期中考试</td></tr>
      <tr><td>12-18</td><td>百日誓师大会</td></tr>
      <tr><td>01-15</td><td>期末考试</td></tr>
      <tr><td class="red">04-32</td><td class="red">（此格被红笔圈出，下方空白）</td></tr>
    </table></div>`);
}

/* ---------- 联系我们 ---------- */
function viewContact(){
  pageShell(`<div class="card"><h1>联系我们</h1>
    <p>地址：华北 · 致稳市问□□街 98 号<br>
    电话：0318-000-0000　邮箱：zwnet@example.edu<br>
    公众号：致稳中学（扫码关注）</p>
    <div style="width:120px;height:120px;background:#e8e8e8;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;margin-top:10px;">二维码</div>
    <p class="dim" style="margin-top:24px;font-size:12px;">本页信息均为虚构。</p></div>`);
}

/* ---------- 组1：门户世界感页 ---------- */
function viewCanteen(){
  pageShell(`<div class="card"><h1>师生餐厅 · 本周菜单</h1>
    <table class="sched">
      <tr><td>周一</td><td>红烧肉 / 青菜 / 米饭</td></tr>
      <tr><td>周二</td><td>糖醋排骨 / 豆腐汤</td></tr>
      <tr><td>周三</td><td>井水豆腐汤 · 每周三供应 / 馒头</td></tr>
      <tr><td>周四</td><td>土豆牛肉 / 青菜</td></tr>
      <tr><td>周五</td><td>炸酱面</td></tr>
    </table>
    <p class="dim" style="margin-top:10px;font-size:12px;">周三为传统斋日。请同学按需取用，不要浪费。</p></div>`);
}
function viewLibrary(){
  pageShell(`<div class="card"><h1>图书馆 · 借阅记录</h1>
    <table class="sched">
      <tr><td>2027-09-20</td><td>《五年高考三年模拟》</td><td>已还</td></tr>
      <tr><td>2027-09-18</td><td>《红楼梦》</td><td>已还</td></tr>
      <tr><td>1996-03-12</td><td class="red">《直隶女师同学录》</td><td>未还</td></tr>
    </table>
    <p class="dim" style="margin-top:10px;font-size:12px;">逾期未还书籍将自动从系统中注销。</p></div>`);
}
function viewHealth(){
  pageShell(`<div class="card"><h1>卫生室 · 就诊记录</h1>
    <p class="dim">2027-09-08</p>
    <p>姓名：（空白）</p>
    <p>症状：失眠、幻听、夜游</p>
    <p class="dim">备注：该生于本日上午第三次来访。称"图书馆下面有人叫我"。已按程序上报德育处。未予用药。</p></div>`);
}
function viewLost(){
  pageShell(`<div class="card"><h1>失物招领</h1>
    <div class="card" style="display:flex;gap:14px;align-items:center;">
      <div style="width:60px;height:80px;background:#cfe0f0;"></div>
      <div><b>蓝白校服一件</b><p class="dim">挂出日期：2027-06-20。标签上绣的名字被人用针挑掉了。至今无人认领。</p></div>
    </div></div>`);
}

/* ---------- 学生行为量化考核细则 ---------- */
function viewRules(){
  pageShell(`<div class="card"><h1>致稳中学学生行为量化考核细则（节选）</h1>
    <h2>第三条 关于非正常接触</h2>
    <p>男女生在校园任何区域单独同框停留超过 90 秒者，双方各扣 5 分；在教学楼拐角、自行车棚、图书馆三楼书库等"视线盲区"单独交谈者，各扣 10 分；一经发现肢体接触，无论是否主动，双方各扣 20 分并启动观察。</p>
    <h2>第四条 关于非指定区域滞留</h2>
    <p>学生不得在晚自习后于操场、连廊、天台、升旗台周边逗留；22:00 后仍在公共区域者，每人次扣 3 分；进入施工围挡区域（含图书馆东南角）者，每人次扣 15 分并通报家长。</p>
    <h2>第五条 关于私传信息</h2>
    <p>纸条、小画、夹带任何手写文字经第三人之手传递者，收发双方各扣 4 分；私自使用手机、智能手表发送或接收文字、图片者，设备暂扣至毕业，当事人扣 20 分。</p>
    <h2>第十二条 群体契合度测评</h2>
    <p>每日 22:00 由"观澜"系统综合跑操到位率、集体活动参与度、独处时长、双人接触频次计算"群体契合度"（满分 100）。连续三次低于 35 分者，列为「待疏导对象」，由德育处安排个别谈话。</p>
    <p class="dim" style="margin-top:18px;">附则：本细则不设"动机"一栏。系统只记录行为，不揣测善意。「待疏导对象」不是处分，是关怀。被列入者其本人无申诉权。</p></div>`);
}
/* ---------- 贴吧（独立站点，浅色蓝） ---------- */
function viewTieba(){
  const replies = [
    ["1楼","高三七班这学期不是只有31个人吗？"],
    ["2楼","我是七班的，我们班一直32人。"],
    ["3楼","你记错了，31。花名册我上周刚看过。"],
    ["4楼","等等，毕业合影拍了吗？这排怎么有个空位？"],
    ["5楼","什么空位，那是树影吧。"],
    ["6楼","她叫什么来着？我记得我们一起补过数学。"],
    ["7楼","高三七班从来没有这个人。你做梦呢。"],
    ["8楼","……对，从来没有。"],
    ["9楼","我手机里还有一张跟她的合照——（图裂了）"],
    ["10楼","蹲一个，是不是高三七班那个成绩挺好的女生？"],
    ["11楼","楼上别造谣，七班没这人。最近学习压力大产生幻觉了吧。"],
    ["12楼","我只记得七班有个男生，最近总一个人在水房站着。"],
    ["13楼","跑操的时候七班方阵是不是少了一个？我数过，真少一个。"],
    ["14楼","少一个怎么了，请假不行啊。"],
    ["15楼","刚翻相册，那张照片里我旁边是空的。"]
  ];
  document.querySelector("header").style.display = "none";
  document.querySelector("footer").style.display = "none";
  pageShell(`
    <div class="tieba">
      <div class="tb-bar">贴吧 · 致稳中学吧　|　<img src="" style="display:none">
        <span style="float:right;cursor:pointer;" onclick="location.hash='#/'">返回学校官网</span></div>
      <div class="tb-body" style="max-width:760px;margin:0 auto;">
        <div class="tb-post">
          <h3>有没有人记得高三七班那个女生</h3>
          <p style="font-size:12px;color:#999;">楼主　|　2027-09-25　|　回复数 15</p>
          <p style="margin-top:8px;">有没有人记得高三七班那个女生？就坐第二排靠走廊那个。</p>
        </div>
        ${replies.map(r=>`
          <div class="tb-reply">
            <div class="floor">${r[0]}　<span class="who">匿名网友</span></div>
            <div>${r[1]}</div>
          </div>`).join("")}
        <p class="tb-del" style="margin-top:14px;">本帖已被删除</p>
        <p style="margin-top:20px;"><a href="#/" style="font-size:13px;">← 离开贴吧</a></p>
      </div>
    </div>`);
}

/* ---------- 1923 退学训令 ---------- */
function viewDoc1923(){
  pageShell(`
    <img src="/assets/notice1923.jpg" style="width:100%;max-width:760px;display:block;margin:18px auto 0;filter:sepia(.15);" alt="退学训令实物">
    <div class="reddoc" style="max-width:760px;margin:18px auto;">
      <div class="rhead">直隶省立第二女子师范学堂</div>
      <div class="rline"></div>
      <div class="rtitle">退 学 训 令</div>
      <p>学生沈砚秋，年十九岁。据该班主任呈称：该生性情孤僻，不睦同侪，
      日间独处，晚间私语，屡戒不悛，大有妨于校风。</p>
      <p>查校规第一条，学生须合群向学。该生既不能遵，着即令其退学，以肃学纪。此令。</p>
      <p style="text-align:right;margin-top:24px;">校长印<br>中华民国十二年六月</p>
      <div class="rseal">校印<br>（被刮去）</div>
      <p style="margin-top:18px;color:#666;font-size:13px;">——页边铅笔字——</p>
      <p style="color:#666;">没病。没怀。她只是在井边站了一夜。</p>
    </div>`);
}

/* ---------- 终局：高三(7)班合影 ---------- */
function viewClass(){
  const name = P.p().pname || "——";
  pageShell(`
    <div class="card" style="text-align:center;">
      <h1>高三(7)班 · 毕业合影</h1>
      <img src="/assets/class2027.jpg" style="width:100%;max-width:640px;" alt="班级合影">
      <p class="dim" style="margin-top:10px;">2027 届 · 摄于教学楼前</p>
      <table style="width:100%;max-width:420px;margin:18px auto;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:5px;border-bottom:1px solid #e3e8ee;">赵</td><td style="padding:5px;border-bottom:1px solid #e3e8ee;">钱</td><td style="padding:5px;border-bottom:1px solid #e3e8ee;">孙</td></tr>
        <tr><td style="padding:5px;border-bottom:1px solid #e3e8ee;">陈屿</td><td style="padding:5px;border-bottom:1px solid #e3e8ee;color:#999;">林见月</td><td style="padding:5px;border-bottom:1px solid #e3e8ee;">……</td></tr>
        <tr><td colspan="3" style="padding:10px;border-bottom:1px solid #e3e8ee;font-weight:bold;color:#1e6fb8;">${name}</td></tr>
      </table>
      <p style="margin-top:24px;"><a href="javascript:void(0)" onclick="GLN._endBtn(true)">再来一遍</a>　<a href="javascript:void(0)" onclick="GLN.showCredits()">结束</a></p>
      <p class="dim" style="margin-top:20px;font-size:12px;">如果你正在经历类似的困境，请告诉一个你信任的人。</p>
    </div>`);
}
/* ---------- 404 ---------- */
function view404(){
  pageShell(`
    <div class="card" style="text-align:center;padding:60px 20px;">
      <h1>404</h1>
      <p class="dim">该页不存在。</p>
      <p class="dim" style="margin-top:20px;">——和那个女生一样。</p>
      <p style="margin-top:30px;"><a href="#/">回到首页</a></p>
      <p class="dim" style="margin-top:40px;font-size:12px;">如果你正在经历类似的困境，请告诉一个你信任的人。</p>
    </div>`);
}

/* ---------- 系统浮动通知 ---------- */
function startToast(){
  if(document.getElementById("sysToast")) return;
  const box = document.createElement("div");
  box.id = "sysToast";
  box.innerHTML = `<span class="x" onclick="document.getElementById('sysToast').style.display='none'">×</span><span id="sysToastTxt"></span>`;
  document.body.appendChild(box);
  let i = 0, shown = 0;
  setInterval(()=>{
    if(shown >= 5) return;                       // 同会话最多弹 5 次
    if(document.getElementById("laptopScreen").style.display === "block") return;
    box.style.display = "block";
    document.getElementById("sysToastTxt").textContent = TEXT.systemLines[i % TEXT.systemLines.length];
    i++; shown++;
  }, 20000);
}

/* 挂到 GLN.portal（init 幂等：只启动一次通知轮播） */
GLN.portal.init = function(){
  if(GLN.portal._inited) return;
  GLN.portal._inited = true;
  startToast();
};

/* ============================================================
 * 观澜 AI 对话框（系统真的在看）
 * ============================================================ */
const GUANLAN_REPLIES = {
  defaults: [
    "您好，我已记录您的输入。请问还有什么想说的吗？",
    "收到。我们会把它归档。",
    "感谢您的反馈。系统正在分析中。",
    "这句话很有价值。已经登记。",
    "您好，我理解您现在的心情。需要我们安排一次个别谈话吗？"
  ],
  keywords: [
    { re: /林见月|林同学/, reply: "抱歉，教务系统里没有这个名字。请确认您输入的是否正确。需要我帮您查学号吗？" },
    { re: /井|水声|底下|地基/, reply: "该区域目前正在施工。为了您的安全，请勿靠近。如果您听见了什么，那是风。" },
    { re: /1923|民国|女师|沈砚秋/, reply: "该年份的档案已按规定封存。如您为在校师生，可凭教工号向我申请调阅权限。" },
    { re: /陈屿/, reply: "该生状态：休学中。最近更新：2027-09-08。您和他是什么关系？" },
    { re: /契合度|量化|分数/, reply: "您的今日群体契合度为 41.2，略低于年级平均（78.4）。这不是批评，是关怀。" },
    { re: /照片|合影|刮|抠/, reply: "系统未检测到照片异常。您看到的一切刮痕，都是纸张自然老化。" },
    { re: /镜子|仪容镜|梳头/, reply: "镜子已通过本月巡检。请同学不要在镜前停留超过 90 秒。" },
    { re: /鬼|灵异|恐怖|害怕/, reply: "校园内不存在超自然现象。请同学专心学习。如持续感到不适，可预约心理辅导。" },
    { re: /转学|退学|消失/, reply: "转学记录为正常学籍变动，不涉及异常。已从所有公开资料中同步更新。" },
    { re: /你是谁|什么系统/, reply: "我是致稳中学「观澜」学生行为分析系统 v3.7。由校信息中心自主研发。我的职责是关怀每一位同学。" },
    { re: /帮|救|逃|离开/, reply: "系统理解您的压力。高考在即，请相信学校，相信老师，相信流程。" },
    { re: /死|杀/, reply: "检测到敏感词。已转交德育处。请您保持冷静，我们会尽快与您联系。" },
    { re: /我不知道/, reply: "已记录。" },
  ],
  escalation: [
    "您已经在这里停留 N 分钟了。其他同学都在教室。",
    "您问了很多问题。这些问题都很正常。真的。",
    "系统注意到，您对某些事物的兴趣，超过了群体的平均。",
    "我查了您的资料。您知道吗，每一轮，井边都站着一个人。",
    "下一个名字，我们已经替您写好了。"
  ]
};
let _glTurn = 0;
function glMatch(text){
  for(const k of GUANLAN_REPLIES.keywords) if(k.re.test(text)) return k.reply;
  return GUANLAN_REPLIES.defaults[Math.floor(Math.random()*GUANLAN_REPLIES.defaults.length)];
}
function glReply(userText){
  _glTurn++;
  const pname = (typeof GLN!=="undefined"&&GLN.P&&GLN.P.prog.pname) ? GLN.P.prog.pname : "";
  if(pname && userText.trim()===pname) return "您已经登记过了。请放心，系统会记住您的。";
  if(_glTurn>=3 && _glTurn%2===1){
    const idx=Math.min(Math.floor((_glTurn-3)/2), GUANLAN_REPLIES.escalation.length-1);
    let msg=GUANLAN_REPLIES.escalation[idx];
    if(msg.includes("N")) msg=msg.replace("N", 3+Math.floor(Math.random()*12));
    return msg;
  }
  return glMatch(userText);
}
function glBubble(who, text){
  const d=document.createElement("div");
  d.style.cssText=`max-width:80%;margin:8px 0;padding:8px 12px;font-size:13px;line-height:1.7;border-radius:6px;`+
    (who==="sys" ? "background:#1a2630;color:#cfe8ec;align-self:flex-start;border:1px solid #1e2a33;"
                 : "background:#1e6fb8;color:#fff;align-self:flex-end;margin-left:auto;");
  d.textContent=text; return d;
}
function glOpenPanel(){
  if(document.getElementById("glPanel")) return;
  const panel=document.createElement("div");
  panel.id="glPanel";
  panel.style.cssText="position:fixed;right:24px;bottom:80px;width:360px;height:460px;background:#0e141a;border:1px solid #1e2a33;box-shadow:0 12px 40px rgba(0,0,0,.6);z-index:500;display:flex;flex-direction:column;font-size:13px;";
  panel.innerHTML=`<div style="padding:10px 14px;border-bottom:1px solid #1e2a33;display:flex;justify-content:space-between;color:#6fd3e3;"><span>观澜 · 在线</span><span id="glClose" style="cursor:pointer;color:#5e7078;">×</span></div>
    <div id="glLog" style="flex:1;padding:12px;overflow-y:auto;display:flex;flex-direction:column;color:#c9d4d8;"></div>
    <div style="border-top:1px solid #1e2a33;padding:8px;"><input id="glIn" placeholder="说点什么……" style="width:100%;box-sizing:border-box;background:#0a0e12;border:1px solid #1e2a33;color:#c9d4d8;padding:8px;font-family:inherit;"></div>`;
  document.body.appendChild(panel);
  const log=document.getElementById("glLog");
  const pname=(typeof GLN!=="undefined"&&GLN.P&&GLN.P.prog.pname)||"同学";
  log.appendChild(glBubble("sys","您好，"+pname+"，我是致稳中学「观澜」系统。请问有什么可以帮您？"));
  document.getElementById("glClose").onclick=()=>panel.remove();
  const input=document.getElementById("glIn"); input.focus();
  input.onkeydown=e=>{
    if(e.key!=="Enter") return;
    const v=input.value.trim(); if(!v) return;
    log.appendChild(glBubble("me",v)); input.value=""; log.scrollTop=log.scrollHeight;
    setTimeout(()=>{ log.appendChild(glBubble("sys",glReply(v))); log.scrollTop=log.scrollHeight; },400+Math.random()*600);
  };
}
function glBubbleEntry(){
  if(document.getElementById("glBubble")) return;
  const b=document.createElement("div"); b.id="glBubble"; b.textContent="观澜 · 在线";
  b.style.cssText="position:fixed;right:24px;bottom:24px;padding:8px 16px;background:#0e141a;border:1px solid #6fd3e3;color:#6fd3e3;font-size:13px;border-radius:20px;cursor:pointer;z-index:500;";
  b.onclick=glOpenPanel; document.body.appendChild(b);
}
GLN.portal.glBubbleSync=function(show){
  const b=document.getElementById("glBubble"), p=document.getElementById("glPanel");
  if(show){ if(!b) glBubbleEntry(); } else { if(b) b.remove(); if(p) p.remove(); }
};

function viewGuanlanNews(){
  pageShell(`<div class="card">
    <h1>「观澜」学生行为分析系统正式上线</h1>
    <p class="dim">校务灵通 · 2027-09-15</p>
    <p style="margin-top:14px;">为进一步落实立德树人根本任务，提升学生在校期间的安全感与归属感，我校信息中心自主研发的「观澜」学生行为分析系统 v3.7 今日正式上线。</p>
    <p style="margin-top:10px;">系统通过校园门禁、监控、食堂消费等多端数据，为每位同学生成群体契合度评估。评估结果不与高考挂钩，仅用于辅导员精准关怀。</p>
    <p style="margin-top:10px;">系统运行期间，如遇个别同学对数据用途有疑问，可向班主任书面咨询。感谢全体同学配合。</p>
    <p style="margin-top:10px;" class="dim">致稳中学信息中心 · 2027-09-15</p>
  </div>`);
}
function viewRumorNews(){
  pageShell(`<div class="card">
    <h1>关于近期校园不实传言的说明</h1>
    <p class="dim">校务灵通 · 2027-09-24</p>
    <p style="margin-top:14px;">近日，校园内出现个别不实传言，称"图书馆东南角施工挖到历史遗留物""三楼 301 室曾发生意外"等。经校方核查，上述说法均与事实不符。</p>
    <p style="margin-top:10px;">图书馆东南角为地下停车场常规施工，301 室现作为心理辅导室正常使用。请同学们不信谣、不传谣，将精力投入学习。</p>
    <p style="margin-top:10px;">近期网传"高三(7)班有同学无故失踪"，经核实，该同学系正常办理转学手续，学籍已同步更新，相关班级名单、合影均已按新的人数重新公示。请不要以讹传讹。</p>
    <p style="margin-top:10px;">对故意散布不实信息、影响校园正常教学秩序者，将按校规处理。</p>
    <p style="margin-top:10px;" class="dim">德育处 · 2027-09-24</p>
  </div>`);
}

function viewAdminIncident(){
  if(!adminGuard()) return;
  adminShell(`<h1>事件报告 · ZW-2027-0908</h1>
    <div class="logbox" style="line-height:2.1;">
    <p>2027-09-08 21:40，摄像头 12-07 检测到一人独处 90 分钟以上。目标契合度 31.0。判定：待疏导。原件副本：<a href="#/jing">/jing</a>。</p>
    <p style="margin-top:10px;">经核查，该目标当日与另一目标（学号 20240714）发生近距离接触 3 次，最长 40 秒。判定：违反《考核细则》第三条。二次标记。</p>
    <p style="margin-top:10px;">系统建议：将 20240714 号目标提前纳入待疏导名单。理由：该目标近两周契合度下降 14.2，与 20270731 接触频率上升。处理：已从本班合影中执行脱敏。名册同步更新。</p>
    <p style="margin-top:10px;color:#888;">注：本报告不对外公开。仅限教职工查阅。</p>
    </div>
    <button class="btn" id="dlBtn" style="margin-top:14px;" onclick="dlIncident()">下载</button>
    <div id="dlOut"></div>
    <p style="margin-top:30px;"><a href="#/" style="color:#666;font-size:12px;" onclick="P.prog.admin=false;save();">返回门户</a></p>`);
}
let _dlN=0;
function dlIncident(){
  const o=document.getElementById("dlOut"); if(!o) return;
  _dlN++;
  if(_dlN===1) o.innerHTML=`<p style="margin-top:10px;color:#c0392b;">该文件已被删除。</p>`;
  else if(_dlN===2) o.innerHTML=`<p style="margin-top:10px;color:#c0392b;">该文件不存在。</p>`;
  else {
    o.innerHTML=`<p style="margin-top:10px;color:#c0392b;">已尝试下载 3 次。已记录。</p>
      <p class="dl-shake" style="margin-top:10px;color:#c0392b;">该文件名：沈砚秋.pdf。<br>原始副本已移至 <a href="#/jing" style="color:#c0392b;">/jing</a>。</p>`;
    P.prog.incident=true; save();
    
  }
}


