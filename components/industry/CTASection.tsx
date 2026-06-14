interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  gradientColor: string;
}

export default function CTASection({
  title,
  description,
  buttonText,
  gradientColor,
}: CTASectionProps) {
  return (
    <section className="py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative rounded-3xl overflow-hidden bg-gradient-to-r from-${gradientColor}-600/20 via-indigo-600/20 to-purple-600/20 border border-${gradientColor}-400/20 p-12 text-center`}
        >
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {title}
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
            <button className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
              {buttonText} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
