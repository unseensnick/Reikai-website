// Build-time release data for the download page.
//
// Reikai publishes to two buckets: stable releases on the app repo, and the pre-release channel on
// unseensnick/Reikai-preview. The repo name stayed "preview" after the build type was renamed to
// nightly, because renaming it on GitHub would strand every installed build already polling it.
//
// This is a VitePress data loader, so it runs once at build time and the result is baked into the
// page. Set GITHUB_TOKEN in CI to avoid the 60/hour unauthenticated rate limit.

import { defineLoader } from 'vitepress'

import { allReleases, latestRelease } from '../../../scripts/releases.mjs'

const STABLE_REPO = 'unseensnick/Reikai'
const NIGHTLY_REPO = 'unseensnick/Reikai-preview'

export interface ReleaseAsset {
  name: string
  browser_download_url: string
  size: number
}

/** One heading from the release notes and the changes under it. */
export interface SummarySection {
  title: string
  items: string[]
}

/**
 * A capped read of the release notes for the download page.
 *
 * Capped because Reikai ships a lot per release: 0.3.0 alone runs to fifty-odd bullets across a
 * dozen sub-headings, and a cycle like 0.4.0 will be larger still. Rendering that whole thing on the
 * download page pushes the actual downloads off the screen, which is the one job that page has.
 */
export interface ReleaseSummary {
  sections: SummarySection[]
  /** Changes in the notes altogether, so the page can say how many it is not showing. */
  total: number
  /** Changes actually in [sections]. */
  shown: number
}

export interface ReleaseInfo {
  tagName: string
  publishedAt: string | null
  body: string
  summary: ReleaseSummary
  htmlUrl: string
  assets: ReleaseAsset[]
}

export interface ReleaseData {
  stable: ReleaseInfo | null
  nightly: ReleaseInfo | null
  /** Every stable release, newest first, for the changelogs section. */
  stableAll: ReleaseInfo[]
}

declare const data: ReleaseData
export { data }

/**
 * How many changes the download page shows before it stops and links to the full changelog.
 * Twelve is about a screenful next to the download cards on a phone.
 */
const SUMMARY_LIMIT = 12

/**
 * Inline markdown down to plain text. This is a teaser with the real thing one link away, so a
 * bolded word or a contributor link earns nothing here, and stripping them avoids rendering
 * release-note markup from a remote source.
 */
function plain(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Release notes are generated from the CHANGELOG, so they are headings with bullets under them and
 * nothing else. Anything that is not one of those two is dropped rather than guessed at.
 */
function summarize(body: string): ReleaseSummary {
  const sections: SummarySection[] = []
  let total = 0
  let shown = 0

  for (const raw of body.split('\n')) {
    const line = raw.trim()
    const heading = line.match(/^#{2,6}\s+(.*)$/)
    if (heading) {
      const title = plain(heading[1])
      // Only open a section once something goes in it, so a heading whose bullets all fell past the
      // cap does not leave an empty title behind.
      if (title) sections.push({ title, items: [] })
      continue
    }
    const bullet = line.match(/^[-*]\s+(.*)$/)
    if (!bullet) continue
    total++
    if (shown >= SUMMARY_LIMIT) continue
    const item = plain(bullet[1])
    if (!item) continue
    if (sections.length === 0) sections.push({ title: '', items: [] })
    sections[sections.length - 1].items.push(item)
    shown++
  }

  return { sections: sections.filter(s => s.items.length > 0), total, shown }
}

function toInfo(json: any): ReleaseInfo {
  return {
    tagName: json.tag_name,
    publishedAt: json.published_at,
    body: json.body ?? '',
    summary: summarize(json.body ?? ''),
    htmlUrl: json.html_url,
    assets: json.assets ?? [],
  }
}

// The changelogs section lists every stable release, so this reads the whole list. Drafts and
// pre-releases are excluded: the nightly channel is its own repo and its notes are the per-build
// diff, which would swamp a page meant to read as version history.
async function allStable(): Promise<ReleaseInfo[]> {
  const releases = await allReleases(STABLE_REPO)
  return releases.filter(r => !r.draft && !r.prerelease && r.tag_name).map(toInfo)
}

export default defineLoader({
  async load(): Promise<ReleaseData> {
    // Both repos come from scripts/releases.mjs, which fetches each one once per build and shares
    // the answer with sync-changelogs.mjs through a cache file. The newest stable is taken off the
    // list rather than from /releases/latest, which would be a third request for a release the
    // list already contains.
    const [stableAll, nightlyJson] = await Promise.all([
      allStable(),
      latestRelease(NIGHTLY_REPO),
    ])
    return {
      stable: stableAll[0] ?? null,
      nightly: nightlyJson ? toInfo(nightlyJson) : null,
      stableAll,
    }
  },
})
