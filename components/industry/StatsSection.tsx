interface Stat {
  value: string;
  label: string;
  desc: string;
}

interface StatsSectionProps {
  stats: Stat[];
  gradientColor: string;
}

export default function StatsSection({
  stats,
  gradientColor,
}: StatsSectionProps) {
  return (
    <section className="py-20 border-y border-slate-800 bg-slate-900/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300 group"
            >
              <div
                className={`text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-${gradientColor}-400 to-indigo-400 mb-3 group-hover:scale-105 transition-transform duration-300`}
              >
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-white mb-2">
                {stat.label}
              </div>
              <div className="text-sm text-slate-400">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
