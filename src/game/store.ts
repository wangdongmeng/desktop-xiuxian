import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ACHIEVEMENTS,
  BUILDINGS,
  CORE_NPCS,
  CRAFT_META,
  DAO_PATHS,
  DAO_PET_BONDS,
  ENCOUNTERS,
  ENDINGS,
  evaluateCaveGrid,
  FISH_CODEX,
  generateArtifact,
  getTowerMonster,
  PET_QUIPS,
  PET_STAGE_NAMES,
  PETS,
  RARITY_META,
  REALMS,
  ROUTE_META,
  SECRET_GROUNDS,
  SKILLS,
  SLACKING_META,
  STORY_CHAIN_EVENTS,
} from './data';
import { DEMO_MAX_REALM_ID, DEMO_MAX_STAGE_INDEX, isDemoLocked, verifyActivationCode } from './demo';
import { detectDefaultLocale, Locale } from './i18n';
import { soundEngine } from './sound';
import { steamBridge } from './steam';
import {
  ArtifactItem,
  BattleEvent,
  BattleLog,
  BuildingId,
  CraftType,
  DaoPathId,
  EncounterEvent,
  EnemyAttackEvent,
  EquipSlot,
  ExploreRoute,
  GameSpeed,
  HealEvent,
  MonsterDef,
  NpcState,
  PetId,
  PetState,
  SkillId,
  SlackingMode,
} from './types';

interface GameState {
  // Core progression
  realmId: number;
  qi: number;
  playerHp: number;
  stones: number;
  herbs: number;
  ores: number;
  breakPills: number;
  healPills: number;
  autoHeal: boolean;
  recoverTimer: number;
  insightBonus: number;
  totalKills: number;
  forgeCount: number;

  // Cave upgrades
  arrayLevel: number;
  swordLevel: number;
  luckLevel: number;

  // Skills
  unlockedSkills: SkillId[];
  skillCooldowns: Record<SkillId, number>;
  autoCastSkills: boolean;

  // Side Crafts & Slacking Life (摸鱼生活状态)
  activeCraft: CraftType;
  craftProgress: number;
  craftLevels: Record<CraftType, number>;
  slackingMode: SlackingMode;
  cloneSlackingMode: SlackingMode | null;
  daoPath: DaoPathId | null;
  fishCodex: string[];
  sweeperPoints: number;
  petQuip: string | null;

  // Pets & Core NPCs (v0.9 Living Companions)
  ownedPets: PetId[];
  activePet: PetId | null;
  petStates: Record<PetId, PetState>;
  npcs: Record<string, NpcState>;

  // Endless Demon-Sealing Tower (无尽锁妖塔)
  towerFloor: number; // highest cleared floor
  isTowerFight: boolean;

  // Achievements (仙途成就)
  unlockedAchievements: string[];
  recentAchievement: { id: string; title: string; rewardText: string } | null;

  // Encounters
  pendingEncounter: EncounterEvent | null;
  encounterTick: number;

  // Equipment & Bag
  equipped: Record<EquipSlot, ArtifactItem | null>;
  inventory: ArtifactItem[];
  recentDrop: ArtifactItem | null;

  // Combat & Boss state
  groundId: string;
  monsterIndex: number;
  monsterHp: number;
  monsterMaxHp: number;
  monsterAtk: number;
  monsterName: string;
  monsterKind: MonsterDef['kind'];
  isBossFight: boolean;
  bossTimer: number;
  bossesDefeated: string[];
  lastHitCrit: boolean;
  lastHitDamage: number;
  attackTick: number;
  enemyAttackCount: number;
  battleEvent: BattleEvent | null;
  enemyAttackEvent: EnemyAttackEvent | null;
  healEvent: HealEvent | null;

  // Sword Intent & Unrivaled Burst (人剑合一)
  swordIntent: number; // 0..100
  burstTimer: number;  // seconds remaining

  // Cave Grid (3x3), Speed, Route, Story Chain, Reincarnation (v0.8)
  gameSpeed: GameSpeed;
  exploreRoute: ExploreRoute;
  caveGrid: (BuildingId | null)[];
  storyChainStage: number; // 0..3
  reincarnations: number;
  unlockedEndings: string[];

  // Audio & Steam Demo Polish Settings (v1.2)
  muted: boolean;
  bgmVolume: number;
  sfxVolume: number;
  barOpacity: number;
  locale: Locale;
  onboardingStep: number;
  fullUnlocked: boolean;
  showUnlockModal: boolean;

  // Logs & meta
  logs: BattleLog[];
  lastSavedAt: number;
  autoNextStage: boolean;
  offlineReport: { seconds: number; qiGain: number; stoneGain: number; stories?: string[] } | null;
  defeatReport: { killer: string; qiLost: number; stonesLost: number } | null;
  stageClearReport: {
    groundId: string;
    groundName: string;
    bossName: string;
    firstClear: boolean;
    stoneGain: number;
    dropName: string;
    nextGroundId: string | null;
    nextGroundName: string | null;
    nextNeedsRealm: string | null;
  } | null;

  // Actions
  tick: () => void;
  meditateClick: () => number;
  manualSlash: () => void;
  triggerBurst: () => boolean;
  attemptBreakthrough: (usePill: boolean) => { success: boolean; message: string };
  selectGround: (groundId: string) => void;
  toggleAutoNextStage: () => void;
  dismissStageClear: () => void;
  advanceToNextStage: () => { ok: boolean; msg: string };
  startBossFight: () => void;
  startTowerFight: () => void;
  retreatBoss: () => void;
  unlockSkill: (id: SkillId) => { ok: boolean; msg: string };
  castSkill: (id: SkillId) => boolean;
  toggleAutoCast: () => void;
  setActiveCraft: (craft: CraftType) => void;
  setSlackingMode: (mode: SlackingMode) => void;
  setCloneSlackingMode: (mode: SlackingMode | null) => void;
  chooseDaoPath: (path: DaoPathId) => { ok: boolean; msg: string };
  setGameSpeed: (speed: GameSpeed) => void;
  setExploreRoute: (route: ExploreRoute) => void;
  buildInGrid: (cellIndex: number, buildingId: BuildingId) => { ok: boolean; msg: string };
  swapGridCells: (a: number, b: number) => void;
  reincarnate: () => { ok: boolean; msg: string };
  forgeArtifact: () => { ok: boolean; msg: string };
  buyOrSelectPet: (id: PetId) => { ok: boolean; msg: string };
  petInteract: (id: PetId, action: 'pat' | 'feed') => { ok: boolean; msg: string };
  evolvePet: (id: PetId, branchId: string) => { ok: boolean; msg: string };
  chatWithNpc: (id: string) => string;
  giftNpc: (id: string) => { ok: boolean; msg: string };
  claimNpcMaxGift: (id: string) => { ok: boolean; msg: string };
  resolveEncounter: (choiceIndex: number) => string;
  equipItem: (itemId: string) => void;
  toggleLockItem: (itemId: string) => void;
  sellItem: (itemId: string) => number;
  sellByRarity: (maxRarity: 'common' | 'spirit' | 'mystic') => { count: number; gained: number };
  autoEquipBest: () => void;
  meltTrash: () => number;
  upgradeCave: (type: 'array' | 'sword' | 'luck') => boolean;
  craftPill: (type: 'break' | 'qi' | 'heal') => boolean;
  useHealPill: () => boolean;
  toggleAutoHeal: () => void;
  toggleMute: () => void;
  setAudioVolumes: (bgm: number, sfx: number) => void;
  setBarOpacity: (opacity: number) => void;
  setLocale: (locale: Locale) => void;
  openUnlockModal: () => void;
  closeUnlockModal: () => void;
  activateFullEdition: (code: string) => { ok: boolean; msg: string };
  claimOnboardingStep: () => string;
  exportSaveString: () => string;
  importSaveString: (raw: string) => { ok: boolean; msg: string };
  dismissAchievement: () => void;
  dismissOfflineReport: () => void;
  dismissDefeatReport: () => void;
  resetSave: () => void;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

function makeLog(text: string, tone: BattleLog['tone'] = 'normal'): BattleLog {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text,
    tone,
    time: nowTime(),
  };
}

function makeDefaultPetStates(): Record<PetId, PetState> {
  return {
    fox: { affinity: 10, exp: 0, stage: 0, mood: '开心', activity: PETS[0].activities[0], evolutionBranch: null, memories: [] },
    turtle: { affinity: 10, exp: 0, stage: 0, mood: '平静', activity: PETS[1].activities[0], evolutionBranch: null, memories: [] },
    crane: { affinity: 10, exp: 0, stage: 0, mood: '傲娇', activity: PETS[2].activities[0], evolutionBranch: null, memories: [] },
    dragon: { affinity: 10, exp: 0, stage: 0, mood: '傲娇', activity: PETS[3].activities[0], evolutionBranch: null, memories: [] },
  };
}

function makeDefaultNpcs(): Record<string, NpcState> {
  const res: Record<string, NpcState> = {};
  CORE_NPCS.forEach((n) => {
    res[n.id] = { affinity: 10, unlockedSecret: false, memories: [`初识【${n.name}】(${n.title})`] };
  });
  return res;
}

