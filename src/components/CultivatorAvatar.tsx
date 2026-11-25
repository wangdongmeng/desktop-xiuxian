import React from 'react';
import { useGameStore } from '../game/store';

interface Props {
  size?: 'sm' | 'lg';
  isReadyBreakthrough?: boolean;
  onClick?: () => void;
}

export const CultivatorAvatar: React.FC<Props> = ({
  size = 'lg',
  isReadyBreakthrough = false,
  onClick,
}) => {
  const realmId = useGameStore((s) => s.realmId);
  const dim = size === 'sm' ? 'w-16 h-16' : 'w-44 h-44';

  const isZhuji = realmId >= 3;
  const isJindan = realmId >= 5;
  const isYuanying = realmId >= 7;
  const isHuashen = realmId >= 8;
  const isImmortal = realmId >= 12;

  return (
    <button
      type="button"
      onClick={onClick}
      title="点击手动吐纳灵气"
      className={`relative ${dim} flex items-center justify-center cursor-pointer group focus:outline-none app-no-drag`}
    >
      {/* Huashen+ Towering Dharma Avatar Silhouette behind cultivator */}
      {isHuashen && size === 'lg' && (
        <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full opacity-35 animate-pulse pointer-events-none">
          <defs>
            <radialGradient id="dharmaGlow" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor={isImmortal ? '#fef08a' : '#f59e0b'} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="70" r="64" fill="url(#dharmaGlow)" />
          <path d="M40 135 Q45 55 80 35 Q115 55 120 135 Z" fill="#c6993d" opacity="0.35" />
          <circle cx="80" cy="36" r="18" fill="none" stroke="#eab308" strokeWidth="2.5" strokeDasharray="5 4" />
        </svg>
      )}

      {/* Rotating Bagua / Golden Core Runes */}
      <svg
        viewBox="0 0 160 160"
        className={`absolute inset-0 w-full h-full animate-spin-slow transition-opacity ${
          isReadyBreakthrough ? 'opacity-95' : isJindan ? 'opacity-75' : 'opacity-45 group-hover:opacity-75'
        }`}
      >
        <circle
          cx="80"
          cy="80"
          r="66"
          fill="none"
          stroke={isReadyBreakthrough ? '#a9352b' : isJindan ? '#c6993d' : '#2e6f5e'}
          strokeWidth={isJindan ? '2' : '1.2'}
          strokeDasharray={isJindan ? '10 6' : '6 6'}
        />
        <circle
          cx="80"
          cy="80"
          r="54"
          fill="none"
          stroke={isImmortal ? '#eab308' : isReadyBreakthrough ? '#c6993d' : '#787166'}
          strokeWidth="1"
          strokeDasharray="2 5"
        />
      </svg>

      {/* Main Ink Cultivator & Realm Visual Evolution */}
      <svg
        viewBox="0 0 140 140"
        className="relative z-10 w-[88%] h-[88%] animate-float-slow transition-transform active:scale-95"
      >
        {/* Zhuji+: Glowing Jade Spirit Lotus under feet */}
        {isZhuji ? (
          <g opacity="0.85">
            <ellipse cx="70" cy="116" rx="38" ry="10" fill={isJindan ? '#fde68a' : '#a7f3d0'} opacity="0.6" />
            <path d="M40 114 Q55 102 70 116 Q85 102 100 114 Q85 122 70 118 Q55 122 40 114 Z" fill={isJindan ? '#f59e0b' : '#2e6f5e'} opacity="0.65" />
          </g>
        ) : (
          <ellipse cx="70" cy="116" rx="34" ry="8" fill="#d8c9b0" opacity="0.55" />
        )}

        {/* Yuanying+: Mini glowing Nascent Soul floating on the left */}
        {isYuanying && (
          <g className="animate-float-slow" opacity="0.9">
            <circle cx="30" cy="52" r="9" fill="#fef08a" opacity="0.35" />
            <circle cx="30" cy="48" r="4.5" fill="#fde047" />
            <path d="M24 62 Q30 52 36 62 Z" fill="#facc15" />
          </g>
        )}

        {/* Hovering Flying Sword (upgrades to Golden/Immortal glow!) */}
        <g className="animate-sword" style={{ transformOrigin: '104px 58px' }}>
          <line
            x1="94"
            y1="74"
            x2="118"
            y2="30"
            stroke={isImmortal ? '#eab308' : isJindan ? '#c6993d' : '#2e6f5e'}
            strokeWidth={isJindan ? '4' : '3.2'}
            strokeLinecap="round"
          />
          <line x1="96" y1="70" x2="117" y2="32" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="91" y1="68" x2="103" y2="75" stroke="#a67c2e" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="92" cy="79" r="2.2" fill="#a9352b" />
        </g>

        {/* Cultivator Robe Body (evolves to gold-trimmed / celestial white-gold!) */}
        <path
          d="M42 108 C42 86, 52 74, 70 74 C88 74, 98 86, 98 108 C88 114, 52 114, 42 108 Z"
          fill={isImmortal ? '#f8f3ea' : '#2d2a25'}
          stroke={isJindan ? '#c6993d' : 'none'}
          strokeWidth={isJindan ? '2' : '0'}
        />
        <path d="M62 76 L70 92 L78 76 Z" fill={isImmortal ? '#fde68a' : '#f5f0e6'} />
        <path
          d="M51 98 Q70 103 89 98"
          fill="none"
          stroke={isJindan ? '#c6993d' : '#3d8b76'}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Head & Hair Bun */}
        <circle cx="70" cy="56" r="14" fill="#f5f0e6" stroke="#2d2a25" strokeWidth="2" />
        <path d="M56 54 C56 41, 84 41, 84 54 C80 47, 60 47, 56 54 Z" fill="#1c1b18" />
        <circle cx="70" cy="39" r="5" fill="#1c1b18" />
        <line x1="63" y1="39" x2="77" y2="39" stroke={isJindan ? '#facc15' : '#c6993d'} strokeWidth="2.4" strokeLinecap="round" />

        {/* Closed meditation eyes */}
        <path d="M63 57 Q65.5 59 68 57" fill="none" stroke="#1c1b18" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M72 57 Q74.5 59 77 57" fill="none" stroke="#1c1b18" strokeWidth="1.5" strokeLinecap="round" />

        {/* Dantian Qi Orb / Golden Core */}
        <circle
          cx="70"
          cy="94"
          r={isReadyBreakthrough ? '7' : isJindan ? '6' : '4.5'}
          fill={isReadyBreakthrough ? '#c4453a' : isJindan ? '#f59e0b' : '#3d8b76'}
          opacity="0.92"
        />
      </svg>
    </button>
  );
};
