import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Options = {
  frameCount: number
  /** Receives a fractional frame position for smooth scrubbing. */
  onProgress: (framePosition: number, progress: number) => void
}

/**
 * Maps sticky-section scroll progress → fractional frame position.
 * Uses GSAP scrub so Lenis/native scroll feels butter-smooth.
 */
export function useScrollFrameScrub(
  sectionRef: RefObject<HTMLElement | null>,
  { frameCount, onProgress }: Options,
) {
  const onProgressRef = useRef(onProgress)
  onProgressRef.current = onProgress

  useEffect(() => {
    const el = sectionRef.current
    if (!el || frameCount < 1) return

    const state = { frame: 0 }

    const tween = gsap.to(state, {
      frame: frameCount - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.65,
        onUpdate: (self) => {
          onProgressRef.current(state.frame, self.progress)
        },
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [sectionRef, frameCount])
}
