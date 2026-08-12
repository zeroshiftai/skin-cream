import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneState } from '@/lib/sceneState'

/**
 * Photo-matched pedestal — dark mirror top, thick polished gold rim.
 */
export function Pedestal() {
  const group = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const mesh = group.current
    if (!mesh) return
    const reveal = THREE.MathUtils.smoothstep(sceneState.entrance, 0.2, 1)
    mesh.position.y = -0.35 + Math.sin(clock.elapsedTime * 0.28) * 0.005 - sceneState.scroll * 1.2
    mesh.scale.set(reveal, reveal, reveal)
  })

  return (
    <group ref={group} position={[0, -0.35, 0]}>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[1.2, 1.25, 0.18, 96]} />
        <meshPhysicalMaterial
          color="#12262c"
          roughness={0.3}
          metalness={0.25}
          clearcoat={0.55}
          clearcoatRoughness={0.25}
          envMapIntensity={1}
        />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.15, 80]} />
        <meshPhysicalMaterial
          color="#0a181c"
          roughness={0.03}
          metalness={1}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={2.8}
        />
      </mesh>

      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[1.25, 1.28, 0.15, 96, 1, true]} />
        <meshPhysicalMaterial
          color="#d4af37"
          metalness={1}
          roughness={0.2}
          envMapIntensity={3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.28, 96]} />
        <meshPhysicalMaterial
          color="#e8d48a"
          metalness={1}
          roughness={0.12}
          envMapIntensity={3.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Soft contact shadow — layered, no hard disc */}
      <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 64]} />
        <meshBasicMaterial color="#021018" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.023, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 48]} />
        <meshBasicMaterial color="#021018" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  )
}
