/* ============================================================
 * effects.js — canvas 刮除动效 / WebAudio 音效 / 故障
 * deps: config.js（GLN / GLN.P）
 * ============================================================ */
window.GLN = window.GLN || {};
GLN.effects = GLN.effects || {};

let AC = null;
function audio(){
  try{
    if(!AC) AC = new (window.AudioContext||window.webkitAudioContext)();
    return AC;
  }catch(e){ return null; }
}
function sndHum(){
  const ac = audio(); if(!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.value = 50; g.gain.value = 0.025;
  o.connect(g); g.connect(ac.destination); o.start();
}
function sndScratch(){
  const ac = audio(); if(!ac) return;
  const buf = ac.createBuffer(1, ac.sampleRate*0.4, ac.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1)*Math.exp(-i/(d.length*0.08));
  const s = ac.createBufferSource(); s.buffer = buf;
  const g = ac.createGain(); g.gain.value = 0.22;
  s.connect(g); g.connect(ac.destination); s.start();
}

/* 当前在跑的动画帧集合，供 clear() 取消 */
const _rafs = new Set();
function _loop(fn){
  const id = requestAnimationFrame(function tick(t){
    if(!_rafs.has(id)) return;   // 已被 clear
    if(fn(t) !== false) _rafs.add(requestAnimationFrame(tick));
    else _rafs.delete(id);
  });
  _rafs.add(id);
}

/* 生成一条毛糙刮痕路径：随机游走 12 点 */
function _tracePath(ctx, x, y, w, h){
  ctx.beginPath();
  ctx.moveTo(x, y);
  let cx = x, cy = y;
  const steps = 12;
  for(let i=0;i<steps;i++){
    cx += (Math.random()*2-1)*90;          // x 步进 ±90
    cy += (Math.random()*2-1)*40;          // y 步进 ±40
    cx = Math.max(0, Math.min(w, cx));
    cy = Math.max(0, Math.min(h, cy));
    ctx.lineTo(cx, cy);
  }
}

/* 画一条刮痕：主线 + 多层细纤维毛边 */
function _drawScratch(ctx, w, h, color){
  const x = Math.random()*w, y = Math.random()*h;
  const lw = 2 + Math.random()*5;          // 2~7px
  // 主线
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  _tracePath(ctx, x, y, w, h);
  ctx.stroke();
  // 毛边：叠几层更细、更透明的线
  for(let k=0;k<3;k++){
    ctx.strokeStyle = "rgba(232,228,216," + (0.15+Math.random()*0.2) + ")";
    ctx.lineWidth = 0.6;
    _tracePath(ctx, x + (Math.random()*6-3), y + (Math.random()*6-3), w, h);
    ctx.stroke();
  }
}

/* 建一个全屏/目标 canvas */
function _makeCanvas(target){
  const c = document.createElement("canvas");
  c.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9000;";
  const box = target ? target.getBoundingClientRect() : null;
  const w = box ? Math.max(1, box.width) : window.innerWidth;
  const h = box ? Math.max(1, box.height) : window.innerHeight;
  c.width = w; c.height = h;
  if(box){
    c.style.left = box.left + "px"; c.style.top = box.top + "px";
    c.style.width = w + "px"; c.style.height = h + "px";
  }
  document.body.appendChild(c);
  return c;
}

/* 小刮除：5~9 条，1800ms 淡入淡出后自删 */
function scratchOnce(opts){
  opts = opts || {};
  const color = opts.color || "#e8e4d8";
  const density = opts.density || 1;
  const count = Math.round((5 + Math.random()*4) * density);
  const c = _makeCanvas(opts.target);
  const ctx = c.getContext("2d");
  const t0 = performance.now();
  const LIFE = 1800;

  sndScratch();
  _loop(function(now){
    const el = now - t0;
    const p = el / LIFE;
    if(p >= 1){ _cleanup(c); return false; }
    ctx.clearRect(0,0,c.width,c.height);
    ctx.globalAlpha = p < 0.3 ? p/0.3 : 1 - Math.max(0,(p-0.6)/0.4);  // 淡入->淡出
    for(let i=0;i<count;i++) _drawScratch(ctx, c.width, c.height, color);
    return true;
  });
}

/* 全站大刮除：20~40 条快速生成(600ms) -> fade to 米白(1200ms) -> onDone */
function siteWideScratch(onDone){
  const c = _makeCanvas(null);
  const ctx = c.getContext("2d");
  const count = 20 + Math.floor(Math.random()*21);
  const t0 = performance.now();
  sndScratch();

  _loop(function(now){
    const el = now - t0;
    if(el < 600){
      // 阶段一：刮痕随时间逐条长出
      ctx.clearRect(0,0,c.width,c.height);
      const n = Math.ceil(count * el/600);
      for(let i=0;i<n;i++) _drawScratch(ctx, c.width, c.height, "#e8e4d8");
      return true;
    } else if(el < 1800){
      // 阶段二：整体淡向米白
      ctx.clearRect(0,0,c.width,c.height);
      for(let i=0;i<count;i++) _drawScratch(ctx, c.width, c.height, "#e8e4d8");
      const p = (el-600)/1200;
      ctx.fillStyle = "rgba(232,228,216," + (p*0.92) + ")";
      ctx.fillRect(0,0,c.width,c.height);
      return true;
    } else {
      _cleanup(c);
      if(onDone){ onDone(); } else { _defaultEnding(); }
      return false;
    }
  });
}

/* 默认终局：按进度判断三结局（不删 localStorage，按钮各自处理） */
function _defaultEnding(){
  const fl = GLN.P.prog || {};
  // 真结局：刮完直接进班级合影页（portal 仍在，canvas 已移除）
  if(fl.jing === true){ location.hash = "#/class"; return; }
  let btn, clear;
  if(fl.escape >= 3){ btn = "离开"; clear = false; }
  else if(fl.refusals >= 3){ btn = "留下来"; clear = false; }
  else { btn = "再来一遍"; clear = true; }
  document.body.innerHTML = `
    <div style="position:fixed;inset:0;background:#e8e4d8;color:#333;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;font-family:SimSun,serif;">
      <p style="letter-spacing:4px;font-size:18px;">该生不存在。</p>
      <div style="margin-top:40px;font-size:12px;line-height:2.2;color:#666;">
        制作：ccicc · shuaiqiyy<br>
        出品：雄帮游戏<br>
        服务器提供：冰冰
      </div>
      <p style="margin-top:30px;font-size:11px;color:#999;">感谢游玩。</p>
      <p style="margin-top:30px;font-size:11px;color:#bbb;opacity:0;transition:opacity 5s;">如果你正在经历类似的困境，请告诉一个你信任的人。</p>
      <div style="margin-top:20px;display:flex;gap:12px;">
        <button onclick="GLN._endBtn(${clear})" style="background:#fff;color:#333;border:1px solid #999;padding:8px 20px;cursor:pointer;">${btn}</button>
        <button onclick="GLN.showCredits()" style="background:transparent;color:#999;border:1px solid #ccc;padding:8px 20px;cursor:pointer;">结束</button>
      </div>
    </div>`;
  setTimeout(()=>{ const es=document.querySelector("p[style*='opacity:0']"); if(es) es.style.opacity=1; },5000);
}
/* 结局按钮：clear=true 清档重开；否则保留进度，静止 */
GLN._endBtn = function(clear){
  if(clear) localStorage.removeItem("gln_prog");
  location.reload();
};

/* 清理一个 canvas 及其动画帧 */
function _cleanup(c){
  // 取消该 canvas 后续 raf（这里简化：直接 remove 节点，loop 自检 _rafs）
  c.remove();
}

/* 整屏抖一下 */
function shake(){
  document.body.style.transition = "transform .05s";
  document.body.style.transform = "translateX(-6px)";
  setTimeout(()=>{ document.body.style.transform = "translateX(6px)"; }, 60);
  setTimeout(()=>{ document.body.style.transform = ""; }, 120);
}

/* 路由切换时清空所有进行中的刮除动画 */
function clear(){
  _rafs.forEach(id => cancelAnimationFrame(id));
  _rafs.clear();
  document.querySelectorAll("canvas").forEach(c=>{
    if(c.style.zIndex === "9000") c.remove();
  });
}

/* 挂到 GLN.effects */
GLN.effects = {
  init: function(){ clear(); },
  sndHum, sndScratch, scratchOnce, siteWideScratch, shake, clear
};

/* console 反调试彩蛋（不泄露任何答案） */
console.log("%c——你在看控制台？——","color:#6fd3e3;font-weight:bold");
console.log("%c提示：站规在 /robots.txt。那面镜子，别盯太久。","color:#5e7078");
console.log("Containing token: ZW1923.");
/* ============================================================
 * 图片降级：加载失败时用 CSS/SVG 合成，不显示破图
 * ============================================================ */
GLN.media = GLN.media || {};
GLN.media.fallback = {
  cctv: `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,#243028,#0a0f0c);overflow:hidden;">
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.03) 0 2px,transparent 2px 4px);"></div>
    <div style="position:absolute;left:50%;top:70%;width:14px;height:46px;background:#000;border-radius:6px;"></div>
    <div style="position:absolute;left:14px;top:10px;color:#7fd08a;font:12px monospace;">REC</div></div>`,
  mirror: `<svg viewBox="0 0 400 260" style="width:100%;height:100%;">
    <rect x="60" y="20" width="280" height="220" fill="#1c2a2a" stroke="#5a6a66" stroke-width="4"/>
    <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2c3e3e"/><stop offset="1" stop-color="#101818"/></linearGradient></defs>
    <rect x="70" y="30" width="260" height="200" fill="url(#mg)"/>
    <ellipse cx="200" cy="180" rx="8" ry="26" fill="#050808"/></svg>`,
  locust: `<div style="height:220px;background:conic-gradient(from 200deg at 50% 100%,#0c1410,#1a2a1e 30%,#0c1410 60%);position:relative;">
    <div style="position:absolute;left:45%;top:30%;width:10%;height:70%;background:#0a0f0c;"></div></div>`,
  notebook: `<div style="height:200px;background:#f0e9d2;color:#333;font-family:serif;padding:14px;">
    <div style="height:8px;background:#222;margin:6px 0;"></div>
    <div style="height:8px;background:#222;width:80%;"></div>
    <div style="height:8px;background:#b02020;width:60%;margin-top:10px;"></div></div>`,
  photo: `<div style="aspect-ratio:3/2;background:linear-gradient(135deg,#2a2e34,#14171b);display:flex;align-items:center;justify-content:center;color:#5e7078;font-size:13px;font-family:SimSun,serif;letter-spacing:2px;">（胶片已损坏）</div>`,
  portrait: `<div style="width:60px;height:80px;background:linear-gradient(160deg,#c8cdd4,#8a9198);display:flex;align-items:center;justify-content:center;color:#5e7078;font-size:10px;">照片缺失</div>`,
  doc: `<div style="aspect-ratio:4/3;background:#e8e0c8;display:flex;align-items:center;justify-content:center;color:#7a6a4a;font-family:SimSun,serif;font-size:13px;">（原件已失）</div>`,
  default: `<div style="height:200px;background:linear-gradient(135deg,#1a2028,#0c1014);color:#5e7078;display:flex;align-items:center;justify-content:center;font-size:13px;">（图片缺失）</div>`
};
GLN.media.img = function(src, alt, kind){
  const k = kind || "default";
  return `<img src="${src}" alt="${alt||''}" loading="lazy"
    onerror="this.outerHTML=GLN.media.fallback['${k}']||GLN.media.fallback.default">`;
};
/* ============================================================
 * 恐怖增强：微故障 / 闪现面孔 / 文字变形 / 环境音 / 等级
 * ============================================================ */
GLN.effects.horror = {
  level: 1,            // 1低 2中 3高
  faceUsed: 0,
  timers: []
};

/* 方向五：按进度分档。portal 路由切换时调用 */
GLN.effects.setLevel = function(l){
  GLN.effects.horror.level = l;
  GLN.effects.audio.setScene(l>=3 ? "jing" : l===2 ? "laptop" : "portal");
};

/* ---- 方向一：页面级微故障 ---- */
function _glitchOne(){
  const h = GLN.effects.horror;
  if(h.level < 1) return;
  const t = ["shake","invert","garble","face"][Math.floor(Math.random()*4)];
  const dur = 200 + Math.random()*400;
  if(t==="shake"){
    document.body.style.transition="transform .04s";
    document.body.style.transform=`translateX(${Math.random()>.5?2:-2}px)`;
    setTimeout(()=>document.body.style.transform="", dur);
  } else if(t==="invert"){
    document.body.style.filter="invert(1)";
    setTimeout(()=>document.body.style.filter="", 80);
  } else if(t==="garble"){
    const els=[...document.querySelectorAll("p,h1,h2,span")].filter(e=>e.offsetHeight>0);
    const el=els[Math.floor(Math.random()*els.length)]; if(!el) return;
    const old=el.textContent;
    el.textContent=old.split("").map(c=>Math.random()>.5?"#":c).join("");
    setTimeout(()=>el.textContent=old, 250);
  } else if(t==="face" && h.level>=2){
    _ghostFace();
  }
}
GLN.effects.glitch = _glitchOne;

/* 滚动超 60% 触发 */
window.addEventListener("scroll", ()=>{
  const h=document.documentElement;
  if(h.scrollTop/h.scrollHeight > 0.6 && Math.random()<0.04) _glitchOne();
});
/* 连点 3 次 */
let _clicks=0, _clkT;
document.addEventListener("click", ()=>{
  _clicks++; clearTimeout(_clkT);
  _clkT=setTimeout(()=>_clicks=0, 800);
  if(_clicks>=3){ _glitchOne(); _clicks=0; }
});

/* ---- 方向二：闪现面孔（SVG 半刮轮廓） ---- */
function _ghostFace(){
  const h=GLN.effects.horror;
  if(h.faceUsed>=2) return;
  h.faceUsed++;
  const d=document.createElement("div");
  d.style.cssText="position:fixed;inset:0;background:#000;z-index:9600;display:flex;align-items:center;justify-content:center;";
  d.innerHTML=`<svg width="200" height="260" viewBox="0 0 200 260">
    <ellipse cx="100" cy="120" rx="55" ry="72" fill="#111"/>
    <path d="M120 60 L150 200" stroke="#e8e4d8" stroke-width="3" fill="none"/>
    <ellipse cx="82" cy="110" rx="6" ry="9" fill="#000"/>
    <ellipse cx="118" cy="110" rx="6" ry="9" fill="#000"/>
  </svg>`;
  document.body.appendChild(d);
  sndWhisper();
  setTimeout(()=>d.remove(), 100);
}
GLN.effects.faceFlash = _ghostFace;
/* 极轻气音 */
function sndWhisper(){
  const ac=audio(); if(!ac) return;
  const b=ac.createBuffer(1,ac.sampleRate*0.1,ac.sampleRate);
  const d=b.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*0.04;
  const s=ac.createBufferSource(); s.buffer=b; s.start();
}

/* ---- 方向三：文字变形 ---- */
GLN.effects.morphText = function(sel, seq, interval){
  const el=document.querySelector(sel); if(!el) return;
  let i=0;
  GLN.effects.horror.timers.push(setInterval(()=>{
    el.textContent=seq[i%seq.length]; i++;
  }, interval||20000));
};

/* ---- 方向四：环境音频 ---- */
GLN.effects.audio = {
  nodes: [], heartTimer: null,
  setScene(scene){
    this.stop();
    if(scene==="jing"||scene==="admin") this.heart(60);
    if(scene==="laptop") this.steps();
  },
  stop(){ this.nodes.forEach(n=>{try{n.stop()}catch(e){}}); this.nodes=[];
    if(this.heartTimer){clearInterval(this.heartTimer);this.heartTimer=null;} },
  steps(){
    const ac=audio(); if(!ac) return;
    const iv=setInterval(()=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type="sine"; o.frequency.value=120+Math.random()*40;
      g.gain.setValueAtTime(0.02,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.15);
      o.connect(g);g.connect(ac.destination); o.start(); o.stop(ac.currentTime+0.15);
    }, 1800);
    this.nodes.push({stop:()=>clearInterval(iv)});
  },
  heart(bpm){
    const ac=audio(); if(!ac) return;
    this.heartTimer=setInterval(()=>{
      [0.2,0.35].forEach(d=>{
        const o=ac.createOscillator(),g=ac.createGain();
        o.frequency.value=70; g.gain.setValueAtTime(0.05,ac.currentTime+d);
        g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+d+0.12);
        o.connect(g);g.connect(ac.destination); o.start(ac.currentTime+d);o.stop(ac.currentTime+d+0.12);
      });
    }, 60000/bpm);
  },
  ding(){
    const ac=audio(); if(!ac) return;
    const o=ac.createOscillator(),g=ac.createGain();
    o.frequency.value=880; g.gain.value=0.06;
    o.connect(g);g.connect(ac.destination); o.start();
    setTimeout(()=>o.stop(),2500);
  }
};

