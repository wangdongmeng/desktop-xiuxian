import {
  AchievementDef,
  ArtifactAffix,
  BuildingDef,
  DaoPathDef,
  EncounterEvent,
  NpcDef,
  PetDef,
  Rarity,
  RealmDef,
  SecretGround,
  SkillDef,
} from './types';

export type Locale = 'zh' | 'en';

export function detectDefaultLocale(): Locale {
  if (typeof navigator === 'undefined') return 'zh';
  const lang = (navigator.language || 'zh').toLowerCase();
  return lang.startsWith('zh') ? 'zh' : 'en';
}

const UI_STRINGS: Record<string, { zh: string; en: string }> = {
  // Brand & Title
  gameTitle: { zh: '桌面修仙录', en: 'Desktop Xiuxian' },
  gameTagline: { zh: '极简东方水墨放置', en: 'Minimalist Ink-Wash Idle Cultivation' },
  titleDesc1: { zh: '闭关吐纳于案头，御剑斩妖于方寸。', en: 'Cultivate quietly at your desk, slay demons in ink.' },
  titleDesc2: { zh: '支持一键缩入屏幕底部，上班摸鱼亦不误渡劫飞升。', en: 'Collapse to a floating desktop bar — idle while you work.' },
  versionBadge: { zh: 'v1.0 · Steam 正式版', en: 'v1.0 · Steam Edition' },
  sealChar: { zh: '道', en: '道' },
  startNew: { zh: '踏入仙途', en: 'Begin Cultivation' },
  continueGame: { zh: '再续仙缘', en: 'Continue Journey' },
  startBar: { zh: '直入桌面摸鱼条', en: 'Launch Desktop Bar' },
  bossKeyHint: { zh: '老板键：Cmd+Shift+X（Windows: Ctrl+Shift+X）一键隐身/唤出', en: 'Boss Key: Cmd/Ctrl+Shift+X to Hide / Show' },
  autoSaveHint: { zh: '自动本地存档 · 支持离线闭关收益', en: 'Auto-Save · Offline Cultivation Gains' },
  curRealmKills: { zh: '当前境界：{realm} · 已斩妖 {kills}', en: 'Realm: {realm} · Slain: {kills}' },

  // Header & Tabs
  lifeSubtitle: { zh: '第 {n} 世 · 案头问仙', en: 'Life #{n} · Desk Dao' },
  encounterBtn: { zh: '奇遇!', en: 'Event!' },
  barModeBtn: { zh: '摸鱼画卷', en: 'Mini Bar' },
  expandBtn: { zh: '展开', en: 'Expand' },
  tabBattle: { zh: '秘境锁妖', en: 'Realms' },
  tabBag: { zh: '法宝({n})', en: 'Gear({n})' },
  tabCrafts: { zh: '摸鱼百艺', en: 'Idle Life' },
  tabCave: { zh: '流派炼丹', en: 'Cave & Pills' },
  tabPets: { zh: '故人灵宠', en: 'Bonds' },
  recoveringBadge: { zh: '重伤调息 {s}s', en: 'Recovering {s}s' },

  // Left Cultivation Panel
  curMode: { zh: '当前：', en: 'Mode: ' },
  cloneTag: { zh: ' + 分身', en: ' + Clone ' },
  curQi: { zh: '当前修为', en: 'Spirit Qi' },
  breakReady: { zh: '渡劫突破（成功率 {rate}%）', en: 'Breakthrough ({rate}%)' },
  breakNotReady: { zh: '修为未满，继续吐纳', en: 'Gathering Qi...' },
  breakMax: { zh: '已证大道', en: 'Ascended Peak' },
  useBreakPill: { zh: '服「破境丹」(+22%)', en: 'Use Pill (+22%)' },
  leftCount: { zh: '余 {n}', en: 'x{n}' },
  statQi: { zh: '吐纳/秒', en: 'Qi / sec' },
  statAtk: { zh: '御剑攻击', en: 'Sword ATK' },
  statCrit: { zh: '天雷会心', en: 'Crit Rate' },

  // Battle Tab
  swordIntentLabel: { zh: '剑意蓄势（点击上方战场可「弹指剑气」加速充能）', en: 'Sword Intent (Click arena to cast Sword Qi)' },
  burstActive: { zh: '无双爆发 {s}s', en: 'Unrivaled {s}s' },
  healPillBtn: { zh: '回春丹({n})', en: 'Heal({n})' },
  autoHeal: { zh: '自动服丹', en: 'Auto-Heal' },
  burstBtn: { zh: '人剑合一', en: 'Unleash' },
  burstBtnActive: { zh: '无双中!', en: 'Active!' },
  skillsTitle: { zh: '神通秘术', en: 'Mystic Arts' },
  autoCast: { zh: '自动施法', en: 'Auto-Cast' },
  retreatBtn: { zh: '退回常规秘境', en: 'Retreat' },
  towerBtn: { zh: '锁妖塔·{n}层', en: 'Tower F{n}' },
  bossBtn: { zh: '妖王·{name}', en: 'Boss · {name}' },
  skillClick: { zh: '点击施放', en: 'Ready' },
  skillCd: { zh: '神通调息中', en: 'Recharging' },
  skillUnlock: { zh: '解锁 {cost} 灵石', en: 'Unlock {cost} Stones' },
  routeLabel: { zh: '秘境路线：', en: 'Route:' },
  stagesTitle: { zh: '五十重秘境（已通关 {n}/{total}）', en: '50 Secret Grounds ({n}/{total} Cleared)' },
  autoNextStage: { zh: '通关自动进下一关', en: 'Auto-Advance' },
  jumpHighest: { zh: '直飞最高解锁关 →', en: 'Jump to Highest →' },
  stageActive: { zh: '历练中', en: 'Active' },
  stageCleared: { zh: '已通关', en: 'Cleared' },
  stageGo: { zh: '前往挑战', en: 'Enter' },
  stageNeedPrev: { zh: '需先通关上一关', en: 'Clear Prev Stage' },
  stageNeedRealm: { zh: '需 {realm}', en: 'Req. {realm}' },

  // Bag Tab
  notEquipped: { zh: '尚未佩戴', en: 'Empty Slot' },
  bagCount: { zh: '行囊共 {n}/36 件，可单件穿戴或售卖', en: 'Bag {n}/36 — Equip, lock, or sell items' },
  autoEquipBtn: { zh: '一键最强', en: 'Auto-Equip' },
  sellCommonBtn: { zh: '售凡品', en: 'Sell Common' },
  sellSpiritBtn: { zh: '售凡+灵', en: 'Sell ≤Spirit' },
  sellAllTrashBtn: { zh: '全售非仙品', en: 'Sell Non-Immortal' },
  bagEmpty: { zh: '行囊空空，待秘境斩妖或炼器炉锻造后法宝将收入囊中。', en: 'Bag is empty. Slay demons or forge artifacts to earn gear.' },
  equipBtn: { zh: '穿戴', en: 'Equip' },
  lockedLabel: { zh: '已锁定', en: 'Locked' },
  sellPriceBtn: { zh: '卖 +{p}石', en: 'Sell +{p}' },

  // Crafts Tab
  slackingHeader: { zh: '摸鱼生活姿态（选择今日的修仙摸鱼方式）', en: 'Idle Cultivation Stances' },
  cloneUnlocked: { zh: '元婴分身已解锁！', en: 'Nascent Clone Unlocked!' },
  cloneLocked: { zh: '元婴初期可解锁分身双线摸鱼', en: 'Dual-Idle unlocks at Nascent Soul' },
  bodyActive: { zh: '本体', en: 'Active' },
  switchBtn: { zh: '切换', en: 'Select' },
  cloneActive: { zh: '分身中', en: 'Cloning' },
  cloneBtn: { zh: '分身', en: 'Clone' },
  sweeperTitle: { zh: '🧹 扫地老仙传承', en: '🧹 Sweeper Sage Legacy' },
  sweeperDone: { zh: '已觉醒！永久获得 攻击 +20% · 吐纳 +20%', en: 'Awakened! Permanent ATK +20% · Qi +20%' },
  sweeperDesc: { zh: '切换【后山扫地】积累心得，满 100% 觉醒隐藏传承！', en: 'Sweep the courtyard to 100% to awaken hidden legacy!' },
  bgGather: { zh: '后台材料采集：', en: 'Background Gathering:' },
  fishCodexTitle: { zh: '🎣 垂钓奇珍图鉴（{n}/{total}）', en: '🎣 Rare Fish Codex ({n}/{total})' },
  fishBonus: { zh: '当前加成 +{n}%', en: 'Bonus +{n}%' },
  forgeTitle: { zh: '炼器炉鼎 · 定向锻造神兵', en: 'Artifact Forge Furnace' },
  forgeDesc: { zh: '耗 玄铁矿×5 + 灵石×60，必出灵品以上神兵（余玄铁 {ores}）', en: 'Cost: 5 Ore + 60 Stones · Guaranteed ≥Spirit (Ore: {ores})' },
  forgeBtn: { zh: '开炉锻造', en: 'Forge Gear' },

  // Cave & Alchemy Tab
  caveTitle: { zh: '2.5D 动态仙山洞府（点击任意两块灵地互换位置）', en: '2.5D Floating Sanctuary (Click two tiles to swap)' },
  caveSynergyCount: { zh: '相邻建筑自动激活风水共鸣 · 已激活 {n}/5 项', en: 'Adjacent buildings trigger Feng Shui · Active {n}/5' },
  showSynergies: { zh: '查看风水共鸣图谱', en: 'Synergy Guide' },
  hideSynergies: { zh: '收起共鸣图谱', en: 'Hide Guide' },
  daoPathsTitle: { zh: '五大本命流派', en: 'Five Great Dao Paths' },
  daoLockedHint: { zh: '🔒 突破至【炼气初期】解锁择定', en: '🔒 Unlocks at Qi Refining I' },
  daoSwitchHint: { zh: '改换流派需 100 灵石', en: 'Switching costs 100 Stones' },
  daoFreeHint: { zh: '首次择定免费！', en: 'First choice is FREE!' },
  daoChosen: { zh: '✦ 已择定', en: '✦ Active' },
  upgradeBtn: { zh: '升级（{cost} 灵石）', en: 'Upgrade ({cost} Stones)' },
  alchemyTitle: { zh: '丹房炼丹', en: 'Alchemy Pavilion' },
  craftHealTitle: { zh: '回春丹 ×3', en: 'Heal Pill ×3' },
  craftHealDesc: { zh: '战斗瞬回 55% 气血', en: 'Restores 55% Max HP' },
  craftHealCost: { zh: '耗：灵草×2（余 {n}）', en: 'Cost: 2 Herbs (Own {n})' },
  craftHealBtn: { zh: '炼制疗伤丹', en: 'Brew Heal' },
  craftBreakTitle: { zh: '破境丹 ×1', en: 'Breakthrough Pill ×1' },
  craftBreakDesc: { zh: '渡劫成功率 +22%', en: 'Breakthrough +22%' },
  craftBreakCost: { zh: '耗：灵草×5、灵石×40', en: 'Cost: 5 Herbs, 40 Stones' },
  craftBreakBtn: { zh: '炼制破境丹', en: 'Brew Pill' },
  craftQiTitle: { zh: '凝气丹', en: 'Qi Elixir' },
  craftQiDesc: { zh: '立获 45 秒修为精进', en: 'Instant 45s Qi Surge' },
  craftQiCost: { zh: '耗：灵草×3', en: 'Cost: 3 Herbs' },
  craftQiBtn: { zh: '炼服凝气丹', en: 'Brew & Drink' },

  // Companions Tab
  subNpcs: { zh: '宗门故人 ({n}/5 至交)', en: 'Sect Bonds ({n}/5 Max)' },
  subPets: { zh: '灵宠养成 ({n}/{total})', en: 'Spirit Pets ({n}/{total})' },
  subReinc: { zh: '轮回成就 ({n}/{total})', en: 'Rebirth & Ach ({n}/{total})' },
  npcBannerTitle: { zh: '宗门故人羁绊总加成', en: 'Total Sect Companion Bonuses' },
  npcMaxCount: { zh: '已结至交 {n}/5', en: 'Soulmates {n}/5' },
  npcBannerHint: { zh: '满 100 好感觉醒至交绝技 + 专属信物', en: '100 Affinity unlocks Ultimate Bond + Keepsake' },
  npcChat: { zh: '闲聊 (+4)', en: 'Chat (+4)' },
  npcChatMax: { zh: '共饮论道', en: 'Share Tea' },
  npcGift: { zh: '备礼拜访 (25石 / +18)', en: 'Gift (25 Stones / +18)' },
  npcClaimKeepsake: { zh: '领取至交信物【{name}】', en: 'Claim Keepsake [{name}]' },
  npcKeptKeepsake: { zh: '已珍藏信物【{name}】', en: 'Keepsake Kept [{name}]' },
  npcSecretLocked: { zh: '🔒 隐藏秘密：好感度达 80 解锁', en: '🔒 Secret unlocks at 80 Affinity' },
  npcSecretUnlocked: { zh: '🔓 隐藏秘密：', en: '🔓 Secret: ' },
  petActive: { zh: '随行出战中', en: 'Active' },
  petDeploy: { zh: '唤出随行', en: 'Deploy' },
  petContract: { zh: '契约({cost}石)', en: 'Bind ({cost})' },
  petPat: { zh: '抚摸 (+8成长)', en: 'Pet (+8 EXP)' },
  petFeed: { zh: '投喂灵草×2 (+22成长)', en: 'Feed 2 Herbs (+22 EXP)' },
  reincBtn: { zh: '兵解转世（需金丹）', en: 'Reincarnate (Golden Core)' },

  // Modals & Settings
  settingsTitle: { zh: '游戏设置与存档管理', en: 'Settings & Save Management' },
  langLabel: { zh: '界面语言 / Language', en: 'Language / 界面语言' },
  bgmLabel: { zh: '古筝轻音乐 (BGM)', en: 'Guqin / Guzheng BGM' },
  sfxLabel: { zh: '战斗与交互音效 (SFX)', en: 'Combat & UI SFX' },
  trackLabel: { zh: '仙乐曲目切换', en: 'Music Track' },
  trackAuto: { zh: '随境切换', en: 'Auto' },
  trackIdle: { zh: '洞府日常', en: 'Peaceful' },
  trackNight: { zh: '闭关悟道', en: 'Meditate' },
  trackBoss: { zh: '妖王激战', en: 'Boss' },
  opacityLabel: { zh: '桌面摸鱼画卷条透明度', en: 'Desktop Bar Opacity' },
  saveTitle: { zh: '本地存档备份 / Steam 云存档目录', en: 'Local Backup / Steam Cloud Folder' },
  openFolder: { zh: '存档目录', en: 'Save Folder' },
  exportSave: { zh: '导出存档码', en: 'Export Save' },
  copiedSave: { zh: '已复制存档码', en: 'Copied!' },
  importPlaceholder: { zh: '粘贴存档码后点击导入...', en: 'Paste save code to import...' },
  importBtn: { zh: '导入', en: 'Import' },
  dangerReset: { zh: '危险操作：清空当前全部修为与法宝', en: 'Danger: Wipe all progress & gear' },
  resetBtn: { zh: '重开一世', en: 'Reset Save' },
  confirmResetBtn: { zh: '确认清空重修', en: 'Confirm Wipe' },
  cancelBtn: { zh: '取消', en: 'Cancel' },
  steamConnected: { zh: 'Steam 已连 ({name})', en: 'Steam Connected ({name})' },
  localAutoSave: { zh: '本地自动存档已开启', en: 'Local Auto-Save Active' },

  // Stage Clear & Defeat & Offline Modals
  stageClearFirst: { zh: '✦ 首通破阵 · 关卡通关', en: '✦ First Clear · Stage Cleared!' },
  stageClearAgain: { zh: '✦ 再斩妖王 · 关卡通关', en: '✦ Boss Vanquished · Cleared!' },
  stageClearTitle: { zh: '已通关【{name}】', en: 'Cleared [{name}]' },
  stageClearNextBtn: { zh: '继续挑战下一关 →', en: 'Advance to Next Stage →' },
  stageClearStayBtn: { zh: '留在本关挂机', en: 'Stay & Idle Here' },
  stageClearDoneBtn: { zh: '收剑归位', en: 'Sheathe Sword' },
  defeatBadge: { zh: '身受重伤 · 道基震荡', en: 'Severely Wounded' },
  defeatTitle: { zh: '不敌【{killer}】', en: 'Defeated by [{killer}]' },
  defeatHealBtn: { zh: '急服回春丹起身 ({n})', en: 'Use Heal Pill ({n})' },
  defeatWaitBtn: { zh: '静候调息', en: 'Recover Quietly' },
  offlineTitle: { zh: '闭关归来 · 宗门日报', en: 'Offline Cultivation Report' },
  offlineClaim: { zh: '收入囊中', en: 'Claim All' },
  achUnlocked: { zh: '成就解锁', en: 'Achievement Unlocked' },
  laterBtn: { zh: '稍后处理', en: 'Later' },
};

