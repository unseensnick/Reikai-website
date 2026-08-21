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

export interface ReleaseInfo {
  tagName: string
  publishedAt: string | null
  body: string
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
