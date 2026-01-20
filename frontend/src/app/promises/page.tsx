'use client';

import { useEffect, useState, useMemo } from 'react';
import { getPromises } from '@/lib/api';
import { Promise, PromiseListResponse } from '@/lib/types';
import clsx from 'clsx';
import { format } from 'date-fns';
import PushPin from '@/components/PushPin';
import StampOverlay from '@/components/StampOverlay';
import PostItNote from '@/components/PostItNote';
import FollowCTA from '@/components/FollowCTA';

// Get consistent rotation based on promise ID
const getRotation = (id: number): number => {
  const rotations = [-3, -1.5, 1, 2, -2, 0.5, -0.5, 2.5, -1, 1.5];
  return rotations[id % rotations.length];
};

// Get pin color based on status
const getPinColor = (status: string): 'red' | 'blue' | 'yellow' | 'green' | 'black' => {
  const colors: Record<string, 'red' | 'blue' | 'yellow' | 'green' | 'black'> = {
    'broken': 'red',
    'u-turn': 'yellow',
    'pending': 'blue',
    'kept': 'green',
  };
  return colors[status] || 'black';
};

// Get stamp type based on status
const getStampType = (status: string): 'broken' | 'disaster' | 'leaked' | 'shambles' | 'crisis' => {
  const stamps: Record<string, 'broken' | 'disaster' | 'leaked' | 'shambles' | 'crisis'> = {
    'broken': 'broken',
    'u-turn': 'shambles',
    'pending': 'leaked',
    'kept': 'leaked',
  };
  return stamps[status] || 'leaked';
};

// Sarcastic comments for each status
const getStatusComment = (status: string): string => {
  const comments: Record<string, string[]> = {
    'broken': [
      'Surprise, surprise',
      'Who could have predicted?',
      'Classic Keir',
      'Memory of a goldfish',
      'Does he even remember saying this?',
    ],
    'u-turn': [
      'And he spins!',
      '180 degrees!',
      'Dizzy yet?',
      'Another day, another U-turn',
      'Consistent inconsistency',
    ],
    'pending': [
      'Any day now...',
      'Still waiting...',
      'Place your bets',
      '*tumbleweed*',
      'Time is ticking',
    ],
    'kept': [
      'Wait, really?',
      'Mark the calendar!',
      'A stopped clock...',
      'Once in a blue moon',
      'Even he&apos;s surprised',
    ],
  };
  const arr = comments[status] || comments.pending;
  return arr[Math.floor(Math.random() * arr.length)];
};

