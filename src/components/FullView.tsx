import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  Backpack,
  Compass,
  Crown,
  FastForward,
  Flame,
  Gem,
  Hammer,
  Heart,
  Home,
  Leaf,
  Lock,
  Minimize2,
  PanelBottom,
  Pause,
  Play,
  Settings,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Unlock,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import {
  ACHIEVEMENTS,
  CRAFT_META,
  DAO_PATHS,
  ENDINGS,
  FISH_CODEX,
  PETS,
  RARITY_META,
  REALMS,
  ROUTE_META,
  SECRET_GROUNDS,
  SKILLS,
  SLACKING_META,
  SLOT_LABEL,
} from '../game/data';
import {
  locAffix,
  locArtifactName,
  locCraft,
  locDaoPath,
  locFish,
  locGround,
  locLogText,
  locOfflineStory,
  locPetQuip,
  locRarity,
  locRealm,
  locRoute,
  locSkill,
  locSlacking,
  locSlot,
  locToastMsg,
  t,
} from '../game/i18n';
import { computeStats, getUpgradeCost, isGroundUnlocked, useGameStore } from '../game/store';
import { CraftType, EquipSlot, ExploreRoute, FloatingText, GameSpeed, SlackingMode } from '../game/types';
import { BattleStage } from './BattleStage';
import { CompanionsPanel } from './CompanionsPanel';
import { CultivatorAvatar } from './CultivatorAvatar';
import { EncounterModal } from './EncounterModal';
import { IsometricCaveCanvas } from './IsometricCaveCanvas';
import { OnboardingBar } from './OnboardingBar';
import { SettingsModal } from './SettingsModal';
import { TribulationOverlay } from './TribulationOverlay';

interface Props {
  onSwitchToBar: () => void;
  onBackToTitle: () => void;
}

type TabKey = 'battle' | 'bag' | 'crafts' | 'cave' | 'pets';

