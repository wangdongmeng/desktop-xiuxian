// Steamworks & Local File Save Bridge
// Ready for steamworks.js integration once Steam AppID is assigned.

export const steamBridge = {
  unlockAchievement(achievementId: string) {
    if (typeof window !== 'undefined' && window.electronAPI?.unlockSteamAchievement) {
      window.electronAPI.unlockSteamAchievement(achievementId).catch(() => {});
    }
  },

  syncLocalSaveFile() {
    if (typeof window === 'undefined' || !window.electronAPI?.writeSaveFile) return;
    const raw = localStorage.getItem('desktop-xiuxian-save-v1');
    if (raw) {
      window.electronAPI.writeSaveFile(raw).catch(() => {});
    }
  },

  async openSaveFolder() {
    if (typeof window !== 'undefined' && window.electronAPI?.openSaveFolder) {
      return window.electronAPI.openSaveFolder();
    }
    return null;
  },

  async getStatus() {
    if (typeof window !== 'undefined' && window.electronAPI?.getSteamStatus) {
      try {
        return await window.electronAPI.getSteamStatus();
      } catch {
        return { connected: false, appId: null, playerName: null };
      }
    }
    return { connected: false, appId: null, playerName: null };
  },
};
