// components/industry/HeroSection.tsx
'use client';

import * as Icons from 'lucide-react';

interface HeroSectionProps {
  badge: string;
  badgeIcon: string;
  title: string;
  highlightedText: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  badgeColor: string;
  design: 'vault' | 'clinic' | 'capitol' | 'shield';
  cardStyle: string;
}

export default function HeroSection({
  badge,
  badgeIcon,
  title,
  highlightedText,
  description,
  gradientFrom,
  gradientTo,
  badgeColor,
  design,
  cardStyle,
}: HeroSectionProps) {
  const layoutClasses = {
    vault: 'py-24 md:py-32',
    clinic: 'py-20 md:py-28',
    capitol: 'py-24 md:py-32',
    shield: 'py-20 md:py-28',
  };

  const accentElements = {
    vault: (
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
    ),
    clinic: (
      <div className="absolute top-1/2 left-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
    ),
    capitol: (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
    ),
    shield: (
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
    ),
  };

  // Get icon from string name
  const IconComponent = (Icons as any)[badgeIcon];

  return (
    <section className={`relative ${layoutClasses[design]} flex items-center overflow-hidden`}>
      {accentElements[design]}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`max-w-4xl mx-auto text-center p-8 rounded-3xl border ${cardStyle} backdrop-blur-sm bg-slate-900/20`}>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-${badgeColor}-400/30 bg-${badgeColor}-400/10 backdrop-blur-sm mb-6`}>
            {IconComponent && <IconComponent className={`w-4 h-4 text-${badgeColor}-400`} />}
            <span className={`text-${badgeColor}-400 font-mono text-xs font-semibold tracking-wider`}>
              {badge}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
            {title}{' '}
            <span className={`bg-clip-text text-transparent bg-gradient-to-r from-${gradientFrom}-400 to-${gradientTo}-400`}>
              {highlightedText}
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-${gradientFrom}-400 animate-pulse`} />
              <span>Enterprise Grade</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-${gradientTo}-400`} />
              <span>Cryptographically Verified</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-${badgeColor}-400`} />
              <span>Tamper-Proof</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}