import Hero from '@/components/sections/Hero';
import Liability from '@/components/sections/Liability';
import Primitives from '@/components/sections/Primitives';
import Features from '@/components/sections/Features';
import Problem from '@/components/sections/Problem';
import Solution from '@/components/sections/Solution';
import CTA from '@/components/sections/CTA';
import IndustryDemos from '@/components/sections/IndustryDemos';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problem />
       <Liability />
      <Primitives />
      <Solution />
      <Features />
      <IndustryDemos />
      <CTA />
    </main>
  );
}