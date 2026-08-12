import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  COLLAR_Y,
  CREAM_SURFACE,
  LID_Y,
  createCollarGeometry,
  createCreamFillGeometry,
  createCreamMoundGeometry,
  createJarGeometry,
  createLidGeometry,
} from '@/lib/three/geometry'
import { sceneState } from '@/lib/sceneState'
import { CreamSplash } from './CreamSplash'

type CreamJar3DProps = {
  lowPower?: boolean
}

const GOLD = '#d4af37'
const GOLD_LIGHT = '#e8d48a'

/**
 * Cream jar with sealed gold lid. Cream is hidden while closed;
 * when the lid opens, cream appears and a luminous fan splash erupts.
 */
export function CreamJar3D({ lowPower = false }: CreamJar3DProps) {
  const group = useRef<THREE.Group>(null)
  const lid = useRef<THREE.Group>(null)
  const creamGroup = useRef<THREE.Group>(null)
  const openAmt = useRef(0)

  const jarGeometry = useMemo(() => createJarGeometry(lowPower ? 72 : 128), [lowPower])
  const collarGeometry = useMemo(() => createCollarGeometry(lowPower ? 48 : 72), [lowPower])
  const creamMound = useMemo(() => createCreamMoundGeometry(lowPower ? 40 : 64), [lowPower])
  const creamFill = useMemo(() => createCreamFillGeometry(lowPower ? 48 : 64), [lowPower])
  const lidGeometry = useMemo(() => createLidGeometry(lowPower ? 56 : 80), [lowPower])

  useFrame((_, delta) => {
    const mesh = group.current
    if (!mesh) return

    const idle = performance.now() * 0.00006
    const target = idle + sceneState.scroll * 0.45 + sceneState.pointerX * 0.06
    mesh.rotation.y = THREE.MathUtils.damp(mesh.rotation.y, target, 1.6, delta)
    mesh.rotation.z = THREE.MathUtils.damp(
      mesh.rotation.z,
      sceneState.pointerX * -0.018,
      2,
      delta,
    )

    const open = THREE.MathUtils.clamp(sceneState.scroll * 5.5, 0, 1)
    openAmt.current = THREE.MathUtils.damp(openAmt.current, open, 10, delta)
    const o = openAmt.current

    if (lid.current) {
      lid.current.position.y = THREE.MathUtils.damp(lid.current.position.y, LID_Y + o * 2.1, 8, delta)
      lid.current.position.x = THREE.MathUtils.damp(lid.current.position.x, o * 0.55, 8, delta)
      lid.current.rotation.z = THREE.MathUtils.damp(lid.current.rotation.z, o * -0.85, 8, delta)
      lid.current.rotation.y = THREE.MathUtils.damp(lid.current.rotation.y, o * 0.6, 8, delta)
    }

    const creamReveal = THREE.MathUtils.smoothstep(o, 0.12, 0.35)
    if (creamGroup.current) {
      creamGroup.current.visible = creamReveal > 0.02
      creamGroup.current.scale.setScalar(0.92 + creamReveal * 0.12)
      creamGroup.current.position.y = (1 - creamReveal) * -0.15
      creamGroup.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshPhysicalMaterial
          if ('opacity' in mat) {
            mat.transparent = true
            mat.opacity = creamReveal
            mat.depthWrite = creamReveal > 0.5
          }
        }
      })
    }
  })

  return (
    <group ref={group}>
      <group ref={creamGroup} visible={false}>
        <mesh geometry={creamFill} renderOrder={0}>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.55}
            metalness={0}
            clearcoat={0.35}
            clearcoatRoughness={0.4}
            sheen={0.5}
            sheenColor="#ffffff"
            envMapIntensity={0.35}
            side={THREE.FrontSide}
            transparent
            opacity={0}
          />
        </mesh>
        <mesh geometry={creamMound} renderOrder={0}>
          <meshPhysicalMaterial
            vertexColors
            roughness={0.4}
            metalness={0}
            clearcoat={0.7}
            clearcoatRoughness={0.22}
            sheen={0.7}
            sheenColor="#ffffff"
            envMapIntensity={0.5}
            side={THREE.FrontSide}
            transparent
            opacity={0}
          />
        </mesh>
        <mesh position={[0.04, CREAM_SURFACE + 0.05, 0.02]} renderOrder={0}>
          <sphereGeometry args={[0.15, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.28}
            metalness={0}
            clearcoat={0.9}
            clearcoatRoughness={0.15}
            sheen={0.8}
            sheenColor="#ffffff"
            envMapIntensity={0.6}
            transparent
            opacity={0}
          />
        </mesh>
      </group>

      {/* Luminous fan splash — like the reference photo */}
      <CreamSplash lowPower={lowPower} />

      <mesh geometry={jarGeometry} renderOrder={1}>
        <meshPhysicalMaterial
          transmission={1}
          thickness={lowPower ? 0.35 : 0.55}
          ior={1.5}
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          attenuationColor="#ffffff"
          attenuationDistance={4}
          envMapIntensity={1.2}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      <mesh geometry={collarGeometry} position={[0, COLLAR_Y, 0]} renderOrder={2}>
        <meshPhysicalMaterial
          color={GOLD}
          metalness={1}
          roughness={0.22}
          clearcoat={0.6}
          clearcoatRoughness={0.18}
          envMapIntensity={2.6}
          depthWrite
        />
      </mesh>

      <group ref={lid} position={[0, LID_Y, 0]} renderOrder={3}>
        <mesh geometry={lidGeometry}>
          <meshPhysicalMaterial
            color={GOLD}
            metalness={1}
            roughness={0.18}
            clearcoat={0.7}
            clearcoatRoughness={0.12}
            envMapIntensity={2.8}
            depthWrite
          />
        </mesh>
        <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.96, 1.02, 80]} />
          <meshPhysicalMaterial
            color={GOLD_LIGHT}
            metalness={1}
            roughness={0.14}
            envMapIntensity={2.8}
            side={THREE.FrontSide}
            depthWrite
          />
        </mesh>
      </group>
    </group>
  )
}
