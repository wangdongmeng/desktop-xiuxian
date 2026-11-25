import {
  AchievementDef,
  ArtifactAffix,
  BuildingDef,
  BuildingId,
  CraftType,
  DaoPathDef,
  EncounterEvent,
  EquipSlot,
  ExploreRoute,
  FishItem,
  NpcDef,
  PetDef,
  PetId,
  Rarity,
  RealmDef,
  SecretGround,
  SkillDef,
  SlackingMode,
  SynergyInfo,
} from './types';

export const REALMS: RealmDef[] = [
  { id: 0, name: '凡人·淬体', stage: '凡人境', qiRequired: 1500, baseQiPerSec: 2.2, baseAtk: 10, baseHp: 120, breakthroughRate: 0.72, unlockNote: '开启摸鱼修仙与御剑斩妖' },
  { id: 1, name: '炼气初期', stage: '炼气期', qiRequired: 5200, baseQiPerSec: 4.2, baseAtk: 18, baseHp: 210, breakthroughRate: 0.62, unlockNote: '解锁【五大本命流派】选择' },
  { id: 2, name: '炼气圆满', stage: '炼气期', qiRequired: 14500, baseQiPerSec: 7.5, baseAtk: 30, baseHp: 350, breakthroughRate: 0.52 },
  { id: 3, name: '筑基初期', stage: '筑基期', qiRequired: 38000, baseQiPerSec: 13.5, baseAtk: 50, baseHp: 580, breakthroughRate: 0.44, unlockNote: '解锁寒潭妖窟与高阶神通' },
  { id: 4, name: '筑基圆满', stage: '筑基期', qiRequired: 95000, baseQiPerSec: 24, baseAtk: 85, baseHp: 980, breakthroughRate: 0.38 },
  { id: 5, name: '金丹初期', stage: '金丹期', qiRequired: 240000, baseQiPerSec: 42, baseAtk: 145, baseHp: 1650, breakthroughRate: 0.32, unlockNote: '解锁古剑遗冢与兵解转世' },
  { id: 6, name: '金丹圆满', stage: '金丹期', qiRequired: 580000, baseQiPerSec: 74, baseAtk: 235, baseHp: 2650, breakthroughRate: 0.28 },
  { id: 7, name: '元婴初期', stage: '元婴期', qiRequired: 1400000, baseQiPerSec: 130, baseAtk: 390, baseHp: 4500, breakthroughRate: 0.24, unlockNote: '解锁【元婴分身】双线摸鱼！' },
  { id: 8, name: '化神期', stage: '化神期', qiRequired: 3400000, baseQiPerSec: 235, baseAtk: 640, baseHp: 7400, breakthroughRate: 0.2, unlockNote: '解锁九幽魔渊绝地' },
  { id: 9, name: '炼虚期', stage: '炼虚期', qiRequired: 8200000, baseQiPerSec: 420, baseAtk: 1050, baseHp: 12500, breakthroughRate: 0.18 },
  { id: 10, name: '合体期', stage: '合体期', qiRequired: 19500000, baseQiPerSec: 760, baseAtk: 1750, baseHp: 21000, breakthroughRate: 0.15 },
  { id: 11, name: '大乘圆满', stage: '大乘期', qiRequired: 46000000, baseQiPerSec: 1350, baseAtk: 2900, baseHp: 35000, breakthroughRate: 0.12 },
  { id: 12, name: '渡劫飞升', stage: '渡劫境', qiRequired: 98000000, baseQiPerSec: 2400, baseAtk: 5000, baseHp: 60000, breakthroughRate: 0.1, unlockNote: '飞升成仙，证道真仙！' },
  { id: 13, name: '九天仙帝', stage: '仙人境', qiRequired: 999999999, baseQiPerSec: 4800, baseAtk: 9500, baseHp: 120000, breakthroughRate: 0.08 },
];

export const SLACKING_META: Record<
  SlackingMode,
  { name: string; emoji: string; short: string; desc: string }
> = {
  sleep: {
    name: '躺平睡觉',
    emoji: '💤',
    short: '睡觉中',
    desc: '吐纳修为 +35%，偶入梦境触发「梦境悟道」暴涨修为。',
  },
  tea: {
    name: '喝茶悟道',
    emoji: '🍵',
    short: '品茶中',
    desc: '神通冷却加快 40%，心境澄明，渡劫成功率 +5%。',
  },
  fishing: {
    name: '灵溪垂钓',
    emoji: '🎣',
    short: '钓鱼中',
    desc: '钓起灵鱼与沉底奇珍，点亮【垂钓图鉴】（可钓出沉睡仙人！）。',
  },
  sweep: {
    name: '后山扫地',
    emoji: '🧹',
    short: '扫地中',
    desc: '挖出玄铁矿与古遗物，积满 100 扫地心得觉醒【扫地老仙传承】！',
  },
  spa: {
    name: '灵泉泡澡',
    emoji: '♨️',
    short: '泡泉中',
    desc: '高速回复气血（+6%/秒），附加【神清气爽】攻暴 +15%！',
  },
  daydream: {
    name: '放空发呆',
    emoji: '😶',
    short: '发呆中',
    desc: '仙途奇遇触发速度翻倍（2.2x），最容易撞见大机缘！',
  },
};

export const DAO_PATHS: DaoPathDef[] = [
  { id: 'sword', name: '太虚剑修', tag: '高爆输出', desc: '御剑攻击 +30%，会心一击 +8%，专克妖王。' },
  { id: 'alchemy', name: '丹鼎丹修', tag: '续航炼丹', desc: '炼制回春/破境丹产出翻倍，战斗中持续自动回血。' },
  { id: 'beast', name: '万灵御兽', tag: '灵宠翻倍', desc: '随行灵宠的所有属性加成翻倍生效！' },
  { id: 'body', name: '金刚体修', tag: '厚血反伤', desc: '最大气血 +60%，遭妖兽攻击时反弹 35% 伤害。' },
  { id: 'slacking', name: '摸鱼大道', tag: '招牌隐藏', desc: '所有摸鱼状态收益 +55%，奇遇更频，躺着飞升！' },
];

export const FISH_CODEX: FishItem[] = [
  { id: 'grass_carp', name: '青溪草鱼', rarity: 'common', desc: '肉质鲜美，后山杂役最爱烤鱼。', stoneValue: 12 },
  { id: 'spirit_crucian', name: '灵泉白鲫', rarity: 'common', desc: '饮灵泉长大，微蕴灵气。', stoneValue: 18 },
  { id: 'red_koi', name: '赤鳞锦鲤', rarity: 'spirit', desc: '据说钓到它今日渡劫必顺。', stoneValue: 42 },
  { id: 'jade_shrimp', name: '碧玉灵虾', rarity: 'spirit', desc: '通体透亮，灵宠小狐狸最馋。', stoneValue: 55 },
  { id: 'talking_fish', name: '会说话的怪鱼', rarity: 'mystic', desc: '“道友放我一马，告诉你个秘密！”', stoneValue: 120 },
  { id: 'rainbow_dragonfish', name: '七彩龙鱼', rarity: 'mystic', desc: '身具一丝真龙血脉的奇珍。', stoneValue: 160 },
  { id: 'ancient_chest', name: '沉底古铜宝箱', rarity: 'mystic', desc: '不知哪位前辈落水遗失的储物箱。', stoneValue: 220 },
  { id: 'rusty_sword', name: '上古寒铁残剑', rarity: 'immortal', desc: '剑身微鸣，竟藏一丝仙帝剑意！', stoneValue: 420 },
  { id: 'sleeping_immortal', name: '沉睡的醉仙葫芦', rarity: 'immortal', desc: '居然从河底钓出了沉睡千年的仙人随身法宝！', stoneValue: 680 },
];

