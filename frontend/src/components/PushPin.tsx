'use client';

import clsx from 'clsx';

const pinColors = {
  red: 'from-red-400 to-red-600',
  blue: 'from-blue-400 to-blue-600',
  yellow: 'from-yellow-400 to-yellow-600',
  green: 'from-green-400 to-green-600',
  black: 'from-gray-600 to-gray-800',
};

interface PushPinProps {
  color?: keyof typeof pinColors;
  className?: string;
}

export default function PushPin({ color = 'red', className }: PushPinProps) {
  return (
    <div className={clsx('relative w-6 h-6', className)}>
      {/* Pin head */}
      <div
        className={clsx(
          'w-6 h-6 rounded-full shadow-md bg-gradient-to-br',
          pinColors[color]
        )}
        style={{
          boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        {/* Shine effect */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full" />
      </div>
      {/* Pin point */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-gray-400 to-gray-600 rounded-b-full"
        style={{ top: '20px' }}
      />
    </div>
  );
}
