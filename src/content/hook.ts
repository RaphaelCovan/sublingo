// src/content/hook.ts

(function () {
  // 1. INTERCEPTION
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (_method: string, url: string | URL) {
    const urlString = typeof url === 'string' ? url : url.toString();
    if (urlString.includes('api/timedtext')) {
      this.addEventListener('load', () => {
        window.postMessage({ 
          type: 'SUBLINGO_DATA', 
          data: this.responseText, 
          url: urlString 
        }, '*');
      });
    }
    return originalOpen.apply(this, arguments as any);
  };

  // 2. REMOTE CONTROL
  window.addEventListener('message', (event) => {
    if (event.data.type === 'SUBLINGO_SET_PLAYER_LANG') {
      const player = (document.getElementById('movie_player') || document.querySelector('.html5-video-player')) as any;
      if (player && player.setOption) {
        player.loadModule('captions');
        
        const config: any = { languageCode: event.data.langCode };
        
        // This is the specific internal flag for YouTube's Auto-Translate feature
        if (event.data.isTranslation) {
          config.translation_language = event.data.langCode;
        }

        player.setOption('captions', 'track', config);
        console.log(`[SubLingo Hook] Player forced to: ${event.data.langCode} (Translation: ${event.data.isTranslation})`);
      }
    }
  });
})();
export {};