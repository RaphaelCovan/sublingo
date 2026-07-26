// src/content/hook.ts

(function () {
  // 1. Interception Logic (The Catch)
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (_method: string, url: string | URL) {
    const urlString = typeof url === 'string' ? url : url.toString();
    if (urlString.includes('api/timedtext')) {
      this.addEventListener('load', () => {
        window.postMessage({ 
          type: 'SUBLINGO_INTERCEPTED_DATA', 
          data: this.responseText, 
          url: urlString 
        }, '*');
      });
    }
    return originalOpen.apply(this, arguments as any);
  };

  // 2. The "Remote Control" (The Switch)
  window.addEventListener('message', (event) => {
    if (event.data.type === 'SUBLINGO_TRIGGER_SWITCH') {
      const player = document.getElementById('movie_player') as any;
      if (player && player.setOption) {
        console.log('[SubLingo Hook] Remote controlling player to fetch:', event.data.langCode);
        
        // This forces YouTube's own engine to fetch the new language
        player.setOption('captions', 'track', { languageCode: event.data.langCode });
      }
    }
  });
})();

export {};