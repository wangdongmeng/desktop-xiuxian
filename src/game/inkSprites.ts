import { MonsterDef, PetId } from './types';

// Detailed Multi-Layered Chinese Ink-Wash Character, Monster & Pet Canvas Painter
// Features cloth physics, multi-segment serpentine motion, layered ink-wash shading, and realm visual evolution.

export function drawDetailedCultivator(
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
  const hoverY = Math.sin(t * 2.5) * 4.5 * scale;
  const lungeX = lunge * 20 * scale;
  ctx.translate(x + lungeX, y + hoverY);
  ctx.rotate(lunge * 0.11);
  ctx.scale(scale, scale);

  const isZhuji = realmId >= 3;
  const isJindan = realmId >= 5;
  const isYuanying = realmId >= 7;
  const isHuashen = realmId >= 8;
  const isImmortal = realmId >= 12;

  // 1. Huashen+: Towering Golden Dharma Avatar Silhouette
  if (isHuashen) {
    ctx.save();
    const glowR = 46 + Math.sin(t * 2.2) * 4;
    const dGrad = ctx.createRadialGradient(0, -14, 6, 0, -14, glowR);
    dGrad.addColorStop(0, isImmortal ? 'rgba(254, 240, 138, 0.55)' : 'rgba(217, 119, 6, 0.35)');
    dGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = dGrad;
    ctx.beginPath();
    ctx.arc(0, -14, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Dharma crown ring
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(0, -28, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Ground Bagua / Spirit Lotus Halo
  ctx.save();
  ctx.translate(0, 30);
  ctx.scale(1, 0.3);
  ctx.rotate(t * (inBurst ? 2.4 : 0.8));
  ctx.strokeStyle = inBurst || isJindan ? 'rgba(217, 119, 6, 0.85)' : isZhuji ? 'rgba(16, 185, 129, 0.8)' : 'rgba(46, 111, 94, 0.45)';
  ctx.lineWidth = isZhuji ? 3 : 2;
  ctx.setLineDash([8, 5]);
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.stroke();
  if (isZhuji) {
    // Stylized lotus petals
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.fillStyle = isJindan ? 'rgba(250, 204, 21, 0.32)' : 'rgba(52, 211, 153, 0.32)';
      ctx.beginPath();
      ctx.ellipse(22, 0, 13, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 3. Flowing Celestial Silk Ribbon (animated cloth wave)
  ctx.save();
  ctx.strokeStyle = inBurst ? '#f59e0b' : isJindan ? '#d97706' : '#2e6f5e';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -4);
  ctx.bezierCurveTo(
    -24,
    -14 + Math.sin(t * 4.2) * 7,
    -38,
    6 + Math.cos(t * 3.8) * 8,
    -48,
    -6 + Math.sin(t * 4.5) * 9
  );
  ctx.stroke();
  ctx.restore();

  // 4. Layered Flowing Hair behind back
  ctx.fillStyle = '#181614';
  ctx.beginPath();
  ctx.moveTo(-6, -18);
  ctx.quadraticCurveTo(-22, -6 + Math.sin(t * 3.5) * 3, -26, 12 + Math.cos(t * 3.2) * 4);
  ctx.quadraticCurveTo(-14, 10, -4, -6);
  ctx.closePath();
  ctx.fill();

  // 5. Outer Flowing Ink-Wash Taoist Robe (with gradient & wide sleeves)
  const robeGrad = ctx.createLinearGradient(0, -10, 0, 30);
  if (isImmortal) {
    robeGrad.addColorStop(0, '#fbf8f1');
    robeGrad.addColorStop(1, '#e8dcc4');
  } else {
    robeGrad.addColorStop(0, '#36322c');
    robeGrad.addColorStop(1, '#1a1815');
  }
  ctx.fillStyle = robeGrad;
  ctx.strokeStyle = isJindan ? '#c6993d' : '#141210';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-14, -8);
  ctx.quadraticCurveTo(-22, 10, -24, 28 + Math.sin(t * 3) * 1.5);
  ctx.quadraticCurveTo(0, 33, 22, 27);
  ctx.quadraticCurveTo(18, 8, 12, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner ivory crossed lapel collar (交领右衽)
  ctx.fillStyle = '#f6f0e4';
  ctx.beginPath();
  ctx.moveTo(-8, -9);
  ctx.lineTo(1, 9);
  ctx.lineTo(9, -9);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = isJindan ? '#c6993d' : '#2e6f5e';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-7, -8);
  ctx.lineTo(2, 9);
  ctx.moveTo(8, -8);
  ctx.lineTo(-1, 5);
  ctx.stroke();

  // Wide flowing front sleeve (sword-finger gesture arm)
  ctx.fillStyle = isImmortal ? '#f5efe2' : '#2b2722';
  ctx.beginPath();
  ctx.moveTo(4, -4);
  ctx.quadraticCurveTo(18, -2, 22 + lunge * 5, 2);
  ctx.quadraticCurveTo(18, 14, 6, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Jade waist sash + hanging tassel
  ctx.strokeStyle = inBurst || isJindan ? '#eab308' : '#3d8b76';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-13, 11);
  ctx.quadraticCurveTo(0, 15, 13, 10);
  ctx.stroke();
  ctx.strokeStyle = '#c4453a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(2, 13);
  ctx.quadraticCurveTo(4 + Math.sin(t * 4) * 3, 22, 1 + Math.sin(t * 4) * 5, 27);
  ctx.stroke();

  // 6. Head, Serene Face & Topknot Crown
  ctx.fillStyle = '#faf5ec';
  ctx.strokeStyle = '#24211d';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -19, 10.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hair & Jade Hairpin
  ctx.fillStyle = '#181614';
  ctx.beginPath();
  ctx.arc(0, -22, 10.6, Math.PI * 0.95, Math.PI * 2.05);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-1, -33, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isJindan ? '#facc15' : '#c6993d';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-9, -33);
  ctx.lineTo(8, -33);
  ctx.stroke();

  // Calm focused eyes looking right
  ctx.strokeStyle = '#1c1b18';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(2, -19);
  ctx.lineTo(6.5, -19.5);
  ctx.stroke();

  // 7. Yuanying+: Glowing Golden Nascent Soul Companion
  if (isYuanying) {
    ctx.save();
    ctx.translate(-24, -28 + Math.sin(t * 4) * 4);
    const ng = ctx.createRadialGradient(0, 0, 1, 0, 0, 12);
    ng.addColorStop(0, '#fef9c3');
    ng.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, -3, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, 7);
    ctx.quadraticCurveTo(0, -1, 5, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 8. Articulated Orbiting Spirit Sword
  const swX = 25 + Math.cos(t * 2.4) * 4 + lunge * 14;
  const swY = -10 + Math.sin(t * 3.8) * 5;
  ctx.save();
  ctx.translate(swX, swY);
  ctx.rotate(-0.18 + lunge * 0.28);

  // Luminous sword aura
  ctx.shadowColor = inBurst ? '#f59e0b' : '#2e6f5e';
  ctx.shadowBlur = inBurst ? 12 : 6;
  // Blade body
  ctx.fillStyle = inBurst || isJindan ? '#fef08a' : '#d1fae5';
  ctx.strokeStyle = inBurst || isJindan ? '#d97706' : '#2e6f5e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-10, -2.5);
  ctx.lineTo(18, -2);
  ctx.lineTo(25, 0);
  ctx.lineTo(18, 2);
  ctx.lineTo(-10, 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden crossguard & crimson pommel
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#c6993d';
  ctx.fillRect(-12, -6.5, 3, 13);
  ctx.fillStyle = '#2d2a25';
  ctx.fillRect(-19, -1.8, 7, 3.6);
  ctx.fillStyle = '#c4453a';
  ctx.beginPath();
  ctx.arc(-20, 0, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

export function drawDetailedMonster(
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
  const recoil = hitFlash > 0 ? Math.sin(hitFlash * 38) * 8 * scale : 0;
  const bob = Math.sin(t * 3.1 + 1) * 4 * scale;
  const breathX = 1 + Math.sin(t * 3.1) * 0.035;
  const breathY = 1 - Math.sin(t * 3.1) * 0.035;

  ctx.translate(x + recoil, y + bob);
  const s = scale * (isBoss ? 1.24 : 1);
  ctx.scale(s * breathX, s * breathY);

  // Boss Crimson-Ink Menacing Aura
  if (isBoss) {
    const aura = ctx.createRadialGradient(0, -2, 6, 0, -2, 50);
    aura.addColorStop(0, 'rgba(185, 28, 28, 0.36)');
    aura.addColorStop(0.6, 'rgba(28, 25, 23, 0.18)');
    aura.addColorStop(1, 'rgba(185, 28, 28, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -2, 50, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ink Wash Ground Shadow
  ctx.fillStyle = 'rgba(28, 27, 24, 0.24)';
  ctx.beginPath();
  ctx.ellipse(0, 30, 26, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const flash = hitFlash > 0;
  const inkDark = flash ? '#ffffff' : '#1d1a17';
  const inkMid = flash ? '#fef3c7' : '#35302a';
  const eyeCol = flash ? '#facc15' : kind === 'ghost' ? '#5eead4' : '#ef4444';

  if (kind === 'serpent') {
    // Undulating Multi-Segment Jade-Ink Flood Dragon / Serpent (玄蛟)
    const wave = Math.sin(t * 4.5) * 6;
    ctx.strokeStyle = flash ? '#ffffff' : '#1c3b32';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(26, 22);
    ctx.bezierCurveTo(18, -10 + wave, -6, 22 - wave, -16, -10 + wave * 0.5);
    ctx.stroke();

    // Inner jade belly highlight
    ctx.strokeStyle = flash ? '#fef08a' : '#3d8b76';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Fierce Dragon/Serpent Head facing left
    ctx.fillStyle = flash ? '#ffffff' : '#163028';
    ctx.beginPath();
    ctx.ellipse(-18, -12 + wave * 0.5, 13, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Horns & Whiskers
    ctx.strokeStyle = '#c6993d';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-12, -19 + wave * 0.5);
    ctx.lineTo(-4, -30 + wave * 0.5);
    ctx.stroke();

    // Flickering crimson tongue
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-30, -10 + wave * 0.5);
    ctx.lineTo(-39, -12 + wave * 0.5);
    ctx.moveTo(-36, -11 + wave * 0.5);
    ctx.lineTo(-41, -7 + wave * 0.5);
    ctx.stroke();

    // Glowing Eye
    ctx.fillStyle = eyeCol;
    ctx.beginPath();
    ctx.arc(-21, -14 + wave * 0.5, 2.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'wolf') {
    // Ferocious Crimson-Eyed Demon Wolf (赤目妖狼) facing left
    // Bushy wagging tail
    ctx.strokeStyle = inkDark;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(16, 6);
    ctx.quadraticCurveTo(32, -8 + Math.sin(t * 7) * 6, 26, -20);
    ctx.stroke();

    // Muscular prowling body
    ctx.fillStyle = inkMid;
    ctx.beginPath();
    ctx.ellipse(2, 8, 22, 13, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Four legs
    ctx.strokeStyle = inkDark;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(-12, 14);
    ctx.lineTo(-18, 28);
    ctx.moveTo(14, 14);
    ctx.lineTo(20, 28);
    ctx.stroke();

    // Spiky ink mane & Wolf Head
    ctx.fillStyle = inkDark;
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(-28, -4);
    ctx.lineTo(-24, 6);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();
    // Pointed Ears
    ctx.beginPath();
    ctx.moveTo(-14, -12);
    ctx.lineTo(-10, -25);
    ctx.lineTo(-4, -10);
    ctx.fill();

    // Crimson Eye & White Fang
    ctx.fillStyle = eyeCol;
    ctx.beginPath();
    ctx.arc(-18, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-25, 2);
    ctx.lineTo(-23, 7);
    ctx.lineTo(-20, 2);
    ctx.fill();
  } else if (kind === 'ghost') {
    // Floating Ethereal Sword Spirit / Ghost (寒潭幽魂/剑灵)
    const gGrad = ctx.createLinearGradient(0, -28, 0, 28);
    gGrad.addColorStop(0, flash ? '#ffffff' : '#1e293b');
    gGrad.addColorStop(1, 'rgba(30, 41, 59, 0.25)');
    ctx.fillStyle = gGrad;
    ctx.beginPath();
    ctx.moveTo(-18, 26);
    ctx.quadraticCurveTo(-20, -20, 0, -28);
    ctx.quadraticCurveTo(20, -20, 18, 26);
    ctx.lineTo(9, 17 + Math.sin(t * 5) * 3);
    ctx.lineTo(0, 27);
    ctx.lineTo(-9, 17 + Math.cos(t * 5) * 3);
    ctx.closePath();
    ctx.fill();

    // Orbiting Cyan Soul-Flames
    for (let i = 0; i < 2; i++) {
      const fx = Math.cos(t * 3 + i * Math.PI) * 26;
      const fy = -6 + Math.sin(t * 4 + i) * 10;
      ctx.fillStyle = 'rgba(94, 234, 212, 0.85)';
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Ghost Eyes
    ctx.fillStyle = eyeCol;
    ctx.beginPath();
    ctx.arc(-6, -10, 3.2, 0, Math.PI * 2);
    ctx.arc(5, -10, 3.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'golem') {
    // Towering Ancient Guardian / Great Ape (白猿大圣 / 傀儡)
    ctx.fillStyle = inkMid;
    ctx.strokeStyle = inkDark;
    ctx.lineWidth = 2;
    // Broad Armored Torso
    ctx.beginPath();
    ctx.roundRect(-20, -14, 40, 36, 9);
    ctx.fill();
    ctx.stroke();

    // Floating Rune Pauldrons & Heavy Fists
    ctx.fillStyle = inkDark;
    ctx.beginPath();
    ctx.arc(-25, -4 + Math.sin(t * 4) * 3, 9, 0, Math.PI * 2);
    ctx.arc(25, -4 - Math.sin(t * 4) * 3, 9, 0, Math.PI * 2);
    ctx.fill();

    // Head & Golden Crown/Visor
    ctx.fillStyle = inkDark;
    ctx.beginPath();
    ctx.roundRect(-12, -30, 24, 18, 6);
    ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-8, -23, 16, 4.5);

    // Chest Golden Rune Core
    ctx.strokeStyle = '#c6993d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 4, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'demon') {
    // Majestic Horned Demon Overlord (血煞天魔 / 剑尊残魂)
    // Billowing Dark Ink Cape
    ctx.fillStyle = flash ? '#ffffff' : '#181113';
    ctx.beginPath();
    ctx.moveTo(-26, 28);
    ctx.quadraticCurveTo(-24, -18, 0, -26);
    ctx.quadraticCurveTo(24, -18, 28, 28);
    ctx.quadraticCurveTo(0, 22, -26, 28);
    ctx.closePath();
    ctx.fill();

    // Sweeping Crimson-Gold Demon Horns
    ctx.strokeStyle = flash ? '#ffffff' : '#b91c1c';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, -22);
    ctx.quadraticCurveTo(-28, -40, -12, -42);
    ctx.moveTo(10, -22);
    ctx.quadraticCurveTo(28, -40, 12, -42);
    ctx.stroke();

    // Glowing Crimson Eyes & Chest Seal
    ctx.fillStyle = eyeCol;
    ctx.beginPath();
    ctx.arc(-7, -10, 3.5, 0, Math.PI * 2);
    ctx.arc(7, -10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 6);
    ctx.lineTo(0, 14);
    ctx.lineTo(10, 6);
    ctx.stroke();
  } else {
    // Mischievous Mountain Imp (山魈妖童)
    ctx.fillStyle = inkMid;
    ctx.beginPath();
    ctx.ellipse(0, 6, 17, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pointy Imp Ears & Little Horns
    ctx.fillStyle = inkDark;
    ctx.beginPath();
    ctx.moveTo(-14, -8);
    ctx.lineTo(-24, -22);
    ctx.lineTo(-5, -14);
    ctx.moveTo(14, -8);
    ctx.lineTo(24, -22);
    ctx.lineTo(5, -14);
    ctx.fill();
    // Crimson Eyes & Grin
    ctx.fillStyle = eyeCol;
    ctx.beginPath();
    ctx.arc(-6, -2, 3, 0, Math.PI * 2);
    ctx.arc(5, -2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f5f0e6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 6, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawDetailedPet(
  ctx: CanvasRenderingContext2D,
  petId: PetId,
  x: number,
  y: number,
  t: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 3.8 + 1.2) * 5 * scale);
  ctx.scale(scale * 0.68, scale * 0.68);

  if (petId === 'fox') {
    // Fluffy Nine-Tailed Spirit Fox
    for (let i = -1; i <= 1; i++) {
      ctx.fillStyle = '#f8f3ea';
      ctx.strokeStyle = '#c4453a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(-14, -4 + i * 7 + Math.sin(t * 5 + i) * 2, 11, 5, -0.3 + i * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#fbf8f1';
    ctx.strokeStyle = '#2d2a25';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c4453a';
    ctx.beginPath();
    ctx.arc(4, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (petId === 'turtle') {
    ctx.fillStyle = '#2e6f5e';
    ctx.strokeStyle = '#1c1b18';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 4, 15, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-7, 2);
    ctx.lineTo(0, -7);
    ctx.lineTo(7, 2);
    ctx.stroke();
  } else if (petId === 'crane') {
    ctx.fillStyle = '#fbf8f1';
    ctx.strokeStyle = '#2d2a25';
    ctx.lineWidth = 2;
    const flap = Math.sin(t * 7) * 8;
    ctx.beginPath();
    ctx.moveTo(-18, -4 + flap);
    ctx.quadraticCurveTo(0, -15, 18, -4 + flap);
    ctx.quadraticCurveTo(0, 6, -18, -4 + flap);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c4453a';
    ctx.beginPath();
    ctx.arc(10, -8, 2.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Golden Primordial Dragon
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, 6 + Math.sin(t * 6) * 5);
    ctx.quadraticCurveTo(-4, -12, 6, 4);
    ctx.quadraticCurveTo(15, -11, 22, -4);
    ctx.stroke();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();
}

// Imposing Multi-Layered Chinese Ink-Wash Guardian Boss Painter
// Features rotating dark-gold Dharma halos, orbiting demon swords, dragon pearls, and divine staffs!
export function drawDetailedBoss(
  ctx: CanvasRenderingContext2D,
  kind: MonsterDef['kind'],
  x: number,
  y: number,
  t: number,
  scale: number,
  hitFlash: number
) {
  ctx.save();
  const recoil = hitFlash > 0 ? Math.sin(hitFlash * 36) * 9 * scale : 0;
  const hover = Math.sin(t * 2.2) * 5 * scale;
  ctx.translate(x + recoil, y + hover);
  const s = scale * 1.18;
  ctx.scale(s, s);

  const flash = hitFlash > 0;

  // 1. Massive Rotating Dark-Crimson & Gold Boss Dharma Halo behind boss
  ctx.save();
  ctx.translate(0, -10);
  const bgAura = ctx.createRadialGradient(0, 0, 8, 0, 0, 62);
  bgAura.addColorStop(0, 'rgba(185, 28, 28, 0.34)');
  bgAura.addColorStop(0.55, 'rgba(28, 25, 23, 0.22)');
  bgAura.addColorStop(1, 'rgba(28, 25, 23, 0)');
  ctx.fillStyle = bgAura;
  ctx.beginPath();
  ctx.arc(0, 0, 62, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(-t * 0.65);
  ctx.strokeStyle = flash ? '#ffffff' : 'rgba(217, 119, 6, 0.72)';
  ctx.lineWidth = 2.2;
  ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.stroke();

  // 6 Floating Rune Orbs around Boss Halo
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6;
    ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 44, Math.sin(a) * 44, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Ground shadow
  ctx.fillStyle = 'rgba(20, 16, 16, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 34, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (kind === 'golem') {
    // 【妖王】白猿大圣 / 巨灵战神 — White-furred Great Ape Sovereign with Golden Headband & Iron Staff!
    // Billowing Crimson Battle Scarf
    ctx.strokeStyle = flash ? '#ffffff' : '#b91c1c';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(8, -16);
    ctx.bezierCurveTo(28, -28 + Math.sin(t * 5) * 8, 42, -4 + Math.cos(t * 4) * 9, 52, -16);
    ctx.stroke();

    // Giant Iron-Gold Divine Staff (定海铁棒) diagonal behind/front
    ctx.save();
    ctx.rotate(-0.42 + Math.sin(t * 3) * 0.06);
    ctx.fillStyle = flash ? '#ffffff' : '#1c1917';
    ctx.fillRect(-42, -3.5, 84, 7);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-42, -4.5, 11, 9);
    ctx.fillRect(31, -4.5, 11, 9);
    ctx.restore();

    // Muscular White-Ink Ape Body & Armored Chest
    const bodyG = ctx.createLinearGradient(0, -24, 0, 30);
    bodyG.addColorStop(0, flash ? '#ffffff' : '#f5f0e6');
    bodyG.addColorStop(1, flash ? '#fef3c7' : '#a8a29e');
    ctx.fillStyle = bodyG;
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-24, 28);
    ctx.quadraticCurveTo(-28, -8, -14, -18);
    ctx.lineTo(14, -18);
    ctx.quadraticCurveTo(28, -8, 24, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden Battle Armor Belt & Shoulder Plates
    ctx.fillStyle = '#292524';
    ctx.fillRect(-20, 8, 40, 10);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(0, 13, 6, 0, Math.PI * 2);
    ctx.fill();

    // Fierce Ape Head + Golden Crown Fillet
    ctx.fillStyle = flash ? '#ffffff' : '#f5f0e6';
    ctx.beginPath();
    ctx.arc(0, -24, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, -27, 12, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Glowing Golden-Red Eyes
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-5, -24, 2.8, 0, Math.PI * 2);
    ctx.arc(4, -24, 2.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'serpent') {
    // 【妖王】寒潭玄蛟王 — Colossal Ink Flood Dragon with Orbiting Jade Pearl & Antlers!
    const wv = Math.sin(t * 3.8) * 7;
    // Misty Cloud Coils
    ctx.fillStyle = 'rgba(46, 111, 94, 0.22)';
    ctx.beginPath();
    ctx.ellipse(4, 20, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // S-curve Dragon Body
    ctx.strokeStyle = flash ? '#ffffff' : '#0f2922';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(36, 22);
    ctx.bezierCurveTo(26, -24 + wv, -4, 30 - wv, -20, -14 + wv * 0.5);
    ctx.stroke();

    // Golden-Jade Belly Scales
    ctx.strokeStyle = flash ? '#fef08a' : '#2dd4bf';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Dragon Head + Branching Antlers + Flowing Whiskers
    const hx = -22;
    const hy = -16 + wv * 0.5;
    ctx.fillStyle = flash ? '#ffffff' : '#13382e';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(hx, hy, 16, 11, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Antlers
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hx + 4, hy - 8);
    ctx.lineTo(hx + 16, hy - 26);
    ctx.moveTo(hx + 10, hy - 17);
    ctx.lineTo(hx + 22, hy - 19);
    ctx.stroke();

    // Orbiting Glowing Dragon Pearl in front of snout
    const px = hx - 20 + Math.cos(t * 4) * 3;
    const py = hy + 6 + Math.sin(t * 4) * 4;
    const pg = ctx.createRadialGradient(px, py, 1, px, py, 12);
    pg.addColorStop(0, '#ffffff');
    pg.addColorStop(0.5, '#5eead4');
    pg.addColorStop(1, 'rgba(94, 234, 212, 0)');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(hx - 4, hy - 3, 3.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 【妖王/魔皇/天尊】太虚剑尊残魂 / 九幽血魔皇 / 太初魔帝 — Winged Horned Sovereign with 4 Orbiting Crimson Blades!
    // 4 Orbiting Demon Swords fanning behind back
    for (let i = 0; i < 4; i++) {
      const ang = -1.1 + i * 0.72 + Math.sin(t * 2.5 + i) * 0.08;
      ctx.save();
      ctx.translate(0, -10);
      ctx.rotate(ang);
      ctx.fillStyle = flash ? '#ffffff' : '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-2, -24);
      ctx.lineTo(0, -54);
      ctx.lineTo(2, -24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-5, -26, 10, 2.5);
      ctx.restore();
    }

    // Sweeping Sovereign Robes & Ink Wings
    const robeG = ctx.createLinearGradient(0, -28, 0, 32);
    robeG.addColorStop(0, flash ? '#ffffff' : '#2a1215');
    robeG.addColorStop(1, flash ? '#fef3c7' : '#0f0d0d');
    ctx.fillStyle = robeG;
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-30, 30);
    ctx.quadraticCurveTo(-26, -14, -12, -22);
    ctx.lineTo(12, -22);
    ctx.quadraticCurveTo(26, -14, 30, 30);
    ctx.quadraticCurveTo(0, 23, -30, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ornate Gold Sovereign Chest Plate
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-12, -16);
    ctx.lineTo(0, 8);
    ctx.lineTo(12, -16);
    ctx.stroke();

    // Crowned Demon Head & Curved Crimson-Gold Horns
    ctx.fillStyle = flash ? '#ffffff' : '#1a1214';
    ctx.beginPath();
    ctx.arc(0, -26, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-9, -32);
    ctx.quadraticCurveTo(-28, -48, -12, -52);
    ctx.moveTo(9, -32);
    ctx.quadraticCurveTo(28, -48, 12, -52);
    ctx.stroke();

    // Glowing Crimson Sovereign Eyes
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-5, -26, 3, 0, Math.PI * 2);
    ctx.arc(5, -26, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
