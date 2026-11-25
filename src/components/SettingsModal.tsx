import React, { useEffect, useState } from 'react';
import { Check, Copy, Download, FolderOpen, Globe, Music, RotateCcw, Settings, Upload, Volume2, X } from 'lucide-react';
import { t } from '../game/i18n';
import { BgmTrackKey, soundEngine } from '../game/sound';
import { steamBridge } from '../game/steam';
import { useGameStore } from '../game/store';

interface Props {
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const SettingsModal: React.FC<Props> = ({ onClose, onNotify }) => {
  const bgmVolume = useGameStore((s) => s.bgmVolume);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const barOpacity = useGameStore((s) => s.barOpacity);
  const locale = useGameStore((s) => s.locale ?? 'zh');
  const setAudioVolumes = useGameStore((s) => s.setAudioVolumes);
  const setBarOpacity = useGameStore((s) => s.setBarOpacity);
  const setLocale = useGameStore((s) => s.setLocale);
  const exportSaveString = useGameStore((s) => s.exportSaveString);
  const importSaveString = useGameStore((s) => s.importSaveString);
  const resetSave = useGameStore((s) => s.resetSave);

  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [trackMode, setTrackMode] = useState<BgmTrackKey | 'auto'>(soundEngine.getLockedTrack());
  const [steamInfo, setSteamInfo] = useState<{ connected: boolean; appId: number | null; playerName: string | null }>({
    connected: false,
    appId: null,
    playerName: null,
  });

  useEffect(() => {
    steamBridge.getStatus().then(setSteamInfo).catch(() => {});
  }, []);

  const handleCopySave = async () => {
    const str = exportSaveString();
    try {
      await navigator.clipboard.writeText(str);
      setCopied(true);
      onNotify('存档码已复制到剪贴板，可妥善备份！');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('复制失败，请手动保存');
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const res = importSaveString(importText.trim());
    onNotify(res.msg);
    if (res.ok) {
      setImportText('');
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-ink-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-paper-50 border-2 border-paper-300 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-paper-300/70 pb-3">
          <h3 className="font-serif font-bold text-base text-ink-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-jade-600" /> {t(locale, 'settingsTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-paper-200 text-ink-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-paper-300/50">
          <span className="font-serif font-bold text-xs text-ink-800 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-jade-600" /> {t(locale, 'langLabel')}
          </span>
          <div className="flex gap-1 bg-paper-200/80 p-0.5 rounded-lg border border-paper-300/70">
            {[
              { k: 'zh' as const, label: '简体中文' },
              { k: 'en' as const, label: 'English' },
            ].map((item) => (
              <button
                key={item.k}
                type="button"
                onClick={() => setLocale(item.k)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  locale === item.k
                    ? 'bg-ink-900 text-paper-50 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Sliders */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-serif font-bold text-ink-800 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-jade-600" /> {t(locale, 'bgmLabel')}
              </span>
              <span className="font-mono text-ink-600">{Math.round(bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={bgmVolume}
              onChange={(e) => setAudioVolumes(Number(e.target.value), sfxVolume)}
              className="w-full accent-jade-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-serif font-bold text-ink-800">{t(locale, 'sfxLabel')}</span>
              <span className="font-mono text-ink-600">{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={sfxVolume}
              onChange={(e) => setAudioVolumes(bgmVolume, Number(e.target.value))}
              className="w-full accent-jade-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-serif font-bold text-ink-800 flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-jade-600" /> {t(locale, 'trackLabel')}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { k: 'auto' as const, label: t(locale, 'trackAuto') },
                { k: 'idle' as const, label: t(locale, 'trackIdle') },
                { k: 'night' as const, label: t(locale, 'trackNight') },
                { k: 'boss' as const, label: t(locale, 'trackBoss') },
              ].map((item) => (
                <button
                  key={item.k}
                  type="button"
                  onClick={() => {
                    soundEngine.setLockedTrack(item.k);
                    setTrackMode(item.k);
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-medium border transition ${
                    trackMode === item.k
                      ? 'bg-ink-900 text-paper-50 border-ink-900'
                      : 'bg-paper-100 text-ink-700 border-paper-300 hover:border-jade-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-serif font-bold text-ink-800">{t(locale, 'opacityLabel')}</span>
              <span className="font-mono text-ink-600">{Math.round(barOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.55}
              max={1}
              step={0.05}
              value={barOpacity}
              onChange={(e) => setBarOpacity(Number(e.target.value))}
              className="w-full accent-gold-600"
            />
          </div>
        </div>

        {/* Save Export / Import */}
        <div className="pt-3 border-t border-paper-300/70 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-serif font-bold text-xs text-ink-800">{t(locale, 'saveTitle')}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {window.electronAPI?.openSaveFolder && (
                <button
                  type="button"
                  onClick={() => {
                    steamBridge.syncLocalSaveFile();
                    steamBridge.openSaveFolder();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 text-xs font-medium flex items-center gap-1 whitespace-nowrap transition"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> {t(locale, 'openFolder')}
                </button>
              )}
              <button
                type="button"
                onClick={handleCopySave}
                className="px-3 py-1 rounded-lg bg-ink-900 hover:bg-ink-800 text-paper-50 text-xs font-medium flex items-center gap-1 whitespace-nowrap transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-jade-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t(locale, 'copiedSave') : t(locale, 'exportSave')}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={t(locale, 'importPlaceholder')}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-paper-100 border border-paper-300 text-xs text-ink-800 focus:outline-none focus:border-jade-600"
            />
            <button
              type="button"
              onClick={handleImport}
              className="px-3 py-1.5 rounded-lg bg-jade-600 hover:bg-jade-500 text-paper-50 text-xs font-medium flex items-center gap-1 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" /> {t(locale, 'importBtn')}
            </button>
          </div>

          <div className="text-[10px] text-ink-500 flex items-center justify-between pt-1">
            <span>{t(locale, 'bossKeyHint')}</span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Download className="w-3 h-3" />
              {steamInfo.connected
                ? t(locale, 'steamConnected', { name: steamInfo.playerName ?? 'Steam' })
                : t(locale, 'localAutoSave')}
            </span>
          </div>

          {/* Safe Two-Step In-Game Reset */}
          <div className="pt-2.5 border-t border-paper-300/60 flex items-center justify-between gap-2">
            <span className="text-[11px] text-ink-600 font-serif">{t(locale, 'dangerReset')}</span>
            {confirmReset ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-700 text-[11px] font-medium whitespace-nowrap"
                >
                  {t(locale, 'cancelBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetSave();
                    setConfirmReset(false);
                    onNotify(locale === 'zh' ? '已重开一世仙途，万象更新！' : 'Save wiped. A new cultivation life begins!');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50 text-[11px] font-bold whitespace-nowrap"
                >
                  {t(locale, 'confirmResetBtn')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-2.5 py-1 rounded-lg bg-paper-100 hover:bg-cinnabar-500/10 border border-paper-300 hover:border-cinnabar-500/50 text-cinnabar-600 text-[11px] font-medium flex items-center gap-1 whitespace-nowrap transition"
              >
                <RotateCcw className="w-3 h-3" /> {t(locale, 'resetBtn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
