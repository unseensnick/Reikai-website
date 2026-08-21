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

The user docs are **not** stored in this repo. `scripts/sync-docs.mjs` reads them out of the app repo
at build time, so there is never a second copy to drift from the code that invalidates it. It drops
the dev-records footer and rewrites repo-relative links.

`scripts/sync-changelogs.mjs` generates the changelogs page from the GitHub releases API, filtered to
the Mihon-era three-segment versions.

Both run automatically as part of `npm run dev` and `npm run build`.

## Checking your work

`npm run build` fails on dead links, so it is the real check. `npm run preview` then serves the built
output, which is what to look at when you want production behaviour: the release data is inlined at
build time rather than hydrated.

## Credit

The `<nav>` shortcode and its icon paths come from [Mihon's website](https://github.com/mihonapp/website),
which is MPL-2.0. The navigation map itself is Reikai's own, because the app's navigation differs.