export function t(locale: Locale, key: keyof typeof UI_STRINGS, vars?: Record<string, string | number>): string {
  const entry = UI_STRINGS[key];
  let str = entry ? entry[locale] : String(key);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

const REALM_EN: { name: string; stage: string }[] = [
  { name: 'Body Tempering', stage: 'Mortal' },
  { name: 'Qi Refining I', stage: 'Qi Refining' },
  { name: 'Qi Refining Peak', stage: 'Qi Refining' },
  { name: 'Foundation I', stage: 'Foundation' },
  { name: 'Foundation Peak', stage: 'Foundation' },
  { name: 'Golden Core I', stage: 'Golden Core' },
  { name: 'Golden Core Peak', stage: 'Golden Core' },
  { name: 'Nascent Soul I', stage: 'Nascent Soul' },
  { name: 'Nascent Soul Peak', stage: 'Nascent Soul' },
  { name: 'Soul Formation', stage: 'Ascension' },
  { name: 'Body Integration', stage: 'Ascension' },
  { name: 'Great Ascension', stage: 'Tribulation' },
  { name: 'Tribulation Peak', stage: 'Tribulation' },
  { name: 'Celestial Emperor', stage: 'Immortal' },
];

export function locRealm(realm: RealmDef, locale: Locale) {
  if (locale === 'zh') return { name: realm.name, stage: realm.stage };
  return REALM_EN[realm.id] ?? { name: realm.name, stage: realm.stage };
}

const RARITY_EN: Record<Rarity, string> = {
  common: 'Common',
  spirit: 'Spirit',
  mystic: 'Mystic',
  immortal: 'Immortal',
};

export function locRarity(rarity: Rarity, zhLabel: string, locale: Locale): string {
  return locale === 'zh' ? zhLabel : RARITY_EN[rarity];
}

const SLOT_EN = { sword: 'Flying Sword', talisman: 'Talisman', robe: 'Dao Robe' };
export function locSlot(slot: 'sword' | 'talisman' | 'robe', zhLabel: string, locale: Locale) {
  return locale === 'zh' ? zhLabel : SLOT_EN[slot];
}

const SKILL_EN: Record<string, { name: string; desc: string }> = {
  qinglian: { name: 'Azure Lotus', desc: 'Deals 2.6x ATK Sword Qi damage.' },
  thunder: { name: 'Violet Thunder', desc: 'Strikes for 4.2x ATK guaranteed Crit.' },
  spirit_surge: { name: 'Qi Circulation', desc: 'Instant 18s cultivation Qi surge.' },
  wanjian: { name: 'Myriad Swords', desc: 'Summons sword rain for 6.8x ATK.' },
};

export function locSkill(sk: SkillDef, locale: Locale) {
  if (locale === 'zh') return { name: sk.name, desc: sk.desc };
  return SKILL_EN[sk.id] ?? { name: sk.name, desc: sk.desc };
}

const ROUTE_EN = {
  safe: { name: 'Safe Patrol', desc: 'Monster DMG -25%, relaxed idle.' },
  danger: { name: 'Deep Danger', desc: 'Monster DMG +35%, Stones & Drops +60%!' },
  mystery: { name: 'Mystic Path', desc: 'Encounter speed +50%.' },
};
export function locRoute(key: 'safe' | 'danger' | 'mystery', zh: { name: string; desc: string }, locale: Locale) {
  return locale === 'zh' ? zh : ROUTE_EN[key];
}

const SLACKING_EN: Record<string, { name: string; short: string; desc: string }> = {
  sleep: { name: 'Cloud Nap', short: 'Nap', desc: 'Qi +35%, effortless idle.' },
  tea: { name: 'Spirit Tea', short: 'Tea', desc: 'Breakthrough +5%, steady Dao heart.' },
  fishing: { name: 'Jade Fishing', short: 'Fish', desc: 'Catch rare codex fish for permanent stats.' },
  sweep: { name: 'Courtyard Sweep', short: 'Sweep', desc: 'Build Sweeper Legacy (100% = +20% All).' },
  spa: { name: 'Spirit Spring', short: 'Spa', desc: 'ATK +15%, Crit +8%.' },
  daydream: { name: 'Cloud Gazing', short: 'Gaze', desc: 'Double random encounter trigger speed.' },
};

export function locSlacking(key: string, zh: { name: string; short: string; desc: string }, locale: Locale) {
  return locale === 'zh' ? zh : SLACKING_EN[key] ?? zh;
}

const CRAFT_EN: Record<string, string> = {
  fishing: 'Fish',
  herbalism: 'Herbs',
  mining: 'Ore',
};
export function locCraft(key: string, zhTitle: string, locale: Locale) {
  return locale === 'zh' ? zhTitle : CRAFT_EN[key] ?? zhTitle;
}

const DAO_EN: Record<string, { name: string; tag: string; desc: string }> = {
  sword: { name: 'Void Sword', tag: 'Extreme DPS', desc: 'Sword ATK +30%, Crit +8%.' },
  alchemy: { name: 'Pill Cauldron', tag: 'Double Pills', desc: 'All Alchemy crafting yields 2x output.' },
  beast: { name: 'Beast Tamer', tag: '2x Pet Buff', desc: 'Active Spirit Pet bonuses are doubled.' },
  body: { name: 'Vajra Body', tag: 'Unbreakable', desc: 'Max HP +60%, tank Boss heavy strikes.' },
  slacking: { name: 'Idle Dao', tag: 'Max Slacking', desc: 'All Idle Stance bonuses +55%.' },
};
export function locDaoPath(p: DaoPathDef, locale: Locale) {
  return locale === 'zh' ? { name: p.name, tag: p.tag, desc: p.desc } : DAO_EN[p.id] ?? p;
}

const BUILDING_EN: Record<string, { name: string; desc: string }> = {
  spirit_array: { name: 'Spirit Array', desc: 'Qi Rate +18%' },
  herb_field: { name: 'Herb Garden', desc: 'Auto-harvests Herbs every 5s' },
  alchemy_room: { name: 'Pill Room', desc: 'Alchemy double chance +35%' },
  forge_hall: { name: 'Forge Hall', desc: 'Sword ATK +16%' },
  beast_garden: { name: 'Beast Yard', desc: 'Pet bonus +20%' },
  spring_pool: { name: 'Spirit Spring', desc: 'Max HP +20%, steady regen' },
  scripture_pavilion: { name: 'Scripture Hall', desc: 'Skill cooldowns 15% faster' },
  enlightenment_altar: { name: 'Dao Altar', desc: 'Crit +8%, Breakthrough +5%' },
};
export function locBuilding(b: BuildingDef, locale: Locale) {
  return locale === 'zh' ? { name: b.name, desc: b.desc } : BUILDING_EN[b.id] ?? { name: b.name, desc: b.desc };
}

export function locGround(g: SecretGround, index: number, locale: Locale) {
  if (locale === 'zh') return { name: g.name, desc: g.desc, bossName: g.boss.name };
  return {
    name: `Stage ${index + 1} · Realm ${g.id.slice(1)}`,
    desc: `Stage ${index + 1} Secret Ground · Guardian Boss Awaits`,
    bossName: `Stage ${index + 1} Boss`,
  };
}

const NPC_EN: Record<
  string,
  {
    name: string;
    title: string;
    realm: string;
    secret: string;
    schedules: { morning: string; noon: string; afternoon: string; night: string };
    maxTitle: string;
    perk40: string;
    perk80: string;
    perk100: string;
    keepsakeName: string;
    keepsakeRewardDesc: string;
  }
> = {
  gu_changsheng: {
    name: 'Gu Changsheng',
    title: 'Alchemist',
    realm: 'Foundation Peak',
    secret: 'He actually possesses a 1-in-10,000 Innate Fire Spirit Root — his alchemy is just too wild.',
    schedules: {
      morning: 'Studying ancient pill recipes in the alchemy hall',
      noon: 'Firing up the cauldron — BOOM, another explosion!',
      afternoon: 'Covered in soot, gathering spirit herbs in the fields',
      night: 'Secretly practicing flame control by oil lamp',
    },
    maxTitle: 'Nine-Turn Fire Bond',
    perk40: 'Gifts return Heal Pill ×1',
    perk80: 'Qi Rate +10%',
    perk100: 'Qi +15% · Alchemy 2x Chance +25%',
    keepsakeName: 'Flame Pill Scroll',
    keepsakeRewardDesc: 'Break Pill ×2 + Heal ×5',
  },
  liu_qingshuang: {
    name: 'Liu Qingshuang',
    title: 'Senior Sister',
    realm: 'Golden Core Mid',
    secret: 'Though she scolds you for slacking off, she secretly shielded you from 3 Sect inspections.',
    schedules: {
      morning: 'Practicing 3,000 sword strikes on Azure Cliff',
      noon: 'Patrolling the sect and checking if you are slacking',
      afternoon: 'Sipping spirit tea alone beneath the pines',
      night: 'Meditating to nourish her natal flying sword',
    },
    maxTitle: 'Frost Sword Guardian',
    perk40: 'Sword ATK +12%',
    perk80: 'Crit Rate +6%',
    perk100: 'Sword ATK +20% · Crit +8%',
    keepsakeName: 'Frost Sword Tassel',
    keepsakeRewardDesc: 'Immortal Gear ×1 + Break Pill ×1',
  },
  chen_elder: {
    name: 'Elder Chen',
    title: 'Sweeper Sage',
    realm: 'Unfathomable',
    secret: 'He is the Sect Ancestor who severed the Demon Abyss 300 years ago, now retired to sweep leaves.',
    schedules: {
      morning: 'Leisurely sweeping fallen leaves at the mountain gate',
      noon: 'Napping under the ancient pine tree',
      afternoon: 'Watching anglers by the stream with a knowing smile',
      night: 'Gazing at the stars as his broom hums with sword intent',
    },
    maxTitle: 'One-Broom Ascension',
    perk40: 'Breakthrough +6%',
    perk80: 'All ATK +10%',
    perk100: 'All ATK +18% · Breakthrough +10%',
    keepsakeName: 'Ancestral Bamboo Twig',
    keepsakeRewardDesc: 'Sweeper +50 + Break Pill ×2',
  },
  su_linger: {
    name: 'Su Linger',
    title: 'Herb Maiden',
    realm: 'Qi Refining Peak',
    secret: 'Every herb she plants thrives because she was born with the Primordial Wood Spirit Body.',
    schedules: {
      morning: 'Watering the spirit herb fields with morning dew',
      noon: 'Sneaking spirit fruits to a passing little fox',
      afternoon: 'Writing herb mutation notes in the garden',
      night: 'Counting flying sword trails from her windowsill',
    },
    maxTitle: 'Evergreen Wood Spirit',
    perk40: 'Qi Rate +12%',
    perk80: 'Max HP +15%',
    perk100: 'Max HP +25% · Qi +15% · 4% HP Heal on Kill',
    keepsakeName: 'Primordial Wood Seed',
    keepsakeRewardDesc: 'Herbs ×40 + Heal Pill ×4',
  },
  qian_wanguan: {
    name: 'Qian Wanguan',
    title: 'Realm Merchant',
    realm: 'Golden Core I',
    secret: 'He is a realm-hopper trading cultivation treasures across worlds using a Space-Time Jade.',
    schedules: {
      morning: 'Tallying spirit stone accounts on his jade abacus',
      noon: 'Gathering secret realm treasure rumors at the teahouse',
      afternoon: 'Riding a paper crane to buy rare relics',
      night: 'Inspecting ancient fragments in his treasure pouch',
    },
    maxTitle: 'Celestial Trade Pact',
    perk40: 'Spirit Stones +18%',
    perk80: 'Crit Rate +5%',
    perk100: 'Stones +30% · Crit +8% · Loot Luck +4',
    keepsakeName: 'Golden Merchant Seal',
    keepsakeRewardDesc: 'Stones ×800 + Ore ×30',
  },
};

export function locNpc(npc: NpcDef, locale: Locale) {
  if (locale === 'zh') return npc;
  const en = NPC_EN[npc.id];
  return en ? { ...npc, ...en } : npc;
}

const PET_EN: Record<string, { name: string; title: string; desc: string }> = {
  fox: { name: 'Qingqiu Spirit Fox', title: 'Spirit Fox', desc: 'Boosts Qi gathering & Crit rate.' },
  turtle: { name: 'Xuanwu Spirit Turtle', title: 'Spirit Turtle', desc: 'Boosts Breakthrough & Qi stability.' },
  crane: { name: 'Lightning Spirit Crane', title: 'Thunder Crane', desc: 'Boosts Sword ATK & Crit strike.' },
  dragon: { name: 'Primordial Gold Dragon', title: 'Golden Dragon', desc: 'Supreme all-around ATK, Qi & Stones.' },
};

export function locPet(pet: PetDef, locale: Locale) {
  if (locale === 'zh') return { name: pet.name, title: pet.title, desc: pet.desc };
  return PET_EN[pet.id] ?? { name: pet.name, title: pet.title, desc: pet.desc };
}

const ACH_EN: Record<string, { title: string; desc: string }> = {
  first_kill: { title: 'First Blood', desc: 'Slay your first demon.' },
  kill_50: { title: 'Demon Hunter', desc: 'Slay 50 demons.' },
  kill_300: { title: 'Sword Sovereign', desc: 'Slay 300 demons.' },
  realm_zhuji: { title: 'Foundation Built', desc: 'Reach Foundation I.' },
  realm_jindan: { title: 'Golden Core', desc: 'Reach Golden Core I.' },
  first_immortal: { title: 'Immortal Relic', desc: 'Obtain an Immortal artifact.' },
  first_boss: { title: 'Boss Slayer', desc: 'Defeat any Guardian Boss.' },
  tower_5: { title: 'Tower Challenger', desc: 'Clear Demon Tower Floor 5.' },
  tower_15: { title: 'Tower Master', desc: 'Clear Demon Tower Floor 15.' },
  first_pet: { title: 'Spirit Companion', desc: 'Bind your first Spirit Pet.' },
  fish_5: { title: 'Master Angler', desc: 'Unlock 5 Fish Codex entries.' },
  sweeper_master: { title: 'Sweeper Sage', desc: 'Awaken Sweeper Legacy.' },
};

export function locAchievement(ach: AchievementDef, locale: Locale) {
  if (locale === 'zh') return { title: ach.title, desc: ach.desc };
  return ACH_EN[ach.id] ?? { title: ach.title, desc: ach.desc };
}

const ARTIFACT_PREFIX_EN: Record<string, string> = {
  青铁: 'Iron',
  素云: 'Cloud',
  粗制: 'Crude',
  山溪: 'Brook',
  青冥: 'Azure',
  流风: 'Gale',
  碧落: 'Jade',
  凝露: 'Dew',
  紫霄: 'Violet',
  太虚: 'Void',
  玄霜: 'Frost',
  星陨: 'Starfall',
  太初: 'Primordial',
  鸿蒙: 'Chaos',
  诛仙: 'Immortal-Slaying',
  九霄: 'Celestial',
};

const ARTIFACT_NOUN_EN: Record<string, string> = {
  飞剑: 'Flying Sword',
  灵刃: 'Spirit Blade',
  青锋: 'Edge',
  剑匣: 'Sword Box',
  灵符: 'Talisman',
  玉佩: 'Jade Pendant',
  镇魂印: 'Soul Seal',
  八卦镜: 'Bagua Mirror',
  道袍: 'Dao Robe',
  云裳: 'Cloud Vestment',
  鹤氅: 'Crane Cloak',
  法衣: 'Mystic Robe',
};

export function locArtifactName(name: string, locale: Locale): string {
  if (locale === 'zh') return name;
  for (const [pZh, pEn] of Object.entries(ARTIFACT_PREFIX_EN)) {
    if (name.startsWith(pZh)) {
      const rest = name.slice(pZh.length);
      const nEn = ARTIFACT_NOUN_EN[rest] ?? rest;
      return `${pEn} ${nEn}`;
    }
  }
  return name;
}

const AFFIX_EN: Record<string, { name: string; desc: string }> = {
  lightning_proc: { name: 'Thunder', desc: '22% chance on hit to call Violet Thunder (+65% DMG)' },
  double_strike: { name: 'Twin-Strike', desc: '25% chance to launch an extra flying sword' },
  qi_siphon: { name: 'Qi Siphon', desc: '+30% extra Qi gained from slaying demons' },
  greed: { name: 'Fortune', desc: '+28% extra Spirit Stones from slaying demons' },
  boss_slayer: { name: 'Boss Slayer', desc: '+35% DMG against Guardian Bosses & Tower Lords' },
};

export function locAffix(affix: ArtifactAffix, locale: Locale) {
  if (locale === 'zh') return affix;
  return { ...affix, ...(AFFIX_EN[affix.id] ?? {}) };
}

const SYNERGY_EN: Record<string, string> = {
  syn_herb: 'Spirit Harvest',
  syn_beast: 'Spring Beasts',
  syn_dao: 'Dao Insight',
  syn_alchemy: 'Fresh Brew',
  syn_forge: 'Spirit Forge',
};

export function locSynergyTitle(id: string, zhTitle: string, locale: Locale): string {
  return locale === 'zh' ? zhTitle : SYNERGY_EN[id] ?? zhTitle;
}

const ENCOUNTER_EN: Record<string, { title: string; story: string; choices: { label: string; hint: string }[] }> = {
  mountain_elder: {
    title: 'White-Haired Mountain Sage',
    story: 'While idling in the back hills, a serene immortal offers three items: "Fate brings us together, young Daoist. Choose one."',
    choices: [
      { label: 'Yellowed Cultivation Scroll', hint: 'Massive Qi insight' },
      { label: 'Fragrant Jade Pill Bottle', hint: 'Breakthrough Pill ×1' },
      { label: 'Plain Old Bamboo Rod', hint: 'Guaranteed rare Fish Codex!' },
    ],
  },
  talking_fish_event: {
    title: 'The Talking Spirit Fish',
    story: 'A golden-whiskered fish leaps from the stream and speaks: "Spare me, Daoist! Release me and I shall gift you a luminous pearl!"',
    choices: [
      { label: 'Release the Spirit Fish', hint: 'Large Spirit Stone reward' },
      { label: 'Ask for hidden spirit herbs', hint: 'Gain Herbs & Iron Ore' },
    ],
  },
  injured_cultivator: {
    title: 'Wounded Rogue Cultivator',
    story: 'A bloodied sword cultivator rests by the forest steps: "Fellow Daoist, spare some medicine? I will repay you with my treasure pouch."',
    choices: [
      { label: 'Share healing arts', hint: 'Receive a high-tier Artifact' },
      { label: 'Tend his wounds for elixirs', hint: 'Gain Heal Pill ×4' },
    ],
  },
  sealed_immortal: {
    title: 'Millennia-Sealed Ancient Immortal',
    story: 'An ancient laugh echoes from the well: "3,000 years, and finally a slacking youth walks by! Loosen one seal talisman and claim my blessing!"',
    choices: [
      { label: 'Receive Immortal Enlightenment', hint: 'Huge Cultivation Qi!' },
      { label: 'Claim his Ancient Relic', hint: 'Guaranteed Mystic/Immortal Gear!' },
      { label: 'Learn the Sweeping Dao', hint: 'Huge Sweeper Legacy boost!' },
    ],
  },
  future_self: {
    title: 'Time Rift · Your Future Self',
    story: 'The clouds warp as a figure in Celestial Emperor robes nods at you — wearing your exact face! They toss three beams of immortal light.',
    choices: [
      { label: 'Catch the Golden Pill Orb', hint: 'Breakthrough Pill ×1 + Heals' },
      { label: 'Catch the Azure Sword Orb', hint: 'High-tier Artifact' },
      { label: 'Catch the Radiant Stone Pouch', hint: 'Abundant Spirit Stones' },
    ],
  },
  alchemy_ruin: {
    title: 'Ancient Alchemy Ruin',
    story: 'Deep in the secret ground lies a forgotten stone pill chamber. The furnace is still warm, and jade vials exhale lingering spirit fragrance.',
    choices: [
      { label: 'Take the Healing Vials', hint: 'Gain Heal Pill ×4' },
      { label: 'Absorb residual Pill Qi', hint: 'Major Cultivation Qi gain' },
    ],
  },
  chain_1: {
    title: '[Legacy Chain I] Sunken Wooden Box',
    story: 'While idling by the stream, you kick an ancient rune-carved wooden box containing half of a glowing scripture calling for its other half.',
    choices: [
      { label: 'Bind with a drop of blood', hint: 'Begin Ancient Legacy Chain (1/3)' },
      { label: 'Take the Spirit Stones instead', hint: 'Gain Stones, pause legacy' },
    ],
  },
  chain_2: {
    title: '[Legacy Chain II] Midnight Resonance',
    story: 'At midnight, the half-scripture levitates into a golden beam pointing toward the back valley, revealing the second half.',
    choices: [
      { label: 'Follow the sword light', hint: 'Advance Legacy Chain (2/3)' },
      { label: 'Gather herbs along the way', hint: 'Gain Heal Pill ×4' },
    ],
  },
  chain_3: {
    title: '[Legacy Finale] Celestial Emperor Inheritance',
    story: 'Both halves merge in blinding gold! The Primordial Emperor smiles: "One who masters both patience and slacking is worthy of my mantle!"',
    choices: [
      { label: 'Accept the Emperor Mantle!', hint: 'Permanent +25% All Stats + Immortal Relic!' },
    ],
  },
};

export function locEncounter(ev: EncounterEvent, locale: Locale): EncounterEvent {
  if (locale === 'zh') return ev;
  const en = ENCOUNTER_EN[ev.id];
  if (!en) return ev;
  return {
    ...ev,
    title: en.title,
    story: en.story,
    choices: ev.choices.map((c, idx) => ({
      ...c,
      label: en.choices[idx]?.label ?? c.label,
      hint: en.choices[idx]?.hint ?? c.hint,
    })),
  };
}

export function locOfflineStory(line: string, locale: Locale): string {
  if (locale === 'zh') return line;
  if (line.includes('顾长生')) return 'Gu Changsheng scorched the alchemy room again while you were away, leaving Spirit Stones as an apology.';
  if (line.includes('柳清霜')) return 'Senior Sister Liu Qingshuang passed by your sanctuary and nodded approvingly at your steady Qi.';
  if (line.includes('苏灵儿')) return 'Su Linger watered your herb garden while you meditated offline.';
  if (line.includes('陈老头')) return 'Elder Chen swept the courtyard outside your cave, leaving subtle sword intent in the air.';
  if (line.includes('钱万贯')) return 'Merchant Qian stopped by your pavilion to share fresh market rumors.';
  if (line.includes('随行灵宠')) return 'Your active Spirit Pet took a cozy nap beside the spirit field in high spirits.';
  return line;
}

export function locLogText(text: string, locale: Locale): string {
  if (locale === 'zh') return text;
  if (text.startsWith('道友初入仙途')) return 'You begin your cultivation journey beneath Azure Cloud Mountain.';
  if (text.includes('施展【小周天吐纳】')) {
    const m = text.match(/\+(\d+)/);
    return `Cast [Qi Circulation], Spirit Qi surged +${m ? m[1] : ''}!`;
  }
  if (text.includes('御剑斩杀')) {
    const stones = text.match(/灵石\+(\d+)/)?.[1] ?? '';
    const qi = text.match(/修为\+(\d+)/)?.[1] ?? '';
    const herb = text.includes('灵草') ? ', Herb +1' : '';
    return `Slain demon: Stones +${stones}, Qi +${qi}${herb}.`;
  }
  if (text.includes('爆出')) {
    const nameMatch = text.match(/法宝【([^】]+)】/);
    const artName = nameMatch ? locArtifactName(nameMatch[1], 'en') : 'Artifact';
    return `Demon defeated! Dropped [${artName}]!`;
  }
  if (text.includes('通关【')) {
    return '✦ Stage Cleared! Guardian Boss vanquished and rewards claimed!';
  }
  if (text.includes('突破成功')) {
    return '✦ Breakthrough succeeded! Your cultivation realm has ascended!';
  }
  return text;
}

const FISH_EN: Record<string, { name: string; desc: string }> = {
  grass_carp: { name: 'Brook Grass Carp', desc: 'Tasty carp favored by outer-sect disciples.' },
  spirit_crucian: { name: 'Spirit Spring Crucian', desc: 'Raised in spirit water, faintly imbued with Qi.' },
  red_koi: { name: 'Crimson Spirit Koi', desc: 'Legend says catching one blesses your next tribulation.' },
  jade_shrimp: { name: 'Jade Spirit Shrimp', desc: 'Crystal-clear delicacy adored by the Spirit Fox.' },
  talking_fish: { name: 'Talking Odd Fish', desc: '"Spare me, Daoist, and I will tell you a secret!"' },
  rainbow_dragonfish: { name: 'Rainbow Dragonfish', desc: 'Rare treasure carrying a trace of True Dragon blood.' },
  ancient_chest: { name: 'Sunken Bronze Chest', desc: 'A lost storage chest dropped by an ancient senior.' },
  rusty_sword: { name: 'Ancient Cold-Iron Blade', desc: 'Hums softly with a sliver of Emperor sword intent!' },
  sleeping_immortal: { name: 'Drunken Immortal Gourd', desc: 'A slumbering immortal relic fished from the riverbed!' },
};

export function locFish(id: string, zhName: string, zhDesc: string, locale: Locale) {
  if (locale === 'zh') return { name: zhName, desc: zhDesc };
  return FISH_EN[id] ?? { name: zhName, desc: zhDesc };
}

const PET_QUIP_EN: Record<string, string> = {
  '主人，今天又在上班偷偷摸鱼啦？': 'Master, slacking off at work again today?',
  '刚才那颗回春丹闻起来好香，能分我半颗吗~': 'That Heal Pill smells yummy — can I have half~?',
  '人家尾巴毛茸茸的，摸一下修为涨得快哦！': 'My tail is super fluffy — pet me for faster Qi!',
  '老板是不是走过来了？快按 Cmd+Shift+X！': 'Is your boss walking over? Hit Cmd/Ctrl+Shift+X!',
  '急什么嘛……睡一觉就渡劫成功了。': 'No rush... take a nap and you will ascend.',
  '刚才在龟壳底下摸到两块灵石，给你。': 'Found two Spirit Stones under my shell — here you go.',
  '别卷了，躺平才是长生之道。': 'Stop grinding — lying flat is the true Dao of longevity.',
  '妖王打人好痛，记得多备点回春丹。': 'Bosses hit hard — keep extra Heal Pills ready.',
  '区区山野小妖，且看本仙禽一羽破之！': 'Mere wild demons — watch me shatter them with one feather!',
  '主人剑意渐成，今日宜闯锁妖塔。': 'Your sword intent grows sharp — a fine day for the Demon Tower.',
  '云深雾重，正是御剑遨游之时。': 'Deep clouds and mist — perfect weather for sword flight.',
  '哼，这点小妖也配劳动本座出手？': 'Hmph, these minor demons dare waste my draconic might?',
  '算了，看在你每天按时摸鱼的份上，赐你一丝龙威！': 'Fine, since you idle faithfully each day, take a spark of Dragon Might!',
  '待你证道仙帝，本座便陪你去看看九天之上。': 'When you ascend as Celestial Emperor, we shall soar beyond the Nine Heavens.',
};

export function locPetQuip(quip: string, locale: Locale): string {
  if (locale === 'zh') return quip;
  return PET_QUIP_EN[quip] ?? quip;
}

export function locToastMsg(msg: string, locale: Locale): string {
  if (locale === 'zh') return msg;
  const forgeMatch = msg.match(/锻造成功：([^·]+)·([^！!]+)/);
  if (forgeMatch) {
    const rMap: Record<string, string> = { 凡品: 'Common', 灵品: 'Spirit', 玄品: 'Mystic', 仙品: 'Immortal' };
    const rEn = rMap[forgeMatch[1]] ?? forgeMatch[1];
    const artEn = locArtifactName(forgeMatch[2], 'en');
    return `Forged: ${rEn} · ${artEn}!`;
  }
  if (msg.includes('已调整 2.5D 仙山洞府风水布局')) return 'Updated 2.5D Sanctuary Feng Shui layout!';
  if (msg.includes('成功建造')) return 'Sanctuary building constructed!';
  if (msg.includes('灵石不足')) return 'Not enough Spirit Stones!';
  if (msg.includes('玄铁矿不足')) return 'Not enough Iron Ore!';
  if (msg.includes('突破至')) return 'Higher cultivation realm required!';
  if (msg.includes('已踏入下一关')) return 'Advanced to the next Secret Ground!';
  if (msg.includes('新手指引')) return 'Guide step claimed! Rewards added!';
  return msg;
}

