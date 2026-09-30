/* ============================================================
 * laptop.js — 二手笔记本（内层游戏）：崩溃过渡 → 开机 → 桌面 → 谜题链
 * deps: config.js（GLN / P / save）, effects.js（sndScratch / siteWideScratch / shake）
 * ============================================================ */
window.GLN = window.GLN || {};
GLN.laptop = GLN.laptop || {};

const laptopMachine = {
  bootLines: ["致稳中学 · 校产处 回收机", "本机编号：ZW-2027-0714",
              "前使用人：高三(7)班 林见月", "状态：该生不存在"],
  started: false,
  busy: false   // 过渡期间锁，防重复触发
};

/* 风扇/硬盘启动音：Web Audio 白噪，不依赖音频文件 */
function sndFan(){
  const ac = (window.AudioContext||window.webkitAudioContext) ? new (window.AudioContext||window.webkitAudioContext)() : null;
  if(!ac) return;
  const buf = ac.createBuffer(1, ac.sampleRate*0.8, ac.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1)*(i/d.length);  // 渐强
  const s = ac.createBufferSource(); s.buffer = buf;
  const f = ac.createBiquadFilter(); f.type="lowpass"; f.frequency.value=800;
  const g = ac.createGain(); g.gain.value=0.18;
  s.connect(f); f.connect(g); g.connect(ac.destination); s.start();
}

/* CRT 断电 + 滑入过渡总控 */
function crashTransition(done){
  if(laptopMachine.busy) return;
  laptopMachine.busy = true;

  // 锁定 Esc
  const escBlock = e=>{ if(e.key === "Escape") e.stopPropagation(); };
  window.addEventListener("keydown", escBlock, true);

  // 过渡期间隐藏门户/井页
  document.getElementById("portalRoot").setAttribute("aria-hidden","true");

  // CRT 断电遮罩
  const crt = document.createElement("div");
  crt.style.cssText = "position:fixed;inset:0;z-index:9500;background:#000;pointer-events:none;";
  document.body.appendChild(crt);

  const ls = document.getElementById("laptopScreen");

  // 1. 0.0s 卡 300ms
  ls.style.transition = "none";
  ls.style.transform = "translateY(100%)";
  ls.style.display = "block";
  ls.style.background = "#000";

  setTimeout(()=>{
    // 2. 0.3s 闪黑 80ms
    crt.style.opacity = "1";
    setTimeout(()=>{
      // 3. 0.4s CRT 收缩成一条线再成点
      crt.style.transition = "transform .4s steps(8)";
      crt.style.transform = "scaleY(0.002)";
      setTimeout(()=>{
        crt.style.transform = "scale(0.001)";
        setTimeout(()=>{ crt.remove(); }, 200);
        // 4. 0.8s 全黑 + 风扇音
        sndFan();
      }, 400);
      // 5. 1.2s 笔记本从底部滑入
      setTimeout(()=>{
        ls.style.transition = "transform .6s cubic-bezier(.2,.9,.25,1.1)";
        ls.style.transform = "translateY(0)";
        // 6. 1.8s BIOS 逐字打印
        setTimeout(()=>{
          if(GLN.P.prog.booted){
            // 已开机过：直接桌面
            showDesktop();
          } else {
            playBoot(()=>{
              GLN.P.prog.booted = true; GLN.save();
            });
          }
        }, 600);
      }, 400);
    }, 80);
  }, 300);

  function showDesktop(){
    document.getElementById("bootScreen").style.display = "none";
    document.getElementById("desktop").style.display = "block";
    laptopMachine.busy = false;
    window.removeEventListener("keydown", escBlock, true);
    ls.setAttribute("aria-hidden","false");
    if(done) done();
  }

  function playBoot(cb){
    const boot = document.getElementById("bootScreen");
    boot.style.display = "flex"; /* CSS 默认 flex，此行仅在退出后重开时复原 */
    boot.innerHTML = "";
    const lines = [
      "致稳中学 学生终端 v3.2",
      "正在恢复上次会话……",
      "会话所有者：林见月（20270731）",
      "上次退出：异常"
    ];
    // 逐字打印
    let li = 0, ci = 0;
    const lineDiv = lines.map(()=>{ const d=document.createElement("div"); d.className="bl on"; boot.appendChild(d); return d; });
    function typeChar(){
      if(li >= lines.length){
        setTimeout(()=>{ cb && cb(); showDesktop(); }, 1000);
        return;
      }
      lineDiv[li].textContent = lines[li].slice(0, ++ci);
      if(ci >= lines[li].length){ li++; ci=0; setTimeout(typeChar, 120); }
      else setTimeout(typeChar, 30);
    }
    typeChar();
  }
}

