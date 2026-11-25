const { app, BrowserWindow, ipcMain, screen, globalShortcut, Tray, Menu, nativeImage, shell } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow = null;
let tray = null;
let currentMode = 'full';
let isQuitting = false;
let steamClient = null;
let steamAppId = null;

function resolveSteamAppId() {
  const candidates = [
    path.join(process.resourcesPath || '', 'steam_appid.txt'),
    path.join(__dirname, '../steam_appid.txt'),
  ];
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) {
        const parsed = parseInt(fs.readFileSync(p, 'utf-8').trim(), 10);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // ignore
    }
  }
  return 480;
}

function initSteamworks() {
  try {
    const steamworks = require('steamworks.js');
    const appId = resolveSteamAppId();
    steamAppId = appId;
    steamClient = steamworks.init(appId);
    if (typeof steamworks.electronEnableSteamOverlay === 'function') {
      steamworks.electronEnableSteamOverlay();
    }
    console.log(`[Steam] Connected (AppID: ${appId}, Player: ${steamClient.localplayer.getName()})`);
  } catch (err) {
    steamClient = null;
    console.log('[Steam] Standalone / offline mode:', err?.message || 'Steam client not running');
  }
}

const FULL_SIZE = { width: 1080, height: 690 };
const BAR_SIZE = { width: 760, height: 124 };

