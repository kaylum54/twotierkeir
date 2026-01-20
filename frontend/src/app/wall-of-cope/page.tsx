'use client';

import { useState, useEffect } from 'react';
import { CopeCard } from './components/CopeCard';
import { CopeOfTheWeek } from './components/CopeOfTheWeek';
import { CopeSubmitForm } from './components/CopeSubmitForm';
import { CopeFilters } from './components/CopeFilters';
import FollowCTA from '@/components/FollowCTA';

interface CopeEntry {
  id: number;
  content: string;
  source_url?: string;
  source_platform: string;
  source_username?: string;
  category: string;
  cope_level: number;
  votes: number;
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Cope', emoji: '🧠' },
  { id: 'denial', label: 'Denial', emoji: '🙈' },
  { id: 'deflection', label: 'Deflection', emoji: '👉' },
  { id: 'whatabout', label: 'Whataboutism', emoji: '🔄' },
  { id: 'copium', label: 'Pure Copium', emoji: '💨' },
];

// Mock data for demonstration - will be replaced by API calls
const MOCK_ENTRIES: CopeEntry[] = [
  {
    id: 1,
    content: "It's only been 6 months, you can't judge his entire tenure yet! Give him time!",
    source_platform: 'x',
    source_username: 'definitely_not_a_bot',
    category: 'denial',
    cope_level: 8,
    votes: 142,
    created_at: '2025-01-15T10:30:00Z',
  },
  {
    id: 2,
    content: "But what about the 14 years of Tory rule? This is all their fault, Starmer inherited this mess!",
    source_platform: 'reddit',
    source_username: 'UKPoliticsEnjoyer',
    category: 'whatabout',
    cope_level: 9,
    votes: 98,
    created_at: '2025-01-14T15:20:00Z',
  },
  {
    id: 3,
    content: "The polls are just a right-wing media conspiracy. Real people actually love him.",
    source_platform: 'x',
    source_username: 'LabourForever2024',
    category: 'copium',
    cope_level: 10,
    votes: 234,
    created_at: '2025-01-13T08:45:00Z',
  },
  {
    id: 4,
    content: "Actually, cutting winter fuel payments was a GOOD thing because it forces pensioners to be more resilient.",
    source_platform: 'facebook',
    category: 'deflection',
    cope_level: 9,
    votes: 87,
    created_at: '2025-01-12T20:15:00Z',
  },
  {
    id: 5,
    content: "You don't understand economics. Sometimes you have to make things worse to make them better!",
    source_platform: 'x',
    source_username: 'EconomicsExpert99',
    category: 'copium',
    cope_level: 7,
    votes: 156,
    created_at: '2025-01-11T12:00:00Z',
  },
  {
    id: 6,
    content: "He never actually promised not to raise taxes, you're taking his words out of context!",
    source_platform: 'reddit',
    source_username: 'ContextMaster',
    category: 'denial',
    cope_level: 8,
    votes: 203,
    created_at: '2025-01-10T17:30:00Z',
  },
];

const MOCK_FEATURED: CopeEntry = {
  id: 99,
  content: "The freebies scandal is actually a good thing because it shows he's relatable and down-to-earth like normal working people who get free Taylor Swift tickets and designer clothes.",
  source_platform: 'x',
  source_username: 'TotallyReasonable',
  category: 'copium',
  cope_level: 10,
  votes: 567,
  created_at: '2025-01-08T09:00:00Z',
};

