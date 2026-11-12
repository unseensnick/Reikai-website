// The card Discord draws for a link to a page, read from a JSON script in the head. Mihon's
// generateMeta hook is the reference. Two departures: the image is the static logo as a thumbnail,
// since this site generates no per-page card, and every Download button opens the download page
// rather than one APK, so the asset rule stays in release-assets.ts alone.

import type { HeadConfig } from 'vitepress'
import { allReleases, trimFooter } from '../../scripts/releases.mjs'

const STABLE_REPO = 'unseensnick/Reikai'
// --vp-c-brand-1 in light mode; the site keeps VitePress's default brand colour.
const ACCENT = 0x3451b2
// Discord ignores a component embed larger than this, so the notes shrink until it fits.
const MAX_BYTES = 3000
const NOTES_BYTES = 2200

export interface EmbedSite {
  /** "Reikai" or "Reikai Nightly", shown above the title. */
  label: string
  /** The stable site's origin, where the download and changelog pages live in both builds. */
  origin: string
  /** Origin plus base: where this build's docs live. */
  docs: string
  image: string
}

function truncateUtf8(value: string, maxBytes: number) {
  let result = ''
  let bytes = 0
  for (const character of value) {
    bytes += Buffer.byteLength(character, 'utf8')
    if (bytes > maxBytes) break
    result += character
  }
  return result
}

const timestamp = (iso?: string | null) => {
  const ms = iso ? Date.parse(iso) : Number.NaN
  return Number.isFinite(ms) ? `<t:${Math.floor(ms / 1000)}:R>` : null
}

const version = (release: any) => String(release.tag_name).replace(/^v/, '')

// From the first area heading, whole lines only. Discord renders headings to three levels, so the
// Added / Changed / Fixed level becomes bold, and callouts are dropped since it has no alert syntax.
function patchNotes(body: string, maxBytes: number) {
  const lines = trimFooter(body).split('\n')
  const first = lines.findIndex(line => /^###\s/.test(line))
  const notes = lines.slice(Math.max(first, 0))
    .filter(line => !line.startsWith('>'))
    .map(line => line.trimEnd().replace(/^####\s+(.*)$/, '**$1**'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  const cut = truncateUtf8(notes, maxBytes)
  if (cut.length === notes.length) return notes
  const lastBreak = cut.lastIndexOf('\n')
  return `${lastBreak > 0 ? cut.slice(0, lastBreak) : cut}\n…`
}

export async function discordEmbed(
  page: { relativePath: string, title: string, description: string, url: string },
  site: EmbedSite,
): Promise<HeadConfig[]> {
  const { relativePath: path, url } = page
  const download = `${site.origin}/download/`
  const changelogs = `${site.origin}/changelogs/`

  // Only the stable build has these pages, so the preview build never asks GitHub from here.
  const pageVersion = path.match(/^changelogs\/(\d+\.\d+\.\d+)\.md$/)?.[1]
  const releases = path === 'download/index.md' || path.startsWith('changelogs/')
    ? (await allReleases(STABLE_REPO)).filter((r: any) => !r.draft && !r.prerelease && r.tag_name)
    : []
  const latest = releases[0]
  const release = pageVersion ? releases.find((r: any) => version(r) === pageVersion) : latest

  const actions: { type: 2, style: 5, url: string, label: string }[] = []
  const action = (label: string, href: string) => actions.push({ type: 2, style: 5, url: href, label })
  if (path === 'index.md') {
    action('Get Reikai', download)
    action('Getting started', `${site.docs}docs/guides/getting-started`)
  }
  else if (path === 'download/index.md') {
    action('Download', download)
    if (latest) action('Changelog', `${changelogs}${version(latest)}`)
  }
  else if (path.startsWith('changelogs/')) {
    action('Download', download)
    if (pageVersion) action('All changelogs', changelogs)
    else if (latest) action('Latest changelog', `${changelogs}${version(latest)}`)
  }
  else if (path.startsWith('docs/faq/')) {
    action('Browse guides', `${site.docs}docs/guides/getting-started`)
    action('Download Reikai', download)
  }
  else if (path.startsWith('docs/')) {
    action('Download Reikai', download)
    action('Browse FAQs', `${site.docs}docs/faq/general`)
  }
  if (!actions.length) action('Open page', url)

  const heading = `**${site.label}**\n# [${truncateUtf8(page.title, 70)}](${url})`
  const description = page.description ? `\n${truncateUtf8(page.description, 350)}` : ''

  const build = (notesBytes: number) => {
    let body: object
    if (path.startsWith('changelogs/') && release) {
      const released = timestamp(release.published_at)
      const content = `**${site.label}**\n# [Reikai ${version(release)}](${changelogs}${version(release)})`
        + `${released ? `\nReleased ${released}` : ''}\n\n${patchNotes(release.body ?? '', notesBytes)}`
      // The notes want the full width, so the thumbnail is left off here, as upstream leaves its image.
      body = { type: 10, content }
    }
    else {
      const released = timestamp(latest?.published_at)
      const latestLine = path === 'download/index.md' && latest
        ? `\nLatest stable **${version(latest)}**${released ? ` released ${released}` : ''}`
        : ''
      body = {
        type: 9,
        components: [{ type: 10, content: `${heading}${description}${latestLine}` }],
        accessory: { type: 11, media: { url: site.image } },
      }
    }
    const embed = { component: { type: 17, accent_color: ACCENT, components: [body, { type: 1, components: actions }] } }
    // The JSON sits inside a <script>, so a `<` in the notes must not close it.
    return JSON.stringify(embed).replace(/</g, '\\u003c')
  }

  for (let notesBytes = NOTES_BYTES; notesBytes > 0; notesBytes -= 200) {
    const json = build(notesBytes)
    if (Buffer.byteLength(json, 'utf8') <= MAX_BYTES)
      return [['script', { id: 'discord:component-embed', type: 'application/json' }, json]]
  }
  return []
}
