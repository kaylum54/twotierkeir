'use client';

import clsx from 'clsx';

const colors = {
  yellow: 'bg-yellow-200',
  pink: 'bg-pink-200',
  blue: 'bg-blue-200',
  green: 'bg-green-200',
  orange: 'bg-orange-200',
};

interface PostItNoteProps {
  children: React.ReactNode;
  color?: keyof typeof colors;
  rotation?: number;
  className?: string;
}

export default function PostItNote({
  children,
  color = 'yellow',
  rotation = -2,
  className,
}: PostItNoteProps) {
  return (
    <div
      className={clsx(
        'font-handwriting text-lg p-4 shadow-md max-w-[200px]',
        colors[color],
        className
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {children}
    </div>
  );
}

// Sarcastic comments for auto-generation
export const sarcasticComments = [
  "Couldn't make it up!",
  "Another day, another disaster",
  "Who saw this coming? (Everyone)",
  "Forensic leadership at work",
  "The gift that keeps on giving",
  "At least he's consistent",
  "Bold strategy, let's see if it pays off",
  "🤡",
  "Peak performance",
  "This is fine",
  "Two-tier competence",
];

export function getRandomComment(): string {
  return sarcasticComments[Math.floor(Math.random() * sarcasticComments.length)];
}
