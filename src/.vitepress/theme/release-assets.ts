// Which file of a release to offer. The download cards and the home page both hand out the stable
// APK, so the rule lives here rather than twice.

import type { ReleaseInfo } from './release.data'

export type Flavour = 'standard' | 'foss'

// Identify a build by what it is NOT, rather than by its name. The channels name their files
// differently, `reikai-v0.3.1.apk` for stable and `reikai-r1535.apk` for nightly, so matching the
// version shape picked the wrong asset for one of them. Absence of an ABI token is true for both.
export const ABI = /(arm64-v8a|armeabi-v7a|x86_64|x86)/i

// A release ships the FOSS build beside the ordinary one, and it carries no ABI token either, so
// the rule above matched both and took whichever GitHub happened to list first. That silently
// served FOSS as the Stable download, which is a different app: it installs alongside rather than
// over, so moving off it costs a backup and restore. Every card now names the flavour it wants.
export const FOSS = /-foss[-.]/i

export function universal(release: ReleaseInfo | null, flavour: Flavour) {
  if (!release) return null
  return release.assets.find(
    a => a.name.endsWith('.apk') && !ABI.test(a.name) && FOSS.test(a.name) === (flavour === 'foss'),
  ) ?? null
}

export function size(bytes?: number) {
  return bytes ? `${(bytes / 1024 / 1024).toFixed(0)} MB` : ''
}
