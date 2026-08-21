// Resolves the site's configuration so `npm run dev` needs no environment variables at all.
//
// Order of precedence, highest first:
//   1. a real environment variable, so CI and one-off overrides still win
//   2. a `.env` file beside package.json, which is gitignored
//   3. a derived default
//
// The derived default that matters is REIKAI_DOCS_REF. Docs can link to dev records that only exist
// on the branch being worked on, and pointing those at `main` makes the build fail on dead links. So
// it defaults to whatever branch the app repo is actually checked out at, which is right during a
// cycle and right again after the merge.

import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadDotEnv() {
  const file = resolve(root, '.env')
  if (!existsSync(file)) return
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 1) continue
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    // A real environment variable wins, so `$env:X=...; npm run dev` still overrides the file.
    if (!process.env[key]) process.env[key] = value
  }
}

function appRepo() {
  return process.env.REIKAI_APP_REPO ?? resolve(root, '../app')
}

function currentBranch(repo) {
  try {
    const branch = execFileSync('git', ['-C', repo, 'rev-parse', '--abbrev-ref', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    // A detached HEAD reports "HEAD", which is not a ref anyone can link to.
    return branch && branch !== 'HEAD' ? branch : null
  } catch {
    return null
  }
}

loadDotEnv()

export const APP_REPO = appRepo()
export const DOCS_REF = process.env.REIKAI_DOCS_REF ?? currentBranch(APP_REPO) ?? 'main'
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''

// Make the resolved values visible to anything downstream that reads process.env, including the
// VitePress data loader, which runs in this same process during a build.
process.env.REIKAI_APP_REPO = APP_REPO
process.env.REIKAI_DOCS_REF = DOCS_REF

export function describe() {
  return `app repo ${APP_REPO}, docs ref ${DOCS_REF}, GitHub token ${GITHUB_TOKEN ? 'set' : 'not set'}`
}
