// components/Logo.tsx
import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'light' | 'dark' | 'neon';
  hideTextOnMobile?: boolean;
  hideTaglineOnMobile?: boolean;
}

const sizeMap = {
  sm: { icon: 32, text: 'text-base', tagline: 'text-[7px]', gap: 'gap-2' },
  md: { icon: 40, text: 'text-xl', tagline: 'text-[8px]', gap: 'gap-2.5' },
  lg: { icon: 48, text: 'text-2xl', tagline: 'text-[9px]', gap: 'gap-3' },
  xl: { icon: 56, text: 'text-3xl', tagline: 'text-[10px]', gap: 'gap-3.5' },
  '2xl': { icon: 72, text: 'text-5xl', tagline: 'text-sm', gap: 'gap-4' },
};

const colors = {
  light: {
    primary: '#ffffff',
    secondary: '#00f2ff',
    text: '#f1f5f9',
    tagline: 'rgba(255,255,255,0.5)',
  },
  dark: {
    primary: '#e2e8f0',
    secondary: '#22d3ee',
    text: '#e2e8f0',
    tagline: 'rgba(148,163,184,0.6)',
  },
  neon: {
    primary: '#ffffff',
    secondary: '#22d3ee',
    text: '#f8fafc',
    tagline: 'rgba(148,163,184,0.6)',
  },
};

export function Logo({
  className = '',
  showText = true,
  showTagline = true,
  size = 'md',
  variant = 'neon',
  hideTextOnMobile = true,
  hideTaglineOnMobile = true,
}: LogoProps) {
  const { icon, text, tagline, gap } = sizeMap[size];
  const color = colors[variant];

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {/* Icon */}
      <div
        className="relative flex-shrink-0"
        style={{ width: icon, height: icon }}
      >
        {/* Subtle glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40"
          style={{
            background: `radial-gradient(circle, ${color.secondary}30 0%, transparent 70%)`,
          }}
        />
        <Image
          src="/logo.svg"
          alt="AnchorProof Logo"
          width={icon}
          height={icon}
          className="relative w-full h-full object-contain"
          priority
        />
      </div>

      {/* Text */}
      {showText && (
        <div
          className={`flex flex-col ${hideTextOnMobile ? 'hidden sm:flex' : ''}`}
        >
          <span
            className={`font-heading font-bold tracking-tight ${text}`}
            style={{ color: color.text }}
          >
            <span style={{ color: color.primary }}>Anchor</span>
            <span style={{ color: color.secondary }}>Proof</span>
          </span>

          {showTagline && (
            <span
              className={`font-mono uppercase tracking-[0.25em] ${tagline} ${hideTaglineOnMobile ? 'hidden sm:block' : ''}`}
              style={{ color: color.tagline }}
            >
              Enterprise Verifiable Auditing
            </span>
          )}
        </div>
      )}
    </div>
  );
}
