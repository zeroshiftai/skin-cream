import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import { sceneState } from '@/lib/sceneState'
import { useBreakpoint } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Backdrop } from './Backdrop'
import { CreamJar3D } from './CreamJar3D'
import { GoldDust } from './GoldDust'
import { GoldRibbons } from './GoldRibbons'
import { Mist } from './Mist'
import { SerumDroplets } from './Pearls'
import { Pedestal } from './Pedestal'
import { Rig } from './Rig'

/** Teal beauty-studio HDRI matching the cream product photograph. */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#0d5c6b']} />
      <Lightformer
        form="rect"
        intensity={5.5}
        color="#e8f6f8"
        position={[-1.5, 4.2, 3.2]}
        rotation={[0, 0, 0]}
        scale={[8, 5.5, 1]}
      />
      <Lightformer
        form="rect"
        intensity={4.5}
        color="#f0d9a8"
        position={[4.2, 2.0, -2.6]}
        rotation={[0, -Math.PI / 2.5, 0]}
        scale={[6, 4.5, 1]}
      />
      <Lightformer
        form="rect"
        intensity={2.8}
        color="#7ec8d4"
        position={[-4.5, 0.8, -1.2]}
        rotation={[0, Math.PI / 2.5, 0]}
        scale={[5.5, 4.5, 1]}
      />
      <Lightformer
        form="rect"
        intensity={2.2}
        color="#1a7a8a"
        position={[0, -3.4, 1.2]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[9, 7, 1]}
      />
      <Lightformer form="ring" intensity={3.8} color="#ffe4b0" position={[1.4, 2.8, -2.8]} scale={2.2} />
      <Lightformer form="ring" intensity={2.2} color="#ffffff" position={[-1.2, 3.5, 2]} scale={1.4} />
    </Environment>
  )
}

function Stage({ lowPower, compact }: { lowPower: boolean; compact: boolean }) {
  return (
    <>
      <ambientLight intensity={0.32} color="#c8e8ee" />
      <directionalLight position={[-2.5, 5.2, 4.2]} intensity={1.15} color="#f0fafc" />
      <directionalLight position={[4.2, 2.2, -3.2]} intensity={0.85} color="#f0d4a0" />
      <directionalLight position={[-4, 1.2, 1]} intensity={0.45} color="#7ec8d4" />
      <pointLight position={[0.6, 2.4, 3.6]} intensity={2.6} distance={12} decay={2} color="#ffe9cc" />
      <pointLight position={[-1.8, 1.2, 2.2]} intensity={1.4} distance={10} decay={2} color="#b8e4ec" />
      <pointLight position={[0, -0.4, 1.5]} intensity={0.8} distance={6} decay={2} color="#1a7a8a" />

      <StudioEnvironment />
      <Backdrop />

      <Rig amplitude={lowPower ? 0.35 : 0.7}>
        <group position={[0, compact ? -1.55 : -0.4, 0]} scale={compact ? 0.88 : 1}>
          <GoldRibbons lowPower={lowPower} />
          <group scale={1.0}>
            <Pedestal />
            <CreamJar3D lowPower={lowPower} />
            <Mist lowPower={lowPower} />
          </group>
          <SerumDroplets count={lowPower ? 8 : 14} />
        </group>
        <GoldDust lowPower={lowPower} />
      </Rig>
    </>
  )
}

export function CreamCanvas() {
  const { isMobile, isTablet } = useBreakpoint()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [degraded, setDegraded] = useState(false)

  const lowPower = isMobile || isTablet || degraded
  const compact = isMobile

  useEffect(() => {
    if (prefersReducedMotion) {
      sceneState.entrance = 1
      return
    }

    sceneState.entrance = 0
    const tween = gsap.to(sceneState, {
      entrance: 1,
      duration: 3.2,
      delay: 0.2,
      ease: 'power2.out',
    })
    return () => {
      tween.kill()
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return

    const onPointerMove = (event: PointerEvent) => {
      sceneState.pointerX = (event.clientX / window.innerWidth) * 2 - 1
      sceneState.pointerY = (event.clientY / window.innerHeight) * 2 - 1
    }
    const onPointerLeave = () => {
      sceneState.pointerX = 0
      sceneState.pointerY = 0
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [prefersReducedMotion])

  return (
    <Canvas
      dpr={[1, lowPower ? 1.5 : 2]}
      frameloop={prefersReducedMotion ? 'demand' : 'always'}
      camera={{ fov: 32, near: 0.1, far: 60, position: [0, 1.35, 10.2] }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <PerformanceMonitor onDecline={() => setDegraded(true)} />
      <Suspense fallback={null}>
        <Stage lowPower={lowPower} compact={compact} />
        {!lowPower && (
          <EffectComposer multisampling={4} enableNormalPass={false}>
            <Bloom intensity={0.38} luminanceThreshold={0.78} luminanceSmoothing={0.4} mipmapBlur />
            <Vignette offset={0.22} darkness={0.38} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  )
}
