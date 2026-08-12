import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CREAM_SURFACE, createRibbonGeometry } from '@/lib/three/geometry'
import { createSoftSpriteTexture } from '@/lib/three/textures'
import { sceneState } from '@/lib/sceneState'

/**
 * Fan / wing cream splash matching the reference photo —
 * luminous sheet arcing up and left, tendrils, droplets, and gold bokeh.
 */
export function createCreamSplashSheets(segments = 120) {
  // Wide fan wing — sweeps up and left from the jar mouth
  const main = {
    curve: new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, CREAM_SURFACE, 0.02),
      new THREE.Vector3(-0.2, CREAM_SURFACE + 0.5, 0.1),
      new THREE.Vector3(-0.7, CREAM_SURFACE + 1.2, 0.0),
      new THREE.Vector3(-1.4, CREAM_SURFACE + 1.85, -0.2),
      new THREE.Vector3(-2.15, CREAM_SURFACE + 2.25, -0.45),
    ]),
    width: (t: number) => 0.1 + Math.sin(t * Math.PI) ** 0.55 * 1.75,
    twist: (t: number) => -0.35 + t * 1.05,
  }

  const secondary = {
    curve: new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, CREAM_SURFACE + 0.04, -0.06),
      new THREE.Vector3(-0.3, CREAM_SURFACE + 0.75, -0.22),
      new THREE.Vector3(-0.9, CREAM_SURFACE + 1.45, -0.4),
      new THREE.Vector3(-1.55, CREAM_SURFACE + 1.95, -0.65),
    ]),
    width: (t: number) => 0.05 + Math.sin(t * Math.PI) ** 0.75 * 0.7,
    twist: (t: number) => 0.35 + t * 0.7,
  }

  const tendrilA = {
    curve: new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, CREAM_SURFACE + 0.08, 0.12),
      new THREE.Vector3(-0.02, CREAM_SURFACE + 0.9, 0.4),
      new THREE.Vector3(-0.5, CREAM_SURFACE + 1.65, 0.65),
      new THREE.Vector3(-1.05, CREAM_SURFACE + 2.2, 0.5),
    ]),
    width: (t: number) => 0.035 + Math.sin(t * Math.PI) ** 0.9 * 0.28,
    twist: (t: number) => -0.55 + t * 1.2,
  }

  const tendrilB = {
    curve: new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, CREAM_SURFACE + 0.06, -0.1),
      new THREE.Vector3(-0.45, CREAM_SURFACE + 1.0, -0.5),
      new THREE.Vector3(-1.05, CREAM_SURFACE + 1.55, -0.8),
      new THREE.Vector3(-1.75, CREAM_SURFACE + 1.75, -0.95),
    ]),
    width: (t: number) => 0.025 + Math.sin(t * Math.PI) ** 0.85 * 0.2,
    twist: (t: number) => 0.45 + t * 0.85,
  }

  return [main, secondary, tendrilA, tendrilB].map(({ curve, width, twist }) =>
    createRibbonGeometry(curve, segments, width, twist),
  )
}

