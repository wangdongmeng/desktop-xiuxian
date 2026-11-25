export type Rarity = 'common' | 'spirit' | 'mystic' | 'immortal';
export type EquipSlot = 'sword' | 'talisman' | 'robe';
export type CraftType = 'fishing' | 'herbalism' | 'mining';
export type SkillId = 'qinglian' | 'thunder' | 'spirit_surge' | 'wanjian';
export type PetId = 'fox' | 'turtle' | 'crane' | 'dragon';
export type SlackingMode = 'sleep' | 'tea' | 'fishing' | 'sweep' | 'spa' | 'daydream';
export type DaoPathId = 'sword' | 'alchemy' | 'beast' | 'body' | 'slacking';
export type EncounterTier = 'common' | 'rare' | 'legendary';
export type ExploreRoute = 'safe' | 'danger' | 'mystery';
export type GameSpeed = 0 | 1 | 2;
export type BuildingId =
  | 'spirit_array'
  | 'herb_field'
  | 'alchemy_room'
  | 'forge_hall'
  | 'beast_garden'
  | 'spring_pool'
  | 'scripture_pavilion'
  | 'enlightenment_altar';

export interface BuildingDef {
  id: BuildingId;
  name: string;
  emoji: string;
  cost: number;
  desc: string;
}

export interface SynergyInfo {
  id: string;
  title: string;
  desc: string;
}

export type ArtifactAffixId = 'lightning_proc' | 'double_strike' | 'qi_siphon' | 'greed' | 'boss_slayer';

export interface ArtifactAffix {
  id: ArtifactAffixId;
  name: string;
  desc: string;
}

export interface ArtifactItem {
  id: string;
  name: string;
  slot: EquipSlot;
  rarity: Rarity;
  atkBonus: number;
  qiRateBonus: number;
  critBonus: number;
  power: number;
  affix?: ArtifactAffix;
  locked?: boolean;
}

export interface RealmDef {
  id: number;
  name: string;
  stage: string;
  qiRequired: number;
  baseQiPerSec: number;
  baseAtk: number;
  baseHp: number;
  breakthroughRate: number;
  unlockNote?: string;
}

export interface MonsterDef {
  name: string;
  kind: 'imp' | 'serpent' | 'wolf' | 'ghost' | 'golem' | 'demon';
  maxHp: number;
  atk: number;
  stoneReward: number;
  qiReward: number;
  herbChance: number;
  dropChance: number;
  isBoss?: boolean;
}

export interface SecretGround {
  id: string;
  name: string;
  minRealmId: number;
  desc: string;
  monsters: MonsterDef[];
  boss: MonsterDef;
}

export interface SkillDef {
  id: SkillId;
  name: string;
  desc: string;
  cooldownSec: number;
  unlockCost: number;
  minRealmId: number;
  dmgMult: number;
  guaranteedCrit?: boolean;
  qiBurstSec?: number;
  color: string;
}

export interface PetEvolutionBranch {
  id: string;
  name: string;
  tag: string;
  bonusDesc: string;
  atkPctBonus: number;
  qiPctBonus: number;
  critBonus: number;
}

export interface PetState {
  affinity: number;
  exp: number;
  stage: number; // 0:幼年 1:成长 2:成熟 3:觉醒 4:神兽
  mood: '开心' | '平静' | '傲娇' | '满足' | '悟道';
  activity: string;
  evolutionBranch: string | null;
  memories: string[];
}

export interface NpcDef {
  id: string;
  name: string;
  title: string;
  realm: string;
  age: number;
  avatarEmoji: string;
  personalities: string[];
  likes: string;
  secret: string;
  relations: string[];
  schedules: { morning: string; noon: string; afternoon: string; night: string };
  dialogues: string[];
  perkDesc: string;
  perk40: string;
  perk80: string;
  maxTitle: string;
  perk100: string;
  keepsakeName: string;
  keepsakeRewardDesc: string;
  maxDialogue: string;
}

export interface NpcState {
  affinity: number; // 0..100
  unlockedSecret: boolean;
  claimedMaxGift?: boolean;
  memories: string[];
}

export interface PetDef {
  id: PetId;
  name: string;
  title: string;
  personality: string;
  desc: string;
  costStones: number;
  qiPct: number;
  atkPct: number;
  critBonus: number;
  breakBonus: number;
  stonePct: number;
  activities: string[];
  branches: [PetEvolutionBranch, PetEvolutionBranch];
}

export interface FishItem {
  id: string;
  name: string;
  rarity: Rarity;
  desc: string;
  stoneValue: number;
}

export interface DaoPathDef {
  id: DaoPathId;
  name: string;
  tag: string;
  desc: string;
}

export interface AchievementDef {
  id: string;
  title: string;
  desc: string;
  rewardStones: number;
  rewardPills?: number;
}

export interface EncounterChoice {
  label: string;
  hint: string;
  outcomeType:
    | 'stones'
    | 'qi'
    | 'herb_ore'
    | 'gamble_artifact'
    | 'pill'
    | 'heal_pills'
    | 'fish_rare'
    | 'sweeper_legacy'
    | 'story_chain_next';
}

export interface EncounterEvent {
  id: string;
  tier: EncounterTier;
  title: string;
  story: string;
  choices: EncounterChoice[];
}

export interface BattleLog {
  id: string;
  text: string;
  tone: 'normal' | 'loot' | 'epic' | 'breakthrough' | 'warn';
  time: string;
}

export interface FloatingText {
  id: string;
  text: string;
  color: string;
}

export interface EnemyAttackEvent {
  seq: number;
  damage: number;
  isHeavy: boolean;
}

export interface HealEvent {
  seq: number;
  amount: number;
}

export interface BattleEvent {
  seq: number;
  damage: number;
  isCrit: boolean;
  killed: boolean;
  skillId?: SkillId;
  isManual?: boolean;
  isDouble?: boolean;
  lightningProc?: boolean;
  lootRarity?: Rarity;
  lootName?: string;
}

export interface ElectronAPI {
  isElectron: boolean;
  setMode: (mode: 'full' | 'bar') => Promise<'full' | 'bar'>;
  minimize: () => Promise<void>;
  hideToTray?: () => Promise<void>;
  close: () => Promise<void>;
  toggleVisibility?: () => Promise<boolean>;
  writeSaveFile?: (jsonString: string) => Promise<boolean>;
  readSaveFile?: () => Promise<string | null>;
  openSaveFolder?: () => Promise<string>;
  unlockSteamAchievement?: (achId: string) => Promise<boolean>;
  getSteamStatus?: () => Promise<{ connected: boolean; appId: number | null; playerName: string | null }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
