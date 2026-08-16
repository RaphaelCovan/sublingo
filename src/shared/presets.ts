// src/shared/presets.ts
import type { CaptionStyle } from './storage';
import { FONT_FAMILIES } from './storage';

export interface BuiltInPreset {
  id: string;
  name: string;
  style: CaptionStyle;
}

// Netflix's "Uniform" edge style — a stacked multi-directional outline
// rather than a plain border — is exactly what our outline thickness
// setting already produces, so no new rendering logic was needed here.
export const BUILT_IN_PRESETS: BuiltInPreset[] = [
  {
  id: 'netflix',
  name: 'Netflix',
  style: {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#e5e5e5',
    primaryBorderColor: '#000000',
    secondaryColor: '#ffd60a',
    secondaryBorderColor: '#000000',
    borderWidth: 2,
    backgroundOpacity: 0,
  },
},
{
  id: 'prime-video',
  name: 'Prime Video',
  style: {
    fontFamily: '"Nunito Sans", sans-serif',
    primaryColor: '#ffffff',
    primaryBorderColor: '#000000',
    secondaryColor: '#00caff',
    secondaryBorderColor: '#000000',
    borderWidth: 0,
    backgroundOpacity: 0.7,
  },
},
  {
    id: 'youtube-classic',
    name: 'YouTube Classic',
    style: {
      fontFamily: FONT_FAMILIES[0],
      primaryColor: '#ffffff',
      primaryBorderColor: '#000000',
      secondaryColor: '#ffd60a',
      secondaryBorderColor: '#000000',
      borderWidth: 0,
      backgroundOpacity: 0.75,
    },
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    style: {
      fontFamily: FONT_FAMILIES[0],
      primaryColor: '#ffffff',
      primaryBorderColor: '#000000',
      secondaryColor: '#ffe27a',
      secondaryBorderColor: '#000000',
      borderWidth: 1,
      backgroundOpacity: 0,
    },
  },
];