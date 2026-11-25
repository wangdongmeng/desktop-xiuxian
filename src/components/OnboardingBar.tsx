import React from 'react';
import { CheckCircle2, Compass } from 'lucide-react';
import { useGameStore } from '../game/store';

interface Props {
  onNotify: (msg: string) => void;
}

export const OnboardingBar: React.FC<Props> = ({ onNotify }) => {
  const state = useGameStore();
  const locale = state.locale ?? 'zh';
  const step = state.onboardingStep;

  if (step >= 5) return null;

  const hasEquip = Boolean(state.equipped.sword || state.equipped.talisman || state.equipped.robe);
  const steps =
    locale === 'zh'
      ? [
          { title: '仙途初试：斩杀 3 只妖兽（可点击战场弹指剑气）', done: state.totalKills >= 3, rewardText: '灵石 +40' },
          { title: '武装法宝：在【法宝】页穿戴任意一件法宝', done: hasEquip, rewardText: '回春丹 ×2' },
          { title: '破境问道：积满修为并成功突破至【炼气初期】', done: state.realmId >= 1, rewardText: '灵石 +80' },
          { title: '择定大道：在【流派炼丹】页选择五大本命流派之一', done: Boolean(state.daoPath), rewardText: '破境丹 ×1' },
          { title: '结交故人：去【故人灵宠】与任意宗门故人闲聊一次', done: Object.values(state.npcs ?? {}).some((n) => n.affinity > 10), rewardText: '灵石 +120' },
        ]
      : [
          { title: 'First Trial: Slay 3 demons (click arena for Sword Qi)', done: state.totalKills >= 3, rewardText: 'Stones +40' },
          { title: 'Equip Gear: Equip any artifact in the [Gear] tab', done: hasEquip, rewardText: 'Heal Pill ×2' },
          { title: 'Breakthrough: Gather Qi and ascend to [Qi Refining I]', done: state.realmId >= 1, rewardText: 'Stones +80' },
          { title: 'Choose Dao: Pick one of the Five Dao Paths in [Cave & Pills]', done: Boolean(state.daoPath), rewardText: 'Break Pill ×1' },
          { title: 'Sect Bonds: Chat with any companion in [Bonds]', done: Object.values(state.npcs ?? {}).some((n) => n.affinity > 10), rewardText: 'Stones +120' },
        ];

  const cur = steps[step];
  if (!cur) return null;

  return (
    <div className="px-3 py-2 rounded-xl bg-gold-100/85 border border-gold-500/60 flex items-center justify-between gap-2 text-xs shadow-xs">
      <div className="flex items-center gap-2 min-w-0">
        <Compass className="w-4 h-4 text-gold-600 shrink-0" />
        <span className="font-serif font-bold text-[11px] leading-snug text-ink-900">
          {locale === 'zh' ? `新手指引 (${step + 1}/5)：` : `Guide (${step + 1}/5): `}
          {cur.title}
        </span>
      </div>
      {cur.done ? (
        <button
          type="button"
          onClick={() => {
            const msg = state.claimOnboardingStep();
            if (msg) onNotify(msg);
          }}
          className="px-2.5 py-1 rounded-lg bg-jade-600 hover:bg-jade-500 text-paper-50 font-bold text-[11px] flex items-center gap-1 shrink-0 whitespace-nowrap animate-pulse shadow-xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {locale === 'zh' ? `领取 ${cur.rewardText}` : `Claim ${cur.rewardText}`}
        </button>
      ) : (
        <span className="text-[11px] text-gold-600 font-medium shrink-0 whitespace-nowrap">
          {locale === 'zh' ? `奖：${cur.rewardText}` : `Reward: ${cur.rewardText}`}
        </span>
      )}
    </div>
  );
};
