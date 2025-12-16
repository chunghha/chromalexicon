
import React from 'react';
import { AppSection } from '../types';

interface NavigationProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeSection, onNavigate }) => {
  const sections = [
    { id: AppSection.HERO, label: 'Start' },
    { id: AppSection.HIW, label: 'Hiw' },
    { id: AppSection.BLUEPRINT, label: 'Blueprint' },
    { id: AppSection.EVOLUTION, label: 'Evolution' },
    { id: AppSection.CULTURE, label: 'Culture' },
    { id: AppSection.CABINET, label: 'Curiosities' },
    { id: AppSection.ISCC_NBS, label: 'Standards' },
    { id: AppSection.MODERN, label: 'Modern' },
    { id: AppSection.AI_CURATOR, label: 'Curator' },
  ];

  return (
    <nav className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden md:flex flex-col gap-4">
      {sections.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="group flex items-center justify-end gap-2"
          aria-label={`Navigate to ${item.label}`}
        >
          <span 
            className={`text-xs font-serif transition-opacity duration-300 ${
              activeSection === item.id ? 'opacity-100 text-ink' : 'opacity-0 group-hover:opacity-100 text-ink-light'
            }`}
          >
            {item.label}
          </span>
          <div 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeSection === item.id 
                ? 'bg-ink scale-125' 
                : 'bg-gray-300 group-hover:bg-gray-400'
            }`}
          />
        </button>
      ))}
    </nav>
  );
};
