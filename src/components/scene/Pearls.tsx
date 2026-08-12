import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createSerumDropletGeometry } from '@/lib/three/geometry'
import { sceneState } from '@/lib/sceneState'

type Droplet = {
  radius: number
  height: number
  angle: number
  orbitSpeed: number
  scale: number
  bobAmplitude: number
  bobSpeed: number
  spin: THREE.Vector3
  phase: number
  depth: number
}

function createDroplets(count: number): Droplet[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / count
    return {
      // Keep well outside the jar radius (~1.05) to avoid clipping.
      radius: 2.05 + (i % 4) * 0.4 + Math.random() * 0.35,
      height: -0.7 + Math.random() * 2.0,
      angle: t * Math.PI * 2 + Math.random() * 0.5,
      orbitSpeed: (0.025 + Math.random() * 0.04) * (Math.random() > 0.65 ? -1 : 1),
      scale: 0.04 + Math.random() * 0.06,
      bobAmplitude: 0.05 + Math.random() * 0.1,
      bobSpeed: 0.22 + Math.random() * 0.28,
      spin: new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 0.12,
      ),
      phase: Math.random() * Math.PI * 2,
      depth: -0.6 + Math.random() * 1.2,
    }
  })
}

/**
 * Glowing serum droplets orbiting the cream jar — skincare ritual atmosphere.
 */
export function SerumDroplets({ count = 14 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => createSerumDropletGeometry(), [])
  const droplets = useMemo(() => createDroplets(count), [count])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const instanced = mesh.current
    if (!instanced) return

    const time = clock.elapsedTime
    const disperse = 1 + sceneState.scroll * 0.7
    const reveal = THREE.MathUtils.smoothstep(sceneState.entrance, 0, 1)

    for (let i = 0; i < droplets.length; i++) {
      const d = droplets[i]
      const angle = d.angle + time * d.orbitSpeed
      const radius = d.radius * disperse

      dummy.position.set(
        Math.cos(angle) * radius,
        d.height + Math.sin(time * d.bobSpeed + d.phase) * d.bobAmplitude - sceneState.scroll * 0.75,
        Math.sin(angle) * radius * 0.58 + d.depth * 0.3,
      )

      dummy.rotation.set(d.spin.x * time + d.phase, d.spin.y * time, d.spin.z * time)

      const pop = THREE.MathUtils.clamp(reveal * 1.5 - i / droplets.length, 0, 1)
      dummy.scale.setScalar(d.scale * pop)
      dummy.updateMatrix()
      instanced.setMatrixAt(i, dummy.matrix)
    }

    instanced.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshPhysicalMaterial
        vertexColors
        roughness={0.08}
        metalness={0.05}
        transmission={0.55}
        thickness={0.4}
        ior={1.4}
        clearcoat={1}
        clearcoatRoughness={0.08}
        sheen={0.5}
        sheenColor="#fff8ef"
        envMapIntensity={1.4}
        transparent
        opacity={0.92}
      />
    </instancedMesh>
  )
}

/** @deprecated Use SerumDroplets */
export { SerumDroplets as Pearls }
