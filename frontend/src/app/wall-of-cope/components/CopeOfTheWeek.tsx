'use client';

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

interface CopeOfTheWeekProps {
  entry: CopeEntry;
}

export const CopeOfTheWeek = ({ entry }: CopeOfTheWeekProps) => {
  return (
    <div className="mb-12">
      <div className="text-center mb-4">
        <span
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black
                        px-6 py-2 rounded-full font-typewriter text-sm inline-block
                        shadow-lg transform -rotate-2"
        >
          🏆 COPE OF THE WEEK 🏆
        </span>
      </div>

      <div
        className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-8
                      text-white shadow-2xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-4 left-4 text-6xl">🧠</div>
          <div className="absolute bottom-4 right-4 text-6xl">💨</div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                          text-9xl"
          >
            🏆
          </div>
        </div>

        <div className="relative z-10">
          <blockquote className="text-2xl md:text-3xl italic font-serif text-center mb-6">
            &ldquo;{entry.content}&rdquo;
          </blockquote>

          <div className="flex flex-wrap justify-center items-center gap-4 text-purple-200">
            {entry.source_username && <span>— @{entry.source_username}</span>}
            <span>•</span>
            <span>Cope Level: {entry.cope_level}/10</span>
            <span>•</span>
            <span>🧠 {entry.votes} votes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
