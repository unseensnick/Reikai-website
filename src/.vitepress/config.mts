// Loads .env and resolves defaults before anything else runs, so the release data loader in
// this same process sees GITHUB_TOKEN without the caller having to export it.
import '../../scripts/env.mjs'
import { defineConfig } from 'vitepress'
// @ts-expect-error no bundled types
import shortcodePlugin from 'markdown-it-shortcode-tag'
import shortcodes from './shortcodes'

const REPO = 'https://github.com/unseensnick/Reikai'

// Download and Changelogs share a sidebar so the "Get Reikai" pages feel like one section rather
// than two dead ends, which is what they are without it.
const getSidebar = [
  {
    text: 'Get Reikai',
    items: [
      { text: 'Download', link: '/download/' },
      { text: 'Changelogs', link: '/changelogs/' },
    ],
  },
]

export default defineConfig({
  title: 'Reikai',
  description: 'One library for manga and light novels, on Android.',
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: '/favicon.svg' }]],

  markdown: {
    config(md) {
      md.use(shortcodePlugin, shortcodes)
    },
  },

  themeConfig: {
    logo: '/logo.webp',

    nav: [
      {
        // Mihon's shape: one "Get" entry that opens onto the download page and the changelog,
        // rather than two top-level items competing for the same intent.
        text: 'Get Reikai',
        activeMatch: '^/(download|changelogs)',
        items: [
          { text: 'Download', link: '/download/' },
          { text: 'Changelogs', link: '/changelogs/' },
        ],
      },
      { text: 'Docs', link: '/docs/multi-source', activeMatch: '/docs/' },
    ],

    // One sidebar everywhere rather than a different one per section. Download, changelogs and the
    // docs are a single small site, and splitting them meant landing on Download with no way back
    // into anything except the top nav.
    sidebar: [
      ...getSidebar,
      {
        // Reikai's own features first: they are the reason someone is reading this site rather
        // than Mihon's, and they are documented nowhere else.
        text: 'What Reikai adds',
        items: [
          { text: 'Multi-source grouping', link: '/docs/multi-source' },
          { text: 'Categories and sort order', link: '/docs/categories' },
          { text: 'Library search', link: '/docs/library-search' },
          { text: 'Related manga', link: '/docs/related-mangas' },
        ],
      },
      {
        text: 'Setup and data',
        items: [
          { text: 'Backup and restore', link: '/docs/backup-restore' },
          { text: 'Tracker sync', link: '/docs/tracker-sync' },
          { text: 'FlareSolverr', link: '/docs/flaresolverr' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'FAQ', link: '/docs/FAQ' },
          { text: 'Built-in sources', link: '/docs/built-in-sources' },
          { text: 'Adult sources', link: '/docs/adult-sources' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: REPO }],

    editLink: {
      pattern: `${REPO}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Built on Mihon. Released under the Apache 2.0 License.',
      copyright: `<a href="${REPO}">github.com/unseensnick/Reikai</a>`,
    },

    search: { provider: 'local' },
  },
})
