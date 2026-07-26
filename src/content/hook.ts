// src/content/hook.ts

(function () {
  // 1. Hook into XMLHttpRequest (The primary way YouTube fetches subtitles)
  const originalOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (_method: string, url: string | URL) {
    const urlString = typeof url === 'string' ? url : url.toString();

    if (urlString.includes('api/timedtext')) {
      this.addEventListener('load', () => {
        console.log('[SubLingo Hook] XHR Intercepted');
        window.postMessage(
          {
            type: 'SUBLINGO_INTERCEPTED_DATA',
            data: this.responseText,
            url: urlString,
          },
          '*'
        );
      });
    }
    return originalOpen.apply(this, arguments as any);
  };

  // 2. Hook into Fetch (Future-proofing for when YouTube migrates fully to fetch)
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;

    if (url.includes('api/timedtext')) {
      const clone = response.clone();
      const data = await clone.text();
      console.log('[SubLingo Hook] Fetch Intercepted');
      window.postMessage(
        {
          type: 'SUBLINGO_INTERCEPTED_DATA',
          data: data,
          url: url,
        },
        '*'
      );
    }
    return response;
  };
})();

export {};