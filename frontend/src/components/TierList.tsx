'use client';

import { useState } from 'react';
import { TierItem } from '@/lib/types';
import { voteOnTierItem } from '@/lib/api';
import clsx from 'clsx';
import StampOverlay from './StampOverlay';

interface TierListProps {
  items: TierItem[];
  onVote?: (itemId: number, newAverage: number) => void;
}

const TIERS = [
  { label: 'S', description: 'PUBLIC ENEMY #1', color: 'bg-disaster', border: 'border-disaster', minVote: 4.5, reward: '10,000' },
  { label: 'A', description: 'MOST WANTED', color: 'bg-orange-600', border: 'border-orange-600', minVote: 3.5, reward: '5,000' },
  { label: 'B', description: 'HIGHLY DANGEROUS', color: 'bg-yellow-600', border: 'border-yellow-600', minVote: 2.5, reward: '2,500' },
  { label: 'C', description: 'WANTED', color: 'bg-gov-blue', border: 'border-gov-blue', minVote: 1.5, reward: '1,000' },
  { label: 'D', description: 'PERSON OF INTEREST', color: 'bg-ink-grey', border: 'border-ink-grey', minVote: 0, reward: '500' },
];

export default function TierList({ items, onVote }: TierListProps) {
  const [votingItem, setVotingItem] = useState<number | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const getTier = (averageVote: number | null) => {
    if (averageVote === null) return TIERS[TIERS.length - 1];
    for (const tier of TIERS) {
      if (averageVote >= tier.minVote) return tier;
    }
    return TIERS[TIERS.length - 1];
  };

  const handleVote = async (itemId: number, value: number) => {
    setVotingItem(itemId);
    setVoteError(null);

    try {
      const result = await voteOnTierItem(itemId, value);
      if (result.success && onVote) {
        onVote(itemId, result.new_average);
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        setVoteError('You have already reported this incident recently');
      } else {
        setVoteError('Failed to submit report');
      }
    } finally {
      setVotingItem(null);
    }
  };

  // Group items by tier
  const groupedItems = TIERS.map((tier) => ({
    ...tier,
    items: items.filter((item) => {
      const itemTier = getTier(item.average_vote);
      return itemTier.label === tier.label;
    }),
  }));

  return (
    <div className="space-y-6">
      {voteError && (
        <div className="bg-disaster/20 border-2 border-disaster p-4 font-typewriter text-disaster text-sm">
          {voteError}
        </div>
      )}

      {groupedItems.map((tier) => (
        <div key={tier.label} className="relative">
          {/* Tier Header - Wanted poster style */}
          <div className={clsx(
            'flex items-center gap-4 p-4 border-b-4',
            tier.border,
            'bg-paper-aged'
          )}>
            <div className={clsx(
              'flex-shrink-0 w-14 h-14 flex items-center justify-center border-4 border-ink-black',
              tier.color
            )}>
              <span className="text-2xl font-stamp font-bold text-white">{tier.label}</span>
            </div>
            <div>
              <div className="font-stamp text-xl text-ink-black tracking-wider">{tier.description}</div>
              <div className="font-typewriter text-xs text-ink-grey">
                BOUNTY: <span className="text-disaster font-bold">OUTRAGE POINTS</span>
              </div>
            </div>
          </div>

          {/* Items Container - aged paper look */}
          <div className="bg-paper-white border-x border-b border-gray-300 p-4 min-h-[100px]">
            {tier.items.length === 0 ? (
              <div className="text-center py-4 font-typewriter text-ink-grey text-sm italic">
                No incidents at this threat level... yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier.items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-paper-aged border-2 border-ink-black/30 p-4 shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
                    }}
                  >
                    {/* Wanted poster header */}
                    <div className="text-center border-b border-ink-black/20 pb-2 mb-3">
                      <div className="font-stamp text-sm text-disaster tracking-widest">WANTED</div>
                      <div className="font-typewriter text-xs text-ink-grey">FOR CRIMES AGAINST THE PUBLIC</div>
                    </div>

                    {/* Crime description */}
                    <p className="font-typewriter text-sm text-ink-black mb-3 leading-tight">
                      {item.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs font-typewriter text-ink-grey border-t border-ink-black/20 pt-2">
                      <span>REPORTS: {item.vote_count}</span>
                      <span className={clsx(
                        'px-2 py-0.5 font-bold',
                        tier.color,
                        'text-white'
                      )}>
                        LEVEL {tier.label}
                      </span>
                    </div>

                    {/* Vote popup - styled as report severity */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-ink-black p-3 shadow-xl z-10 min-w-[200px]">
                      <div className="font-typewriter text-xs text-white mb-2 text-center">
                        RATE SEVERITY OF INCIDENT:
                      </div>
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => handleVote(item.id, v)}
                            disabled={votingItem === item.id}
                            className={clsx(
                              'w-8 h-8 font-typewriter font-bold transition-colors border-2',
                              v <= 2 && 'bg-gov-blue border-gov-blue-light hover:bg-gov-blue-light text-white',
                              v === 3 && 'bg-yellow-600 border-yellow-500 hover:bg-yellow-500 text-white',
                              v >= 4 && 'bg-disaster border-disaster-light hover:bg-disaster-light text-white',
                              'disabled:opacity-50'
                            )}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between font-typewriter text-[10px] text-gray-400 mt-1 px-1">
                        <span>Minor</span>
                        <span>Catastrophic</span>
                      </div>
                      {/* Arrow pointer */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-ink-black" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="text-center font-typewriter text-xs text-ink-grey mt-6 p-4 bg-paper-white border border-gray-300">
        HOVER OVER ANY INCIDENT TO FILE YOUR SEVERITY REPORT (1-5)
        <br />
        <span className="text-disaster">YOUR VOTE HELPS RANK THE MOST EGREGIOUS FAILURES</span>
      </div>
    </div>
  );
}
