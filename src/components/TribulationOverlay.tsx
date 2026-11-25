import React, { useEffect, useRef, useState } from 'react';
import { PETS, REALMS } from '../game/data';
import { locPet, locRealm } from '../game/i18n';
import { useGameStore } from '../game/store';
import { PetId } from '../game/types';

interface Props {
  active: boolean;
  result: 'none' | 'success' | 'fail';
  targetRealmId: number;
  activePet: PetId | null;
  onClose: () => void;
}

export const TribulationOverlay: React.FC<Props> = ({
  active,
  result,
  targetRealmId,
  activePet,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);

  const realm = REALMS[targetRealmId] ?? REALMS[0];
  const petName = activePet ? PETS.find((p) => p.id === activePet)?.name : null;

  useEffect(() => {
    if (!active) {
      setPhase(1);
      return;
    }
    setPhase(1);
    const t1 = setTimeout(() => setPhase(2), 800);
    const t2 = setTimeout(() => setPhase(3), 1650);
    const t3 = setTimeout(() => setPhase(4), 2350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = performance.now();
    const motes = Array.from({ length: 65 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 90 + Math.random() * 240,
      speed: 1.2 + Math.random() * 2.2,
      size: 2 + Math.random() * 3,
    }));

    let rafId = 0;
    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      const cx = w / 2;
      const cy = h / 2;
      ctx.save();
      ctx.scale(dpr, dpr);

      // Dark dramatic backdrop
      ctx.fillStyle = elapsed < 1.7 ? 'rgba(18, 17, 15, 0.82)' : 'rgba(24, 22, 18, 0.72)';
      ctx.fillRect(0, 0, w, h);

      // Phase 1 & 2: Swirling Qi Vortex converging toward center
      const converge = Math.min(1, elapsed / 1.5);
      motes.forEach((m) => {
        const curDist = Math.max(12, m.dist * (1 - converge * 0.85));
        const ang = m.angle + elapsed * m.speed * (1 + converge * 2);
        const x = cx + Math.cos(ang) * curDist;
        const y = cy + Math.sin(ang) * curDist * 0.72;
        ctx.fillStyle = targetRealmId >= 5 ? 'rgba(250, 204, 21, 0.85)' : 'rgba(94, 234, 212, 0.85)';
        ctx.beginPath();
        ctx.arc(x, y, m.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Rotating Ground Formation Ring
      ctx.save();
      ctx.translate(cx, cy + 48);
      ctx.scale(1, 0.32);
      ctx.rotate(elapsed * 1.4);
      ctx.strokeStyle = result === 'fail' && elapsed > 1.7 ? '#a855f7' : '#eab308';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 80 + Math.min(90, elapsed * 45), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Phase 2: Realm-specific Phenomenon!
      if (elapsed >= 0.75) {
        if (targetRealmId >= 12) {
          // Nine-Heavens Tribulation Lightning
          for (let b = 0; b < 3; b++) {
            if (Math.sin(elapsed * 18 + b) > 0.2) {
              ctx.strokeStyle = '#fde047';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(cx + (b - 1) * 70, 0);
              ctx.lineTo(cx + (b - 1) * 35 - 15, cy * 0.5);
              ctx.lineTo(cx + (b - 1) * 20 + 15, cy * 0.75);
              ctx.lineTo(cx, cy);
              ctx.stroke();
            }
          }
        } else if (targetRealmId >= 5) {
          // Golden Core / Nascent Soul radiant orb
          const r = 24 + Math.sin(elapsed * 8) * 6;
          const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, r * 2.4);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, 'rgba(250, 204, 21, 0.9)');
          grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Zhuji Blooming Jade Spirit Lotus
          ctx.save();
          ctx.translate(cx, cy + 30);
          for (let p = 0; p < 8; p++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 * p) / 8 + elapsed * 0.6);
            ctx.fillStyle = 'rgba(52, 211, 153, 0.45)';
            ctx.beginPath();
            ctx.ellipse(26, 0, 22, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.restore();
        }
      }

      // Phase 3: Sky-Piercing Golden Light Pillar!
      if (elapsed >= 1.65 && result === 'success') {
        const beamP = Math.min(1, (elapsed - 1.65) / 0.4);
        const bw = 95 * beamP + Math.sin(elapsed * 12) * 8;
        const bGrad = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
        bGrad.addColorStop(0, 'rgba(250, 204, 21, 0)');
        bGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.78)');
        bGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = bGrad;
        ctx.fillRect(cx - bw, 0, bw * 2, h);
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [active, result, targetRealmId]);

  if (!active) return null;

  const locale = useGameStore.getState().locale ?? 'zh';
  const realmLoc = locRealm(realm, locale);
  const petDef = activePet ? PETS.find((p) => p.id === activePet) : null;
  const petDisplayName = petDef ? locPet(petDef, locale).name : null;

  const phaseText =
    locale === 'zh'
      ? phase === 1
        ? '第一重 · 灵气汇聚'
        : phase === 2
          ? targetRealmId >= 7
            ? '第二重 · 元婴法相显化'
            : targetRealmId >= 5
              ? '第二重 · 金丹大道凝成'
              : '第二重 · 灵莲护体蜕变'
          : result === 'success'
            ? '第三重 · 金光冲霄破境！'
            : '天雷淬体 · 护体灵气震散'
      : phase === 1
        ? 'Stage I · Gathering Heaven Qi'
        : phase === 2
          ? targetRealmId >= 7
            ? 'Stage II · Nascent Soul Manifests'
            : targetRealmId >= 5
              ? 'Stage II · Golden Core Condensing'
              : 'Stage II · Spirit Lotus Shield'
          : result === 'success'
            ? 'Stage III · Ascension Breakthrough!'
            : 'Tribulation Thunder · Qi Shaken';

  return (
    <div className="absolute inset-0 z-50 rounded-2xl overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {phase < 4 ? (
        <div className="relative z-20 text-center space-y-2 pointer-events-none">
          <div className="px-6 py-2 rounded-full bg-ink-900/80 border border-gold-500/70 text-gold-100 font-serif font-bold text-lg tracking-wider shadow-2xl">
            {phaseText}
          </div>
          {petDisplayName && (
            <div className="text-xs text-paper-200 font-serif">
              {locale === 'zh'
                ? `✦ 随行灵宠【${petDisplayName}】正于一旁撑起结界为你护法 ✦`
                : `✦ Spirit Pet [${petDisplayName}] raises a protective barrier beside you ✦`}
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-20 w-96 rounded-2xl bg-paper-50/95 border-2 border-gold-500 p-6 shadow-2xl text-center">
          <div className="text-xs font-serif font-bold tracking-widest text-gold-600">
            {result === 'success'
              ? locale === 'zh'
                ? '✦ 破境成功 · 仙途新章 ✦'
                : '✦ Breakthrough Succeeded ✦'
              : locale === 'zh'
                ? '⚡ 渡劫受阻 · 道心愈坚 ⚡'
                : '⚡ Tribulation Resisted · Dao Heart Hardened ⚡'}
          </div>
          <h3 className="mt-2 font-serif font-bold text-3xl text-ink-900 tracking-wider">
            {result === 'success' ? realmLoc.name : locale === 'zh' ? '心境感悟 +8%' : 'Insight Bonus +8%'}
          </h3>
          {result === 'success' ? (
            <div className="mt-3 space-y-1.5 text-xs text-ink-700 font-serif">
              <p>
                {locale === 'zh'
                  ? '周天经脉蜕变，气血全满、御剑攻伐与吐纳效率大幅跃升！'
                  : 'Your meridians are reborn — HP restored, Sword ATK and Qi Rate greatly increased!'}
              </p>
              {realm.unlockNote && (
                <div className="mt-2 p-2.5 rounded-xl bg-gold-100/90 border border-gold-500/60 text-cinnabar-600 font-bold">
                  {locale === 'zh' ? `新境界解锁：${realm.unlockNote}` : 'New Realm Features Unlocked!'}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-xs text-ink-700 font-serif">
              <p>
                {locale === 'zh'
                  ? '护体灵气虽被天雷震散少许，但下次渡劫成功率已永久提升 +8%。'
                  : 'Though thunder dispersed some Qi, your next breakthrough rate permanently increased by +8%.'}
              </p>
              {petDisplayName && (
                <div className="p-2 rounded-xl bg-paper-100 border border-paper-300 text-jade-600">
                  {locale === 'zh'
                    ? `【${petDisplayName}】轻蹭着你的衣袖安慰道：“主人别灰心，再备颗破境丹一定能过！”`
                    : `[${petDisplayName}] nudges your sleeve: "Don't lose heart, Master — bring a Breakthrough Pill next time!"`}
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-paper-50 font-serif font-bold text-sm tracking-widest shadow-md transition"
          >
            {locale === 'zh' ? '收功出关' : 'Complete Seclusion'}
          </button>
        </div>
      )}
    </div>
  );
};