export function computeStats(
  state: Pick<
    GameState,
    | 'realmId'
    | 'arrayLevel'
    | 'swordLevel'
    | 'equipped'
    | 'activePet'
    | 'petStates'
    | 'npcs'
    | 'towerFloor'
    | 'slackingMode'
    | 'cloneSlackingMode'
    | 'daoPath'
    | 'fishCodex'
    | 'sweeperPoints'
    | 'caveGrid'
    | 'storyChainStage'
    | 'reincarnations'
    | 'exploreRoute'
  >
) {
  const realm = REALMS[state.realmId] ?? REALMS[0];
  let equipAtk = 0;
  let equipQiPct = 0;
  let equipCrit = 0;
  const activeAffixes = new Set<string>();

  Object.values(state.equipped).forEach((item) => {
    if (item) {
      equipAtk += item.atkBonus;
      equipQiPct += item.qiRateBonus;
      equipCrit += item.critBonus;
      if (item.affix) activeAffixes.add(item.affix.id);
    }
  });

  const gridBonus = evaluateCaveGrid(state.caveGrid ?? []);
  const pet = state.activePet ? PETS.find((p) => p.id === state.activePet) : null;
  const petState = state.activePet ? state.petStates?.[state.activePet] : null;
  const petStageMult = 1 + (petState?.stage ?? 0) * 0.18;
  const petBranch =
    pet && petState?.evolutionBranch ? pet.branches.find((b) => b.id === petState.evolutionBranch) : null;
  const petMult = (state.daoPath === 'beast' ? 2 : 1) * (1 + gridBonus.petBonusPct / 100) * petStageMult;

  // Active Dao × Pet Combo Bond
  const activeBond =
    state.daoPath && state.activePet
      ? DAO_PET_BONDS.find((b) => b.daoPath === state.daoPath && b.petId === state.activePet) ?? null
      : null;

  // NPC Affinity Perks (40 / 80 / 100 Ultimate Bond)
  const npcAff = (id: string) => state.npcs?.[id]?.affinity ?? 0;
  const npcAtkPct =
    (npcAff('liu_qingshuang') >= 40 ? 12 : 0) +
    (npcAff('liu_qingshuang') >= 100 ? 20 : 0) +
    (npcAff('chen_elder') >= 80 ? 10 : 0) +
    (npcAff('chen_elder') >= 100 ? 18 : 0);
  const npcQiPct =
    (npcAff('su_linger') >= 40 ? 12 : 0) +
    (npcAff('su_linger') >= 100 ? 15 : 0) +
    (npcAff('gu_changsheng') >= 80 ? 10 : 0) +
    (npcAff('gu_changsheng') >= 100 ? 15 : 0);
  const npcCrit =
    (npcAff('liu_qingshuang') >= 80 ? 6 : 0) +
    (npcAff('liu_qingshuang') >= 100 ? 8 : 0) +
    (npcAff('qian_wanguan') >= 80 ? 5 : 0) +
    (npcAff('qian_wanguan') >= 100 ? 8 : 0);
  const npcBreak = (npcAff('chen_elder') >= 40 ? 0.06 : 0) + (npcAff('chen_elder') >= 100 ? 0.1 : 0);
  const npcHpPct = (npcAff('su_linger') >= 80 ? 15 : 0) + (npcAff('su_linger') >= 100 ? 25 : 0);
  const npcStonePct = (npcAff('qian_wanguan') >= 40 ? 18 : 0) + (npcAff('qian_wanguan') >= 100 ? 30 : 0);

  const npcSummary = {
    atkPct: npcAtkPct,
    qiPct: npcQiPct,
    crit: npcCrit,
    breakPct: Math.round(npcBreak * 100),
    hpPct: npcHpPct,
    stonePct: npcStonePct,
    maxedCount: CORE_NPCS.filter((n) => npcAff(n.id) >= 100).length,
    guAlchemyBonus: npcAff('gu_changsheng') >= 100 ? 0.25 : 0,
    suCombatHealPct: npcAff('su_linger') >= 100 ? 0.04 : 0,
    qianLuckBonus: npcAff('qian_wanguan') >= 100 ? 4 : 0,
  };

  const slackMult = state.daoPath === 'slacking' ? 1.55 : 1;
  const hasMode = (m: SlackingMode) => state.slackingMode === m || state.cloneSlackingMode === m;

  const towerMult = 1 + (state.towerFloor ?? 0) * 0.03;
  const fishBonus = (state.fishCodex?.length ?? 0) * 0.03;
  const sweeperMult = (state.sweeperPoints ?? 0) >= 100 ? 1.2 : 1;
  const storyMult = (state.storyChainStage ?? 0) >= 3 ? 1.25 : 1;
  const reincMult = 1 + (state.reincarnations ?? 0) * 0.35;
  const globalMult = towerMult * sweeperMult * storyMult * reincMult;

  const sleepBonus = hasMode('sleep') ? 0.35 * slackMult : 0;
  const spaAtkBonus = hasMode('spa') ? 0.15 * slackMult : 0;
  const spaCritBonus = hasMode('spa') ? Math.round(8 * slackMult) : 0;
  const swordPathAtk = state.daoPath === 'sword' ? 0.3 : 0;
  const swordPathCrit = state.daoPath === 'sword' ? 8 : 0;
  const bodyHpMult = state.daoPath === 'body' ? 1.6 : 1;
  const routeStoneBonus = state.exploreRoute === 'danger' ? 0.6 : 0;

  const qiPerSec = Number(
    (
      (realm.baseQiPerSec + state.arrayLevel * 3.8) *
      (1 +
        (equipQiPct +
          (pet?.qiPct ?? 0) * petMult +
          (petBranch?.qiPctBonus ?? 0) +
          (activeBond?.qiPct ?? 0) +
          npcQiPct +
          gridBonus.qiPct) /
          100 +
        sleepBonus +
        fishBonus) *
      globalMult
    ).toFixed(1)
  );
  const atk = Math.round(
    (realm.baseAtk + state.swordLevel * 6 + equipAtk) *
      (1 +
        ((pet?.atkPct ?? 0) * petMult +
          (petBranch?.atkPctBonus ?? 0) +
          (activeBond?.atkPct ?? 0) +
          npcAtkPct +
          gridBonus.atkPct) /
          100 +
        spaAtkBonus +
        swordPathAtk) *
      globalMult
  );
  const robeBonusHp = state.equipped.robe ? state.equipped.robe.power * 2.2 : 0;
  const maxHp = Math.round(
    (realm.baseHp + robeBonusHp) * (1 + (gridBonus.hpPct + npcHpPct) / 100) * globalMult * bodyHpMult
  );
  const critChance = Math.min(
    92,
    10 +
      equipCrit +
      Math.round((pet?.critBonus ?? 0) * petMult) +
      (petBranch?.critBonus ?? 0) +
      (activeBond?.critBonus ?? 0) +
      npcCrit +
      gridBonus.critBonus +
      spaCritBonus +
      swordPathCrit
  );
  const petBreakBonus = (pet?.breakBonus ?? 0) * petMult + npcBreak + gridBonus.breakBonus + (hasMode('tea') ? 0.05 : 0);
  const stoneMult =
    1 +
    ((pet?.stonePct ?? 0) * petMult + npcStonePct) / 100 +
    (activeAffixes.has('greed') ? 0.28 : 0) +
    fishBonus +
    routeStoneBonus;
  const qiKillMult = activeAffixes.has('qi_siphon') ? 1.3 : 1;

  return {
    realm,
    qiPerSec,
    atk,
    maxHp,
    critChance,
    petBreakBonus,
    stoneMult,
    qiKillMult,
    towerMult,
    activeAffixes,
    gridBonus,
    activeBond,
    npcSummary,
  };
}

export function getUpgradeCost(type: 'array' | 'sword' | 'luck', level: number) {
  const base = type === 'luck' ? 65 : 38;
  return Math.round(base * Math.pow(1.56, level));
}

export function isGroundUnlocked(groundIndex: number, realmId: number, bossesDefeated: string[]): boolean {
  const g = SECRET_GROUNDS[groundIndex];
  if (!g) return false;
  if (groundIndex === 0) return true;
  const prev = SECRET_GROUNDS[groundIndex - 1];
  return bossesDefeated.includes(prev.id) && realmId >= g.minRealmId;
}

const initialGround = SECRET_GROUNDS[0];
const initialMonster = initialGround.monsters[0];

const INITIAL_STATE = {
  realmId: 0,
  qi: 0,
  playerHp: REALMS[0].baseHp,
  stones: 30,
  herbs: 6,
  ores: 2,
  breakPills: 1,
  healPills: 3,
  autoHeal: true,
  recoverTimer: 0,
  insightBonus: 0,
  totalKills: 0,
  forgeCount: 0,
  arrayLevel: 0,
  swordLevel: 0,
  luckLevel: 0,
  unlockedSkills: ['qinglian'] as SkillId[],
  skillCooldowns: { qinglian: 0, thunder: 0, spirit_surge: 0, wanjian: 0 } as Record<SkillId, number>,
  autoCastSkills: true,
  activeCraft: 'fishing' as CraftType,
  craftProgress: 0,
  craftLevels: { fishing: 1, herbalism: 1, mining: 1 } as Record<CraftType, number>,
  slackingMode: 'sleep' as SlackingMode,
  cloneSlackingMode: null as SlackingMode | null,
  daoPath: null as DaoPathId | null,
  fishCodex: [] as string[],
  sweeperPoints: 0,
  petQuip: null as string | null,
  ownedPets: [] as PetId[],
  activePet: null as PetId | null,
  petStates: makeDefaultPetStates(),
  npcs: makeDefaultNpcs(),
  towerFloor: 0,
  isTowerFight: false,
  unlockedAchievements: [] as string[],
  recentAchievement: null as { id: string; title: string; rewardText: string } | null,
  pendingEncounter: null as EncounterEvent | null,
  encounterTick: 0,
  equipped: { sword: null, talisman: null, robe: null } as Record<EquipSlot, ArtifactItem | null>,
  inventory: [] as ArtifactItem[],
  recentDrop: null as ArtifactItem | null,
  groundId: initialGround.id,
  monsterIndex: 0,
  monsterHp: initialMonster.maxHp,
  monsterMaxHp: initialMonster.maxHp,
  monsterAtk: initialMonster.atk,
  monsterName: initialMonster.name,
  monsterKind: initialMonster.kind,
  isBossFight: false,
  bossTimer: 0,
  bossesDefeated: [] as string[],
  lastHitCrit: false,
  lastHitDamage: 0,
  attackTick: 0,
  enemyAttackCount: 0,
  battleEvent: null as BattleEvent | null,
  enemyAttackEvent: null as EnemyAttackEvent | null,
  healEvent: null as HealEvent | null,
  swordIntent: 0,
  burstTimer: 0,
  gameSpeed: 1 as GameSpeed,
  exploreRoute: 'safe' as ExploreRoute,
  caveGrid: [null, 'herb_field', null, null, 'spirit_array', null, null, null, null] as (BuildingId | null)[],
  storyChainStage: 0,
  reincarnations: 0,
  unlockedEndings: [] as string[],
  muted: false,
  bgmVolume: 0.35,
  sfxVolume: 0.7,
  barOpacity: 0.95,
  locale: detectDefaultLocale(),
  onboardingStep: 0,
  fullUnlocked: false,
  showUnlockModal: false,
  logs: [makeLog('道友初入仙途，端坐青云山下吐纳灵气。', 'normal')],
  lastSavedAt: Date.now(),
  autoNextStage: false,
  offlineReport: null,
  defeatReport: null,
  stageClearReport: null,
};

function evaluateAchievements(s: GameState): Partial<GameState> | null {
  const hasImmortal =
    s.inventory.some((i) => i.rarity === 'immortal') ||
    Object.values(s.equipped).some((i) => i?.rarity === 'immortal');

  const checks: Record<string, boolean> = {
    first_kill: s.totalKills >= 1,
    kill_50: s.totalKills >= 50,
    kill_300: s.totalKills >= 300,
    realm_zhuji: s.realmId >= 3,
    realm_jindan: s.realmId >= 5,
    first_immortal: hasImmortal,
    first_boss: s.bossesDefeated.length >= 1,
    tower_5: s.towerFloor >= 5,
    tower_15: s.towerFloor >= 15,
    first_pet: s.ownedPets.length >= 1,
    fish_5: (s.fishCodex?.length ?? 0) >= 5,
    sweeper_master: (s.sweeperPoints ?? 0) >= 100,
  };

  let addedStones = 0;
  let addedPills = 0;
  const newlyUnlocked: string[] = [];
  let latestPopup: GameState['recentAchievement'] = null;
  let extraLogs: BattleLog[] = [];

  ACHIEVEMENTS.forEach((ach) => {
    if (!s.unlockedAchievements.includes(ach.id) && checks[ach.id]) {
      newlyUnlocked.push(ach.id);
      steamBridge.unlockAchievement(ach.id);
      addedStones += ach.rewardStones;
      addedPills += ach.rewardPills ?? 0;
      const rewardText = `灵石+${ach.rewardStones}${ach.rewardPills ? ` 破境丹×${ach.rewardPills}` : ''}`;
      latestPopup = { id: ach.id, title: ach.title, rewardText };
      extraLogs.unshift(makeLog(`解锁仙途成就【${ach.title}】！获${rewardText}`, 'epic'));
    }
  });

  if (newlyUnlocked.length === 0) return null;
  soundEngine.playEpicLoot();
  return {
    unlockedAchievements: [...s.unlockedAchievements, ...newlyUnlocked],
    stones: s.stones + addedStones,
    breakPills: s.breakPills + addedPills,
    recentAchievement: latestPopup,
    logs: [...extraLogs, ...s.logs].slice(0, 40),
  };
}

