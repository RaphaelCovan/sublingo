// src/shared/storage.ts
export interface SubLingoSettings {
  enabled: boolean;
  primaryLanguage: string;   // Added this
  secondaryLanguage: string; // Added this
}

export const DEFAULT_SETTINGS: SubLingoSettings = {
  enabled: true,
  primaryLanguage: 'en',
  secondaryLanguage: 'pt',
};

export const getSettings = (): Promise<SubLingoSettings> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS as any, (items) => {
      resolve(items as unknown as SubLingoSettings);
    });
  });
};

export const setSettings = (settings: Partial<SubLingoSettings>): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, () => resolve());
  });
};