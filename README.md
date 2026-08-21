<div align="center">

<a href="https://github.com/unseensnick/Reikai">
    <img src="./src/public/logo.webp" alt="Reikai logo" height="160px" width="160px" />
</a>

# Reikai website

### Documentation and download site for [Reikai](https://github.com/unseensnick/Reikai)

One library for manga and light novels, on Android.

| Releases | Preview |
| :---: | :---: |
| [![Stable](https://img.shields.io/github/v/release/unseensnick/Reikai?maxAge=3600&label=Stable&labelColor=06599d&color=043b69)](https://github.com/unseensnick/Reikai/releases) [![Stable downloads](https://img.shields.io/github/downloads/unseensnick/Reikai/total?maxAge=3600&label=Downloads&labelColor=27303D&color=0D1117&logo=github&logoColor=FFFFFF)](https://github.com/unseensnick/Reikai/releases) | [![Preview](https://img.shields.io/github/v/release/unseensnick/Reikai-preview?maxAge=3600&label=Preview&labelColor=2c2c47&color=1c1c39)](https://github.com/unseensnick/Reikai-preview/releases) [![Preview downloads](https://img.shields.io/github/downloads/unseensnick/Reikai-preview/total?maxAge=3600&label=Downloads&labelColor=27303D&color=0D1117&logo=github&logoColor=FFFFFF)](https://github.com/unseensnick/Reikai-preview/releases) |

*Requires Android 8.0 or higher.*

[![License: MPL-2.0](https://img.shields.io/badge/License-MPL--2.0-0877d2?labelColor=27303D)](./LICENSE)
[![Built with VitePress](https://img.shields.io/badge/Built%20with-VitePress-5c73e7?labelColor=27303D)](https://vitepress.dev)

</div>

## What is here

The site carries everything a Reikai user needs: how to install it, what each setting does, and how
the features it adds on top of Mihon work.

- **Download** for the stable and nightly builds, with per-architecture APKs and the latest release
  notes.
- **Guides** for getting started, the reader, backups, tracking, categories, the local source,
  source migration and troubleshooting.
- **Frequently asked questions** for the library, the reader, downloads, storage and browsing.
- **Related apps**, the other readers in the same lineage, and a **privacy policy** covering what
  the app stores and what it sends.

**Deployed to GitHub Pages** at `https://unseensnick.github.io/Reikai-website/`, built by
`.github/workflows/deploy.yml` on every push to `main`. The docs live in the app repo, so a change
there does not trigger a build: run the workflow by hand after one.

The site is served from a project page, so `base` in `src/.vitepress/config.mts` is
`/Reikai-website/`. VitePress prefixes markdown links, raw HTML `src` attributes and CSS `url()` for
you; it does **not** touch hand-written strings in the config or a Vue template, so those go through
the `BASE` constant or `withBase()`. Changing the base means checking both.

## Running it

```bash
npm install
npm run dev
```

That is all of it. No environment variables are needed: the app repo is found beside this one, and
the ref its links point at comes from whichever branch it is checked out on.

Copy `.env.example` to `.env` to override any of that. A real environment variable beats the file, so
a one-off still works.

- **`GITHUB_TOKEN`** lifts GitHub's unauthenticated rate limit, which the download and changelog
  pages both hit. Without one they still work until you reach the cap, then the version reads
  "unavailable" and the changelog page comes up empty. No scopes needed.
- **`REIKAI_APP_REPO`** if the app repo is not at `../app`.
- **`REIKAI_DOCS_REF`** to pin the ref that links into the app repo point at.

## Where the pages come from

**The docs are not stored here.** `scripts/sync-docs.mjs` reads them out of the app repo at build
time, so there is never a second copy to drift from the code that invalidates it, and
`scripts/sync-changelogs.mjs` builds the changelog page from the releases API. Both run as part of
`npm run dev` and `npm run build`, and both write into gitignored directories.

## Checking your work

`npm run build` fails on dead links, so run it. It is not much of a check on its own though, because
**most rendering failures leave the build green.** Read the built HTML in `src/.vitepress/dist`, or
drive the served page, before believing a page is fine.

Three that have bitten, all silent:

- `::: tabs` without `vitepress-plugin-tabs` renders as the literal `:::` text.
- A missing `.only-light` / `.only-dark` rule shows both halves of a light/dark image pair, stacked.
- Without `markdown: { headers: true }` every page builds with `headers: []`, so the "On this page"
  aside draws its title over nothing.

`npm run preview` serves the built output. Restart it after a rebuild rather than reloading, or you
will chase a fix that already landed.

## Credit

Parts of this site come from [Mihon's website](https://github.com/mihonapp/website): the `<nav>`
shortcode mechanism and its icon paths, the `.tree` folder-diagram styles, and the light/dark image
pair rules. The navigation map itself is Reikai's own, because the app's navigation differs.

The guides under `docs/guides/` and `docs/faq/` in the app repo are adapted from Mihon's too, and
carry their own attribution there.

## Contributing

A correction to a page is welcome, especially one that catches the docs describing something the app
no longer does. **Most pages are not in this repo:** everything under `/docs/` is served from
`docs/` in the [app repo](https://github.com/unseensnick/Reikai), so that is where to edit them. This
repo holds the site itself, the download and changelog pages, Related apps and the privacy policy.

For anything larger, open an issue first. This is a one-person project and a big pull request may
sit for a while.

## Disclaimer

The developer of this application does not have any affiliation with the content providers
available, and this application hosts zero content.

## License

Mihon's website is MPL-2.0, and enough of this one derives from it that the whole repo is MPL-2.0 as
well. The Reikai app itself is a separate repository under Apache-2.0.

<pre>
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
</pre>
