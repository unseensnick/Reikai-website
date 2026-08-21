// Pulls the user docs out of the app repo so this site never owns a second copy of them.
//
// The docs live in Reikai's app repo because that is where the code change that invalidates a doc
// happens, and the project's rule is that a behaviour change updates its docs in the same commit.
// A copy checked into this repo would drift the first time that rule fired, so the site reads them
// at build time instead and rewrites the two things that only make sense inside the repo:
//
//   1. the italic "Dev records: ..." footer each doc opens with, which points at dev/plans/*.md and
//      is contributor material, not user material. Dropped.
//   2. links to files that exist in the repo but not on the site (ROADMAP.md, CHANGELOG.md, dev/*).
//      Rewritten to absolute GitHub URLs so they still resolve.
//
// Illustrations live beside their pages in the app repo for the same reason the markdown does, and
// are referenced by absolute `/docs/...` URLs. They are copied into this site's `public/docs/`,
// where that URL resolves.

import { readdir, readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { APP_REPO as APP_REPO_RESOLVED, DOCS_REF, describe } from './env.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const APP_REPO = APP_REPO_RESOLVED
const SOURCE = join(APP_REPO, 'docs')
const OUT = resolve(here, '../src/docs')
const ASSET_OUT = resolve(here, '../src/public/docs')
// The ref those rewritten links point at, resolved in env.mjs: it defaults to the branch the app
// repo is checked out at, because a doc can reference a dev record that exists only there.
const BLOB = `https://github.com/unseensnick/Reikai/blob/${DOCS_REF}`

// Contributor material that sits in the same tree as the user docs. `README.md` is the repo's own
// doc map and describes three tiers of docs of which only one is published here; `dev/` is the
// implementation records; `guides/PORTING.md` is the record of the Mihon port, addressed to whoever
// edits those guides next. All three read as user docs to a walker and are not.
const SKIP = new Set(['README.md', 'dev', 'guides/PORTING.md'])

// Singular and plural both occur ("_Dev record:_" on a doc with one record), and missing a variant
// leaves the line in with links this site does not publish.
const DEV_FOOTER = /^_Dev records?:.*$\n?/m
const REPO_LINK = /\]\((?!https?:|#)((?:dev\/|\.\.\/)[^)]+|ROADMAP\.md|CHANGELOG\.md)\)/g

// A link is relative to docs/, so `dev/plans/x.md` lives at `docs/dev/plans/x.md` in the repo while
// `../ROADMAP.md` climbs out of it. Getting this wrong yields a 404 that still renders as a link.
function repoPath(link) {
  if (link.startsWith('../')) return link.slice(3)
  if (link === 'ROADMAP.md' || link === 'CHANGELOG.md') return link
  return `docs/${link}`
}

function transform(markdown) {
  return markdown
    .replace(DEV_FOOTER, '')
    .replace(REPO_LINK, (_, link) => `](${BLOB}/${repoPath(link)})`)
    .replace(/\n{3,}/g, '\n\n')
    .trimStart()
}

// Every entry under docs/, as a path relative to it, with forward slashes so SKIP and the extension
// checks read the same on Windows.
async function walk(dir = '') {
  const entries = await readdir(join(SOURCE, dir), { withFileTypes: true })
  const found = []
  for (const entry of entries) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name
    if (SKIP.has(rel)) continue
    if (entry.isDirectory()) found.push(...(await walk(rel)))
    else found.push(rel)
  }
  return found
}

if (!existsSync(SOURCE)) {
  console.error(`sync-docs: no docs at ${SOURCE}`)
  console.error('Set REIKAI_APP_REPO to the Reikai app repo, or clone it beside this one.')
  process.exit(1)
}

await rm(OUT, { recursive: true, force: true })
await rm(ASSET_OUT, { recursive: true, force: true })

let docs = 0
let assets = 0
for (const rel of await walk()) {
  const markdown = rel.endsWith('.md')
  const dest = join(markdown ? OUT : ASSET_OUT, rel)
  await mkdir(dirname(dest), { recursive: true })
  if (markdown) {
    await writeFile(dest, transform(await readFile(join(SOURCE, rel), 'utf8')), 'utf8')
    docs++
  } else {
    await copyFile(join(SOURCE, rel), dest)
    assets++
  }
}

console.log(`sync-docs: ${docs} docs, ${assets} assets (${describe()})`)