export default function WallOfCopePage() {
  const [entries, setEntries] = useState<CopeEntry[]>([]);
  const [featured, setFeatured] = useState<CopeEntry | null>(null);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('votes');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
    fetchFeatured();
  }, [category, sortBy]);

  const fetchEntries = async () => {
    setIsLoading(true);

    // Try to fetch from API, fall back to mock data
    try {
      const params = new URLSearchParams({
        sort_by: sortBy,
        ...(category !== 'all' && { category }),
      });

      const res = await fetch(`/api/cope?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      } else {
        // Use mock data as fallback
        let filtered = [...MOCK_ENTRIES];
        if (category !== 'all') {
          filtered = filtered.filter((e) => e.category === category);
        }
        if (sortBy === 'votes') {
          filtered.sort((a, b) => b.votes - a.votes);
        } else if (sortBy === 'recent') {
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortBy === 'cope_level') {
          filtered.sort((a, b) => b.cope_level - a.cope_level);
        }
        setEntries(filtered);
      }
    } catch {
      // Use mock data on error
      let filtered = [...MOCK_ENTRIES];
      if (category !== 'all') {
        filtered = filtered.filter((e) => e.category === category);
      }
      if (sortBy === 'votes') {
        filtered.sort((a, b) => b.votes - a.votes);
      } else if (sortBy === 'recent') {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sortBy === 'cope_level') {
        filtered.sort((a, b) => b.cope_level - a.cope_level);
      }
      setEntries(filtered);
    }

    setIsLoading(false);
  };

  const fetchFeatured = async () => {
    try {
      const res = await fetch('/api/cope/featured');
      if (res.ok) {
        const data = await res.json();
        setFeatured(data);
      } else {
        setFeatured(MOCK_FEATURED);
      }
    } catch {
      setFeatured(MOCK_FEATURED);
    }
  };

  const handleVote = async (id: number) => {
    try {
      await fetch(`/api/cope/${id}/vote`, { method: 'POST' });
    } catch {
      // Vote locally even if API fails
    }

    // Optimistic update
    setEntries(
      entries.map((e) => (e.id === id ? { ...e, votes: e.votes + 1 } : e))
    );
  };

  return (
    <div className="min-h-screen bg-paper-beige">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-pink-700 text-white py-8">
        <div className="container-wide text-center">
          <h1 className="font-typewriter text-4xl mb-2">🧠 WALL OF COPE 🧠</h1>
          <p className="text-purple-200 max-w-xl mx-auto">
            A curated collection of the finest mental gymnastics from Starmer&apos;s
            most dedicated defenders. Updated weekly.
          </p>
          <p className="text-sm mt-4 opacity-70 italic">
            &ldquo;It&apos;s not a disaster, it&apos;s a... strategic challenge&rdquo;
          </p>
        </div>
      </div>

      <div className="container-wide py-8">
        {/* Cope of the Week */}
        {featured && <CopeOfTheWeek entry={featured} />}

        {/* Filters and Submit */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <CopeFilters
            categories={CATEGORIES}
            selectedCategory={category}
            onCategoryChange={setCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <button
            onClick={() => setShowSubmitForm(true)}
            className="bg-disaster text-white px-6 py-2 rounded font-typewriter
                     hover:bg-disaster-dark transition-colors"
          >
            📤 SUBMIT COPE
          </button>
        </div>

        {/* Cope Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl">🧠</div>
            <p className="mt-4 font-typewriter">Loading copium...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <CopeCard
                key={entry.id}
                entry={entry}
                onVote={() => handleVote(entry.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && entries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🏜️</p>
            <p className="font-typewriter text-xl">No cope found</p>
            <p className="text-gray-500 mt-2">Be the first to submit some!</p>
          </div>
        )}

        {/* Stats bar */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">{entries.length}</div>
              <div className="text-sm text-gray-500">Total Copes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {entries.reduce((sum, e) => sum + e.votes, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Votes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {entries.length > 0
                  ? (entries.reduce((sum, e) => sum + e.cope_level, 0) / entries.length).toFixed(1)
                  : 0}
              </div>
              <div className="text-sm text-gray-500">Avg Cope Level</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {new Set(entries.map((e) => e.category)).size}
              </div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
          </div>
        </div>

        {/* Follow CTA */}
        <div className="mt-12">
          <FollowCTA variant="compact" />
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitForm && (
        <CopeSubmitForm
          onClose={() => setShowSubmitForm(false)}
          onSubmit={() => {
            setShowSubmitForm(false);
            fetchEntries();
          }}
        />
      )}
    </div>
  );
}
