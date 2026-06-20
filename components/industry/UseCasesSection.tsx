// components/industry/UseCasesSection.tsx
'use client';

import * as Icons from 'lucide-react';

interface UseCase {
  icon: string;
  name: string;
  desc: string;
}

interface UseCasesSectionProps {
  useCases: UseCase[];
  gradientColor: string;
  title: string;
  design: 'vault' | 'clinic' | 'capitol' | 'shield';
}

export default function UseCasesSection({
  useCases,
  gradientColor,
  title,
  design,
}: UseCasesSectionProps) {
  const layouts = {
    vault: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
    clinic: 'grid-cols-1 sm:grid-cols-2 gap-6',
    capitol: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
    shield: 'grid-cols-1 sm:grid-cols-2 gap-6',
  };

  const borders = {
    vault: 'border-amber-500/20 hover:border-amber-500/40',
    clinic: 'border-emerald-500/20 hover:border-emerald-500/40',
    capitol: 'border-indigo-500/20 hover:border-indigo-500/40',
    shield: 'border-blue-500/20 hover:border-blue-500/40',
  };

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-slate-900/30 border-y border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className={`text-${gradientColor}-400 font-mono text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-3 sm:mb-4 block`}>
            Industry Applications
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {title}
          </h2>
          <div className="w-24 h-1 mx-auto mt-6 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30" />
        </div>

        <div className={`grid ${layouts[design]}`}>
          {useCases.map((useCase, i) => {
            const Icon = (Icons as any)[useCase.icon];
            return (
              <div
                key={i}
                className={`p-6 rounded-2xl border ${borders[design]} bg-slate-900/50 transition-all duration-300 group hover:bg-slate-900/70`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${gradientColor}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {Icon && <Icon className={`w-5 h-5 text-${gradientColor}-400`} />}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {useCase.name}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {useCase.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}