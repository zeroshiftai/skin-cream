import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createGoldRibbonCurves, createRibbonGeometry } from '@/lib/three/geometry'
import { sceneState } from '@/lib/sceneState'

/**
 * Soft champagne ribbons flowing behind the jar — elegant, slow beauty-set motion.
 */
export function GoldRibbons({ lowPower = false }: { lowPower?: boolean }) {
  const group = useRef<THREE.Group>(null)

  const ribbons = useMemo(() => {
    const segments = lowPower ? 90 : 220
    return createGoldRibbonCurves().map(({ curve, width, twist }) =>
      createRibbonGeometry(curve, segments, width, twist),
    )
  }, [lowPower])

  useFrame(({ clock }, delta) => {
    const mesh = group.current
    if (!mesh) return

    const time = clock.elapsedTime
    mesh.rotation.y = THREE.MathUtils.damp(
      mesh.rotation.y,
      Math.sin(time * 0.06) * 0.1 + sceneState.pointerX * 0.06 + sceneState.scroll * 0.35,
      1.2,
      delta,
    )
    mesh.rotation.x = THREE.MathUtils.damp(
      mesh.rotation.x,
      Math.sin(time * 0.045) * 0.035 + sceneState.pointerY * 0.03,
      1.2,
      delta,
    )
    mesh.position.y = -sceneState.scroll * 1.15
    mesh.scale.setScalar(0.65 + THREE.MathUtils.smoothstep(sceneState.entrance, 0, 1) * 0.35)
  })

  return (
    <group ref={group}>
      {ribbons.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshPhysicalMaterial
            color={index === 2 ? '#f0dfb0' : '#d4b078'}
            metalness={1}
            roughness={index === 2 ? 0.18 : 0.3}
            clearcoat={0.85}
            clearcoatRoughness={0.25}
            envMapIntensity={2.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
