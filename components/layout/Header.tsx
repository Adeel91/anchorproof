'use client';

import { useEffect, useState, useRef } from 'react';
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
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
    if (onClick) onClick();
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group relative px-3 py-2"
    >
      <span className="relative z-10 text-xs font-mono font-bold uppercase tracking-widest text-slate-300 group-hover:text-cyan-400 transition-colors">
        {children}
      </span>
      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-400 group-hover:w-full group-hover:left-0 transition-all duration-500" />
    </Link>
  );
};

const MobileNavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
    if (onClick) onClick();
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="block px-4 py-3 text-sm font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors rounded-lg"
    >
      {children}
    </Link>
  );
};

export default function Header() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const [address, setAddress] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileIndustriesOpen, setIsMobileIndustriesOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const prevPathnameRef = useRef<string | null>(null);
  const addressRef = useRef<string | null>(null);

  useEffect(() => {
    const newAddress = currentAccount?.address || null;
    if (addressRef.current !== newAddress) {
      addressRef.current = newAddress;
      setTimeout(() => {
        setAddress(newAddress);
      }, 0);
    }
  }, [currentAccount?.address]);

  useEffect(() => {
    const newAddress = currentAccount?.address || null;
    if (addressRef.current !== newAddress) {
      addressRef.current = newAddress;
      setAddress(newAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isMenuButton = menuButtonRef.current?.contains(target);
      const isMobileMenu = mobileMenuRef.current?.contains(target);

      if (isMobileMenuOpen && !isMenuButton && !isMobileMenu) {
        setIsMobileMenuOpen(false);
        setIsMobileIndustriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

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
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setIsMobileMenuOpen(false);
      setIsMobileIndustriesOpen(false);
      setIsDropdownOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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
  const isDashboardPage = pathname.startsWith('/dashboard');

  const industries = [
    {
      name: 'BANKING',
      href: '/industry/banking',
      desc: 'FINANCIAL SERVICES',
      gradient: 'from-cyan-400 to-blue-400',
      lightColor: 'cyan',
      icon: (
        <svg
          className="w-5 h-5"
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
          className="w-5 h-5"
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
          className="w-5 h-5"
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
          className="w-5 h-5"
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
    ? [
        { label: 'LIABILITY', href: '#liability' },
        { label: 'PRIMITIVES', href: '#primitives' },
        { label: 'FEATURES', href: '#features' },
      ]
    : isIndustryPage
      ? [
          { label: 'FEATURES', href: '#features' },
          { label: 'USE CASES', href: '#use-cases' },
          { label: 'AI ASSISTANT', href: '#ai-assistant' },
        ]
      : [];

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200);
  };

  const closeAll = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileIndustriesOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setIsMobileIndustriesOpen(false);
    }
  };

  const toggleMobileIndustries = () => {
    setIsMobileIndustriesOpen(!isMobileIndustriesOpen);
  };

  const showNavigation = !isLoginPage && !isDashboardPage;
  const hasNavLinks = navLinks.length > 0;
  const isFullWidth = isDashboardPage;

  return (
    <header className="fixed top-0 inset-x-0 h-16 md:h-20 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl z-50">
      {isFullWidth ? (
        <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            onClick={closeAll}
            className="group flex items-center gap-2 md:gap-3 flex-shrink-0"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 group-hover:rotate-180 transition-all duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-black tracking-[0.15em] md:tracking-[0.2em] text-xs md:text-sm text-white">
                ANCHORPROOF
              </span>
              <span className="text-[6px] md:text-[8px] font-mono tracking-[0.2em] md:tracking-[0.3em] text-slate-500 hidden sm:block">
                VERIFIABLE MEMORY
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {isLoggedIn && (
              <div className="relative group/address hidden sm:block">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 blur-lg opacity-0 group-hover/address:opacity-30 transition-opacity" />
                <div className="relative flex items-center gap-2 bg-slate-900/50 backdrop-blur border border-slate-700 rounded-lg px-2 md:px-3 py-1 md:py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[8px] md:text-[10px] font-mono font-bold tracking-widest text-cyan-400">
                    {displayAddress}
                  </span>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm"
            >
              <span className="hidden sm:inline">SIGN OUT</span>
              <span className="sm:hidden">✕</span>
            </Button>
          </div>
        </div>
      ) : (
        <Container className="h-full flex items-center justify-between px-3 sm:px-4">
          {/* Logo - Left */}
          <Link
            href="/"
            onClick={closeAll}
            className="group flex items-center gap-2 md:gap-3 flex-shrink-0"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 group-hover:rotate-180 transition-all duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-black tracking-[0.15em] md:tracking-[0.2em] text-xs md:text-sm text-white">
                ANCHORPROOF
              </span>
              <span className="text-[6px] md:text-[8px] font-mono tracking-[0.2em] md:tracking-[0.3em] text-slate-500 hidden xs:block">
                VERIFIABLE MEMORY
              </span>
            </div>
          </Link>

          {/* Navigation - Center */}
          {showNavigation && (
            <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
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
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[500px]">
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
                            onClick={closeAll}
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
                      key={item.label}
                      href={item.href}
                      onClick={closeAll}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </>
              )}

              {isLoggedIn && (
                <>
                  <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
                  <NavLink href="/dashboard" onClick={closeAll}>
                    DASHBOARD
                  </NavLink>
                </>
              )}
            </nav>
          )}

          {/* Right side - CTA/Login/Address */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-auto">
            {isLoggedIn ? (
              <>
                <div className="relative group/address hidden sm:block">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 blur-lg opacity-0 group-hover/address:opacity-30 transition-opacity" />
                  <div className="relative flex items-center gap-2 bg-slate-900/50 backdrop-blur border border-slate-700 rounded-lg px-2 md:px-3 py-1 md:py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[8px] md:text-[10px] font-mono font-bold tracking-widest text-cyan-400">
                      {displayAddress}
                    </span>
                  </div>
                </div>

                <div className="sm:hidden w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm"
                >
                  <span className="hidden sm:inline">SIGN OUT</span>
                  <span className="sm:hidden">✕</span>
                </Button>
              </>
            ) : (
              !isLoginPage && (
                <Link href="/login" onClick={closeAll}>
                  <Button
                    variant="primary"
                    className="h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">LAUNCH PORTAL</span>
                    <span className="sm:hidden">PORTAL</span>
                  </Button>
                </Link>
              )
            )}

            {!isDashboardPage && !isLoginPage && (
              <button
                ref={menuButtonRef}
                onClick={toggleMobileMenu}
                className="lg:hidden flex items-center justify-end w-8 h-8 rounded-lg hover:bg-slate-800/50 transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        </Container>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && !isDashboardPage && !isLoginPage && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden fixed top-16 md:top-20 left-0 right-0 bottom-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/50 overflow-y-auto z-40 min-h-screen"
        >
          <div className="p-4 space-y-1">
            <button
              onClick={toggleMobileIndustries}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors rounded-lg"
            >
              <span>INDUSTRIES</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isMobileIndustriesOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isMobileIndustriesOpen && (
              <div className="ml-4 space-y-1 border-l border-slate-700/50 pl-3">
                {industries.map((industry) => (
                  <MobileNavLink
                    key={industry.name}
                    href={industry.href}
                    onClick={closeAll}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-${industry.lightColor}-400`}>
                        {industry.icon}
                      </span>
                      <div>
                        <div className="text-sm font-bold">{industry.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {industry.desc}
                        </div>
                      </div>
                    </div>
                  </MobileNavLink>
                ))}
              </div>
            )}

            {hasNavLinks && (
              <>
                <div className="h-px bg-slate-800/50 my-2" />
                {navLinks.map((item) => (
                  <MobileNavLink
                    key={item.label}
                    href={item.href}
                    onClick={closeAll}
                  >
                    {item.label}
                  </MobileNavLink>
                ))}
              </>
            )}

            {isLoggedIn && (
              <>
                <div className="h-px bg-slate-800/50 my-2" />
                <MobileNavLink href="/dashboard" onClick={closeAll}>
                  DASHBOARD
                </MobileNavLink>
              </>
            )}

            {isLoggedIn && (
              <div className="mt-4 px-4 py-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono text-cyan-400">
                    {displayAddress}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
