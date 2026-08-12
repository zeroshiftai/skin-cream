import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createSoftSpriteTexture } from '@/lib/three/textures'
import { sceneState } from '@/lib/sceneState'
import { CREAM_SURFACE } from '@/lib/three/geometry'

const VERTEX_SHADER = /* glsl */ `
  attribute float aSeed;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aSway;

  uniform float uTime;
  uniform float uPixelScale;
  uniform float uRise;

  varying float vAlpha;
  varying float vLife;

  void main() {
    float life = fract(uTime * aSpeed * 0.055 + aSeed);
    float rise = life * uRise;

    vec3 offset = position;
    float spread = 0.04 + life * 0.42;
    offset.x += sin(uTime * 0.28 + aSeed * 31.4 + rise * 1.6) * spread * aSway;
    offset.z += cos(uTime * 0.24 + aSeed * 22.7 + rise * 1.4) * spread * aSway;
    offset.y += rise;

    vec4 mvPosition = modelViewMatrix * vec4(offset, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelScale * (0.5 + life * 2.2) / max(-mvPosition.z, 0.001);

    vAlpha = smoothstep(0.0, 0.18, life) * (1.0 - smoothstep(0.42, 1.0, life));
    vLife = life;
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uSprite;
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vLife;

  void main() {
    float mask = texture2D(uSprite, gl_PointCoord).a;
    if (mask < 0.01) discard;
    vec3 tint = mix(uColor, vec3(1.0, 0.98, 0.94), vLife * 0.4);
    gl_FragColor = vec4(tint, mask * vAlpha * uOpacity);
  }
`

/**
 * Subtle golden cosmetic mist rising from the open jar — beauty ritual, not steam.
 */
export function Mist({ count = 160, lowPower = false }: { count?: number; lowPower?: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()
  const sprite = useMemo(() => createSoftSpriteTexture(), [])

  const geometry = useMemo(() => {
    const total = lowPower ? Math.round(count * 0.4) : count
    const positions = new Float32Array(total * 3)
    const seeds = new Float32Array(total)
    const speeds = new Float32Array(total)
    const sizes = new Float32Array(total)
    const sways = new Float32Array(total)

    for (let i = 0; i < total; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.sqrt(Math.random()) * 0.28
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = CREAM_SURFACE + Math.random() * 0.05
      positions[i * 3 + 2] = Math.sin(angle) * radius

      seeds[i] = Math.random()
      speeds[i] = 0.35 + Math.random() * 0.45
      sizes[i] = 12 + Math.random() * 30
      sways[i] = 0.4 + Math.random() * 0.7
    }

    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    buffer.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    buffer.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    buffer.setAttribute('aSway', new THREE.BufferAttribute(sways, 1))
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, 0), 5)
    return buffer
  }, [count, lowPower])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSprite: { value: sprite },
      uColor: { value: new THREE.Color('#c8e8ee') },
      uOpacity: { value: 0.09 },
      uPixelScale: { value: 1 },
      uRise: { value: 1.35 },
    }),
    [sprite],
  )

  useFrame(({ clock }) => {
    const mat = material.current
    if (!mat) return
    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uPixelScale.value = (size.height / viewport.height) * 0.055
    const lidOpen = THREE.MathUtils.smoothstep(sceneState.scroll, 0.04, 0.4)
    mat.uniforms.uOpacity.value =
      0.09 *
      THREE.MathUtils.smoothstep(sceneState.entrance, 0.25, 1) *
      (0.3 + lidOpen * 0.7) *
      (1 - sceneState.scroll * 0.65)
  })

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={4}>
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
