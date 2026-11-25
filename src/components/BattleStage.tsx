import React, { useEffect, useRef, useState } from 'react';
import { RARITY_META, SKILLS } from '../game/data';
import { locArtifactName, locRarity, locSkill } from '../game/i18n';
import { drawDetailedBoss, drawDetailedCultivator, drawDetailedMonster, drawDetailedPet } from '../game/inkSprites';
import { computeStats, useGameStore } from '../game/store';
import { MonsterDef, PetId, Rarity } from '../game/types';

// Lazy-loaded ink-wash sprite & pet portrait cache
const spriteCache: Record<string, HTMLImageElement | 'missing'> = {};

function getInkSprite(key: string): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  const cached = spriteCache[key];
  if (cached === 'missing') return null;
  if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null;

  const img = new Image();
  img.src = key.startsWith('portraits/') ? `./${key}.jpg` : `./sprites/${key}.jpg`;
  img.onerror = () => {
    spriteCache[key] = 'missing';
  };
  spriteCache[key] = img;
  return null;
}

interface Props {
  compact?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

interface SlashArc {
  x: number;
  y: number;
  angle: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Projectile {
  x: number;
  y: number;
  tx: number;
  ty: number;
  progress: number;
  speed: number;
  arcHeight: number;
  color: string;
  trail: { x: number; y: number }[];
  isSkySword?: boolean;
}

interface LightningBolt {
  points: { x: number; y: number }[];
  color: string;
  life: number;
  maxLife: number;
}

interface DamageNum {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface LootBeam {
  x: number;
  y: number;
  rarity: Rarity;
  label: string;
  life: number;
  maxLife: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
}

const RARITY_HEX: Record<Rarity, string> = {
  common: '#787166',
  spirit: '#2e6f5e',
  mystic: '#9333ea',
  immortal: '#d97706',
};

function drawCultivator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  scale: number,
  lunge: number,
  inBurst: boolean,
  realmId: number
) {
  ctx.save();
  ctx.translate(x + lunge * 16 * scale, y + Math.sin(t * 2.6) * 4 * scale);
  ctx.scale(scale, scale);

  const isZhuji = realmId >= 3;
  const isJindan = realmId >= 5;
  const isYuanying = realmId >= 7;
  const isHuashen = realmId >= 8;
  const isImmortal = realmId >= 12;

  // Huashen+: Golden Dharma Avatar behind cultivator
  if (isHuashen) {
    ctx.save();
    ctx.globalAlpha = 0.25 + Math.sin(t * 2) * 0.08;
    ctx.fillStyle = isImmortal ? '#fef08a' : '#d97706';
    ctx.beginPath();
    ctx.arc(0, -14, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Burst Golden Aura or Jade Bagua / Zhuji Lotus Ring
  ctx.save();
  ctx.translate(0, 26);
  ctx.scale(1, 0.28);
  ctx.rotate(t * (inBurst ? 2.2 : 0.7));
  ctx.strokeStyle = inBurst || isJindan ? 'rgba(217, 119, 6, 0.8)' : isZhuji ? 'rgba(16, 185, 129, 0.75)' : 'rgba(46, 111, 94, 0.45)';
  ctx.lineWidth = isZhuji ? 3 : 2.5;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Yuanying+: Mini floating Golden Nascent Soul
  if (isYuanying) {
    ctx.save();
    ctx.translate(-22, -26 + Math.sin(t * 4.5) * 4);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (inBurst) {
    const grad = ctx.createRadialGradient(0, -4, 4, 0, -4, 46);
    grad.addColorStop(0, 'rgba(250, 204, 21, 0.38)');
    grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -4, 46, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flowing Ink Ribbon behind cultivator
  ctx.strokeStyle = inBurst ? '#d97706' : '#3d8b76';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.quadraticCurveTo(
    -26,
    -4 + Math.sin(t * 5) * 6,
    -40,
    8 + Math.cos(t * 4.5) * 7
  );
  ctx.stroke();

  // Robe body
  ctx.fillStyle = '#24211d';
  ctx.beginPath();
  ctx.moveTo(-18, 26);
  ctx.quadraticCurveTo(-15, -4, 0, -8);
  ctx.quadraticCurveTo(15, -4, 18, 26);
  ctx.closePath();
  ctx.fill();

  // White inner collar & sash
  ctx.fillStyle = '#f5f0e6';
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(0, 10);
  ctx.lineTo(6, -6);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = inBurst ? '#f59e0b' : '#3d8b76';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-13, 12);
  ctx.quadraticCurveTo(0, 16, 13, 12);
  ctx.stroke();

  // Head & Hair Bun
  ctx.fillStyle = '#f8f3ea';
  ctx.strokeStyle = '#24211d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -18, 10.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1a1815';
  ctx.beginPath();
  ctx.arc(0, -21, 10.5, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -32, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c6993d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-7, -32);
  ctx.lineTo(7, -32);
  ctx.stroke();

  // Orbiting Spirit Sword ready at shoulder
  const swY = -6 + Math.sin(t * 4) * 3;
  ctx.save();
  ctx.translate(22 + lunge * 10, swY);
  ctx.rotate(-0.12 + lunge * 0.25);
  ctx.strokeStyle = inBurst ? '#f59e0b' : '#2e6f5e';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(20, 0);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(18, 0);
  ctx.stroke();
  ctx.strokeStyle = '#c6993d';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-8, -5);
  ctx.lineTo(-8, 5);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawPet(ctx: CanvasRenderingContext2D, petId: PetId, x: number, y: number, t: number, scale: number) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 3.8 + 1.2) * 5 * scale);
  ctx.scale(scale * 0.65, scale * 0.65);

  if (petId === 'fox') {
    ctx.fillStyle = '#f5f0e6';
    ctx.strokeStyle = '#c4453a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c4453a';
    ctx.beginPath();
    ctx.arc(4, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (petId === 'turtle') {
    ctx.fillStyle = '#2e6f5e';
    ctx.strokeStyle = '#1c1b18';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 4, 15, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (petId === 'crane') {
    ctx.fillStyle = '#f5f0e6';
    ctx.strokeStyle = '#2d2a25';
    ctx.lineWidth = 2;
    const flap = Math.sin(t * 7) * 8;
    ctx.beginPath();
    ctx.moveTo(-18, -4 + flap);
    ctx.quadraticCurveTo(0, -14, 18, -4 + flap);
    ctx.quadraticCurveTo(0, 6, -18, -4 + flap);
    ctx.fill();
    ctx.stroke();
  } else {
    // Golden Dragon
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, 6 + Math.sin(t * 6) * 5);
    ctx.quadraticCurveTo(-4, -10, 6, 4);
    ctx.quadraticCurveTo(14, -10, 20, -4);
    ctx.stroke();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawMonster(
  ctx: CanvasRenderingContext2D,
  kind: MonsterDef['kind'],
  x: number,
  y: number,
  t: number,
  scale: number,
  hitFlash: number,
  isBoss: boolean
) {
  ctx.save();
  const recoil = hitFlash > 0 ? Math.sin(hitFlash * 35) * 7 * scale : 0;
  const bob = Math.sin(t * 3 + 1) * 4 * scale;
  ctx.translate(x + recoil, y + bob);
  const s = scale * (isBoss ? 1.24 : 1);
  ctx.scale(s, s);

  // Dark demonic aura for Bosses
  if (isBoss) {
    const aura = ctx.createRadialGradient(0, 0, 6, 0, 0, 44);
    aura.addColorStop(0, 'rgba(169, 53, 43, 0.35)');
    aura.addColorStop(1, 'rgba(169, 53, 43, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 27, 24, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 28, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyFill = hitFlash > 0 ? '#ffffff' : isBoss ? '#1f1414' : '#2b2824';
  const eyeColor = hitFlash > 0 ? '#facc15' : kind === 'ghost' ? '#5eead4' : '#ef4444';

  ctx.fillStyle = bodyFill;
  ctx.strokeStyle = hitFlash > 0 ? '#f59e0b' : '#141210';
  ctx.lineWidth = 2;

  if (kind === 'serpent') {
    ctx.strokeStyle = hitFlash > 0 ? '#ffffff' : '#1f3b33';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.bezierCurveTo(10, -14, -14, 18, -14, -12);
    ctx.stroke();
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(-14, -14, 3.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'ghost') {
    ctx.beginPath();
    ctx.moveTo(-16, 24);
    ctx.quadraticCurveTo(-18, -22, 0, -26);
    ctx.quadraticCurveTo(18, -22, 16, 24);
    ctx.lineTo(8, 16);
    ctx.lineTo(0, 25);
    ctx.lineTo(-8, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(-6, -8, 3, 0, Math.PI * 2);
    ctx.arc(6, -8, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'demon' || isBoss) {
    ctx.beginPath();
    ctx.moveTo(-22, 26);
    ctx.quadraticCurveTo(-20, -18, 0, -22);
    ctx.quadraticCurveTo(20, -18, 22, 26);
    ctx.closePath();
    ctx.fill();
    // Crimson Horns
    ctx.strokeStyle = hitFlash > 0 ? '#ffffff' : '#b91c1c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.quadraticCurveTo(-24, -34, -10, -34);
    ctx.moveTo(10, -18);
    ctx.quadraticCurveTo(24, -34, 10, -34);
    ctx.stroke();
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(-7, -6, 3.5, 0, Math.PI * 2);
    ctx.arc(7, -6, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Imp / Wolf / Golem silhouette
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-14, -10);
    ctx.lineTo(-20, -26);
    ctx.lineTo(-4, -14);
    ctx.moveTo(14, -10);
    ctx.lineTo(20, -26);
    ctx.lineTo(4, -14);
    ctx.fill();
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(-6, -2, 3, 0, Math.PI * 2);
    ctx.arc(6, -2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export const BattleStage: React.FC<Props> = ({ compact = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [skillBanner, setSkillBanner] = useState<string | null>(null);

  const state = useGameStore();
  const { maxHp } = computeStats(state);
  const {
    battleEvent,
    enemyAttackEvent,
    healEvent,
    playerHp,
    recoverTimer,
    monsterName,
    monsterHp,
    monsterMaxHp,
    isBossFight,
    isTowerFight,
    bossTimer,
    burstTimer,
    manualSlash,
  } = state;

  const isSpecialBoss = isBossFight || isTowerFight;
  const hpPct = Math.max(0, Math.min(100, (monsterHp / monsterMaxHp) * 100));
  const playerHpPct = Math.max(0, Math.min(100, (playerHp / maxHp) * 100));

  // Mutable 60fps FX world state
  const fxRef = useRef({
    particles: [] as Particle[],
    slashes: [] as SlashArc[],
    projectiles: [] as Projectile[],
    bolts: [] as LightningBolt[],
    dmgNums: [] as DamageNum[],
    beams: [] as LootBeam[],
    waves: [] as Shockwave[],
    ambient: Array.from({ length: 22 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.2 + Math.random() * 2.2,
      s: 0.04 + Math.random() * 0.09,
      isPetal: Math.random() < 0.35,
    })),
    shake: 0,
    hitFlash: 0,
    playerHitFlash: 0,
    lunge: 0,
    lastSeq: 0,
    lastEnemySeq: 0,
    lastHealSeq: 0,
  });

  // React to Enemy Counterattack -> dark crimson projectile from monster to player!
  useEffect(() => {
    if (!enemyAttackEvent || enemyAttackEvent.seq === fxRef.current.lastEnemySeq) return;
    fxRef.current.lastEnemySeq = enemyAttackEvent.seq;
    const canvas = canvasRef.current;
    const w = canvas ? canvas.clientWidth : 500;
    const h = canvas ? canvas.clientHeight : 160;
    const px = w * 0.2;
    const py = h * 0.62;
    const mx = w * 0.78;
    const my = h * 0.6;
    const fx = fxRef.current;

    fx.playerHitFlash = 0.28;
    if (enemyAttackEvent.isHeavy) fx.shake = 7;

    fx.projectiles.push({
      x: mx - 16,
      y: my - 4,
      tx: px,
      ty: py,
      progress: 0,
      speed: 4.2,
      arcHeight: enemyAttackEvent.isHeavy ? -26 : -10,
      color: enemyAttackEvent.isHeavy ? '#dc2626' : '#7e22ce',
      trail: [],
    });

    for (let i = 0; i < (enemyAttackEvent.isHeavy ? 14 : 6); i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 80;
      fx.particles.push({
        x: px,
        y: py,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 20,
        size: enemyAttackEvent.isHeavy ? 3.5 : 2.2,
        color: i % 2 === 0 ? '#dc2626' : '#581c87',
        alpha: 1,
        life: 0.45,
        maxLife: 0.45,
        gravity: 140,
      });
    }

    fx.dmgNums.push({
      x: px + (Math.random() - 0.5) * 16,
      y: py - (compact ? 14 : 26),
      vx: (Math.random() - 0.5) * 20,
      vy: compact ? -34 : -48,
      text: enemyAttackEvent.isHeavy ? `妖王重击 -${enemyAttackEvent.damage}!` : `-${enemyAttackEvent.damage}`,
      color: '#dc2626',
      size: enemyAttackEvent.isHeavy ? (compact ? 12 : 15) : compact ? 10 : 12,
      life: 0.9,
      maxLife: 0.9,
    });
  }, [enemyAttackEvent, compact]);

  // React to Heal Pill -> emerald rising sparkles!
  useEffect(() => {
    if (!healEvent || healEvent.seq === fxRef.current.lastHealSeq) return;
    fxRef.current.lastHealSeq = healEvent.seq;
    const canvas = canvasRef.current;
    const w = canvas ? canvas.clientWidth : 500;
    const h = canvas ? canvas.clientHeight : 160;
    const px = w * 0.2;
    const py = h * 0.62;
    const fx = fxRef.current;

    for (let i = 0; i < 16; i++) {
      fx.particles.push({
        x: px + (Math.random() - 0.5) * 34,
        y: py + 14,
        vx: (Math.random() - 0.5) * 24,
        vy: -55 - Math.random() * 65,
        size: 2.5 + Math.random() * 2.5,
        color: i % 2 === 0 ? '#10b981' : '#a7f3d0',
        alpha: 1,
        life: 0.7,
        maxLife: 0.7,
      });
    }
    const curLocale = useGameStore.getState().locale ?? 'zh';
    fx.dmgNums.push({
      x: px,
      y: py - 24,
      vx: 0,
      vy: -42,
      text: `${curLocale === 'zh' ? '回春' : 'Heal'} +${healEvent.amount}`,
      color: '#059669',
      size: compact ? 11 : 14,
      life: 1.0,
      maxLife: 1.0,
    });
  }, [healEvent, compact]);

  // React to combat events -> spawn juicy 60fps canvas FX!
  useEffect(() => {
    if (!battleEvent || battleEvent.seq === fxRef.current.lastSeq) return;
    fxRef.current.lastSeq = battleEvent.seq;

    const canvas = canvasRef.current;
    const w = canvas ? canvas.clientWidth : 500;
    const h = canvas ? canvas.clientHeight : 160;
    const px = w * 0.2;
    const py = h * 0.62;
    const mx = w * 0.78;
    const my = h * 0.6;

    const fx = fxRef.current;
    fx.lunge = 1;
    fx.hitFlash = 0.26;
    if (battleEvent.isCrit || battleEvent.skillId || battleEvent.lightningProc) {
      fx.shake = battleEvent.skillId === 'wanjian' ? 9 : 5.5;
    } else {
      fx.shake = 2;
    }

    const curLocale = useGameStore.getState().locale ?? 'zh';
    if (battleEvent.skillId) {
      const sk = SKILLS.find((item) => item.id === battleEvent.skillId);
      if (sk) {
        setSkillBanner(locSkill(sk, curLocale).name);
        setTimeout(() => setSkillBanner(null), 950);
      }
    }

    // 1. Spawn curved sword projectiles or Sword Rain (万剑归宗)
    if (battleEvent.skillId === 'wanjian') {
      for (let i = 0; i < 9; i++) {
        fx.projectiles.push({
          x: mx - 90 + Math.random() * 140,
          y: -15 - Math.random() * 40,
          tx: mx + (Math.random() - 0.5) * 40,
          ty: my + (Math.random() - 0.5) * 20,
          progress: 0,
          speed: 3.4 + Math.random() * 1.4,
          arcHeight: 0,
          color: i % 2 === 0 ? '#ef4444' : '#f59e0b',
          trail: [],
          isSkySword: true,
        });
      }
    } else {
      const count = battleEvent.skillId === 'qinglian' ? 3 : battleEvent.isDouble ? 2 : 1;
      for (let i = 0; i < count; i++) {
        fx.projectiles.push({
          x: px + 18,
          y: py - 6 + (i - (count - 1) / 2) * 14,
          tx: mx,
          ty: my + (Math.random() - 0.5) * 12,
          progress: 0,
          speed: 4.5 + i * 0.4,
          arcHeight: (i % 2 === 0 ? -1 : 1) * (20 + Math.random() * 18),
          color: battleEvent.isCrit ? '#d97706' : '#2e6f5e',
          trail: [],
        });
      }
    }

    // 2. Diagonal Slash Arc on monster
    fx.slashes.push({
      x: mx,
      y: my,
      angle: -0.6 + (Math.random() - 0.5) * 0.8,
      radius: compact ? 22 : 38,
      color: battleEvent.isCrit ? '#f59e0b' : '#3d8b76',
      life: 0.28,
      maxLife: 0.28,
    });

    // Expanding Shockwave Ring for juicy impact!
    fx.waves.push({
      x: mx,
      y: my,
      radius: 6,
      maxRadius: battleEvent.isCrit || battleEvent.killed ? (compact ? 36 : 62) : compact ? 22 : 38,
      color: battleEvent.isCrit ? '#f59e0b' : '#3d8b76',
      life: 0.36,
      maxLife: 0.36,
    });

    // 3. Multi-forked Sky Lightning on Crit / Thunder / Lightning Affix
    if (battleEvent.isCrit || battleEvent.skillId === 'thunder' || battleEvent.lightningProc) {
      const pts: { x: number; y: number }[] = [{ x: mx + (Math.random() - 0.5) * 20, y: 0 }];
      const steps = 6;
      for (let i = 1; i < steps; i++) {
        pts.push({
          x: mx + (Math.random() - 0.5) * 26,
          y: (my / steps) * i,
        });
      }
      pts.push({ x: mx, y: my + 8 });
      fx.bolts.push({
        points: pts,
        color: battleEvent.lightningProc ? '#a855f7' : '#c084fc',
        life: 0.34,
        maxLife: 0.34,
      });
    }

    // 4. Ink & Spark Particles
    const pCount = battleEvent.killed ? 24 : battleEvent.isCrit ? 14 : 7;
    for (let i = 0; i < pCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 45 + Math.random() * (battleEvent.killed ? 150 : 95);
      fx.particles.push({
        x: mx,
        y: my,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 30,
        size: battleEvent.killed ? 3 + Math.random() * 4.5 : 2 + Math.random() * 2.5,
        color:
          i % 3 === 0
            ? battleEvent.isCrit
              ? '#f59e0b'
              : '#3d8b76'
            : '#2d2a25',
        alpha: 1,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8,
        gravity: 180,
      });
    }

    // 5. Floating Damage Number
    const prefix =
      curLocale === 'zh'
        ? battleEvent.lightningProc
          ? '⚡引雷 '
          : battleEvent.isDouble
            ? '连斩 '
            : battleEvent.isCrit
              ? '会心 '
              : ''
        : battleEvent.lightningProc
          ? '⚡Zap '
          : battleEvent.isDouble
            ? 'Twin '
            : battleEvent.isCrit
              ? 'Crit '
              : '';
    fx.dmgNums.push({
      x: compact ? w * 0.56 + (Math.random() - 0.5) * 16 : mx + (Math.random() - 0.5) * 20,
      y: compact ? h * 0.72 : my - 26,
      vx: (Math.random() - 0.5) * 20,
      vy: compact ? -18 : -58,
      text: `${prefix}-${battleEvent.damage}`,
      color: battleEvent.isCrit || battleEvent.lightningProc ? '#b91c1c' : '#1c1b18',
      size: battleEvent.isCrit ? (compact ? 12 : 17) : compact ? 10 : 13,
      life: 0.9,
      maxLife: 0.9,
    });

    // 6. Loot Light Pillar!
    if (battleEvent.lootRarity && battleEvent.lootName) {
      const rarLabel = locRarity(battleEvent.lootRarity, RARITY_META[battleEvent.lootRarity].label, curLocale);
      const artLabel = locArtifactName(battleEvent.lootName, curLocale);
      fx.beams.push({
        x: mx,
        y: h - 4,
        rarity: battleEvent.lootRarity,
        label: `${rarLabel}·${artLabel}`,
        life: 2.1,
        maxLife: 2.1,
      });
    }
  }, [battleEvent, compact]);

  // 60fps Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const t = now / 1000;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      const state = useGameStore.getState();
      const inBurst = state.burstTimer > 0;
      const specialBoss = state.isBossFight || state.isTowerFight;
      const fx = fxRef.current;

      // Decay camera shake, hitFlash, lunge
      fx.shake = Math.max(0, fx.shake - dt * 28);
      fx.hitFlash = Math.max(0, fx.hitFlash - dt);
      fx.playerHitFlash = Math.max(0, fx.playerHitFlash - dt);
      fx.lunge = Math.max(0, fx.lunge - dt * 5);

      ctx.save();
      ctx.scale(dpr, dpr);

      if (fx.shake > 0.2) {
        ctx.translate((Math.random() - 0.5) * fx.shake, (Math.random() - 0.5) * fx.shake);
      }

      // 1. Rice-Paper / Boss / Burst Sky Gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      if (inBurst) {
        sky.addColorStop(0, '#fef3c7');
        sky.addColorStop(1, '#f5e6cc');
      } else if (specialBoss) {
        sky.addColorStop(0, '#f5e1de');
        sky.addColorStop(1, '#ece0cf');
      } else {
        sky.addColorStop(0, '#f7f3eb');
        sky.addColorStop(1, '#eae0ce');
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // 2. Parallax Distant Ink Mountains
      ctx.fillStyle = 'rgba(120, 113, 102, 0.16)';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 24) {
        const y = h * 0.62 + Math.sin(x * 0.012 + t * 0.18) * (h * 0.16) + Math.cos(x * 0.028) * (h * 0.06);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(74, 69, 61, 0.14)';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 20) {
        const y = h * 0.78 + Math.sin(x * 0.018 + t * 0.35 + 2) * (h * 0.1);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // 3. Ambient Floating Qi Motes & Drifting Ink-Blossom Petals
      fx.ambient.forEach((m) => {
        m.x = (m.x + m.s * dt * 0.35) % 1;
        const ax = m.x * w;
        const ay = (m.y * h + Math.sin(t * 2 + m.x * 10) * 8 + h) % h;
        ctx.save();
        if (m.isPetal) {
          ctx.translate(ax, ay);
          ctx.rotate(t * 1.4 + m.x * 6);
          ctx.fillStyle = inBurst ? 'rgba(245, 158, 11, 0.5)' : 'rgba(196, 69, 58, 0.28)';
          ctx.beginPath();
          ctx.ellipse(0, 0, m.r * 1.8, m.r * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = inBurst ? 'rgba(217, 119, 6, 0.45)' : 'rgba(61, 139, 118, 0.28)';
          ctx.beginPath();
          ctx.arc(ax, ay, m.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 4. Draw Loot Light Pillars behind/around monster
      for (let i = fx.beams.length - 1; i >= 0; i--) {
        const b = fx.beams[i];
        b.life -= dt;
        if (b.life <= 0) {
          fx.beams.splice(i, 1);
          continue;
        }
        const ratio = Math.min(1, b.life / 0.5);
        const col = RARITY_HEX[b.rarity];
        const grad = ctx.createLinearGradient(b.x, b.y, b.x, 12);
        grad.addColorStop(0, col);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.save();
        ctx.globalAlpha = 0.55 * ratio;
        ctx.fillStyle = grad;
        ctx.fillRect(b.x - 18, 12, 36, b.y - 12);
        ctx.globalAlpha = ratio;
        ctx.font = `bold ${compact ? 10 : 12}px "Songti SC", serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = col;
        ctx.fillText(b.label, b.x, compact ? 22 : 34);
        ctx.restore();
      }

      // 5. Draw Actors (Pet + Cultivator on left, Monster on right)
      const scale = compact ? 0.56 : 0.98;
      const px = w * 0.2;
      const py = h * 0.62;
      const mx = w * 0.78;
      const my = h * 0.6;

      if (state.activePet) {
        const petImg = getInkSprite(`portraits/pet_${state.activePet}`);
        const petX = px - (compact ? 30 : 54);
        const petY = py - (compact ? 6 : 12) + Math.sin(t * 3.4 + 1.1) * (compact ? 3 : 5);
        if (petImg) {
          const r = compact ? 15 : 23;
          ctx.save();
          // Soft golden-jade spirit aura behind pet
          const glow = ctx.createRadialGradient(petX, petY, r * 0.4, petX, petY, r * 1.45);
          glow.addColorStop(0, 'rgba(234, 179, 8, 0.42)');
          glow.addColorStop(1, 'rgba(234, 179, 8, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(petX, petY, r * 1.45, 0, Math.PI * 2);
          ctx.fill();

          // Circular clipped AI ink-wash pet portrait
          ctx.beginPath();
          ctx.arc(petX, petY, r, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(petImg, petX - r, petY - r, r * 2, r * 2);
          ctx.restore();

          // Crisp thin gold-jade rim
          ctx.save();
          ctx.strokeStyle = 'rgba(198, 153, 61, 0.85)';
          ctx.lineWidth = compact ? 1.5 : 2;
          ctx.beginPath();
          ctx.arc(petX, petY, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else {
          drawDetailedPet(ctx, state.activePet, petX, petY, t, scale);
        }
      }

      const heroX = px + (fx.playerHitFlash > 0 ? Math.sin(fx.playerHitFlash * 35) * 5 : 0);
      const heroSprite = getInkSprite('hero');
      if (heroSprite) {
        // Draw realm lotus/halo underneath + AI ink-wash hero sprite with multiply blend!
        ctx.save();
        const hoverY = Math.sin(t * 2.5) * 4 * scale;
        ctx.translate(heroX + fx.lunge * 18 * scale, py + hoverY);
        ctx.rotate(fx.lunge * 0.1);
        // Subtle realm ground halo
        ctx.save();
        ctx.translate(0, 26 * scale);
        ctx.scale(1, 0.28);
        ctx.rotate(t * (inBurst ? 2.4 : 0.8));
        ctx.strokeStyle = inBurst || state.realmId >= 5 ? 'rgba(217,119,6,0.75)' : 'rgba(46,111,94,0.5)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, 34 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const sprSize = (compact ? 58 : 108) * (1 + Math.sin(t * 2.5) * 0.02);
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(heroSprite, -sprSize / 2, -sprSize / 2 - 4 * scale, sprSize, sprSize);
        ctx.restore();
      } else {
        drawDetailedCultivator(ctx, heroX, py, t, scale, fx.lunge, inBurst, state.realmId);
      }

      if (fx.playerHitFlash > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(220, 38, 38, ${fx.playerHitFlash * 1.4})`;
        ctx.beginPath();
        ctx.arc(px, py, 24 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const bossKey =
        state.monsterKind === 'serpent'
          ? 'boss_dragon'
          : state.monsterKind === 'demon' || state.monsterKind === 'ghost'
            ? 'boss_sovereign'
            : 'boss_ape';
      const monsterSprite = specialBoss
        ? getInkSprite(bossKey)
        : getInkSprite(`monster_${state.monsterKind}`);
      if (monsterSprite) {
        ctx.save();
        const recoil = fx.hitFlash > 0 ? Math.sin(fx.hitFlash * 38) * 8 * scale : 0;
        const bob = Math.sin(t * 3.1 + 1) * 4 * scale;
        ctx.translate(mx + recoil, my + bob);

        // Epic rotating crimson-gold halo behind Guardian Bosses
        if (specialBoss) {
          ctx.save();
          const bossAura = ctx.createRadialGradient(0, -4 * scale, 12 * scale, 0, -4 * scale, 64 * scale);
          bossAura.addColorStop(0, 'rgba(185, 28, 28, 0.22)');
          bossAura.addColorStop(0.6, 'rgba(217, 119, 6, 0.12)');
          bossAura.addColorStop(1, 'rgba(185, 28, 28, 0)');
          ctx.fillStyle = bossAura;
          ctx.beginPath();
          ctx.arc(0, -4 * scale, 64 * scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.rotate(-t * 1.1);
          ctx.strokeStyle = 'rgba(185, 28, 28, 0.55)';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([10, 6]);
          ctx.beginPath();
          ctx.arc(0, -4 * scale, 48 * scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        const mSize = (compact ? 58 : 114) * (specialBoss ? 1.26 : 1);
        const bx = 1 + Math.sin(t * 3.1) * 0.03;
        const by = 1 - Math.sin(t * 3.1) * 0.03;
        ctx.scale(bx, by);
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(monsterSprite, -mSize / 2, -mSize / 2 - 4 * scale, mSize, mSize);
        ctx.restore();
        if (fx.hitFlash > 0) {
          ctx.save();
          ctx.fillStyle = `rgba(255, 255, 255, ${fx.hitFlash * 2.2})`;
          ctx.beginPath();
          ctx.arc(mx + recoil, my + bob, 26 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else if (specialBoss) {
        drawDetailedBoss(ctx, state.monsterKind, mx, my, t, scale, fx.hitFlash);
      } else {
        drawDetailedMonster(ctx, state.monsterKind, mx, my, t, scale, fx.hitFlash, false);
      }

      // 6. Curved Sword Qi Projectiles & Trails
      for (let i = fx.projectiles.length - 1; i >= 0; i--) {
        const p = fx.projectiles[i];
        p.progress += p.speed * dt;
        if (p.progress >= 1) {
          fx.projectiles.splice(i, 1);
          continue;
        }
        const u = p.progress;
        const cx = p.x + (p.tx - p.x) * u;
        const cy = p.y + (p.ty - p.y) * u + Math.sin(u * Math.PI) * p.arcHeight;
        p.trail.push({ x: cx, y: cy });
        if (p.trail.length > 9) p.trail.shift();

        if (p.trail.length > 1) {
          ctx.save();
          ctx.strokeStyle = p.color;
          ctx.lineCap = 'round';
          for (let j = 1; j < p.trail.length; j++) {
            ctx.globalAlpha = (j / p.trail.length) * 0.85;
            ctx.lineWidth = (j / p.trail.length) * (p.isSkySword ? 4.5 : 5.5);
            ctx.beginPath();
            ctx.moveTo(p.trail[j - 1].x, p.trail[j - 1].y);
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
            ctx.stroke();
          }
          // Glowing blade core
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, cy, p.isSkySword ? 2.5 : 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 7. Crescent Slash Arcs
      for (let i = fx.slashes.length - 1; i >= 0; i--) {
        const s = fx.slashes[i];
        s.life -= dt;
        if (s.life <= 0) {
          fx.slashes.splice(i, 1);
          continue;
        }
        const alpha = s.life / s.maxLife;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 4 * alpha + 1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, s.radius * (1.2 - alpha * 0.3), -0.8, 0.8);
        ctx.stroke();
        ctx.restore();
      }

      // 7b. Expanding Impact Shockwaves & 4-Point Starburst Flare
      for (let i = fx.waves.length - 1; i >= 0; i--) {
        const wv = fx.waves[i];
        wv.life -= dt;
        if (wv.life <= 0) {
          fx.waves.splice(i, 1);
          continue;
        }
        const p = 1 - wv.life / wv.maxLife;
        const eased = 1 - Math.pow(1 - p, 3);
        const curR = wv.radius + (wv.maxRadius - wv.radius) * eased;
        const alpha = 1 - p;
        ctx.save();
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = wv.color;
        ctx.lineWidth = 3 * alpha + 0.8;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, curR, 0, Math.PI * 2);
        ctx.stroke();

        // Crisp 4-point starburst flash at initial impact
        if (p < 0.35) {
          const starR = curR * 0.85;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(wv.x, wv.y - starR);
          ctx.lineTo(wv.x + 3, wv.y - 3);
          ctx.lineTo(wv.x + starR, wv.y);
          ctx.lineTo(wv.x + 3, wv.y + 3);
          ctx.lineTo(wv.x, wv.y + starR);
          ctx.lineTo(wv.x - 3, wv.y + 3);
          ctx.lineTo(wv.x - starR, wv.y);
          ctx.lineTo(wv.x - 3, wv.y - 3);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 8. Forked Sky Lightning Bolts
      for (let i = fx.bolts.length - 1; i >= 0; i--) {
        const b = fx.bolts[i];
        b.life -= dt;
        if (b.life <= 0) {
          fx.bolts.splice(i, 1);
          continue;
        }
        const alpha = b.life / b.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        b.points.forEach((pt, idx) => (idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
        ctx.stroke();
        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
      }

      // 9. Ink & Spark Particles
      for (let i = fx.particles.length - 1; i >= 0; i--) {
        const pt = fx.particles[i];
        pt.life -= dt;
        if (pt.life <= 0) {
          fx.particles.splice(i, 1);
          continue;
        }
        pt.vy += (pt.gravity ?? 0) * dt;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 10. Floating Damage Numbers
      for (let i = fx.dmgNums.length - 1; i >= 0; i--) {
        const d = fx.dmgNums[i];
        d.life -= dt;
        if (d.life <= 0) {
          fx.dmgNums.splice(i, 1);
          continue;
        }
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += 65 * dt;
        ctx.save();
        ctx.globalAlpha = Math.min(1, (d.life / d.maxLife) * 1.4);
        ctx.font = `bold ${d.size}px "Songti SC", serif`;
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(251, 249, 245, 0.9)';
        ctx.strokeText(d.text, d.x, d.y);
        ctx.fillStyle = d.color;
        ctx.fillText(d.text, d.x, d.y);
        ctx.restore();
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [compact]);

  const handleCanvasClick = () => {
    manualSlash();
  };

  return (
    <div
      onClick={handleCanvasClick}
      title="点击战场可施展「弹指剑气」加速斩妖并积攒剑意！"
      className={`relative w-full overflow-hidden rounded-xl border cursor-crosshair select-none app-no-drag transition-colors ${
        burstTimer > 0
          ? 'border-gold-500 shadow-md'
          : isSpecialBoss
            ? 'border-cinnabar-500'
            : 'border-paper-300/90'
      } ${compact ? 'h-[80px]' : 'h-44'}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top Overlay HUD: Left Player HP, Right Monster HP */}
      <div className="pointer-events-none absolute inset-x-0 top-0 px-3 pt-1.5 flex items-center justify-between text-[11px] gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-serif font-bold text-ink-900 text-[10px]">
            {recoverTimer > 0
              ? `${(state.locale ?? 'zh') === 'zh' ? '调息' : 'Recover'} ${Math.ceil(recoverTimer)}s`
              : `${(state.locale ?? 'zh') === 'zh' ? '气血' : 'HP'} ${playerHp}/${maxHp}`}
          </span>
          <div className={`${compact ? 'w-14' : 'w-24'} h-2 rounded-full bg-paper-300/90 overflow-hidden relative shadow-inner`}>
            <div
              className="absolute inset-y-0 left-0 bg-gold-500/70 transition-all duration-700 ease-out"
              style={{ width: `${playerHpPct}%` }}
            />
            <div
              className={`relative h-full transition-all duration-150 ${
                playerHpPct < 35 ? 'bg-cinnabar-600 animate-pulse' : playerHpPct < 65 ? 'bg-gold-500' : 'bg-jade-500'
              }`}
              style={{ width: `${playerHpPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {burstTimer > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-gold-600 text-paper-50 font-serif text-[10px] font-bold animate-pulse">
              {(state.locale ?? 'zh') === 'zh' ? '人剑合一' : 'Burst'} {Math.ceil(burstTimer)}s
            </span>
          )}
          {isSpecialBoss && (
            <span className="px-1.5 py-0.5 rounded bg-cinnabar-600 text-paper-50 font-mono text-[10px] font-bold">
              {(state.locale ?? 'zh') === 'zh' ? '限时' : 'Time'} {Math.ceil(bossTimer)}s
            </span>
          )}
          <span
            className={`font-serif font-bold truncate max-w-[110px] ${
              isSpecialBoss ? 'text-cinnabar-600' : 'text-ink-900'
            }`}
          >
            {(state.locale ?? 'zh') === 'zh'
              ? monsterName
              : isSpecialBoss
                ? 'Guardian Boss'
                : `${state.monsterKind.charAt(0).toUpperCase()}${state.monsterKind.slice(1)} Demon`}
          </span>
          <div className={`${compact ? 'w-16' : 'w-24'} h-2 rounded-full bg-paper-300/90 overflow-hidden relative shadow-inner`}>
            <div
              className="absolute inset-y-0 left-0 bg-amber-300 transition-all duration-700 ease-out"
              style={{ width: `${hpPct}%` }}
            />
            <div
              className="relative h-full bg-cinnabar-500 transition-all duration-150"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Skill Calligraphy Banner */}
      {skillBanner && !compact && (
        <div className="pointer-events-none absolute top-7 left-1/2 -translate-x-1/2 z-30 px-3.5 py-0.5 rounded-full bg-ink-900/85 text-gold-100 font-serif font-bold text-xs tracking-widest shadow-md">
          ✦ {skillBanner} ✦
        </div>
      )}
    </div>
  );
};
