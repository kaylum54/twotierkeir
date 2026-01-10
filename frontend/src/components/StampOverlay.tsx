'use client';

import clsx from 'clsx';

const stamps = {
  failure: { text: 'FAILURE', color: 'text-stamp-red border-stamp-red', rotation: -15 },
  disaster: { text: 'DISASTER', color: 'text-disaster border-disaster', rotation: 12 },
  uturn: { text: 'U-TURN', color: 'text-disaster-light border-disaster-light', rotation: -8 },
  broken: { text: 'BROKEN', color: 'text-stamp-red border-stamp-red', rotation: 10 },
  leaked: { text: 'LEAKED', color: 'text-gov-blue border-gov-blue', rotation: -12 },
  classified: { text: 'CLASSIFIED', color: 'text-ink-black border-ink-black', rotation: 5 },
  shambles: { text: 'SHAMBLES', color: 'text-disaster border-disaster', rotation: -18 },
  crisis: { text: 'CRISIS', color: 'text-stamp-red border-stamp-red', rotation: 8 },
};

type StampType = keyof typeof stamps;

interface StampOverlayProps {
  type: StampType;
  className?: string;
  animated?: boolean;
}

export default function StampOverlay({ type, className, animated = false }: StampOverlayProps) {
  const stamp = stamps[type];

  return (
    <div
      className={clsx(
        'font-stamp text-xl md:text-2xl uppercase tracking-wider px-3 py-1 border-4 opacity-85',
        stamp.color,
        animated && 'animate-stamp-drop',
        className
      )}
      style={{ transform: `rotate(${stamp.rotation}deg)` }}
    >
      {stamp.text}
    </div>
  );
}

// Helper to get a random stamp type
export function getRandomStamp(): StampType {
  const types: StampType[] = ['failure', 'disaster', 'shambles', 'crisis'];
  return types[Math.floor(Math.random() * types.length)];
}

// Export stamp types for use elsewhere
export type { StampType };
