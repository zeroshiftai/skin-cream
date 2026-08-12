/** Desktop: landscape Kling 2253. Mobile: Video Project 1 portrait pack. */
export const splashFrames = {
  dir: '/frames/splash',
  mobileDir: '/frames/splash-mobile',
  prefix: 'frame_',
  ext: 'jpg',
  /** Desktop landscape sequence length. */
  count: 91,
  /** Phone portrait sequence (Video Project 1). */
  mobileCount: 86,
  /** Desktop: landscape frames. */
  width: 1920,
  height: 824,
  /** Mobile: portrait pack cropped from letterboxed source. */
  mobileWidth: 720,
  mobileHeight: 1196,
  /** Longer scroll = smoother scrub per frame. */
  scrollVh: 420,
  mobileScrollVh: 300,
} as const

export function splashFrameCount(mobile = false) {
  return mobile ? splashFrames.mobileCount : splashFrames.count
}

export function splashFrameSrc(index: number, mobile = false) {
  const n = String(index + 1).padStart(4, '0')
  const dir = mobile ? splashFrames.mobileDir : splashFrames.dir
  return `${dir}/${splashFrames.prefix}${n}.${splashFrames.ext}`
}

/** Prefer the light frame pack on phones / small viewports. */
export function preferMobileSplashFrames() {
  if (typeof window === 'undefined') return false
  const narrow = window.matchMedia('(max-width: 900px)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const lowMem =
    'deviceMemory' in navigator &&
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === 'number' &&
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4
  return narrow || (coarse && window.innerWidth < 1100) || lowMem
}
