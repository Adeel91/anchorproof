'use client';

import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: string;
  title: string;
  items: string[];
}

interface FeaturesGridProps {
  features: Feature[];
  gradientColor: string;
  highlightedText: string;
  subtitle: string;
  design: 'vault' | 'clinic' | 'capitol' | 'shield';
}

type IconMap = Record<string, LucideIcon>;

export default function FeaturesGrid({
  features,
  gradientColor,
  highlightedText,
  subtitle,
  design,
}: FeaturesGridProps) {
  const layouts = {
    vault: 'grid-cols-1 lg:grid-cols-3 gap-8',
    clinic: 'grid-cols-1 md:grid-cols-3 gap-6',
    capitol: 'grid-cols-1 md:grid-cols-3 gap-8',
    shield: 'grid-cols-1 md:grid-cols-3 gap-6',
  };

  const borders = {
    vault: 'border-amber-500/20 hover:border-amber-500/40',
    clinic: 'border-emerald-500/20 hover:border-emerald-500/40',
    capitol: 'border-indigo-500/20 hover:border-indigo-500/40',
    shield: 'border-blue-500/20 hover:border-blue-500/40',
  };

  const getIcon = (iconName: string): LucideIcon | undefined => {
    const iconMap = Icons as unknown as IconMap;
    return iconMap[iconName];
  };

  return (
    <section id="features" className="py-16 sm:py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span
            className={`text-${gradientColor}-400 font-mono text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-3 sm:mb-4 block`}
          >
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Built for{' '}
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r from-${gradientColor}-400 to-${gradientColor === 'amber' ? 'cyan' : gradientColor === 'emerald' ? 'teal' : gradientColor === 'indigo' ? 'purple' : 'indigo'}-400`}
            >
              {highlightedText}
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="w-24 h-1 mx-auto mt-6 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30" />
        </div>

        <div className={`grid ${layouts[design]}`}>
          {features.map((feature, i) => {
            const Icon = getIcon(feature.icon);
            return (
              <div
                key={i}
                className={`p-6 sm:p-8 rounded-2xl border ${borders[design]} bg-slate-900/30 transition-all duration-300 group hover:bg-slate-900/50`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {Icon && (
                    <Icon className={`w-6 h-6 text-${gradientColor}-400`} />
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                  {feature.title}
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {feature.items.map((item, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-xs sm:text-sm text-slate-300"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-${gradientColor}-400 mt-1.5 flex-shrink-0`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
