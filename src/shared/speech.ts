// src/shared/speech.ts

const SPEECH_LANG_OVERRIDES: Record<string, string> = {
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'pt': 'pt-PT',
};

function toSpeechLangTag(code: string): string {
  return SPEECH_LANG_OVERRIDES[code] ?? code;
}

// volume: 0–1, mirrors whatever the caller currently knows about playback
// volume (e.g. the YouTube video's own volume, when available). Defaults to
// full volume for contexts with no such source (e.g. the popup's History
// tab, which has no direct access to the page's video element).
export function speakText(text: string, langCode: string, volume: number = 1): boolean {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = toSpeechLangTag(langCode);
  utterance.volume = Math.min(1, Math.max(0, volume));
  window.speechSynthesis.speak(utterance);
  return true;
}