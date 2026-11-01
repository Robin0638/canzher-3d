const { app, BrowserWindow, Menu, protocol, net, session, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const APP_ROOT = path.join(__dirname, 'app');

// 用标准化的 app:// 协议承载游戏资源，保证页面内 XHR/fetch 能像 http 一样
// 加载本地 data/*.json（file:// 下会被 Chromium 拦截）
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true }
  }
]);

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 480,
    minHeight: 640,
    title: '餐这儿',
    backgroundColor: '#101018',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadURL('app://game/index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });

  // 页面内打开的外部链接交给系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('app://')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (process.argv.includes('--smoke-test')) {
    mainWindow.webContents.once('did-finish-load', async () => {
      try {
        const info = await mainWindow.webContents.executeJavaScript(
          'JSON.stringify({title: document.title, three: typeof THREE !== "undefined"})', true);
        console.log('[smoke] ' + info);
      } catch (e) {
        console.log('[smoke] error ' + e);
      }
      app.exit(0);
    });
  }
}

app.whenReady().then(() => {
  // manifest 里声明了 Camera（拍照菜谱等功能），媒体/全屏/指针锁定放行
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    callback(['media', 'fullscreen', 'pointerLock', 'clipboard-sanitized-write'].includes(permission));
  });

  protocol.handle('app', (request) => {
    try {
      const u = new URL(request.url);
      let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '');
      if (rel === '') rel = 'index.html';
      const abs = path.normalize(path.join(APP_ROOT, rel));
      if (abs !== APP_ROOT && !abs.startsWith(APP_ROOT + path.sep)) {
        return new Response('Not Found', { status: 404 });
      }
      return net.fetch(pathToFileURL(abs).toString());
    } catch (e) {
      return new Response('Bad Request', { status: 400 });
    }
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => app.quit());
