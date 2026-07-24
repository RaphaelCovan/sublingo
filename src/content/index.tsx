import React from 'react';
import { createRoot } from 'react-dom/client';
import SubtitleOverlay from './SubtitleOverlay';


// 1. Create a container for our Shadow DOM
const container = document.createElement('div');
container.id = 'sublingo-root';
container.style.position = 'fixed';
container.style.bottom = '10%';
container.style.left = '50%';
container.style.transform = 'translateX(-50%)';
container.style.zIndex = '9999'; // Ensure it's on top of everything


// 2. Find a place to inject it. 
// On YouTube, the '#movie_player' is a good target, 
// but for the MVP, let's just put it on the body.
document.body.appendChild(container);

// 3. Attach the Shadow Root (mode: 'open' allows us to inspect it in DevTools)
const shadow = container.attachShadow({ mode: 'open' });

// 4. Create a div inside the shadow for React to mount into
const reactRootDiv = document.createElement('div');
shadow.appendChild(reactRootDiv);

// 5. Render the React App
const root = createRoot(reactRootDiv);
root.render(
  <React.StrictMode>
    <SubtitleOverlay />
  </React.StrictMode>
);

console.log('[SubLingo] UI Injected');