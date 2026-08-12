import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneState } from '@/lib/sceneState'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hero scroll → sceneState.scroll.
 * Ends after ~70% of the viewport so lid/open progress fills quickly
 * instead of waiting for the full hero to leave the screen.
 */
export function useHeroScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: '+=70%',
      onUpdate: (self) => {
        sceneState.scroll = self.progress
      },
    })

    return () => {
      trigger.kill()
      sceneState.scroll = 0
    }
  }, [ref])
}
