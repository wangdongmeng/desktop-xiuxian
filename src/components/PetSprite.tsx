import React from 'react';
import { PetId } from '../game/types';

interface Props {
  petId: PetId;
  size?: 'xs' | 'sm' | 'md';
}

export const PetSprite: React.FC<Props> = ({ petId, size = 'sm' }) => {
  const cls = size === 'xs' ? 'w-7 h-7' : size === 'md' ? 'w-14 h-14' : 'w-10 h-10';

  return (
    <svg viewBox="0 0 80 80" className={`${cls} animate-float-slow drop-shadow-xs`}>
      {petId === 'fox' && (
        <g>
          {/* Fluffy tails */}
          <path d="M20 56 Q8 38 22 28 Q26 42 32 52 Z" fill="#f5f0e6" stroke="#c4453a" strokeWidth="2" />
          {/* Body */}
          <ellipse cx="44" cy="54" rx="16" ry="13" fill="#f5f0e6" stroke="#2d2a25" strokeWidth="2" />
          {/* Ears */}
          <path d="M34 36 L30 18 L43 30 Z M52 36 L58 18 L46 30 Z" fill="#f5f0e6" stroke="#2d2a25" strokeWidth="2" />
          {/* Head */}
          <circle cx="44" cy="38" r="12" fill="#f5f0e6" stroke="#2d2a25" strokeWidth="2" />
          <circle cx="40" cy="37" r="2" fill="#c4453a" />
          <circle cx="49" cy="37" r="2" fill="#c4453a" />
        </g>
      )}

      {petId === 'turtle' && (
        <g>
          {/* Shell */}
          <path d="M18 54 C18 32, 62 32, 62 54 Z" fill="#2e6f5e" stroke="#1c1b18" strokeWidth="2" />
          <path d="M28 48 L40 36 L52 48" fill="none" stroke="#c6993d" strokeWidth="2" />
          {/* Head & Feet */}
          <circle cx="64" cy="48" r="7" fill="#3d8b76" stroke="#1c1b18" strokeWidth="1.8" />
          <circle cx="66" cy="46" r="1.5" fill="#1c1b18" />
          <ellipse cx="26" cy="58" rx="6" ry="4" fill="#2d2a25" />
          <ellipse cx="52" cy="58" rx="6" ry="4" fill="#2d2a25" />
        </g>
      )}

      {petId === 'crane' && (
        <g>
          {/* Wings */}
          <path d="M14 40 Q32 20 44 42 Q28 48 14 40 Z" fill="#f5f0e6" stroke="#2d2a25" strokeWidth="2" />
          <path d="M40 42 Q56 18 68 34 Q54 46 40 42 Z" fill="#f5f0e6" stroke="#2d2a25" strokeWidth="2" />
          {/* Body & Red Crown */}
          <ellipse cx="42" cy="46" rx="11" ry="8" fill="#f5f0e6" stroke="#2d2a25" strokeWidth="2" />
          <circle cx="52" cy="30" r="6" fill="#f5f0e6" stroke="#2d2a25" strokeWidth="2" />
          <circle cx="52" cy="25" r="2.8" fill="#c4453a" />
          <path d="M58 30 L68 32 L58 34 Z" fill="#c6993d" />
        </g>
      )}

      {petId === 'dragon' && (
        <g>
          {/* Golden serpentine body */}
          <path
            d="M16 58 C20 36, 42 54, 48 36 C54 22, 66 28, 62 38"
            fill="none"
            stroke="#c6993d"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M16 58 C20 36, 42 54, 48 36 C54 22, 66 28, 62 38"
            fill="none"
            stroke="#fef08a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Horns & Eye */}
          <path d="M54 24 L50 14 M60 24 L66 15" stroke="#a9352b" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="31" r="2.2" fill="#a9352b" />
        </g>
      )}
    </svg>
  );
};
