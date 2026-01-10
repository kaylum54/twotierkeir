'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NewsCard from '@/components/NewsCard';
import NationalMoodGauge from '@/components/NationalMoodGauge';
import WarningBanner from '@/components/WarningBanner';
import StampOverlay from '@/components/StampOverlay';
import { getArticles, getDashboardStats } from '@/lib/api';
import { Article, DashboardStats } from '@/lib/types';

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesData, statsData] = await Promise.all([
          getArticles({ limit: 6 }),
          getDashboardStats(),
        ]);
        setArticles(articlesData.articles);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1, 5);

  return (
    <div className="min-h-screen">
      {/* Emergency Warning Banner */}
      <WarningBanner />

      {/* Hero - Emergency Broadcast Style */}
      <section className="bg-disaster text-white py-8 relative overflow-hidden">
        {/* Warning tape top */}
        <div className="absolute top-0 left-0 right-0 h-6 warning-stripe opacity-90" />

        <div className="container-wide pt-8">
          <div className="text-center">
            <h1 className="font-typewriter text-3xl md:text-5xl mb-2">
              🚨 SITUATION REPORT 🚨
            </h1>
            <p className="font-typewriter text-disaster-light text-lg">
              Official Status: <span className="text-highlight-yellow">IT&apos;S NOT GOING WELL</span>
            </p>
          </div>

          {/* Big stats in "control room" style */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur border border-white/20 p-4 text-center">
                <div className="font-typewriter text-4xl md:text-5xl font-bold text-highlight-yellow">
                  {stats.days_since_disaster}
                </div>
                <div className="font-typewriter text-xs text-white/80 mt-1 uppercase">
                  Days Since Last Disaster
                </div>
                <div className="text-xs text-white/60 mt-1">(Always zero)</div>
              </div>

              <div className="bg-white/10 backdrop-blur border border-white/20 p-4 text-center">
                <div className="font-typewriter text-4xl md:text-5xl font-bold">
                  {stats.broken_promises}
                </div>
                <div className="font-typewriter text-xs text-white/80 mt-1 uppercase">
                  Promises Broken
                </div>
                <div className="text-xs text-white/60 mt-1">And counting</div>
              </div>

              <div className="bg-white/10 backdrop-blur border border-white/20 p-4 text-center">
                <div className="font-typewriter text-4xl md:text-5xl font-bold">
                  {stats.latest_approval_rating ? `${stats.latest_approval_rating.toFixed(0)}%` : 'N/A'}
                </div>
                <div className="font-typewriter text-xs text-white/80 mt-1 uppercase">
                  Approval Rating
                </div>
                <div className="text-xs text-white/60 mt-1">↓ Still falling</div>
              </div>

              <div className="bg-white/10 backdrop-blur border border-white/20 p-4 text-center">
                <div className="font-typewriter text-4xl md:text-5xl font-bold">
                  {stats.negative_articles}
                </div>
                <div className="font-typewriter text-xs text-white/80 mt-1 uppercase">
                  Negative Stories
                </div>
                <div className="text-xs text-white/60 mt-1">This week</div>
              </div>
            </div>
          )}
        </div>

        {/* Warning tape bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-6 warning-stripe opacity-90" />
      </section>

      {/* National Mood Gauge Section */}
      <section className="py-12 bg-paper-white border-b-4 border-gov-blue">
        <div className="container-gov">
          <div className="text-center mb-6">
            <h2 className="font-typewriter text-2xl text-ink-black">
              NATIONAL MOOD INDICATOR
            </h2>
            <p className="text-ink-grey text-sm">Live tracking of public sentiment</p>
          </div>
          <NationalMoodGauge level={85} />
        </div>
      </section>

      {/* Latest Failures Section */}
      <section className="py-12 bg-paper-beige">
        <div className="container-wide">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-block mb-2">
                <StampOverlay type="leaked" className="text-sm" />
              </div>
              <h2 className="font-typewriter text-3xl text-ink-black">
                INTERCEPTED INTELLIGENCE
              </h2>
              <p className="text-ink-grey font-typewriter text-sm">
                The latest disasters from Downing Street
              </p>
            </div>
            <Link href="/failures" className="btn-gov-primary hidden md:inline-flex">
              VIEW ALL FAILURES →
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="document-card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Featured article */}
              {featuredArticle && (
                <div className="md:col-span-2">
                  <NewsCard article={featuredArticle} variant="featured" />
                </div>
              )}

              {/* Other articles */}
              {otherArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/failures" className="btn-gov-primary">
              VIEW ALL FAILURES →
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section - Folder style */}
      <section className="py-12 bg-paper-white">
        <div className="container-wide">
          <h2 className="font-typewriter text-2xl text-ink-black text-center mb-8">
            DEPARTMENTS OF FAILURE
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Broken Promises */}
            <Link href="/promises" className="document-card document-card-hover group relative">
              <div className="absolute -top-3 -right-3">
                <StampOverlay type="broken" className="text-sm" />
              </div>
              <div className="text-5xl mb-4">📜</div>
              <h3 className="font-typewriter text-xl text-ink-black group-hover:text-gov-blue transition-colors mb-2">
                THE EVIDENCE BOARD
              </h3>
              <p className="text-ink-grey text-sm">
                Every pledge, promise, and U-turn tracked and catalogued for posterity.
              </p>
              <div className="mt-4 font-handwriting text-disaster text-lg -rotate-1">
                "They promised WHAT?"
              </div>
            </Link>

            {/* Poll Watch */}
            <Link href="/polls" className="document-card document-card-hover group relative">
              <div className="absolute -top-3 -right-3">
                <StampOverlay type="crisis" className="text-sm" />
              </div>
              <div className="text-5xl mb-4">📉</div>
              <h3 className="font-typewriter text-xl text-ink-black group-hover:text-gov-blue transition-colors mb-2">
                APPROVAL CRATER
              </h3>
              <p className="text-ink-grey text-sm">
                Watch the approval ratings plummet in real-time. It&apos;s like a nature documentary.
              </p>
              <div className="mt-4 font-handwriting text-disaster text-lg rotate-1">
                "New record low!"
              </div>
            </Link>

            {/* Tier List */}
            <Link href="/tier-list" className="document-card document-card-hover group relative">
              <div className="absolute -top-3 -right-3">
                <StampOverlay type="disaster" className="text-sm" />
              </div>
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="font-typewriter text-xl text-ink-black group-hover:text-gov-blue transition-colors mb-2">
                HALL OF SHAME
              </h3>
              <p className="text-ink-grey text-sm">
                The worst decisions, ranked by the British public. Democracy in action.
              </p>
              <div className="mt-4 font-handwriting text-disaster text-lg -rotate-2">
                "Vote for your favourite disaster!"
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Government notice style */}
      <section className="py-16 bg-gov-blue-dark text-white">
        <div className="container-gov text-center">
          <div className="inline-block bg-highlight-yellow text-ink-black px-4 py-1 font-typewriter text-sm mb-4 -rotate-1">
            PUBLIC INFORMATION NOTICE
          </div>

          <h2 className="font-typewriter text-3xl md:text-4xl mb-6">
            STAY INFORMED. STAY OUTRAGED.
          </h2>

          <p className="text-gov-blue-light text-lg mb-8 max-w-xl mx-auto">
            Follow the official TWOTIER KEIR X account for real-time updates on every
            stumble, scandal, and spectacular failure.
          </p>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gov bg-white text-gov-blue-dark hover:bg-gray-100 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            FOLLOW ON X
          </a>

          <p className="mt-8 text-xs text-gov-blue-light opacity-70">
            This is a satirical website. All commentary represents opinion.
          </p>
        </div>
      </section>
    </div>
  );
}
