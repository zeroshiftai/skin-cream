import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { site } from '@/config/site'
import { useHeroScroll } from '@/hooks/useHeroScroll'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Split out so Three.js stays out of the initial bundle — the hero's copy and
 * gradient paint immediately while the WebGL stage streams in behind it.
 */
const CreamCanvas = lazy(() =>
  import('@/components/scene/CreamCanvas').then((m) => ({ default: m.CreamCanvas })),
)

/** Soft teal bokeh orbs in the DOM layer. */
const FOREGROUND_ORBS = [
  { className: 'left-[-2%] bottom-[4%] size-[9vw] max-w-[112px] max-h-[112px]', blur: 9, opacity: 0.35, drift: 18 },
  { className: 'left-[8%] bottom-[26%] size-[4.5vw] max-w-[58px] max-h-[58px]', blur: 5, opacity: 0.28, drift: -14 },
  { className: 'right-[-1%] bottom-[10%] size-[7.5vw] max-w-[92px] max-h-[92px]', blur: 10, opacity: 0.32, drift: 22 },
  { className: 'right-[12%] top-[16%] size-[3.5vw] max-w-[46px] max-h-[46px]', blur: 4, opacity: 0.22, drift: -20 },
]

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)
  const orbsRef = useRef<HTMLDivElement>(null)
  const [slide, setSlide] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  useHeroScroll(sectionRef)

  useEffect(() => {
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .from('[data-hero-line]', {
          yPercent: 118,
          duration: 1.15,
          stagger: 0.09,
        })
        .from(
          '[data-hero-fade]',
          { opacity: 0, y: 26, duration: 1, stagger: 0.08 },
          '-=0.75',
        )
        .from(
          '[data-hero-aside]',
          { opacity: 0, x: 40, duration: 1.05 },
          '-=0.85',
        )
        .from(
          '[data-hero-orb]',
          { opacity: 0, scale: 0.75, duration: 1.4, stagger: 0.1 },
          '-=1.1',
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-hero-orb]').forEach((orb, index) => {
        gsap.to(orb, {
          y: FOREGROUND_ORBS[index]?.drift ?? 16,
          duration: 10 + index * 2.2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })
    }, orbsRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  useEffect(() => {
    const id = window.setInterval(
      () => setSlide((current) => (current + 1) % site.hero.slides.length),
      4200,
    )
    return () => window.clearInterval(id)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[radial-gradient(120%_90%_at_50%_35%,#1a7a8a_0%,#0d5c6b_42%,#0a3a44_74%,#062f38_100%)]"
    >
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <CreamCanvas />
        </Suspense>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(75%_60%_at_50%_45%,transparent_35%,rgba(6,47,56,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 hidden bg-[linear-gradient(90deg,rgba(6,47,56,0.72)_0%,rgba(6,47,56,0.28)_26%,transparent_42%,transparent_58%,rgba(6,47,56,0.28)_76%,rgba(6,47,56,0.68)_100%)] lg:block" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(6,47,56,0.78)_0%,rgba(6,47,56,0.4)_34%,transparent_58%)] lg:hidden" />

      <div ref={orbsRef} className="pointer-events-none absolute inset-0 z-20">
        {FOREGROUND_ORBS.map((orb, index) => (
          <span
            key={index}
            data-hero-orb
            aria-hidden
            className={`absolute rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#a8d4dc_40%,#1a7a8a_100%)] ${orb.className}`}
            style={{
              filter: `blur(${orb.blur}px) saturate(1.05)`,
              opacity: orb.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-30 mx-auto flex min-h-[100svh] max-w-[1500px] flex-col px-5 pt-30 pb-8 md:px-8 lg:pt-36 lg:pb-10">
        <div className="grid flex-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
          <div ref={copyRef} className="max-w-md">
            <div data-hero-fade className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[10px] tracking-[0.4em] text-gold-light uppercase">
                {site.hero.eyebrow}
              </span>
            </div>

            <h1 className="font-display text-[clamp(2.6rem,7.5vw,6.5rem)] leading-[0.92] font-light tracking-[-0.02em] text-cream">
              {site.hero.headline.map((line) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <span data-hero-line className="block">
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p
              data-hero-fade
              className="mt-5 max-w-sm text-[14px] leading-relaxed text-cream/70 lg:mt-7 lg:text-[15px]"
            >
              {site.hero.body}
            </p>

            <div data-hero-fade className="mt-7 lg:mt-9">
              <a
                href="#ritual"
                className="group inline-flex items-center gap-3 rounded-full border border-cream/30 px-8 py-3.5 text-[11px] tracking-[0.24em] text-cream uppercase transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-espresso"
              >
                {site.hero.primaryCta}
                <svg viewBox="0 0 20 8" className="h-2 w-5 overflow-visible" fill="none" stroke="currentColor">
                  <path
                    d="M0 4h18M14.5 0.5 18.5 4l-4 3.5"
                    strokeWidth="1"
                    className="transition-transform duration-500 group-hover:translate-x-1"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Centre column stays empty — the WebGL jar lives there. */}
          <div className="hidden lg:block" aria-hidden />

          <div
            ref={asideRef}
            data-hero-aside
            className="hidden max-w-xs lg:ml-auto lg:block lg:text-right"
          >
            <span className="text-[10px] tracking-[0.36em] text-gold-light uppercase">
              {site.hero.aside.label}
            </span>
            <h2 className="font-display mt-4 text-2xl leading-snug font-light text-cream md:text-[28px]">
              {site.hero.aside.title}
            </h2>
            <p className="mt-4 text-[13px] leading-relaxed text-cream/65">
              {site.hero.aside.body}
            </p>
            <a
              href="#collection"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-light to-gold px-6 py-2.5 text-[10px] tracking-[0.22em] text-espresso uppercase shadow-[0_12px_30px_-14px_rgba(212,175,55,0.75)] transition-transform duration-400 hover:-translate-y-0.5"
            >
              {site.hero.aside.cta}
            </a>
          </div>
        </div>

        <div data-hero-fade className="mt-8 flex flex-col items-center gap-4 lg:mt-10 lg:gap-6">
          <div className="flex items-center gap-3">
            {site.hero.slides.map((label, index) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                aria-current={index === slide}
                onClick={() => setSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === slide ? 'w-8 bg-gold' : 'w-1.5 bg-cream/30 hover:bg-cream/50'
                }`}
              />
            ))}
          </div>

          <a
            href="#collection"
            className="rounded-full border border-cream/30 bg-cream/10 px-10 py-3 text-[11px] tracking-[0.26em] text-cream uppercase backdrop-blur-sm transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-espresso"
          >
            Shop the house
          </a>

          <span className="text-[10px] tracking-[0.3em] text-cream/55 uppercase">
            {site.hero.slides[slide]}
          </span>
        </div>
      </div>
    </section>
  )
}
