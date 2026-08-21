# Reikai website

Documentation and download site for [Reikai](https://github.com/unseensnick/Reikai), built with
[VitePress](https://vitepress.dev).

## Running it

```bash
npm install
npm run dev
```

That is the whole thing. No environment variables are required: the app repo is found beside this
one, and the ref that repo links point at is read from whichever branch it is checked out on.

## Optional configuration

Copy `.env.example` to `.env` and fill in what you need. A real environment variable always wins over
the file, so a one-off override still works:

```bash
$env:GITHUB_TOKEN="..."; npm run dev   # PowerShell
GITHUB_TOKEN=... npm run dev           # bash
```

- **`GITHUB_TOKEN`** lifts GitHub's 60-request-per-hour cap for unauthenticated calls. The download
  page and the changelogs generator both read the releases API. Without a token they still work, but
  once you hit the cap the version reads "unavailable" and the changelog page comes up empty. It
  needs no scopes.
- **`REIKAI_APP_REPO`** if the app repo is not at `../app`.
- **`REIKAI_DOCS_REF`** to pin the ref that links into the app repo use. It defaults to the app
  repo's current branch. Nothing needs it today, because every such link currently sits in the
  dev-records footer that the sync strips; it matters the moment a doc links a repo file inline.

## How the content gets here

**The docs are not stored in this repo.** `scripts/sync-docs.mjs` reads them out of the app repo at
build time, so there is never a second copy to drift from the code that invalidates it. It walks the
whole `docs/` tree and splits by extension: markdown goes to `src/docs/` with the dev-records footer
dropped and repo-relative links rewritten, everything else is copied to `src/public/docs/`, which is
where an absolute `/docs/...` asset URL resolves. Contributor material living in the same tree
(`README.md`, `dev/`, `guides/PORTING.md`) is skipped.

`scripts/sync-changelogs.mjs` generates the changelogs page from the GitHub releases API, filtered to
the Mihon-era three-segment versions.

Both run automatically as part of `npm run dev` and `npm run build`, and both write into gitignored
directories.

## Checking your work

`npm run build` fails on dead links, so run it. But it is not much of a check on its own: **most
rendering failures leave the build green.** Read the built HTML in `src/.vitepress/dist`, or drive
the served page, before believing a page is fine.

Three that have bitten, all silent:

- `::: tabs` without `vitepress-plugin-tabs` renders as the literal `:::` text.
- A missing `.only-light` / `.only-dark` rule shows both screenshots of a light/dark pair, stacked.
- Without `markdown: { headers: true }` every page builds with `headers: []`, so the "On this page"
  aside draws its title over nothing.

`npm run preview` serves the built output, which is what to look at for production behaviour: the
release data is inlined at build time rather than hydrated. Restart it after a rebuild rather than
reloading, or you will chase a fix that already landed.

## Credit

Parts of this site come from [Mihon's website](https://github.com/mihonapp/website): the `<nav>`
shortcode mechanism and its icon paths, the `.tree` folder-diagram styles, and the light/dark image
pair rules. The navigation map itself is Reikai's own, because the app's navigation differs.

The guides under `docs/guides/` and `docs/faq/` in the app repo are adapted from Mihon's too, and
carry their own attribution there.

## License

Mihon's website is MPL-2.0, and enough of this one derives from it that the whole repo is MPL-2.0 as
well. The Reikai app itself is a separate repository under Apache-2.0.

<pre>
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
</pre>