export const PET_QUIPS: Record<PetId, string[]> = {
  fox: [
    '主人，今天又在上班偷偷摸鱼啦？',
    '刚才那颗回春丹闻起来好香，能分我半颗吗~',
    '人家尾巴毛茸茸的，摸一下修为涨得快哦！',
    '老板是不是走过来了？快按 Cmd+Shift+X！',
  ],
  turtle: [
    '急什么嘛……睡一觉就渡劫成功了。',
    '刚才在龟壳底下摸到两块灵石，给你。',
    '别卷了，躺平才是长生之道。',
    '妖王打人好痛，记得多备点回春丹。',
  ],
  crane: [
    '区区山野小妖，且看本仙禽一羽破之！',
    '主人剑意渐成，今日宜闯锁妖塔。',
    '云深雾重，正是御剑遨游之时。',
  ],
  dragon: [
    '哼，这点小妖也配劳动本座出手？',
    '算了，看在你每天按时摸鱼的份上，赐你一丝龙威！',
    '待你证道仙帝，本座便陪你去看看九天之上。',
  ],
};

// 50 Distinct Xianxia Secret Grounds spanning Mortal to Immortal Emperor!
const STAGE_SPECS: {
  id: string;
  name: string;
  minRealmId: number;
  desc: string;
  monsters: [string, 'imp' | 'serpent' | 'wolf' | 'ghost' | 'golem' | 'demon'][];
  bossName: string;
  bossKind: 'imp' | 'serpent' | 'wolf' | 'ghost' | 'golem' | 'demon';
}[] = [
  { id: 's01', name: '青云外山', minRealmId: 0, desc: '灵气温和，初入仙途者御剑试锋之地。', monsters: [['山魈妖童', 'imp'], ['青鳞小蛇', 'serpent'], ['赤目野狼', 'wolf']], bossName: '白猿大圣', bossKind: 'golem' },
  { id: 's02', name: '翠微竹径', minRealmId: 0, desc: '青竹摇曳间藏着偷吃灵笋的小妖。', monsters: [['竹叶灵蛇', 'serpent'], ['山林灰狼', 'wolf']], bossName: '青竹蛇王', bossKind: 'serpent' },
  { id: 's03', name: '乱石妖岗', minRealmId: 0, desc: '乱石嶙峋，常有石精与妖兽盘踞。', monsters: [['顽石小怪', 'golem'], ['独角野猪妖', 'wolf']], bossName: '巨石山魈', bossKind: 'golem' },
  { id: 's04', name: '幽篁毒林', minRealmId: 1, desc: '毒瘴弥漫，林中妖物狡猾凶狠。', monsters: [['毒瘴青妖', 'imp'], ['剧毒花蟒', 'serpent']], bossName: '碧瘴蜈蚣王', bossKind: 'serpent' },
  { id: 's05', name: '迷雾沼泽', minRealmId: 1, desc: '终年雾气不散，水底潜伏阴寒妖影。', monsters: [['泥潭水鬼', 'ghost'], ['沼泽毒鳄', 'serpent']], bossName: '黑沼妖蟾', bossKind: 'golem' },
  { id: 's06', name: '苍狼岭', minRealmId: 1, desc: '月夜狼嚎震谷，妖狼成群结队。', monsters: [['银背妖狼', 'wolf'], ['噬月狼卫', 'wolf']], bossName: '啸月苍狼王', bossKind: 'wolf' },
  { id: 's07', name: '落霞古谷', minRealmId: 2, desc: '昔年散修争斗遗留的古谷，煞气化形。', monsters: [['赤羽妖雕', 'wolf'], ['古谷怨灵', 'ghost']], bossName: '落霞金鹏', bossKind: 'demon' },
  { id: 's08', name: '青莲水榭', minRealmId: 2, desc: '荒废水阁之下沉睡着古老水妖。', monsters: [['水榭画灵', 'ghost'], ['碧鳞蛟童', 'serpent']], bossName: '莲池水魔', bossKind: 'serpent' },
  { id: 's09', name: '断魂崖', minRealmId: 2, desc: '万丈深渊狂风呼啸，剑气残存。', monsters: [['悬崖风魔', 'imp'], ['断魂剑鬼', 'ghost']], bossName: '断魂煞将', bossKind: 'demon' },
  { id: 's10', name: '白雾灵峰', minRealmId: 2, desc: '炼气圆满试炼绝峰，步步惊心。', monsters: [['云雾石傀', 'golem'], ['白羽妖禽', 'wolf']], bossName: '云峰护法', bossKind: 'golem' },
  { id: 's11', name: '寒潭妖窟', minRealmId: 3, desc: '阴寒灵气汇聚，筑基修士历练首选。', monsters: [['寒潭水鬼', 'ghost'], ['玄冰蟹将', 'golem'], ['幽潭蛟影', 'serpent']], bossName: '寒潭玄蛟王', bossKind: 'serpent' },
  { id: 's12', name: '玄冰洞天', minRealmId: 3, desc: '冰棱如剑，冰魄妖兽极其耐打。', monsters: [['冰晶傀儡', 'golem'], ['雪原冰狼', 'wolf']], bossName: '玄冰妖皇', bossKind: 'golem' },
  { id: 's13', name: '黑风魔寨', minRealmId: 3, desc: '盘踞百年的魔修据点，藏宝颇丰。', monsters: [['黑风魔卒', 'imp'], ['血刃魔修', 'demon']], bossName: '黑风大王', bossKind: 'demon' },
  { id: 's14', name: '千蛛万毒窟', minRealmId: 3, desc: '蛛丝密布的地下溶洞，毒雾刺骨。', monsters: [['赤背毒蛛', 'imp'], ['千眼妖蟒', 'serpent']], bossName: '紫毒蛛母', bossKind: 'serpent' },
  { id: 's15', name: '赤焰火山', minRealmId: 4, desc: '地火翻涌的炼器圣地，火灵狂暴。', monsters: [['熔岩火童', 'imp'], ['炎甲石魔', 'golem']], bossName: '赤炎火凤影', bossKind: 'demon' },
  { id: 's16', name: '焚天熔炉谷', minRealmId: 4, desc: '上古火修遗迹，岩浆中游弋炎蛟。', monsters: [['火灵卫士', 'golem'], ['赤鳞火蛟', 'serpent']], bossName: '焚天炎魔', bossKind: 'demon' },
  { id: 's17', name: '幽冥鬼市', minRealmId: 4, desc: '阴阳交界处的诡秘坊市，百鬼夜行。', monsters: [['提灯阴差', 'ghost'], ['无常剑鬼', 'ghost']], bossName: '鬼市城主', bossKind: 'demon' },
  { id: 's18', name: '青冥古林', minRealmId: 4, desc: '万年古木遮天蔽日，木灵成精。', monsters: [['古树妖灵', 'golem'], ['青冥妖豹', 'wolf']], bossName: '万年树妖王', bossKind: 'golem' },
  { id: 's19', name: '古剑遗冢', minRealmId: 5, desc: '上古剑修坐化之地，剑气凛然。', monsters: [['残剑傀儡', 'golem'], ['金甲剑灵', 'ghost']], bossName: '太虚剑尊残魂', bossKind: 'demon' },
  { id: 's20', name: '万剑峡谷', minRealmId: 5, desc: '满谷插满锈剑，步步皆有剑意斩落。', monsters: [['锈剑妖灵', 'ghost'], ['镇谷剑傀', 'golem']], bossName: '剑谷魔剑仙', bossKind: 'demon' },
  { id: 's21', name: '星陨废墟', minRealmId: 5, desc: '天外陨石砸出的古老深坑，灵矿丰富。', monsters: [['星石魔像', 'golem'], ['陨星妖狼', 'wolf']], bossName: '星陨巨魔', bossKind: 'golem' },
  { id: 's22', name: '碧落灵海', minRealmId: 5, desc: '无垠灵海波涛汹涌，海兽横行。', monsters: [['深海夜叉', 'imp'], ['碧海巨蛟', 'serpent']], bossName: '覆海龙王影', bossKind: 'serpent' },
  { id: 's23', name: '万骨荒原', minRealmId: 6, desc: '上古战场旧址，白骨生灵危机四伏。', monsters: [['白骨战将', 'golem'], ['冥鸦妖骑', 'wolf']], bossName: '白骨镇狱王', bossKind: 'demon' },
  { id: 's24', name: '血月祭坛', minRealmId: 6, desc: '猩红月光笼罩的古魔祭坛。', monsters: [['血月祭司', 'ghost'], ['嗜血魔狼', 'wolf']], bossName: '血月大祭司', bossKind: 'demon' },
  { id: 's25', name: '金沙魔漠', minRealmId: 6, desc: '流沙之下埋藏着失落仙朝古城。', monsters: [['沙暴石人', 'golem'], ['赤沙毒蝎蛟', 'serpent']], bossName: '沙海法老魔', bossKind: 'golem' },
  { id: 's26', name: '紫竹仙境', minRealmId: 6, desc: '看似清幽实则步步杀机的试炼阵。', monsters: [['紫竹剑影', 'ghost'], ['护阵铜人', 'golem']], bossName: '紫竹阵灵王', bossKind: 'demon' },
  { id: 's27', name: '太古龙巢', minRealmId: 7, desc: '真龙陨落之地，龙威压迫元婴修士。', monsters: [['亚龙守卫', 'serpent'], ['龙骨战傀', 'golem']], bossName: '太古黑龙王', bossKind: 'serpent' },
  { id: 's28', name: '九重云宫', minRealmId: 7, desc: '悬浮九天之上的残破天宫遗址。', monsters: [['天宫金甲卫', 'golem'], ['御风仙鹤妖', 'wolf']], bossName: '云宫镇殿神将', bossKind: 'golem' },
  { id: 's29', name: '忘川幽河', minRealmId: 7, desc: '渡魂之河，怨念凝聚为绝世阴煞。', monsters: [['忘川摆渡鬼', 'ghost'], ['幽河冥蛇', 'serpent']], bossName: '忘川冥王影', bossKind: 'demon' },
  { id: 's30', name: '天机迷宫', minRealmId: 7, desc: '机关重重的上古仙门藏宝地。', monsters: [['天机机关兽', 'golem'], ['八卦幻灵', 'ghost']], bossName: '天机傀儡皇', bossKind: 'golem' },
  { id: 's31', name: '九幽魔渊', minRealmId: 8, desc: '魔气滔天，唯有化神大能方可涉足。', monsters: [['蚀骨魔修', 'ghost'], ['血煞天魔', 'demon']], bossName: '九幽血魔皇', bossKind: 'demon' },
  { id: 's32', name: '修罗血海', minRealmId: 8, desc: '杀伐之气冲霄，修罗魔将无数。', monsters: [['修罗魔兵', 'demon'], ['血海魔蛟', 'serpent']], bossName: '血海修罗王', bossKind: 'demon' },
  { id: 's33', name: '寒冥冰狱', minRealmId: 8, desc: '封冻万载的太古魔狱，极寒噬魂。', monsters: [['冰狱看守', 'golem'], ['极寒冰魔', 'ghost']], bossName: '冥狱冰尊', bossKind: 'golem' },
  { id: 's34', name: '赤霄神殿', minRealmId: 8, desc: '燃尽苍穹的古火神殿残垣。', monsters: [['赤霄火卫', 'golem'], ['焚世炎魔', 'demon']], bossName: '赤霄炎帝影', bossKind: 'demon' },
  { id: 's35', name: '雷劫绝域', minRealmId: 9, desc: '终年紫雷肆虐的法则险地。', monsters: [['紫电雷灵', 'ghost'], ['九霄雷兽', 'wolf']], bossName: '紫霄雷帝影', bossKind: 'demon' },
  { id: 's36', name: '虚空裂缝', minRealmId: 9, desc: '空间法则崩碎，虚空古兽横行。', monsters: [['虚空行者', 'ghost'], ['裂空魔龙', 'serpent']], bossName: '虚空吞噬者', bossKind: 'serpent' },
  { id: 's37', name: '星辰古路', minRealmId: 9, desc: '通往域外仙界的古老星河驿道。', monsters: [['星河守卫', 'golem'], ['噬星天狼', 'wolf']], bossName: '星辰古神影', bossKind: 'golem' },
  { id: 's38', name: '混沌迷雾海', minRealmId: 9, desc: '混沌初开残留的狂暴灵海。', monsters: [['混沌魔灵', 'ghost'], ['太古海妖', 'serpent']], bossName: '混沌巨鲲魔', bossKind: 'serpent' },
  { id: 's39', name: '万妖圣山', minRealmId: 10, desc: '上古妖庭核心，大妖云集。', monsters: [['妖庭护法', 'wolf'], ['金翅妖王', 'demon']], bossName: '妖庭东皇影', bossKind: 'demon' },
  { id: 's40', name: '天魔皇城', minRealmId: 10, desc: '域外天魔驻扎的钢铁黑城。', monsters: [['天魔统领', 'demon'], ['魔城黑骑士', 'golem']], bossName: '域外天魔主', bossKind: 'demon' },
  { id: 's41', name: '玄黄祖脉', minRealmId: 10, desc: '天地灵气之源，祖龙气息弥漫。', monsters: [['玄黄石灵', 'golem'], ['祖脉灵蛟', 'serpent']], bossName: '玄黄镇脉尊', bossKind: 'golem' },
  { id: 's42', name: '阴阳太极界', minRealmId: 10, desc: '黑白二气交融的法则试炼界。', monsters: [['太阴魔影', 'ghost'], ['太阳金乌影', 'demon']], bossName: '阴阳道尊影', bossKind: 'demon' },
  { id: 's43', name: '凌霄仙墟', minRealmId: 11, desc: '上古仙界崩塌遗落的秘境。', monsters: [['堕落金仙傀', 'golem'], ['仙墟剑灵', 'ghost']], bossName: '凌霄堕仙王', bossKind: 'demon' },
  { id: 's44', name: '南天古门', minRealmId: 11, desc: '飞升必经之门，四大天王残影镇守。', monsters: [['天门力士', 'golem'], ['降魔天将', 'demon']], bossName: '镇门金甲神', bossKind: 'golem' },
  { id: 's45', name: '瑶池仙禁', minRealmId: 11, desc: '干涸的瑶池旧址，仙灵异变。', monsters: [['瑶池玉傀', 'golem'], ['九尾天狐影', 'wolf']], bossName: '瑶池守护灵', bossKind: 'serpent' },
  { id: 's46', name: '诛仙古阵', minRealmId: 11, desc: '杀意滔天的上古第一剑阵。', monsters: [['诛仙剑影', 'ghost'], ['戮仙魔傀', 'demon']], bossName: '诛仙阵魂', bossKind: 'demon' },
  { id: 's47', name: '九霄天劫台', minRealmId: 12, desc: '真仙渡劫之绝顶，天威浩荡。', monsters: [['天劫雷神卫', 'golem'], ['灭世雷蛟', 'serpent']], bossName: '九霄劫主', bossKind: 'demon' },
  { id: 's48', name: '无尽星海仙域', minRealmId: 12, desc: '诸天万界尽头的璀璨仙域。', monsters: [['星海金仙影', 'ghost'], ['太古星龙', 'serpent']], bossName: '星海仙君', bossKind: 'serpent' },
  { id: 's49', name: '太初大道碑', minRealmId: 12, desc: '铭刻天地本源的终极试炼之地。', monsters: [['大道守碑人', 'golem'], ['太初混沌魔', 'demon']], bossName: '太初魔帝化身', bossKind: 'demon' },
  { id: 's50', name: '鸿蒙仙帝殿', minRealmId: 13, desc: '第五十重终极绝巅！证道九天仙帝的最后一战！', monsters: [['鸿蒙镇殿仙', 'golem'], ['混沌帝影', 'demon']], bossName: '鸿蒙终极古帝', bossKind: 'demon' },
];

