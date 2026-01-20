'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  { label: 'FAILURES', href: '/failures' },
  { label: 'PROMISES', href: '/promises' },
  { label: 'HALL OF SHAME', href: '/tier-list' },
  { label: 'WALL OF COPE', href: '/wall-of-cope' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <button
            className="md:hidden p-2 text-white hover:bg-gov-blue rounded"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gov-blue">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'block px-4 py-3 font-typewriter text-sm transition-colors',
                    isActive
                      ? 'bg-gov-blue text-white font-bold'
                      : 'text-gov-blue-light hover:bg-gov-blue hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Desktop Navigation - Folder tabs style */}
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
