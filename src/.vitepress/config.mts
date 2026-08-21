// Loads .env and resolves defaults before anything else runs, so the release data loader in
// this same process sees GITHUB_TOKEN without the caller having to export it.
import '../../scripts/env.mjs'
import { defineConfig } from 'vitepress'
// @ts-expect-error no bundled types
import shortcodePlugin from 'markdown-it-shortcode-tag'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import shortcodes from './shortcodes'

const REPO = 'https://github.com/unseensnick/Reikai'

// One sidebar everywhere rather than a different one per section. Download, changelogs and the docs
// are a single small site, and splitting them meant landing on Download with no way back into
// anything except the top nav.
//
// The shape follows Mihon's own sidebar: an unlabelled group of site pages first, then Frequently
// Asked Questions, then Guides, with multi-page topics nested and collapsed. Reikai's own pages are
// filed into those two groups by what they are rather than by where they came from, so a reader
// looking for tracking finds one Tracking page, not a Mihon one and a Reikai one.
const sidebar = [
  {
    items: [
      { text: 'Download', link: '/download/' },
      { text: 'Changelogs', link: '/changelogs/' },
      { text: 'Related apps', link: '/related/' },
      { text: 'Privacy policy', link: '/privacy/' },
    ],
  },
  {
    text: 'Frequently Asked Questions',
    items: [
      // Reikai's own FAQ leads: it answers what the app is and where to get it, which is what a
      // first-time reader is here for. The rest is Mihon's, covering behaviour both apps share.
      { text: 'Reikai', link: '/docs/FAQ' },
      { text: 'General', link: '/docs/faq/general' },
      { text: 'Library', link: '/docs/faq/library' },
      {
        text: 'Updates',
        collapsed: true,
        items: [
          { text: 'Smart updates', link: '/docs/faq/updates/smart' },
          { text: 'Upcoming', link: '/docs/faq/updates/upcoming' },
        ],
      },
      {
        text: 'Browse',
        link: '/docs/faq/browse/',
        collapsed: true,
        items: [
          { text: 'Extensions', link: '/docs/faq/browse/extensions' },
          { text: 'Local source', link: '/docs/faq/browse/local-source' },
          { text: 'Built-in sources', link: '/docs/built-in-sources' },
        ],
      },
      { text: 'Downloads', link: '/docs/faq/downloads' },
      { text: 'Reader', link: '/docs/faq/reader' },
      { text: 'Settings', link: '/docs/faq/settings' },
      { text: 'Storage', link: '/docs/faq/storage' },
    ],
  },
  {
    text: 'Guides',
    items: [
      { text: 'Getting started', link: '/docs/guides/getting-started' },
      {
        text: 'Troubleshooting',
        link: '/docs/guides/troubleshooting/',
        collapsed: true,
        items: [
          { text: 'Common issues', link: '/docs/guides/troubleshooting/common-issues' },
          { text: 'Diagnosis', link: '/docs/guides/troubleshooting/diagnosis' },
          { text: 'Cloudflare bypass', link: '/docs/flaresolverr' },
        ],
      },
      { text: 'Source migration', link: '/docs/guides/source-migration' },
      { text: 'Backups', link: '/docs/guides/backups' },
      { text: 'Tracking', link: '/docs/guides/tracking' },
      { text: 'Categories', link: '/docs/guides/categories' },
      {
        text: 'Local source',
        link: '/docs/guides/local-source/',
        collapsed: true,
        items: [{ text: 'Advanced editing', link: '/docs/guides/local-source/advanced' }],
      },
      { text: 'Reader settings', link: '/docs/guides/reader-settings' },
      // What Reikai adds on top, kept together at the end of the guides rather than in a section of
      // their own: a reader looking for "how do I do X" should find one list, not two.
      { text: 'Multi-source grouping', link: '/docs/multi-source' },
      { text: 'Library search', link: '/docs/library-search' },
      { text: 'Related manga', link: '/docs/related-mangas' },
      { text: 'Adult sources', link: '/docs/adult-sources' },
      { text: 'Shizuku', link: '/docs/guides/shizuku' },
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
    // Required for the "On this page" aside to hold anything. VitePress registers its header
    // extractor only `if (options.headers)` and the option has no default, so every page was built
    // with `headers: []` and an empty outline. Silent in the same way the tabs plugin was: the build
    // is clean and the aside still draws its title.
    headers: true,

    config(md) {
      md.use(shortcodePlugin, shortcodes)
      // The guides ported from Mihon lean on ::: tabs blocks. Without the plugin they render as the
      // literal ":::" text, which the build does not complain about, so this is load-bearing.
      md.use(tabsMarkdownPlugin)
    },
  },

  themeConfig: {
    logo: '/logo.webp',

    nav: [
      {
        // Mihon's shape: one "Get" entry that opens onto the download page and the changelog,
        // rather than two top-level items competing for the same intent.
        text: 'Get Reikai',
        activeMatch: '^/(download|changelogs|related|privacy)',
        items: [
          { text: 'Download', link: '/download/' },
          { text: 'Changelogs', link: '/changelogs/' },
          { text: 'Related apps', link: '/related/' },
        ],
      },
      { text: 'Docs', link: '/docs/FAQ', activeMatch: '^/docs/' },
    ],

    // Mihon's depth: headings two and three deep, so a long settings page can be navigated from the
    // aside instead of by scrolling. Their themeConfig sets the same.
    outline: [2, 3],

    sidebar,

    socialLinks: [{ icon: 'github', link: REPO }],

    editLink: {
      pattern: `${REPO}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub',
    },

    footer: {
      // Mihon's shape: a licence link, a privacy link, then the credit line. Two licences named,
      // because these are two repositories: the site takes Mihon's, since much of it derives from
      // theirs, and the app is Apache-2.0.
      message:
        '<a href="https://www.apache.org/licenses/LICENSE-2.0">Apache-2.0 app</a>'
        + ' <span class="divider">|</span> '
        + '<a href="https://www.mozilla.org/MPL/2.0/">MPL-2.0 site</a>'
        + ' <span class="divider">|</span> '
        + '<a href="/privacy/">Privacy policy</a>',
      copyright:
        `Copyright © ${new Date().getFullYear()} <a href="${REPO}">Reikai</a>`
        + ' · Built on <a href="https://mihon.app">Mihon</a>',
    },

    search: { provider: 'local' },
  },
})
