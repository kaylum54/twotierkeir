'use client';

interface CopeEntry {
  id: number | string;
  content: string;
  source_url?: string;
  source_platform: string;
  source_username?: string;
  subreddit?: string;
  category: string;
  cope_level: number;
  votes: number;
  created_at: string;
}

interface CopeCardProps {
  entry: CopeEntry;
  onVote: () => void;
}

const PLATFORM_ICONS: Record<string, string> = {
  x: '𝕏',
  reddit: '🤖',
  facebook: '📘',
  guardian: '📰',
  other: '🌐',
};

const CATEGORY_STYLES: Record<string, { bg: string; border: string; emoji: string }> = {
  denial: { bg: 'bg-red-100', border: 'border-red-300', emoji: '🙈' },
  deflection: { bg: 'bg-yellow-100', border: 'border-yellow-300', emoji: '👉' },
  whatabout: { bg: 'bg-blue-100', border: 'border-blue-300', emoji: '🔄' },
  copium: { bg: 'bg-purple-100', border: 'border-purple-300', emoji: '💨' },
};

export const CopeCard = ({ entry, onVote }: CopeCardProps) => {
  const style = CATEGORY_STYLES[entry.category] || CATEGORY_STYLES.copium;
  const platformIcon = PLATFORM_ICONS[entry.source_platform] || '🌐';

  // Calculate cope meter fill
  const copeMeterWidth = (entry.cope_level / 10) * 100;

  return (
    <div
      className={`${style.bg} ${style.border} border-2 rounded-lg p-4
                  transform hover:-rotate-1 transition-transform relative`}
    >
      {/* Category badge */}
      <div
        className="absolute -top-3 -right-3 bg-white rounded-full px-3 py-1
                      border-2 border-black text-sm font-bold shadow-md"
      >
        {style.emoji} {entry.category.toUpperCase()}
      </div>

      {/* Source info */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <span>{platformIcon}</span>
        {entry.subreddit && (
          <span className="font-medium text-orange-600">
            {entry.source_platform === 'reddit' ? 'r/' : ''}{entry.subreddit}
          </span>
        )}
        {entry.source_username && (
          <span className="font-medium">
            {entry.source_platform === 'reddit' ? 'u/' : ''}{entry.source_username}
          </span>
        )}
        {entry.source_url && (
          <a
            href={entry.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline ml-auto"
          >
            View Source ↗
          </a>
        )}
      </div>

      {/* The cope content */}
      <blockquote className="text-lg italic mb-4 font-serif">
        &ldquo;{entry.content}&rdquo;
      </blockquote>

      {/* Cope meter */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Cope Level</span>
          <span className="font-bold">{entry.cope_level}/10</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600
                       transition-all duration-500"
            style={{ width: `${copeMeterWidth}%` }}
          />
        </div>
      </div>

      {/* Vote section */}
      <div className="flex items-center justify-between border-t pt-3">
        <button
          onClick={onVote}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800
                   transition-colors group"
        >
          <span className="text-2xl group-hover:scale-125 transition-transform">
            🧠
          </span>
          <span className="font-bold">{entry.votes}</span>
        </button>

        <div className="text-xs text-gray-400">
          {new Date(entry.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