export default function PromisesPage() {
  const [data, setData] = useState<PromiseListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchPromises() {
      try {
        const result = await getPromises();
        setData(result);
      } catch (error) {
        console.error('Error fetching promises:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPromises();
  }, []);

  const filteredPromises = data?.promises.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  }) || [];

  // Generate comments once per render to avoid hydration mismatches
  const promiseComments = useMemo(() => {
    const comments: Record<number, string> = {};
    filteredPromises.forEach((p) => {
      comments[p.id] = getStatusComment(p.status);
    });
    return comments;
  }, [filteredPromises]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; bg: string }> = {
      'broken': { label: 'BROKEN', color: 'text-white', bg: 'bg-disaster' },
      'u-turn': { label: 'U-TURN', color: 'text-ink-black', bg: 'bg-highlight-yellow' },
      'pending': { label: 'PENDING', color: 'text-white', bg: 'bg-gov-blue' },
      'kept': { label: 'KEPT', color: 'text-white', bg: 'bg-green-600' },
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="min-h-screen">
      {/* Case File Header */}
      <section className="bg-gov-blue-dark py-8 border-b-4 border-highlight-yellow">
        <div className="container-wide">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">📋</div>
            <div>
              <div className="font-typewriter text-xs text-gov-blue-light tracking-widest mb-1">
                CLASSIFIED DOCUMENT No. 2024/SW/PROMISES
              </div>
              <h1 className="font-typewriter text-3xl md:text-4xl text-white">
                THE EVIDENCE BOARD
              </h1>
            </div>
          </div>
          <p className="text-gov-blue-light font-typewriter max-w-2xl">
            Every pledge, commitment, and solemn vow - tracked and catalogued.
            Connect the dots. Follow the broken promises.
          </p>
        </div>
      </section>

      {/* Stats Bar - styled as case file summary */}
      {data && (
        <section className="bg-paper-white border-b border-gray-300 py-4">
          <div className="container-wide">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="font-typewriter text-sm text-ink-grey">
                CASE FILE SUMMARY:
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-ink-black rounded-full"></span>
                  <span className="font-typewriter text-sm">
                    <span className="text-ink-black font-bold">{data.total}</span> Total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-disaster rounded-full"></span>
                  <span className="font-typewriter text-sm">
                    <span className="text-disaster font-bold">{data.broken_count}</span> Broken
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-highlight-yellow rounded-full border border-gray-400"></span>
                  <span className="font-typewriter text-sm">
                    <span className="text-yellow-600 font-bold">{data.uturn_count}</span> U-Turns
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gov-blue rounded-full"></span>
                  <span className="font-typewriter text-sm">
                    <span className="text-gov-blue font-bold">{data.pending_count}</span> Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Tabs - styled as folder tabs */}
      <section className="bg-paper-beige border-b border-gray-300">
        <div className="container-wide">
          <div className="flex items-end gap-1 pt-4 -mb-[1px]">
            {[
              { value: 'all', label: 'ALL EVIDENCE' },
              { value: 'broken', label: 'BROKEN' },
              { value: 'u-turn', label: 'U-TURNS' },
              { value: 'pending', label: 'PENDING' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={clsx(
                  'px-4 py-2 font-typewriter text-sm transition-colors rounded-t-lg border-t border-l border-r',
                  filter === option.value
                    ? 'bg-cork text-ink-black border-gray-400 font-bold'
                    : 'bg-paper-manila text-ink-grey border-gray-300 hover:bg-paper-beige'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cork Board Evidence Area */}
      <section
        className="min-h-[600px] py-12 relative"
        style={{
          backgroundColor: '#c4a574',
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")
          `,
        }}
      >
        {/* Cork board frame effect */}
        <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.3)]"></div>

        {/* String decoration connecting some cards */}
        <div className="absolute top-20 left-1/4 w-1/2 h-[2px] bg-red-800 opacity-50 transform -rotate-2"></div>
        <div className="absolute top-1/3 right-20 w-32 h-[2px] bg-red-800 opacity-50 transform rotate-12"></div>

        <div className="container-wide relative">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-paper-white p-6 shadow-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredPromises.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-paper-white border border-gray-300 p-12 max-w-md mx-auto shadow-lg transform -rotate-1">
                <PushPin color="red" className="absolute -top-3 left-1/2 -translate-x-1/2" />
                <div className="text-6xl mb-4">
                  {filter === 'kept' ? '?!' : ''}
                </div>
                <h3 className="font-typewriter text-xl text-ink-black mb-2">
                  {filter === 'kept' ? 'EVIDENCE NOT FOUND' : 'NO MATCHING EVIDENCE'}
                </h3>
                <p className="text-ink-grey font-typewriter text-sm">
                  {filter === 'kept'
                    ? 'Our investigators are still searching for kept promises. This may take a while.'
                    : 'Try a different evidence category.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPromises.map((promise, index) => {
                const badge = getStatusBadge(promise.status);
                const rotation = getRotation(promise.id);
                const pinColor = getPinColor(promise.status);
                const showPostIt = index % 3 === 0; // Show post-it on some cards

                return (
                  <div
                    key={promise.id}
                    className="relative group"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {/* Push pin */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                      <PushPin color={pinColor} />
                    </div>

                    {/* Evidence card */}
                    <div className="bg-paper-white border border-gray-300 shadow-lg p-6 pt-8 transition-transform group-hover:scale-[1.02] group-hover:shadow-xl">
                      {/* Stamp overlay */}
                      <div className="absolute -top-2 -right-2 z-10 transform rotate-12">
                        <StampOverlay type={getStampType(promise.status)} className="text-sm" />
                      </div>

                      {/* Case number header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-typewriter text-xs text-ink-grey">
                          CASE #{promise.id.toString().padStart(3, '0')}
                        </div>
                        <span className={clsx(
                          'font-typewriter text-xs px-2 py-0.5',
                          badge.bg,
                          badge.color
                        )}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Promise text */}
                      <h3 className="font-typewriter text-lg text-ink-black mb-3 leading-tight">
                        &ldquo;{promise.promise_text}&rdquo;
                      </h3>

                      {/* Date promised */}
                      {promise.date_promised && (
                        <div className="font-typewriter text-xs text-ink-grey mb-3">
                          DATE RECORDED: {format(new Date(promise.date_promised), 'dd MMM yyyy').toUpperCase()}
                        </div>
                      )}

                      {/* Mocking comment with handwriting style */}
                      {promise.mocking_comment && (
                        <div className="font-handwriting text-disaster text-lg -rotate-1 mb-3">
                          ^ {promise.mocking_comment}
                        </div>
                      )}

                      {/* Source link */}
                      {promise.source_url && (
                        <a
                          href={promise.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-typewriter text-xs text-gov-blue hover:underline"
                        >
                          VIEW SOURCE DOCUMENT
                        </a>
                      )}

                      {/* Yellow highlight effect on hover */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-highlight-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </div>

                    {/* Post-it note on some cards */}
                    {showPostIt && (
                      <div className="absolute -bottom-4 -right-4 transform rotate-6 z-10">
                        <PostItNote color="yellow" rotation={8}>
                          {promiseComments[promise.id]}
                        </PostItNote>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom notice */}
      <section className="bg-paper-white border-t border-gray-300 py-6">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-typewriter text-xs text-ink-grey">
              EVIDENCE LAST VERIFIED: {format(new Date(), 'dd/MM/yyyy HH:mm')}
            </div>
            <div className="font-typewriter text-xs text-ink-grey">
              THIS INVESTIGATION IS ONGOING
            </div>
          </div>
        </div>
      </section>

      {/* Follow CTA */}
      <FollowCTA />
    </div>
  );
}
