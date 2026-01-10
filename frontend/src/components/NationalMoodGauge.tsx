'use client';

interface NationalMoodGaugeProps {
  level: number; // 0-100
}

const getMood = (level: number): string => {
  if (level >= 90) return 'APOPLECTIC';
  if (level >= 80) return 'ABSOLUTELY LIVID';
  if (level >= 70) return 'FUMING';
  if (level >= 60) return 'SEETHING';
  if (level >= 50) return 'RATHER ANNOYED';
  if (level >= 40) return 'MILDLY VEXED';
  if (level >= 30) return 'DISAPPOINTED';
  if (level >= 20) return 'CAUTIOUSLY PESSIMISTIC';
  return 'SUSPICIOUSLY CALM';
};

const getMoodEmoji = (level: number): string => {
  if (level >= 80) return '🤬';
  if (level >= 60) return '😤';
  if (level >= 40) return '😠';
  if (level >= 20) return '😒';
  return '🤨';
};

export default function NationalMoodGauge({ level }: NationalMoodGaugeProps) {
  const clampedLevel = Math.min(100, Math.max(0, level));
  const mood = getMood(clampedLevel);
  const emoji = getMoodEmoji(clampedLevel);

  // Calculate needle rotation (-90 to 90 degrees)
  const needleRotation = (clampedLevel * 1.8) - 90;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Semicircle gauge */}
      <div className="relative h-40">
        <svg viewBox="0 0 200 110" className="w-full">
          {/* Background arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Gradient arc - always full, clipped by the gauge */}
          <defs>
            <linearGradient id="mood-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="25%" stopColor="#eab308" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="75%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          {/* Filled arc based on level */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="url(#mood-gradient)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${clampedLevel * 2.83} 283`}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = ((tick / 100) * 180 - 180) * (Math.PI / 180);
            const x1 = 100 + 70 * Math.cos(angle);
            const y1 = 100 + 70 * Math.sin(angle);
            const x2 = 100 + 80 * Math.cos(angle);
            const y2 = 100 + 80 * Math.sin(angle);
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#666"
                strokeWidth="2"
              />
            );
          })}

          {/* Center point */}
          <circle cx="100" cy="100" r="8" fill="#333" />
        </svg>

        {/* Needle */}
        <div
          className="absolute bottom-[10px] left-1/2 w-1 h-[70px] bg-ink-black origin-bottom rounded-full"
          style={{
            transform: `translateX(-50%) rotate(${needleRotation}deg)`,
            transition: 'transform 0.5s ease-out'
          }}
        >
          {/* Needle tip */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-disaster rotate-45" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-ink-grey font-typewriter mt-2 px-4">
        <span>CALM</span>
        <span>VEXED</span>
        <span>LIVID</span>
      </div>

      {/* Current mood display */}
      <div className="text-center mt-4">
        <div className="text-5xl mb-2">{emoji}</div>
        <div className="font-typewriter">
          <span className="text-3xl font-bold text-disaster">{clampedLevel}%</span>
        </div>
        <div className="font-typewriter text-sm text-ink-grey mt-1">
          NATIONAL MOOD: <span className="text-ink-black font-bold">{mood}</span>
        </div>
      </div>
    </div>
  );
}
