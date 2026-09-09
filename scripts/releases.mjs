// One read of the GitHub releases API per build, shared by everything that needs it.
//
// The site reads releases from two places in two separate processes: scripts/sync-changelogs.mjs
// writes the changelogs page before the build, and src/.vitepress/theme/release.data.ts feeds the
// download page during it. Both used to issue their own releases?per_page=100 against the app repo,
// which doubled the rate-limit cost and let the two pages disagree when a release landed between
// them.
//
// An in-memory memo cannot span two processes, so the shared answer is a file. In CI the runner
// starts without one, so the first caller fetches and the second reads what it wrote.

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = resolve(root, '.cache/releases.json')

// Long enough that restarting the dev server does not refetch, short enough that a release
// published while you are working turns up without clearing anything by hand.
const TTL_MS = 15 * 60 * 1000

// Bump when the cached shape changes, so an older file is ignored rather than misread.
const SCHEMA = 1

function headers() {
  return {
    'accept': 'application/vnd.github+json',
    'user-agent': 'reikai-website',
    ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  }
}

async function readCache() {
  try {
    const json = JSON.parse(await readFile(CACHE, 'utf8'))
    if (json.schema !== SCHEMA) return null
    if (Date.now() - json.fetchedAt > TTL_MS) return null
    return json.repos ?? null
  } catch {
    return null
  }
}

async function writeCache(repos) {
  try {
    await mkdir(dirname(CACHE), { recursive: true })
    // Write beside the target and rename, so a concurrent reader never sees a half-written file.
    const tmp = `${CACHE}.${process.pid}.tmp`
    await writeFile(tmp, JSON.stringify({ schema: SCHEMA, fetchedAt: Date.now(), repos }))
    await rename(tmp, CACHE)
  } catch (error) {
    console.warn('releases: could not write the cache, continuing without it', error)
  }
}

/** Within one process, never read the file twice either. */
let memo = null

/**
 * Every release on a repo, newest first, drafts and prereleases included. Callers filter.
 *
 * Returns an empty list when GitHub cannot be reached, so the pages render without versions rather
 * than failing the deploy. That is wrong-but-visible, which beats a red build for a rate limit.
 */
export async function allReleases(repo) {
  if (!memo) memo = (await readCache()) ?? {}
  if (memo[repo]) return memo[repo]

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100`, {
      headers: headers(),
    })
    if (!res.ok) {
      console.warn(`releases: ${repo} returned ${res.status}`)
      return []
    }
    memo[repo] = await res.json()
  } catch (error) {
    console.warn(`releases: ${repo} failed`, error)
    return []
  }

  await writeCache(memo)
  return memo[repo]
}

/**
 * What /releases/latest would answer for a repo, without spending a second request on it.
 *
 * GitHub sorts both endpoints by created_at descending and /releases/latest is defined as the
 * newest release that is neither a draft nor a prerelease, so the first match here is that release.
 */
export async function latestRelease(repo) {
  const releases = await allReleases(repo)
  return releases.find((r) => !r.draft && !r.prerelease && r.tag_name) ?? null
}
