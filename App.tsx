import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { HiwSection } from './components/HiwSection';
import { UniversalBlueprint } from './components/UniversalBlueprint';
import { CulturePrism } from './components/CulturePrism';
import { Cabinet } from './components/Cabinet';
import { IsccNbsExplorer } from './components/IsccNbsExplorer';
import { EvolutionRed } from './components/EvolutionRed';
import { AiCurator } from './components/AiCurator';
import { ColorRealityFooter } from './components/ColorRealityFooter';
import { Navigation } from './components/Navigation';
import { AppSection } from './types';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HERO);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const hiwRef = useRef<HTMLDivElement>(null);
  const blueprintRef = useRef<HTMLDivElement>(null);
  const evolutionRef = useRef<HTMLDivElement>(null);
  const cultureRef = useRef<HTMLDivElement>(null);
  const cabinetRef = useRef<HTMLDivElement>(null);
  const isccRef = useRef<HTMLDivElement>(null);
  const curatorRef = useRef<HTMLDivElement>(null);

  const sectionRefs = {
    [AppSection.HERO]: heroRef,
    [AppSection.HIW]: hiwRef,
    [AppSection.BLUEPRINT]: blueprintRef,
    [AppSection.EVOLUTION]: evolutionRef,
    [AppSection.CULTURE]: cultureRef,
    [AppSection.CABINET]: cabinetRef,
    [AppSection.ISCC_NBS]: isccRef,
    [AppSection.MODERN]: cabinetRef, // Combined logically for nav simplicity
    [AppSection.AI_CURATOR]: curatorRef,
  };

  const scrollToSection = (section: AppSection) => {
    sectionRefs[section]?.current?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(section);
  };

  // Intersection Observer to update active state on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find which section this ref belongs to
            const sectionId = Object.keys(sectionRefs).find(
              key => sectionRefs[key as AppSection] === entry.target // Use direct ref object comparison isn't ideal, let's look up by dataset
            ) as AppSection;
            
            // Simpler approach: Map over entries and update based on ID
            const id = entry.target.getAttribute('id') as AppSection;
            if (id) setActiveSection(id);
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="antialiased text-ink bg-paper selection:bg-accent-gold/30">
      <Navigation activeSection={activeSection} onNavigate={scrollToSection} />
      
      <main className="snap-y snap-mandatory h-screen overflow-y-scroll w-full">
        <section id={AppSection.HERO} ref={heroRef} className="snap-start">
          <Hero />
        </section>
        
        <section id={AppSection.HIW} ref={hiwRef} className="snap-start">
          <HiwSection />
        </section>

        <section id={AppSection.BLUEPRINT} ref={blueprintRef} className="snap-start">
          <UniversalBlueprint />
        </section>

        <section id={AppSection.EVOLUTION} ref={evolutionRef} className="snap-start">
          <EvolutionRed />
        </section>

        <section id={AppSection.CULTURE} ref={cultureRef} className="snap-start">
          <CulturePrism />
        </section>

        <section id={AppSection.CABINET} ref={cabinetRef} className="snap-start">
          <Cabinet onNavigateToIscc={() => scrollToSection(AppSection.ISCC_NBS)} />
        </section>

        <section id={AppSection.ISCC_NBS} ref={isccRef} className="snap-start">
          <IsccNbsExplorer />
        </section>

        <section id={AppSection.AI_CURATOR} ref={curatorRef} className="snap-start">
          <AiCurator />
        </section>
        
        <footer className="snap-start min-h-[90vh] flex flex-col items-center justify-center bg-paper p-8 text-center relative">
            <ColorRealityFooter />
        </footer>
      </main>
    </div>
  );
};

export default App;