'use client';

import { useEffect, useState, useCallback } from 'react';
import NewsCard from '@/components/NewsCard';
import StampOverlay from '@/components/StampOverlay';
import FollowCTA from '@/components/FollowCTA';
import { getArticles } from '@/lib/api';
import { Article } from '@/lib/types';

export default function FailuresPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<string>('published_at');

  const perPage = 12;

  const fetchArticles = useCallback(async (pageNum: number, append: boolean = false) => {
    const isInitial = !append;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await getArticles({
        limit: perPage,
        offset: (pageNum - 1) * perPage,
        sort_by: sortBy,
      });

      if (append) {
        setArticles((prev) => [...prev, ...data.articles]);
      } else {
        setArticles(data.articles);
      }
      setHasMore(data.has_more);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sortBy]);

  useEffect(() => {
    setPage(1);
    fetchArticles(1);
  }, [sortBy, fetchArticles]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage, true);
  };

  return (
    <div className="min-h-screen bg-paper-beige py-12">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block mb-2">
            <StampOverlay type="leaked" />
          </div>
          <h1 className="font-typewriter text-4xl text-ink-black mb-4">
            INTERCEPTED INTELLIGENCE
          </h1>
          <p className="text-ink-grey font-typewriter max-w-2xl">
            A comprehensive catalogue of missteps, mishaps, and miscalculations from the
            current administration. Updated continuously because they never stop.
          </p>
        </div>

        {/* Filters - styled as document tabs */}
        <div className="bg-paper-white border border-gray-300 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-typewriter text-sm text-ink-grey">SORT BY:</span>
            <div className="flex gap-2">
              {[
                { value: 'published_at', label: 'LATEST' },
                { value: 'sentiment_score', label: 'MOST DISASTROUS' },
                { value: 'scraped_at', label: 'RECENTLY INTERCEPTED' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-1.5 font-typewriter text-sm transition-colors ${
                    sortBy === option.value
                      ? 'bg-gov-blue text-white'
                      : 'bg-paper-beige text-ink-grey hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="document-card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-paper-white border border-gray-300">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="font-typewriter text-xl text-ink-black mb-2">
              NO INTELLIGENCE INTERCEPTED
            </h3>
            <p className="text-ink-grey font-typewriter">
              Surprisingly, nothing negative to report. This is unprecedented.
              <br />
              Check back in approximately 5 minutes.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-gov-primary min-w-[250px]"
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      INTERCEPTING...
                    </span>
                  ) : (
                    'LOAD MORE DISASTERS →'
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Follow CTA */}
        <div className="mt-12">
          <FollowCTA variant="compact" />
        </div>
      </div>
    </div>
  );
}
