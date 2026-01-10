import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink-black text-white">
      {/* Warning stripe */}
      <div className="h-2 warning-stripe" />

      <div className="container-wide py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👀</span>
              <span className="font-typewriter text-xl">TWOTIER KEIR</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md font-typewriter">
              OFFICIAL INCOMPETENCE MONITORING SERVICE
            </p>
            <p className="text-gray-500 text-xs mt-4 max-w-md">
              A satirical platform aggregating and commenting on news coverage of UK Prime Minister
              Keir Starmer. All commentary represents opinion and satire. We don&apos;t make this stuff up -
              we just present it with appropriate contempt.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-typewriter text-sm text-highlight-yellow mb-4">DEPARTMENTS</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/failures" className="text-gray-400 hover:text-white transition-colors font-typewriter">
                  → FAILURES
                </Link>
              </li>
              <li>
                <Link href="/promises" className="text-gray-400 hover:text-white transition-colors font-typewriter">
                  → EVIDENCE BOARD
                </Link>
              </li>
              <li>
                <Link href="/world-stage" className="text-gray-400 hover:text-white transition-colors font-typewriter">
                  → WORLD STAGE
                </Link>
              </li>
              <li>
                <Link href="/polls" className="text-gray-400 hover:text-white transition-colors font-typewriter">
                  → APPROVAL CRATER
                </Link>
              </li>
              <li>
                <Link href="/tier-list" className="text-gray-400 hover:text-white transition-colors font-typewriter">
                  → HALL OF SHAME
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-typewriter text-sm text-highlight-yellow mb-4">INTEL FEEDS</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-typewriter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X / TWITTER
                </a>
              </li>
            </ul>

            <div className="mt-6 p-3 bg-disaster/20 border border-disaster/40 rounded">
              <p className="text-xs text-gray-400 font-typewriter">
                THREAT LEVEL: <span className="text-disaster">ELEVATED</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: Just now (it&apos;s always just now)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs font-typewriter">
              &copy; {new Date().getFullYear()} TWOTIER KEIR. ALL DISASTERS RESERVED.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-600 font-typewriter">
                🔴 SITUATION: ONGOING
              </span>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-xs text-gray-600 font-typewriter">
                DAYS WITHOUT INCIDENT: 0
              </span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-700 mt-4">
            This is a satirical website. Content is aggregated for commentary. Please vote responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}
