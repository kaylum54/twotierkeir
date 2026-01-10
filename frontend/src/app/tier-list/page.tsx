'use client';

import { useEffect, useState } from 'react';
import TierList from '@/components/TierList';
import { getTierList } from '@/lib/api';
import { TierItem } from '@/lib/types';
import StampOverlay from '@/components/StampOverlay';

export default function TierListPage() {
  const [items, setItems] = useState<TierItem[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTierList() {
      try {
        const data = await getTierList();
        setItems(data.items);
        setTotalVotes(data.total_votes);
      } catch (error) {
        console.error('Error fetching tier list:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTierList();
  }, []);

  const handleVote = (itemId: number, newAverage: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, average_vote: newAverage, vote_count: item.vote_count + 1 }
          : item
      )
    );
    setTotalVotes((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-paper-beige">
      {/* Header - Old West Wanted Board Style */}
      <section className="bg-ink-black py-8 relative overflow-hidden">
        {/* Wood grain texture effect */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 5 50 10 T100 10' stroke='%23654321' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 20px',
          }}
        />

        <div className="container-wide relative">
          <div className="text-center">
            {/* Wanted poster style header */}
            <div className="inline-block bg-paper-aged border-4 border-ink-black px-8 py-6 shadow-2xl transform -rotate-1">
              <div className="font-stamp text-5xl md:text-6xl text-ink-black tracking-wider mb-2">
                HALL OF SHAME
              </div>
              <div className="font-typewriter text-sm text-ink-grey tracking-widest">
                OFFICIAL REGISTRY OF GOVERNMENT FAILURES
              </div>
              <div className="mt-4 border-t-2 border-b-2 border-ink-black/30 py-2">
                <span className="font-typewriter text-xs text-disaster">
                  REWARD: PUBLIC ACCOUNTABILITY
                </span>
              </div>
            </div>

            <p className="mt-6 font-typewriter text-gray-400 max-w-xl mx-auto">
              Democracy in action. Rate the worst decisions, policies, and gaffes.
              The public will be the judge.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-paper-white border-b-4 border-disaster py-4">
        <div className="container-wide">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="text-4xl">gavel</div>
              <div className="text-center">
                <div className="font-typewriter text-2xl text-ink-black font-bold">
                  {totalVotes.toLocaleString()}
                </div>
                <div className="font-typewriter text-xs text-ink-grey uppercase">
                  Verdicts Filed
                </div>
              </div>
            </div>
            <div className="h-12 w-px bg-gray-300 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="text-4xl">folder</div>
              <div className="text-center">
                <div className="font-typewriter text-2xl text-ink-black font-bold">
                  {items.length}
                </div>
                <div className="font-typewriter text-xs text-ink-grey uppercase">
                  Cases Open
                </div>
              </div>
            </div>
            <div className="h-12 w-px bg-gray-300 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="text-4xl">target</div>
              <div className="text-center">
                <div className="font-typewriter text-2xl text-disaster font-bold">
                  {items.filter(i => i.average_vote && i.average_vote >= 4.5).length}
                </div>
                <div className="font-typewriter text-xs text-ink-grey uppercase">
                  Public Enemy #1
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Threat Level Guide */}
      <section className="bg-paper-beige py-6 border-b border-gray-300">
        <div className="container-wide">
          <div className="bg-paper-white border border-gray-300 p-4">
            <div className="flex items-center gap-2 mb-4">
              <StampOverlay type="crisis" className="text-sm" />
              <h3 className="font-typewriter text-sm text-ink-black">THREAT CLASSIFICATION GUIDE</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-disaster border-2 border-ink-black flex items-center justify-center font-stamp text-lg text-white">S</div>
                <div>
                  <div className="font-typewriter text-xs text-ink-black">PUBLIC ENEMY #1</div>
                  <div className="font-typewriter text-[10px] text-ink-grey">Catastrophic</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-600 border-2 border-ink-black flex items-center justify-center font-stamp text-lg text-white">A</div>
                <div>
                  <div className="font-typewriter text-xs text-ink-black">MOST WANTED</div>
                  <div className="font-typewriter text-[10px] text-ink-grey">Terrible</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-yellow-600 border-2 border-ink-black flex items-center justify-center font-stamp text-lg text-white">B</div>
                <div>
                  <div className="font-typewriter text-xs text-ink-black">HIGHLY DANGEROUS</div>
                  <div className="font-typewriter text-[10px] text-ink-grey">Bad</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gov-blue border-2 border-ink-black flex items-center justify-center font-stamp text-lg text-white">C</div>
                <div>
                  <div className="font-typewriter text-xs text-ink-black">WANTED</div>
                  <div className="font-typewriter text-[10px] text-ink-grey">Disappointing</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-ink-grey border-2 border-ink-black flex items-center justify-center font-stamp text-lg text-white">D</div>
                <div>
                  <div className="font-typewriter text-xs text-ink-black">PERSON OF INTEREST</div>
                  <div className="font-typewriter text-[10px] text-ink-grey">Mild Failure</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container-wide">
          {loading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-paper-white border border-gray-300 p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 w-1/4" />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-24 bg-gray-100" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-paper-white border-2 border-ink-black p-12 max-w-md mx-auto transform rotate-1">
                <div className="font-stamp text-4xl text-ink-grey mb-4">NO SUSPECTS</div>
                <p className="font-typewriter text-ink-grey">
                  The investigation continues. Check back soon for items to rank.
                </p>
              </div>
            </div>
          ) : (
            <TierList items={items} onVote={handleVote} />
          )}
        </div>
      </section>

      {/* Bottom Instructions */}
      <section className="bg-ink-black py-8">
        <div className="container-wide">
          <div className="bg-paper-aged border-2 border-ink-black/50 p-6 max-w-2xl mx-auto">
            <h3 className="font-stamp text-xl text-ink-black mb-4 text-center tracking-wider">
              HOW TO FILE A REPORT
            </h3>
            <ul className="font-typewriter text-sm text-ink-grey space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-disaster font-bold">1.</span>
                <span>Hover over any incident card to reveal the voting panel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-disaster font-bold">2.</span>
                <span>Rate the severity from 1 (minor) to 5 (catastrophic)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-disaster font-bold">3.</span>
                <span>Items are automatically ranked based on public verdict</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-disaster font-bold">4.</span>
                <span>You may file one report per incident every 24 hours</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-ink-black/20 text-center">
              <span className="font-typewriter text-xs text-disaster">
                THE PEOPLE WILL BE HEARD
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
