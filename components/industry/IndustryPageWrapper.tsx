import { ReactNode } from 'react';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeaturesGrid from './FeaturesGrid';
import UseCasesSection from './UseCasesSection';

interface IndustryConfig {
  design: 'vault' | 'clinic' | 'capitol' | 'shield';
  hero: {
    badge: string;
    badgeIcon: string;
    title: string;
    highlightedText: string;
    description: string;
    gradientFrom: string;
    gradientTo: string;
    badgeColor: string;
  };
  stats: Array<{ value: string; label: string; desc: string; icon: string }>;
  features: Array<{ icon: string; title: string; items: string[] }>;
  useCases: Array<{ icon: string; name: string; desc: string }>;
  chat: {
    title: string;
    subtitle: string;
    component: ReactNode;
    gradientColor: string;
  };
}

export default function IndustryPageWrapper(config: IndustryConfig) {
  const { design, hero, stats, features, useCases, chat } = config;

  const designClasses = {
    vault: 'bg-slate-950/90 border-amber-500/10',
    clinic: 'bg-slate-900/80 border-emerald-500/10',
    capitol: 'bg-slate-950/85 border-indigo-500/10',
    shield: 'bg-slate-900/85 border-blue-500/10',
  };

  const cardStyles = {
    vault: 'border-amber-500/20 hover:border-amber-500/40 shadow-amber-500/5',
    clinic:
      'border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/5',
    capitol:
      'border-indigo-500/20 hover:border-indigo-500/40 shadow-indigo-500/5',
    shield: 'border-blue-500/20 hover:border-blue-500/40 shadow-blue-500/5',
  };

  return (
    <main
      className={`min-h-screen ${designClasses[design]} transition-all duration-500`}
    >
      <HeroSection
        {...hero}
        design={design}
        cardStyle={cardStyles[design]}
        badgeIcon={hero.badgeIcon}
      />

      <section className="py-12 sm:py-16" id="chat">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center max-w-3xl mx-auto mb-8 sm:mb-10 p-6 rounded-2xl border ${cardStyles[design]}`}
          >
            <span
              className={`text-${chat.gradientColor}-400 font-mono text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-2 sm:mb-4 block`}
            >
              {chat.title}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {chat.subtitle}
            </h2>
            <div className="w-20 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30" />
          </div>
          {chat.component}
        </div>
      </section>

      <StatsSection
        stats={stats}
        gradientColor={hero.gradientFrom}
        design={design}
      />

      <FeaturesGrid
        features={features}
        gradientColor={hero.gradientFrom}
        highlightedText={hero.highlightedText}
        subtitle={hero.description}
        design={design}
      />

      <UseCasesSection
        useCases={useCases}
        gradientColor={hero.gradientFrom}
        title={`${hero.badge.split(' ')[0]} Use Cases`}
        design={design}
      />
    </main>
  );
}