export const SECRET_GROUNDS: SecretGround[] = STAGE_SPECS.map((sp, idx) => {
  const n = idx + 1;
  // Smooth progressive exponential curve across all 50 stages
  const baseHp = Math.round(58 * Math.pow(1.265, idx));
  const baseAtk = Math.round(7 * Math.pow(1.19, idx));
  const baseStone = Math.round(9 * Math.pow(1.2, idx));
  const baseQi = Math.round(14 * Math.pow(1.23, idx));

  const monsters = sp.monsters.map(([mName, kind], mIdx) => {
    const mult = 1 + mIdx * 0.34;
    return {
      name: mName,
      kind,
      maxHp: Math.round(baseHp * mult),
      atk: Math.round(baseAtk * (1 + mIdx * 0.22)),
      stoneReward: Math.round(baseStone * mult),
      qiReward: Math.round(baseQi * mult),
      herbChance: Math.min(0.78, 0.36 + idx * 0.008),
      dropChance: Math.min(0.5, 0.24 + idx * 0.005),
    };
  });

  return {
    id: sp.id,
    name: `${n}·${sp.name}`,
    minRealmId: sp.minRealmId,
    desc: sp.desc,
    monsters,
    boss: {
      name: `【妖王】${sp.bossName}`,
      kind: sp.bossKind,
      maxHp: Math.round(baseHp * 52),
      atk: Math.round(baseAtk * 5.8),
      stoneReward: Math.round(baseStone * 18),
      qiReward: Math.round(baseQi * 20),
      herbChance: 1,
      dropChance: 1,
      isBoss: true,
    },
  };
});

