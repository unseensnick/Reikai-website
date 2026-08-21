// Build-time release data for the download page.
//
// Reikai publishes to two buckets: stable releases on the app repo, and the pre-release channel on
// unseensnick/Reikai-preview. The repo name stayed "preview" after the build type was renamed to
// nightly, because renaming it on GitHub would strand every installed build already polling it.
//
// This is a VitePress data loader, so it runs once at build time and the result is baked into the
// page. Set GITHUB_TOKEN in CI to avoid the 60/hour unauthenticated rate limit.

import { defineLoader } from 'vitepress'

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

async function latest(repo: string): Promise<ReleaseInfo | null> {
  const headers: Record<string, string> = {
    'accept': 'application/vnd.github+json',
    'user-agent': 'reikai-website',
  }
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers })
    if (!res.ok) {
      // A missing or rate-limited release must not fail the build: the page renders the card
      // without a version instead, which is wrong-but-visible rather than a broken deploy.
      console.warn(`release.data: ${repo} returned ${res.status}`)
      return null
    }
    const json = await res.json() as {
      tag_name: string
      published_at: string | null
      body: string | null
      html_url: string
      assets: ReleaseAsset[]
    }
    return {
      tagName: json.tag_name,
      publishedAt: json.published_at,
      body: json.body ?? '',
      summary: summarize(json.body ?? ''),
      htmlUrl: json.html_url,
      assets: json.assets ?? [],
    }
  } catch (error) {
    console.warn(`release.data: ${repo} failed`, error)
    return null
  }
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

// The changelogs section lists every stable release, so this is a list call rather than /latest.
// Drafts and pre-releases are excluded: the nightly channel is its own repo and its notes are the
// per-build diff, which would swamp a page meant to read as version history.
async function allStable(): Promise<ReleaseInfo[]> {
  const headers: Record<string, string> = {
    'accept': 'application/vnd.github+json',
    'user-agent': 'reikai-website',
  }
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  try {
    const res = await fetch(`https://api.github.com/repos/${STABLE_REPO}/releases?per_page=100`, { headers })
    if (!res.ok) {
      console.warn(`release.data: ${STABLE_REPO} releases returned ${res.status}`)
      return []
    }
    const json = await res.json() as any[]
    return json.filter(r => !r.draft && !r.prerelease && r.tag_name).map(toInfo)
  } catch (error) {
    console.warn(`release.data: ${STABLE_REPO} releases failed`, error)
    return []
  }
}

export default defineLoader({
  async load(): Promise<ReleaseData> {
    const [stable, nightly, stableAll] = await Promise.all([
      latest(STABLE_REPO),
      latest(NIGHTLY_REPO),
      allStable(),
    ])
    return { stable, nightly, stableAll }
  },
})
