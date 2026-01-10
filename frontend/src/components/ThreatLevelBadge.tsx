'use client';

import clsx from 'clsx';

interface ThreatLevel {
  level: string;
  color: string;
  bgColor: string;
  emoji: string;
}

const getThreatLevel = (score: number): ThreatLevel => {
  if (score < -0.6) return { level: 'SEVERE', color: 'text-white', bgColor: 'bg-disaster', emoji: '🔴' };
  if (score < -0.4) return { level: 'HIGH', color: 'text-white', bgColor: 'bg-disaster-light', emoji: '🟠' };
  if (score < -0.2) return { level: 'ELEVATED', color: 'text-ink-black', bgColor: 'bg-highlight-yellow', emoji: '🟡' };
  return { level: 'GUARDED', color: 'text-white', bgColor: 'bg-gov-blue', emoji: '🔵' };
};

interface ThreatLevelBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThreatLevelBadge({
  score,
  showLabel = true,
  size = 'md'
}: ThreatLevelBadgeProps) {
  const threat = getThreatLevel(score);

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <div className="flex items-center gap-2 font-typewriter">
      <span>{threat.emoji}</span>
      <span className={clsx(
        'font-bold uppercase tracking-wide rounded-sm',
        threat.color,
        threat.bgColor,
        sizeClasses[size]
      )}>
        {showLabel && 'EMBARRASSMENT LEVEL: '}{threat.level}
      </span>
    </div>
  );
}
