# Reikai website

Documentation and download site for [Reikai](https://github.com/unseensnick/Reikai), built with
[VitePress](https://vitepress.dev).

## Running it

```bash
npm install
npm run dev
```

The user docs are **not** stored here. `scripts/sync-docs.mjs` reads them out of the app repo at
build time, so there is never a second copy to drift from the code that invalidates it. It expects
the app repo beside this one, or `REIKAI_APP_REPO` pointing at it.

While a release cycle is open, some docs reference dev records that only exist on the working
branch, so build with that ref:

```bash
REIKAI_DOCS_REF=feat/0.4.0 npm run dev
```

`scripts/sync-changelogs.mjs` generates the changelogs page from the GitHub releases API. Set
`GITHUB_TOKEN` in CI to avoid the unauthenticated rate limit.

## Credit

The `<nav>` shortcode and its icon paths come from [Mihon's website](https://github.com/mihonapp/website),
which is MPL-2.0. The navigation map itself is Reikai's own, because the app's navigation differs.
