'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

const NavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link href={href} onClick={onClick} className="group relative px-3 py-2">
    <span className="relative z-10 text-xs font-mono font-bold uppercase tracking-widest text-slate-300 group-hover:text-cyan-400 transition-colors">
      {children}
    </span>
    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-400 group-hover:w-full group-hover:left-0 transition-all duration-500" />
  </Link>
);

export default function Header() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const [address, setAddress] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevAddressRef = useRef<string | null>(null);

  const updateSessionCookie = useCallback((suiAddress: string | null) => {
    if (suiAddress) {
      document.cookie = `anchorproof-session=${suiAddress}; path=/; max-age=604800; SameSite=Lax`;
    } else {
      document.cookie =
        'anchorproof-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, []);

  useEffect(() => {
    const newAddress = currentAccount?.address || null;

    if (prevAddressRef.current !== newAddress) {
      prevAddressRef.current = newAddress;
      updateSessionCookie(newAddress);
      requestAnimationFrame(() => {
        setAddress(newAddress);
      });
    }
  }, [currentAccount?.address, updateSessionCookie]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogout = async () => {
    disconnectWallet();
    document.cookie =
      'anchorproof-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
  };

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';
  const isHomePage = pathname === '/';
  const isIndustryPage = pathname.startsWith('/industry/');
  const isLoginPage = pathname === '/login';
  const isLoggedIn = !!address;

  const industries = [
    {
      name: 'BANKING',
      href: '/industry/banking',
      desc: 'FINANCIAL SERVICES',
      gradient: 'from-cyan-400 to-blue-400',
      lightColor: 'cyan',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M6 10v8h12v-8M4 4h16v2H4V4zM8 14h8M12 10v4"
          />
        </svg>
      ),
    },
    {
      name: 'HEALTHCARE',
      href: '/industry/healthcare',
      desc: 'LIFE SCIENCES',
      gradient: 'from-emerald-400 to-teal-400',
      lightColor: 'emerald',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.5 12.75l6 6 9-13.5M12 6v12m-6-6h12"
          />
        </svg>
      ),
    },
    {
      name: 'INSURANCE',
      href: '/industry/insurance',
      desc: 'RISK MANAGEMENT',
      gradient: 'from-blue-400 to-indigo-400',
      lightColor: 'blue',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      ),
    },
    {
      name: 'GOVERNMENT',
      href: '/industry/government',
      desc: 'PUBLIC SECTOR',
      gradient: 'from-purple-400 to-pink-400',
      lightColor: 'purple',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 21h18M5 12v7m14-7v7M5 7l7-4 7 4M9 12v4m6-4v4M12 4v4"
          />
        </svg>
      ),
    },
  ];

  const navLinks = isHomePage
    ? ['LIABILITY', 'ARCHITECTURE', 'SPECIFICATIONS']
    : isIndustryPage
      ? ['FEATURES', 'USE CASES', 'AI ASSISTANT']
      : [];

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200);
  };

  const closeDropdown = () => setIsDropdownOpen(false);

  const showNavigation = !isLoginPage;
  const hasNavLinks = navLinks.length > 0;

  return (
    <header className="fixed top-0 inset-x-0 h-20 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl z-50">
      <Container className="h-full flex items-center justify-between">
        <Link
          href="/"
          onClick={closeDropdown}
          className="group flex items-center gap-3"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 group-hover:rotate-180 transition-all duration-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-black tracking-[0.2em] text-sm text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyan-400 transition-all">
              ANCHORPROOF
            </span>
            <span className="text-[8px] font-mono tracking-[0.3em] text-slate-500">
              VERIFIABLE MEMORY
            </span>
          </div>
        </Link>

        {showNavigation && (
          <nav className="hidden lg:flex items-center gap-6">
            <div
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative"
            >
              <button className="relative px-4 py-2 rounded-lg group/btn">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-indigo-500/0 group-hover/btn:from-cyan-500/10 group-hover/btn:via-cyan-500/5 group-hover/btn:to-indigo-500/10 transition-all duration-500" />
                <div className="relative flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300 group-hover/btn:text-cyan-400 transition-colors">
                    INDUSTRIES
                  </span>
                  <svg
                    className={`w-3 h-3 text-slate-400 transition-all duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[500px] transition-all duration-500 transform origin-top opacity-100 visible translate-y-0">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-20 blur-xl" />
                  <div className="relative bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="px-6 py-4 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border-b border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-mono font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                            Enterprise Solutions
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Industry-specific compliance frameworks
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-2 gap-3">
                      {industries.map((industry) => (
                        <Link
                          key={industry.name}
                          href={industry.href}
                          onClick={closeDropdown}
                          className="group/card relative overflow-hidden rounded-xl border border-slate-700/50 hover:border-transparent transition-all duration-300 hover:shadow-2xl"
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${industry.gradient} opacity-0 group-hover/card:opacity-10 transition-opacity duration-500`}
                          />
                          <div className="relative p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className={`text-${industry.lightColor}-400 group-hover/card:scale-110 transition-transform duration-300`}
                              >
                                {industry.icon}
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center group-hover/card:bg-white/10 transition-colors">
                                <svg
                                  className="w-4 h-4 text-slate-500 group-hover/card:text-cyan-400 transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>
                            <div
                              className={`text-xs font-mono font-bold text-white group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r ${industry.gradient} transition-all`}
                            >
                              {industry.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono tracking-wider mt-1">
                              {industry.desc}
                            </div>
                            <div
                              className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${industry.gradient} transform scale-x-0 group-hover/card:scale-x-100 transition-transform duration-500 origin-left`}
                            />
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="px-6 py-3 bg-slate-800/30 border-t border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">
                          All conversations cryptographically verified
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-[10px] text-cyan-400 font-mono">
                            LIVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasNavLinks && (
              <>
                <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
                {navLinks.map((item) => (
                  <NavLink
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    onClick={closeDropdown}
                  >
                    {item}
                  </NavLink>
                ))}
              </>
            )}

            {isLoggedIn && (
              <>
                <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
                <NavLink href="/dashboard" onClick={closeDropdown}>
                  DASHBOARD
                </NavLink>
              </>
            )}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {address ? (
            <>
              <div className="relative group/address">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 blur-lg opacity-0 group-hover/address:opacity-30 transition-opacity" />
                <div className="relative flex items-center gap-2 bg-slate-900/50 backdrop-blur border border-slate-700 rounded-lg px-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400">
                    {displayAddress}
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                SIGN OUT
              </Button>
            </>
          ) : (
            !isLoginPage && (
              <Link href="/login" onClick={closeDropdown}>
                <Button variant="primary">LAUNCH PORTAL</Button>
              </Link>
            )
          )}
        </div>
      </Container>
    </header>
  );
}
