import React, { useState } from 'react';
import { Heart, Maximize2, Sparkles, Volume2, VolumeX, Zap } from 'lucide-react';
import { REALMS, SLACKING_META } from '../game/data';
import { locRealm, locSlacking, t } from '../game/i18n';
import { computeStats, useGameStore } from '../game/store';
import { FloatingText } from '../game/types';
import { BattleStage } from './BattleStage';
import { CultivatorAvatar } from './CultivatorAvatar';

interface Props {
  onExpand: () => void;
}

export const DesktopBarView: React.FC<Props> = ({ onExpand }) => {
  const state = useGameStore();
  const locale = state.locale ?? 'zh';
  const { realm, qiPerSec, maxHp } = computeStats(state);
  const realmLoc = locRealm(realm, locale);
  const slackLoc = locSlacking(state.slackingMode, SLACKING_META[state.slackingMode], locale);
  const [floats, setFloats] = useState<FloatingText[]>([]);

  const qiPct = Math.min(100, (state.qi / realm.qiRequired) * 100);
  const canBreak = state.qi >= realm.qiRequired && state.realmId < REALMS.length - 1;
  const needHeal = state.playerHp / maxHp < 0.45 && state.healPills > 0;

  const handleMeditate = () => {
    const gain = state.meditateClick();
    const id = `f_${Date.now()}_${Math.random()}`;
    setFloats((prev) => [...prev.slice(-4), { id, text: `+${gain}`, color: 'text-jade-600' }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 850);
  };

  return (
    <div className="w-full h-full p-2 flex items-center justify-center bg-transparent">
      <div
        style={{ opacity: state.barOpacity ?? 0.94 }}
        className="app-drag w-full h-full rounded-2xl bg-paper-50 backdrop-blur-md border border-paper-300/95 shadow-2xl px-3.5 py-2 flex items-center gap-3 relative overflow-hidden transition-opacity"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-jade-500/60 to-transparent" />

        {/* Left: Mini Cultivator + Qi Bar */}
        <div className="relative flex items-center gap-2 shrink-0">
          <CultivatorAvatar size="sm" isReadyBreakthrough={canBreak} onClick={handleMeditate} />
          {floats.map((f) => (
            <span
              key={f.id}
              className={`pointer-events-none absolute left-5 top-0 text-xs font-bold ${f.color} animate-float-up`}
            >
              {f.text}
            </span>
          ))}

          <div className="w-36">
            <div className="flex items-center justify-between gap-1">
              <span className="font-serif font-bold text-xs text-ink-900 truncate">{realmLoc.name}</span>
              <span className="text-[10px] text-jade-600 font-medium whitespace-nowrap">+{qiPerSec}/s</span>
            </div>
            <div className="mt-1.5 h-2 w-full rounded-full bg-paper-200 overflow-hidden border border-paper-300/60">
              <div
                className={`h-full transition-all duration-300 ${
                  canBreak ? 'bg-cinnabar-500 animate-pulse' : 'bg-jade-500'
                }`}
                style={{ width: `${qiPct}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-ink-500">
              <span>
                {Math.floor(state.qi)}/{realm.qiRequired}
              </span>
              {canBreak ? (
                <button
                  type="button"
                  onClick={() => state.attemptBreakthrough(state.breakPills > 0)}
                  className="app-no-drag px-1.5 py-0.5 rounded bg-cinnabar-600 text-paper-50 font-semibold hover:bg-cinnabar-500 transition flex items-center gap-0.5 whitespace-nowrap"
                >
                  <Zap className="w-2.5 h-2.5" /> {locale === 'zh' ? '渡劫' : 'Break'}
                </button>
              ) : (
                <span className="truncate">
                  {SLACKING_META[state.slackingMode].emoji} {slackLoc.short} · {state.stones}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live Compact Ink-Wash Battle Theater */}
        <div className="flex-1 min-w-0">
          <BattleStage compact />
        </div>

        {/* Right: Quick Controls — ALWAYS keep Expand visible! */}
        <div className="flex items-center gap-1.5 shrink-0 app-no-drag">
          {(needHeal || state.pendingEncounter) && (
            <div className="flex flex-col gap-1">
              {needHeal && (
                <button
                  type="button"
                  onClick={state.useHealPill}
                  className="px-2 py-1 rounded-lg bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50 animate-pulse transition flex items-center gap-1 text-[11px] font-bold shadow-sm whitespace-nowrap"
                >
                  <Heart className="w-3 h-3 fill-current" />
                  <span>{t(locale, 'healPillBtn', { n: state.healPills })}</span>
                </button>
              )}
              {state.pendingEncounter && (
                <button
                  type="button"
                  onClick={onExpand}
                  className="px-2 py-1 rounded-lg bg-gold-600 hover:bg-gold-500 text-paper-50 animate-pulse transition flex items-center gap-1 text-[11px] font-bold shadow-sm whitespace-nowrap"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{t(locale, 'encounterBtn')}</span>
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={onExpand}
              title={t(locale, 'expandBtn')}
              className="px-2.5 py-1.5 rounded-lg bg-ink-900 text-paper-50 hover:bg-ink-800 transition flex items-center gap-1 text-xs font-medium shadow-sm whitespace-nowrap"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{t(locale, 'expandBtn')}</span>
            </button>
            <button
              type="button"
              onClick={state.toggleMute}
              title={state.muted ? '开启音效' : '静音'}
              className="w-full py-1 rounded-lg bg-paper-200/80 hover:bg-paper-300/80 text-ink-700 flex items-center justify-center transition"
            >
              {state.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
