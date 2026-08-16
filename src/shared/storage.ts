export interface CaptionStyle {
  fontFamily: string;
  primaryColor: string;
  primaryBorderColor: string;
  secondaryColor: string;
  secondaryBorderColor: string;
  borderWidth: number;
  backgroundOpacity: number;
}
// Fractional position (0–1) within the video player's box — see
// SubtitleOverlay for why this stays consistent across normal/theater/fullscreen.
export interface OverlayLayout {
  fx: number | null;
  fy: number | null;
}

export interface CaptionPreset {
  id: string;
  name: string;
  style: CaptionStyle;
}

export interface SubLingoSettings {
  enabled: boolean;
  primaryLanguage: string;
  secondaryLanguage: string;
  captionStyle: CaptionStyle;
  fontSize: number;
  overlayLayout: OverlayLayout;
  customPresets: CaptionPreset[];
}

export const FONT_FAMILIES = [
  'Roboto, Arial, sans-serif',
  'Arial, sans-serif',
  'Georgia, serif',
  '"Times New Roman", serif',
  '"Courier New", monospace',
  '"Trebuchet MS", sans-serif',
  '"Comic Sans MS", cursive',
  'Impact, sans-serif',
  'Inter, sans-serif',
  '"Nunito Sans", sans-serif',
];

// Google Fonts families that need to be loaded — a subset of the names
// above that aren't already system-available.
export const GOOGLE_FONT_FAMILIES = ['Inter:wght@400;700', 'Nunito+Sans:wght@600;700'];
export const GOOGLE_FONTS_URL =
  `https://fonts.googleapis.com/css2?${GOOGLE_FONT_FAMILIES.map(f => `family=${f}`).join('&')}&display=swap`;

export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  fontFamily: FONT_FAMILIES[0],
  primaryColor: '#ffffff',
  primaryBorderColor: '#000000',
  secondaryColor: '#ffd60a',
  secondaryBorderColor: '#000000',
  borderWidth: 1,
  backgroundOpacity: 0,
};

export const DEFAULT_FONT_SIZE = 26;

export const DEFAULT_OVERLAY_LAYOUT: OverlayLayout = { fx: null, fy: null };

// Rarely-changed, worth syncing across the user's devices.
const SYNC_DEFAULTS = {
  enabled: true,
  primaryLanguage: 'en',
  secondaryLanguage: 'pt-BR',
};

// fontSize now lives alongside the other frequently-adjusted, high-write-
// frequency settings in local storage (see the write-rate-limit note from
// when we split sync/local originally) — same reasoning as captionStyle.
const LOCAL_DEFAULTS = {
  captionStyle: DEFAULT_CAPTION_STYLE,
  fontSize: DEFAULT_FONT_SIZE,
  overlayLayout: DEFAULT_OVERLAY_LAYOUT,
  customPresets: [] as CaptionPreset[],
};

export const DEFAULT_SETTINGS: SubLingoSettings = {
  ...SYNC_DEFAULTS,
  ...LOCAL_DEFAULTS,
};

export const getSettings = (): Promise<SubLingoSettings> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(SYNC_DEFAULTS, (syncItems) => {
      chrome.storage.local.get(LOCAL_DEFAULTS, (localItems) => {
        resolve({
          ...SYNC_DEFAULTS,
          ...syncItems,
          captionStyle: { ...DEFAULT_CAPTION_STYLE, ...(localItems as any).captionStyle },
          fontSize: (localItems as any).fontSize ?? DEFAULT_FONT_SIZE,
          overlayLayout: { ...DEFAULT_OVERLAY_LAYOUT, ...(localItems as any).overlayLayout },
          customPresets: (localItems as any).customPresets ?? [],
        } as SubLingoSettings);
      });
    });
  });
};

export const setSettings = (settings: Partial<SubLingoSettings>): Promise<void> => {
  const syncPatch: Record<string, unknown> = {};
  const localPatch: Record<string, unknown> = {};

  for (const key of Object.keys(settings) as (keyof SubLingoSettings)[]) {
    if (key === 'captionStyle' || key === 'overlayLayout' || key === 'customPresets' || key === 'fontSize') {
      localPatch[key] = settings[key];
    } else {
      syncPatch[key] = settings[key];
    }
  }

  const ops: Promise<void>[] = [];
  if (Object.keys(syncPatch).length) {
    ops.push(new Promise((resolve) => chrome.storage.sync.set(syncPatch, () => resolve())));
  }
  if (Object.keys(localPatch).length) {
    ops.push(new Promise((resolve) => chrome.storage.local.set(localPatch, () => resolve())));
  }
  return Promise.all(ops).then(() => undefined);
};