'use client';

interface FollowCTAProps {
  variant?: 'banner' | 'compact';
}

export default function FollowCTA({ variant = 'banner' }: FollowCTAProps) {
  const handleFollow = () => {
    window.open('https://x.com/starmertimes', '_blank');
  };

  if (variant === 'compact') {
    return (
      <div className="bg-ink-black text-white py-4 px-6 rounded-lg flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">𝕏</span>
          <span className="font-typewriter text-sm">
            Follow <span className="text-highlight-yellow font-bold">@starmertimes</span> for daily updates
          </span>
        </div>
        <button
          onClick={handleFollow}
          className="bg-white text-ink-black px-4 py-2 rounded font-typewriter text-sm font-bold
                   hover:bg-highlight-yellow transition-colors"
        >
          FOLLOW
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gov-blue-dark text-white py-8">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-ink-black rounded-full flex items-center justify-center">
              <span className="text-3xl">𝕏</span>
            </div>
            <div>
              <h3 className="font-typewriter text-xl mb-1">STAY INFORMED</h3>
              <p className="text-gov-blue-light">
                Follow <span className="text-highlight-yellow font-bold">@starmertimes</span> for the latest updates on government incompetence
              </p>
            </div>
          </div>
          <button
            onClick={handleFollow}
            className="bg-white text-gov-blue-dark px-6 py-3 rounded font-typewriter font-bold
                     hover:bg-highlight-yellow hover:text-ink-black transition-colors
                     flex items-center gap-2"
          >
            <span className="text-xl">𝕏</span>
            FOLLOW @STARMERTIMES
          </button>
        </div>
      </div>
    </div>
  );
}
