// 实机截图脚本：用 Electron 驱动游戏 UI，截取 README 所需各场景
// 运行: cd desktop && npx electron ../tools/capture-screenshots.js
const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const APP_ROOT = path.join(__dirname, '..', 'desktop', 'app');
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }
]);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function shot(win, file) {
  await sleep(900);
  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(OUT, file), img.toPNG());
  console.log('saved', file);
}

async function js(win, code) {
  const s = await win.webContents.executeJavaScript(
    `try{ JSON.stringify({r:(function(){${code}})()}) }catch(e){ JSON.stringify({e:String(e&&e.message||e)}) }`, true);
  const o = JSON.parse(s);
  if (o.e) throw new Error('page: ' + o.e);
  return o.r;
}

// 关掉引导/教程/结算弹窗，避免挡住画面
async function dismissOverlays(win) {
  for (let i = 0; i < 18; i++) {
    const acted = await js(win, `(function(){
      var out = [];
      var intro = document.getElementById('intro-modal');
      if (intro && intro.style.display !== 'none' && intro.offsetParent !== null) {
        try { closeIntro(); out.push('intro'); } catch(e){}
      }
      var d = document.getElementById('day-modal');
      if (d && d.style.display !== 'none' && d.offsetParent !== null) {
        try { closeDaySettlement(); out.push('day'); } catch(e){}
      }
      var t = document.getElementById('tutorial-overlay');
      if (t && getComputedStyle(t).display !== 'none') {
        var btns = Array.prototype.slice.call(t.querySelectorAll('button'));
        var skip = btns.find(function(b){ return /跳过/.test(b.textContent); });
        (skip || btns[btns.length - 1]).click();
        out.push('tutorial');
      }
      return out.join(',');
    })()`);
    if (!acted) break;
    await sleep(450);
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await app.whenReady();

  protocol.handle('app', (request) => {
    const u = new URL(request.url);
    let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html';
    const abs = path.normalize(path.join(APP_ROOT, rel));
    if (abs !== APP_ROOT && !abs.startsWith(APP_ROOT + path.sep)) return new Response('nf', { status: 404 });
    return net.fetch(pathToFileURL(abs).toString());
  });

  const win = new BrowserWindow({
    width: 430, height: 900, useContentSize: true, show: true,
    backgroundColor: '#f5f5f5',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  await win.loadURL('app://game/index.html');
  await sleep(3500);

  // 01 主页
  await dismissOverlays(win);
  await shot(win, '01-home.png');

  // 02 关于
  await js(win, `showAbout()`);
  await dismissOverlays(win);
  await shot(win, '02-about.png');
  await js(win, `(function(){
    var m = document.getElementById('about-modal');
    if (m) { var b = m.querySelector('button'); if (b) b.click(); if (m.parentNode) m.parentNode.removeChild(m); }
    return true;
  })()`);

  // 03 昵称
  await js(win, `showNicknameInput()`);
  await js(win, `document.getElementById('login-user').value='小饭老板'`);
  await dismissOverlays(win);
  await shot(win, '03-nickname.png');

  // 04 选址地图（登录后第一屏）
  await js(win, `doLogin()`);
  await sleep(1200);
  await dismissOverlays(win);
  await shot(win, '04-map.png');

  // 05 选店型（选定地段后）
  const locR = await js(win, `(function(){
    try {
      var locs = (typeof LOCATION_TYPES !== 'undefined') ? LOCATION_TYPES : [];
      if (!locs.length) return 'no-locations';
      selectLocation(locs[0].id);
      return 'ok';
    } catch(e) { return 'ERR:' + e.message; }
  })()`);
  console.log('selectLocation =>', locR);
  await sleep(1000);
  await dismissOverlays(win);
  await shot(win, '05-shoptype.png');

  // 06 店名确认
  const shopR = await js(win, `(function(){
    try { selectShop(SHOP_TYPES[0].id); return 'ok'; } catch(e) { return 'ERR:' + e.message; }
  })()`);
  console.log('selectShop =>', shopR);
  await sleep(1000);
  await dismissOverlays(win);
  await shot(win, '06-shopname.png');

  // 07 营业时长 → 进入游戏
  const confR = await js(win, `(function(){
    try { confirmShopName(); return 'ok'; } catch(e) { return 'ERR:' + e.message; }
  })()`);
  console.log('confirmShopName =>', confR);
  await sleep(1000);
  await dismissOverlays(win);
  await shot(win, '07-bizhours.png');
  const bizR = await js(win, `(function(){
    try { confirmBizHours(); return 'ok'; } catch(e) { return 'ERR:' + e.message; }
  })()`);
  console.log('confirmBizHours =>', bizR);
  await sleep(2000);
  // 等新手引导出现再关掉（它是延迟弹出的）
  for (let i = 0; i < 30; i++) {
    const on = await js(win, `(function(){
      var t = document.getElementById('tutorial-overlay');
      return !!(t && getComputedStyle(t).display !== 'none');
    })()`);
    if (on) break;
    await sleep(500);
  }
  await dismissOverlays(win);

  // 08 店铺经营主页
  await js(win, `document.getElementById('nav-tab-shop').click()`);
  await dismissOverlays(win);
  await shot(win, '08-game.png');

  await dismissOverlays(win);

  // 09 财务中心
  await js(win, `G.openMoney('money')`);
  await dismissOverlays(win);
  await shot(win, '09-money.png');
  await js(win, `G.closeMoney()`);

  // 10-13 其余页签
  await js(win, `document.getElementById('nav-tab-staff').click()`);
  await dismissOverlays(win);
  await shot(win, '10-staff.png');
  await js(win, `document.getElementById('nav-tab-franchise').click()`);
  await dismissOverlays(win);
  await shot(win, '11-franchise.png');
  await js(win, `document.getElementById('nav-tab-activity').click()`);
  await dismissOverlays(win);
  await shot(win, '12-activity.png');
  await js(win, `document.getElementById('nav-tab-profile').click()`);
  await dismissOverlays(win);
  await shot(win, '13-profile.png');

  // 14 菜单管理
  await js(win, `document.getElementById('nav-tab-shop').click()`);
  await sleep(600);
  await js(win, `G.showMenuModal()`);
  await shot(win, '14-menu.png');
  await js(win, `closeMenuModal()`);

  // 15 选品策略
  await js(win, `G.showSupplyModal()`);
  await shot(win, '15-supply.png');
  await js(win, `closeSupplyModal()`);

  // 16 通知中心
  await js(win, `G.openNotif()`);
  await shot(win, '16-notif.png');
  await js(win, `G.closeNotif()`);

  // 17 日历
  await js(win, `openCal()`);
  await shot(win, '17-calendar.png');
  await js(win, `closeCal()`);

  // 18 营销活动
  await js(win, `G.openPromo()`);
  await shot(win, '18-promo.png');
  await js(win, `G.closePromo()`);

  // 19 PK 对战（点击「爆单冲峰」入口）
  const pk = await js(win, `(function(){
    var els = Array.prototype.slice.call(document.querySelectorAll('button, div[onclick], span[onclick]'));
    var b = els.find(function(x){ return /爆单冲峰/.test(x.textContent); });
    if (b) { b.click(); return 'ok'; }
    return 'no-button';
  })()`);
  console.log('pk entry =>', pk);
  await sleep(2500);
  const pkOn = await js(win, `(function(){
    var s = document.getElementById('screen-pk');
    return !!(s && getComputedStyle(s).display !== 'none');
  })()`);
  if (pkOn) await shot(win, '19-pk.png');
  else console.log('pk screen not visible, skipped');

  console.log('ALL DONE');
  app.exit(0);
})().catch(e => { console.error('FATAL', e); app.exit(1); });
