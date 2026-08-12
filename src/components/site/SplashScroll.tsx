import { useCallback, useEffect, useRef, useState } from 'react'
import {
  preferMobileSplashFrames,
  splashFrameCount,
  splashFrames,
  splashFrameSrc,
} from '@/config/splashFrames'
import { site } from '@/config/site'
import { useScrollFrameScrub } from '@/hooks/useScrollFrameScrub'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type FrameCache = (HTMLImageElement | ImageBitmap | null)[]

function frameSize(frame: HTMLImageElement | ImageBitmap, mobile: boolean) {
  if ('naturalWidth' in frame && frame.naturalWidth) {
    return { sw: frame.naturalWidth, sh: frame.naturalHeight }
  }
  if ('width' in frame) {
    return { sw: frame.width, sh: frame.height }
  }
  return mobile
    ? { sw: splashFrames.mobileWidth, sh: splashFrames.mobileHeight }
    : { sw: splashFrames.width, sh: splashFrames.height }
}

/** Cover-fit — full-bleed (best for portrait on phones). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  canvasW: number,
  canvasH: number,
  sourceW: number,
  sourceH: number,
) {
  const scale = Math.max(canvasW / sourceW, canvasH / sourceH)
  const w = sourceW * scale
  const h = sourceH * scale
  ctx.fillStyle = '#062f38'
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.drawImage(source, (canvasW - w) * 0.5, (canvasH - h) * 0.5, w, h)
}


/**
 * Sticky full-viewport scroll scrub of the cinematic Kling clip.
 * Desktop: landscape 2253. Phones: portrait Video Project 1 pack.
 */
