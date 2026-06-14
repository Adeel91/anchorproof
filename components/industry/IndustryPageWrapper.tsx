import { ReactNode } from 'react';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeaturesGrid from './FeaturesGrid';
import UseCasesSection from './UseCasesSection';
import CTASection from './CTASection';

interface IndustryConfig {
  hero: {
    badge: string;
    title: string;
    highlightedText: string;
    description: string;
    gradientFrom: string;
    gradientTo: string;
    badgeColor: string;
  };
  stats: Array<{ value: string; label: string; desc: string }>;
  features: Array<{ title: string; items: string[] }>;
  useCases: Array<{ name: string; desc: string; icon: string }>;
  cta: {
    title: string;
    description: string;
    buttonText: string;
    gradientColor: string;
  };
  chat: {
    title: string;
    subtitle: string;
    component: ReactNode;
    gradientColor: string;
  };
}

export default function IndustryPageWrapper(config: IndustryConfig) {
  return (
    <main className="min-h-screen bg-slate-950">
      <HeroSection {...config.hero} />

      <section className="py-16" id="chat">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span
              className={`text-${config.chat.gradientColor}-400 font-mono text-xs font-semibold tracking-wider uppercase mb-4 block`}
            >
              {config.chat.title}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {config.chat.subtitle}
            </h2>
          </div>
          {config.chat.component}
        </div>
      </section>

      <StatsSection
        stats={config.stats}
        gradientColor={config.hero.gradientFrom}
      />
      <FeaturesGrid
        features={config.features}
        gradientColor={config.hero.gradientFrom}
        title="Built for"
        highlightedText={config.hero.highlightedText}
        subtitle={config.hero.description}
      />
      <UseCasesSection
        useCases={config.useCases}
        gradientColor={config.hero.gradientFrom}
        title={`${config.hero.badge.split(' ')[0]} Use Cases`}
      />
      <CTASection {...config.cta} gradientColor={config.hero.gradientFrom} />
    </main>
  );
}
