'use client';

import { useEffect, useState } from 'react';
import PollChart from '@/components/PollChart';
import { getPollHistory, getLatestPoll } from '@/lib/api';
import { Poll, PollHistoryResponse } from '@/lib/types';
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import clsx from 'clsx';

// Status light component
function StatusLight({ status, label }: { status: 'critical' | 'warning' | 'nominal'; label: string }) {
  const colors = {
    critical: 'bg-red-500 shadow-red-500/50',
    warning: 'bg-yellow-500 shadow-yellow-500/50',
    nominal: 'bg-green-500 shadow-green-500/50',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={clsx('w-3 h-3 rounded-full animate-pulse shadow-lg', colors[status])} />
      <span className="font-mono text-xs text-terminal-green">{label}</span>
    </div>
  );
}

// Terminal display box
function TerminalBox({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-terminal-dark border border-terminal-green/30 relative', className)}>
      {/* Terminal header */}
      <div className="border-b border-terminal-green/30 px-3 py-1.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="font-mono text-xs text-terminal-green/70 ml-2">{title}</span>
      </div>
      {/* Content */}
      <div className="p-4">
        {children}
      </div>
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-terminal-green/[0.02] to-transparent bg-[length:100%_4px] animate-scan-line" />
    </div>
  );
}

export default function PollsPage() {
  const [history, setHistory] = useState<PollHistoryResponse | null>(null);
  const [latestPoll, setLatestPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(90);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate countdown to next election
  useEffect(() => {
    const nextElection = new Date('2029-05-01');
    const updateCountdown = () => {
      const now = new Date();
      setCountdown({
        days: differenceInDays(nextElection, now),
        hours: differenceInHours(nextElection, now) % 24,
        minutes: differenceInMinutes(nextElection, now) % 60,
        seconds: differenceInSeconds(nextElection, now) % 60,
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [historyData, latest] = await Promise.all([
          getPollHistory(timeRange),
          getLatestPoll().catch(() => null),
        ]);
        setHistory(historyData);
        setLatestPoll(latest);
      } catch (error) {
        console.error('Error fetching poll data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [timeRange]);

  // Determine crisis level
  const getCrisisLevel = (approval: number | null | undefined) => {
    if (!approval) return { level: 'UNKNOWN', color: 'text-gray-500' };
    if (approval < 20) return { level: 'CATASTROPHIC', color: 'text-red-500' };
    if (approval < 30) return { level: 'CRITICAL', color: 'text-red-400' };
    if (approval < 40) return { level: 'SEVERE', color: 'text-orange-500' };
    if (approval < 50) return { level: 'ELEVATED', color: 'text-yellow-500' };
    return { level: 'NOMINAL', color: 'text-green-500' };
  };

  const crisisLevel = getCrisisLevel(latestPoll?.approval_rating);

  return (
    <div className="min-h-screen bg-terminal-dark">
      {/* CRT screen effect overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terminal-green/[0.03] to-transparent bg-[length:100%_3px]" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/30" />
      </div>

      {/* Header - Mission Control Banner */}
      <section className="border-b border-terminal-green/30 py-6 relative">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-mono text-terminal-green/70 text-xs mb-2">
                {'>'} SYSTEM: APPROVAL_MONITOR v2.4.7 // STATUS: ACTIVE
              </div>
              <h1 className="font-mono text-3xl md:text-4xl text-terminal-green tracking-wider">
                APPROVAL CRATER
              </h1>
              <div className="font-mono text-sm text-terminal-green/60 mt-1">
                MISSION CONTROL // PUBLIC CONFIDENCE TRACKING SYSTEM
              </div>
            </div>

            {/* Status lights */}
            <div className="flex flex-wrap gap-4">
              <StatusLight status="critical" label="APPROVAL" />
              <StatusLight status="warning" label="TREND" />
              <StatusLight status="nominal" label="FEED" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-wide py-8 relative">
        {/* Primary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Current Approval */}
          <TerminalBox title="approval.exe">
            <div className="text-center">
              <div className="font-mono text-4xl md:text-5xl text-terminal-green font-bold">
                {latestPoll?.approval_rating?.toFixed(0) || '--'}%
              </div>
              <div className="font-mono text-xs text-terminal-green/60 mt-2">CURRENT APPROVAL</div>
              <div className={clsx('font-mono text-xs mt-1', crisisLevel.color)}>
                [{crisisLevel.level}]
              </div>
            </div>
          </TerminalBox>

          {/* Disapproval */}
          <TerminalBox title="disapproval.exe">
            <div className="text-center">
              <div className="font-mono text-4xl md:text-5xl text-red-500 font-bold">
                {latestPoll?.disapproval_rating?.toFixed(0) || '--'}%
              </div>
              <div className="font-mono text-xs text-terminal-green/60 mt-2">DISAPPROVAL RATE</div>
              <div className="font-mono text-xs text-red-400 mt-1 animate-pulse">
                [RISING]
              </div>
            </div>
          </TerminalBox>

          {/* All-Time Low */}
          <TerminalBox title="record_low.dat">
            <div className="text-center">
              <div className="font-mono text-4xl md:text-5xl text-yellow-500 font-bold">
                {history?.lowest_approval?.toFixed(0) || '--'}%
              </div>
              <div className="font-mono text-xs text-terminal-green/60 mt-2">ALL-TIME LOW</div>
              <div className="font-mono text-xs text-yellow-400 mt-1">
                [RECORD]
              </div>
            </div>
          </TerminalBox>

          {/* Election Countdown */}
          <TerminalBox title="countdown.sys">
            <div className="text-center">
              <div className="font-mono text-2xl md:text-3xl text-terminal-green font-bold">
                {countdown.days.toLocaleString()}
              </div>
              <div className="font-mono text-xs text-terminal-green/60 mt-1">DAYS REMAINING</div>
              <div className="font-mono text-xs text-terminal-green/40 mt-2">
                {String(countdown.hours).padStart(2, '0')}:
                {String(countdown.minutes).padStart(2, '0')}:
                {String(countdown.seconds).padStart(2, '0')}
              </div>
            </div>
          </TerminalBox>
        </div>

        {/* Chart Section */}
        <TerminalBox title="trend_analysis.exe" className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="font-mono text-sm text-terminal-green">
              {'>'} APPROVAL TRAJECTORY ANALYSIS
            </div>
            <div className="flex gap-1">
              {[
                { days: 30, label: '30D' },
                { days: 90, label: '90D' },
                { days: 180, label: '180D' },
                { days: 365, label: '365D' },
              ].map((option) => (
                <button
                  key={option.days}
                  onClick={() => setTimeRange(option.days)}
                  className={clsx(
                    'px-3 py-1 font-mono text-xs transition-colors border',
                    timeRange === option.days
                      ? 'bg-terminal-green/20 text-terminal-green border-terminal-green'
                      : 'text-terminal-green/50 border-terminal-green/30 hover:border-terminal-green/50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="font-mono text-terminal-green animate-pulse">
                {'>'} LOADING DATA FEED...
              </div>
            </div>
          ) : (
            <PollChart polls={history?.polls || []} height={300} variant="terminal" />
          )}

          <div className="flex justify-center gap-8 mt-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-terminal-green" />
              <span className="text-terminal-green/70">APPROVAL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500" />
              <span className="text-terminal-green/70">DISAPPROVAL</span>
            </div>
          </div>
        </TerminalBox>

        {/* Bottom Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Historical Comparison */}
          <TerminalBox title="historical_compare.db">
            <div className="font-mono text-sm text-terminal-green mb-4">
              {'>'} PM COMPARISON AT SAME TENURE
            </div>
            <div className="space-y-3">
              {[
                { name: 'BLAIR_T', year: '1998', rating: 55, color: 'text-green-400' },
                { name: 'JOHNSON_B', year: '2020', rating: 42, color: 'text-yellow-400' },
                { name: 'CAMERON_D', year: '2011', rating: 38, color: 'text-orange-400' },
              ].map((pm) => (
                <div key={pm.name} className="flex items-center justify-between font-mono text-sm border-b border-terminal-green/20 pb-2">
                  <span className="text-terminal-green/70">{pm.name} [{pm.year}]</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-terminal-green/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-terminal-green/50"
                        style={{ width: `${pm.rating}%` }}
                      />
                    </div>
                    <span className={pm.color}>{pm.rating}%</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between font-mono text-sm pt-2 border-t border-terminal-green">
                <span className="text-terminal-green font-bold">STARMER_K [NOW]</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-terminal-green/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${latestPoll?.approval_rating || 0}%` }}
                    />
                  </div>
                  <span className="text-red-500 font-bold">
                    {latestPoll?.approval_rating?.toFixed(0) || '--'}%
                  </span>
                </div>
              </div>
            </div>
          </TerminalBox>

          {/* Recent Polls Feed */}
          <TerminalBox title="live_feed.log">
            <div className="font-mono text-sm text-terminal-green mb-4">
              {'>'} RECENT POLL DATA STREAM
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-track-terminal-dark scrollbar-thumb-terminal-green/30">
              {history?.polls.slice(-8).reverse().map((poll, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between font-mono text-xs border-b border-terminal-green/10 pb-2"
                >
                  <div className="text-terminal-green/60">
                    [{format(new Date(poll.date), 'MM/dd')}] {poll.pollster?.toUpperCase().slice(0, 10) || 'UNKNOWN'}
                  </div>
                  <div className="flex gap-4">
                    <span className="text-terminal-green">+{poll.approval_rating?.toFixed(0)}%</span>
                    <span className="text-red-500">-{poll.disapproval_rating?.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
              {(!history || history.polls.length === 0) && (
                <div className="font-mono text-terminal-green/50 text-center py-4">
                  {'>'} NO DATA FEED AVAILABLE_
                </div>
              )}
            </div>
            <div className="mt-4 font-mono text-xs text-terminal-green/40">
              {'>'} END OF FEED // REFRESH: 60s
            </div>
          </TerminalBox>
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-8 border-t border-terminal-green/30 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-terminal-green/50">
            <div>
              {'>'} LAST UPDATE: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')} UTC
            </div>
            <div className="flex items-center gap-4">
              <span>SYS_LOAD: 42%</span>
              <span>|</span>
              <span>DATA_INTEGRITY: OK</span>
              <span>|</span>
              <span className="text-red-500 animate-pulse">CRISIS_MODE: ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
