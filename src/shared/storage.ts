export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  primaryBorderColor: string;
  secondaryColor: string;
  secondaryBorderColor: string;
  borderWidth: number; // px; 0 = no outline
  backgroundOpacity: number;
}
// Fractional position (0–1) within the video player's box — see
// SubtitleOverlay for why this stays consistent across normal/theater/fullscreen.
export interface OverlayLayout {
  fx: number | null;
  fy: number | null;
}

export interface SubLingoSettings {
  enabled: boolean;
  primaryLanguage: string;
  secondaryLanguage: string;
  captionStyle: CaptionStyle;
  overlayLayout: OverlayLayout;
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
];

export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  fontFamily: FONT_FAMILIES[0],
  fontSize: 26,
  primaryColor: '#ffffff',
  primaryBorderColor: '#000000',
  secondaryColor: '#ffd60a',
  secondaryBorderColor: '#000000',
  borderWidth: 1,
  backgroundOpacity: 0,
};

export const DEFAULT_OVERLAY_LAYOUT: OverlayLayout = { fx: null, fy: null };

// Rarely-changed, worth syncing across the user's devices.
const SYNC_DEFAULTS = {
  enabled: true,
  primaryLanguage: 'en',
  secondaryLanguage: 'pt-BR',
};

// Frequently-changed via sliders/dragging — chrome.storage.sync has a
// write-rate limit (~2/sec sustained) that a slider drag blows through in
// well under a second, silently locking out ALL further sync writes for a
// cooldown window. chrome.storage.local has no comparable limit, so
// appearance/layout live here instead.
const LOCAL_DEFAULTS = {
  captionStyle: DEFAULT_CAPTION_STYLE,
  overlayLayout: DEFAULT_OVERLAY_LAYOUT,
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
          overlayLayout: { ...DEFAULT_OVERLAY_LAYOUT, ...(localItems as any).overlayLayout },
        } as SubLingoSettings);
      });
    });
  });
};

export const setSettings = (settings: Partial<SubLingoSettings>): Promise<void> => {
  const syncPatch: Record<string, unknown> = {};
  const localPatch: Record<string, unknown> = {};

  for (const key of Object.keys(settings) as (keyof SubLingoSettings)[]) {
    if (key === 'captionStyle' || key === 'overlayLayout') localPatch[key] = settings[key];
    else syncPatch[key] = settings[key];
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