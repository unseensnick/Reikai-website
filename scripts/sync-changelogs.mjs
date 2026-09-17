// Generates the Changelogs page, every stable release stacked newest first, and one page per release
// at /changelogs/<version> so a single release can be linked to.
//
// This writes real markdown rather than rendering releases in a Vue component, because VitePress
// builds the "On this page" outline, the heading anchors and the local search index from the
// markdown at build time. A component's headings exist only in the DOM, so they reach none of the
// three. Writing the page means version jumps, deep links and search all work with no extra code.
//
// Set GITHUB_TOKEN to avoid the 60/hour unauthenticated rate limit.

import { writeFile, mkdir, readdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PREVIEW } from './env.mjs'
import { allReleases } from './releases.mjs'

// The changelog page is built into the stable site only, so the preview build skips the API calls.
if (PREVIEW) {
  console.log('sync-changelogs: skipped for the preview build')
  process.exit(0)
}

const here = dirname(fileURLToPath(import.meta.url))
const DIR = resolve(here, '../src/changelogs')
const OUT = resolve(DIR, 'index.md')
const REPO = 'unseensnick/Reikai'
const NIGHTLY_REPO = 'unseensnick/Reikai-preview'

// The release body ends with the pipeline's own footer: a full-changelog link, a compare link and a
// checksum table. Useful on GitHub, noise on a page that is already the changelog, so it is cut.
function trimBody(body) {
  return (
    body
      .replace(/\r\n/g, '\n')
      .split(/\n\*\*Full changelog:\*\*/)[0]
      .split(/\n### Checksums/)[0]
      // A release note can link a doc the way the repo does, `docs/foo.md`, which resolves on
      // GitHub and is dead from /changelogs/. The same page exists here at /docs/foo.
      .replace(/\]\(\.?\/?docs\/([^)]+?)\.md\)/g, '](/docs/$1)')
      .trim()
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Only the Mihon-era releases. Reikai's tag history starts with the Yokai-based app, versioned as
// five segments (1.9.7.5.N); the rebase onto Mihon restarted at 0.1.0 with three. Those older notes
// describe a different app, so they belong in the repo's history rather than on a page a user reads
// to see what changed. The three-segment test keeps working past 1.0.0.
const releases = (await allReleases(REPO))
  .filter((r) => !r.draft && !r.prerelease && r.tag_name)
  .filter((r) => /^v?\d+\.\d+\.\d+$/.test(r.tag_name))

const intro = `---
title: Changelogs
description: Release history for Reikai.
lastUpdated: false
editLink: false
prev: false
next: false
outline: [2, 2]
---

# Changelogs

Changelogs of all Reikai stable releases, which are also available [on GitHub](https://github.com/${REPO}/releases).<br>
Nightly releases can be seen [on GitHub](https://github.com/${NIGHTLY_REPO}/releases).
`

const body = releases.length
  ? releases
      .map((release, index) => {
        const version = release.tag_name.replace(/^v/, '')
        const latest = index === 0 ? ' <Badge type="tip" text="Latest" />' : ''
        const date = formatDate(release.published_at)
        const notes = trimBody(release.body ?? '')
        // No explicit `---` between releases: VitePress already draws a border above every h2, so
        // an <hr> as well renders two rules stacked. The version links to its own page; the heading's
        // anchor is taken from its text, so existing #0-3-2 style links keep working.
        return [
          `## [${version}](/changelogs/${version})${latest}`,
          '',
          date ? `<p class="release-date">${date}</p>` : '',
          '',
          notes || '_No release notes._',
        ]
          .filter((line) => line !== null)
          .join('\n')
      })
      .join('\n\n')
  : '\nRelease history could not be loaded. It is always available on GitHub.\n'

await mkdir(DIR, { recursive: true })
await writeFile(OUT, `${intro}\n${body}\n`, 'utf8')

// Every page this script wrote last time goes first, so a release pulled from GitHub leaves no page.
for (const file of await readdir(DIR)) {
  if (/^\d+\.\d+\.\d+\.md$/.test(file)) await rm(resolve(DIR, file))
}

// Kept out of local search, since the stacked page already indexes every release once.
for (const release of releases) {
  const version = release.tag_name.replace(/^v/, '')
  const date = formatDate(release.published_at)
  const page = `---
title: Reikai ${version}
description: ${date ? `Changelog for Reikai ${version}, released ${date}.` : `Changelog for Reikai ${version}.`}
lastUpdated: false
editLink: false
search: false
prev:
  text: Changelogs
  link: /changelogs/
next: false
outline: [2, 3]
---

# Reikai ${version}

${date ? `<p class="release-date">${date}</p>\n\n` : ''}${trimBody(release.body ?? '') || '_No release notes._'}

[All changelogs](/changelogs/) · [On GitHub](https://github.com/${REPO}/releases/tag/${release.tag_name})
`
  await writeFile(resolve(DIR, `${version}.md`), page, 'utf8')
}
console.log(`sync-changelogs: ${releases.length} releases`)