function getSaveDir() {
  const dir = path.join(app.getPath('userData'), 'saves');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getSaveFilePath() {
  return path.join(getSaveDir(), 'save.json');
}

function getWindowStatePath() {
  return path.join(app.getPath('userData'), 'window-state.json');
}

function loadWindowState() {
  try {
    const p = getWindowStatePath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch {
    // ignore corrupted window state
  }
  return {};
}

function saveWindowState(patch) {
  try {
    const cur = loadWindowState();
    fs.writeFileSync(getWindowStatePath(), JSON.stringify({ ...cur, ...patch }, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

function isPointVisibleOnAnyDisplay(x, y, width, height) {
  const displays = screen.getAllDisplays();
  return displays.some((d) => {
    const wa = d.workArea;
    return x + width > wa.x + 40 && x < wa.x + wa.width - 40 && y + height > wa.y + 20 && y < wa.y + wa.height - 20;
  });
}

function positionBarWindow(win) {
  const saved = loadWindowState();
  if (
    typeof saved.barX === 'number' &&
    typeof saved.barY === 'number' &&
    isPointVisibleOnAnyDisplay(saved.barX, saved.barY, BAR_SIZE.width, BAR_SIZE.height)
  ) {
    win.setBounds({ x: saved.barX, y: saved.barY, width: BAR_SIZE.width, height: BAR_SIZE.height }, true);
    return;
  }
  const display = screen.getPrimaryDisplay();
  const { x, y, width, height } = display.workArea;
  const barX = Math.round(x + (width - BAR_SIZE.width) / 2);
  const barY = Math.round(y + height - BAR_SIZE.height - 10);
  win.setBounds({ x: barX, y: barY, width: BAR_SIZE.width, height: BAR_SIZE.height }, true);
}

function positionFullWindow(win) {
  const display = screen.getPrimaryDisplay();
  const { x, y, width, height } = display.workArea;
  const fullX = Math.round(x + (width - FULL_SIZE.width) / 2);
  const fullY = Math.round(y + (height - FULL_SIZE.height) / 2);
  win.setBounds({ x: fullX, y: fullY, width: FULL_SIZE.width, height: FULL_SIZE.height }, true);
}

function switchWindowMode(mode) {
  if (!mainWindow) return currentMode;
  currentMode = mode === 'bar' ? 'bar' : 'full';
  if (currentMode === 'bar') {
    mainWindow.setAlwaysOnTop(true, process.platform === 'darwin' ? 'floating' : 'screen-saver');
    if (process.platform === 'darwin') {
      mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    }
    positionBarWindow(mainWindow);
  } else {
    mainWindow.setAlwaysOnTop(false);
    if (process.platform === 'darwin') {
      mainWindow.setVisibleOnAllWorkspaces(false);
    }
    positionFullWindow(mainWindow);
  }
  mainWindow.show();
  return currentMode;
}

function createTray() {
  const iconCandidate = path.join(__dirname, '../dist/app-icon.jpg');
  let icon = fs.existsSync(iconCandidate)
    ? nativeImage.createFromPath(iconCandidate).resize({ width: 18, height: 18 })
    : nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip('桌面修仙录 · 按 Cmd/Ctrl+Shift+X 快速隐身');
  if (process.platform === 'darwin') {
    tray.setTitle('仙');
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示 / 隐藏（老板键）',
      click: () => {
        if (!mainWindow) return;
        if (mainWindow.isVisible()) mainWindow.hide();
        else mainWindow.show();
      },
    },
    { type: 'separator' },
    {
      label: '打开存档目录 (Steam Cloud)',
      click: () => shell.openPath(getSaveDir()),
    },
    { type: 'separator' },
    {
      label: '退出《桌面修仙录》',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) mainWindow.focus();
    else mainWindow.show();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: FULL_SIZE.width,
    height: FULL_SIZE.height,
    transparent: true,
    frame: false,
    resizable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Remember Desktop Slacking Bar dragged position automatically!
  mainWindow.on('moved', () => {
    if (!mainWindow || currentMode !== 'bar') return;
    const [x, y] = mainWindow.getPosition();
    saveWindowState({ barX: x, barY: y });
  });

  mainWindow.on('close', (e) => {
    if (!isQuitting && process.platform === 'darwin') {
      // Allow clean close when clicking custom close button, handled via IPC
    }
    void e;
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.handle('window:set-mode', (_event, mode) => switchWindowMode(mode));

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:hide-to-tray', () => {
  mainWindow?.hide();
});

ipcMain.handle('window:close', () => {
  isQuitting = true;
  mainWindow?.close();
});

ipcMain.handle('window:toggle-visibility', () => {
  if (!mainWindow) return false;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
    return false;
  } else {
    mainWindow.show();
    return true;
  }
});

// Local file persistence + Steam Cloud sync
ipcMain.handle('save:write', (_event, jsonString) => {
  try {
    const filePath = getSaveFilePath();
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, `${filePath}.bak`);
    }
    fs.writeFileSync(filePath, jsonString, 'utf-8');
    if (steamClient?.cloud?.isEnabledForApp?.()) {
      try {
        steamClient.cloud.writeFile('save.json', jsonString);
      } catch {
        // ignore cloud transient error; local save already succeeded
      }
    }
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('save:read', () => {
  try {
    const filePath = getSaveFilePath();
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    if (steamClient?.cloud?.isEnabledForApp?.() && steamClient.cloud.fileExists?.('save.json')) {
      return steamClient.cloud.readFile('save.json');
    }
  } catch {
    // fallback
  }
  return null;
});

ipcMain.handle('save:open-folder', () => {
  shell.openPath(getSaveDir());
  return getSaveDir();
});

// Real Steamworks Achievement & Status Bridge
ipcMain.handle('steam:unlock-achievement', (_event, achId) => {
  if (!steamClient?.achievement) return false;
  try {
    return Boolean(steamClient.achievement.activate(achId));
  } catch {
    return false;
  }
});

ipcMain.handle('steam:status', () => {
  if (!steamClient) {
    return { connected: false, appId: steamAppId, playerName: null };
  }
  try {
    return {
      connected: true,
      appId: steamAppId,
      playerName: steamClient.localplayer.getName(),
    };
  } catch {
    return { connected: false, appId: steamAppId, playerName: null };
  }
});

app.whenReady().then(() => {
  initSteamworks();
  createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Shift+X', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else mainWindow?.show();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