/* 公开：进入笔记本（崩溃过渡） */
GLN.laptop.enter = function(){
  document.getElementById("portalRoot").style.display = "none";
  if(!document.getElementById("desktop").innerHTML) buildDesktop();
  crashTransition();
};

/* 公开：退出笔记本——简化淡出 400ms */
GLN.laptop.exit = function(){
  const ls = document.getElementById("laptopScreen");
  ls.style.transition = "opacity .4s";
  ls.style.opacity = "0";
  setTimeout(()=>{
    ls.style.display = "none";
    ls.style.opacity = "1";
    ls.style.transform = "translateY(0)";
    document.getElementById("portalRoot").style.display = "";
    document.querySelector("header").style.display = "";
    document.querySelector("footer").style.display = "";
  }, 400);
};

/* 旧入口兼容 */
function startLaptop(){
  document.getElementById("laptopScreen").style.display = "block";
}

/* 桌面图标 HTML（注入 desktop） */
function buildDesktop(){
  document.getElementById("desktop").innerHTML = `
    <div class="desk-icons">
      <div class="dicon" onclick="lOpen('album')"><div class="pic">🖼</div><div class="lbl">相册</div></div>
      <div class="dicon" onclick="lOpen('memo')"><div class="pic">📝</div><div class="lbl">备忘录</div></div>
      <div class="dicon" onclick="lOpen('notebook')"><div class="pic">📓</div><div class="lbl">错题本</div></div>
      <div class="dicon" onclick="lOpen('diary')"><div class="pic">📔</div><div class="lbl">日记</div></div>
      <div class="dicon" onclick="lOpen('chenyu')"><div class="pic">👤</div><div class="lbl">陈屿空间</div></div>
      <div class="dicon" onclick="lOpen('chat')"><div class="pic">💬</div><div class="lbl">微信</div></div>
      <div class="dicon" onclick="lOpen('recycle')"><div class="pic">🗑</div><div class="lbl">回收站</div></div>
      <div class="dicon" onclick="lOpen('files')"><div class="pic">📁</div><div class="lbl">文件</div></div>
      <div class="dicon" onclick="lOpen('music')"><div class="pic">🎵</div><div class="lbl">音乐</div></div>
      <div class="dicon" onclick="lOpen('browser')"><div class="pic">🌐</div><div class="lbl">浏览器</div></div>
      <div class="dicon" onclick="lOpen('portal')"><div class="pic">🏫</div><div class="lbl">教务系统</div></div>
      <div class="dicon" id="wellIco" onclick="wellClick()"><div class="pic">井</div><div class="lbl">井</div></div>
    </div>
    <div id="taskbar">上次会话未正常退出。</div>
    ${winRecycle()}${winFiles()}${winMusic()}${winBrowser()}${winChat()}${winAlbum()}${winMemo()}${winNotebook()}${winDiary()}${winChenyu()}${winPortal()}${winArchive()}${winTalk()}${winWell()}${winOld()}${winAdmin()}`;
  document.querySelectorAll(".win .tb").forEach(tb=>{
    tb.onmousedown = e=>{
      const w = tb.parentElement; w.classList.add("active");
      const ox = e.clientX-w.offsetLeft, oy = e.clientY-w.offsetTop;
      const mv = ev=>{ w.style.left=(ev.clientX-ox)+"px"; w.style.top=(ev.clientY-oy)+"px"; };
      const up = ()=>{ document.removeEventListener("mousemove",mv); document.removeEventListener("mouseup",up); };
      document.addEventListener("mousemove",mv); document.addEventListener("mouseup",up);
    };
  });
}
function lOpen(n){
  let w = document.getElementById("win-"+n);
  if(!w){ console.warn("no win:",n); return; }
  w.style.display = "flex";
  w.style.zIndex = 50;
  document.querySelectorAll(".win").forEach(x=>x.classList.remove("active"));
  w.classList.add("active");
}
function lClose(n){ document.getElementById("win-"+n).style.display="none"; }

