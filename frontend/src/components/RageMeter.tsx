'use client';

interface RageMeterProps {
  value: number; // 0-100
  label?: string;
}

export default function RageMeter({ value, label }: RageMeterProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const getLabel = () => {
    if (clampedValue >= 90) return 'MAXIMUM OUTRAGE';
    if (clampedValue >= 70) return 'Furious';
    if (clampedValue >= 50) return 'Angry';
    if (clampedValue >= 30) return 'Annoyed';
    return 'Mild Irritation';
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-400">{label}</span>
          <span className="font-medium text-white">{getLabel()}</span>
        </div>
      )}

      <div className="rage-meter">
        <div
          className="rage-meter-fill"
          style={{ width: `${clampedValue}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-secondary-500">
        <span>Calm</span>
        <span>Mildly Vexed</span>
        <span>Apoplectic</span>
      </div>
    </div>
  );
}
