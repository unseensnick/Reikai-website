// Loads .env and resolves defaults before anything else runs, so the release data loader in
// this same process sees GITHUB_TOKEN without the caller having to export it.
import { EDIT_REF, PREVIEW, SITE_ORIGIN } from '../../scripts/env.mjs'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type HeadConfig } from 'vitepress'
// @ts-expect-error no bundled types
import shortcodePlugin from 'markdown-it-shortcode-tag'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import shortcodes from './shortcodes'

const REPO = 'https://github.com/unseensnick/Reikai'

// The stable build is served from the root of its own domain and the preview build from /preview/.
// VitePress rewrites markdown links, raw HTML `src` attributes and CSS `url()` for the base on its own
// but does NOT touch hand-written strings in this file, so those spell it out.
const BASE = PREVIEW ? '/preview/' : '/'

// Download, changelogs, related and privacy exist only in the stable build. A link to one from the
// preview build has to be absolute, because VitePress would otherwise put /preview/ in front of it.
const root = (path: string) => (PREVIEW ? `${SITE_ORIGIN}${path}` : path)

// The two builds share one origin but are two separate apps. A click on a same-origin link is routed
// inside the app it was clicked in, so the Nightly app would render its own 404 for a stable page until
// the reader refreshed. A link that names a target is left to the browser, which loads the other build.
// VitePress otherwise gives an absolute link a new tab, which is wrong for a page on this same site.
const CROSS_BUILD = { target: '_self' } as const
const rootLink = (text: string, path: string) =>
  (PREVIEW ? { text, link: root(path), ...CROSS_BUILD } : { text, link: path })

const here = dirname(fileURLToPath(import.meta.url))

const DESCRIPTION = 'One library for manga and light novels, on Android.'

// Per page, what a link preview reads: the page's own title, description and address. VitePress
// writes the description meta itself; the Open Graph and canonical tags are ours. Mihon's
// generateMeta hook is the reference, without its generated per-page images.
function pageMeta(relativePath: string, title: string, description: string): HeadConfig[] {
  const path = relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  const url = `${SITE_ORIGIN}${BASE}${path}`
  return [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
  ]
}

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
      rootLink('Download', '/download/'),
      rootLink('Changelogs', '/changelogs/'),
      rootLink('Related apps', '/related/'),
      rootLink('Privacy policy', '/privacy/'),
    ],
  },
  {
    text: 'Frequently Asked Questions',
    items: [
      // Reikai's own FAQ leads: it answers what the app is and where to get it, which is what a
      // first-time reader is here for. The rest is Mihon's, covering behaviour both apps share.
      { text: 'Reikai', link: '/docs/about' },
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
        ],
      },
      // A setup guide for a proxy you run, not a fix for an error, so it sits beside Troubleshooting
      // rather than inside it.
      { text: 'Cloudflare bypass', link: '/docs/flaresolverr' },
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
      {
        text: 'Library',
        collapsed: true,
        items: [
          { text: 'Layout', link: '/docs/library-layout' },
          { text: 'Search', link: '/docs/library-search' },
        ],
      },
      { text: 'Related manga', link: '/docs/related-mangas' },
      { text: 'Adult sources', link: '/docs/adult-sources' },
      { text: 'Shizuku', link: '/docs/guides/shizuku' },
    ],
  },
]

type SidebarItem = { text?: string; link?: string; items?: SidebarItem[]; collapsed?: boolean }

// One list serves both builds, and each only gets the pages its docs actually have: a page can exist
// in the nightly docs before the stable ones, and the build fails on a dead link. A group whose own
// page is gone keeps its children as a plain heading.
function existingPages(items: SidebarItem[]): SidebarItem[] {
  return items.flatMap((item) => {
    const children = item.items ? existingPages(item.items) : undefined
    const docPage = item.link?.startsWith('/docs/')
    const exists = !docPage || existsSync(join(here, '..', `${item.link}.md`))
      || existsSync(join(here, '..', item.link!, 'index.md'))
    if (!exists && !children?.length) return []
    return [{ ...item, link: exists ? item.link : undefined, items: children }]
  })
}

