// src/background/index.ts
console.log('[SubLingo Background] service worker alive');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'FETCH_SUBTITLES') return;

  const tabId = sender.tab?.id;
  if (!tabId || !message.url) {
    sendResponse({ success: false, error: 'Missing tabId or url' });
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: async (url: string) => {
      try {
        const response = await fetch(url, { credentials: 'include' });
        const text = await response.text();
        return {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          length: text.length,
          snippet: text.slice(0, 200),
          data: text,
        };
      } catch (e: any) {
        return {
          ok: false,
          status: -1,
          statusText: 'EXCEPTION',
          length: 0,
          snippet: e?.message ?? String(e),
          data: null,
        };
      }
    },
    args: [message.url]
  })
    .then(results => {
      const r = results[0]?.result;
      console.log(
        `[SubLingo Background] status=${r?.status} ok=${r?.ok} length=${r?.length} snippet="${r?.snippet}" url=${message.url}`
      );
      sendResponse({ success: !!r?.data, data: r?.data ?? null, status: r?.status });
    })
    .catch(err => {
      console.error('[SubLingo Background] executeScript failed:', err);
      sendResponse({ success: false, error: String(err) });
    });

  return true;
});