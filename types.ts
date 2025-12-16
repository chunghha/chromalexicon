
export interface ColorStage {
  id: number;
  title: string;
  description: string;
  colors: string[];
  colorNames: string[];
}

export interface Pigment {
  id: string;
  name: string;
  description: string;
  origin: string;
  hex: string;
  category: 'natural' | 'power' | 'history';
}

export interface MeaningComparison {
  color: string;
  hex: string;
  western: {
    positive: string[];
    negative: string[];
  };
  eastern: {
    positive: string[];
    negative: string[];
  };
}

export interface IsccEntry {
  id: number;
  name: string;
  hex: string;
  category: string;
}

export enum AppSection {
  HERO = 'hero',
  HIW = 'hiw',
  BLUEPRINT = 'blueprint',
  CULTURE = 'culture',
  CABINET = 'cabinet',
  EVOLUTION = 'evolution',
  MODERN = 'modern',
  ISCC_NBS = 'iscc_nbs',
  AI_CURATOR = 'ai_curator'
}
