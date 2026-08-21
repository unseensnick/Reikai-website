// Generates the Changelogs page: one page, every stable release stacked newest first.
//
// This writes real markdown rather than rendering releases in a Vue component, because VitePress
// builds the "On this page" outline, the heading anchors and the local search index from the
// markdown at build time. A component's headings exist only in the DOM, so they reach none of the
// three. Writing the page means version jumps, deep links and search all work with no extra code.
//
// Set GITHUB_TOKEN to avoid the 60/hour unauthenticated rate limit.

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../src/changelogs/index.md')
const REPO = 'unseensnick/Reikai'
const NIGHTLY_REPO = 'unseensnick/Reikai-preview'

const headers = {
  accept: 'application/vnd.github+json',
  'user-agent': 'reikai-website',
  ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
}

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

let releases = []
try {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, { headers })
  if (res.ok) {
    const json = await res.json()
    // Only the Mihon-era releases. Reikai's tag history starts with the Yokai-based app, versioned
    // as five segments (1.9.7.5.N); the rebase onto Mihon restarted at 0.1.0 with three. Those older
    // notes describe a different app, so they belong in the repo's history rather than on a page a
    // user reads to see what changed. The three-segment test keeps working past 1.0.0.
    releases = json
      .filter((r) => !r.draft && !r.prerelease && r.tag_name)
      .filter((r) => /^v?\d+\.\d+\.\d+$/.test(r.tag_name))
  } else {
    console.warn(`sync-changelogs: ${res.status} from GitHub, writing an empty page`)
  }
} catch (error) {
  console.warn('sync-changelogs: fetch failed, writing an empty page', error)
}

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
        // an <hr> as well renders two rules stacked.
        return [
          `## ${version}${latest}`,
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

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, `${intro}\n${body}\n`, 'utf8')
console.log(`sync-changelogs: ${releases.length} releases`)