function applyDamageToCurrentTarget(
  s: GameState,
  baseDmg: number,
  baseCrit: boolean,
  skillId?: SkillId,
  isManual = false
): Partial<GameState> {
  const { realm, maxHp, stoneMult, qiKillMult, activeAffixes, npcSummary } = computeStats(s);
  const effectiveLuck = s.luckLevel + npcSummary.qianLuckBonus;
  const inBurst = s.burstTimer > 0;
  const isCrit = inBurst ? true : baseCrit;

  let dmg = Math.round(baseDmg * (inBurst ? 1.45 : 1));
  if ((s.isBossFight || s.isTowerFight) && activeAffixes.has('boss_slayer')) {
    dmg = Math.round(dmg * 1.35);
  }

  let lightningProc = false;
  if (activeAffixes.has('lightning_proc') && Math.random() < 0.22) {
    lightningProc = true;
    dmg = Math.round(dmg * 1.65);
  }

  let isDouble = false;
  if (!isManual && activeAffixes.has('double_strike') && Math.random() < 0.25) {
    isDouble = true;
    dmg = Math.round(dmg * 1.75);
  }

  const nextSwordIntent = inBurst ? s.swordIntent : Math.min(100, s.swordIntent + (isManual ? 9 : 8));

  let nextQi = s.qi;
  let nextStones = s.stones;
  let nextHerbs = s.herbs;
  let nextPills = s.breakPills;
  let nextInventory = s.inventory;
  let nextRecentDrop = s.recentDrop;
  let nextLogs = s.logs;
  let nextKills = s.totalKills;
  let nextMonsterHp = Math.max(0, s.monsterHp - dmg);
  let nextMonsterMaxHp = s.monsterMaxHp;
  let nextMonsterAtk = s.monsterAtk;
  let nextMonsterIndex = s.monsterIndex;
  let nextMonsterName = s.monsterName;
  let nextMonsterKind = s.monsterKind;
  let nextIsBoss = s.isBossFight;
  let nextIsTower = s.isTowerFight;
  let nextTowerFloor = s.towerFloor;
  let nextBossTimer = s.bossTimer;
  let nextBossesDefeated = s.bossesDefeated;
  let nextGroundId = s.groundId;
  let nextStageClearReport = s.stageClearReport;

  let killed = false;
  let lootRarity: ArtifactItem['rarity'] | undefined;
  let lootName: string | undefined;

  soundEngine.playSwordHit(isCrit || lightningProc);

  if (nextMonsterHp <= 0) {
    killed = true;
    nextKills += 1;

    if (s.isTowerFight) {
      const clearedFloor = s.towerFloor + 1;
      const target = getTowerMonster(clearedFloor);
      const stoneGain = Math.max(1, Math.round(target.stoneReward * 0.45 * stoneMult));
      const qiGain = Math.max(1, Math.round(target.qiReward * 0.18 * qiKillMult));
      nextTowerFloor = clearedFloor;
      nextStones += stoneGain;
      nextQi = Math.min(realm.qiRequired, nextQi + qiGain);

      if (clearedFloor % 5 === 0) {
        nextPills += 1;
        const drop = generateArtifact(s.realmId + 1, effectiveLuck + 3, 'mystic');
        nextInventory = [drop, ...s.inventory].slice(0, 36);
        nextRecentDrop = drop;
        lootRarity = drop.rarity;
        lootName = drop.name;
        soundEngine.playEpicLoot();
        nextLogs = [
          makeLog(
            `通关锁妖塔第 ${clearedFloor} 层！全属性永久+3%，获破境丹×1、${RARITY_META[drop.rarity].label}【${drop.name}】！`,
            'breakthrough'
          ),
          ...nextLogs,
        ].slice(0, 40);
      } else {
        nextLogs = [
          makeLog(`破除锁妖塔第 ${clearedFloor} 层！全属性永久+3%，灵石+${stoneGain}。`, 'loot'),
          ...nextLogs,
        ].slice(0, 40);
      }

      const nextF = getTowerMonster(clearedFloor + 1);
      nextMonsterName = nextF.name;
      nextMonsterKind = nextF.kind;
      nextMonsterHp = nextF.maxHp;
      nextMonsterMaxHp = nextF.maxHp;
      nextMonsterAtk = nextF.atk;
      nextBossTimer = 25;
    } else {
      const ground = SECRET_GROUNDS.find((g) => g.id === s.groundId) ?? SECRET_GROUNDS[0];
      const target: MonsterDef = s.isBossFight
        ? ground.boss
        : ground.monsters[s.monsterIndex] ?? ground.monsters[0];

      const stoneGain = Math.max(1, Math.round(target.stoneReward * 0.45 * stoneMult));
      const qiGain = Math.max(1, Math.round(target.qiReward * 0.18 * qiKillMult));
      nextStones += stoneGain;
      nextQi = Math.min(realm.qiRequired, nextQi + qiGain);

      if (s.isBossFight) {
        nextPills += 1;
        const firstClear = !nextBossesDefeated.includes(ground.id);
        if (firstClear) {
          nextBossesDefeated = [...nextBossesDefeated, ground.id];
        }
        const drop = generateArtifact(s.realmId + 1, effectiveLuck + 3, 'mystic');
        nextInventory = [drop, ...s.inventory].slice(0, 36);
        nextRecentDrop = drop;
        lootRarity = drop.rarity;
        lootName = drop.name;
        soundEngine.playEpicLoot();
        const meta = RARITY_META[drop.rarity];

        const curIdx = SECRET_GROUNDS.findIndex((g) => g.id === ground.id);
        const nextGround = curIdx >= 0 && curIdx + 1 < SECRET_GROUNDS.length ? SECRET_GROUNDS[curIdx + 1] : null;
        const canEnterNext = Boolean(nextGround && s.realmId >= nextGround.minRealmId);

        nextIsBoss = false;
        nextBossTimer = 0;

        if (s.autoNextStage && nextGround && canEnterNext) {
          nextGroundId = nextGround.id;
          const nextFirstM = nextGround.monsters[0];
          nextMonsterIndex = 0;
          nextMonsterName = nextFirstM.name;
          nextMonsterKind = nextFirstM.kind;
          nextMonsterHp = nextFirstM.maxHp;
          nextMonsterMaxHp = nextFirstM.maxHp;
          nextMonsterAtk = nextFirstM.atk;
          nextLogs = [
            makeLog(
              `✦ 通关【${ground.name}】！获破境丹×1、${meta.label}【${drop.name}】，自动踏入下一关【${nextGround.name}】！`,
              'breakthrough'
            ),
            ...nextLogs,
          ].slice(0, 40);
        } else {
          const firstM = ground.monsters[0];
          nextMonsterIndex = 0;
          nextMonsterName = firstM.name;
          nextMonsterKind = firstM.kind;
          nextMonsterHp = firstM.maxHp;
          nextMonsterMaxHp = firstM.maxHp;
          nextMonsterAtk = firstM.atk;
          nextStageClearReport = {
            groundId: ground.id,
            groundName: ground.name,
            bossName: target.name,
            firstClear,
            stoneGain,
            dropName: `${meta.label}·${drop.name}`,
            nextGroundId: nextGround ? nextGround.id : null,
            nextGroundName: nextGround ? nextGround.name : null,
            nextNeedsRealm: nextGround && !canEnterNext ? REALMS[nextGround.minRealmId].name : null,
          };
          nextLogs = [
            makeLog(
              `✦ 通关【${ground.name}】，斩杀镇守妖王【${target.name}】！获灵石+${stoneGain}、破境丹×1、${meta.label}【${drop.name}】！`,
              'breakthrough'
            ),
            ...nextLogs,
          ].slice(0, 40);
        }
      } else {
        let extraText = '';
        if (Math.random() < target.herbChance) {
          nextHerbs += 1;
          extraText += '，采得灵草×1';
        }
        if (Math.random() < target.dropChance) {
          const drop = generateArtifact(s.realmId, effectiveLuck);
          nextInventory = [drop, ...s.inventory].slice(0, 36);
          nextRecentDrop = drop;
          lootRarity = drop.rarity;
          lootName = drop.name;
          if (drop.rarity === 'immortal' || drop.rarity === 'mystic') {
            soundEngine.playEpicLoot();
          }
          const meta = RARITY_META[drop.rarity];
          const tone = drop.rarity === 'immortal' || drop.rarity === 'mystic' ? 'epic' : 'loot';
          nextLogs = [
            makeLog(`斩杀【${target.name}】，爆出${meta.label}法宝【${drop.name}】！`, tone),
            ...nextLogs,
          ].slice(0, 40);
        } else if (nextKills % 3 === 0) {
          nextLogs = [
            makeLog(`御剑斩杀【${target.name}】，获灵石+${stoneGain}、修为+${qiGain}${extraText}`, 'normal'),
            ...nextLogs,
          ].slice(0, 40);
        }

        nextMonsterIndex = (s.monsterIndex + 1) % ground.monsters.length;
        const nextM = ground.monsters[nextMonsterIndex];
        nextMonsterName = nextM.name;
        nextMonsterKind = nextM.kind;
        nextMonsterHp = nextM.maxHp;
        nextMonsterMaxHp = nextM.maxHp;
        nextMonsterAtk = nextM.atk;
      }
    }
  }

  // Su Linger 100-affinity passive: restore 4% maxHp on every monster kill
  const suHeal =
    killed && npcSummary.suCombatHealPct > 0 && s.playerHp > 0 && s.playerHp < maxHp
      ? Math.max(1, Math.round(maxHp * npcSummary.suCombatHealPct))
      : 0;

  return {
    qi: Number(nextQi.toFixed(1)),
    ...(suHeal > 0
      ? {
          playerHp: Math.min(maxHp, s.playerHp + suHeal),
          healEvent: { seq: (s.healEvent?.seq ?? 0) + 1, amount: suHeal },
        }
      : {}),
    stones: nextStones,
    herbs: nextHerbs,
    breakPills: nextPills,
    inventory: nextInventory,
    recentDrop: nextRecentDrop,
    logs: nextLogs,
    totalKills: nextKills,
    monsterHp: nextMonsterHp,
    monsterMaxHp: nextMonsterMaxHp,
    monsterAtk: nextMonsterAtk,
    monsterIndex: nextMonsterIndex,
    monsterName: nextMonsterName,
    monsterKind: nextMonsterKind,
    isBossFight: nextIsBoss,
    isTowerFight: nextIsTower,
    towerFloor: nextTowerFloor,
    bossTimer: nextBossTimer,
    bossesDefeated: nextBossesDefeated,
    groundId: nextGroundId,
    stageClearReport: nextStageClearReport,
    lastHitCrit: isCrit,
    lastHitDamage: dmg,
    swordIntent: nextSwordIntent,
    battleEvent: {
      seq: (s.battleEvent?.seq ?? 0) + 1,
      damage: dmg,
      isCrit,
      killed,
      skillId,
      isManual,
      isDouble,
      lightningProc,
      lootRarity,
      lootName,
    },
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      tick: () => {
        const s = get();
        const { realm, qiPerSec, atk, critChance } = computeStats(s);
        const dt = 0.5;

        let nextQi = Math.min(realm.qiRequired, s.qi + qiPerSec * dt);
        let nextStones = s.stones;
        let nextHerbs = s.herbs;
        let nextOres = s.ores;
        let nextInventory = s.inventory;
        let nextRecentDrop = s.recentDrop;
        let nextLogs = s.logs;

        // 1. Reduce skill cooldowns (喝茶悟道 + 洞府藏经阁/悟道台共鸣加快)
        const { gridBonus } = computeStats(s);
        const hasTea = s.slackingMode === 'tea' || s.cloneSlackingMode === 'tea';
        const cdStep = dt * (hasTea ? 1.4 : 1) * gridBonus.cdMult;
        const nextCooldowns: Record<SkillId, number> = {
          qinglian: Math.max(0, Number((s.skillCooldowns.qinglian - cdStep).toFixed(1))),
          thunder: Math.max(0, Number((s.skillCooldowns.thunder - cdStep).toFixed(1))),
          spirit_surge: Math.max(0, Number((s.skillCooldowns.spirit_surge - cdStep).toFixed(1))),
          wanjian: Math.max(0, Number((s.skillCooldowns.wanjian - cdStep).toFixed(1))),
        };

        // 2. Side Craft + Slacking Life Mode triggers every 5s
        let nextCraftProgress = s.craftProgress + 10;
        const nextCraftLevels = { ...s.craftLevels };
        let nextFishCodex = s.fishCodex ?? [];
        let nextSweeper = s.sweeperPoints ?? 0;
        const slackMult = s.daoPath === 'slacking' ? 1.55 : 1;
        const activeModes: SlackingMode[] = [s.slackingMode];
        if (s.realmId >= 7 && s.cloneSlackingMode) activeModes.push(s.cloneSlackingMode);

        if (nextCraftProgress >= 100) {
          nextCraftProgress = 0;
          if (gridBonus.extraHerbTick > 0) {
            nextHerbs += gridBonus.extraHerbTick;
          }
          const lv = s.craftLevels[s.activeCraft] ?? 1;
          if (s.activeCraft === 'fishing') {
            nextStones += Math.max(2, Math.round((4 + s.realmId * 3) * (1 + lv * 0.08)));
          } else if (s.activeCraft === 'herbalism') {
            nextHerbs += 1 + (Math.random() < 0.2 ? 1 : 0);
          } else if (s.activeCraft === 'mining') {
            nextOres += 1 + (Math.random() < 0.25 ? 1 : 0);
            nextStones += 2 + s.realmId * 2;
          }
          if (Math.random() < 0.15) {
            nextCraftLevels[s.activeCraft] = lv + 1;
          }

          // Apply Slacking Life Mode special procs!
          activeModes.forEach((mode) => {
            if (mode === 'sleep' && Math.random() < 0.22 * slackMult) {
              const dreamQi = Math.round(qiPerSec * 12 * slackMult);
              nextQi = Math.min(realm.qiRequired, nextQi + dreamQi);
              nextLogs = [makeLog(`💤【梦境悟道】睡梦中得见古仙演化剑意，修为 +${dreamQi}！`, 'loot'), ...nextLogs].slice(0, 40);
            } else if (mode === 'fishing') {
              const roll = Math.random();
              const pool =
                roll < 0.06 * slackMult
                  ? FISH_CODEX.filter((f) => f.rarity === 'immortal')
                  : roll < 0.24 * slackMult
                    ? FISH_CODEX.filter((f) => f.rarity === 'mystic')
                    : roll < 0.6
                      ? FISH_CODEX.filter((f) => f.rarity === 'spirit')
                      : FISH_CODEX.filter((f) => f.rarity === 'common');
              const caught = pool[Math.floor(Math.random() * pool.length)] ?? FISH_CODEX[0];
              nextStones += Math.max(2, Math.round(caught.stoneValue * 0.45 * slackMult));
              if (!nextFishCodex.includes(caught.id)) {
                nextFishCodex = [...nextFishCodex, caught.id];
                soundEngine.playEpicLoot();
                nextLogs = [
                  makeLog(`🎣【灵溪垂钓】首次钓起【${caught.name}】，点亮垂钓图鉴（全灵石/修为+3%）！`, 'epic'),
                  ...nextLogs,
                ].slice(0, 40);
              } else if (caught.rarity === 'immortal' || caught.rarity === 'mystic') {
                nextLogs = [
                  makeLog(`🎣【灵溪垂钓】钓获奇珍【${caught.name}】，售得灵石 +${Math.round(caught.stoneValue * slackMult)}！`, 'loot'),
                  ...nextLogs,
                ].slice(0, 40);
              }
            } else if (mode === 'sweep') {
              const prev = nextSweeper;
              nextSweeper = Math.min(100, nextSweeper + Math.round(6 * slackMult));
              nextOres += 1;
              if (prev < 100 && nextSweeper >= 100) {
                soundEngine.playThunder(true);
                nextLogs = [
                  makeLog(`🧹【扫地老仙传承觉醒】经年扫地悟透大道，攻击与吐纳永久 +20%！`, 'breakthrough'),
                  ...nextLogs,
                ].slice(0, 40);
              }
            }
          });
        }

        // 3. Random Encounter + Story Chain check
        let nextEncounter = s.pendingEncounter;
        const hasDaydream = activeModes.includes('daydream');
        const routeMystery = s.exploreRoute === 'mystery' ? 1.5 : 1;
        const encStep = (hasDaydream ? 2.2 : 1) * (s.daoPath === 'slacking' ? 1.35 : 1) * routeMystery;
        let nextEncounterTick = s.encounterTick + encStep;
        if (!nextEncounter && nextEncounterTick >= 72) {
          nextEncounterTick = 0;
          if ((s.storyChainStage ?? 0) < 3 && Math.random() < 0.42) {
            nextEncounter = STORY_CHAIN_EVENTS[s.storyChainStage ?? 0];
          } else {
            nextEncounter = ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)];
          }
        }

        // 3b. Pet Personality Quip & Autonomous Activity every ~18s (36 ticks)
        let nextPetQuip = s.petQuip;
        let nextPetStates = s.petStates;
        if (s.activePet && (s.attackTick + 1) % 36 === 0) {
          const quips = PET_QUIPS[s.activePet];
          nextPetQuip = quips[Math.floor(Math.random() * quips.length)];
          const petDef = PETS.find((p) => p.id === s.activePet);
          if (petDef && s.petStates?.[s.activePet]) {
            const act = petDef.activities[Math.floor(Math.random() * petDef.activities.length)];
            nextPetStates = {
              ...s.petStates,
              [s.activePet]: { ...s.petStates[s.activePet], activity: act },
            };
          }
        }

        // 4. Boss / Tower countdown check
        let nextBossTimer = s.bossTimer;
        let bossTimedOutPatch: Partial<GameState> = {};
        if (s.isBossFight || s.isTowerFight) {
          nextBossTimer = Math.max(0, Number((s.bossTimer - dt).toFixed(1)));
          if (nextBossTimer <= 0) {
            const ground = SECRET_GROUNDS.find((g) => g.id === s.groundId) ?? SECRET_GROUNDS[0];
            const firstM = ground.monsters[0];
            bossTimedOutPatch = {
              isBossFight: false,
              isTowerFight: false,
              bossTimer: 0,
              monsterIndex: 0,
              monsterName: firstM.name,
              monsterKind: firstM.kind,
              monsterHp: firstM.maxHp,
              monsterMaxHp: firstM.maxHp,
              logs: [
                makeLog(s.isTowerFight ? `锁妖塔闯关超时，已退回秘境蓄力！` : `挑战妖王超时，暂且退回外围蓄力！`, 'warn'),
                ...nextLogs,
              ].slice(0, 40),
            };
          }
        }

        const nextBurstTimer = Math.max(0, Number((s.burstTimer - dt).toFixed(1)));
        const { maxHp } = computeStats(s);
        let nextRecover = Math.max(0, Number((s.recoverTimer - dt).toFixed(1)));
        let nextPlayerHp = Math.min(maxHp, s.playerHp);

        // Recovering from serious injury (no free passive combat regen — must use Spa, Alchemy Dao, or Heal Pills!)
        const hasSpa = activeModes.includes('spa');
        if (s.recoverTimer > 0 && nextRecover <= 0) {
          nextPlayerHp = Math.round(maxHp * 0.55);
          nextLogs = [makeLog('重伤调息完毕，勉强稳住气血重返战局。', 'loot'), ...nextLogs].slice(0, 40);
        } else if (nextRecover <= 0) {
          const regenPct = (hasSpa ? 0.03 : 0) + (s.daoPath === 'alchemy' ? 0.012 : 0);
          if (regenPct > 0) {
            nextPlayerHp = Math.min(maxHp, Math.round(nextPlayerHp + maxHp * regenPct));
          }
        }

        set({
          qi: Number(nextQi.toFixed(1)),
          playerHp: nextPlayerHp,
          recoverTimer: nextRecover,
          stones: nextStones,
          herbs: nextHerbs,
          ores: nextOres,
          inventory: nextInventory,
          recentDrop: nextRecentDrop,
          logs: nextLogs,
          skillCooldowns: nextCooldowns,
          craftProgress: nextCraftProgress,
          craftLevels: nextCraftLevels,
          fishCodex: nextFishCodex,
          sweeperPoints: nextSweeper,
          petQuip: nextPetQuip,
          petStates: nextPetStates,
          pendingEncounter: nextEncounter,
          encounterTick: nextEncounterTick,
          bossTimer: nextBossTimer,
          burstTimer: nextBurstTimer,
          attackTick: s.attackTick + 1,
          lastSavedAt: Date.now(),
          ...bossTimedOutPatch,
        });

        // 5. Player combat (only if not recovering from injury)
        const updated = get();
        if (updated.recoverTimer <= 0) {
          const shouldAutoStrike = updated.burstTimer > 0 || updated.attackTick % 2 === 0;
          if (updated.autoCastSkills) {
            const readySkill = updated.unlockedSkills.find((id) => updated.skillCooldowns[id] <= 0);
            if (readySkill) {
              get().castSkill(readySkill);
            } else if (shouldAutoStrike) {
              const isCrit = Math.random() * 100 < critChance;
              const dmg = Math.round(atk * (isCrit ? 1.85 : 1) * (0.92 + Math.random() * 0.16));
              set(applyDamageToCurrentTarget(updated, dmg, isCrit));
            }
          } else if (shouldAutoStrike) {
            const isCrit = Math.random() * 100 < critChance;
            const dmg = Math.round(atk * (isCrit ? 1.85 : 1) * (0.92 + Math.random() * 0.16));
            set(applyDamageToCurrentTarget(updated, dmg, isCrit));
          }

          // 5b. Enemy Counterattack every 3 ticks (1.5s)!
          const afterPlayer = get();
          if (afterPlayer.attackTick % 3 === 0 && afterPlayer.monsterHp > 0) {
            const nextEnemyCount = afterPlayer.enemyAttackCount + 1;
            const isBossOrTower = afterPlayer.isBossFight || afterPlayer.isTowerFight;
            const isHeavy = isBossOrTower && nextEnemyCount % 3 === 0;
            const routeDmgMult =
              afterPlayer.exploreRoute === 'safe' ? 0.75 : afterPlayer.exploreRoute === 'danger' ? 1.35 : 1;
            const rawDmg = Math.max(
              2,
              Math.round(afterPlayer.monsterAtk * routeDmgMult * (isHeavy ? 2.15 : 1) * (0.88 + Math.random() * 0.24))
            );
            let hpAfterHit = Math.max(0, afterPlayer.playerHp - rawDmg);
            const curStats = computeStats(afterPlayer);

            // Auto-heal check before death if enabled
            let usedAutoPill = false;
            let pillsLeft = afterPlayer.healPills;
            let nextHealEv = afterPlayer.healEvent;
            let extraLogs = afterPlayer.logs;

            if (afterPlayer.autoHeal && pillsLeft > 0 && hpAfterHit > 0 && hpAfterHit / curStats.maxHp < 0.42) {
              const healAmt = Math.round(curStats.maxHp * 0.55);
              hpAfterHit = Math.min(curStats.maxHp, hpAfterHit + healAmt);
              pillsLeft -= 1;
              usedAutoPill = true;
              soundEngine.playMeditate();
              nextHealEv = { seq: (afterPlayer.healEvent?.seq ?? 0) + 1, amount: healAmt };
              extraLogs = [makeLog(`危急时刻自动吞服【回春丹】，回复气血 +${healAmt}！`, 'loot'), ...extraLogs].slice(
                0,
                40
              );
            }

            const enemyEv = {
              seq: (afterPlayer.enemyAttackEvent?.seq ?? 0) + 1,
              damage: rawDmg,
              isHeavy,
            };

            if (hpAfterHit <= 0) {
              soundEngine.playThunder(false);
              const qiLost = Math.round(afterPlayer.qi * 0.12);
              const stonesLost = Math.min(300, Math.round(afterPlayer.stones * 0.05));
              const nextQiAfterLoss = Math.max(0, Number((afterPlayer.qi - qiLost).toFixed(1)));
              const nextStonesAfterLoss = Math.max(0, afterPlayer.stones - stonesLost);
              const defeatReport = { killer: afterPlayer.monsterName, qiLost, stonesLost };

              if (isBossOrTower) {
                const ground = SECRET_GROUNDS.find((g) => g.id === afterPlayer.groundId) ?? SECRET_GROUNDS[0];
                const firstM = ground.monsters[0];
                set({
                  qi: nextQiAfterLoss,
                  stones: nextStonesAfterLoss,
                  playerHp: 0,
                  recoverTimer: 10,
                  isBossFight: false,
                  isTowerFight: false,
                  bossTimer: 0,
                  monsterIndex: 0,
                  monsterName: firstM.name,
                  monsterKind: firstM.kind,
                  monsterHp: firstM.maxHp,
                  monsterMaxHp: firstM.maxHp,
                  monsterAtk: firstM.atk,
                  enemyAttackCount: 0,
                  enemyAttackEvent: enemyEv,
                  defeatReport,
                  logs: [
                    makeLog(
                      `【身受重伤】不敌【${afterPlayer.monsterName}】惨遭击溃！损失修为 -${qiLost}、灵石 -${stonesLost}，需调息 10 秒或急服回春丹！`,
                      'warn'
                    ),
                    ...extraLogs,
                  ].slice(0, 40),
                });
              } else {
                set({
                  qi: nextQiAfterLoss,
                  stones: nextStonesAfterLoss,
                  playerHp: 0,
                  recoverTimer: 10,
                  enemyAttackCount: nextEnemyCount,
                  enemyAttackEvent: enemyEv,
                  defeatReport,
                  logs: [
                    makeLog(
                      `【身受重伤】遭【${afterPlayer.monsterName}】重创昏迷！散失修为 -${qiLost}、灵石 -${stonesLost}，需调息 10 秒或服丹急救！`,
                      'warn'
                    ),
                    ...extraLogs,
                  ].slice(0, 40),
                });
              }
            } else {
              if (isHeavy) soundEngine.playSwordHit(true);
              set({
                playerHp: hpAfterHit,
                healPills: pillsLeft,
                healEvent: usedAutoPill ? nextHealEv : afterPlayer.healEvent,
                enemyAttackCount: nextEnemyCount,
                enemyAttackEvent: enemyEv,
                logs: isHeavy
                  ? [makeLog(`【${afterPlayer.monsterName}】施展狂暴重击，气血 -${rawDmg}！`, 'warn'), ...extraLogs].slice(
                      0,
                      40
                    )
                  : extraLogs,
              });
            }
          }
        }

        // 6. Check achievements
        const achPatch = evaluateAchievements(get());
        if (achPatch) set(achPatch);
      },

      meditateClick: () => {
        const s = get();
        const { realm, qiPerSec } = computeStats(s);
        const gain = Math.max(2, Math.round(qiPerSec * 0.55));
        const nextQi = Math.min(realm.qiRequired, s.qi + gain);
        soundEngine.playMeditate();
        set({ qi: Number(nextQi.toFixed(1)) });
        return gain;
      },

      manualSlash: () => {
        const s = get();
        if (s.recoverTimer > 0) return;
        const { atk, critChance } = computeStats(s);
        const isCrit = Math.random() * 100 < critChance;
        const dmg = Math.max(4, Math.round(atk * 0.65 * (isCrit ? 1.7 : 1)));
        set(applyDamageToCurrentTarget(s, dmg, isCrit, undefined, true));
        const achPatch = evaluateAchievements(get());
        if (achPatch) set(achPatch);
      },

      triggerBurst: () => {
        const s = get();
        if (s.swordIntent < 100 || s.burstTimer > 0) return false;
        soundEngine.playThunder(true);
        set({
          swordIntent: 0,
          burstTimer: 10,
          logs: [makeLog('【人剑合一·无双爆发】剑意冲霄！10 秒内攻速翻倍、剑剑暴击！', 'breakthrough'), ...s.logs].slice(
            0,
            40
          ),
        });
        return true;
      },

      attemptBreakthrough: (usePill) => {
        const s = get();
        const { realm, petBreakBonus } = computeStats(s);
        if (!realm || s.realmId >= REALMS.length - 1) {
          return { success: false, message: '道友已登临大乘飞升之境！' };
        }
        if (isDemoLocked(s.fullUnlocked) && s.realmId >= DEMO_MAX_REALM_ID) {
          set({ showUnlockModal: true });
          return { success: false, message: '试玩版最高可修至【炼气圆满】，输入仙缘激活码即可保留存档解锁完整版！' };
        }
        if (s.qi < realm.qiRequired) {
          return { success: false, message: '修为尚未圆满，请继续吐纳。' };
        }

        const pillBonus = usePill && s.breakPills > 0 ? 0.22 : 0;
        const nextPills = pillBonus > 0 ? s.breakPills - 1 : s.breakPills;
        const rate = Math.min(0.99, realm.breakthroughRate + s.insightBonus + pillBonus + petBreakBonus);
        const success = Math.random() < rate;

        soundEngine.playThunder(success);

        if (success) {
          const nextRealm = REALMS[s.realmId + 1];
          const msg = `天劫散尽，道友成功踏入【${nextRealm.name}】！气血全满、战力大增！`;
          const newStats = computeStats({ ...s, realmId: s.realmId + 1 });
          set({
            realmId: s.realmId + 1,
            qi: 0,
            playerHp: newStats.maxHp,
            recoverTimer: 0,
            breakPills: nextPills,
            insightBonus: 0,
            logs: [makeLog(msg, 'breakthrough'), ...s.logs].slice(0, 40),
          });
          const achPatch = evaluateAchievements(get());
          if (achPatch) set(achPatch);
          return { success: true, message: msg };
        } else {
          const msg = `渡劫受阻，护体灵气震散少许，但道心愈坚（下次成功率 +8%）。`;
          set({
            qi: Math.round(realm.qiRequired * 0.72),
            breakPills: nextPills,
            insightBonus: Math.min(0.4, s.insightBonus + 0.08),
            logs: [makeLog(msg, 'warn'), ...s.logs].slice(0, 40),
          });
          return { success: false, message: msg };
        }
      },

      selectGround: (groundId) => {
        const idx = SECRET_GROUNDS.findIndex((g) => g.id === groundId);
        if (idx === -1) return;
        const ground = SECRET_GROUNDS[idx];
        const s = get();
        if (isDemoLocked(s.fullUnlocked) && idx > DEMO_MAX_STAGE_INDEX) {
          set({ showUnlockModal: true });
          return;
        }
        if (!isGroundUnlocked(idx, s.realmId, s.bossesDefeated)) return;
        const firstM = ground.monsters[0];
        soundEngine.playClick();
        set({
          groundId: ground.id,
          isBossFight: false,
          isTowerFight: false,
          bossTimer: 0,
          monsterIndex: 0,
          monsterName: firstM.name,
          monsterKind: firstM.kind,
          monsterHp: firstM.maxHp,
          monsterMaxHp: firstM.maxHp,
          monsterAtk: firstM.atk,
          enemyAttackCount: 0,
          stageClearReport: null,
          logs: [makeLog(`御剑前往【${ground.name}】历练斩妖。`, 'normal'), ...s.logs].slice(0, 40),
        });
      },

      toggleAutoNextStage: () => {
        soundEngine.playClick();
        set((s) => ({ autoNextStage: !s.autoNextStage }));
      },

      dismissStageClear: () => {
        soundEngine.playClick();
        set({ stageClearReport: null });
      },

      advanceToNextStage: () => {
        const s = get();
        const report = s.stageClearReport;
        if (!report?.nextGroundId) {
          set({ stageClearReport: null });
          return { ok: false, msg: '已至最后一重秘境！' };
        }
        const nextIdx = SECRET_GROUNDS.findIndex((g) => g.id === report.nextGroundId);
        if (nextIdx === -1) return { ok: false, msg: '未找到下一关卡' };
        if (isDemoLocked(s.fullUnlocked) && nextIdx > DEMO_MAX_STAGE_INDEX) {
          set({ stageClearReport: null, showUnlockModal: true });
          return { ok: false, msg: '试玩版前 3 关已全部通关！输入激活码解锁全部 50 关！' };
        }
        const nextGround = SECRET_GROUNDS[nextIdx];
        if (!isGroundUnlocked(nextIdx, s.realmId, s.bossesDefeated)) {
          return { ok: false, msg: `需先突破至【${REALMS[nextGround.minRealmId].name}】方可踏入下一关！` };
        }
        const firstM = nextGround.monsters[0];
        soundEngine.playClick();
        set({
          groundId: nextGround.id,
          isBossFight: false,
          isTowerFight: false,
          bossTimer: 0,
          monsterIndex: 0,
          monsterName: firstM.name,
          monsterKind: firstM.kind,
          monsterHp: firstM.maxHp,
          monsterMaxHp: firstM.maxHp,
          monsterAtk: firstM.atk,
          enemyAttackCount: 0,
          stageClearReport: null,
          logs: [makeLog(`✦ 破阵前行！御剑踏入下一关【${nextGround.name}】！`, 'epic'), ...s.logs].slice(0, 40),
        });
        return { ok: true, msg: `已踏入下一关【${nextGround.name}】！` };
      },

      startBossFight: () => {
        const s = get();
        const ground = SECRET_GROUNDS.find((g) => g.id === s.groundId) ?? SECRET_GROUNDS[0];
        const boss = ground.boss;
        soundEngine.playThunder(false);
        set({
          isBossFight: true,
          isTowerFight: false,
          bossTimer: 45,
          monsterName: boss.name,
          monsterKind: boss.kind,
          monsterHp: boss.maxHp,
          monsterMaxHp: boss.maxHp,
          monsterAtk: boss.atk,
          enemyAttackCount: 0,
          logs: [makeLog(`风云变色！直面镇守妖王【${boss.name}】（注意及时吞服回春丹）！`, 'breakthrough'), ...s.logs].slice(
            0,
            40
          ),
        });
      },

      startTowerFight: () => {
        const s = get();
        const nextFloor = s.towerFloor + 1;
        const m = getTowerMonster(nextFloor);
        soundEngine.playThunder(false);
        set({
          isBossFight: false,
          isTowerFight: true,
          bossTimer: 30,
          monsterName: m.name,
          monsterKind: m.kind,
          monsterHp: m.maxHp,
          monsterMaxHp: m.maxHp,
          monsterAtk: m.atk,
          enemyAttackCount: 0,
          logs: [makeLog(`踏入无尽锁妖塔第 ${nextFloor} 层，迎战【${m.name}】！`, 'breakthrough'), ...s.logs].slice(
            0,
            40
          ),
        });
      },

      retreatBoss: () => {
        const s = get();
        const ground = SECRET_GROUNDS.find((g) => g.id === s.groundId) ?? SECRET_GROUNDS[0];
        const firstM = ground.monsters[0];
        soundEngine.playClick();
        set({
          isBossFight: false,
          isTowerFight: false,
          bossTimer: 0,
          monsterIndex: 0,
          monsterName: firstM.name,
          monsterKind: firstM.kind,
          monsterHp: firstM.maxHp,
          monsterMaxHp: firstM.maxHp,
          monsterAtk: firstM.atk,
          enemyAttackCount: 0,
        });
      },

      unlockSkill: (id) => {
        const s = get();
        if (s.unlockedSkills.includes(id)) return { ok: false, msg: '已习得该神通' };
        const def = SKILLS.find((sk) => sk.id === id);
        if (!def) return { ok: false, msg: '未知神通' };
        if (s.realmId < def.minRealmId) {
          return { ok: false, msg: `需先突破至【${REALMS[def.minRealmId].name}】` };
        }
        if (s.stones < def.unlockCost) return { ok: false, msg: '灵石不足' };

        soundEngine.playEpicLoot();
        set({
          stones: s.stones - def.unlockCost,
          unlockedSkills: [...s.unlockedSkills, id],
          logs: [makeLog(`参悟秘籍成功，习得神通【${def.name}】！`, 'epic'), ...s.logs].slice(0, 40),
        });
        const achPatch = evaluateAchievements(get());
        if (achPatch) set(achPatch);
        return { ok: true, msg: `成功习得【${def.name}】！` };
      },

      castSkill: (id) => {
        const s = get();
        if (!s.unlockedSkills.includes(id) || s.skillCooldowns[id] > 0) return false;
        const def = SKILLS.find((sk) => sk.id === id);
        if (!def) return false;

        const { realm, qiPerSec, atk, critChance } = computeStats(s);
        const nextCd = { ...s.skillCooldowns, [id]: def.cooldownSec };

        if (def.qiBurstSec) {
          const gain = Math.round(qiPerSec * def.qiBurstSec);
          soundEngine.playMeditate();
          set({
            skillCooldowns: nextCd,
            qi: Math.min(realm.qiRequired, s.qi + gain),
            logs: [makeLog(`施展【${def.name}】，周天灵气暴涨 +${gain}！`, 'loot'), ...s.logs].slice(0, 40),
          });
          return true;
        }

        const isCrit = def.guaranteedCrit ? true : Math.random() * 100 < critChance;
        const dmg = Math.round(atk * def.dmgMult * (isCrit ? 1.45 : 1));
        const patch = applyDamageToCurrentTarget(s, dmg, isCrit, id);
        set({
          ...patch,
          skillCooldowns: nextCd,
        });
        return true;
      },

      toggleAutoCast: () => {
        soundEngine.playClick();
        set((s) => ({ autoCastSkills: !s.autoCastSkills }));
      },

      setActiveCraft: (craft) => {
        soundEngine.playClick();
        set({
          activeCraft: craft,
          craftProgress: 0,
          logs: [makeLog(`切换副业挂机为【${CRAFT_META[craft].name}】。`, 'normal'), ...get().logs].slice(0, 40),
        });
      },

      setSlackingMode: (mode) => {
        soundEngine.playClick();
        set({
          slackingMode: mode,
          logs: [makeLog(`切换摸鱼姿态为【${SLACKING_META[mode].emoji} ${SLACKING_META[mode].name}】。`, 'normal'), ...get().logs].slice(
            0,
            40
          ),
        });
      },

      setCloneSlackingMode: (mode) => {
        const s = get();
        if (s.realmId < 7) return;
        soundEngine.playClick();
        set({
          cloneSlackingMode: mode,
          logs: [
            makeLog(
              mode ? `派遣【元婴分身】后台执行【${SLACKING_META[mode].name}】！` : '收回元婴分身。',
              'loot'
            ),
            ...s.logs,
          ].slice(0, 40),
        });
      },

      chooseDaoPath: (path) => {
        const s = get();
        if (s.realmId < 1) return { ok: false, msg: '需先突破至【炼气初期】方可择定本命大道！' };
        if (s.daoPath === path) return { ok: false, msg: '当前已是该流派' };
        const cost = s.daoPath ? 100 : 0;
        if (s.stones < cost) return { ok: false, msg: `改换流派需消耗 ${cost} 灵石` };
        const def = DAO_PATHS.find((p) => p.id === path);
        soundEngine.playEpicLoot();
        set({
          daoPath: path,
          stones: s.stones - cost,
          logs: [makeLog(`立下道心！踏入【${def?.name}】一脉（${def?.tag}）！`, 'breakthrough'), ...s.logs].slice(0, 40),
        });
        return { ok: true, msg: `已踏入【${def?.name}】一脉！` };
      },

      setGameSpeed: (speed) => {
        soundEngine.playClick();
        set({ gameSpeed: speed });
      },

      setExploreRoute: (route) => {
        soundEngine.playClick();
        set({
          exploreRoute: route,
          logs: [makeLog(`切换秘境路线为【${ROUTE_META[route].emoji} ${ROUTE_META[route].name}】。`, 'normal'), ...get().logs].slice(
            0,
            40
          ),
        });
      },

      buildInGrid: (cellIndex, buildingId) => {
        const s = get();
        if (cellIndex < 0 || cellIndex >= 9) return { ok: false, msg: '无效地块' };
        if (s.caveGrid.includes(buildingId)) return { ok: false, msg: '洞府中已建有该建筑，可直接点击互换位置调整共鸣！' };
        const def = BUILDINGS.find((b) => b.id === buildingId);
        if (!def) return { ok: false, msg: '未知建筑' };
        if (s.stones < def.cost) return { ok: false, msg: `灵石不足（需 ${def.cost} 灵石）` };
        const nextGrid = [...s.caveGrid];
        nextGrid[cellIndex] = buildingId;
        soundEngine.playEpicLoot();
        set({
          stones: s.stones - def.cost,
          caveGrid: nextGrid,
          logs: [makeLog(`在洞府落成【${def.emoji} ${def.name}】！相邻摆放可激活共鸣。`, 'loot'), ...s.logs].slice(0, 40),
        });
        return { ok: true, msg: `成功建造【${def.name}】！` };
      },

      swapGridCells: (a, b) => {
        const s = get();
        if (a === b || a < 0 || b < 0 || a >= 9 || b >= 9) return;
        const nextGrid = [...s.caveGrid];
        const tmp = nextGrid[a];
        nextGrid[a] = nextGrid[b];
        nextGrid[b] = tmp;
        soundEngine.playClick();
        set({ caveGrid: nextGrid });
      },

      reincarnate: () => {
        const s = get();
        if (s.realmId < 5) {
          return { ok: false, msg: '需至少达到【金丹初期】方可开启兵解转世！' };
        }
        const endingId = s.daoPath ?? 'slacking';
        const endingDef = ENDINGS.find((e) => e.id === endingId) ?? ENDINGS[4];
        const nextEndings = s.unlockedEndings.includes(endingId)
          ? s.unlockedEndings
          : [...s.unlockedEndings, endingId];
        const nextReinc = s.reincarnations + 1;
        soundEngine.playThunder(true);

        // Preserve meta progression (Pets, Fish Codex, Achievements, Story Chain, Cave Grid, Endings)
        set({
          ...INITIAL_STATE,
          reincarnations: nextReinc,
          unlockedEndings: nextEndings,
          ownedPets: s.ownedPets,
          activePet: s.activePet,
          fishCodex: s.fishCodex,
          sweeperPoints: s.sweeperPoints,
          storyChainStage: s.storyChainStage,
          unlockedAchievements: s.unlockedAchievements,
          caveGrid: s.caveGrid,
          muted: s.muted,
          stones: 60 + nextReinc * 40,
          logs: [
            makeLog(
              `✦ 达成结局【${endingDef.title}】！开启第 ${nextReinc + 1} 世轮回，前世因果永久加持 +${nextReinc * 35}%！`,
              'breakthrough'
            ),
          ],
          lastSavedAt: Date.now(),
        });
        return { ok: true, msg: `达成【${endingDef.title}】，已携前世因果开启第 ${nextReinc + 1} 世！` };
      },

      forgeArtifact: () => {
        const s = get();
        if (s.ores < 5 || s.stones < 60) {
          return { ok: false, msg: '需消耗 玄铁矿×5 与 灵石×60' };
        }
        const item = generateArtifact(s.realmId + 1, s.luckLevel + 2, 'spirit');
        soundEngine.playEpicLoot();
        const meta = RARITY_META[item.rarity];
        set({
          ores: s.ores - 5,
          stones: s.stones - 60,
          forgeCount: s.forgeCount + 1,
          inventory: [item, ...s.inventory].slice(0, 36),
          recentDrop: item,
          logs: [makeLog(`炉火纯青！亲手锻造出${meta.label}法宝【${item.name}】！`, 'epic'), ...s.logs].slice(0, 40),
        });
        const achPatch = evaluateAchievements(get());
        if (achPatch) set(achPatch);
        return { ok: true, msg: `锻造成功：${meta.label}·${item.name}！` };
      },

      buyOrSelectPet: (id) => {
        const s = get();
        const pet = PETS.find((p) => p.id === id);
        if (!pet) return { ok: false, msg: '未知灵宠' };
        if (s.ownedPets.includes(id)) {
          soundEngine.playClick();
          set({ activePet: id });
          return { ok: true, msg: `已唤出【${pet.name}】随行出战！` };
        }
        if (s.stones < pet.costStones) {
          return { ok: false, msg: `灵石不足（需 ${pet.costStones} 灵石）` };
        }
        soundEngine.playEpicLoot();
        const curPs = s.petStates?.[id] ?? makeDefaultPetStates()[id];
        set({
          stones: s.stones - pet.costStones,
          ownedPets: [...s.ownedPets, id],
          activePet: id,
          petStates: {
            ...s.petStates,
            [id]: {
              ...curPs,
              memories: [`${nowTime()} 与道友初次缔结灵契，搬入洞府`, ...curPs.memories].slice(0, 10),
            },
          },
          logs: [makeLog(`缔结灵契！神兽【${pet.name}】从此随行左右！`, 'epic'), ...s.logs].slice(0, 40),
        });
        const achPatch = evaluateAchievements(get());
        if (achPatch) set(achPatch);
        return { ok: true, msg: `成功契约【${pet.name}】并已上阵！` };
      },

      petInteract: (id, action) => {
        const s = get();
        if (!s.ownedPets.includes(id)) return { ok: false, msg: '尚未契约该灵宠' };
        const pet = PETS.find((p) => p.id === id);
        if (!pet) return { ok: false, msg: '未知灵宠' };
        const ps = s.petStates?.[id] ?? makeDefaultPetStates()[id];

        if (action === 'feed' && s.herbs < 2) {
          return { ok: false, msg: '投喂灵果需消耗 灵草×2' };
        }

        const expGain = action === 'feed' ? 22 : 8;
        const affGain = action === 'feed' ? 10 : 4;
        const nextExp = ps.exp + expGain;
        const thresholds = [30, 80, 150, 260];
        let nextStage = ps.stage;
        while (nextStage < 4 && nextExp >= thresholds[nextStage]) {
          nextStage += 1;
        }
        const leveledUp = nextStage > ps.stage;
        const memories = [...ps.memories];
        if (leveledUp) {
          memories.unshift(`${nowTime()} 突破成长，迈入【${PET_STAGE_NAMES[nextStage]}】！`);
          soundEngine.playEpicLoot();
        } else if (memories.length < 3) {
          memories.unshift(
            action === 'feed' ? `${nowTime()} 开心地吃下了主人投喂的灵草` : `${nowTime()} 被主人温柔抚摸，蹭了蹭掌心`
          );
          soundEngine.playMeditate();
        } else {
          soundEngine.playMeditate();
        }

        set({
          herbs: action === 'feed' ? s.herbs - 2 : s.herbs,
          petStates: {
            ...s.petStates,
            [id]: {
              ...ps,
              affinity: Math.min(100, ps.affinity + affGain),
              exp: nextExp,
              stage: nextStage,
              mood: action === 'feed' ? '满足' : '开心',
              memories: memories.slice(0, 10),
            },
          },
        });
        return {
          ok: true,
          msg: leveledUp
            ? `✦ 【${pet.name}】进阶至【${PET_STAGE_NAMES[nextStage]}】！`
            : action === 'feed'
              ? `投喂成功！【${pet.name}】满足极了（成长 +${expGain}）`
              : `抚摸【${pet.name}】，亲密度 +${affGain}！`,
        };
      },

      evolvePet: (id, branchId) => {
        const s = get();
        const pet = PETS.find((p) => p.id === id);
        const ps = s.petStates?.[id];
        if (!pet || !ps || ps.stage < 2) {
          return { ok: false, msg: '灵宠需达到【成熟期】方可选择血脉觉醒分支！' };
        }
        const branch = pet.branches.find((b) => b.id === branchId);
        if (!branch) return { ok: false, msg: '未知进化分支' };
        soundEngine.playThunder(true);
        set({
          petStates: {
            ...s.petStates,
            [id]: {
              ...ps,
              evolutionBranch: branch.id,
              mood: '悟道',
              memories: [`${nowTime()} 血脉觉醒，化形为【${branch.name}】！`, ...ps.memories].slice(0, 10),
            },
          },
          logs: [makeLog(`✦ 灵宠【${pet.name}】血脉觉醒为【${branch.name}】（${branch.bonusDesc}）！`, 'breakthrough'), ...s.logs].slice(
            0,
            40
          ),
        });
        return { ok: true, msg: `血脉觉醒成功：【${branch.name}】！` };
      },

      chatWithNpc: (id) => {
        const s = get();
        const def = CORE_NPCS.find((n) => n.id === id);
        if (!def) return '';
        const st = s.npcs?.[id] ?? { affinity: 10, unlockedSecret: false, memories: [] };
        const nextAff = Math.min(100, st.affinity + 4);
        const justMaxed = st.affinity < 100 && nextAff >= 100;
        const secretNow = nextAff >= 80;
        const line =
          nextAff >= 100 && Math.random() < 0.6
            ? def.maxDialogue
            : def.dialogues[Math.floor(Math.random() * def.dialogues.length)];
        if (justMaxed) {
          soundEngine.playThunder(true);
        } else {
          soundEngine.playClick();
        }
        const memories = justMaxed
          ? [`${nowTime()} 好感圆满！缔结【${def.maxTitle}】！`, ...st.memories].slice(0, 8)
          : st.memories;
        set({
          npcs: {
            ...s.npcs,
            [id]: {
              ...st,
              affinity: nextAff,
              unlockedSecret: st.unlockedSecret || secretNow,
              memories,
            },
          },
          ...(justMaxed
            ? {
                logs: [
                  makeLog(
                    `✦ 与【${def.name}】好感圆满（100/100），缔结【${def.maxTitle}】！请前往领取至交信物【${def.keepsakeName}】！`,
                    'breakthrough'
                  ),
                  ...s.logs,
                ].slice(0, 40),
              }
            : {}),
        });
        return justMaxed
          ? `✦ 与【${def.name}】好感圆满！${def.name}：“${def.maxDialogue}”`
          : `${def.name}：“${line}”`;
      },

      giftNpc: (id) => {
        const s = get();
        const def = CORE_NPCS.find((n) => n.id === id);
        if (!def) return { ok: false, msg: '未知人物' };
        const st = s.npcs?.[id] ?? { affinity: 10, unlockedSecret: false, memories: [] };
        if (st.affinity >= 100) {
          return { ok: false, msg: `与【${def.name}】已结生死至交（满好感），无需再破费灵石！` };
        }
        if (s.stones < 25) return { ok: false, msg: '备礼拜访需消耗 25 灵石' };
        const nextAff = Math.min(100, st.affinity + 18);
        const justUnlockedSecret = !st.unlockedSecret && nextAff >= 80;
        const justMaxed = st.affinity < 100 && nextAff >= 100;
        if (justMaxed) {
          soundEngine.playThunder(true);
        } else {
          soundEngine.playEpicLoot();
        }

        const memories = [...st.memories];
        if (justMaxed) {
          memories.unshift(`${nowTime()} 好感圆满，与你缔结【${def.maxTitle}】！`);
        } else if (justUnlockedSecret) {
          memories.unshift(`${nowTime()} 敞开心扉，向你吐露了隐藏多年的秘密`);
        } else {
          memories.unshift(`${nowTime()} 收到你的厚礼，好感大增`);
        }

        // Bonus small return gift from Gu Changsheng!
        const extraHeal = id === 'gu_changsheng' && nextAff >= 40 ? 1 : 0;

        set({
          stones: s.stones - 25,
          healPills: s.healPills + extraHeal,
          npcs: {
            ...s.npcs,
            [id]: {
              ...st,
              affinity: nextAff,
              unlockedSecret: st.unlockedSecret || justUnlockedSecret,
              memories: memories.slice(0, 8),
            },
          },
          logs: [
            makeLog(
              justMaxed
                ? `✦ 与【${def.name}】好感圆满（100/100），缔结【${def.maxTitle}】！可领取至交信物【${def.keepsakeName}】！`
                : justUnlockedSecret
                  ? `【${def.name}】好感达到 80，向你吐露了隐藏秘密！`
                  : `赠礼【${def.name}】，好感度升至 ${nextAff}${extraHeal ? '（回赠回春丹×1）' : ''}。`,
              justMaxed ? 'breakthrough' : justUnlockedSecret ? 'epic' : 'loot'
            ),
            ...s.logs,
          ].slice(0, 40),
        });
        return {
          ok: true,
          msg: justMaxed
            ? `✦ 与【${def.name}】好感圆满！缔结【${def.maxTitle}】，快领取专属信物吧！`
            : justUnlockedSecret
              ? `✦ 解锁【${def.name}】隐藏秘密！`
              : `【${def.name}】十分欣喜，好感度 +18${extraHeal ? '，顺手回赠回春丹×1' : ''}！`,
        };
      },

      claimNpcMaxGift: (id) => {
        const s = get();
        const def = CORE_NPCS.find((n) => n.id === id);
        if (!def) return { ok: false, msg: '未知人物' };
        const st = s.npcs?.[id];
        if (!st || st.affinity < 100) return { ok: false, msg: '需好感度达到 100 方可领取至交信物' };
        if (st.claimedMaxGift) return { ok: false, msg: `已珍藏【${def.keepsakeName}】` };

        soundEngine.playThunder(true);
        const patch: Partial<GameState> = {};
        let rewardText = def.keepsakeRewardDesc;

        if (id === 'gu_changsheng') {
          patch.breakPills = s.breakPills + 2;
          patch.healPills = s.healPills + 5;
        } else if (id === 'liu_qingshuang') {
          const { npcSummary } = computeStats(s);
          const item = generateArtifact(s.realmId + 1, s.luckLevel + npcSummary.qianLuckBonus + 8, 'immortal');
          patch.inventory = [item, ...s.inventory].slice(0, 36);
          patch.recentDrop = item;
          patch.breakPills = s.breakPills + 1;
          rewardText = `仙品法宝【${item.name}】+ 破境丹×1`;
        } else if (id === 'chen_elder') {
          patch.sweeperPoints = Math.min(100, s.sweeperPoints + 50);
          patch.breakPills = s.breakPills + 2;
        } else if (id === 'su_linger') {
          patch.herbs = s.herbs + 40;
          patch.healPills = s.healPills + 4;
        } else if (id === 'qian_wanguan') {
          patch.stones = s.stones + 800;
          patch.ores = s.ores + 30;
        }

        set({
          ...patch,
          npcs: {
            ...s.npcs,
            [id]: {
              ...st,
              claimedMaxGift: true,
              memories: [`${nowTime()} 获赠至交信物【${def.keepsakeName}】（${rewardText}）`, ...st.memories].slice(0, 8),
            },
          },
          logs: [
            makeLog(
              `✦ 缔结【${def.maxTitle}】！获【${def.name}】赠予至交信物【${def.keepsakeName}】：${rewardText}！`,
              'breakthrough'
            ),
            ...s.logs,
          ].slice(0, 40),
        });
        const achPatch = evaluateAchievements(get());
        if (achPatch) set(achPatch);

        return { ok: true, msg: `✦ 获赠【${def.keepsakeName}】：${rewardText}！` };
      },

      resolveEncounter: (choiceIndex) => {
        const s = get();
        const ev = s.pendingEncounter;
        if (!ev) return '';
        const choice = ev.choices[choiceIndex] ?? ev.choices[0];
        const { realm, qiPerSec } = computeStats(s);
        const tierMult = ev.tier === 'legendary' ? 2.2 : ev.tier === 'rare' ? 1.45 : 1;

        let resultMsg = '';
        const patch: Partial<GameState> = { pendingEncounter: null, encounterTick: 0 };

        if (choice.outcomeType === 'qi') {
          const gain = Math.round(qiPerSec * 38 * tierMult);
          patch.qi = Math.min(realm.qiRequired, s.qi + gain);
          resultMsg = `顿悟大道，修为暴涨 +${gain}！`;
          soundEngine.playMeditate();
        } else if (choice.outcomeType === 'stones') {
          const gain = Math.round((80 + s.realmId * 60) * tierMult);
          patch.stones = s.stones + gain;
          resultMsg = `满载而归，获灵石 +${gain}！`;
          soundEngine.playClick();
        } else if (choice.outcomeType === 'herb_ore') {
          patch.herbs = s.herbs + Math.round(4 * tierMult);
          patch.ores = s.ores + Math.round(4 * tierMult);
          resultMsg = `采得灵草×${Math.round(4 * tierMult)}、玄铁矿×${Math.round(4 * tierMult)}！`;
          soundEngine.playClick();
        } else if (choice.outcomeType === 'pill') {
          patch.breakPills = s.breakPills + 1;
          patch.healPills = s.healPills + 2;
          resultMsg = `收获【破境丹】×1 与【回春丹】×2！`;
          soundEngine.playEpicLoot();
        } else if (choice.outcomeType === 'heal_pills') {
          patch.healPills = s.healPills + 4;
          resultMsg = `获赠疗伤圣药【回春丹】×4！`;
          soundEngine.playMeditate();
        } else if (choice.outcomeType === 'fish_rare') {
          const rarePool = FISH_CODEX.filter((f) => f.rarity === 'mystic' || f.rarity === 'immortal');
          const caught = rarePool[Math.floor(Math.random() * rarePool.length)] ?? FISH_CODEX[FISH_CODEX.length - 1];
          patch.stones = s.stones + caught.stoneValue;
          if (!(s.fishCodex ?? []).includes(caught.id)) {
            patch.fishCodex = [...(s.fishCodex ?? []), caught.id];
          }
          resultMsg = `用旧竹竿一杆钓起稀世奇珍【${caught.name}】，图鉴已点亮！`;
          soundEngine.playEpicLoot();
        } else if (choice.outcomeType === 'sweeper_legacy') {
          patch.sweeperPoints = Math.min(100, (s.sweeperPoints ?? 0) + 35);
          resultMsg = `得古仙指点，后山扫地传承进度 +35%！`;
          soundEngine.playEpicLoot();
        } else if (choice.outcomeType === 'story_chain_next') {
          const nextStage = Math.min(3, (s.storyChainStage ?? 0) + 1);
          patch.storyChainStage = nextStage;
          if (nextStage >= 3) {
            const drop = generateArtifact(s.realmId + 2, s.luckLevel + 5, 'immortal');
            patch.inventory = [drop, ...s.inventory].slice(0, 36);
            patch.recentDrop = drop;
            resultMsg = `【古盒残卷传承圆满】全属性永久 +25%，并获仙品重宝【${drop.name}】！`;
            soundEngine.playThunder(true);
          } else {
            resultMsg = `【古盒残卷】传承推进至 ${nextStage}/3 幕！静待下一幕机缘。`;
            soundEngine.playEpicLoot();
          }
        } else {
          const minR = ev.tier === 'legendary' ? 'mystic' : 'spirit';
          const drop = generateArtifact(s.realmId + 1, s.luckLevel + 2, minR);
          patch.inventory = [drop, ...s.inventory].slice(0, 36);
          patch.recentDrop = drop;
          resultMsg = `得${RARITY_META[drop.rarity].label}法宝【${drop.name}】！`;
          soundEngine.playEpicLoot();
        }

        patch.logs = [makeLog(`【奇遇·${ev.title}】${resultMsg}`, 'epic'), ...s.logs].slice(0, 40);
        set(patch);
        const achPatch = evaluateAchievements(get());
        if (achPatch) set(achPatch);
        return resultMsg;
      },

      equipItem: (itemId) => {
        const s = get();
        const item = s.inventory.find((i) => i.id === itemId);
        if (!item) return;
        const current = s.equipped[item.slot];
        const nextInv = s.inventory.filter((i) => i.id !== itemId);
        if (current) nextInv.unshift(current);
        soundEngine.playClick();
        set({
          equipped: { ...s.equipped, [item.slot]: item },
          inventory: nextInv,
        });
      },

      toggleLockItem: (itemId) => {
        const s = get();
        soundEngine.playClick();
        set({
          inventory: s.inventory.map((i) => (i.id === itemId ? { ...i, locked: !i.locked } : i)),
        });
      },

      sellItem: (itemId) => {
        const s = get();
        const item = s.inventory.find((i) => i.id === itemId);
        if (!item || item.locked) return 0;
        const price = RARITY_META[item.rarity].sellPrice + Math.round(item.power * 0.05);
        soundEngine.playClick();
        set({
          inventory: s.inventory.filter((i) => i.id !== itemId),
          stones: s.stones + price,
          logs: [makeLog(`坊市售出【${item.name}】，获灵石 +${price}。`, 'loot'), ...s.logs].slice(0, 40),
        });
        return price;
      },

      sellByRarity: (maxRarity) => {
        const s = get();
        const order = ['common', 'spirit', 'mystic', 'immortal'];
        const maxIdx = order.indexOf(maxRarity);
        let gained = 0;
        let count = 0;
        const kept: ArtifactItem[] = [];
        s.inventory.forEach((item) => {
          if (!item.locked && order.indexOf(item.rarity) <= maxIdx) {
            gained += RARITY_META[item.rarity].sellPrice + Math.round(item.power * 0.05);
            count += 1;
          } else {
            kept.push(item);
          }
        });
        if (count > 0) {
          soundEngine.playClick();
          set({
            inventory: kept,
            stones: s.stones + gained,
            logs: [makeLog(`批量售出 ${count} 件闲置法宝，获灵石 +${gained}！`, 'loot'), ...s.logs].slice(0, 40),
          });
        }
        return { count, gained };
      },

      autoEquipBest: () => {
        const s = get();
        const nextEquipped = { ...s.equipped };
        let nextInv = [...s.inventory];

        (['sword', 'talisman', 'robe'] as EquipSlot[]).forEach((slot) => {
          const candidates = nextInv.filter((i) => i.slot === slot);
          if (candidates.length === 0) return;
          candidates.sort((a, b) => b.power - a.power);
          const best = candidates[0];
          const cur = nextEquipped[slot];
          if (!cur || best.power > cur.power) {
            nextInv = nextInv.filter((i) => i.id !== best.id);
            if (cur) nextInv.push(cur);
            nextEquipped[slot] = best;
          }
        });

        soundEngine.playClick();
        set({ equipped: nextEquipped, inventory: nextInv });
      },

      meltTrash: () => {
        const s = get();
        let gained = 0;
        const kept: ArtifactItem[] = [];
        s.inventory.forEach((item) => {
          if (item.rarity === 'immortal' || item.locked) {
            kept.push(item);
          } else {
            gained += RARITY_META[item.rarity].sellPrice;
          }
        });
        if (gained > 0) {
          soundEngine.playClick();
          set({
            inventory: kept,
            stones: s.stones + gained,
            logs: [makeLog(`熔炼闲置法宝，提炼灵石 +${gained}。`, 'loot'), ...s.logs].slice(0, 40),
          });
        }
        return gained;
      },

      upgradeCave: (type) => {
        const s = get();
        const level = type === 'array' ? s.arrayLevel : type === 'sword' ? s.swordLevel : s.luckLevel;
        const cost = getUpgradeCost(type, level);
        if (s.stones < cost) return false;
        soundEngine.playMeditate();
        const patch =
          type === 'array'
            ? { arrayLevel: s.arrayLevel + 1 }
            : type === 'sword'
              ? { swordLevel: s.swordLevel + 1 }
              : { luckLevel: s.luckLevel + 1 };
        const label = type === 'array' ? '聚灵阵' : type === 'sword' ? '剑意淬炼' : '灵眼寻宝';
        set({
          ...patch,
          stones: s.stones - cost,
          logs: [makeLog(`消耗灵石 ${cost}，【${label}】升至 ${level + 1} 重。`, 'normal'), ...s.logs].slice(0, 40),
        });
        return true;
      },

      craftPill: (type) => {
        const s = get();
        const { realm, qiPerSec, gridBonus, npcSummary } = computeStats(s);
        const bonusChance = Math.min(0.95, gridBonus.bonusAlchemyChance + npcSummary.guAlchemyBonus);
        const extraProc = Math.random() < bonusChance ? 2 : 1;
        const mult = (s.daoPath === 'alchemy' ? 2 : 1) * extraProc;
        const procTag = extraProc > 1 ? '（丹火双成！）' : '';
        if (type === 'break') {
          if (s.herbs < 5 || s.stones < 40) return false;
          soundEngine.playEpicLoot();
          set({
            herbs: s.herbs - 5,
            stones: s.stones - 40,
            breakPills: s.breakPills + 1 * mult,
            logs: [makeLog(`丹炉清香四溢，成功炼成【破境丹】×${1 * mult}${procTag}`, 'loot'), ...s.logs].slice(0, 40),
          });
          return true;
        } else if (type === 'heal') {
          if (s.herbs < 2) return false;
          soundEngine.playMeditate();
          set({
            herbs: s.herbs - 2,
            healPills: s.healPills + 3 * mult,
            logs: [makeLog(`丹香袅袅，成功炼成【回春丹】×${3 * mult}${procTag}`, 'loot'), ...s.logs].slice(0, 40),
          });
          return true;
        } else {
          if (s.herbs < 3) return false;
          soundEngine.playMeditate();
          const qiGain = Math.round(qiPerSec * 45 * mult);
          set({
            herbs: s.herbs - 3,
            qi: Math.min(realm.qiRequired, s.qi + qiGain),
            logs: [makeLog(`服下【凝气丹】，周天运转，修为精进 +${qiGain}${procTag}`, 'loot'), ...s.logs].slice(0, 40),
          });
          return true;
        }
      },

      useHealPill: () => {
        const s = get();
        const { maxHp } = computeStats(s);
        if (s.healPills <= 0 || s.playerHp >= maxHp) return false;
        const healAmt = Math.round(maxHp * 0.55);
        soundEngine.playMeditate();
        set({
          healPills: s.healPills - 1,
          playerHp: Math.min(maxHp, s.playerHp + healAmt),
          recoverTimer: 0,
          defeatReport: null,
          healEvent: { seq: (s.healEvent?.seq ?? 0) + 1, amount: healAmt },
          logs: [makeLog(`吞服【回春丹】，生机涌动，回复气血 +${healAmt}！`, 'loot'), ...s.logs].slice(0, 40),
        });
        return true;
      },

      toggleAutoHeal: () => {
        soundEngine.playClick();
        set((s) => ({ autoHeal: !s.autoHeal }));
      },

      toggleMute: () => {
        const next = !get().muted;
        soundEngine.setMuted(next);
        if (!next && get().bgmVolume > 0.01) soundEngine.startBgm();
        set({ muted: next });
      },

      setAudioVolumes: (bgm, sfx) => {
        soundEngine.setVolumes(bgm, sfx);
        set({ bgmVolume: bgm, sfxVolume: sfx });
      },

      setBarOpacity: (opacity) => {
        set({ barOpacity: Math.max(0.55, Math.min(1, opacity)) });
      },

      setLocale: (locale) => {
        soundEngine.playClick();
        set({ locale });
      },

      openUnlockModal: () => {
        soundEngine.playClick();
        set({ showUnlockModal: true });
      },

      closeUnlockModal: () => {
        soundEngine.playClick();
        set({ showUnlockModal: false });
      },

      activateFullEdition: (code) => {
        if (!verifyActivationCode(code)) {
          return { ok: false, msg: '激活码无效，请核对后重试（支持区分大小写忽略）' };
        }
        soundEngine.playThunder(true);
        const s = get();
        set({
          fullUnlocked: true,
          showUnlockModal: false,
          logs: [
            makeLog('✦ 仙缘圆满！《桌面修仙录》完整版已永久激活，50 重秘境与 14 重境界全面开启！', 'breakthrough'),
            ...s.logs,
          ].slice(0, 40),
        });
        return { ok: true, msg: '✦ 完整版激活成功！已保留全部修为存档，尽情破境飞升吧！' };
      },

      claimOnboardingStep: () => {
        const s = get();
        const step = s.onboardingStep;
        if (step === 0) {
          soundEngine.playEpicLoot();
          set({ stones: s.stones + 40, onboardingStep: 1 });
          return '新手指引(1/5)完成：获灵石 +40！';
        }
        if (step === 1) {
          soundEngine.playEpicLoot();
          set({ healPills: s.healPills + 2, onboardingStep: 2 });
          return '新手指引(2/5)完成：获回春丹 ×2！';
        }
        if (step === 2) {
          soundEngine.playEpicLoot();
          set({ stones: s.stones + 80, onboardingStep: 3 });
          return '新手指引(3/5)完成：获灵石 +80！';
        }
        if (step === 3) {
          soundEngine.playEpicLoot();
          set({ breakPills: s.breakPills + 1, onboardingStep: 4 });
          return '新手指引(4/5)完成：获破境丹 ×1！';
        }
        if (step === 4) {
          soundEngine.playThunder(true);
          set({ stones: s.stones + 120, onboardingStep: 5 });
          return '✦ 新手指引全部完成！获灵石 +120，仙途海阔凭鱼跃！';
        }
        return '';
      },

      exportSaveString: () => {
        const raw = localStorage.getItem('desktop-xiuxian-save-v1') ?? '{}';
        return btoa(unescape(encodeURIComponent(raw)));
      },

      importSaveString: (encoded) => {
        try {
          const decoded = decodeURIComponent(escape(atob(encoded)));
          const parsed = JSON.parse(decoded);
          if (!parsed || !parsed.state) {
            return { ok: false, msg: '存档码格式无效' };
          }
          localStorage.setItem('desktop-xiuxian-save-v1', decoded);
          set({ ...INITIAL_STATE, ...parsed.state, lastSavedAt: Date.now() });
          return { ok: true, msg: '存档导入成功！已恢复仙途进度！' };
        } catch {
          return { ok: false, msg: '存档码解析失败，请确认完整复制' };
        }
      },

      dismissAchievement: () => set({ recentAchievement: null }),

      dismissOfflineReport: () => set({ offlineReport: null }),

      dismissDefeatReport: () => set({ defeatReport: null }),

      resetSave: () => set({ ...INITIAL_STATE, lastSavedAt: Date.now() }),
    }),
    {
      name: 'desktop-xiuxian-save-v1',
      partialize: (state) => {
        const { battleEvent, enemyAttackEvent, healEvent, recentAchievement, defeatReport, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (typeof state.playerHp !== 'number') state.playerHp = REALMS[state.realmId ?? 0]?.baseHp ?? 120;
        if (typeof state.healPills !== 'number') state.healPills = 3;
        if (typeof state.autoHeal !== 'boolean') state.autoHeal = false;
        if (typeof state.recoverTimer !== 'number') state.recoverTimer = 0;
        if (typeof state.monsterAtk !== 'number') state.monsterAtk = 8;
        if (typeof state.enemyAttackCount !== 'number') state.enemyAttackCount = 0;
        if (typeof state.ores !== 'number') state.ores = 2;
        if (typeof state.forgeCount !== 'number') state.forgeCount = 0;
        if (!Array.isArray(state.unlockedSkills)) state.unlockedSkills = ['qinglian'];
        if (!state.skillCooldowns) state.skillCooldowns = { qinglian: 0, thunder: 0, spirit_surge: 0, wanjian: 0 };
        if (typeof state.autoCastSkills !== 'boolean') state.autoCastSkills = true;
        if (!state.activeCraft) state.activeCraft = 'fishing';
        if (typeof state.craftProgress !== 'number') state.craftProgress = 0;
        if (!state.craftLevels) state.craftLevels = { fishing: 1, herbalism: 1, mining: 1 };
        if (!Array.isArray(state.ownedPets)) state.ownedPets = [];
        if (state.activePet === undefined) state.activePet = null;
        if (typeof state.towerFloor !== 'number') state.towerFloor = 0;
        if (typeof state.isTowerFight !== 'boolean') state.isTowerFight = false;
        if (!Array.isArray(state.unlockedAchievements)) state.unlockedAchievements = [];
        if (!Array.isArray(state.bossesDefeated)) state.bossesDefeated = [];
        if (typeof state.isBossFight !== 'boolean') state.isBossFight = false;
        if (typeof state.bossTimer !== 'number') state.bossTimer = 0;
        if (typeof state.encounterTick !== 'number') state.encounterTick = 0;
        if (typeof state.swordIntent !== 'number') state.swordIntent = 0;
        if (typeof state.burstTimer !== 'number') state.burstTimer = 0;
        if (!state.slackingMode) state.slackingMode = 'sleep';
        if (state.cloneSlackingMode === undefined) state.cloneSlackingMode = null;
        if (state.daoPath === undefined) state.daoPath = null;
        if (!Array.isArray(state.fishCodex)) state.fishCodex = [];
        if (typeof state.sweeperPoints !== 'number') state.sweeperPoints = 0;
        if (state.petQuip === undefined) state.petQuip = null;
        if (typeof state.gameSpeed !== 'number') state.gameSpeed = 1;
        if (!state.exploreRoute) state.exploreRoute = 'safe';
        if (!Array.isArray(state.caveGrid) || state.caveGrid.length !== 9) {
          state.caveGrid = [null, 'herb_field', null, null, 'spirit_array', null, null, null, null];
        }
        if (typeof state.storyChainStage !== 'number') state.storyChainStage = 0;
        if (typeof state.reincarnations !== 'number') state.reincarnations = 0;
        if (!Array.isArray(state.unlockedEndings)) state.unlockedEndings = [];
        if (!state.petStates) state.petStates = makeDefaultPetStates();
        if (!state.npcs) state.npcs = makeDefaultNpcs();
        if (typeof state.bgmVolume !== 'number') state.bgmVolume = 0.35;
        if (typeof state.sfxVolume !== 'number') state.sfxVolume = 0.7;
        if (typeof state.barOpacity !== 'number') state.barOpacity = 0.94;
        if (typeof state.onboardingStep !== 'number') state.onboardingStep = 0;
        if (!SECRET_GROUNDS.some((g) => g.id === state.groundId)) state.groundId = SECRET_GROUNDS[0].id;

        soundEngine.setMuted(Boolean(state.muted));
        soundEngine.setVolumes(state.bgmVolume, state.sfxVolume);
        const elapsedSec = Math.floor((Date.now() - state.lastSavedAt) / 1000);
        if (elapsedSec >= 30) {
          const capped = Math.min(elapsedSec, 24 * 3600);
          const { realm, qiPerSec } = computeStats(state);
          const qiGain = Math.round(qiPerSec * capped * 0.5);
          const stoneGain = Math.round(capped * 0.4 * (1 + state.realmId * 0.5));
          state.qi = Math.min(realm.qiRequired, state.qi + qiGain);
          state.stones += stoneGain;
          const stories = [
            '顾长生在你闭关期间又把丹房熏黑了，不好意思地留了些灵石赔罪。',
            '柳清霜师姐路过你的洞府，见你气息沉稳，轻轻点了点头。',
            state.activePet
              ? `随行灵宠【${PETS.find((p) => p.id === state.activePet)?.name}】在灵田边打了个大盹，心情极好。`
              : '陈老头在山门前扫完落叶，顺手帮你挡下了路过的闹事小妖。',
          ];
          state.offlineReport = { seconds: capped, qiGain, stoneGain, stories };
          state.lastSavedAt = Date.now();
        }
      },
    }
  )
);
