// src/background/index.ts
console.log('!!! SUB-LINGO BACKGROUND IS ALIVE !!!');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_SUBTITLES' && sender.tab?.id) {
    console.log('[SubLingo Background] Master Key teleporting fetch to YouTube...');

    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN', // CRITICAL: Run as YouTube itself
      func: async (url: string) => {
        try {
          // Fetch using YouTube's own session and cookies
          const response = await fetch(url, { credentials: 'include' });
          return await response.text();
        } catch (e) {
          return null;
        }
      },
      args: [message.url]
    })
    .then(results => {
      const data = results[0]?.result as string | null;
      console.log(`[SubLingo Background] Teleport Success! Received ${data?.length || 0} chars`);
      sendResponse({ success: !!data, data });
    })
    .catch(err => {
      console.error('[SubLingo Background] Teleport Error:', err);
      sendResponse({ success: false, error: err.message });
    });

    return true; // Keep channel open
  }
});