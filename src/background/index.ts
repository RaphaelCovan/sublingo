// src/background/index.ts
console.log('[Overheard Background] service worker alive (translation service)');

// Our internal language codes mostly match Google Translate's endpoint
// directly, but a few families diverge — map those explicitly rather than
// naively splitting on '-', which would turn zh-Hans into 'zh' (ambiguous)
// or pt-BR into 'pt' (loses the Brazilian-specific variant Google supports).
function toGoogleLangCode(code: string): string {
  const overrides: Record<string, string> = {
    'zh-Hans': 'zh-CN',
    'zh-Hant': 'zh-TW',
  };
  return overrides[code] ?? code;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'OVERHEARD_TRANSLATE_WORD') return;

  const { word, sourceLang, targetLang } = message;
  // sourceLang is now passed explicitly (the language of whichever subtitle
  // line was actually clicked) instead of relying on Google's auto-detect —
  // auto-detect on a single short word is unreliable (e.g. Polish "i"
  // meaning "and" was being detected as English "I" with no context to
  // disambiguate from).
  const sl = sourceLang ? toGoogleLangCode(sourceLang) : 'auto';
  const tl = toGoogleLangCode(targetLang);

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(word)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const translated = Array.isArray(data?.[0])
        ? data[0].map((seg: any) => seg[0]).join('')
        : null;
      sendResponse({ success: !!translated, translation: translated });
    })
    .catch(err => {
      console.warn('[Overheard Background] Translation fetch failed', err);
      sendResponse({ success: false, error: String(err) });
    });

  return true;
});