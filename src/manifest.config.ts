import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'SubLingo',
  version: '0.1.0',
  description: 'Learn languages by watching YouTube with dual subtitles.',
  action: {
    default_popup: 'index.html',
  },
  permissions: ['storage'],
  host_permissions: ['https://www.youtube.com/*', 'https://*.youtube.com/*'],
  content_scripts: [
    {
      // The Main Extension UI
      js: ['src/content/index.tsx'],
      matches: ['https://www.youtube.com/*'],
      run_at: 'document_start',
    },
    {
      // The Network Interceptor
      js: ['src/content/hook.ts'],
      matches: ['https://www.youtube.com/*'],
      run_at: 'document_start',
      world: 'MAIN', // CRITICAL: This allows the script to see YouTube's JS variables
    },
  ],
});