function paintSplashColors(geometry: THREE.BufferGeometry) {
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const warm = new THREE.Color('#fff8e8')
  const core = new THREE.Color('#ffffff')
  const cool = new THREE.Color('#a8e4f0')
  const mix = new THREE.Color()
  const uv = geometry.attributes.uv as THREE.BufferAttribute | undefined

  for (let i = 0; i < pos.count; i++) {
    const t = uv ? uv.getX(i) : THREE.MathUtils.clamp((pos.getY(i) - CREAM_SURFACE) / 2.2, 0, 1)
    if (t < 0.35) {
      mix.copy(warm).lerp(core, t / 0.35)
    } else {
      mix.copy(core).lerp(cool, (t - 0.35) / 0.65)
    }
    colors[i * 3] = mix.r
    colors[i * 3 + 1] = mix.g
    colors[i * 3 + 2] = mix.b
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

type Droplet = {
  t: number
  side: number
  size: number
  lag: number
}

function createDroplets(count: number): Droplet[] {
  return Array.from({ length: count }, () => ({
    t: 0.25 + Math.random() * 0.7,
    side: (Math.random() - 0.5) * 2,
    size: 0.035 + Math.random() * 0.07,
    lag: Math.random() * 0.25,
  }))
}

type CreamSplashProps = {
  lowPower?: boolean
}

/**
 * Luminous cream splash — fan sheet arcing up-left with tendrils,
 * droplets, and gold/white bokeh particles (photo reference).
 * Driven by sceneState.scroll (same as lid open).
 */
export function CreamSplash({ lowPower = false }: CreamSplashProps) {
  const group = useRef<THREE.Group>(null)
  const sheetsRef = useRef<THREE.Group>(null)
  const dropletsRef = useRef<THREE.InstancedMesh>(null)
  const sparksMat = useRef<THREE.PointsMaterial>(null)

  const sheets = useMemo(() => {
    const segs = lowPower ? 60 : 140
    return createCreamSplashSheets(segs).map(paintSplashColors)
  }, [lowPower])

  const dropletCount = lowPower ? 12 : 24
  const droplets = useMemo(() => createDroplets(dropletCount), [dropletCount])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const splashPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.02, CREAM_SURFACE, 0.02),
        new THREE.Vector3(-0.2, CREAM_SURFACE + 0.5, 0.1),
        new THREE.Vector3(-0.7, CREAM_SURFACE + 1.2, 0.0),
        new THREE.Vector3(-1.4, CREAM_SURFACE + 1.85, -0.2),
        new THREE.Vector3(-2.15, CREAM_SURFACE + 2.25, -0.45),
      ]),
    [],
  )

  const sparks = useMemo(() => {
    const count = lowPower ? 50 : 120
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = Math.random()
      const p = splashPath.getPointAt(t)
      // Cluster more particles near the mid-fan (where the photo glows)
      const spread = 0.4 + t * 0.9
      positions[i * 3] = p.x + (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = p.y + (Math.random() - 0.5) * (0.5 + t * 0.5)
      positions[i * 3 + 2] = p.z + (Math.random() - 0.5) * 0.7
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [lowPower, splashPath])

  const sparkSprite = useMemo(() => createSoftSpriteTexture(64), [])

  useFrame(({ clock }, delta) => {
    const open = THREE.MathUtils.clamp(sceneState.scroll * 5.5, 0, 1)
    const reveal = THREE.MathUtils.smoothstep(open, 0.12, 0.45)
    const grow = THREE.MathUtils.smoothstep(open, 0.18, 0.95)

    if (group.current) {
      group.current.visible = reveal > 0.02
      const s = 0.12 + grow * 0.88
      group.current.scale.set(
        THREE.MathUtils.damp(group.current.scale.x, s, 7, delta),
        THREE.MathUtils.damp(group.current.scale.y, s, 7, delta),
        THREE.MathUtils.damp(group.current.scale.z, s * 0.85, 7, delta),
      )
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.04
    }

    if (sheetsRef.current) {
      sheetsRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshPhysicalMaterial
          mat.opacity = reveal
          mat.emissiveIntensity = 0.45 + reveal * 0.9
        }
      })
    }

    if (dropletsRef.current) {
      dropletsRef.current.visible = grow > 0.08
      for (let i = 0; i < droplets.length; i++) {
        const d = droplets[i]
        const tt = THREE.MathUtils.clamp((grow - d.lag) / Math.max(0.01, 1 - d.lag), 0, 1)
        if (tt <= 0.001) {
          dummy.scale.setScalar(0.001)
        } else {
          const along = Math.min(0.98, d.t * tt + (1 - tt) * 0.05)
          const p = splashPath.getPointAt(along)
          const tangent = splashPath.getTangentAt(Math.min(0.98, d.t))
          const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()
          dummy.position.copy(p).addScaledVector(side, d.side * 0.35 * tt)
          dummy.position.y += tt * 0.15
          dummy.scale.setScalar(d.size * (0.4 + tt * 0.9))
        }
        dummy.updateMatrix()
        dropletsRef.current.setMatrixAt(i, dummy.matrix)
      }
      dropletsRef.current.instanceMatrix.needsUpdate = true
    }

    if (sparksMat.current) {
      sparksMat.current.opacity = reveal * 0.8
      sparksMat.current.size = 0.08 + Math.sin(clock.elapsedTime * 2) * 0.012
    }
  })

  return (
    <group ref={group} visible={false} scale={0.12}>
      <group ref={sheetsRef}>
        {sheets.map((geometry, index) => (
          <mesh key={index} geometry={geometry} renderOrder={4}>
            <meshPhysicalMaterial
              vertexColors
              roughness={0.18}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.1}
              sheen={1}
              sheenColor="#ffffff"
              emissive="#ffe8c0"
              emissiveIntensity={0.55}
              transparent
              opacity={0}
              side={THREE.DoubleSide}
              depthWrite={false}
              envMapIntensity={0.9}
            />
          </mesh>
        ))}
      </group>

      <instancedMesh
        ref={dropletsRef}
        args={[undefined, undefined, dropletCount]}
        frustumCulled={false}
        renderOrder={5}
        visible={false}
      >
        <sphereGeometry args={[1, 14, 10]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.2}
          metalness={0}
          clearcoat={1}
          emissive="#fff8e8"
          emissiveIntensity={0.5}
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </instancedMesh>

      <points geometry={sparks} frustumCulled={false} renderOrder={6}>
        <pointsMaterial
          ref={sparksMat}
          map={sparkSprite}
          color="#f0c878"
          size={0.09}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  )
}
