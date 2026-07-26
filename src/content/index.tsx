import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import SubtitleOverlay from './SubtitleOverlay';
import { YouTubeAdapter } from '../platforms/youtube/YoutubeAdapter.ts'; 
import type { SubtitleEntry } from '../core/types/subtitles';

const adapter = new YouTubeAdapter();

const App = () => {
  const [primaryText, setPrimaryText] = useState('');
  const [secondaryText, setSecondaryText] = useState('');

  useEffect(() => {
    const video = adapter.getVideoElement();
    if (!video) return;

    let entries: SubtitleEntry[] = [];

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data.type === 'SUBLINGO_INTERCEPTED_DATA') {
        // We use the adapter to parse the intercepted JSON
        const parsed = adapter.parseJSON(event.data.data);
        entries = parsed;
        console.log('[SubLingo] Engine loaded with lines:', entries.length);
      }
    };

    window.addEventListener('message', handleMessage);

    const onTimeUpdate = () => {
      const currentTime = video.currentTime;
      // Simple search to find which subtitle to show
      const active = entries.find(e => currentTime >= e.start && currentTime <= e.end);
      setPrimaryText(active ? active.text : '');
    };

    video.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      window.removeEventListener('message', handleMessage);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  return <SubtitleOverlay primaryText={primaryText} secondaryText={secondaryText} />;
};

function injectUI() {
  if (document.getElementById('sublingo-root')) return;

  const container = document.createElement('div');
  container.id = 'sublingo-root';
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '12%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    pointerEvents: 'none',
  });

  document.body.appendChild(container);
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