'use client';

import { Article } from '@/lib/types';
import { getSentimentLevel, formatRelativeTime } from '@/lib/api';
import StampOverlay, { getRandomStamp, StampType } from './StampOverlay';
import PostItNote, { getRandomComment } from './PostItNote';
import ThreatLevelBadge from './ThreatLevelBadge';
import clsx from 'clsx';
import { useMemo } from 'react';

interface NewsCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'featured';
  showPostIt?: boolean;
}

// Get rotation based on article ID for consistency
const getRotation = (id: number): number => {
  const rotations = [-1.5, -0.5, 0.5, 1, -1, 0.8, -0.8, 1.2];
  return rotations[id % rotations.length];
};

// Get stamp type based on sentiment
const getStampType = (score: number | null): StampType => {
  if (score === null) return 'leaked';
  if (score < -0.6) return 'disaster';
  if (score < -0.4) return 'failure';
  if (score < -0.2) return 'shambles';
  return 'leaked';
};

export default function NewsCard({ article, variant = 'default', showPostIt = true }: NewsCardProps) {
  const sentimentLevel = getSentimentLevel(article.sentiment_score);
  const rotation = getRotation(article.id);
  const stampType = useMemo(() => getStampType(article.sentiment_score), [article.sentiment_score]);
  const sarcasticComment = useMemo(() => getRandomComment(), []);

  if (variant === 'compact') {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block document-card document-card-hover p-4 group"
        style={{ transform: `rotate(${rotation * 0.5}deg)` }}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <ThreatLevelBadge score={article.sentiment_score || 0} showLabel={false} size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-typewriter text-sm text-ink-black group-hover:text-gov-blue transition-colors line-clamp-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-ink-grey font-typewriter">
              <span>INTERCEPTED FROM: {article.source}</span>
              <span>|</span>
              <span>{formatRelativeTime(article.published_at)}</span>
            </div>
          </div>
        </div>
      </a>
    );
  }

  if (variant === 'featured') {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block document-card document-card-hover p-8 group relative overflow-hidden"
        style={{ transform: `rotate(${rotation * 0.3}deg)` }}
      >
        {/* Stamp overlay */}
        <div className="absolute -top-2 -right-4 z-10">
          <StampOverlay type={stampType} />
        </div>

        {/* Coffee stain effect for extra authenticity */}
        <div className="absolute top-10 right-20 w-32 h-32 rounded-full opacity-5 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(101, 67, 33, 0.5) 0%, rgba(101, 67, 33, 0.2) 40%, transparent 70%)',
            transform: 'rotate(15deg)'
          }}
        />

        <div className="relative">
          {/* Document header */}
          <div className="flex items-center gap-2 mb-4 font-typewriter text-xs text-ink-grey">
            <span className="bg-disaster text-white px-2 py-0.5">PRIORITY</span>
            <span>|</span>
            <span>INTERCEPTED FROM: {article.source}</span>
            <span>|</span>
            <span>{formatRelativeTime(article.published_at)}</span>
          </div>

          {/* Title */}
          <h2 className="font-typewriter text-2xl md:text-3xl text-ink-black group-hover:text-gov-blue transition-colors mb-4 leading-tight">
            {article.title}
          </h2>

          {/* Snippet */}
          {article.content_snippet && (
            <p className="text-ink-grey line-clamp-3 mb-4">
              {article.content_snippet}
            </p>
          )}

          {/* Post-it note comment */}
          {showPostIt && (
            <div className="absolute -bottom-2 -right-2 transform rotate-3">
              <PostItNote color="yellow" rotation={5}>
                {sarcasticComment}
              </PostItNote>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <ThreatLevelBadge score={article.sentiment_score || 0} />
            <span className="text-gov-blue group-hover:underline font-typewriter text-sm">
              VIEW FULL CATASTROPHE →
            </span>
          </div>
        </div>
      </a>
    );
  }

  // Default variant - "leaked document" style
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block document-card document-card-hover group relative"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Random stamp */}
      <div className="absolute -top-3 -right-3 z-10">
        <StampOverlay type={stampType} className="text-lg" />
      </div>

      {/* Paper clip graphic (CSS) */}
      <div className="absolute -top-1 left-10 w-6 h-10 border-4 border-gray-400 rounded-full border-b-0 bg-transparent" />

      {/* Content */}
      <div className="pt-4">
        {/* Memo header */}
        <div className="font-typewriter text-xs text-ink-grey mb-3 uppercase tracking-wide">
          INTERCEPTED FROM: {article.source} | {formatRelativeTime(article.published_at)}
        </div>

        {/* Title with red underline on hover */}
        <h3 className="font-typewriter text-lg text-ink-black group-hover:text-red-underline transition-all mb-3 leading-tight">
          {article.title}
        </h3>

        {/* Snippet */}
        {article.content_snippet && (
          <p className="text-sm text-ink-grey line-clamp-2 mb-4">
            {article.content_snippet}
          </p>
        )}

        {/* Handwritten annotation */}
        {showPostIt && Math.random() > 0.5 && (
          <div className="font-handwriting text-disaster text-lg -rotate-2 mb-4">
            ^ {sarcasticComment}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <ThreatLevelBadge score={article.sentiment_score || 0} size="sm" />
        </div>
      </div>
    </a>
  );
}
