import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'SubLingo',
  version: '0.1.0',
  description: 'Learn languages by watching YouTube with dual subtitles.',
  action: {
    default_popup: 'index.html',
  },
  permissions: ['storage'],
  content_scripts: [
    {
      js: ['src/content/index.tsx'],
      matches: ['https://www.youtube.com/*'],
    },
  ],
})