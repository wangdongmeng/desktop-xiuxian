import React from 'react';
import { Globe, PanelBottom, Play, Volume2, VolumeX, X } from 'lucide-react';
import { REALMS } from '../game/data';
import { locRealm, t } from '../game/i18n';
import { soundEngine } from '../game/sound';
import { useGameStore } from '../game/store';

interface Props {
  onStartFull: () => void;
  onStartBar: () => void;
}

export const TitleScreen: React.FC<Props> = ({ onStartFull, onStartBar }) => {
  const realmId = useGameStore((s) => s.realmId);
  const totalKills = useGameStore((s) => s.totalKills);
  const muted = useGameStore((s) => s.muted);
  const locale = useGameStore((s) => s.locale ?? 'zh');
  const toggleMute = useGameStore((s) => s.toggleMute);
  const setLocale = useGameStore((s) => s.setLocale);
  const hasProgress = realmId > 0 || totalKills > 0;
  const realmName = locRealm(REALMS[realmId] ?? REALMS[0], locale).name;

  return (
    <div className="w-full h-full p-2 bg-transparent">
      <div
        className="w-full h-full rounded-2xl overflow-hidden border border-paper-300 shadow-2xl relative flex flex-col justify-between bg-paper-100"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(248,244,236,0.92) 0%, rgba(248,244,236,0.55) 45%, rgba(248,244,236,0.08) 100%), url('./cover-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Draggable Strip */}
        <div className="app-drag h-12 px-5 flex items-center justify-between relative z-20">
          <span className="text-[11px] font-serif text-ink-500 tracking-widest">
            {t(locale, 'versionBadge')}
          </span>
          <div className="flex items-center gap-2 app-no-drag">
            <button
              type="button"
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              className="px-2.5 py-1 rounded-lg bg-paper-50/85 hover:bg-paper-50 text-ink-800 border border-paper-300/80 text-xs font-bold flex items-center gap-1 transition"
              title="Switch Language / 切换语言"
            >
              <Globe className="w-3.5 h-3.5 text-jade-600" />
              <span>{locale === 'zh' ? 'EN' : '中文'}</span>
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-paper-50/75 hover:bg-paper-50 text-ink-700 border border-paper-300/70 transition"
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {window.electronAPI?.isElectron && (
              <button
                type="button"
                onClick={() => window.electronAPI?.close()}
                className="p-1.5 rounded-lg bg-paper-50/75 hover:bg-cinnabar-100 hover:text-cinnabar-600 text-ink-700 border border-paper-300/70 transition"
                title="Quit"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Left Main Title & Menu Buttons */}
        <div className="relative z-20 px-14 my-auto max-w-lg">
          <div className="flex items-start gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-paper-50/80 border border-paper-300 text-[11px] text-ink-700 font-serif mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-jade-600" />
                {hasProgress ? t(locale, 'curRealmKills', { realm: realmName, kills: totalKills }) : t(locale, 'gameTagline')}
              </div>
              <h1 className={`font-serif font-bold text-ink-900 drop-shadow-sm ${locale === 'zh' ? 'text-5xl tracking-[0.16em]' : 'text-4xl tracking-wide'}`}>
                {t(locale, 'gameTitle')}
              </h1>
              <p className="mt-3 text-xs text-ink-700 leading-relaxed font-serif">
                {t(locale, 'titleDesc1')}<br />
                {t(locale, 'titleDesc2')}
              </p>
            </div>
            {/* Cinnabar Seal */}
            <div className="mt-8 w-8 h-8 rounded bg-cinnabar-600 text-paper-50 font-serif font-bold text-sm flex items-center justify-center shadow-md border border-cinnabar-500 shrink-0">
              {t(locale, 'sealChar')}
            </div>
          </div>

          <div className="mt-8 space-y-3 w-64 app-no-drag">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                soundEngine.startBgm();
                onStartFull();
              }}
              className="w-full py-3 px-5 rounded-xl bg-ink-900 hover:bg-ink-800 text-paper-50 font-serif font-bold text-base tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{hasProgress ? t(locale, 'continueGame') : t(locale, 'startNew')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                soundEngine.startBgm();
                onStartBar();
              }}
              className="w-full py-2.5 px-5 rounded-xl bg-paper-50/90 hover:bg-paper-50 text-jade-600 border border-jade-600/50 font-serif font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition"
            >
              <PanelBottom className="w-4 h-4" />
              <span>{t(locale, 'startBar')}</span>
            </button>
          </div>
        </div>

        {/* Bottom Subtle Footer */}
        <div className="relative z-20 px-6 py-3 flex items-center justify-between text-[11px]">
          <span className="px-2.5 py-0.5 rounded-full bg-paper-50/85 border border-paper-300/70 text-ink-800 shadow-xs">
            {t(locale, 'bossKeyHint')}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-paper-50/85 border border-paper-300/70 text-ink-800 font-serif shadow-xs">
            {t(locale, 'autoSaveHint')}
          </span>
        </div>

        {/* Soft Drifting Mist Overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper-100/70 to-transparent animate-mist-drift" />
      </div>
    </div>
  );
};
