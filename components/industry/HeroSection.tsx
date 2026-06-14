'use client';

interface HeroSectionProps {
  badge: string;
  title: string;
  highlightedText: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  badgeColor: string;
}

export default function HeroSection({
  badge,
  title,
  highlightedText,
  description,
  gradientFrom,
  gradientTo,
  badgeColor,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[50vh] flex items-center overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br from-${gradientFrom}-950/40 via-slate-950 to-${gradientTo}-950/40`}
      />
      <div
        className={`absolute top-40 -right-20 w-[600px] h-[600px] bg-${gradientFrom}-400/10 rounded-full blur-[120px]`}
      />
      <div
        className={`absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-${gradientTo}-400/10 rounded-full blur-[120px]`}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-${badgeColor}-400/30 bg-${badgeColor}-400/10 backdrop-blur-sm mb-6`}
          >
            <span
              className={`w-2 h-2 rounded-full bg-${badgeColor}-400 animate-pulse`}
            />
            <span
              className={`text-${badgeColor}-400 font-mono text-xs font-semibold tracking-wider`}
            >
              {badge}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[1.1] mb-4">
            {title}{' '}
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r from-${gradientFrom}-400 to-${gradientTo}-400`}
            >
              {highlightedText}
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
