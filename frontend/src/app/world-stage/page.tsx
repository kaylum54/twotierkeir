'use client';

import { useEffect, useState } from 'react';
import NewsCard from '@/components/NewsCard';
import StampOverlay from '@/components/StampOverlay';
import { getArticles } from '@/lib/api';
import { Article } from '@/lib/types';

// Country flags and names for decoration
const COUNTRIES = [
  { code: 'US', name: 'United States', flag: 'usa' },
  { code: 'FR', name: 'France', flag: 'fr' },
  { code: 'DE', name: 'Germany', flag: 'de' },
  { code: 'EU', name: 'European Union', flag: 'eu' },
  { code: 'AU', name: 'Australia', flag: 'au' },
  { code: 'JP', name: 'Japan', flag: 'jp' },
];

export default function WorldStagePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const data = await getArticles({
          limit: 20,
          category: 'international',
        });
        setArticles(data.articles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-paper-beige">
      {/* Header - Classified Document Style */}
      <section className="bg-gov-blue-dark py-8 relative overflow-hidden">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container-wide relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StampOverlay type="leaked" className="text-xs" />
                <span className="font-typewriter text-xs text-gov-blue-light tracking-widest">
                  INTELLIGENCE BRIEF No. 47/SW/INTL
                </span>
              </div>
              <h1 className="font-typewriter text-3xl md:text-4xl text-white mb-2">
                WORLD STAGE
              </h1>
              <p className="text-gov-blue-light font-typewriter text-sm max-w-lg">
                Foreign dispatches and international intelligence on Britain&apos;s
                standing in the global community. Spoiler: it&apos;s not great.
              </p>
            </div>

            {/* Globe indicator */}
            <div className="flex-shrink-0 w-32 h-32 rounded-full border-4 border-gov-blue-light/30 flex items-center justify-center relative">
              <div className="text-6xl">globe</div>
              <div className="absolute -top-1 -right-1 bg-disaster text-white text-xs font-typewriter px-2 py-0.5 rounded-full">
                ALERT
              </div>
              {/* Orbit ring */}
              <div className="absolute inset-0 border-2 border-dashed border-gov-blue-light/20 rounded-full animate-spin" style={{ animationDuration: '30s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Status Ticker */}
      <section className="bg-ink-black py-3 overflow-hidden">
        <div className="animate-scroll-left whitespace-nowrap font-typewriter text-sm">
          <span className="text-terminal-green">DIPLOMATIC STATUS: </span>
          <span className="text-disaster mr-8">STRAINED</span>
          <span className="text-terminal-green">EU RELATIONS: </span>
          <span className="text-yellow-500 mr-8">COMPLICATED</span>
          <span className="text-terminal-green">US ALLIANCE: </span>
          <span className="text-yellow-500 mr-8">AWKWARD</span>
          <span className="text-terminal-green">COMMONWEALTH: </span>
          <span className="text-yellow-500 mr-8">QUESTIONING CHOICES</span>
          <span className="text-terminal-green">G7 STANDING: </span>
          <span className="text-disaster mr-8">EMBARRASSING</span>
          <span className="text-terminal-green">SOFT POWER INDEX: </span>
          <span className="text-disaster">DECLINING</span>
        </div>
      </section>

      {/* Intelligence Summary */}
      <section className="bg-paper-white border-b border-gray-300 py-6">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-300 bg-paper-beige">
              <div className="font-typewriter text-xs text-ink-grey mb-1">INTERCEPTS TODAY</div>
              <div className="font-typewriter text-2xl text-ink-black font-bold">{articles.length}</div>
              <div className="font-typewriter text-xs text-disaster">+ 12 flagged</div>
            </div>
            <div className="p-4 border border-gray-300 bg-paper-beige">
              <div className="font-typewriter text-xs text-ink-grey mb-1">SOURCES ACTIVE</div>
              <div className="font-typewriter text-2xl text-ink-black font-bold">23</div>
              <div className="font-typewriter text-xs text-gov-blue">Worldwide</div>
            </div>
            <div className="p-4 border border-gray-300 bg-paper-beige">
              <div className="font-typewriter text-xs text-ink-grey mb-1">THREAT LEVEL</div>
              <div className="font-typewriter text-2xl text-disaster font-bold">HIGH</div>
              <div className="font-typewriter text-xs text-ink-grey">To reputation</div>
            </div>
            <div className="p-4 border border-gray-300 bg-paper-beige">
              <div className="font-typewriter text-xs text-ink-grey mb-1">DIPLOMATIC INCIDENTS</div>
              <div className="font-typewriter text-2xl text-ink-black font-bold">7</div>
              <div className="font-typewriter text-xs text-disaster">This month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container-wide">
          {/* Section Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-disaster" />
              <div>
                <h2 className="font-typewriter text-xl text-ink-black">FOREIGN DISPATCHES</h2>
                <p className="font-typewriter text-xs text-ink-grey">International coverage of British governance</p>
              </div>
            </div>
            <div className="hidden md:block">
              <StampOverlay type="crisis" className="text-sm" />
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
            <div className="text-center py-16">
              <div className="bg-paper-white border-2 border-gray-300 p-12 max-w-md mx-auto">
                <div className="font-stamp text-4xl text-ink-grey mb-4">NO INTEL</div>
                <p className="font-typewriter text-ink-grey text-sm">
                  International sources are quiet. Perhaps the world has stopped
                  paying attention. Lucky them.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Coming Soon Features - Styled as Classified Projects */}
      <section className="py-12 bg-paper-white border-t border-gray-300">
        <div className="container-wide">
          <div className="mb-8 text-center">
            <span className="font-typewriter text-xs text-ink-grey tracking-widest">
              UPCOMING INTELLIGENCE MODULES
            </span>
            <h2 className="font-typewriter text-2xl text-ink-black mt-2">
              OPERATIONS IN DEVELOPMENT
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-paper-beige border border-gray-300 p-6 relative group hover:shadow-lg transition-shadow">
              <div className="absolute top-3 right-3">
                <span className="font-typewriter text-xs bg-gov-blue text-white px-2 py-0.5">
                  CLASSIFIED
                </span>
              </div>
              <div className="text-4xl mb-4">summit</div>
              <h3 className="font-typewriter text-lg text-ink-black mb-2">
                PROJECT: SUMMIT WATCH
              </h3>
              <p className="font-typewriter text-sm text-ink-grey mb-4">
                Real-time tracking of international meetings, handshakes (or lack thereof),
                and diplomatic body language analysis.
              </p>
              <div className="font-typewriter text-xs text-disaster">
                STATUS: IN DEVELOPMENT
              </div>
            </div>

            <div className="bg-paper-beige border border-gray-300 p-6 relative group hover:shadow-lg transition-shadow">
              <div className="absolute top-3 right-3">
                <span className="font-typewriter text-xs bg-gov-blue text-white px-2 py-0.5">
                  CLASSIFIED
                </span>
              </div>
              <div className="text-4xl mb-4">newspaper</div>
              <h3 className="font-typewriter text-lg text-ink-black mb-2">
                PROJECT: PRESS ROUNDUP
              </h3>
              <p className="font-typewriter text-sm text-ink-grey mb-4">
                Aggregated sentiment analysis from foreign newspapers.
                See what they really think of us.
              </p>
              <div className="font-typewriter text-xs text-disaster">
                STATUS: IN DEVELOPMENT
              </div>
            </div>

            <div className="bg-paper-beige border border-gray-300 p-6 relative group hover:shadow-lg transition-shadow">
              <div className="absolute top-3 right-3">
                <span className="font-typewriter text-xs bg-gov-blue text-white px-2 py-0.5">
                  CLASSIFIED
                </span>
              </div>
              <div className="text-4xl mb-4">podium</div>
              <h3 className="font-typewriter text-lg text-ink-black mb-2">
                PROJECT: LEADER RANKINGS
              </h3>
              <p className="font-typewriter text-sm text-ink-grey mb-4">
                How Starmer stacks up against other G7 leaders.
                Prepare for disappointment.
              </p>
              <div className="font-typewriter text-xs text-disaster">
                STATUS: IN DEVELOPMENT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Banner */}
      <section className="bg-ink-black py-6">
        <div className="container-wide">
          <div className="text-center">
            <div className="font-typewriter text-sm text-gray-500">
              INTELLIGENCE GATHERED FROM OPEN SOURCES WORLDWIDE
            </div>
            <div className="font-typewriter text-xs text-disaster mt-2">
              THE WORLD IS WATCHING. AND TAKING NOTES.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
