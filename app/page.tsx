import Hero from '@/components/sections/Hero';
import Liability from '@/components/sections/Liability';
import Primitives from '@/components/sections/Primitives'; // 💡 Newly injected core primitives matrix
import Features from '@/components/sections/Features';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Liability />
      <Primitives />
      <Features />
    </main>
  );
}
