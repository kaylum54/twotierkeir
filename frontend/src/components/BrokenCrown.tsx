'use client';

interface BrokenCrownProps {
  className?: string;
  size?: number;
}

export default function BrokenCrown({ className, size = 48 }: BrokenCrownProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Crown base - slightly tilted/broken looking */}
      <g transform="rotate(-5, 50, 50)">
        {/* Main crown shape */}
        <path
          d="M15 70 L25 35 L40 50 L50 25 L60 50 L75 35 L85 70 Z"
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth="2"
        />

        {/* Crown band */}
        <rect
          x="15"
          y="70"
          width="70"
          height="15"
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth="2"
        />

        {/* Jewels */}
        <circle cx="30" cy="75" r="4" fill="#DC143C" />
        <circle cx="50" cy="75" r="4" fill="#4169E1" />
        <circle cx="70" cy="75" r="4" fill="#DC143C" />

        {/* Top jewel */}
        <circle cx="50" cy="30" r="5" fill="#DC143C" stroke="#B8860B" strokeWidth="1" />
      </g>

      {/* Crack line */}
      <path
        d="M45 25 L48 40 L42 50 L50 65 L45 80"
        stroke="#8B0000"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Crack branches */}
      <path
        d="M48 40 L55 45"
        stroke="#8B0000"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M42 50 L35 52"
        stroke="#8B0000"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Broken piece falling */}
      <g transform="translate(5, 10) rotate(25, 65, 30)">
        <path
          d="M60 25 L70 30 L65 40 Z"
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth="1"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}