export const SKILLS: SkillDef[] = [
  {
    id: 'qinglian',
    name: '青莲剑诀',
    desc: '凝聚三道青莲剑气直斩妖邪，造成 250% 攻击伤害。',
    cooldownSec: 6,
    unlockCost: 0,
    minRealmId: 0,
    dmgMult: 2.5,
    color: 'jade',
  },
  {
    id: 'thunder',
    name: '紫霄神雷',
    desc: '引动九天紫雷轰击目标，必定会心并造成 360% 攻击伤害。',
    cooldownSec: 10,
    unlockCost: 90,
    minRealmId: 1,
    dmgMult: 3.6,
    guaranteedCrit: true,
    color: 'purple',
  },
  {
    id: 'spirit_surge',
    name: '小周天吐纳',
    desc: '瞬间运转周天经脉，直接汲取相当于 15 秒的吐纳修为。',
    cooldownSec: 14,
    unlockCost: 140,
    minRealmId: 2,
    dmgMult: 0,
    qiBurstSec: 15,
    color: 'gold',
  },
  {
    id: 'wanjian',
    name: '万剑归宗',
    desc: '召唤满天剑雨齐落，造成 520% 毁灭伤害（攻克妖王利器）。',
    cooldownSec: 16,
    unlockCost: 360,
    minRealmId: 3,
    dmgMult: 5.2,
    guaranteedCrit: true,
    color: 'cinnabar',
  },
];

export const CRAFT_META: Record<CraftType, { name: string; title: string; desc: string; intervalSec: number }> = {
  fishing: { name: '灵溪垂钓', title: '垂钓', desc: '每 5 秒钓得灵石，有几率钓起沉底奇珍。', intervalSec: 5 },
  herbalism: { name: '悬崖采药', title: '采药', desc: '每 5 秒稳定采得灵草，供炼制回春丹与破境丹。', intervalSec: 5 },
  mining: { name: '灵脉采矿', title: '采矿', desc: '每 5 秒掘出玄铁矿与灵石，供炼器炉锻造神兵。', intervalSec: 5 },
};

export const ENCOUNTERS: EncounterEvent[] = [
  {
    id: 'mountain_elder',
    tier: 'rare',
    title: '山中白发老人',
    story: '你在后山摸鱼时遇到一位仙风道骨的白发老人。他笑眯眯地摆出三件物什：“小友有缘，三选其一罢。”',
    choices: [
      { label: '发黄的功法残卷', hint: '大幅顿悟修为', outcomeType: 'qi' },
      { label: '奇香扑鼻的玉瓶丹药', hint: '获破境丹 ×1', outcomeType: 'pill' },
      { label: '平平无奇的旧竹鱼竿', hint: '必得稀世奇珍鱼获！', outcomeType: 'fish_rare' },
    ],
  },
  {
    id: 'talking_fish_event',
    tier: 'common',
    title: '会说话的灵鱼',
    story: '溪边忽有一条金须大鱼跃出水面口吐人言：“道友别吃我！放我回去，我吐一颗夜明珠给你！”',
    choices: [
      { label: '放生灵鱼结善缘', hint: '获大量灵石', outcomeType: 'stones' },
      { label: '请它指点水下灵草', hint: '获灵草与玄铁矿', outcomeType: 'herb_ore' },
    ],
  },
  {
    id: 'injured_cultivator',
    tier: 'common',
    title: '受伤的散修',
    story: '密林石阶旁坐着一位衣襟染血的剑修，见你路过抱拳求救：“道友可有余药？在下愿以宝囊相谢。”',
    choices: [
      { label: '赠予疗伤秘法相助', hint: '得其赠予高阶法宝', outcomeType: 'gamble_artifact' },
      { label: '帮他包扎换取灵药', hint: '获回春丹 ×4', outcomeType: 'heal_pills' },
    ],
  },
  {
    id: 'sealed_immortal',
    tier: 'legendary',
    title: '被封印千年的古仙',
    story: '后山古井深处传来苍老笑声：“三千年了，终于有个上班摸鱼的年轻人路过……助本座松开一道符篆，赐你一场大造化！”',
    choices: [
      { label: '接受仙人醍醐灌顶', hint: '海量化境修为！', outcomeType: 'qi' },
      { label: '求取仙人随身古宝', hint: '必出玄品/仙品重宝！', outcomeType: 'gamble_artifact' },
      { label: '向仙人请教扫地心法', hint: '扫地传承大幅暴涨！', outcomeType: 'sweeper_legacy' },
    ],
  },
  {
    id: 'future_self',
    tier: 'legendary',
    title: '时空裂缝·未来的自己',
    story: '云雾忽然扭曲，一道身披仙帝金袍的身影对你微微颔首——那眉眼竟与你一模一样！他随手抛来三缕仙光。',
    choices: [
      { label: '接住金色仙丹光团', hint: '获破境丹 ×1 + 疗伤丹', outcomeType: 'pill' },
      { label: '接住青色剑意光团', hint: '得高阶法宝', outcomeType: 'gamble_artifact' },
      { label: '接住流光灵石袋', hint: '获丰厚灵石', outcomeType: 'stones' },
    ],
  },
  {
    id: 'alchemy_ruin',
    tier: 'rare',
    title: '荒废丹房遗迹',
    story: '秘境深处藏着一座前人遗留的炼丹石室，丹炉微温，案台玉瓶尚有丹香逸出。',
    choices: [
      { label: '取走疗伤玉瓶', hint: '获得回春丹 ×4', outcomeType: 'heal_pills' },
      { label: '吸纳残余药灵', hint: '大幅精进修为', outcomeType: 'qi' },
    ],
  },
];

