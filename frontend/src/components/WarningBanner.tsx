'use client';

interface WarningBannerProps {
  messages?: string[];
}

const defaultMessages = [
  'LEADERSHIP FAILURE IN PROGRESS',
  'APPROVAL RATINGS CRITICAL',
  'PROMISE BREACH DETECTED',
  'TWO-TIER ALERT',
  'COMPETENCE LEVELS: MINIMAL',
  'PUBLIC TRUST: NOT FOUND',
];

export default function WarningBanner({ messages = defaultMessages }: WarningBannerProps) {
  const repeatedMessages = [...messages, ...messages]; // Double for seamless scroll

  return (
    <div className="bg-highlight-yellow text-ink-black py-1 overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-scroll-left">
        {repeatedMessages.map((msg, i) => (
          <span key={i} className="mx-8 font-bold text-sm">
            ⚠️ {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