export const FullView: React.FC<Props> = ({ onSwitchToBar, onBackToTitle }) => {
  const state = useGameStore();
  const locale = state.locale ?? 'zh';
  const { realm, qiPerSec, atk, maxHp, critChance, petBreakBonus } = computeStats(state);
  const realmLoc = locRealm(realm, locale);
  const lowHp = state.playerHp / maxHp < 0.45;

  const [tab, setTab] = useState<TabKey>('battle');
  const tabBodyRef = useRef<HTMLDivElement | null>(null);
  const [usePill, setUsePill] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [showEncounter, setShowEncounter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    tabBodyRef.current?.scrollTo({ top: 0 });
  }, [tab]);
  const [tribulation, setTribulation] = useState<{
    active: boolean;
    result: 'none' | 'success' | 'fail';
    targetRealmId: number;
  }>({
    active: false,
    result: 'none',
    targetRealmId: 0,
  });

  useEffect(() => {
    if (!state.recentAchievement) return;
    const t = setTimeout(() => state.dismissAchievement(), 4200);
    return () => clearTimeout(t);
  }, [state.recentAchievement, state.dismissAchievement]);

  const qiPct = Math.min(100, (state.qi / realm.qiRequired) * 100);
  const canBreak = state.qi >= realm.qiRequired && state.realmId < REALMS.length - 1;
  const breakRate = Math.min(
    99,
    Math.round(
      (realm.breakthroughRate + state.insightBonus + petBreakBonus + (usePill && state.breakPills > 0 ? 0.22 : 0)) *
        100
    )
  );

  const showToast = (msg: string) => {
    setToast(locToastMsg(msg, locale));
    setTimeout(() => setToast(null), 2600);
  };

  const handleMeditate = () => {
    const gain = state.meditateClick();
    const id = `f_${Date.now()}_${Math.random()}`;
    setFloats((prev) => [...prev.slice(-5), { id, text: `+${gain} 灵气`, color: 'text-jade-600' }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 850);
  };

  const handleBreakthrough = () => {
    const nextTarget = Math.min(REALMS.length - 1, state.realmId + 1);
    const res = state.attemptBreakthrough(usePill);
    setTribulation({ active: true, result: res.success ? 'success' : 'fail', targetRealmId: nextTarget });
  };

  const handleMelt = () => {
    const gained = state.meltTrash();
    showToast(gained > 0 ? `熔炼闲置法宝，获灵石 +${gained}` : '暂无可熔炼的凡/灵/玄品法宝');
  };

  const currentGround = SECRET_GROUNDS.find((g) => g.id === state.groundId) ?? SECRET_GROUNDS[0];

  return (
    <div className="w-full h-full p-2 bg-transparent">
      <div
        className="w-full h-full rounded-2xl overflow-hidden border border-paper-300 shadow-2xl flex flex-col relative bg-paper-100"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(251,249,245,0.74), rgba(245,240,230,0.9)), url('./ink-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <TribulationOverlay
          active={tribulation.active}
          result={tribulation.result}
          targetRealmId={tribulation.targetRealmId}
          activePet={state.activePet}
          onClose={() => setTribulation({ active: false, result: 'none', targetRealmId: state.realmId })}
        />

        {/* Top Title & Resource Bar */}
        <header className="app-drag h-14 px-4 flex items-center justify-between gap-2 border-b border-paper-300/80 bg-paper-50/85 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 shrink-0" title="老板键：Cmd+Shift+X（Windows: Ctrl+Shift+X）">
            <div className="w-7 h-7 rounded bg-cinnabar-600 text-paper-50 font-serif font-bold text-sm flex items-center justify-center shadow-sm shrink-0">
              仙
            </div>
            <div className="whitespace-nowrap">
              <h1 className="font-serif font-bold text-base tracking-wider text-ink-900 leading-tight">
                {t(locale, 'gameTitle')}
              </h1>
              <p className="text-[10px] text-ink-500">
                {t(locale, 'lifeSubtitle', { n: state.reincarnations + 1 })}
              </p>
            </div>
          </div>

          {/* Resources */}
          <div className="flex items-center gap-1.5 text-xs font-medium shrink-0">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-paper-100/90 border border-paper-300/70 whitespace-nowrap" title="灵石">
              <Gem className="w-3.5 h-3.5 text-gold-600 shrink-0" />
              <span className="font-bold text-gold-600">{state.stones}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-paper-100/90 border border-paper-300/70 whitespace-nowrap" title="灵草">
              <Leaf className="w-3.5 h-3.5 text-jade-600 shrink-0" />
              <span className="font-bold text-jade-600">{state.herbs}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-paper-100/90 border border-paper-300/70 whitespace-nowrap" title="玄铁矿">
              <Hammer className="w-3.5 h-3.5 text-ink-700 shrink-0" />
              <span className="font-bold text-ink-800">{state.ores}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-paper-100/90 border border-paper-300/70 whitespace-nowrap" title="破境丹">
              <Flame className="w-3.5 h-3.5 text-cinnabar-600 shrink-0" />
              <span className="font-bold text-cinnabar-600">{state.breakPills}</span>
            </div>
          </div>

          {/* Window Actions + Game Speed Controls */}
          <div className="flex items-center gap-1.5 app-no-drag shrink-0">
            <div className="flex items-center rounded-lg bg-paper-200/80 border border-paper-300/80 p-0.5 shrink-0">
              {([0, 1, 2] as GameSpeed[]).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => state.setGameSpeed(spd)}
                  title={spd === 0 ? '暂停' : spd === 1 ? '1倍速' : '2倍加速'}
                  className={`px-1.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-0.5 whitespace-nowrap transition ${
                    state.gameSpeed === spd
                      ? 'bg-ink-900 text-paper-50 shadow-xs'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  {spd === 0 ? <Pause className="w-3 h-3" /> : spd === 1 ? <Play className="w-3 h-3" /> : <FastForward className="w-3 h-3" />}
                  {spd > 0 && <span>{spd}x</span>}
                </button>
              ))}
            </div>

            {state.pendingEncounter && (
              <button
                type="button"
                onClick={() => setShowEncounter(true)}
                className="px-2.5 py-1.5 rounded-lg bg-gold-600 hover:bg-gold-500 text-paper-50 text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0 animate-pulse shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{t(locale, 'encounterBtn')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSwitchToBar}
              className="px-2.5 py-1.5 rounded-lg bg-jade-600 hover:bg-jade-500 text-paper-50 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm transition"
            >
              <PanelBottom className="w-3.5 h-3.5 shrink-0" />
              <span>{t(locale, 'barModeBtn')}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-lg hover:bg-paper-200 text-ink-700 transition"
              title="游戏设置、摸鱼条透明度与存档管理"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={state.toggleMute}
              className="p-1.5 rounded-lg hover:bg-paper-200 text-ink-700 transition"
              title={state.muted ? '开启音效' : '静音'}
            >
              {state.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onBackToTitle}
              className="p-1.5 rounded-lg hover:bg-paper-200 text-ink-700 transition"
              title="返回水墨封面"
            >
              <Home className="w-4 h-4" />
            </button>
            {window.electronAPI?.isElectron && (
              <>
                <button
                  type="button"
                  onClick={() => window.electronAPI?.minimize()}
                  className="p-1.5 rounded-lg hover:bg-paper-200 text-ink-700 transition"
                  title="最小化"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => window.electronAPI?.close()}
                  className="p-1.5 rounded-lg hover:bg-cinnabar-100 hover:text-cinnabar-600 text-ink-700 transition"
                  title="退出"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 min-h-0 p-4 grid grid-cols-12 gap-4">
          {/* Left Column: Cultivation & Stats */}
          <aside className="col-span-4 rounded-xl bg-paper-50/90 backdrop-blur-sm border border-paper-300/80 p-4 flex flex-col justify-between shadow-sm">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <div className="px-2.5 py-0.5 rounded-full bg-paper-200/80 border border-paper-300 text-[11px] font-serif text-ink-700">
                  {realmLoc.stage}
                </div>
                {state.daoPath && (
                  <div className="px-2 py-0.5 rounded-full bg-gold-100 border border-gold-500/50 text-[10px] font-serif font-bold text-gold-600">
                    {locDaoPath(DAO_PATHS.find((p) => p.id === state.daoPath) ?? DAO_PATHS[0], locale).name}
                  </div>
                )}
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold text-ink-900 tracking-wide">{realmLoc.name}</h2>

              {/* Pet Personality Quip Speech Bubble */}
              {state.petQuip && state.activePet && (
                <div className="mt-1 px-2.5 py-1 rounded-xl bg-paper-100 border border-paper-300 text-[10px] text-ink-700 font-serif text-center max-w-[230px] shadow-xs">
                  💬 {locPetQuip(state.petQuip, locale)}
                </div>
              )}

              <div className="relative my-1.5 flex items-center justify-center">
                <CultivatorAvatar size="lg" isReadyBreakthrough={canBreak} onClick={handleMeditate} />
                {floats.map((f) => (
                  <span
                    key={f.id}
                    className={`pointer-events-none absolute top-4 font-serif font-bold text-sm ${f.color} animate-float-up`}
                  >
                    {f.text}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-ink-500">
                {t(locale, 'curMode')}{SLACKING_META[state.slackingMode].emoji}{' '}
                {locSlacking(state.slackingMode, SLACKING_META[state.slackingMode], locale).name}
                {state.realmId >= 7 && state.cloneSlackingMode
                  ? `${t(locale, 'cloneTag')}${SLACKING_META[state.cloneSlackingMode].emoji}`
                  : ''}
              </p>

              {/* Qi Progress */}
              <div className="w-full mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-700 font-medium">{t(locale, 'curQi')}</span>
                  <span className="text-ink-500">
                    {Math.floor(state.qi)} / {realm.qiRequired}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-paper-200 overflow-hidden border border-paper-300/70">
                  <div
                    className={`h-full transition-all duration-300 ${
                      canBreak ? 'bg-cinnabar-500' : 'bg-jade-500'
                    }`}
                    style={{ width: `${qiPct}%` }}
                  />
                </div>
              </div>

              {/* Breakthrough Controls */}
              <div className="w-full mt-3 space-y-2">
                <button
                  type="button"
                  disabled={!canBreak}
                  onClick={handleBreakthrough}
                  className={`w-full py-2.5 rounded-xl font-serif font-bold text-sm flex items-center justify-center gap-1.5 transition shadow-sm ${
                    canBreak
                      ? 'bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50 cursor-pointer'
                      : 'bg-paper-200 text-ink-500 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {state.realmId >= REALMS.length - 1
                      ? t(locale, 'breakMax')
                      : canBreak
                        ? t(locale, 'breakReady', { rate: breakRate })
                        : t(locale, 'breakNotReady')}
                  </span>
                </button>

                <label className="flex items-center justify-between gap-1 text-xs text-ink-700 px-1 cursor-pointer">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={usePill}
                      onChange={(e) => setUsePill(e.target.checked)}
                      className="accent-cinnabar-600 shrink-0"
                    />
                    <span className="truncate">{t(locale, 'useBreakPill')}</span>
                  </span>
                  <span className="text-ink-500 whitespace-nowrap shrink-0">{t(locale, 'leftCount', { n: state.breakPills })}</span>
                </label>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-3 pt-3 border-t border-paper-300/70 grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2 rounded-lg bg-paper-100/90">
                <div className="text-[10px] text-ink-500 whitespace-nowrap">{t(locale, 'statQi')}</div>
                <div className="font-bold text-sm text-jade-600 whitespace-nowrap">+{qiPerSec}</div>
              </div>
              <div className="p-2 rounded-lg bg-paper-100/90">
                <div className="text-[10px] text-ink-500 whitespace-nowrap">{t(locale, 'statAtk')}</div>
                <div className="font-bold text-sm text-cinnabar-600 whitespace-nowrap">{atk}</div>
              </div>
              <div className="p-2 rounded-lg bg-paper-100/90">
                <div className="text-[10px] text-ink-500 whitespace-nowrap">{t(locale, 'statCrit')}</div>
                <div className="font-bold text-sm text-gold-600 whitespace-nowrap">{critChance}%</div>
              </div>
            </div>
          </aside>

          {/* Right Column: Tabs */}
          <main className="col-span-8 rounded-xl bg-paper-50/90 backdrop-blur-sm border border-paper-300/80 flex flex-col min-h-0 shadow-sm overflow-hidden">
            {/* Tab Bar */}
            <div className="flex items-center justify-between px-3 pt-2.5 border-b border-paper-300/70 shrink-0">
              <div className="flex gap-0.5">
                {[
                  { key: 'battle' as TabKey, label: t(locale, 'tabBattle'), icon: Swords },
                  { key: 'bag' as TabKey, label: t(locale, 'tabBag', { n: state.inventory.length }), icon: Backpack },
                  { key: 'crafts' as TabKey, label: t(locale, 'tabCrafts'), icon: Compass },
                  { key: 'cave' as TabKey, label: t(locale, 'tabCave'), icon: Flame },
                  { key: 'pets' as TabKey, label: t(locale, 'tabPets'), icon: Award },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`px-2 py-2 text-xs font-serif font-bold border-b-2 transition flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      tab === key
                        ? 'border-cinnabar-600 text-ink-900'
                        : 'border-transparent text-ink-500 hover:text-ink-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
              {state.recoverTimer > 0 && tab !== 'battle' && (
                <button
                  type="button"
                  onClick={() => setTab('battle')}
                  className="mb-1.5 px-2 py-0.5 rounded-full bg-cinnabar-100 border border-cinnabar-500/40 text-[10px] text-cinnabar-600 font-bold whitespace-nowrap shrink-0 animate-pulse"
                >
                  重伤调息 {Math.ceil(state.recoverTimer)}s
                </button>
              )}
            </div>

            {/* Tab Body */}
            <div ref={tabBodyRef} className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3">
              <OnboardingBar onNotify={showToast} />
              {tab === 'battle' && (
                <div className="space-y-3">
                  {/* Live 60fps Canvas Battle Stage */}
                  <BattleStage />

                  {/* Sword Intent Combo & Unrivaled Burst Bar */}
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-paper-100/90 border border-paper-300/80">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-serif font-bold text-ink-800">
                          {t(locale, 'swordIntentLabel')}
                        </span>
                        <span className="font-mono text-gold-600 font-bold whitespace-nowrap">
                          {state.burstTimer > 0 ? t(locale, 'burstActive', { s: Math.ceil(state.burstTimer) }) : `${state.swordIntent}%`}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-paper-200 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${
                            state.burstTimer > 0
                              ? 'bg-gradient-to-r from-cinnabar-500 via-gold-500 to-cinnabar-500 animate-pulse'
                              : state.swordIntent >= 100
                                ? 'bg-gold-500 animate-pulse'
                                : 'bg-jade-500'
                          }`}
                          style={{
                            width: `${state.burstTimer > 0 ? (state.burstTimer / 10) * 100 : state.swordIntent}%`,
                          }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={state.healPills <= 0 || state.playerHp >= maxHp}
                      onClick={() => {
                        if (state.useHealPill()) showToast('吞服回春丹，气血大复！');
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold shrink-0 flex items-center gap-1 transition ${
                        lowHp && state.healPills > 0
                          ? 'bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50 animate-pulse shadow-sm'
                          : state.healPills > 0 && state.playerHp < maxHp
                            ? 'bg-jade-600 hover:bg-jade-500 text-paper-50'
                            : 'bg-paper-200 text-ink-500 cursor-not-allowed'
                      }`}
                      title="瞬回 55% 最大气血（在洞府丹房可用灵草炼制）"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{t(locale, 'healPillBtn', { n: state.healPills })}</span>
                    </button>
                    <label className="text-[10px] text-ink-600 flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap" title="Auto-use Heal Pill below 42% HP">
                      <input
                        type="checkbox"
                        checked={state.autoHeal}
                        onChange={state.toggleAutoHeal}
                        className="accent-jade-600"
                      />
                      {t(locale, 'autoHeal')}
                    </label>
                    <button
                      type="button"
                      disabled={state.swordIntent < 100 || state.burstTimer > 0}
                      onClick={() => {
                        if (state.triggerBurst()) showToast(locale === 'zh' ? '人剑合一！10 秒攻速翻倍、剑剑暴击！' : 'Unrivaled Burst! 2x Speed & 100% Crit for 10s!');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold shrink-0 whitespace-nowrap transition ${
                        state.burstTimer > 0
                          ? 'bg-gold-500 text-paper-50 animate-pulse'
                          : state.swordIntent >= 100
                            ? 'bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50 shadow-sm cursor-pointer animate-bounce'
                            : 'bg-paper-200 text-ink-500 cursor-not-allowed'
                      }`}
                    >
                      {state.burstTimer > 0 ? t(locale, 'burstBtnActive') : t(locale, 'burstBtn')}
                    </button>
                  </div>

                  {/* Skills & Guardian Boss Row */}
                  <div className="rounded-xl bg-paper-100/90 border border-paper-300/80 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs text-ink-800">{t(locale, 'skillsTitle')}</span>
                        <label className="text-[11px] text-ink-500 flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={state.autoCastSkills}
                            onChange={state.toggleAutoCast}
                            className="accent-jade-600"
                          />
                          {t(locale, 'autoCast')}
                        </label>
                      </div>

                      {state.isBossFight || state.isTowerFight ? (
                        <button
                          type="button"
                          onClick={state.retreatBoss}
                          className="px-2.5 py-1 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 text-[11px] font-medium"
                        >
                          {t(locale, 'retreatBtn')}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={state.startTowerFight}
                            className="px-2.5 py-1 rounded-lg bg-gold-600 hover:bg-gold-500 text-paper-50 text-[11px] font-bold flex items-center gap-1 shadow-sm whitespace-nowrap transition"
                            title={`Floor ${state.towerFloor} (+${state.towerFloor * 3}% All Stats)`}
                          >
                            <Crown className="w-3 h-3" />
                            <span>{t(locale, 'towerBtn', { n: state.towerFloor + 1 })}</span>
                          </button>
                          <button
                            type="button"
                            onClick={state.startBossFight}
                            className="px-2.5 py-1 rounded-lg bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50 text-[11px] font-bold flex items-center gap-1 shadow-sm whitespace-nowrap transition"
                          >
                            <Skull className="w-3 h-3" />
                            <span>
                              {t(locale, 'bossBtn', {
                                name:
                                  locale === 'zh'
                                    ? currentGround.boss.name.replace('【妖王】', '').replace('【魔皇】', '')
                                    : `S${SECRET_GROUNDS.indexOf(currentGround) + 1}`,
                              })}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {SKILLS.map((sk) => {
                        const skLoc = locSkill(sk, locale);
                        const unlocked = state.unlockedSkills.includes(sk.id);
                        const cd = state.skillCooldowns[sk.id] ?? 0;
                        const ready = unlocked && cd <= 0;
                        return (
                          <button
                            key={sk.id}
                            type="button"
                            title={skLoc.desc}
                            onClick={() => {
                              if (!unlocked) {
                                const res = state.unlockSkill(sk.id);
                                showToast(res.msg);
                              } else {
                                state.castSkill(sk.id);
                              }
                            }}
                            className={`p-2 rounded-lg border text-left transition relative overflow-hidden ${
                              !unlocked
                                ? 'bg-paper-200/70 border-paper-300 text-ink-500 hover:border-gold-500'
                                : ready
                                  ? 'bg-paper-50 border-jade-600/70 hover:bg-jade-100/50 shadow-xs'
                                  : 'bg-paper-200/60 border-paper-300/70 text-ink-500'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-serif font-bold text-ink-900">
                              <span className="truncate">{skLoc.name}</span>
                              {unlocked && cd > 0 && (
                                <span className="text-[10px] font-mono text-cinnabar-600 shrink-0">{Math.ceil(cd)}s</span>
                              )}
                            </div>
                            <div className="mt-0.5 text-[10px] text-ink-500 truncate">
                              {unlocked
                                ? ready
                                  ? t(locale, 'skillClick')
                                  : t(locale, 'skillCd')
                                : t(locale, 'skillUnlock', { cost: sk.unlockCost })}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Secret Grounds Selector + 3 Explore Routes */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-serif font-bold text-ink-700 whitespace-nowrap">{t(locale, 'routeLabel')}</span>
                    <div className="flex items-center gap-1.5 flex-1">
                      {(['safe', 'danger', 'mystery'] as ExploreRoute[]).map((rk) => {
                        const rm = ROUTE_META[rk];
                        const rLoc = locRoute(rk, rm, locale);
                        const active = state.exploreRoute === rk;
                        return (
                          <button
                            key={rk}
                            type="button"
                            onClick={() => state.setExploreRoute(rk)}
                            title={rLoc.desc}
                            className={`flex-1 py-1 px-2 rounded-lg border text-[10px] font-medium whitespace-nowrap transition ${
                              active
                                ? 'bg-ink-900 text-paper-50 border-ink-900 shadow-xs'
                                : 'bg-paper-100/80 text-ink-700 border-paper-300 hover:border-jade-600'
                            }`}
                          >
                            {rm.emoji} {rLoc.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px] text-ink-600">
                    <span className="font-serif font-bold whitespace-nowrap">
                      {t(locale, 'stagesTitle', { n: state.bossesDefeated.length, total: SECRET_GROUNDS.length })}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <label className="text-[10px] text-ink-600 flex items-center gap-1 cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={state.autoNextStage}
                          onChange={state.toggleAutoNextStage}
                          className="accent-jade-600"
                        />
                        {t(locale, 'autoNextStage')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const unlockedList = SECRET_GROUNDS.filter((_, idx) =>
                            isGroundUnlocked(idx, state.realmId, state.bossesDefeated)
                          );
                          const latest = unlockedList[unlockedList.length - 1];
                          if (latest) {
                            state.selectGround(latest.id);
                            showToast(locale === 'zh' ? `已御剑直飞最高解锁关卡：${latest.name}` : `Jumped to highest stage!`);
                          }
                        }}
                        className="text-[10px] text-jade-600 hover:underline font-medium whitespace-nowrap"
                      >
                        {t(locale, 'jumpHighest')}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-0.5">
                    {SECRET_GROUNDS.map((g, idx) => {
                      const gLoc = locGround(g, idx, locale);
                      const prevCleared = idx === 0 || state.bossesDefeated.includes(SECRET_GROUNDS[idx - 1].id);
                      const realmOk = state.realmId >= g.minRealmId;
                      const unlocked = prevCleared && realmOk;
                      const active = state.groundId === g.id;
                      const cleared = state.bossesDefeated.includes(g.id);
                      const statusLabel = unlocked
                        ? active
                          ? t(locale, 'stageActive')
                          : cleared
                            ? t(locale, 'stageCleared')
                            : t(locale, 'stageGo')
                        : !prevCleared
                          ? t(locale, 'stageNeedPrev')
                          : t(locale, 'stageNeedRealm', { realm: locRealm(REALMS[g.minRealmId], locale).name });
                      return (
                        <button
                          key={g.id}
                          type="button"
                          disabled={!unlocked}
                          onClick={() => state.selectGround(g.id)}
                          className={`text-left p-2.5 rounded-xl border transition ${
                            active
                              ? 'bg-jade-100/75 border-jade-600 shadow-sm'
                              : unlocked
                                ? 'bg-paper-100/70 border-paper-300/80 hover:border-jade-500/50'
                                : 'bg-paper-200/50 border-paper-300/50 opacity-55 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-serif font-bold text-xs text-ink-900 truncate">
                              {gLoc.name} {cleared && <span className="text-gold-600">★</span>}
                            </span>
                            <span
                              className={`text-[10px] whitespace-nowrap shrink-0 ${
                                !unlocked
                                  ? 'text-ink-500'
                                  : active
                                    ? 'text-jade-600 font-bold'
                                    : cleared
                                      ? 'text-gold-600 font-medium'
                                      : 'text-ink-600'
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-ink-500 line-clamp-1">{gLoc.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Logs */}
                  <div className="rounded-xl bg-paper-100/80 border border-paper-300/70 p-2.5">
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1 text-[11px]">
                      {state.logs.map((log) => (
                        <div key={log.id} className="flex gap-2">
                          <span className="text-ink-500 font-mono text-[10px] shrink-0">{log.time}</span>
                          <span
                            className={
                              log.tone === 'epic'
                                ? 'text-gold-600 font-semibold'
                                : log.tone === 'breakthrough'
                                  ? 'text-cinnabar-600 font-bold'
                                  : log.tone === 'loot'
                                    ? 'text-jade-600 font-medium'
                                    : log.tone === 'warn'
                                      ? 'text-cinnabar-500'
                                      : 'text-ink-700'
                            }
                          >
                            {locLogText(log.text, locale)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'bag' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {(['sword', 'talisman', 'robe'] as EquipSlot[]).map((slot) => {
                      const item = state.equipped[slot];
                      const meta = item ? RARITY_META[item.rarity] : null;
                      const SlotIcon = slot === 'sword' ? Swords : slot === 'talisman' ? Sparkles : Shield;
                      return (
                        <div
                          key={slot}
                          className={`p-3 rounded-xl border ${
                            meta ? `${meta.bgClass} ${meta.borderClass}` : 'bg-paper-100/70 border-paper-300/70'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs text-ink-500">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <SlotIcon className="w-3.5 h-3.5 shrink-0" /> {locSlot(slot, SLOT_LABEL[slot], locale)}
                            </span>
                            {meta && <span className={`font-bold whitespace-nowrap ${meta.colorClass}`}>{locRarity(item!.rarity, meta.label, locale)}</span>}
                          </div>
                          {item ? (
                            <div className="mt-1.5">
                              <div className={`font-serif font-bold text-sm ${meta?.colorClass}`}>
                                {locArtifactName(item.name, locale)}
                              </div>
                              <div className="mt-1 text-[11px] text-ink-700 space-y-0.5">
                                <div>
                                  {locale === 'zh'
                                    ? `攻击 +${item.atkBonus} · 吐纳 +${item.qiRateBonus}%`
                                    : `ATK +${item.atkBonus} · Qi +${item.qiRateBonus}%`}
                                </div>
                                <div>{locale === 'zh' ? `会心 +${item.critBonus}%` : `Crit +${item.critBonus}%`}</div>
                                {item.affix && (
                                  <div
                                    className="mt-1 inline-block px-1.5 py-0.5 rounded bg-ink-900/90 text-gold-100 text-[10px] font-medium"
                                    title={locAffix(item.affix, locale).desc}
                                  >
                                    {locale === 'zh'
                                      ? `词条·${item.affix.name}`
                                      : `Affix: ${locAffix(item.affix, locale).name}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 text-xs text-ink-500">{t(locale, 'notEquipped')}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-ink-500">{t(locale, 'bagCount', { n: state.inventory.length })}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          state.autoEquipBest();
                          showToast(locale === 'zh' ? '已自动换上最强法宝' : 'Auto-equipped strongest gear!');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-jade-600 hover:bg-jade-500 text-paper-50 text-xs font-medium whitespace-nowrap transition"
                      >
                        {t(locale, 'autoEquipBtn')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const r = state.sellByRarity('common');
                          showToast(r.count > 0 ? `Sold ${r.count} (+${r.gained})` : locale === 'zh' ? '暂无凡品可售' : 'No Common gear to sell');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 text-xs font-medium whitespace-nowrap transition"
                      >
                        {t(locale, 'sellCommonBtn')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const r = state.sellByRarity('spirit');
                          showToast(r.count > 0 ? `Sold ${r.count} (+${r.gained})` : locale === 'zh' ? '暂无凡/灵品可售' : 'No ≤Spirit gear to sell');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 text-xs font-medium whitespace-nowrap transition"
                      >
                        {t(locale, 'sellSpiritBtn')}
                      </button>
                      <button
                        type="button"
                        onClick={handleMelt}
                        className="px-2.5 py-1.5 rounded-lg bg-gold-100 hover:bg-gold-500/30 text-gold-600 border border-gold-500/40 text-xs font-medium whitespace-nowrap transition"
                      >
                        {t(locale, 'sellAllTrashBtn')}
                      </button>
                    </div>
                  </div>

                  {state.inventory.length === 0 ? (
                    <div className="py-10 text-center text-xs text-ink-500">
                      行囊空空，待秘境斩妖或炼器炉锻造后法宝将收入囊中。
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5">
                      {state.inventory.map((item) => {
                        const meta = RARITY_META[item.rarity];
                        const sellPrice = meta.sellPrice + Math.round(item.power * 0.05);
                        return (
                          <div
                            key={item.id}
                            className={`text-left p-2.5 rounded-xl border ${meta.bgClass} ${meta.borderClass} flex flex-col justify-between gap-1.5`}
                          >
                            <div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className={`font-bold ${meta.colorClass}`}>{locRarity(item.rarity, meta.label, locale)}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-ink-500">{locSlot(item.slot, SLOT_LABEL[item.slot], locale)}</span>
                                  <button
                                    type="button"
                                    onClick={() => state.toggleLockItem(item.id)}
                                    title={item.locked ? 'Locked' : 'Lock'}
                                    className={`p-0.5 rounded transition ${
                                      item.locked
                                        ? 'text-gold-600 bg-gold-100/80'
                                        : 'text-ink-400 hover:text-ink-700'
                                    }`}
                                  >
                                    {item.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                              <div className="mt-0.5 font-serif font-bold text-sm text-ink-900 truncate">
                                {locArtifactName(item.name, locale)}
                              </div>
                              <div className="mt-1 text-[11px] text-ink-700 flex flex-wrap gap-x-1.5 gap-y-0.5">
                                <span className="whitespace-nowrap">{locale === 'zh' ? '攻' : 'ATK'}+{item.atkBonus}</span>
                                <span className="whitespace-nowrap">{locale === 'zh' ? '灵' : 'Qi'}+{item.qiRateBonus}%</span>
                                <span className="whitespace-nowrap">{locale === 'zh' ? '暴' : 'Crit'}+{item.critBonus}%</span>
                              </div>
                              {item.affix && (
                                <div
                                  className="mt-0.5 text-[10px] text-cinnabar-600 font-semibold truncate"
                                  title={locAffix(item.affix, locale).desc}
                                >
                                  ★ {locAffix(item.affix, locale).name}：{locAffix(item.affix, locale).desc}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1.5 pt-1 border-t border-paper-300/60">
                              <button
                                type="button"
                                onClick={() => state.equipItem(item.id)}
                                className="flex-1 py-1 rounded-lg bg-ink-900 hover:bg-ink-800 text-paper-50 text-[10px] font-medium whitespace-nowrap transition"
                              >
                                {t(locale, 'equipBtn')}
                              </button>
                              <button
                                type="button"
                                disabled={item.locked}
                                onClick={() => {
                                  const p = state.sellItem(item.id);
                                  if (p > 0) showToast(locale === 'zh' ? `售出【${item.name}】，灵石 +${p}` : `Sold for +${p} Stones`);
                                }}
                                className={`px-2 py-1 rounded-lg border text-[10px] font-bold whitespace-nowrap transition ${
                                  item.locked
                                    ? 'bg-paper-200/70 border-paper-300 text-ink-400 cursor-not-allowed'
                                    : 'bg-paper-50 hover:bg-gold-100 border-paper-300 text-gold-600'
                                }`}
                              >
                                {item.locked ? t(locale, 'lockedLabel') : t(locale, 'sellPriceBtn', { p: sellPrice })}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab === 'crafts' && (
                <div className="space-y-4">
                  {/* 6 Slacking Life Modes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif font-bold text-sm text-ink-900">
                        {t(locale, 'slackingHeader')}
                      </h3>
                      <span className="text-[11px] text-jade-600 font-medium">
                        {state.realmId >= 7 ? t(locale, 'cloneUnlocked') : t(locale, 'cloneLocked')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(SLACKING_META) as SlackingMode[]).map((mKey) => {
                        const m = SLACKING_META[mKey];
                        const mLoc = locSlacking(mKey, m, locale);
                        const active = state.slackingMode === mKey;
                        const isClone = state.cloneSlackingMode === mKey;
                        return (
                          <div
                            key={mKey}
                            className={`p-2.5 rounded-xl border transition ${
                              active
                                ? 'bg-jade-100/80 border-jade-600 shadow-sm'
                                : isClone
                                  ? 'bg-gold-100/75 border-gold-500'
                                  : 'bg-paper-100/85 border-paper-300/80'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-xs text-ink-900">
                                {m.emoji} {mLoc.name}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => state.setSlackingMode(mKey)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${
                                    active
                                      ? 'bg-jade-600 text-paper-50'
                                      : 'bg-paper-200 hover:bg-paper-300 text-ink-800'
                                  }`}
                                >
                                  {active ? t(locale, 'bodyActive') : t(locale, 'switchBtn')}
                                </button>
                                {state.realmId >= 7 && (
                                  <button
                                    type="button"
                                    onClick={() => state.setCloneSlackingMode(isClone ? null : mKey)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${
                                      isClone
                                        ? 'bg-gold-600 text-paper-50'
                                        : 'bg-paper-200 hover:bg-gold-100 text-ink-700'
                                    }`}
                                  >
                                    {isClone ? t(locale, 'cloneActive') : t(locale, 'cloneBtn')}
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="mt-1 text-[10px] text-ink-600 leading-snug">{mLoc.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sweeper Legacy + Fish Codex */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5 p-3 rounded-xl bg-paper-100/90 border border-paper-300/80">
                      <div className="flex items-center justify-between text-xs font-serif font-bold text-ink-900">
                        <span>{t(locale, 'sweeperTitle')}</span>
                        <span className="text-gold-600">{state.sweeperPoints}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-paper-200 overflow-hidden">
                        <div
                          className="h-full bg-gold-500 transition-all duration-300"
                          style={{ width: `${state.sweeperPoints}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[10px] text-ink-500">
                        {state.sweeperPoints >= 100 ? t(locale, 'sweeperDone') : t(locale, 'sweeperDesc')}
                      </p>

                      {/* Side Craft Compact Switch */}
                      <div className="mt-2.5 pt-2 border-t border-paper-300/60 space-y-1.5">
                        <div className="text-[10px] text-ink-600 font-medium">{t(locale, 'bgGather')}</div>
                        <div className="grid grid-cols-3 gap-1">
                          {(['fishing', 'herbalism', 'mining'] as CraftType[]).map((cKey) => (
                            <button
                              key={cKey}
                              type="button"
                              onClick={() => state.setActiveCraft(cKey)}
                              className={`py-1 px-1.5 rounded text-[10px] font-medium whitespace-nowrap text-center transition ${
                                state.activeCraft === cKey
                                  ? 'bg-ink-900 text-paper-50'
                                  : 'bg-paper-200 text-ink-700 hover:bg-paper-300'
                              }`}
                            >
                              {locCraft(cKey, CRAFT_META[cKey].title, locale)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-7 p-3 rounded-xl bg-paper-100/90 border border-paper-300/80">
                      <div className="flex items-center justify-between text-xs font-serif font-bold text-ink-900 mb-1.5">
                        <span>{t(locale, 'fishCodexTitle', { n: state.fishCodex.length, total: FISH_CODEX.length })}</span>
                        <span className="text-[10px] text-jade-600">{t(locale, 'fishBonus', { n: state.fishCodex.length * 3 })}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {FISH_CODEX.map((f) => {
                          const fLoc = locFish(f.id, f.name, f.desc, locale);
                          const got = state.fishCodex.includes(f.id);
                          const meta = RARITY_META[f.rarity];
                          return (
                            <div
                              key={f.id}
                              title={got ? fLoc.desc : locale === 'zh' ? '切换【灵溪垂钓】有几率钓得' : 'Switch to Jade Fishing to catch'}
                              className={`px-2 py-1 rounded-lg border text-[10px] truncate ${
                                got
                                  ? `${meta.bgClass} ${meta.borderClass} ${meta.colorClass} font-bold`
                                  : 'bg-paper-200/50 border-paper-300/50 text-ink-500'
                              }`}
                            >
                              {got ? fLoc.name : '???'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Artifact Forging Furnace */}
                  <div className="p-3.5 rounded-xl bg-paper-100/90 border border-paper-300/80 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-1.5">
                        <Hammer className="w-4 h-4 text-gold-600" /> {t(locale, 'forgeTitle')}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-ink-600">
                        {t(locale, 'forgeDesc', { ores: state.ores })}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={state.ores < 5 || state.stones < 60}
                      onClick={() => {
                        const res = state.forgeArtifact();
                        showToast(res.msg);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-serif font-bold shrink-0 whitespace-nowrap transition ${
                        state.ores >= 5 && state.stones >= 60
                          ? 'bg-gold-600 hover:bg-gold-500 text-paper-50 shadow-sm'
                          : 'bg-paper-200 text-ink-500 cursor-not-allowed'
                      }`}
                    >
                      {t(locale, 'forgeBtn')}
                    </button>
                  </div>
                </div>
              )}

              {tab === 'cave' && (
                <div className="space-y-4">
                  {/* 60fps 2.5D Isometric Living Cave Sanctuary with Day/Night Cycle */}
                  <IsometricCaveCanvas onNotify={showToast} />

                  {/* 5 Dao Paths Selection (3-col readable cards, full desc) */}
                  <div className="p-3.5 rounded-xl bg-paper-100/90 border border-paper-300/80">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-serif font-bold text-sm text-ink-900">{t(locale, 'daoPathsTitle')}</h3>
                      <span className="text-[11px] text-ink-500 whitespace-nowrap">
                        {state.realmId < 1
                          ? t(locale, 'daoLockedHint')
                          : state.daoPath
                            ? t(locale, 'daoSwitchHint')
                            : t(locale, 'daoFreeHint')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {DAO_PATHS.map((p) => {
                        const pLoc = locDaoPath(p, locale);
                        const active = state.daoPath === p.id;
                        const locked = state.realmId < 1;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              const res = state.chooseDaoPath(p.id);
                              showToast(res.msg);
                            }}
                            title={pLoc.desc}
                            className={`p-2.5 rounded-xl border text-left transition ${
                              active
                                ? 'bg-gold-100/90 border-gold-600 shadow-sm'
                                : locked
                                  ? 'bg-paper-200/50 border-paper-300/70 opacity-75 hover:border-paper-300'
                                  : 'bg-paper-50/90 border-paper-300/80 hover:border-jade-500'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-serif font-bold text-xs text-ink-900 whitespace-nowrap">{pLoc.name}</span>
                              <span className="text-[10px] text-cinnabar-600 font-medium whitespace-nowrap">
                                {active ? t(locale, 'daoChosen') : pLoc.tag}
                              </span>
                            </div>
                            <p className="mt-1 text-[10px] text-ink-600 leading-snug">{pLoc.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        type: 'array' as const,
                        name: locale === 'zh' ? '聚灵阵' : 'Spirit Array',
                        level: state.arrayLevel,
                        desc: locale === 'zh' ? '每重提升基础吐纳 +3.8/秒' : '+3.8 Base Qi/s per level',
                      },
                      {
                        type: 'sword' as const,
                        name: locale === 'zh' ? '剑意淬炼' : 'Sword Temper',
                        level: state.swordLevel,
                        desc: locale === 'zh' ? '每重提升御剑攻击 +6' : '+6 Base Sword ATK per level',
                      },
                      {
                        type: 'luck' as const,
                        name: locale === 'zh' ? '灵眼寻宝' : 'Treasure Eye',
                        level: state.luckLevel,
                        desc: locale === 'zh' ? '大幅提升玄品/仙品掉率' : 'Boosts Mystic & Immortal drop rate',
                      },
                    ].map((u) => {
                      const cost = getUpgradeCost(u.type, u.level);
                      const affordable = state.stones >= cost;
                      return (
                        <div
                          key={u.type}
                          className="p-3.5 rounded-xl bg-paper-100/90 border border-paper-300/80 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-sm text-ink-900">{u.name}</span>
                              <span className="text-xs font-bold text-jade-600">
                                {locale === 'zh' ? `${u.level} 重` : `Lv.${u.level}`}
                              </span>
                            </div>
                            <p className="mt-1.5 text-[11px] text-ink-500">{u.desc}</p>
                          </div>
                          <button
                            type="button"
                            disabled={!affordable}
                            onClick={() => state.upgradeCave(u.type)}
                            className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition ${
                              affordable
                                ? 'bg-ink-900 hover:bg-ink-800 text-paper-50'
                                : 'bg-paper-200 text-ink-500 cursor-not-allowed'
                            }`}
                          >
                            {t(locale, 'upgradeBtn', { cost })}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl bg-paper-100/90 border border-paper-300/80">
                    <h3 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cinnabar-600" /> {t(locale, 'alchemyTitle')}
                    </h3>
                    <div className="mt-3 grid grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-lg bg-paper-50 border border-paper-300/70 flex flex-col justify-between gap-2">
                        <div>
                          <div className="font-serif font-bold text-sm text-jade-600 whitespace-nowrap">{t(locale, 'craftHealTitle')}</div>
                          <div className="text-[11px] text-ink-500 whitespace-nowrap">{t(locale, 'craftHealDesc')}</div>
                          <div className="text-[11px] text-ink-500 mt-0.5 whitespace-nowrap">{t(locale, 'craftHealCost', { n: state.healPills })}</div>
                        </div>
                        <button
                          type="button"
                          disabled={state.herbs < 2}
                          onClick={() => {
                            if (state.craftPill('heal')) showToast(locale === 'zh' ? '成功炼成回春丹 ×3' : 'Brewed Heal Pill ×3!');
                          }}
                          className={`w-full py-1.5 rounded-lg text-xs font-medium ${
                            state.herbs >= 2
                              ? 'bg-jade-600 hover:bg-jade-500 text-paper-50'
                              : 'bg-paper-200 text-ink-500 cursor-not-allowed'
                          }`}
                        >
                          {t(locale, 'craftHealBtn')}
                        </button>
                      </div>

                      <div className="p-3 rounded-lg bg-paper-50 border border-paper-300/70 flex flex-col justify-between gap-2">
                        <div>
                          <div className="font-serif font-bold text-sm text-cinnabar-600 whitespace-nowrap">{t(locale, 'craftBreakTitle')}</div>
                          <div className="text-[11px] text-ink-500 whitespace-nowrap">{t(locale, 'craftBreakDesc')}</div>
                          <div className="text-[11px] text-ink-500 mt-0.5 whitespace-nowrap">{t(locale, 'craftBreakCost')}</div>
                        </div>
                        <button
                          type="button"
                          disabled={state.herbs < 5 || state.stones < 40}
                          onClick={() => {
                            if (state.craftPill('break')) showToast(locale === 'zh' ? '成功炼成破境丹 ×1' : 'Brewed Breakthrough Pill ×1!');
                          }}
                          className={`w-full py-1.5 rounded-lg text-xs font-medium ${
                            state.herbs >= 5 && state.stones >= 40
                              ? 'bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50'
                              : 'bg-paper-200 text-ink-500 cursor-not-allowed'
                          }`}
                        >
                          {t(locale, 'craftBreakBtn')}
                        </button>
                      </div>

                      <div className="p-3 rounded-lg bg-paper-50 border border-paper-300/70 flex flex-col justify-between gap-2">
                        <div>
                          <div className="font-serif font-bold text-sm text-gold-600 whitespace-nowrap">{t(locale, 'craftQiTitle')}</div>
                          <div className="text-[11px] text-ink-500 whitespace-nowrap">{t(locale, 'craftQiDesc')}</div>
                          <div className="text-[11px] text-ink-500 mt-0.5 whitespace-nowrap">{t(locale, 'craftQiCost')}</div>
                        </div>
                        <button
                          type="button"
                          disabled={state.herbs < 3}
                          onClick={() => {
                            if (state.craftPill('qi')) showToast(locale === 'zh' ? '服下凝气丹，修为大增！' : 'Drank Qi Elixir — Qi surged!');
                          }}
                          className={`w-full py-1.5 rounded-lg text-xs font-medium ${
                            state.herbs >= 3
                              ? 'bg-gold-600 hover:bg-gold-500 text-paper-50'
                              : 'bg-paper-200 text-ink-500 cursor-not-allowed'
                          }`}
                        >
                          {t(locale, 'craftQiBtn')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'pets' && <CompanionsPanel onNotify={showToast} />}
            </div>
          </main>
        </div>

        {/* Steam-style Achievement Unlocked Banner (Top-Right, never blocks bottom controls) */}
        {state.recentAchievement && (
          <button
            type="button"
            onClick={state.dismissAchievement}
            className="absolute top-16 right-5 z-50 px-4 py-3 rounded-xl bg-ink-900/95 border border-gold-500 text-left shadow-2xl flex items-center gap-3 hover:bg-ink-800 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gold-600 text-paper-50 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-gold-500 font-bold tracking-wider">{t(locale, 'achUnlocked')}</div>
              <div className="font-serif font-bold text-sm text-paper-50">{state.recentAchievement.title}</div>
              <div className="text-[11px] text-paper-200">{state.recentAchievement.rewardText}</div>
            </div>
          </button>
        )}

        {/* Toast Notification (Top-Center, pointer-events-none so it never blocks clicks) */}
        {toast && (
          <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-ink-900/90 text-paper-50 text-xs font-medium shadow-lg z-50 whitespace-nowrap">
            {toast}
          </div>
        )}

        {/* Stage Clear Celebration Modal */}
        {state.stageClearReport && (
          <div className="absolute inset-0 bg-ink-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="w-96 rounded-2xl bg-paper-50 border-2 border-gold-500 p-5 shadow-2xl text-center">
              <div className="inline-block px-3 py-0.5 rounded-full bg-gold-100 text-gold-600 text-xs font-serif font-bold border border-gold-500/50">
                {state.stageClearReport.firstClear ? t(locale, 'stageClearFirst') : t(locale, 'stageClearAgain')}
              </div>
              <h3 className="mt-2 font-serif font-bold text-xl text-ink-900">
                {t(locale, 'stageClearTitle', { name: state.stageClearReport.groundName })}
              </h3>
              <p className="mt-1 text-xs text-ink-600">
                {locale === 'zh'
                  ? `镇守妖王【${state.stageClearReport.bossName}】伏诛！`
                  : `Guardian Boss [${state.stageClearReport.bossName}] defeated!`}
              </p>

              <div className="mt-3 p-3 rounded-xl bg-paper-100/90 border border-paper-300/80 text-xs space-y-1">
                <div className="text-gold-600 font-bold">
                  {locale === 'zh'
                    ? `战利品：灵石 +${state.stageClearReport.stoneGain} · 破境丹 ×1`
                    : `Loot: Stones +${state.stageClearReport.stoneGain} · Breakthrough Pill ×1`}
                </div>
                <div className="text-jade-600 font-medium">
                  {locale === 'zh'
                    ? `斩获法宝：【${state.stageClearReport.dropName}】`
                    : `Artifact: [${state.stageClearReport.dropName}]`}
                </div>
              </div>

              {state.stageClearReport.nextGroundId ? (
                state.stageClearReport.nextNeedsRealm ? (
                  <div className="mt-3 px-3 py-2 rounded-xl bg-paper-200/70 border border-paper-300 text-[11px] text-ink-700">
                    {locale === 'zh' ? (
                      <>
                        已解锁前置！下一关【{state.stageClearReport.nextGroundName}】需突破至
                        <span className="font-bold text-cinnabar-600">【{state.stageClearReport.nextNeedsRealm}】</span>
                        方可踏入。
                      </>
                    ) : (
                      <>
                        Prerequisite cleared! Reach{' '}
                        <span className="font-bold text-cinnabar-600">[{state.stageClearReport.nextNeedsRealm}]</span> to enter next stage.
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 px-3 py-2 rounded-xl bg-jade-100/70 border border-jade-500/40 text-[11px] text-jade-600 font-medium">
                    {locale === 'zh'
                      ? `下一关【${state.stageClearReport.nextGroundName}】已开启，可继续破阵前行！`
                      : `Next stage unlocked! Ready to advance!`}
                  </div>
                )
              ) : (
                <div className="mt-3 px-3 py-2 rounded-xl bg-gold-100/80 border border-gold-500/50 text-[11px] text-gold-600 font-bold">
                  {locale === 'zh'
                    ? '✦ 恭喜道友！五十重秘境已全部破尽，威震诸天！'
                    : '✦ All 50 Secret Grounds conquered! You reign supreme!'}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {state.stageClearReport.nextGroundId && !state.stageClearReport.nextNeedsRealm && (
                  <button
                    type="button"
                    onClick={() => {
                      const res = state.advanceToNextStage();
                      if (res.msg) showToast(res.msg);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-cinnabar-600 hover:bg-cinnabar-500 text-paper-50 text-xs font-serif font-bold whitespace-nowrap shadow-sm transition"
                  >
                    {t(locale, 'stageClearNextBtn')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={state.dismissStageClear}
                  className="flex-1 py-2 px-3 rounded-xl bg-ink-900 hover:bg-ink-800 text-paper-50 text-xs font-medium whitespace-nowrap transition"
                >
                  {state.stageClearReport.nextGroundId ? t(locale, 'stageClearStayBtn') : t(locale, 'stageClearDoneBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Serious Injury / Defeat Modal (Only interrupts when actively on Battle tab) */}
        {state.defeatReport && tab === 'battle' && (
          <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="w-96 rounded-2xl bg-paper-50 border-2 border-cinnabar-600 p-5 shadow-2xl text-center">
              <div className="inline-block px-2.5 py-0.5 rounded bg-cinnabar-100 text-cinnabar-600 text-xs font-serif font-bold border border-cinnabar-500/40">
                {t(locale, 'defeatBadge')}
              </div>
              <h3 className="mt-2 font-serif font-bold text-lg text-ink-900">
                {locale === 'zh'
                  ? `不敌【${state.defeatReport.killer}】`
                  : 'Overwhelmed in Battle'}
              </h3>
              <p className="mt-2 text-xs text-ink-700 leading-relaxed">
                {locale === 'zh'
                  ? '道友气血耗尽重伤倒地，护体灵气溃散：'
                  : 'Your HP fell to zero and protective Qi dispersed:'}
              </p>
              <div className="mt-3 p-3 rounded-xl bg-cinnabar-100/60 border border-cinnabar-500/30 text-xs space-y-1">
                <div className="text-cinnabar-600 font-bold">
                  {locale === 'zh' ? '散失修为：' : 'Qi Lost: '}-{state.defeatReport.qiLost}
                </div>
                <div className="text-cinnabar-600 font-bold">
                  {locale === 'zh' ? '遗落灵石：' : 'Stones Lost: '}-{state.defeatReport.stonesLost}
                </div>
                {state.recoverTimer > 0 && (
                  <div className="text-ink-700 pt-1">
                    {locale === 'zh' ? '原地调息剩余：' : 'Recovery Time: '}
                    <span className="font-mono font-bold">{Math.ceil(state.recoverTimer)}s</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                {state.healPills > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      state.useHealPill();
                      showToast(locale === 'zh' ? '急服回春丹，立刻起身再战！' : 'Used Heal Pill — back in battle!');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-jade-600 hover:bg-jade-500 text-paper-50 text-xs font-bold whitespace-nowrap transition"
                  >
                    {t(locale, 'defeatHealBtn', { n: state.healPills })}
                  </button>
                )}
                <button
                  type="button"
                  onClick={state.dismissDefeatReport}
                  className="flex-1 py-2 px-3 rounded-xl bg-ink-900 hover:bg-ink-800 text-paper-50 text-xs font-medium whitespace-nowrap transition"
                >
                  {t(locale, 'defeatWaitBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings & Save Modal */}
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} onNotify={showToast} />
        )}

        {/* Encounter Modal */}
        {showEncounter && state.pendingEncounter && (
          <EncounterModal
            encounter={state.pendingEncounter}
            onChoose={(idx) => {
              const msg = state.resolveEncounter(idx);
              setShowEncounter(false);
              if (msg) showToast(msg);
            }}
            onClose={() => setShowEncounter(false)}
          />
        )}

        {/* Offline Earnings & Warm Sect Journal Modal */}
        {state.offlineReport && (
          <div className="absolute inset-0 bg-ink-900/45 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="w-96 rounded-2xl bg-paper-50 border-2 border-gold-500/60 p-5 shadow-2xl text-center">
              <h3 className="font-serif font-bold text-lg text-ink-900">{t(locale, 'offlineTitle')}</h3>
              <p className="mt-1.5 text-xs text-ink-700">
                {locale === 'zh'
                  ? `道友离线闭关 ${Math.floor(state.offlineReport.seconds / 60)} 分钟，洞府生机勃勃：`
                  : `You cultivated offline for ${Math.floor(state.offlineReport.seconds / 60)} min while your sanctuary thrived:`}
              </p>
              <div className="mt-3 p-3 rounded-xl bg-paper-100 text-sm flex justify-center gap-6">
                <div className="text-jade-600 font-bold">
                  {locale === 'zh' ? '修为' : 'Qi'} +{state.offlineReport.qiGain}
                </div>
                <div className="text-gold-600 font-bold">
                  {locale === 'zh' ? '灵石' : 'Stones'} +{state.offlineReport.stoneGain}
                </div>
              </div>
              {state.offlineReport.stories && state.offlineReport.stories.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-paper-100/80 border border-paper-300/70 text-left space-y-1.5 text-[11px] text-ink-700 font-serif">
                  {state.offlineReport.stories.map((line, i) => (
                    <div key={i}>· {locOfflineStory(line, locale)}</div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={state.dismissOfflineReport}
                className="mt-4 w-full py-2 rounded-xl bg-ink-900 text-paper-50 text-xs font-medium hover:bg-ink-800"
              >
                {t(locale, 'offlineClaim')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
