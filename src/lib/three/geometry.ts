import * as THREE from 'three'

/**
 * Outer glass shell only (no inner wall in the same mesh).
 * Cream is a separate opaque mesh — avoids transmission DoubleSide z-fighting.
 */
const JAR_PROFILE: [number, number][] = [
  // Thick clear base
  [0.0, 0.0],
  [0.55, 0.008],
  [0.92, 0.03],
  [1.0, 0.08],
  [1.04, 0.18],
  [1.05, 0.3],
  // Wide walls
  [1.05, 0.5],
  [1.045, 0.72],
  [1.03, 0.86],
  // Lip under collar
  [0.98, 0.9],
  [0.92, 0.915],
  [0.88, 0.92],
  // Cap the rim inward slightly (still outer surface)
  [0.86, 0.915],
]

export const JAR_HEIGHT = 0.92
export const JAR_RADIUS = 1.05
/** Cream sits below the closed lid so nothing pokes through the gold. */
export const CREAM_SURFACE = 0.82
export const COLLAR_Y = 0.9
/** Closed gold lid sits on the collar. */
export const LID_Y = 0.98

export function createJarGeometry(segments = 128) {
  const points = JAR_PROFILE.map(([x, y]) => new THREE.Vector2(x, y))
  const geometry = new THREE.LatheGeometry(points, segments)
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Short polished gold screw collar — matches the open neck in the photo.
 */
export function createCollarGeometry(segments = 72) {
  const profile: [number, number][] = [
    [0.86, 0.0],
    [0.98, 0.0],
    [1.0, 0.015],
    [0.995, 0.05],
    // Thread ridges
    [1.01, 0.06],
    [0.99, 0.07],
    [1.01, 0.08],
    [0.99, 0.09],
    [1.005, 0.1],
    [0.97, 0.115],
    [0.86, 0.115],
  ]
  const geometry = new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  )
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Dense white cream fill + soft whipped peaks rising slightly above the collar.
 */
export function createCreamMoundGeometry(segments = 64) {
  const geometry = new THREE.SphereGeometry(
    0.78,
    segments,
    Math.round(segments * 0.6),
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.48,
  )
  geometry.scale(1.08, 0.38, 1.08)
  geometry.translate(0, CREAM_SURFACE - 0.05, 0)

  const position = geometry.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(position.count * 3)
  const snow = new THREE.Color('#ffffff')
  const soft = new THREE.Color('#f7f7f7')
  const mix = new THREE.Color()

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)
    const r = Math.sqrt(x * x + z * z)
    const angle = Math.atan2(z, x)

    const ridges = Math.sin(angle * 3 + r * 6) * 0.022 * Math.max(0, 1 - r)
    const peak = Math.exp(-(r * r) * 4.5) * 0.075
    const edge = -Math.max(0, r - 0.65) * 0.12
    position.setY(i, y + ridges + peak + edge)

    mix.copy(soft).lerp(snow, 0.75)
    colors[i * 3] = mix.r
    colors[i * 3 + 1] = mix.g
    colors[i * 3 + 2] = mix.b
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

export function createCreamFillGeometry(segments = 64) {
  const wall: [number, number][] = [
    [0.0, 0.32],
    [0.55, 0.33],
    [0.75, 0.38],
    [0.85, 0.55],
    [0.86, 0.7],
    [0.82, CREAM_SURFACE],
  ]
  const geometry = new THREE.LatheGeometry(
    wall.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  )
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Matching gold screw-cap — wide flat lid that seals the collar when closed.
 */
export function createLidGeometry(segments = 80) {
  const profile: [number, number][] = [
    [0.0, 0.0],
    [0.96, 0.0],
    [1.01, 0.012],
    [1.02, 0.04],
    // Grip ridges
    [1.01, 0.055],
    [1.03, 0.07],
    [1.01, 0.085],
    [1.03, 0.1],
    [1.01, 0.115],
    [0.98, 0.13],
    // Flat top
    [0.75, 0.15],
    [0.4, 0.162],
    [0.0, 0.166],
  ]
  const geometry = new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  )
  geometry.computeVertexNormals()
  return geometry
}

export function createSerumDropletGeometry() {
  const geometry = new THREE.SphereGeometry(1, 32, 24)
  geometry.scale(0.78, 1.05, 0.78)

  const position = geometry.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(position.count * 3)
  const core = new THREE.Color('#fffef9')
  const rim = new THREE.Color('#c8e8ee')
  const glow = new THREE.Color('#e8d5a8')
  const mix = new THREE.Color()

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i)
    const t = (y + 1) * 0.5
    mix.copy(glow).lerp(rim, t * 0.5).lerp(core, t)
    colors[i * 3] = mix.r
    colors[i * 3 + 1] = mix.g
    colors[i * 3 + 2] = mix.b
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

export function createPearlGeometry() {
  return createSerumDropletGeometry()
}

export function createRibbonGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  segments = 200,
  widthFn: (t: number) => number = () => 0.2,
  twistFn: (t: number) => number = () => 0,
) {
  const frames = curve.computeFrenetFrames(segments, false)
  const positions = new Float32Array((segments + 1) * 6)
  const normals = new Float32Array((segments + 1) * 6)
  const uvs = new Float32Array((segments + 1) * 4)
  const indices: number[] = []

  const point = new THREE.Vector3()
  const across = new THREE.Vector3()
  const facing = new THREE.Vector3()
  const left = new THREE.Vector3()
  const right = new THREE.Vector3()

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    curve.getPointAt(t, point)

    const half = widthFn(t) * 0.5
    const twist = twistFn(t)
    const binormal = frames.binormals[i]
    const normal = frames.normals[i]

    across.copy(binormal).multiplyScalar(Math.cos(twist)).addScaledVector(normal, Math.sin(twist))
    facing.copy(normal).multiplyScalar(Math.cos(twist)).addScaledVector(binormal, -Math.sin(twist))

    left.copy(point).addScaledVector(across, -half)
    right.copy(point).addScaledVector(across, half)

    positions.set([left.x, left.y, left.z, right.x, right.y, right.z], i * 6)
    normals.set([facing.x, facing.y, facing.z, facing.x, facing.y, facing.z], i * 6)
    uvs.set([t, 0, t, 1], i * 4)

    if (i < segments) {
      const o = i * 2
      indices.push(o, o + 1, o + 2, o + 1, o + 3, o + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return geometry
}

export function createGoldRibbonCurves() {
  return [
    {
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.6, -1.2, -2.2),
        new THREE.Vector3(-1.7, 0.35, -1.4),
        new THREE.Vector3(-0.2, 1.35, -2.3),
        new THREE.Vector3(1.6, 0.55, -1.5),
        new THREE.Vector3(2.8, -0.85, -2.3),
      ]),
      width: (t: number) => 0.04 + Math.sin(t * Math.PI) ** 0.6 * 0.2,
      twist: (t: number) => t * Math.PI * 0.9,
    },
    {
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.5, -1.9, -0.5),
        new THREE.Vector3(-1.2, -1.35, 0.15),
        new THREE.Vector3(0.4, -1.7, -0.05),
        new THREE.Vector3(2.1, -1.1, -0.55),
        new THREE.Vector3(2.9, -0.25, -1.4),
      ]),
      width: (t: number) => 0.03 + Math.sin(t * Math.PI) ** 0.8 * 0.15,
      twist: (t: number) => -0.3 + t * Math.PI * 0.7,
    },
    {
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.0, 1.6, -2.5),
        new THREE.Vector3(-0.9, 0.4, -2.2),
        new THREE.Vector3(1.1, 0.95, -2.7),
        new THREE.Vector3(3.1, 1.85, -2.3),
      ]),
      width: (t: number) => 0.02 + Math.sin(t * Math.PI) ** 0.9 * 0.07,
      twist: (t: number) => t * Math.PI * 0.5,
    },
  ]
}
