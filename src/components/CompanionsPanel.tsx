import React, { useState } from 'react';
import { Award, Gift, Heart, MessageCircle, Sparkles } from 'lucide-react';
import { ACHIEVEMENTS, CORE_NPCS, ENDINGS, PET_STAGE_NAMES, PETS } from '../game/data';
import { locAchievement, locNpc, locPet, t } from '../game/i18n';
import { computeStats, useGameStore } from '../game/store';

interface Props {
  onNotify: (msg: string) => void;
}

type SubTab = 'npcs' | 'pets' | 'reinc';

function getTimeSlot(): { key: 'morning' | 'noon' | 'afternoon' | 'night'; label: string } {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return { key: 'morning', label: '辰巳·上午' };
  if (h >= 11 && h < 14) return { key: 'noon', label: '午时·正午' };
  if (h >= 14 && h < 19) return { key: 'afternoon', label: '申酉·午后' };
  return { key: 'night', label: '亥子·夜深' };
}

export const CompanionsPanel: React.FC<Props> = ({ onNotify }) => {
  const state = useGameStore();
  const locale = state.locale ?? 'zh';
  const { activeBond, npcSummary } = computeStats(state);
  const [sub, setSub] = useState<SubTab>('npcs');
  const [npcReply, setNpcReply] = useState<string | null>(null);
  const slot = getTimeSlot();

  return (
    <div className="space-y-3">
      {/* Clean Sub-tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 bg-paper-200/70 p-1 rounded-xl border border-paper-300/70">
          {[
            { k: 'npcs' as SubTab, label: t(locale, 'subNpcs', { n: npcSummary.maxedCount }) },
            { k: 'pets' as SubTab, label: t(locale, 'subPets', { n: state.ownedPets.length, total: PETS.length }) },
            { k: 'reinc' as SubTab, label: t(locale, 'subReinc', { n: state.unlockedAchievements.length, total: ACHIEVEMENTS.length }) },
          ].map((item) => (
            <button
              key={item.k}
              type="button"
              onClick={() => setSub(item.k)}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold whitespace-nowrap transition ${
                sub === item.k ? 'bg-ink-900 text-paper-50 shadow-xs' : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-ink-500 font-serif">{slot.label}</span>
      </div>

      {/* 1. Core NPCs Sub-tab */}
      {sub === 'npcs' && (
        <div className="space-y-2.5">
          {/* Active Sect Companion Buff Summary Banner */}
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-gold-100/80 via-paper-100 to-paper-100 border border-gold-500/60">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-ink-900">
                <Award className="w-4 h-4 text-gold-600 shrink-0" />
                <span>{t(locale, 'npcBannerTitle')}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-600 font-bold">
                  {t(locale, 'npcMaxCount', { n: npcSummary.maxedCount })}
                </span>
              </div>
              <span className="text-[10px] text-ink-500">{t(locale, 'npcBannerHint')}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
              <span className={`px-2 py-0.5 rounded-md border ${npcSummary.atkPct > 0 ? 'bg-cinnabar-500/10 border-cinnabar-500/40 text-cinnabar-600 font-bold' : 'bg-paper-200/60 border-paper-300 text-ink-500'}`}>
                {locale === 'zh' ? '攻击' : 'ATK'} +{npcSummary.atkPct}%
              </span>
              <span className={`px-2 py-0.5 rounded-md border ${npcSummary.qiPct > 0 ? 'bg-jade-500/10 border-jade-500/40 text-jade-600 font-bold' : 'bg-paper-200/60 border-paper-300 text-ink-500'}`}>
                {locale === 'zh' ? '吐纳' : 'Qi'} +{npcSummary.qiPct}%
              </span>
              <span className={`px-2 py-0.5 rounded-md border ${npcSummary.crit > 0 ? 'bg-gold-500/15 border-gold-500/40 text-gold-600 font-bold' : 'bg-paper-200/60 border-paper-300 text-ink-500'}`}>
                {locale === 'zh' ? '会心' : 'Crit'} +{npcSummary.crit}%
              </span>
              <span className={`px-2 py-0.5 rounded-md border ${npcSummary.breakPct > 0 ? 'bg-jade-500/10 border-jade-500/40 text-jade-600 font-bold' : 'bg-paper-200/60 border-paper-300 text-ink-500'}`}>
                {locale === 'zh' ? '渡劫' : 'Break'} +{npcSummary.breakPct}%
              </span>
              <span className={`px-2 py-0.5 rounded-md border ${npcSummary.hpPct > 0 ? 'bg-jade-500/10 border-jade-500/40 text-jade-600 font-bold' : 'bg-paper-200/60 border-paper-300 text-ink-500'}`}>
                {locale === 'zh' ? '气血' : 'HP'} +{npcSummary.hpPct}%
              </span>
              <span className={`px-2 py-0.5 rounded-md border ${npcSummary.stonePct > 0 ? 'bg-gold-500/15 border-gold-500/40 text-gold-600 font-bold' : 'bg-paper-200/60 border-paper-300 text-ink-500'}`}>
                {locale === 'zh' ? '灵石' : 'Stones'} +{npcSummary.stonePct}%
              </span>
              {npcSummary.guAlchemyBonus > 0 && (
                <span className="px-2 py-0.5 rounded-md border bg-cinnabar-500/15 border-cinnabar-500/50 text-cinnabar-600 font-bold">
                  ✦ 炼丹双产 +25%
                </span>
              )}
              {npcSummary.suCombatHealPct > 0 && (
                <span className="px-2 py-0.5 rounded-md border bg-jade-500/15 border-jade-500/50 text-jade-600 font-bold">
                  ✦ 斩妖回血 +4%
                </span>
              )}
              {npcSummary.qianLuckBonus > 0 && (
                <span className="px-2 py-0.5 rounded-md border bg-gold-500/20 border-gold-500/60 text-gold-600 font-bold">
                  ✦ 掉宝福缘 +{npcSummary.qianLuckBonus}
                </span>
              )}
            </div>
          </div>

          {npcReply && (
            <div className="p-2.5 rounded-xl bg-gold-100/90 border border-gold-500/60 text-xs font-serif text-ink-900 shadow-xs">
              💬 {npcReply}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5">
            {CORE_NPCS.map((rawNpc) => {
              const npc = locNpc(rawNpc, locale);
              const st = state.npcs?.[npc.id] ?? { affinity: 10, unlockedSecret: false, claimedMaxGift: false, memories: [] };
              const currentActivity = npc.schedules[slot.key];
              const isMax = st.affinity >= 100;
              const is80 = st.affinity >= 80;
              const is40 = st.affinity >= 40;
              const canClaimKeepsake = isMax && !st.claimedMaxGift;

              return (
                <div
                  key={npc.id}
                  className={`p-3 rounded-xl border transition flex items-start gap-3 ${
                    isMax
                      ? 'bg-gradient-to-r from-gold-100/80 via-paper-100 to-paper-100 border-gold-500 shadow-sm'
                      : 'bg-paper-100/90 border-paper-300/90 hover:border-jade-500/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={`./portraits/${npc.id}.jpg`}
                      alt={npc.name}
                      className={`w-16 h-16 rounded-xl object-cover shadow-sm bg-paper-50 ${
                        isMax ? 'border-2 border-gold-500 ring-2 ring-gold-500/30' : 'border-2 border-paper-300'
                      }`}
                    />
                    {isMax && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-cinnabar-600 text-paper-50 text-[9px] font-serif font-bold whitespace-nowrap shadow-xs">
                        {locale === 'zh' ? '✦ 至交' : '✦ Max'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-serif font-bold text-sm text-ink-900">{npc.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-paper-200 text-ink-700">
                          {npc.title} · {npc.realm}
                        </span>
                        {isMax && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-500/20 border border-gold-500/50 text-gold-600 font-serif font-bold">
                            [{npc.maxTitle}]
                          </span>
                        )}
                        {!isMax &&
                          npc.personalities.map((p) => (
                            <span key={p} className="text-[10px] text-jade-600">
                              #{p}
                            </span>
                          ))}
                      </div>
                      <span
                        className={`text-xs font-bold shrink-0 ${
                          isMax ? 'text-gold-600' : 'text-cinnabar-600'
                        }`}
                      >
                        ♥ {st.affinity}/100{isMax ? (locale === 'zh' ? ' 圆满' : ' Max') : ''}
                      </span>
                    </div>

                    {/* Affinity Progress Bar */}
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-paper-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isMax ? 'bg-gradient-to-r from-cinnabar-500 to-gold-500' : 'bg-cinnabar-500'
                        }`}
                        style={{ width: `${Math.min(100, st.affinity)}%` }}
                      />
                    </div>

                    <div className="mt-1.5 text-[11px] text-ink-700">
                      <span className="text-ink-500">{locale === 'zh' ? '此刻动态：' : 'Now: '}</span>
                      {currentActivity}
                    </div>

                    {/* 3-Tier Structured Perks (40 / 80 / 100) */}
                    <div className="mt-1.5 grid grid-cols-1 gap-1 text-[10px]">
                      <div
                        className={`px-2 py-0.5 rounded flex items-center justify-between gap-2 ${
                          is40 ? 'bg-jade-500/10 text-jade-600 font-medium' : 'bg-paper-200/50 text-ink-500'
                        }`}
                      >
                        <span>
                          {locale === 'zh' ? '40 熟稔 · ' : '40 Friend · '}
                          {npc.perk40}
                        </span>
                        <span className="shrink-0">{is40 ? (locale === 'zh' ? '✓ 已生效' : '✓ Active') : locale === 'zh' ? '未解锁' : 'Locked'}</span>
                      </div>
                      <div
                        className={`px-2 py-0.5 rounded flex items-center justify-between gap-2 ${
                          is80 ? 'bg-gold-500/15 text-gold-600 font-medium' : 'bg-paper-200/50 text-ink-500'
                        }`}
                      >
                        <span>
                          {locale === 'zh' ? '80 知己 · ' : '80 Close · '}
                          {npc.perk80}
                        </span>
                        <span className="shrink-0">{is80 ? (locale === 'zh' ? '✓ 已生效' : '✓ Active') : locale === 'zh' ? '未解锁' : 'Locked'}</span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded flex items-center justify-between gap-2 border ${
                          isMax
                            ? 'bg-cinnabar-500/10 border-cinnabar-500/40 text-cinnabar-600 font-bold'
                            : 'bg-paper-200/50 border-transparent text-ink-500'
                        }`}
                      >
                        <span>
                          {locale === 'zh' ? `100 至交【${npc.maxTitle}】· ` : `100 Max [${npc.maxTitle}] · `}
                          {npc.perk100}
                        </span>
                        <span className="shrink-0">
                          {isMax ? (locale === 'zh' ? '✦ 已觉醒' : '✦ Awakened') : locale === 'zh' ? '满好感觉醒' : 'At 100'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1.5 text-[10px] px-2 py-1 rounded bg-paper-50/80 border border-paper-300/60 text-ink-700">
                      {st.unlockedSecret ? (
                        <span className="text-gold-600 font-medium">
                          {t(locale, 'npcSecretUnlocked')}
                          {npc.secret}
                        </span>
                      ) : (
                        <span className="text-ink-500">{t(locale, 'npcSecretLocked')}</span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const line = state.chatWithNpc(npc.id);
                          setNpcReply(line);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-paper-50 hover:bg-jade-100/70 border border-paper-300 text-ink-800 text-[11px] font-medium flex items-center gap-1 transition"
                      >
                        <MessageCircle className="w-3 h-3 text-jade-600" />
                        {isMax ? t(locale, 'npcChatMax') : t(locale, 'npcChat')}
                      </button>

                      {!isMax && (
                        <button
                          type="button"
                          disabled={state.stones < 25}
                          onClick={() => {
                            const res = state.giftNpc(npc.id);
                            onNotify(res.msg);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition ${
                            state.stones >= 25
                              ? 'bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50'
                              : 'bg-paper-200 text-ink-500 cursor-not-allowed'
                          }`}
                        >
                          <Gift className="w-3 h-3" /> {t(locale, 'npcGift')}
                        </button>
                      )}

                      {canClaimKeepsake && (
                        <button
                          type="button"
                          onClick={() => {
                            const res = state.claimNpcMaxGift(npc.id);
                            onNotify(res.msg);
                          }}
                          className="px-3 py-1 rounded-lg bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50 text-[11px] font-serif font-bold flex items-center gap-1 shadow-sm animate-pulse transition"
                        >
                          <Gift className="w-3.5 h-3.5" /> {t(locale, 'npcClaimKeepsake', { name: npc.keepsakeName })} ({npc.keepsakeRewardDesc})
                        </button>
                      )}

                      {isMax && st.claimedMaxGift && (
                        <span className="px-2.5 py-1 rounded-lg bg-gold-500/20 border border-gold-500/50 text-gold-600 text-[11px] font-serif font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {t(locale, 'npcKeptKeepsake', { name: npc.keepsakeName })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Living Pets Sub-tab */}
      {sub === 'pets' && (
        <div className="space-y-3">
          {activeBond && (
            <div className="px-3 py-2 rounded-xl bg-gold-100/90 border border-gold-500/70 flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
              <span className="font-serif font-bold text-ink-900">人宠流派羁绊激活【{activeBond.title}】</span>
              <span className="text-ink-700">{activeBond.desc}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5">
            {PETS.map((pet) => {
              const petLoc = locPet(pet, locale);
              const owned = state.ownedPets.includes(pet.id);
              const active = state.activePet === pet.id;
              const ps = state.petStates?.[pet.id];
              const branch = ps?.evolutionBranch ? pet.branches.find((b) => b.id === ps.evolutionBranch) : null;

              return (
                <div
                  key={pet.id}
                  className={`p-3 rounded-xl border transition ${
                    active ? 'bg-gold-100/75 border-gold-500 shadow-sm' : 'bg-paper-100/85 border-paper-300/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={`./portraits/pet_${pet.id}.jpg`}
                      alt={pet.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-gold-500/50 shrink-0 shadow-sm bg-paper-50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-serif font-bold text-sm text-ink-900">
                            {branch ? branch.name : petLoc.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-paper-200 text-ink-700">
                            {owned && ps ? PET_STAGE_NAMES[ps.stage] : petLoc.title}
                          </span>
                          <span className="text-[10px] text-jade-600">#{pet.personality}</span>
                          {owned && ps && (
                            <span className="text-[10px] text-cinnabar-600">
                              心情：{ps.mood} · ♥{ps.affinity}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const res = state.buyOrSelectPet(pet.id);
                            onNotify(res.msg);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition ${
                            active
                              ? 'bg-jade-600 text-paper-50'
                              : owned
                                ? 'bg-ink-900 hover:bg-ink-800 text-paper-50'
                                : state.stones >= pet.costStones
                                  ? 'bg-gold-600 hover:bg-gold-500 text-paper-50'
                                  : 'bg-paper-200 text-ink-500'
                          }`}
                        >
                          {active ? t(locale, 'petActive') : owned ? t(locale, 'petDeploy') : t(locale, 'petContract', { cost: pet.costStones })}
                        </button>
                      </div>

                      <p className="mt-1 text-[11px] text-ink-600">{petLoc.desc}</p>

                      {owned && ps && (
                        <>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-500">
                            <span>此刻动态：{ps.activity}</span>
                            <span>成长经验：{ps.exp}（满 80 成熟期可觉醒分支）</span>
                          </div>

                          {/* Interact Buttons */}
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => onNotify(state.petInteract(pet.id, 'pat').msg)}
                              className="px-2.5 py-1 rounded-lg bg-paper-50 hover:bg-jade-100/70 border border-paper-300 text-ink-800 text-[11px] font-medium flex items-center gap-1"
                            >
                              <Heart className="w-3 h-3 text-cinnabar-500" /> 抚摸 (+8成长)
                            </button>
                            <button
                              type="button"
                              disabled={state.herbs < 2}
                              onClick={() => onNotify(state.petInteract(pet.id, 'feed').msg)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                                state.herbs >= 2
                                  ? 'bg-jade-600 hover:bg-jade-500 text-paper-50'
                                  : 'bg-paper-200 text-ink-500 cursor-not-allowed'
                              }`}
                            >
                              投喂灵草×2 (+22成长)
                            </button>

                            {/* Branch Evolution Choices once Mature (stage >= 2) */}
                            {ps.stage >= 2 && !ps.evolutionBranch && (
                              <div className="flex items-center gap-1.5 ml-auto">
                                {pet.branches.map((br) => (
                                  <button
                                    key={br.id}
                                    type="button"
                                    onClick={() => onNotify(state.evolvePet(pet.id, br.id).msg)}
                                    title={br.bonusDesc}
                                    className="px-2 py-1 rounded-lg bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50 text-[10px] font-bold animate-pulse"
                                  >
                                    觉醒·{br.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Pet Memories */}
                          {ps.memories.length > 0 && (
                            <div className="mt-2 pt-1.5 border-t border-paper-300/60 text-[10px] text-ink-600 space-y-0.5">
                              <div className="font-serif font-bold text-ink-700">📖 成长记忆：</div>
                              {ps.memories.slice(0, 2).map((m, i) => (
                                <div key={i} className="truncate">
                                  · {m}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Reincarnation & Achievements Sub-tab */}
      {sub === 'reinc' && (
        <div className="space-y-3.5">
          <div className="p-3.5 rounded-xl bg-paper-100/90 border border-paper-300/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-sm text-ink-900">
                  轮回转世与五大飞升结局（第 {state.reincarnations + 1} 世 · 因果 +{state.reincarnations * 35}%）
                </h3>
                <p className="text-[10px] text-ink-500">
                  古盒连环传承：{state.storyChainStage}/3 幕
                  {state.storyChainStage >= 3 ? '（已觉醒仙帝传承 +25%！）' : '（触发奇遇推进）'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNotify(state.reincarnate().msg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold whitespace-nowrap shrink-0 transition ${
                  state.realmId >= 5
                    ? 'bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50 shadow-sm'
                    : 'bg-paper-200 text-ink-500'
                }`}
              >
                兵解转世（需金丹）
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {ENDINGS.map((end) => {
                const unlocked = state.unlockedEndings.includes(end.id);
                return (
                  <div
                    key={end.id}
                    title={end.desc}
                    className={`p-2 rounded-lg border text-center ${
                      unlocked
                        ? 'bg-gold-100/90 border-gold-500 text-gold-600 font-bold'
                        : 'bg-paper-200/45 border-paper-300/60 text-ink-500'
                    }`}
                  >
                    <div className="font-serif text-[11px]">{end.title}</div>
                    <div className="text-[9px] mt-0.5">{unlocked ? '已证道' : '未解锁'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {ACHIEVEMENTS.map((ach) => {
              const achLoc = locAchievement(ach, locale);
              const done = state.unlockedAchievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-2.5 rounded-xl border transition ${
                    done ? 'bg-gold-100/75 border-gold-500/60' : 'bg-paper-200/45 border-paper-300/60 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-xs text-ink-900">{achLoc.title}</span>
                    {done && <span className="text-[10px] font-bold text-gold-600">{locale === 'zh' ? '已达成' : 'Done'}</span>}
                  </div>
                  <div className="mt-1 text-[10px] text-ink-600">{achLoc.desc}</div>
                  <div className="mt-1 text-[10px] text-jade-600 font-medium flex flex-wrap gap-x-1">
                    <span className="whitespace-nowrap">奖：灵石+{ach.rewardStones}</span>
                    {ach.rewardPills && <span className="whitespace-nowrap">· 破境丹×{ach.rewardPills}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