export const RARITY_META: Record<
  Rarity,
  { label: string; colorClass: string; bgClass: string; borderClass: string; mult: number; sellPrice: number }
> = {
  common: { label: '凡品', colorClass: 'text-ink-700', bgClass: 'bg-paper-200/70', borderClass: 'border-paper-300', mult: 1, sellPrice: 5 },
  spirit: { label: '灵品', colorClass: 'text-jade-600', bgClass: 'bg-jade-100/80', borderClass: 'border-jade-500/40', mult: 1.7, sellPrice: 16 },
  mystic: { label: '玄品', colorClass: 'text-purple-700', bgClass: 'bg-purple-50/90', borderClass: 'border-purple-400/50', mult: 2.8, sellPrice: 48 },
  immortal: { label: '仙品', colorClass: 'text-gold-600', bgClass: 'bg-gold-100/90', borderClass: 'border-gold-500/60', mult: 4.5, sellPrice: 145 },
};

export const SLOT_LABEL: Record<EquipSlot, string> = {
  sword: '飞剑',
  talisman: '玉符',
  robe: '道袍',
};

const PREFIXES: Record<Rarity, string[]> = {
  common: ['青铁', '素云', '粗制', '山溪'],
  spirit: ['青冥', '流风', '碧落', '凝露'],
  mystic: ['紫霄', '太虚', '玄霜', '星陨'],
  immortal: ['太初', '鸿蒙', '诛仙', '九霄'],
};

const SLOT_NOUNS: Record<EquipSlot, string[]> = {
  sword: ['飞剑', '灵刃', '青锋', '剑匣'],
  talisman: ['灵符', '玉佩', '镇魂印', '八卦镜'],
  robe: ['道袍', '云裳', '鹤氅', '法衣'],
};

const AFFIX_POOL: ArtifactAffix[] = [
  { id: 'lightning_proc', name: '引雷', desc: '攻击 22% 概率额外降下紫霄雷击(+65%伤)' },
  { id: 'double_strike', name: '连斩', desc: '御剑 25% 概率追加一道飞剑追击' },
  { id: 'qi_siphon', name: '噬灵', desc: '斩妖额外汲取 +30% 修为' },
  { id: 'greed', name: '聚宝', desc: '斩妖额外获得 +28% 灵石' },
  { id: 'boss_slayer', name: '诛魔', desc: '对妖王与锁妖塔魔君伤害 +35%' },
];

