import React, { useEffect, useRef, useState } from 'react';
import { Moon, Sparkles, Sun, Sunrise, Sunset } from 'lucide-react';
import { BUILDINGS, evaluateCaveGrid } from '../game/data';
import { locBuilding, locSynergyTitle, t } from '../game/i18n';
import { useGameStore } from '../game/store';
import { BuildingId } from '../game/types';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

const cavePetCache: Record<string, HTMLImageElement> = {};
function getCavePetImg(petId: string): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  if (!cavePetCache[petId]) {
    const img = new Image();
    img.src = `./portraits/pet_${petId}.jpg`;
    cavePetCache[petId] = img;
  }
  const img = cavePetCache[petId];
  return img.complete && img.naturalWidth > 0 ? img : null;
}

interface Props {
  onNotify: (msg: string) => void;
}

const SKY_PALETTES: Record<TimeOfDay, { top: string; bottom: string; tileTop: string; tileSide: string; text: string }> = {
  dawn: { top: '#f7e5dc', bottom: '#f3ede2', tileTop: '#efe7d6', tileSide: '#cbbca4', text: '#2d2a25' },
  day: { top: '#eef3ee', bottom: '#f5efe3', tileTop: '#f5efe2', tileSide: '#cfc2ac', text: '#1c1b18' },
  dusk: { top: '#e7c6b3', bottom: '#f2dec5', tileTop: '#f0e2ce', tileSide: '#bfa78d', text: '#2d2a25' },
  night: { top: '#182130', bottom: '#283649', tileTop: '#334155', tileSide: '#1e293b', text: '#f5f0e6' },
};

function drawIsoTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tw: number,
  th: number,
  topFill: string,
  sideFill: string,
  stroke: string,
  selected: boolean
) {
  const depth = 9;
  // Left & Right 2.5D cliff sides
  ctx.fillStyle = sideFill;
  ctx.beginPath();
  ctx.moveTo(x - tw, y);
  ctx.lineTo(x, y + th);
  ctx.lineTo(x, y + th + depth);
  ctx.lineTo(x - tw, y + depth);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + tw, y);
  ctx.lineTo(x, y + th);
  ctx.lineTo(x, y + th + depth);
  ctx.lineTo(x + tw, y + depth);
  ctx.closePath();
  ctx.fill();

  // Top diamond
  ctx.fillStyle = selected ? '#fef08a' : topFill;
  ctx.strokeStyle = selected ? '#c4453a' : stroke;
  ctx.lineWidth = selected ? 2.2 : 1;
  ctx.beginPath();
  ctx.moveTo(x, y - th);
  ctx.lineTo(x + tw, y);
  ctx.lineTo(x, y + th);
  ctx.lineTo(x - tw, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawIsoBuilding(
  ctx: CanvasRenderingContext2D,
  id: BuildingId,
  x: number,
  y: number,
  t: number,
  isNight: boolean
) {
  ctx.save();
  ctx.translate(x, y - 4);

  if (id === 'spirit_array') {
    // Glowing rotating jade runes on ground
    ctx.save();
    ctx.scale(1, 0.5);
    ctx.rotate(t * 1.1);
    ctx.strokeStyle = isNight ? '#5eead4' : '#2e6f5e';
    ctx.lineWidth = 2.4;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // Rising central qi crystal
    ctx.fillStyle = '#3d8b76';
    ctx.beginPath();
    ctx.moveTo(0, -24 + Math.sin(t * 3) * 3);
    ctx.lineTo(7, -10);
    ctx.lineTo(0, -4);
    ctx.lineTo(-7, -10);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'herb_field') {
    // Growing jade sprouts
    for (let i = -1; i <= 1; i++) {
      const sway = Math.sin(t * 2.5 + i) * 2.5;
      ctx.strokeStyle = '#2e6f5e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(i * 11, 2);
      ctx.quadraticCurveTo(i * 11 + sway, -9, i * 11 + sway * 1.5, -14);
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(i * 11 + sway * 1.5, -14, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'spring_pool') {
    // Shimmering hot spring + rising steam
    ctx.fillStyle = isNight ? '#38bdf8' : '#7dd3fc';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 + (t * 8) % 9, 5 + ((t * 8) % 9) * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Classical Chinese Pavilion / Hall (2.5D walls + upturned eaves roof)
    ctx.fillStyle = isNight ? '#475569' : '#f5f0e6';
    ctx.strokeStyle = '#2d2a25';
    ctx.lineWidth = 1.4;
    ctx.fillRect(-14, -18, 28, 18);
    ctx.strokeRect(-14, -18, 28, 18);

    // Warm glowing window at night
    ctx.fillStyle = isNight ? '#fbbf24' : '#787166';
    ctx.fillRect(-5, -12, 10, 8);
    if (isNight) {
      const glow = ctx.createRadialGradient(0, -8, 2, 0, -8, 24);
      glow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, -8, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Upturned Ink Pavilion Roof
    ctx.fillStyle = id === 'alchemy_room' || id === 'forge_hall' ? '#a9352b' : '#2d2a25';
    ctx.beginPath();
    ctx.moveTo(-21, -16);
    ctx.quadraticCurveTo(0, -34, 21, -16);
    ctx.lineTo(15, -18);
    ctx.lineTo(-15, -18);
    ctx.closePath();
    ctx.fill();

    // Rising smoke for Alchemy / Forge
    if (id === 'alchemy_room' || id === 'forge_hall') {
      const sy = -30 - ((t * 14) % 18);
      ctx.fillStyle = 'rgba(220, 215, 205, 0.55)';
      ctx.beginPath();
      ctx.arc(Math.sin(t * 2) * 4, sy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export const IsometricCaveCanvas: React.FC<Props> = ({ onNotify }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const caveGrid = useGameStore((s) => s.caveGrid);
  const stones = useGameStore((s) => s.stones);
  const locale = useGameStore((s) => s.locale ?? 'zh');
  const buildInGrid = useGameStore((s) => s.buildInGrid);
  const swapGridCells = useGameStore((s) => s.swapGridCells);

  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [showSynergyGuide, setShowSynergyGuide] = useState(false);

  const SYNERGY_RECIPES =
    locale === 'zh'
      ? [
          { id: 'syn_herb', title: '灵气润田', pair: '聚灵阵 × 灵药田', effect: '灵草 +1、吐纳 +12%' },
          { id: 'syn_beast', title: '灵泉沐兽', pair: '灵泉池 × 灵兽园', effect: '灵宠加成 +30%、气血 +15%' },
          { id: 'syn_dao', title: '藏经悟道', pair: '藏经阁 × 悟道台', effect: '吐纳 +25%、神通冷却加快 20%' },
          { id: 'syn_alchemy', title: '现采现炼', pair: '炼丹房 × 灵药田', effect: '炼丹双倍产出几率 +35%' },
          { id: 'syn_forge', title: '灵火淬锋', pair: '炼器阁 × 聚灵阵', effect: '御剑攻击 +22%、会心 +6%' },
        ]
      : [
          { id: 'syn_herb', title: 'Spirit Harvest', pair: 'Spirit Array × Herb Garden', effect: 'Herb +1, Qi +12%' },
          { id: 'syn_beast', title: 'Spring Beasts', pair: 'Spirit Spring × Beast Yard', effect: 'Pet Bonus +30%, HP +15%' },
          { id: 'syn_dao', title: 'Dao Insight', pair: 'Scripture Hall × Dao Altar', effect: 'Qi +25%, Skill CD 20% faster' },
          { id: 'syn_alchemy', title: 'Fresh Brew', pair: 'Pill Room × Herb Garden', effect: 'Alchemy 2x Chance +35%' },
          { id: 'syn_forge', title: 'Spirit Forge', pair: 'Forge Hall × Spirit Array', effect: 'Sword ATK +22%, Crit +6%' },
        ];

  const { synergies } = evaluateCaveGrid(caveGrid);
  const unbuilt = BUILDINGS.filter((b) => !caveGrid.includes(b.id));

  // Store tile centers for crisp click hit-testing
  const tileCentersRef = useRef<{ x: number; y: number; tw: number; th: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fireflies = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));

    let rafId = 0;
    const render = (now: number) => {
      const t = now / 1000;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      const state = useGameStore.getState();
      const pal = SKY_PALETTES[timeOfDay];
      const isNight = timeOfDay === 'night';

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Sky Background
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, pal.top);
      sky.addColorStop(1, pal.bottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Moon or Sun
      ctx.fillStyle = isNight ? 'rgba(254, 249, 195, 0.85)' : 'rgba(255, 250, 235, 0.7)';
      ctx.beginPath();
      ctx.arc(w - 58, 36, isNight ? 14 : 18, 0, Math.PI * 2);
      ctx.fill();

      // Distant drifting clouds
      ctx.fillStyle = isNight ? 'rgba(148, 163, 184, 0.14)' : 'rgba(255, 255, 255, 0.45)';
      for (let c = 0; c < 3; c++) {
        const cx = ((t * (10 + c * 4) + c * 180) % (w + 120)) - 60;
        const cy = 26 + c * 22;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 42, 11, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. 2.5D Isometric 3x3 Floating Sanctuary
      const originX = w * 0.5;
      const originY = h * 0.34;
      const tw = Math.min(54, w * 0.11);
      const th = tw * 0.52;

      const centers: { x: number; y: number; tw: number; th: number }[] = [];
      for (let i = 0; i < 9; i++) {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const tx = originX + (c - r) * (tw + 3);
        const ty = originY + (c + r) * (th + 3);
        centers.push({ x: tx, y: ty, tw, th });
      }
      tileCentersRef.current = centers;

      // Floating island base shadow
      ctx.fillStyle = isNight ? 'rgba(15, 23, 42, 0.5)' : 'rgba(120, 113, 102, 0.22)';
      ctx.beginPath();
      ctx.ellipse(originX, originY + th * 4.7, tw * 3.1, th * 1.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw 9 Tiles in Painter's Order (back to front)
      for (let i = 0; i < 9; i++) {
        const { x, y } = centers[i];
        const bId = state.caveGrid[i];
        drawIsoTile(
          ctx,
          x,
          y,
          tw,
          th,
          pal.tileTop,
          pal.tileSide,
          isNight ? 'rgba(148,163,184,0.35)' : 'rgba(120,113,102,0.45)',
          selectedCell === i
        );
        if (bId) {
          drawIsoBuilding(ctx, bId, x, y, t, isNight);
          const def = BUILDINGS.find((b) => b.id === bId);
          if (def) {
            ctx.font = 'bold 10px "Songti SC", serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = pal.text;
            ctx.fillText(locBuilding(def, state.locale ?? 'zh').name, x, y + th * 0.72);
          }
        }
      }

      // 3. Living Wandering Cultivator & Spirit Pet inside the 2.5D Courtyard!
      const wanderX = originX + Math.sin(t * 0.55) * tw * 1.1;
      const wanderY = originY + th * 2 + Math.cos(t * 0.45) * th * 0.75;
      // Mini Cultivator
      ctx.save();
      ctx.translate(wanderX, wanderY);
      ctx.fillStyle = '#24211d';
      ctx.beginPath();
      ctx.ellipse(0, -4, 6, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5f0e6';
      ctx.beginPath();
      ctx.arc(0, -15, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Mini Companion Pet hopping nearby (using real AI Guofeng portrait!)
      if (state.activePet) {
        const petX = wanderX - 22 + Math.cos(t * 1.6) * 8;
        const petY = wanderY - 2 + Math.abs(Math.sin(t * 3.5)) * -6;
        const pImg = getCavePetImg(state.activePet);
        if (pImg) {
          const r = 12;
          ctx.save();
          ctx.beginPath();
          ctx.arc(petX, petY, r, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(pImg, petX - r, petY - r, r * 2, r * 2);
          ctx.restore();
          ctx.strokeStyle = '#c6993d';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(petX, petY, r, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = state.activePet === 'dragon' ? '#f59e0b' : state.activePet === 'turtle' ? '#2e6f5e' : '#f5f0e6';
          ctx.strokeStyle = '#c4453a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(petX, petY - 4, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      // 4. Fireflies at Night / Floating Petals at Day
      fireflies.forEach((f) => {
        const fx = ((f.x + Math.sin(t * 0.5 + f.phase) * 0.04 + 1) % 1) * w;
        const fy = ((f.y + Math.cos(t * 0.6 + f.phase) * 0.04 + 1) % 1) * h;
        const a = 0.35 + Math.sin(t * 3 + f.phase) * 0.35;
        ctx.fillStyle = isNight ? `rgba(253, 224, 71, ${a})` : `rgba(196, 69, 58, ${a * 0.55})`;
        ctx.beginPath();
        ctx.arc(fx, fy, isNight ? 2.4 : 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [selectedCell, timeOfDay]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let hitIdx = -1;
    let bestDist = Infinity;
    tileCentersRef.current.forEach((tc, idx) => {
      const dx = Math.abs(mx - tc.x) / tc.tw;
      const dy = Math.abs(my - tc.y) / tc.th;
      if (dx + dy <= 1.05) {
        const d = dx + dy;
        if (d < bestDist) {
          bestDist = d;
          hitIdx = idx;
        }
      }
    });

    if (hitIdx === -1) return;
    if (selectedCell === null) {
      setSelectedCell(hitIdx);
    } else if (selectedCell === hitIdx) {
      setSelectedCell(null);
    } else {
      swapGridCells(selectedCell, hitIdx);
      setSelectedCell(null);
      onNotify('已调整 2.5D 仙山洞府风水布局！');
    }
  };

  return (
    <div className="p-3 rounded-xl bg-paper-100/90 border border-paper-300/90 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-serif font-bold text-sm text-ink-900">{t(locale, 'caveTitle')}</h3>
          <div className="flex items-center gap-2 text-[10px] text-ink-500">
            <span>{t(locale, 'caveSynergyCount', { n: synergies.length })}</span>
            <button
              type="button"
              onClick={() => setShowSynergyGuide((v) => !v)}
              className="text-jade-600 hover:underline font-medium whitespace-nowrap"
            >
              {showSynergyGuide ? t(locale, 'hideSynergies') : t(locale, 'showSynergies')}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-paper-200/80 p-0.5 rounded-lg border border-paper-300/70">
          {[
            { k: 'dawn' as TimeOfDay, icon: Sunrise, title: '晨曦' },
            { k: 'day' as TimeOfDay, icon: Sun, title: '白昼' },
            { k: 'dusk' as TimeOfDay, icon: Sunset, title: '黄昏' },
            { k: 'night' as TimeOfDay, icon: Moon, title: '月夜赏灯' },
          ].map(({ k, icon: Icon, title }) => (
            <button
              key={k}
              type="button"
              title={title}
              onClick={() => setTimeOfDay(k)}
              className={`p-1 rounded-md transition ${
                timeOfDay === k ? 'bg-ink-900 text-gold-100 shadow-xs' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Live 60fps 2.5D Isometric Canvas */}
      <div className="w-full h-52 rounded-xl overflow-hidden border border-paper-300 shadow-inner relative">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-pointer"
        />
        {synergies.length > 0 && (
          <div className="pointer-events-none absolute left-2 bottom-2 flex flex-wrap gap-1 max-w-[95%]">
            {synergies.map((syn) => (
              <span
                key={syn.id}
                className="px-2 py-0.5 rounded-full bg-ink-900/80 text-gold-100 border border-gold-500/60 text-[10px] font-serif flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-gold-500" />
                {locSynergyTitle(syn.id, syn.title, locale)}
              </span>
            ))}
          </div>
        )}
      </div>

      {showSynergyGuide && (
        <div className="p-2.5 rounded-xl bg-paper-50/90 border border-gold-500/40 grid grid-cols-2 gap-1.5 text-[10px]">
          {SYNERGY_RECIPES.map((rec) => {
            const active = synergies.some((s) => s.id === rec.id);
            return (
              <div
                key={rec.id}
                className={`px-2 py-1 rounded-lg border ${
                  active
                    ? 'bg-gold-100/80 border-gold-500/60 text-ink-900 font-medium'
                    : 'bg-paper-100/70 border-paper-300/60 text-ink-600'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-serif font-bold">{rec.title}（{rec.pair}）</span>
                  {active && <span className="text-jade-600 font-bold shrink-0">✓</span>}
                </div>
                <div className="text-[10px] text-ink-500">{rec.effect}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unbuilt Construction Bar (3 columns, full readable description) */}
      {unbuilt.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {unbuilt.map((b) => {
            const canAfford = stones >= b.cost;
            const bLoc = locBuilding(b, locale);
            return (
              <button
                key={b.id}
                type="button"
                disabled={!canAfford}
                onClick={() => {
                  const target =
                    selectedCell !== null && !caveGrid[selectedCell]
                      ? selectedCell
                      : caveGrid.findIndex((c) => c === null);
                  if (target === -1) {
                    onNotify(locale === 'zh' ? '洞府 9 格已满！' : 'All 9 sanctuary tiles are full!');
                    return;
                  }
                  const res = buildInGrid(target, b.id);
                  setSelectedCell(null);
                  onNotify(res.msg);
                }}
                title={bLoc.desc}
                className={`p-2 rounded-lg border text-left transition ${
                  canAfford
                    ? 'bg-paper-50 border-paper-300 hover:border-jade-600'
                    : 'bg-paper-200/50 border-paper-300/50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px] font-serif font-bold text-ink-900">
                  <span className="whitespace-nowrap">
                    {b.emoji} {bLoc.name}
                  </span>
                  <span className="text-[10px] text-gold-600 whitespace-nowrap">{b.cost}{locale === 'zh' ? '石' : ''}</span>
                </div>
                <div className="mt-0.5 text-[10px] text-ink-600 leading-snug">{bLoc.desc}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
