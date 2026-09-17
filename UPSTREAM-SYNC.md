# Syncing this site with Mihon's

This site started from [mihonapp/website](https://github.com/mihonapp/website) and has diverged
since. Like the app, it is ported by hand rather than merged: the two are separate repositories with
no shared history, and most of what upstream changes is their own content or a dependency bump.

The read-only clone lives beside the app repo at `refs/mihon-website/`. Everything is under
`website/` in that clone, so their `src/` is `refs/mihon-website/website/src/`.

The app's own ledger is `docs/dev/upstream-sync.md` in the Reikai repo. That one covers the Android
app and does not cover this site; this file is the site's half.

## What is worth taking

Structure, mechanism and generic infrastructure. Their config split, head and SEO handling, build
caching, and workflow triggers are all fair game once the branding is swapped out.

## What is not

Mihon content (their forks list, their news posts, their extensions page), Mihon branding, their
Algolia search (a DocSearch application we have no reason to apply for; `provider: 'local'` fits a
site this size), and Renovate dependency bumps, which are roughly half of their commit volume.

## Where Reikai is ahead, so do not port backwards

**The download page's asset discovery.** Upstream matches assets by hardcoded filename regex, one
per card, with no file sizes and no per-architecture links, so a change to their filename scheme
silently empties a card. `src/.vitepress/theme/DownloadCards.vue` matches on ABI tokens instead,
surfaces every architecture with its size, and is unaffected by a version-string change.

**Failing soft.** Upstream throws when the releases API cannot be reached, which fails the deploy.
`scripts/releases.mjs` warns and returns an empty list, so the page renders without a version. A
download page with a missing version number beats no download page.

**The changelog teaser.** Upstream renders the raw release body client side, uncapped. Ours is
flattened to plain text and capped at build time, which keeps the actual downloads on screen and
avoids rendering remote markup.

## Ledger

Newest first. "Base" is the `refs/mihon-website` SHA compared against.

| Base (mihon website) | Date | Taken | Declined |
|---|---|---|---|
| `0f5cedf` | 2026-09-16 | Nothing. | **A renovate dependency bump (mihonapp/website#288), which shares almost no surface with this site.** Upstream pins exact versions under pnpm; this site declares three devDependencies under npm with caret ranges, so patch bumps arrive on their own install. The only name in common is `markdown-it-shortcode-tag`, which the bump leaves at 1.1.0. Everything else it moves is either a transitive of vitepress here (`markdown-it`) or part of the `@mdit` plugin set already declined on the row below, plus `element-plus`, which this site does not use. The three known gaps under this table are unaffected. |
| `19df3f646` | 2026-09-10 | **First recorded comparison; the frontier starts here.** Took the release dispatch: upstream's `b76f197` added `repository_dispatch: types: [app_release]` to their deploy workflow so publishing an app version rebuilds the site. Ours is `app-release` and is sent by the app repo's `site-release.yml` (on a release being published, since our stable releases are created as drafts for review) and by `nightly.yml`. Also took the shape of their `config/releaseData.ts` memo-plus-disk cache as `scripts/releases.mjs`, because our two build processes were each fetching the same release list. Not a copy: theirs throws on failure and ours does not, and ours derives the newest stable from the list rather than spending a request on `/releases/latest`. | Their Beta-to-Nightly commits (`79fc510`, `0f8dc47`, `0551caf`) were already reflected here independently, including the primary and other download split. OG image generation (adds two dependencies and four bundled fonts; a static image gets most of the value). Algolia search. Their news section and RSS feed generation, which is sound but has no Reikai content to carry. Their markdown-it plugin set, since the synced docs already hand-write the attributes it would add. |

### Known gaps, closed

The three gaps the first comparison found are done (2026-09-17). Where each departs from upstream:

1. **Sitemap and head block.** VitePress's own `sitemap`, stable build only: it writes URLs without
   the base, so the `/preview/` build's would name root pages, and that build is noindex anyway.
   `buildEnd` writes a `robots.txt` naming the sitemap, since its address depends on the origin.
   `transformHead` adds a canonical link and per-page Open Graph and Twitter title, description and
   URL, as upstream's `generateMeta` does, but every page shares one static `og-image.png` rather than
   a generated image, the decline recorded on the first row.
2. **Per-version changelog pages.** Not upstream's dynamic `[tag].md` route rendering a Vue component:
   `sync-changelogs.mjs` writes one markdown page per release beside the stacked page, for the reason
   that script already gives (outline, anchors and search come from markdown). The per-version pages
   are left out of local search so a release is not indexed twice, the stacked page's headings link
   to them without changing their anchors, and the download page's changelog link opens the latest.
   Upstream's `latest` redirect was not taken: it asks GitHub from the reader's browser.
3. **Shortcode reference.** `src/sandbox/index.md`, noindex and out of search and the sitemap, as
   upstream's. Unlike upstream's hand-kept list, its table comes from a `<reference>` shortcode that
   reads the same maps `<nav>` and `<icon>` render from, so a key the app's `navigation.json` adds or
   drops shows there on the next build.
