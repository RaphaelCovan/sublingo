// src/background/index.ts
console.log('!!! SUB-LINGO BACKGROUND IS ALIVE !!!');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_SUBTITLES') {
    console.log('[SubLingo Background] Fetching from Legacy API:', message.url);

    fetch(message.url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(data => {
        console.log(`[SubLingo Background] SUCCESS! Received ${data.length} chars.`);
        sendResponse({ success: true, data });
      })
      .catch(err => {
        console.error('[SubLingo Background] Fetch Error:', err);
        sendResponse({ success: false, error: err.message });
      });

    return true; 
  }
});