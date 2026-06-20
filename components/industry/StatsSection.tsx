// components/industry/StatsSection.tsx
'use client';

import * as Icons from 'lucide-react';

interface Stat {
  value: string;
  label: string;
  desc: string;
  icon: string;
}

interface StatsSectionProps {
  stats: Stat[];
  gradientColor: string;
  design: 'vault' | 'clinic' | 'capitol' | 'shield';
}

export default function StatsSection({ stats, gradientColor, design }: StatsSectionProps) {
  const layouts = {
    vault: 'grid-cols-1 md:grid-cols-3 gap-8',
    clinic: 'grid-cols-1 md:grid-cols-3 gap-6',
    capitol: 'grid-cols-1 md:grid-cols-3 gap-8',
    shield: 'grid-cols-1 md:grid-cols-3 gap-6',
  };

  const backgrounds = {
    vault: 'bg-slate-900/60 border-amber-500/10',
    clinic: 'bg-slate-900/50 border-emerald-500/10',
    capitol: 'bg-slate-900/60 border-indigo-500/10',
    shield: 'bg-slate-900/50 border-blue-500/10',
  };

  return (
    <section className={`py-16 border-y ${backgrounds[design]}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${layouts[design]}`}>
          {stats.map((stat, i) => {
            const Icon = (Icons as any)[stat.icon];
            return (
              <div
                key={i}
                className="text-center p-6 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm hover:border-cyan-400/20 transition-all duration-300 group"
              >
                <div className="flex justify-center mb-3">
                  <div className={`w-12 h-12 rounded-full bg-${gradientColor}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {Icon && <Icon className={`w-6 h-6 text-${gradientColor}-400`} />}
                  </div>
                </div>
                <div className={`text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-${gradientColor}-400 to-${gradientColor === 'amber' ? 'cyan' : gradientColor === 'emerald' ? 'teal' : gradientColor === 'indigo' ? 'purple' : 'indigo'}-400 mb-2 group-hover:scale-105 transition-transform duration-300`}>
                  {stat.value}
                </div>
                <div className="text-base sm:text-lg font-semibold text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-xs sm:text-sm text-slate-400">{stat.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}