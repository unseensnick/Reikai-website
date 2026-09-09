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
| `19df3f646` | 2026-09-10 | **First recorded comparison; the frontier starts here.** Took the release dispatch: upstream's `b76f197` added `repository_dispatch: types: [app_release]` to their deploy workflow so publishing an app version rebuilds the site. Ours is `app-release` and is sent by the app repo's `site-release.yml` (on a release being published, since our stable releases are created as drafts for review) and by `nightly.yml`. Also took the shape of their `config/releaseData.ts` memo-plus-disk cache as `scripts/releases.mjs`, because our two build processes were each fetching the same release list. Not a copy: theirs throws on failure and ours does not, and ours derives the newest stable from the list rather than spending a request on `/releases/latest`. | Their Beta-to-Nightly commits (`79fc510`, `0f8dc47`, `0551caf`) were already reflected here independently, including the primary and other download split. OG image generation (adds two dependencies and four bundled fonts; a static image gets most of the value). Algolia search. Their news section and RSS feed generation, which is sound but has no Reikai content to carry. Their markdown-it plugin set, since the synced docs already hand-write the attributes it would add. |

### Known gaps, not yet done

These came out of the same comparison and are worth doing, in this order:

1. **A sitemap and a real head block.** `src/.vitepress/config.mts` has no `sitemap` key and its entire
   head is one favicon link, so every page shares one description and none carry Open Graph tags.
   Upstream's `config/headConfig.ts` and its `transformHead` hook are the reference.
2. **Per-version changelog permalinks.** Upstream generates one page per tag from the releases list.
   We emit a single concatenated page, so a release cannot be linked to on its own.
3. **A shortcode reference page.** `src/.vitepress/shortcodes.ts` is 140 lines with nothing rendering
   it, so a regression is invisible. Upstream's `sandbox/index.md` is the pattern.
