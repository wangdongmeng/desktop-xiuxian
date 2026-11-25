const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  setMode: (mode) => ipcRenderer.invoke('window:set-mode', mode),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  hideToTray: () => ipcRenderer.invoke('window:hide-to-tray'),
  close: () => ipcRenderer.invoke('window:close'),
  toggleVisibility: () => ipcRenderer.invoke('window:toggle-visibility'),
  writeSaveFile: (jsonString) => ipcRenderer.invoke('save:write', jsonString),
  readSaveFile: () => ipcRenderer.invoke('save:read'),
  openSaveFolder: () => ipcRenderer.invoke('save:open-folder'),
  unlockSteamAchievement: (achId) => ipcRenderer.invoke('steam:unlock-achievement', achId),
  getSteamStatus: () => ipcRenderer.invoke('steam:status'),
});