export default defineConfig({
  title: PREVIEW ? 'Reikai Nightly' : 'Reikai',
  // A local review build points its cross-links at localhost, which VitePress otherwise reports as dead.
  ignoreDeadLinks: SITE_ORIGIN.startsWith('http://localhost') ? 'localhostLinks' : false,
  base: BASE,
  // The first doc's "Previous page" link would be the last site page, which in the Nightly build is on
  // the stable site. The page footer cannot take a target, so it would open a new tab; drop it instead.
  transformPageData(pageData) {
    if (PREVIEW && pageData.relativePath === 'docs/about.md') pageData.frontmatter.prev = false
  },
  description: DESCRIPTION,
  cleanUrls: true,
  // Stable only. VitePress writes sitemap URLs without the base, so the preview build's would name
  // pages at the root, and that build asks not to be indexed anyway. The sandbox is noindex too.
  sitemap: PREVIEW
    ? undefined
    : { hostname: SITE_ORIGIN, transformItems: (items) => items.filter((item) => !item.url.startsWith('sandbox')) },
  transformHead: ({ pageData, title, description }) =>
    pageMeta(pageData.relativePath, title, description || DESCRIPTION),
  // Where crawlers find the sitemap. Written here rather than kept in public/, because the sitemap's
  // address depends on the origin being built for.
  buildEnd(siteConfig) {
    if (PREVIEW) return
    writeFileSync(
      join(siteConfig.outDir, 'robots.txt'),
      `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
    )
  },
  lastUpdated: true,
  // The preview build is docs only.
  srcExclude: PREVIEW ? ['index.md', 'download/**', 'changelogs/**', 'privacy/**', 'related/**'] : [],
  head: [
    ['link', { rel: 'icon', href: `${BASE}favicon.svg` }],
    ['meta', { property: 'og:site_name', content: PREVIEW ? 'Reikai Nightly' : 'Reikai' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    // PNG, since not every link preview reads the WebP logo.
    ['meta', { property: 'og:image', content: `${SITE_ORIGIN}${BASE}og-image.png` }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:image', content: `${SITE_ORIGIN}${BASE}og-image.png` }],
    // Kept out of search results, so a search for a setting lands on the docs for the release people run.
    ...(PREVIEW ? [['meta', { name: 'robots', content: 'noindex' }] as [string, Record<string, string>]] : []),
  ],

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
      // Same reason as CROSS_BUILD: a doc link into the other build is absolute, and VitePress only adds
      // its new-tab attributes to a link that has no target yet.
      md.core.ruler.push('cross_build_links', (state) => {
        for (const block of state.tokens) {
          for (const token of block.children ?? []) {
            if (token.type === 'link_open' && token.attrGet('href')?.startsWith(`${SITE_ORIGIN}/`)) {
              token.attrSet('target', '_self')
            }
          }
        }
      })
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
          rootLink('Download', '/download/'),
          rootLink('Changelogs', '/changelogs/'),
        ],
      },
      { text: 'Docs', link: '/docs/about', activeMatch: '^/docs/' },
      {
        // Absolute on both sides, because each build's links are otherwise resolved under its own base.
        text: PREVIEW ? 'Nightly' : 'Stable',
        items: [
          { text: 'Stable', link: `${SITE_ORIGIN}/docs/about`, ...CROSS_BUILD },
          { text: 'Nightly', link: `${SITE_ORIGIN}/preview/docs/about`, ...CROSS_BUILD },
        ],
      },
    ],

    // Mihon's depth: headings two and three deep, so a long settings page can be navigated from the
    // aside instead of by scrolling. Their themeConfig sets the same.
    outline: [2, 3],

    sidebar: existingPages(sidebar),

    // Read by PreviewBanner.vue.
    preview: PREVIEW,
    siteOrigin: SITE_ORIGIN,

    socialLinks: [{ icon: 'github', link: REPO }],

    editLink: {
      pattern: `${REPO}/edit/${EDIT_REF}/:path`,
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
        + `<a href="${root('/privacy/')}" target="_self">Privacy policy</a>`,
      copyright:
        `Copyright © ${new Date().getFullYear()} <a href="${REPO}">Reikai</a>`
        + ' · Built on <a href="https://mihon.app">Mihon</a>',
    },

    search: { provider: 'local' },
  },
})