export function SplashScroll() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<FrameCache>([])
  const frameIndexRef = useRef(0)
  const rafRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const lockedMobileH = useRef(0)
  const mobileRef = useRef(preferMobileSplashFrames())

  const [ready, setReady] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(() => preferMobileSplashFrames())
  const prefersReducedMotion = usePrefersReducedMotion()

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { alpha: false, desynchronized: true })
    if (!canvas || !ctx) return

    const { w, h, dpr } = sizeRef.current
    if (w < 1 || h < 1) return

    const frame = framesRef.current[frameIndexRef.current]
    if (!frame) return

    const { sw, sh } = frameSize(frame, mobileRef.current)
    const pw = Math.floor(w * dpr)
    const ph = Math.floor(h * dpr)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = mobileRef.current ? 'medium' : 'high'

    // Full-bleed cover — landscape on desktop, portrait on phones.
    drawCover(ctx, frame, pw, ph, sw, sh)
  }, [])

  const schedulePaint = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(paint)
  }, [paint])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return

    const mobile = preferMobileSplashFrames()
    mobileRef.current = mobile
    setIsMobile(mobile)

    const dprCap = mobile ? 1.5 : 2
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), dprCap)

    // Size from the sticky stage (100svh) — not window.innerHeight,
    // which jumps when mobile browser chrome shows/hides and re-crops the jar.
    const rect = stage.getBoundingClientRect()
    let w = Math.max(1, Math.floor(rect.width || window.innerWidth))
    let h = Math.max(1, Math.floor(rect.height || window.innerHeight))

    if (mobile) {
      // Lock to the largest stable height seen so URL-bar collapse can’t zoom the product.
      if (lockedMobileH.current < 1) {
        lockedMobileH.current = Math.max(h, Math.floor(window.innerHeight))
      }
      h = lockedMobileH.current
      // Ignore tiny width jitter
      w = Math.max(1, Math.floor(window.innerWidth))
    }

    if (sizeRef.current.w === w && sizeRef.current.h === h && sizeRef.current.dpr === dpr) {
      return
    }

    sizeRef.current = { w, h, dpr }
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    schedulePaint()
  }, [schedulePaint])

  useEffect(() => {
    resize()
    const stage = stageRef.current
    const ro = stage ? new ResizeObserver(() => resize()) : null
    if (stage && ro) ro.observe(stage)

    const onOrientation = () => {
      lockedMobileH.current = 0
      resize()
    }
    window.addEventListener('orientationchange', onOrientation)
    window.addEventListener('resize', resize)
    return () => {
      ro?.disconnect()
      window.removeEventListener('orientationchange', onOrientation)
      window.removeEventListener('resize', resize)
    }
  }, [resize])

  useEffect(() => {
    let cancelled = false
    const mobile = preferMobileSplashFrames()
    mobileRef.current = mobile
    setIsMobile(mobile)

    const cache: FrameCache = Array.from({ length: splashFrameCount(mobile) }, () => null)
    framesRef.current = cache

    const total = splashFrameCount(mobile)
    const loadOne = (index: number) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = async () => {
          if (cancelled) {
            resolve()
            return
          }
          try {
            if ('createImageBitmap' in window) {
              // Keep decoded bitmaps at source size (already small on mobile pack).
              cache[index] = await createImageBitmap(img, {
                resizeQuality: mobile ? 'medium' : 'high',
              })
            } else {
              cache[index] = img
            }
          } catch {
            cache[index] = img
          }
          resolve()
        }
        img.onerror = () => resolve()
        img.src = splashFrameSrc(index, mobile)
      })

    ;(async () => {
      await loadOne(0)
      if (cancelled) return
      setReady(true)
      setLoadProgress(1 / total)
      schedulePaint()

      // Smaller parallel batches on mobile to avoid network + decode spikes.
      const batch = mobile ? 3 : 6
      for (let i = 1; i < total; i += batch) {
        if (cancelled) return
        const slice = Array.from(
          { length: Math.min(batch, total - i) },
          (_, j) => loadOne(i + j),
        )
        await Promise.all(slice)
        if (cancelled) return
        setLoadProgress(Math.min(1, (i + slice.length) / total))
        // Yield so Safari can reclaim / paint between batches.
        await new Promise((r) => setTimeout(r, mobile ? 16 : 0))
        if (frameIndexRef.current >= i) schedulePaint()
      }
    })()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      for (const frame of cache) {
        if (frame && 'close' in frame && typeof frame.close === 'function') {
          frame.close()
        }
      }
      framesRef.current = []
    }
  }, [schedulePaint])

  useScrollFrameScrub(sectionRef, {
    frameCount: splashFrameCount(isMobile),
    onProgress: (framePosition) => {
      const total = splashFrameCount(mobileRef.current)
      const index = Math.min(total - 1, Math.max(0, Math.round(framePosition)))
      if (index === frameIndexRef.current) return
      frameIndexRef.current = index
      schedulePaint()
    },
  })

  useEffect(() => {
    if (!prefersReducedMotion || !ready) return
    frameIndexRef.current = Math.floor(splashFrameCount(mobileRef.current) * 0.55)
    schedulePaint()
  }, [prefersReducedMotion, ready, schedulePaint])

  const scrollVh = isMobile ? splashFrames.mobileScrollVh : splashFrames.scrollVh
  const scrollStyle = prefersReducedMotion ? undefined : { height: `${scrollVh}vh` }

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative bg-teal-deep"
      style={scrollStyle}
      aria-label="Cream splash scroll sequence"
    >
      <div ref={stageRef} className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(4,28,34,0.45)_0%,transparent_28%,transparent_72%,rgba(4,28,34,0.2)_100%),linear-gradient(180deg,rgba(4,28,34,0.4)_0%,transparent_22%,transparent_78%,rgba(4,28,34,0.35)_100%)]"
          aria-hidden
        />

        {!ready && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-teal-deep">
            <div className="h-px w-24 overflow-hidden bg-cream/20">
              <div
                className="h-full bg-gold transition-[width] duration-300"
                style={{ width: `${Math.max(8, loadProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-30 flex flex-col justify-between px-5 pt-14 pb-10 md:px-8 lg:pt-16">
          <div className="mx-auto w-full max-w-[1500px]">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[10px] tracking-[0.4em] text-gold-light uppercase">
                {site.hero.eyebrow}
              </span>
            </div>
            <h1 className="font-display max-w-xl text-[clamp(2.4rem,6.5vw,5.5rem)] leading-[0.94] font-light tracking-[-0.02em] text-cream">
              {site.hero.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-cream/70">
              Scroll to open the cream — luminous whip in motion.
            </p>
          </div>

          <div className="mx-auto flex w-full max-w-[1500px] items-end justify-between gap-6">
            <a
              href="#collection"
              className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-cream/30 px-7 py-3 text-[11px] tracking-[0.24em] text-cream uppercase transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-espresso"
            >
              {site.hero.primaryCta}
            </a>
            {!prefersReducedMotion && (
              <span className="text-[10px] tracking-[0.32em] text-cream/50 uppercase">
                Scroll
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