/* ---- 各窗口 HTML ---- */
function winAlbum(){
  return `<div class="win" id="win-album" style="left:120px;top:110px;width:420px;">
    <div class="tb"><span>相册 / 高三(7)班合影.jpg</span><span class="x" onclick="lClose('album')">×</span></div>
    <div class="bd">
      <div style="background:#d8d4c4;padding:10px;color:#333;">
        <img src="/assets/class2027.jpg" style="width:100%;display:block;" alt="班级合影">
        <div style="margin-top:10px;font-family:SimSun,serif;font-size:13px;color:#333;border-top:1px dashed #999;padding-top:8px;">
          合影背面手写编号：
        </div>
        <div style="margin-top:6px;font-family:monospace;font-size:12px;letter-spacing:2px;">
          20240701 20240702 20240703 20240704 <b>20240714</b> 20240715 ……
        </div>
      </div>
    </div></div>`;
}
function winMemo(){
  return `<div class="win" id="win-memo" style="left:200px;top:150px;width:400px;">
    <div class="tb"><span>备忘录 / 林见月</span><span class="x" onclick="lClose('memo')">×</span></div>
    <div class="bd doc">1. 教务入口要学号。学号在合影背面那排小字里。
2. "井"文件夹密码：我第一次被谈话那天，月月日日。
3. 观澜后台密码：这条规矩从 1923 跑到今年多少年。
4. 它说我契合度太低。它不知道我一个人是因为我在听井。
5. 老一辈说大考前要出一个人。现在算法挑。算法就是乩童。
6. 别点红按钮。把井删掉。把井删掉。把井删掉。</div></div>`;
}
function winPortal(){
  return `<div class="win" id="win-portal" style="left:260px;top:130px;width:360px;">
    <div class="tb"><span>致稳中学 · 教务系统</span><span class="x" onclick="lClose('portal')">×</span></div>
    <div class="bd">
      <h3 style="font-weight:normal;">学生登录</h3>
      <div>学号：<input id="lq1" style="width:150px;"></div>
      <div style="margin-top:8px;">姓名：<input id="lname" value="林见月" style="width:110px;"></div>
      <button class="btn" onclick="lP1()" style="margin-top:12px;">登录</button>
      <div class="fb" id="lq1fb"></div>
    </div></div>`;
}
const DIARY = [
 ["08-12","明天开学。妈帮我把床单卷进行李，一直念叨别惹事，别跟男生多说话，熬过这一年就好了。我嗯着，没告诉她我考上的就是那所跑操要数着步子的中学。"],
 ["08-15","开学第一天，他坐我斜前方。老师排座位时我偷偷抬头看了一眼，他刚好也回头，两个人都赶紧转回去。"],
 ["08-17","第一次跑操，鞋带松了，我在队伍后面偷偷系，没人停下来等我。八百人一个节奏，我系完鞋带已经落下半排，风灌进校服里。"],
 ["08-20","自习课他从胳膊下面递过来一张纸条，写着第三题选C，笨蛋。字很好看。我把纸条压在数学书最后一页。"],
 ["08-22","食堂排队，听见隔壁班两个女生议论，说七班有个女生总一个人吃饭，不跟人凑堆。我端着盘子从她们旁边走过去，她们声音小了一点。"],
 ["08-25","手机弹了一条观澜的提醒，说我今日群体契合度偏低，建议多参加集体活动。我盯着那行字看了半天，它怎么知道我今天一个人吃饭。"],
 ["08-27","跑操我们班和七班挨着。他在隔壁方阵，我用余光数他的步数。三百步，一步没差。"],
 ["08-29","他又传纸条，这回没写题，写的是你把话藏在错题本里，我能看懂。晚上我在第三页第三行第三个字下面，用铅笔轻轻点了一个点。"],
 ["09-01","新学期第一次升旗，我站在队伍最靠边的位置。校长在台上讲凝聚成一股绳，太阳很晒，我数前面人的后颈，数到第三排，有一个人的脖子是转过来的。"],
 ["09-03","月考我进步了十一名。他在走廊堵我，说厉害啊，手插在口袋里，耳朵红的。我没敢接话。"],
 ["09-05","晚上查寝后我们躲在水房说话。水龙头没关紧，滴答滴答的，像有人在听。他牵了一下我的手，马上又松开。"],
 ["09-07","水房打水，走廊尽头好像有人叫我名字。我回头，空的，声控灯一盏一盏灭下去。水壶灌满了，我站在原地没敢动。"],
 ["09-08","德育处门口他等我。我们走回宿舍，隔着四十厘米，谁都没再靠近。可那一路我心跳得整栋楼都听得见。"],
 ["09-10","教师节，我给王老师写了张卡片，写谢谢您一直关心我。他收下，笑了笑说你很特别。他对每个学生都这么笑，可我当时信了。"],
 ["09-12","他教我在错题本上藏话：第几页第几行第几个字。第九页第九行第九个是井。我们笑到被班主任瞪。"],
 ["09-14","月考成绩出来，数学进步了十八分。可下面那一栏群体契合度，比上次还低。我把成绩单折起来塞进口袋，没给陈屿看。"],
 ["09-16","今晚在走廊那面镜子前梳头，镜子里我后面好像还站着一个人。回头，没人。我不敢告诉陈屿。"],
 ["09-18","查寝点名，点到我名字的时候，走廊里有人替我应了一声到。我明明躺在床上。阿姨举着手电照过来，问谁应的，没人说话。"],
 ["09-19","我数了三遍，镜子里是两个影子。我的比我慢半拍。今天我把这事告诉了陈屿，他沉默很久，说他也看见了。"],
 ["09-21","最后一次在水房和他说话。他说你以后多跟别人玩，别老一个人待着。我问他什么意思，他拧上水龙头，没回答。"],
 ["09-23","班主任找我谈话，说我契合度很低。他很客气，给我倒水。出来时陈屿在门口，我们谁都没敢对视。"],
 ["09-24","学校通知重拍合影，说去年那张没拍好。拍照我站他旁边，可他那位置，拍出来是空的。"],
 ["09-25","如果我不在了，去图书馆东南角。"],
 ["09-25 23:40","今天没去早读。我在井边坐了一会儿。水声很好听。像有人在数数。"]
];
let _di = 0;
function winDiary(){
  return `<div class="win" id="win-diary" style="left:140px;top:100px;width:460px;">
    <div class="tb"><span>林见月的日记（锁已破）</span><span class="x" onclick="lClose('diary')">×</span></div>
    <div class="bd" style="background:#f5f1e2;color:#222;font-family:serif;min-height:220px;" id="diaryBody">
      <div style="padding:6px 16px;font-size:11px;color:#8a7a5a;border-bottom:1px dashed #c8b88a;">第 <span id="diaryNum">1</span> 篇 / 共 24 篇　|　林见月　高三(7)班</div>
      <div style="padding:16px;line-height:2;font-size:14px;" id="diaryText"></div>
      <div style="padding:0 16px 12px;display:flex;justify-content:space-between;">
        <button class="btn" onclick="diaryGo(-1)">← 上一篇</button>
        <span id="diaryPage" style="font-size:12px;color:#888;"></span>
        <button class="btn" onclick="diaryGo(1)">下一篇 →</button>
      </div>
    </div></div>`;
}
function diaryGo(d){
  _di=Math.max(0,Math.min(DIARY.length-1,_di+d));
  const e=DIARY[_di];
  document.getElementById("diaryText").innerHTML=`<b>${e[0]}</b><br>${e[1]}`;
  document.getElementById("diaryPage").textContent=(_di+1)+" / "+DIARY.length;
  const dn=document.getElementById("diaryNum"); if(dn) dn.textContent=(_di+1);
}
function winNotebook(){
  return `<div class="win" id="win-notebook" style="left:150px;top:90px;width:440px;">
    <div class="tb"><span>错题本_林见月.pdf（第7页 / 第9页）</span><span class="x" onclick="lClose('notebook')">×</span></div>
    <div class="bd" style="background:#f5f1e2;color:#222;font-family:serif;"><img src="/assets/notebook.jpg" style="width:100%;display:block;" alt="错题本">
      <div style="padding:14px;line-height:2;">
        <p><b>第7页</b>　已知函数 f(x) 在区间 [0, +∞) 上单调递减……</p>
        <p style="color:#b02020;">红笔旁批：把这一行第三个字念出来。</p>
        <hr>
        <p><b>第9页</b>　……故 a 的取值范围为 (0, 1)。</p>
        <p style="color:#b02020;">红笔旁批：第九页，第九行，第九个。</p>
        <hr>
        <p style="color:#b02020;">陈屿的字：别查了。查到井，就别往下看了。</p>
      </div>
    </div></div>`;
}function winArchive(){
  return `<div class="win" id="win-archive" style="left:180px;top:90px;width:460px;">
    <div class="tb"><span>档案 / 林见月（该生不存在）</span><span class="x" onclick="lClose('archive')">×</span></div>
    <div class="bd">
      <b>群体契合度 · 近八周</b>
      <div style="background:#f5f2e8;padding:10px;margin:10px 0;">
        <svg viewBox="0 0 400 140" style="width:100%;height:140px;">
          <line x1="30" y1="105" x2="390" y2="105" stroke="#999" stroke-dasharray="3"/>
          <text x="5" y="108" font-size="9" fill="#888">35</text>
          <polyline points="40,30 90,38 140,48 190,72 240,90 290,108 340,115 380,120" fill="none" stroke="#8b1a1a" stroke-width="2"/>
          <circle cx="290" cy="108" r="4" fill="#8b1a1a"/><circle cx="340" cy="115" r="4" fill="#8b1a1a"/><circle cx="380" cy="120" r="4" fill="#8b1a1a"/>
        </svg>
      </div>
      <div class="dim">阈值35。连续三次低于阈值者，列为待疏导。</div>
      <div class="prompt">
        低于 35 分一共出现了几次？
        <input id="lq2" style="margin-top:6px;"><br>
        <button class="btn" onclick="lP2()" style="margin-top:6px;">提交</button>
        <div class="fb" id="lq2fb"></div>
      </div>
    </div></div>`;
}
function winTalk(){
  return `<div class="win" id="win-talk" style="left:220px;top:110px;width:440px;">
    <div class="tb"><span>疏导谈话记录_0908.pdf</span><span class="x" onclick="lClose('talk')">×</span></div>
    <div class="bd doc">${TEXT.talk}</div></div>`;
}
function winChenyu(){
  return `<div class="win" id="win-chenyu" style="left:180px;top:120px;width:440px;">
    <div class="tb"><span>陈屿的空间（更新停在 2027-09-08）</span><span class="x" onclick="lClose('chenyu')">×</span></div>
    <div class="bd" style="background:#eef3f8;">
      <div style="padding:14px;background:#fff;margin:10px;border:1px solid #d8e0e8;">
        <div style="font-size:12px;color:#888;">陈屿 · 刚刚<br>2027-09-08 18:42</div>
        <p style="margin:10px 0;line-height:1.9;">今天在德育处门口等她。出来的时候她像没看见我。<br>
        我叫她，她回头，我看见了她的脸。那不是她。<br>那也不是我认识的脸。</p>
        <div style="position:relative;display:inline-block;">
          <img src="/assets/class2027.jpg" style="width:100%;" alt="合影"
            onmouseover="this.nextElementSibling.style.opacity=1" onmouseout="this.nextElementSibling.style.opacity=0">
          <div style="position:absolute;left:42%;top:30%;width:18%;height:30%;background:#e8e4d8;"></div>
          <div style="position:absolute;left:0;right:0;bottom:-24px;font-size:11px;color:#b02020;opacity:0;transition:opacity .2s;">
            </div>
        </div>
        <div style="margin-top:30px;font-size:12px;color:#aaa;">评论(0) · 转发(0)</div>
      </div>
    </div></div>`;
}
function winChat(){
  const m = [
    ["L","8-15 21:03","今天数学最后一题你会吗？"],
    ["C","8-15 21:05","会，辅助线连对角线。"],
    ["L","8-15 21:06","你怎么什么都会。"],
    ["C","8-15 21:08","食堂三楼今天糖醋排骨不错，明天去？"],
    ["L","8-16 12:30","去了，要排队。"],
    ["L","8-20 06:15","跑操站你后面，你鞋带开了。"],
    ["C","8-20 06:16","别回头。"],
    ["L","8-25 22:40","晚安。"],
    ["C","8-25 22:41","晚安。"],
    ["L","9-06 19:20","水房没人，你来一下。"],
    ["C","9-06 19:23","嗯。"],
    ["L","9-10 21:11","给王老师写了卡片，他说我很特别。"],
    ["C","9-10 21:13","他对谁都这么说。"],
    ["L","9-14 10:02","我数学进步了。可是契合度掉了。"],
    ["C","9-14 10:05","别管那个。"],
    ["L","9-17 22:00","镜子里多了一个人。"],
    ["C","9-17 22:04","你看错了。"],
    ["L","9-17 22:05","我没有。"],
    ["L","9-21 22:31","查寝点我名字的时候，走廊里有人应了一声。"],
    ["C","9-21 22:33","睡吧。"],
    ["L","9-22 18:00","你今天说，让我多跟别人玩。"],
    ["C","9-22 18:02","……嗯。"],
    ["L","9-23 21:40",""],
    ["L","9-24 23:50","王阿姨说 302 空了一张床。"],
    ["C","9-25 07:12","别去图书馆东南角。"],
    ["L","9-25 22:10","我可能要去一个很远的地方。"]
  ];
  const rows = m.map(x=>{
    const mine = x[0]==="L";
    const body = x[2]==="" ? `<div style="color:#999;font-size:12px;">消息已撤回。</div>`
      : `<div style="max-width:70%;padding:8px 12px;border-radius:6px;font-size:13px;line-height:1.7;
        ${mine?"background:#95ec69;margin-left:auto;":"background:#fff;margin-right:auto;"}">${x[2]}</div>`;
    return `<div style="margin:10px 0;display:flex;flex-direction:${mine?"row":"row-reverse"};gap:8px;align-items:flex-start;">
      <div style="width:32px;height:32px;border-radius:4px;background:${mine?"#2a5":"#667"};flex-shrink:0;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;">${mine?"月":"屿"}</div>
      <div style="display:flex;flex-direction:column;${mine?"align-items:flex-end;":""};"><div style="font-size:10px;color:#999;margin-bottom:3px;">${x[1]}</div>${body}</div>
    </div>`;
  }).join("");
  return `<div class="win" id="win-chat" style="left:160px;top:80px;width:380px;height:520px;">
    <div class="tb"><span>微信 · 陈屿</span><span class="x" onclick="lClose('chat')">×</span></div>
    <div class="bd" style="background:#ededed;padding:12px;overflow-y:auto;height:440px;">
      ${rows}
      <div style="text-align:center;color:#999;font-size:11px;margin-top:10px;">2 条未读</div>
    </div></div>`;
}
function playRec(){ const b=document.getElementById('recBox'); b.style.display='block'; const a=b.querySelector('audio'); if(a){ a.currentTime=0; a.play().catch(()=>{}); } }
function openChenyuPic(){ const e=document.getElementById('cyPic'); if(e){ e.style.display='block'; e.scrollIntoView({block:'nearest'}); } }
function winRecycle(){
  return `<div class="win" id="win-recycle" style="left:140px;top:100px;width:380px;">
    <div class="tb"><span>回收站</span><span class="x" onclick="lClose('recycle')">×</span></div>
    <div class="bd">
      <div style="padding:10px;border-bottom:1px solid #ddd;">已删除项目（4）</div>
      <div style="padding:10px;line-height:2;font-size:13px;">
        📄 物理错题本.pdf<br>
        📄 <a href="javascript:void(0)" onclick="recycleClick(this)">看这个.txt</a><br>
        <a href="javascript:void(0)" onclick="playRec()">🎵 录音_20270908.m4a</a>
      <div id="recBox" style="display:none;margin-top:6px;"><audio controls autoplay src="/assets/audio/rec_20270908.m4a" style="width:100%;"></audio></div><br>
        <a href="javascript:void(0)" onclick="openChenyuPic()">🖼 陈屿.jpg</a>
      <div id="cyPic" style="display:none;margin-top:8px;"><img src="/assets/chenyu.jpg" style="width:180px;filter:blur(1.5px) grayscale(.3);"></div>
      </div>
    </div></div>`;
}
function winFiles(){
  return `<div class="win" id="win-files" style="left:150px;top:90px;width:400px;">
    <div class="tb"><span>此电脑 · D:</span><span class="x" onclick="lClose('files')">×</span></div>
    <div class="bd">
      <div style="padding:10px;line-height:2;font-size:13px;">
        📁 <a href="javascript:void(0)" onclick="filesOpenPrivate()">私人/</a>　<span class="dim">（需密码，与井文件夹相同）</span><br>
        📁 作业/<br>
        📁 照片/<br>
        📄 读我.txt
      </div>
      <div id="filesOut" style="padding:10px;border-top:1px solid #ddd;font-size:13px;"></div>
    </div></div>`;
}
function winMusic(){
  const songs=["致稳中学校歌","校园颂","夜的钢琴曲","同桌的你","井","晴天","那些花儿","校道"];
  return `<div class="win" id="win-music" style="left:160px;top:100px;width:360px;">
    <div class="tb"><span>音乐播放器</span><span class="x" onclick="lClose('music')">×</span></div>
    <div class="bd">
      ${songs.map((s,i)=>`<div style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;cursor:pointer;" onclick="musicPlay(${i})">🎵 ${s}</div>`).join("")}
      <div id="musicOut" style="padding:10px;font-size:12px;color:#667;"></div>
    </div></div>`;
}
function musicPlay(i){
  const o=document.getElementById("musicOut"); if(!o) return;
  document.querySelectorAll("audio#glnMusic").forEach(a=>a.remove());
  const a=document.createElement("audio"); a.id="glnMusic"; a.controls=true;
  a.style="width:100%;margin-top:6px;";
  const songs=["致稳中学校歌","校园颂","夜的钢琴曲","同桌的你","井","晴天","那些花儿","校道"];
  if(i===1) a.src="/assets/audio/school_song.mp3";
  else if(i===4) a.src="/assets/audio/well.mp3";
  else { a.src=""; o.textContent="该曲目暂时无法播放。"; return; }
  o.textContent="正在播放："+songs[i];
  o.appendChild(a); a.play().catch(()=>{});
}
function winBrowser(){
  const hist=["睡眠瘫痪症 症状","高中 转学 手续 → 已取消","1923 直隶 女子师范 校史","校园 失踪 同学 会被找到吗","图书馆 东南角","查寝 点到 没人应","致稳中学 贴吧"];
  return `<div class="win" id="win-browser" style="left:140px;top:80px;width:440px;">
    <div class="tb"><span>浏览器 · 历史记录</span><span class="x" onclick="lClose('browser')">×</span></div>
    <div class="bd">
      <div style="padding:10px;font-size:13px;line-height:2;">
        ${hist.map(h=>`<div>🔍 ${h}</div>`).join("")}
      </div>
    </div></div>`;
}
function filesOpenPrivate(){
  const o=document.getElementById("filesOut"); if(!o) return;
  if(GLN.P.prog.wellOpened){
    o.innerHTML=`<div style="padding:10px;line-height:2;">
      <b>私人/（已解锁）</b><br>
      💌 短信_20270908_1835.txt<br>
      💌 短信_20270908_1840.txt：<br>
      <span style="font-family:SimSun,serif;">"我在德育处门口等你。"</span>
    </div>`;
  } else {
    o.innerHTML=`<div style="padding:10px;"><input id="filesPass" placeholder="密码" style="width:120px;">
      <button class="btn" onclick="filesTryPass()">解锁</button></div>`;
  }
}
function filesTryPass(){
  const v=(document.getElementById("filesPass")||{value:""}).value.trim();
  const o=document.getElementById("filesOut");
  if(v==="0908"){ GLN.P.prog.wellOpened=true; GLN.save(); filesOpenPrivate(); }
  else o.innerHTML=`<div style="padding:10px;color:#b02020;">密码错误。</div>`;
}
function winWell(){
  return `<div class="win" id="win-well" style="left:200px;top:120px;width:420px;">
    <div class="tb"><span>文件夹：井</span><span class="x" onclick="lClose('well')">×</span></div>
    <div class="bd" id="wellBody">
      ${P.p().sawOld ? `<p>已解锁。</p><p>1923 退学证明书.pdf</p><p><a href="javascript:void(0)" onclick="lOpen('old')">打开</a></p>` : `
      <div class="prompt">
        此文件夹已加密。
        <div class="dim">密码格式：MMDD。</div>
        <input id="lq3" style="margin-top:6px;"><br>
        <button class="btn" onclick="lP3()" style="margin-top:6px;">打开</button>
        <div class="fb" id="lq3fb"></div>
      </div>`}
    </div></div>`;
}
function winOld(){
  return `<div class="win" id="win-old" style="left:240px;top:90px;width:420px;">
    <div class="tb"><span>1923 退学证明书</span><span class="x" onclick="lClose('old')">×</span></div>
    <div class="bd doc">直隶省立第二女子师范学堂 退学证明书

学生 沈砚秋，年十九岁。该生性情孤僻，不睦同侪，屡戒不悛，着即退学。
校长　（印章被刮去）
中华民国十二年六月

页边铅笔字：照壁之下，井栏之侧。大考前，须出一人。

<div style="margin-top:14px;border-top:1px solid #999;padding-top:8px;color:#8b1a1a;font-weight:bold;">
[归档状态] 原件未移除
</div>
<div style="color:#8b1a1a;">
原件位置：<a href="javascript:void(0)" onclick="lClose('old');document.getElementById('laptopScreen').style.display='none';location.hash='#/jing';" style="color:#8b1a1a;text-decoration:underline;">/jing</a>
</div>

<b style="margin-top:12px;display:block;">观澜后台登录</b>
<div class="dim">归档日期 1923-06-07</div>
<div class="prompt">
  口令：<input id="lq4" style="margin-top:6px;"><br>
  <button class="btn" onclick="lP4()" style="margin-top:6px;">登录</button>
  <div class="fb" id="lq4fb"></div>
</div></div></div>`;
}
function winAdmin(){
  return `<div class="win" id="win-admin" style="left:160px;top:70px;width:520px;">
    <div class="tb"><span>观澜 v3.7 · 待疏导名单</span><span class="x" onclick="lClose('admin')">×</span></div>
    <div class="bd">
      <div class="transcript-ink">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr><td>名次</td><td>学号</td><td>姓名</td><td>契合度</td></tr>
          <tr><td>1</td><td>20240701</td><td>赵</td><td>96</td></tr>
          <tr><td>2</td><td>20240702</td><td>钱</td><td>94</td></tr>
          <tr style="background:#e8e4d8;"><td>—</td><td>20240714</td><td style="color:#e8e4d8;">林见月</td><td style="color:#e8e4d8;">22</td></tr>
          <tr><td colspan="4" id="nextRow">待刮除对象：<span id="typing"></span><span class="cursor"></span></td></tr>
        </table>
      </div>
      <button class="btn" onclick="if(confirm('确认执行？此操作不可撤销。'))lBadEnd()" style="width:100%;padding:12px;margin-top:14px;background:#8b1a1a;color:#fff;border:none;letter-spacing:6px;">执 行 刮 除</button>
      <p style="margin-top:10px;font-size:11px;color:#888;">系统建议：如认定操作有误，请先<a href="javascript:void(0)" onclick="blinkWell()">清理本地缓存目录</a>。</p>
      <p style="margin-top:6px;font-size:11px;color:#8b1a1a;">原件仍在 <a href="javascript:void(0)" onclick="lClose('admin');document.getElementById('laptopScreen').style.display='none';location.hash='#/jing';" style="color:#8b1a1a;">/jing</a>。删除本地副本前，请先核对原件。</p>
    </div></div>`;
}
function blinkWell(){
  lClose("admin");
  const w=document.getElementById("wellIco"); if(!w) return;
  w.scrollIntoView();
  w.style.animation="blinkIco .8s infinite";
}

/* 分段落打字：segs = [[text, delayAfterMs], ...]，红色段加 class
 * typeTo(el, [["登录成功。",300],["加载档案……",300],["错误：该生不存在。",0,"red"]]) */
function typeTo(el, segs){
  if(!el) return;
  el.className = el.className.replace(/\bred\b/,"");
  let i = 0;
  function next(){
    if(i >= segs.length) return;
    const [txt, gap, red] = segs[i++];
    if(red) el.classList.add("red");
    el.textContent = txt;
    setTimeout(next, gap || 0);
  }
  next();
}
function recycleClick(a){
  const w=a.closest(".win"); if(!w) return;
  const els=[...w.querySelectorAll("a,span,div")].filter(e=>!e.closest(".tb"));
  els.forEach(e=>{ if(e.textContent.trim()) e.dataset._t=e.textContent; e.textContent="井"; });
  setTimeout(()=>{ els.forEach(e=>{ if(e.dataset._t) e.textContent=e.dataset._t; }); },400);
}
/* ---- 谜题链 ---- */
function lP1(){
  const v = document.getElementById("lq1").value.trim();
  const fb = document.getElementById("lq1fb");
  if(v === "20240714"){
    fb.className="fb ok"; fb.textContent="登录成功。加载档案……错误：该生不存在。";
    shake(); setTimeout(()=> lClose("portal"), 1000);
    setTimeout(()=> lOpen("archive"), 1100);
  } else { fb.className="fb bad"; fb.textContent="学号不存在。"; }
}
function lP2(){
  const v = document.getElementById("lq2").value.trim();
  const fb = document.getElementById("lq2fb");
  if(v === "3"){ fb.className="fb ok"; fb.textContent="判定成立。解锁谈话记录。"; lOpen("talk"); }
  else { fb.className="fb bad"; fb.textContent="再数一遍低于 35 的点。"; }
}
function lP3(){
  const v = document.getElementById("lq3").value.trim();
  const fb = document.getElementById("lq3fb");
  if(v === "0908"){
    fb.className="fb ok"; fb.textContent="锁开了。";
    P.prog.sawOld=true; save();
    lOpen("old");
  } else { fb.className="fb bad"; fb.textContent="密码错误。"; }
}
function lP4(){
  const v = document.getElementById("lq4").value.trim();
  const fb = document.getElementById("lq4fb");
  if(v === "104"){
    fb.className="fb ok"; fb.textContent="已连接。";
    P.prog.root = true; save();
    sndScratch();
    setTimeout(()=>{
      lOpen("admin"); typeNext();
      // 桌面出现新图标
      const desk=document.querySelector(".desk-icons");
      if(desk && !document.getElementById("adminIco")){
        const d=document.createElement("div"); d.className="dicon"; d.id="adminIco";
        d.onclick=()=>lOpen("admin");
        d.innerHTML='<div class="pic">⚙</div><div class="lbl">观澜后台</div>';
        desk.appendChild(d);
      }
    }, 900);
  } else { fb.className="fb bad"; fb.textContent="1923 到今年，减一下。"; }
}
function typeNext(){
  const el = document.getElementById("typing"); if(!el) return;
  const t = "访客"; let i=0;
  const iv = setInterval(()=>{ el.textContent = t.slice(0,++i); if(i>=t.length) clearInterval(iv); }, 380);
}
function lBadEnd(){
  localStorage.clear();
  document.getElementById("laptopScreen").style.transition="filter .1s";
  document.getElementById("laptopScreen").style.filter="brightness(0)";
  setTimeout(()=> location.reload(), 800);
}
function wellClick(){
  if(P.p().sawOld && !P.p().ended){
    if(confirm("档案原件位于 /jing。\n\n确认删除本地副本？\n删除后不可恢复。")){
      sndScratch();
      P.prog.ended = true; save();
      const wi=document.getElementById("wellIco"); if(wi) wi.remove();
      setTimeout(()=> siteWideScratch(), 500);
    }
  } else {
    lOpen("well");
  }
}

/* GLN.laptop.init：幂等建桌面 */
GLN.laptop.init = function(){
  if(GLN.laptop._inited) return;
  GLN.laptop._inited = true;
  if(!document.getElementById("desktop").innerHTML) buildDesktop();
};
