interface Feature {
  title: string;
  items: string[];
}

interface FeaturesGridProps {
  features: Feature[];
  gradientColor: string;
  title: string;
  highlightedText: string;
  subtitle: string;
}

export default function FeaturesGrid({
  features,
  gradientColor,
  title,
  highlightedText,
  subtitle,
}: FeaturesGridProps) {
  return (
    <section id="features" className="py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`text-${gradientColor}-400 font-mono text-xs font-semibold tracking-wider uppercase mb-4 block`}
          >
            Enterprise Capabilities
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            {title}{' '}
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r from-${gradientColor}-400 to-indigo-400`}
            >
              {highlightedText}
            </span>
          </h2>
          <p className="text-lg text-slate-400">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-cyan-400/30 transition-all duration-300 group"
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {feature.title}
              </h3>
              <ul className="space-y-3">
                {feature.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-2 text-slate-300"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-${gradientColor}-400`}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
