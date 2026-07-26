import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import SubtitleOverlay from './SubtitleOverlay';
import { YouTubeAdapter } from '../platforms/youtube/YoutubeAdapter.ts'; 
import type { SubtitleEntry } from '../core/types/subtitles';
import { SubtitleEngine } from '../core/engine/SubtitleEngine';

const adapter = new YouTubeAdapter();

const App = () => {
  const [primaryText, setPrimaryText] = useState('');
  const [secondaryText, setSecondaryText] = useState('');
  const engine = useRef(new SubtitleEngine());
  const hasFetchedSecondary = useRef(false);

  useEffect(() => {
    const video = adapter.getVideoElement();
    if (!video) return;

    const handleMessage = async (event: MessageEvent) => {
      if (event.source !== window) return;
      
      if (event.data.type === 'SUBLINGO_INTERCEPTED_DATA') {
        const parsed = adapter.parseJSON(event.data.data);
        
        // If we haven't loaded anything yet, this is our Primary track
        if (!primaryText) {
          engine.current.setPrimaryEntries(parsed);
          setPrimaryText('Loading...'); // Trigger a state update
          console.log('[SubLingo] Primary Track Caught');

          // Now, let's "Switch-and-Catch" the secondary track
          if (!hasFetchedSecondary.current) {
            hasFetchedSecondary.current = true;
            
            // Wait 1 second, then ask for Polish (or Portuguese)
            setTimeout(() => {
              window.postMessage({ 
                type: 'SUBLINGO_TRIGGER_SWITCH', 
                langCode: 'pl' // Change this to 'pt' or 'es' to test
              }, '*');
            }, 1000);
          }
        } 
        // If we already have a Primary, this new intercepted data MUST be our Secondary!
        else {
          engine.current.setSecondaryEntries(parsed);
          console.log('[SubLingo] SUCCESS: Secondary Track Caught via Switch-and-Catch');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    const onTimeUpdate = () => {
      const { primaryText, secondaryText } = engine.current.getActiveEntries(video.currentTime);
      setPrimaryText(primaryText);
      setSecondaryText(secondaryText);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      window.removeEventListener('message', handleMessage);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [primaryText]);

  return <SubtitleOverlay primaryText={primaryText} secondaryText={secondaryText} />;
};

function injectUI() {
  if (document.getElementById('sublingo-root')) return;

  const container = document.createElement('div');
  container.id = 'sublingo-root';
  
  // High-end centering logic
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '12%',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '2147483647',
    pointerEvents: 'none',
  });

  document.body.appendChild(container);
  // ... rest of function as before

  document.body.appendChild(container);
  // ... rest of the function remains same
  const shadow = container.attachShadow({ mode: 'open' });
  const reactRootDiv = document.createElement('div');
  shadow.appendChild(reactRootDiv);

  createRoot(reactRootDiv).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectUI);
} else {
  injectUI();
}