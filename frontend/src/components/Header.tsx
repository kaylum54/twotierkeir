'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  { label: 'FAILURES', href: '/failures', count: 147 },
  { label: 'BROKEN PROMISES', href: '/promises', count: 23 },
  { label: 'WORLD STAGE', href: '/world-stage' },
  { label: 'APPROVAL CRATER', href: '/polls' },
  { label: 'HALL OF SHAME', href: '/tier-list' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-gov-blue-dark">
      {/* Top alert banner */}
      <div className="bg-ink-black text-white text-sm py-1.5 px-4">
        <div className="container-wide flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-disaster rounded-full animate-pulse" />
            <span className="font-typewriter">DISASTER LEVEL: <span className="text-disaster font-bold">ELEVATED</span></span>
          </div>
          <div className="hidden sm:block font-typewriter">
            Days without incident: <span className="text-disaster font-bold">0</span>
          </div>
        </div>
      </div>

      {/* Yellow GOV.UK style band */}
      <div className="h-[10px] bg-highlight-yellow" />

      {/* Main header */}
      <div className="container-wide py-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Two Tier Keir Logo"
              width={48}
              height={48}
              className="group-hover:animate-wiggle-once"
            />
            <div>
              <h1 className="font-typewriter text-white text-xl md:text-2xl tracking-wide">
                TWOTIER KEIR
              </h1>
              <p className="text-gov-blue-light text-xs md:text-sm font-typewriter">
                Official Incompetence Monitoring Service
              </p>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-white hover:bg-gov-blue rounded">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation - Folder tabs style */}
        <nav className="hidden md:flex items-end gap-1 mt-4 -mb-[1px]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'relative px-4 py-2 font-typewriter text-sm transition-colors rounded-t-lg border-t-2 border-l border-r',
                  isActive
                    ? 'bg-paper-white text-ink-black border-gray-300 font-bold z-10'
                    : 'bg-paper-manila text-ink-grey border-gray-400 hover:bg-paper-beige hover:text-ink-black'
                )}
              >
                {item.label}
                {item.count && (
                  <span className={clsx(
                    'ml-2 px-1.5 py-0.5 text-xs rounded',
                    isActive ? 'bg-disaster text-white' : 'bg-gray-300 text-ink-grey'
                  )}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Border line under tabs */}
      <div className="hidden md:block h-[1px] bg-gray-300" />
    </header>
  );
}
