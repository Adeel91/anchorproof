import Hero from '@/components/sections/Hero';
import Problem from '@/components/sections/Problem';
import Liability from '@/components/sections/Liability';
import Solution from '@/components/sections/Solution';
import Features from '@/components/sections/Features';
import Primitives from '@/components/sections/Primitives';
import AgenticSection from '@/components/sections/AgenticSection';
import VerifySection from '@/components/sections/VerifySection';
import IndustryDemos from '@/components/sections/IndustryDemos';
import CTA from '@/components/sections/CTA';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problem />
      <Liability />
      <Solution />
      <Features />
      <Primitives />
      <AgenticSection />
      <VerifySection />
      <IndustryDemos />
      <CTA />
    </main>
  );
}
