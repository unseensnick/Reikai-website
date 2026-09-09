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

/** A GitHub callout from the notes, kept whole: they are short and usually the reason to read. */
export interface SummaryAlert {
  kind: 'note' | 'tip' | 'important' | 'warning' | 'caution'
  text: string
}

/**
 * A capped read of the release notes for the download page.
 *
 * Capped because Reikai ships a lot per release: 0.3.0 alone runs to fifty-odd bullets across a
 * dozen sub-headings, and a cycle like 0.4.0 will be larger still. Rendering that whole thing on the
 * download page pushes the actual downloads off the screen, which is the one job that page has.
 */
export interface ReleaseSummary {
  alerts: SummaryAlert[]
  /** The prose a release opens with, when it has a Highlights block. Stands in for the list. */
  highlights: string[]
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
 * Highlights paragraphs shown before the link takes over. The block is already a summary, so this
 * is not about hiding detail: it is about leaving the download buttons on the first screen, which
 * is the one job this page has.
 */
const HIGHLIGHTS_LIMIT = 3

const ALERT_KINDS = ['note', 'tip', 'important', 'warning', 'caution'] as const

/**
 * The notes as the site should read them, without the part written for GitHub.
 *
 * release.yml and nightly.yml end the body with a `<!-->` marker and put the file guidance and the
 * checksums below it, because the in-app update dialog stops reading there. Nothing here stopped,
 * so the download page listed "Which file?" and its bullets as though they were changes.
 */
function trimFooter(body: string): string {
  return body
    .replace(/\r\n/g, '\n')
    .split('\n<!-->')[0]
    .split('\n**Full changelog:**')[0]
    .split('\n### Checksums')[0]
}

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
  const alerts: SummaryAlert[] = []
  const highlights: string[] = []
  const sections: SummarySection[] = []
  let total = 0
  let shown = 0
  let inHighlights = false
  let paragraph: string[] = []

  const flush = () => {
    const text = plain(paragraph.join(' '))
    paragraph = []
    if (text && highlights.length < HIGHLIGHTS_LIMIT) highlights.push(text)
  }

  for (const raw of trimFooter(body).split('\n')) {
    const line = raw.trim()

    // A callout is a quote whose first line names its kind. Its continuation lines are quoted too,
    // so they append until a line that is not, which is also what ends it.
    const opener = line.match(/^>\s*\[!(\w+)\]/i)
    if (opener) {
      const kind = opener[1].toLowerCase() as SummaryAlert['kind']
      if (ALERT_KINDS.includes(kind)) alerts.push({ kind, text: '' })
      continue
    }
    if (line.startsWith('>') && alerts.length > 0) {
      const rest = plain(line.replace(/^>\s?/, ''))
      const open = alerts[alerts.length - 1]
      if (rest) open.text = open.text ? `${open.text} ${rest}` : rest
      continue
    }

    const heading = line.match(/^#{2,6}\s+(.*)$/)
    if (heading) {
      if (inHighlights) flush()
      const title = plain(heading[1])
      inHighlights = title.toLowerCase() === 'highlights'
      // Only open a section once something goes in it, so a heading whose bullets all fell past the
      // cap does not leave an empty title behind.
      if (title && !inHighlights) sections.push({ title, items: [] })
      continue
    }

    if (inHighlights) {
      // A blank line ends a paragraph; the notes hard-wrap, so the lines between are one sentence.
      if (line) paragraph.push(line)
      else flush()
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
  if (inHighlights) flush()

  return {
    alerts: alerts.filter(a => a.text),
    highlights,
    // A release that opens with Highlights has already summarised itself, so the capped list of
    // whatever happened to come first would only compete with it.
    sections: highlights.length ? [] : sections.filter(s => s.items.length > 0),
    total,
    shown: highlights.length ? 0 : shown,
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
