/* ============================================================
 * credits.js — 制作人名单 / 贡献值 / 内测信息
 * deps: config.js（需先加载，创建 window.GLN）
 * 职责：集中维护所有作者、出品、致谢、内测信息
 * 说明：本文件是唯一维护入口，其他文件不得硬编码名单
 * ------------------------------------------------------------
 * 如何维护本文件：
 *
 * 1. 添加制作人：在 authors 数组里加一项
 *    { name:"", role:"", contribution:"" }
 *
 * 2. 添加内测人员：在 testers 数组里加一项
 *    { name:"", role:"" }
 *    若 testers 为空数组，结束页显示"内测支持　（自由添加）"
 *
 * 3. 添加致谢：在 thanks 数组里加一项
 *    { name:"", role:"" }
 *
 * 4. 修改出品方：改 publisher.name
 *
 * 5. 修改结语：改 footer
 *
 * 6. 修改关闭提示：改 closedText
 *
 * 7. 本文件不需要改 HTML 或 CSS，只改这里即可
 * ============================================================ */
window.GLN = window.GLN || {};
GLN.CREDITS = {
  title: "观 澜",
  subtitle: "—— 致稳中学 · 2027",
  authors: [
    { name: "ccicc", role: "策划 / 程序 / 美术", contribution: "整体世界观、谜题链、笔记本模块、结局系统" },
    { name: "shuaiqiyy", role: "策划 / 程序 / 美术", contribution: "门户站点、后台系统、美术动效、音频合成" }
  ],
  publisher: { name: "雄帮游戏", note: "独立游戏工作室" },
  thanks: [
    { name: "冰冰", role: "服务器提供" }
  ],
    testers: [
        { name: "Lucky" },
    ],
  footer: "感谢游玩",
  closedText: "此页面可以关闭"
};