/* 打印机走纸声：白噪声 + 低通 */
GLN.effects.sndPrinter = function(){
  const ac = window.GLN && GLN.effects && GLN.effects._ac ? GLN.effects._ac : null;
  try{
    const ctx = ac || new (window.AudioContext||window.webkitAudioContext)();
    if(!GLN.effects._ac) GLN.effects._ac = ctx;
    const len = Math.floor(ctx.sampleRate*0.45);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len)*0.25;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type="lowpass"; f.frequency.value=1200;
    const g = ctx.createGain(); g.gain.value=0.18;
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
  }catch(e){}
};
/* ============================================================
 * GLN.motion — 统一动效库（Promise 化，可 await）
 * ============================================================ */
GLN.motion = {
  pause(ms){ return new Promise(r=>setTimeout(r,ms||0)); },

  reveal(el, opts){
    opts = opts || {};
    return new Promise(res=>{
      if(!el) return res();
      el.style.opacity = 0;
      el.style.transition = `opacity ${opts.duration||400}ms ease-out`;
      setTimeout(()=>{ el.style.opacity = 1; setTimeout(res,(opts.duration||400)+(opts.delay||0)); }, opts.delay||0);
    });
  },

  unfold(el, opts){
    opts = opts || {};
    return new Promise(res=>{
      if(!el) return res();
      const d = opts.duration || 800;
      el.style.transformOrigin = (opts.from||"top") + " center";
      el.style.transform = "scaleY(.02) translateY(-40px)";
      el.style.opacity = 0;
      el.style.transition = `transform ${d}ms cubic-bezier(.2,.9,.25,1.1), opacity 500ms`;
      requestAnimationFrame(()=>{ el.style.transform = "scaleY(1) translateY(0)"; el.style.opacity = 1; });
      setTimeout(res, d);
    });
  },

  cursor(el){
    if(!el) return ()=>{};
    el.classList.add("mcursor");
    return ()=> el.classList.remove("mcursor");
  },

  type(el, text, opts){
    opts = opts || {};
    const sp = opts.speed || 40, ps = opts.punctuationSpeed || 80;
    return new Promise(async res=>{
      if(!el) return res();
      const stop = opts.cursor === false ? ()=>{} : GLN.motion.cursor(el);
      el.textContent = "";
      for(let i=1;i<=text.length;i++){
        el.textContent = text.slice(0,i);
        await GLN.motion.pause(/[，。！；：、——…]/u.test(text[i-1]) ? ps : sp);
      }
      if(opts.cursor !== false) setTimeout(stop, 600);
      res();
    });
  },

  printRows(container, rows, opts){
    opts = opts || {};
    const iv = opts.interval || 180, fx = opts.effect || "slideLeft";
    return new Promise(async res=>{
      for(const r of rows){
        r.classList.add("on");
        if(fx==="fadeIn") r.style.transition = "opacity .25s";
        await GLN.motion.pause(iv);
      }
      res();
    });
  },

  redline(el){
    return new Promise(res=>{
      if(!el) return res();
      el.style.position = "relative";
      const u = document.createElement("span");
      u.style.cssText = "position:absolute;left:50%;bottom:-2px;height:2px;background:#c0392b;transition:width .4s ease-out;left:0;width:0;";
      el.appendChild(u);
      requestAnimationFrame(()=>{ u.style.width = "100%"; });
      setTimeout(res, 400);
    });
  }
};