interface UseCase {
  name: string;
  desc: string;
  icon: string;
}

interface UseCasesSectionProps {
  useCases: UseCase[];
  gradientColor: string;
  title: string;
}

export default function UseCasesSection({
  useCases,
  gradientColor,
  title,
}: UseCasesSectionProps) {
  return (
    <section className="py-28 bg-slate-900/30 border-y border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`text-${gradientColor}-400 font-mono text-xs font-semibold tracking-wider uppercase mb-4 block`}
          >
            Industry Applications
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-cyan-400/30 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {useCase.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {useCase.name}
              </h3>
              <p className="text-sm text-slate-400">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
