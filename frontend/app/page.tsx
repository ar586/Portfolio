import Hero from '@/components/Hero';
import Skills from '@/components/Skills';
import Hobbies from '@/components/Hobbies';
import Projects from '@/components/Projects';
import GitHub from '@/components/GitHub';
import LeetCode from '@/components/LeetCode';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Skills />
      <Hobbies />
      <Projects />
      <GitHub />
      <LeetCode />
    </main>
  );
}