export function generateArtifact(realmLevel: number, luckLevel: number, minRarity?: Rarity) {
  const roll = Math.random() * 100;
  // Make Immortal (仙品) genuinely rare & exciting!
  const immortalRate = Math.min(4.5, 0.4 + luckLevel * 0.25);
  const mysticRate = Math.min(18, 4.5 + luckLevel * 0.9);
  const spiritRate = 24;

  let rarity: Rarity = 'common';
  if (roll < immortalRate) rarity = 'immortal';
  else if (roll < immortalRate + mysticRate) rarity = 'mystic';
  else if (roll < immortalRate + mysticRate + spiritRate) rarity = 'spirit';

  const order: Rarity[] = ['common', 'spirit', 'mystic', 'immortal'];
  if (minRarity && order.indexOf(rarity) < order.indexOf(minRarity)) {
    rarity = minRarity;
  }

  const slots: EquipSlot[] = ['sword', 'talisman', 'robe'];
  const slot = slots[Math.floor(Math.random() * slots.length)];

  const prefixList = PREFIXES[rarity];
  const nounList = SLOT_NOUNS[slot];
  const name = `${prefixList[Math.floor(Math.random() * prefixList.length)]}${nounList[Math.floor(Math.random() * nounList.length)]}`;

  const scale = (1 + realmLevel * 0.55) * RARITY_META[rarity].mult;
  const atkBonus =
    slot === 'sword'
      ? Math.round((8 + Math.random() * 6) * scale)
      : Math.round((2 + Math.random() * 3) * scale);
  const qiRateBonus =
    slot === 'robe'
      ? Math.round((8 + Math.random() * 8) * RARITY_META[rarity].mult)
      : Math.round((3 + Math.random() * 5) * RARITY_META[rarity].mult);
  const critBonus =
    slot === 'talisman'
      ? Math.round((4 + Math.random() * 5) * RARITY_META[rarity].mult)
      : Math.round((1 + Math.random() * 2) * RARITY_META[rarity].mult);

  const shouldRollAffix =
    rarity === 'immortal' || rarity === 'mystic' || (rarity === 'spirit' && Math.random() < 0.4);
  const affix = shouldRollAffix ? AFFIX_POOL[Math.floor(Math.random() * AFFIX_POOL.length)] : undefined;

  const power = Math.round(atkBonus * 2 + qiRateBonus * 3 + critBonus * 5 + (affix ? 45 : 0));

  return {
    id: `art_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    slot,
    rarity,
    atkBonus,
    qiRateBonus,
    critBonus,
    power,
    affix,
  };
}

export const PET_STAGE_NAMES = ['幼年期', '成长期', '成熟期', '觉醒期', '神兽期'];

export const PETS: PetDef[] = [
  {
    id: 'fox',
    name: '青丘灵狐',
    title: '聚灵瑞兽',
    personality: '贪吃粘人',
    desc: '吐纳效率 +20%，御剑攻击 +10%，喜欢偷闻你的丹药。',
    costStones: 120,
    qiPct: 20,
    atkPct: 10,
    critBonus: 3,
    breakBonus: 0,
    stonePct: 0,
    activities: ['在灵田边打盹', '偷偷闻你的丹药瓶', '追着自己的尾巴转圈', '趴在案头看你摸鱼'],
    branches: [
      { id: 'skyfire_fox', name: '天火九尾狐', tag: '暴击输出', bonusDesc: '攻击 +22%、会心 +10%', atkPctBonus: 22, qiPctBonus: 5, critBonus: 10 },
      { id: 'moon_fox', name: '月灵九尾狐', tag: '悟道聚灵', bonusDesc: '吐纳 +35%、会心 +4%', atkPctBonus: 6, qiPctBonus: 35, critBonus: 4 },
    ],
  },
  {
    id: 'turtle',
    name: '玄水灵龟',
    title: '镇劫玄兽',
    personality: '佛系咸鱼',
    desc: '渡劫成功率永久 +8%，斩妖灵石收益 +25%。',
    costStones: 280,
    qiPct: 10,
    atkPct: 8,
    critBonus: 0,
    breakBonus: 0.08,
    stonePct: 25,
    activities: ['在灵泉石头上晒太阳', '缩在壳里睡大觉', '慢悠悠啃灵草', '在池底挖出一块亮晶晶的石头'],
    branches: [
      { id: 'xuanwu_guard', name: '玄武镇岳龟', tag: '厚重护道', bonusDesc: '攻击 +18%、气血与稳健大幅增强', atkPctBonus: 18, qiPctBonus: 15, critBonus: 4 },
      { id: 'golden_turtle', name: '聚宝金鳌', tag: '摸鱼生财', bonusDesc: '吐纳 +30%、灵石滚滚而来', atkPctBonus: 8, qiPctBonus: 30, critBonus: 2 },
    ],
  },
  {
    id: 'crane',
    name: '紫电灵鹤',
    title: '御剑仙禽',
    personality: '孤傲清高',
    desc: '御剑攻击 +28%，天雷会心 +12%，剑意凌厉。',
    costStones: 620,
    qiPct: 15,
    atkPct: 28,
    critBonus: 12,
    breakBonus: 0.03,
    stonePct: 10,
    activities: ['立于屋脊梳理羽翼', '迎风吐纳九天紫电', '俯视后山小妖', '绕着洞府盘旋巡山'],
    branches: [
      { id: 'thunder_crane', name: '九霄雷鹤', tag: '天雷破魔', bonusDesc: '攻击 +30%、会心 +12%', atkPctBonus: 30, qiPctBonus: 8, critBonus: 12 },
      { id: 'cloud_crane', name: '青云仙鹤', tag: '御风悟道', bonusDesc: '吐纳 +32%、攻击 +15%', atkPctBonus: 15, qiPctBonus: 32, critBonus: 6 },
    ],
  },
  {
    id: 'dragon',
    name: '太初金龙雏',
    title: '鸿蒙神兽',
    personality: '傲娇护主',
    desc: '攻击 +48%、吐纳 +42%、会心 +15%、渡劫 +10%！',
    costStones: 1800,
    qiPct: 42,
    atkPct: 48,
    critBonus: 15,
    breakBonus: 0.1,
    stonePct: 35,
    activities: ['在灵田上空兴云布雨', '盘在聚灵阵上打哈欠', '用龙须拨弄飞剑', '嫌弃地盯着路过的妖兽'],
    branches: [
      { id: 'candle_dragon', name: '太初烛龙', tag: '焚天剑威', bonusDesc: '攻击 +45%、会心 +15%', atkPctBonus: 45, qiPctBonus: 18, critBonus: 15 },
      { id: 'azure_dragon', name: '苍溟青龙', tag: '呼风唤雨', bonusDesc: '吐纳 +48%、攻击 +22%', atkPctBonus: 22, qiPctBonus: 48, critBonus: 8 },
    ],
  },
];

export const CORE_NPCS: NpcDef[] = [
  {
    id: 'gu_changsheng',
    name: '顾长生',
    title: '易炸炉炼丹师',
    realm: '筑基后期',
    age: 28,
    avatarEmoji: '⚗️',
    personalities: ['自恋', '执着', '爱研究'],
    likes: '灵茶、古代丹方、稀有灵草',
    secret: '他其实身怀万中无一的【先天火灵根】，只是炼丹手法太野才天天炸炉。',
    relations: ['与炼器师是损友', '常被大师姐柳清霜嫌弃'],
    schedules: {
      morning: '在丹房苦研残缺古丹方',
      noon: '开炉炼丹——轰的一声又炸炉了',
      afternoon: '灰头土脸地去灵田采灵草',
      night: '点着油灯偷偷练习新火候',
    },
    dialogues: [
      '咳咳，刚才那不算炸炉，那是丹成之前的天地异象！',
      '道友来得正好，这炉回春丹火候绝佳……哎呀怎么冒黑烟了！',
      '柳师姐总说我只会把丹房炸黑，等我炼出九转金丹，定要她刮目相看！',
    ],
    perkDesc: '好感 ≥ 40：赠礼回赠回春丹；≥ 80：吐纳 +10%；满 100：吐纳再 +15%、炼丹双倍几率 +25%',
    perk40: '赠礼必回赠回春丹 ×1',
    perk80: '吐纳效率 +10%',
    maxTitle: '丹道至交·九转火脉',
    perk100: '吐纳效率再 +15% · 炼丹额外双倍产出几率 +25%',
    keepsakeName: '离火丹经残页',
    keepsakeRewardDesc: '破境丹 ×2 + 回春丹 ×5',
    maxDialogue: '哈哈哈！此生得道友相知，这炉九转先天丹火愿与你共享，今后丹药管够！',
  },
  {
    id: 'liu_qingshuang',
    name: '柳清霜',
    title: '宗门大师姐',
    realm: '金丹中期',
    age: 25,
    avatarEmoji: '🗡️',
    personalities: ['清冷', '嘴硬心软', '护短'],
    likes: '霜雪剑意、静心品茶、小白狐',
    secret: '表面上嫌弃你天天摸鱼不务正业，暗地里却悄悄替你挡下过三次宗门执法堂巡查。',
    relations: ['常教训顾长生', '暗中照拂主角', '最喜欢青丘灵狐'],
    schedules: {
      morning: '在后山青崖练剑三千次',
      noon: '巡视宗门，顺路看一眼你有没有偷懒',
      afternoon: '在松下独酌灵茶',
      night: '闭目温养本命飞剑',
    },
    dialogues: [
      '又在案头摸鱼？……算了，看你境界没落下，今日便不罚你了。',
      '顾长生那家伙又把丹房房顶掀了？真是让人省心不得。',
      '你身旁那只小狐狸倒挺乖巧，借我抱一会儿。',
    ],
    perkDesc: '好感 ≥ 40：御剑攻击 +12%；≥ 80：会心 +6%；满 100：攻击再 +20%、会心再 +8%',
    perk40: '御剑攻击 +12%',
    perk80: '会心一击 +6%',
    maxTitle: '剑心相印·霜雪护道',
    perk100: '御剑攻击再 +20% · 会心一击再 +8%',
    keepsakeName: '霜华本命剑穗',
    keepsakeRewardDesc: '必得仙品法宝 ×1 + 破境丹 ×1',
    maxDialogue: '……既然已结护道之约，往后无论秘境险阻还是天劫雷罚，我的剑都会站在你身前。',
  },
  {
    id: 'chen_elder',
    name: '陈老头',
    title: '神秘扫地老人',
    realm: '深不可测',
    age: 380,
    avatarEmoji: '🧹',
    personalities: ['懒散', '通透', '隐藏大能'],
    likes: '扫落叶、晒太阳、喝劣质老酒',
    secret: '他正是三百年前一剑斩断魔渊的宗门老祖，如今厌倦争斗，只想安心当个扫地僧。',
    relations: ['现宗主的师父', '认识活了千年的老乌龟'],
    schedules: {
      morning: '慢悠悠扫着山门前的落叶',
      noon: '靠在古松下打呼噜',
      afternoon: '在溪边看人钓鱼并笑而不语',
      night: '仰望星河，手中扫帚隐有剑鸣',
    },
    dialogues: [
      '年轻人，卷什么卷？老夫扫了三百年地，照样一帚扫平天劫。',
      '你那把飞剑不错，就是剑意还少了点“松弛感”。',
      '后山扫地大有学问，扫得久了，自然就懂大道至简了。',
    ],
    perkDesc: '好感 ≥ 40：渡劫 +6%；≥ 80：全攻 +10%；满 100：全攻再 +18%、渡劫再 +10%',
    perk40: '渡劫成功率 +6%',
    perk80: '全攻击 +10%',
    maxTitle: '忘年之交·一帚平劫',
    perk100: '全攻击再 +18% · 渡劫成功率再 +10%',
    keepsakeName: '祖师竹扫残枝',
    keepsakeRewardDesc: '扫地感悟 +50 + 破境丹 ×2',
    maxDialogue: '好小子，老夫三百年没收过关门弟子，今日这一帚平劫的真意，便全数托付于你了！',
  },
  {
    id: 'su_linger',
    name: '苏灵儿',
    title: '灵田小师妹',
    realm: '炼气圆满',
    age: 19,
    avatarEmoji: '🌱',
    personalities: ['天真', '活泼', '灵植奇才'],
    likes: '照顾灵草、喂小灵宠、听奇遇故事',
    secret: '她随手种下的灵草之所以长势喜人，是因为她天生带有【乙木灵体】。',
    relations: ['崇拜大师姐柳清霜', '常帮顾长生补种灵草'],
    schedules: {
      morning: '给灵药田浇灌晨露',
      noon: '偷偷拿灵果投喂路过的小狐狸',
      afternoon: '在花圃里记录灵植变异日记',
      night: '趴在窗台数天上的剑光',
    },
    dialogues: [
      '师兄师兄！你快看，这株百年灵草今天开花了！',
      '刚才顾师兄又来借灵草，我塞给他一大把，希望这次别炸炉啦~',
      '师兄在外面遇到什么好玩的奇遇，一定要讲给我听哦！',
    ],
    perkDesc: '好感 ≥ 40：吐纳 +12%；≥ 80：气血 +15%；满 100：气血再 +25%、吐纳再 +15%、斩妖回血 4%',
    perk40: '吐纳效率 +12%',
    perk80: '气血上限 +15%',
    maxTitle: '灵犀同心·乙木长青',
    perk100: '气血上限再 +25% · 吐纳再 +15% · 每次斩妖自动回复 4% 气血',
    keepsakeName: '乙木先天灵种',
    keepsakeRewardDesc: '百年灵草 ×40 + 回春丹 ×4',
    maxDialogue: '师兄，我把乙木灵气种在你的洞府里啦！以后不管受多重的伤，灵气都会一直护着你哒~',
  },
  {
    id: 'qian_wanguan',
    name: '钱万贯',
    title: '跨界奇商',
    realm: '金丹初期',
    age: 42,
    avatarEmoji: '💰',
    personalities: ['精明', '豪爽', '见多识广'],
    likes: '稀世法宝、灵石、做稳赚不赔的买卖',
    secret: '他并非本界之人，而是凭一枚时空玉佩穿梭诸天倒卖修仙特产的奇商。',
    relations: ['与各方秘境散修都有往来'],
    schedules: {
      morning: '拨着翡翠算盘核对灵石账目',
      noon: '在坊市茶楼打听秘境奇宝消息',
      afternoon: '驾着纸鹤四处收宝',
      night: '清点百宝囊里的上古残片',
    },
    dialogues: [
      '嘿嘿，道友今日印堂发金，一看就是大发横财之相！',
      '在下这百宝囊里啥都有，等道友灵石充裕，随时来关照生意！',
      '说来奇怪，我上个世界也见过一个像你这样爱摸鱼的剑仙。',
    ],
    perkDesc: '好感 ≥ 40：灵石 +18%；≥ 80：暴击 +5%；满 100：灵石再 +30%、暴击再 +8%、掉宝福缘 +4',
    perk40: '灵石收益 +18%',
    perk80: '会心一击 +5%',
    maxTitle: '财神结义·诸天商盟',
    perk100: '灵石收益再 +30% · 会心再 +8% · 法宝掉落品质福缘 +4',
    keepsakeName: '诸天商盟金印',
    keepsakeRewardDesc: '灵石 ×800 + 玄铁 ×30',
    maxDialogue: '道友既是我钱某人的过命金兰，诸天商盟的头等货源与气运分红，从今往后全归你独享！',
  },
];

export const DAO_PET_BONDS: {
  daoPath: string;
  petId: PetId;
  title: string;
  desc: string;
  atkPct: number;
  qiPct: number;
  critBonus: number;
}[] = [
  { daoPath: 'sword', petId: 'fox', title: '青丘剑影', desc: '太虚剑修 × 青丘灵狐：攻击 +15%、会心 +8%', atkPct: 15, qiPct: 0, critBonus: 8 },
  { daoPath: 'slacking', petId: 'turtle', title: '万年咸鱼王', desc: '摸鱼大道 × 玄水灵龟：吐纳 +30%、全摸鱼收益大增', atkPct: 0, qiPct: 30, critBonus: 0 },
  { daoPath: 'alchemy', petId: 'dragon', title: '龙炎炼丹', desc: '丹鼎丹修 × 太初金龙：攻击 +18%、吐纳 +25%', atkPct: 18, qiPct: 25, critBonus: 5 },
  { daoPath: 'beast', petId: 'crane', title: '九霄御灵', desc: '万灵御兽 × 紫电灵鹤：攻击 +25%、会心 +10%', atkPct: 25, qiPct: 10, critBonus: 10 },
  { daoPath: 'body', petId: 'turtle', title: '玄武不灭身', desc: '金刚体修 × 玄水灵龟：攻击 +15%、气血稳如泰山', atkPct: 15, qiPct: 15, critBonus: 4 },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_kill', title: '初试青锋', desc: '首次御剑斩杀妖兽', rewardStones: 30 },
  { id: 'kill_50', title: '除妖卫道', desc: '累计斩杀 50 只妖兽', rewardStones: 100 },
  { id: 'kill_300', title: '百战剑尊', desc: '累计斩杀 300 只妖兽', rewardStones: 360, rewardPills: 1 },
  { id: 'realm_zhuji', title: '筑基大道', desc: '突破至筑基初期', rewardStones: 180, rewardPills: 1 },
  { id: 'realm_jindan', title: '金丹初成', desc: '突破至金丹初期', rewardStones: 600, rewardPills: 2 },
  { id: 'first_immortal', title: '仙品出世', desc: '获得一件仙品法宝', rewardStones: 240 },
  { id: 'first_boss', title: '妖王克星', desc: '击败任意一位秘境镇守妖王', rewardStones: 220, rewardPills: 1 },
  { id: 'tower_5', title: '锁妖新秀', desc: '通关无尽锁妖塔第 5 层', rewardStones: 300, rewardPills: 1 },
  { id: 'tower_15', title: '镇塔大能', desc: '通关无尽锁妖塔第 15 层', rewardStones: 900, rewardPills: 2 },
  { id: 'first_pet', title: '灵宠相伴', desc: '契约第一只随行灵宠', rewardStones: 120 },
  { id: 'fish_5', title: '宗门钓鱼佬', desc: '点亮 5 种垂钓图鉴', rewardStones: 260 },
  { id: 'sweeper_master', title: '扫地老仙', desc: '觉醒后山扫地僧隐藏传承', rewardStones: 500, rewardPills: 2 },
];

export function getTowerMonster(floor: number) {
  const kinds: ('imp' | 'serpent' | 'wolf' | 'ghost' | 'golem' | 'demon')[] = [
    'wolf',
    'ghost',
    'golem',
    'serpent',
    'demon',
  ];
  const isMilestone = floor % 5 === 0;
  const kind = isMilestone ? 'demon' : kinds[(floor - 1) % kinds.length];
  const titles = ['锁妖魔卫', '幽冥妖将', '古塔剑傀', '玄煞妖尊', '镇塔魔君'];
  const name = isMilestone
    ? `【锁妖塔·${floor}层魔君】`
    : `锁妖塔${floor}层·${titles[(floor - 1) % titles.length]}`;
  const maxHp = Math.round(380 * Math.pow(1.4, floor - 1) * (isMilestone ? 1.7 : 1));
  const atk = Math.round(16 * Math.pow(1.28, floor - 1) * (isMilestone ? 1.4 : 1));
  const stoneReward = Math.round(65 * Math.pow(1.26, floor - 1) * (isMilestone ? 1.8 : 1));
  const qiReward = Math.round(110 * Math.pow(1.28, floor - 1));
  return { name, kind, maxHp, atk, stoneReward, qiReward, herbChance: 1, dropChance: isMilestone ? 1 : 0.45, isBoss: true };
}

export const ROUTE_META: Record<ExploreRoute, { name: string; emoji: string; desc: string }> = {
  safe: { name: '稳健巡山', emoji: '🛡️', desc: '妖兽伤害 -25%，安稳挂机摸鱼' },
  danger: { name: '深入险地', emoji: '⚔️', desc: '妖兽伤害 +35%，灵石与法宝掉率 +60%！' },
  mystery: { name: '寻幽秘径', emoji: '🔮', desc: '奇遇触发速度 +50%，更易撞见仙缘' },
};

export const BUILDINGS: BuildingDef[] = [
  { id: 'spirit_array', name: '聚灵阵', emoji: '🌀', cost: 40, desc: '吐纳效率 +18%' },
  { id: 'herb_field', name: '灵药田', emoji: '🌿', cost: 45, desc: '每 5 秒自动产灵草' },
  { id: 'alchemy_room', name: '炼丹房', emoji: '⚗️', cost: 70, desc: '炼丹额外产出 +35%' },
  { id: 'forge_hall', name: '炼器阁', emoji: '🔥', cost: 80, desc: '御剑攻击 +16%' },
  { id: 'beast_garden', name: '灵兽园', emoji: '🦊', cost: 85, desc: '灵宠加成额外 +20%' },
  { id: 'spring_pool', name: '灵泉池', emoji: '♨️', cost: 65, desc: '气血上限 +20%，持续回血' },
  { id: 'scripture_pavilion', name: '藏经阁', emoji: '📜', cost: 90, desc: '神通冷却加快 15%' },
  { id: 'enlightenment_altar', name: '悟道台', emoji: '☯️', cost: 110, desc: '会心一击 +8%，渡劫 +5%' },
];

// Check orthogonal adjacency on 3x3 grid (indices 0..8)
export function evaluateCaveGrid(grid: (BuildingId | null)[]): {
  synergies: SynergyInfo[];
  qiPct: number;
  atkPct: number;
  hpPct: number;
  critBonus: number;
  breakBonus: number;
  cdMult: number;
  petBonusPct: number;
  extraHerbTick: number;
  bonusAlchemyChance: number;
} {
  const has = (id: BuildingId) => grid.includes(id);
  const areAdjacent = (a: BuildingId, b: BuildingId) => {
    for (let i = 0; i < 9; i++) {
      if (grid[i] !== a) continue;
      const r = Math.floor(i / 3);
      const c = i % 3;
      const neighbors = [
        r > 0 ? i - 3 : -1,
        r < 2 ? i + 3 : -1,
        c > 0 ? i - 1 : -1,
        c < 2 ? i + 1 : -1,
      ];
      if (neighbors.some((n) => n >= 0 && grid[n] === b)) return true;
    }
    return false;
  };

  let qiPct = has('spirit_array') ? 18 : 0;
  let atkPct = has('forge_hall') ? 16 : 0;
  let hpPct = has('spring_pool') ? 20 : 0;
  let critBonus = has('enlightenment_altar') ? 8 : 0;
  let breakBonus = has('enlightenment_altar') ? 0.05 : 0;
  let cdMult = has('scripture_pavilion') ? 1.15 : 1;
  let petBonusPct = has('beast_garden') ? 20 : 0;
  let extraHerbTick = has('herb_field') ? 1 : 0;
  let bonusAlchemyChance = has('alchemy_room') ? 0.35 : 0;

  const synergies: SynergyInfo[] = [];

  if (areAdjacent('spirit_array', 'herb_field')) {
    synergies.push({ id: 'syn_herb', title: '灵气润田', desc: '聚灵阵×灵药田：灵草额外 +1，吐纳 +12%' });
    extraHerbTick += 1;
    qiPct += 12;
  }
  if (areAdjacent('spring_pool', 'beast_garden')) {
    synergies.push({ id: 'syn_beast', title: '灵泉沐兽', desc: '灵泉池×灵兽园：灵宠加成 +30%，气血 +15%' });
    petBonusPct += 30;
    hpPct += 15;
  }
  if (areAdjacent('scripture_pavilion', 'enlightenment_altar')) {
    synergies.push({ id: 'syn_dao', title: '藏经悟道', desc: '藏经阁×悟道台：吐纳 +25%，神通冷却再加快 20%' });
    qiPct += 25;
    cdMult += 0.2;
  }
  if (areAdjacent('alchemy_room', 'herb_field')) {
    synergies.push({ id: 'syn_alchemy', title: '现采现炼', desc: '炼丹房×灵药田：炼丹额外产出概率 +35%' });
    bonusAlchemyChance += 0.35;
  }
  if (areAdjacent('forge_hall', 'spirit_array')) {
    synergies.push({ id: 'syn_forge', title: '灵火淬锋', desc: '炼器阁×聚灵阵：御剑攻击 +22%，会心 +6%' });
    atkPct += 22;
    critBonus += 6;
  }

  return {
    synergies,
    qiPct,
    atkPct,
    hpPct,
    critBonus,
    breakBonus,
    cdMult,
    petBonusPct,
    extraHerbTick,
    bonusAlchemyChance,
  };
}

export const STORY_CHAIN_EVENTS: EncounterEvent[] = [
  {
    id: 'chain_1',
    tier: 'rare',
    title: '【连环奇遇·第一幕】沉底古木盒',
    story: '你在灵溪边摸鱼时，脚底踢到一个刻满玄奥道纹的古旧木盒。盒内静静躺着半卷泛着微光的残经，似乎还在呼唤着另一半。',
    choices: [
      { label: '滴血认主，收入怀中', hint: '开启【古盒残卷】传承链（1/3）', outcomeType: 'story_chain_next' },
      { label: '先取走盒底灵石', hint: '获灵石但暂缓传承', outcomeType: 'stones' },
    ],
  },
  {
    id: 'chain_2',
    tier: 'rare',
    title: '【连环奇遇·第二幕】残卷夜鸣',
    story: '深夜闭关时，怀中半卷残经突然自行飞起，化作一道金色流光指向后山幽谷！一道虚幻剑影在月下为你指明了下半卷的下落。',
    choices: [
      { label: '御剑循光寻得下半卷', hint: '推进【古盒残卷】传承链（2/3）', outcomeType: 'story_chain_next' },
      { label: '趁机采摘沿途灵药', hint: '获回春丹 ×4', outcomeType: 'heal_pills' },
    ],
  },
  {
    id: 'chain_3',
    tier: 'legendary',
    title: '【连环奇遇·终幕】仙帝秘传觉醒',
    story: '上下两卷残经在掌心轰然合二为一！万丈金光中，上古太初仙帝的一缕神念对你微笑颔首：“能耐得住寂寞、又懂得摸鱼之道，此乃吾之衣钵！”',
    choices: [
      { label: '承接太初仙帝衣钵！', hint: '永久解锁【仙帝传承】全属性 +25% + 仙品重宝！', outcomeType: 'story_chain_next' },
    ],
  },
];

export const ENDINGS = [
  { id: 'sword', title: '剑道飞升', desc: '一剑破万法，御剑直上九重天。' },
  { id: 'alchemy', title: '丹道成仙', desc: '一炉定乾坤，九转仙丹济苍生。' },
  { id: 'beast', title: '御兽成圣', desc: '万灵俯首，携太初神兽共登仙域。' },
  { id: 'body', title: '金刚不灭', desc: '肉身成圣，硬撼九霄神雷而不倒。' },
  { id: 'slacking', title: '摸鱼成道', desc: '不卷不肝，躺着睡着竟也证道成仙！' },
];
