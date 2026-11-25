import React from 'react';
import { Sparkles } from 'lucide-react';
import { locEncounter, t } from '../game/i18n';
import { useGameStore } from '../game/store';
import { EncounterEvent } from '../game/types';

interface Props {
  encounter: EncounterEvent;
  onChoose: (idx: number) => void;
  onClose: () => void;
}

const TIER_BADGE = {
  common: { zh: '普通奇遇', en: 'Encounter', cls: 'bg-jade-100 text-jade-600 border-jade-500/40' },
  rare: { zh: '稀有奇遇', en: 'Rare Event', cls: 'bg-purple-100 text-purple-700 border-purple-400/50' },
  legendary: { zh: '传说奇遇', en: 'Legendary', cls: 'bg-gold-100 text-gold-600 border-gold-500/60' },
};

export const EncounterModal: React.FC<Props> = ({ encounter, onChoose, onClose }) => {
  const locale = useGameStore((s) => s.locale ?? 'zh');
  const ev = locEncounter(encounter, locale);
  const badge = TIER_BADGE[ev.tier] ?? TIER_BADGE.common;

  return (
    <div className="absolute inset-0 bg-ink-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-paper-50 border-2 border-gold-500/70 p-6 shadow-2xl relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className={`px-2 py-0.5 rounded text-xs font-serif font-bold border flex items-center gap-1 whitespace-nowrap shrink-0 ${badge.cls}`}>
              <Sparkles className="w-3 h-3" /> {badge[locale]}
            </span>
            <h3 className="font-serif font-bold text-base text-ink-900 leading-snug">{ev.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-ink-500 hover:text-ink-800 whitespace-nowrap shrink-0 pt-0.5"
          >
            {t(locale, 'laterBtn')}
          </button>
        </div>

        <p className="mt-4 text-sm text-ink-700 leading-relaxed font-serif bg-paper-100/90 p-3.5 rounded-xl border border-paper-300/70">
          {ev.story}
        </p>

        <div className="mt-5 space-y-2.5">
          {ev.choices.map((c, idx) => (
            <button
              key={c.label}
              type="button"
              onClick={() => onChoose(idx)}
              className="w-full text-left px-4 py-3 rounded-xl bg-paper-100 hover:bg-jade-100/70 border border-paper-300 hover:border-jade-600 transition flex items-center justify-between gap-2 group"
            >
              <span className="font-serif font-bold text-sm text-ink-900 group-hover:text-jade-600">
                {c.label}
              </span>
              <span className="text-xs text-ink-500 whitespace-nowrap shrink-0">{c.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
