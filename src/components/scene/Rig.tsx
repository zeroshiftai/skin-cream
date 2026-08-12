import { useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneState } from '@/lib/sceneState'

// Beauty-product framing — slightly lower to favor the wide jar silhouette.
const BASE_CAMERA = new THREE.Vector3(0, 1.55, 9.0)

/**
 * Gentle parallax + scroll dolly. Soft damping for cinematic luxury motion.
 */
export function Rig({ children, amplitude = 1 }: { children: ReactNode; amplitude?: number }) {
  const group = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useFrame((_, delta) => {
    const scroll = sceneState.scroll
    const entrance = THREE.MathUtils.smoothstep(sceneState.entrance, 0, 1)

    const targetX = sceneState.pointerX * 0.28 * amplitude
    const targetY = BASE_CAMERA.y + sceneState.pointerY * -0.16 * amplitude + scroll * 0.4
    const targetZ = BASE_CAMERA.z + (1 - entrance) * 1.4 - scroll * 0.95

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 1.6, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 1.6, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 1.4, delta)
    camera.lookAt(0, 0.35 - scroll * 0.3, 0)

    const stage = group.current
    if (!stage) return
    stage.rotation.y = THREE.MathUtils.damp(
      stage.rotation.y,
      sceneState.pointerX * -0.055 * amplitude,
      1.5,
      delta,
    )
    stage.rotation.x = THREE.MathUtils.damp(
      stage.rotation.x,
      sceneState.pointerY * 0.03 * amplitude,
      1.5,
      delta,
    )
  })

  return <group ref={group}>{children}</group>
}
