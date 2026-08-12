import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createSoftSpriteTexture } from '@/lib/three/textures'
import { sceneState } from '@/lib/sceneState'

const VERTEX_SHADER = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;

  uniform float uTime;
  uniform float uPixelScale;

  varying float vTwinkle;

  void main() {
    vec3 offset = position;
    offset.x += sin(uTime * 0.1 + aSeed * 17.0) * 0.28;
    offset.y += sin(uTime * 0.08 + aSeed * 29.0) * 0.22 + uTime * 0.015;
    offset.z += cos(uTime * 0.09 + aSeed * 11.0) * 0.2;

    // Wrap vertical drift
    offset.y = mod(offset.y + 3.5, 7.0) - 3.5;

    vec4 mvPosition = modelViewMatrix * vec4(offset, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelScale / max(-mvPosition.z, 0.001);

    vTwinkle = 0.4 + 0.6 * pow(abs(sin(uTime * 0.7 + aSeed * 40.0)), 2.5);
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uSprite;
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vTwinkle;

  void main() {
    float mask = texture2D(uSprite, gl_PointCoord).a;
    if (mask < 0.01) discard;
    gl_FragColor = vec4(uColor, mask * vTwinkle * uOpacity);
  }
`

/** Soft champagne cosmetic sparkles drifting upward through the stage. */
export function GoldDust({ count = 220, lowPower = false }: { count?: number; lowPower?: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const group = useRef<THREE.Points>(null)
  const { size, viewport } = useThree()
  const sprite = useMemo(() => createSoftSpriteTexture(64), [])

  const geometry = useMemo(() => {
    const total = lowPower ? Math.round(count * 0.4) : count
    const positions = new Float32Array(total * 3)
    const seeds = new Float32Array(total)
    const sizes = new Float32Array(total)

    for (let i = 0; i < total; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6.5
      positions[i * 3 + 2] = -2.8 + Math.random() * 4.5
      seeds[i] = Math.random()
      sizes[i] = 2.5 + Math.random() * 10
    }

    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    buffer.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12)
    return buffer
  }, [count, lowPower])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSprite: { value: sprite },
      uColor: { value: new THREE.Color('#e8d48a') },
      uOpacity: { value: 0.55 },
      uPixelScale: { value: 1 },
    }),
    [sprite],
  )

  useFrame(({ clock }) => {
    const mat = material.current
    if (mat) {
      mat.uniforms.uTime.value = clock.elapsedTime
      mat.uniforms.uPixelScale.value = (size.height / viewport.height) * 0.045
      mat.uniforms.uOpacity.value =
        0.55 * THREE.MathUtils.smoothstep(sceneState.entrance, 0, 1) * (1 - sceneState.scroll * 0.55)
    }
    if (group.current) {
      group.current.position.y = -sceneState.scroll * 0.65
    }
  })

  return (
    <points ref={group} geometry={geometry} frustumCulled={false} renderOrder={5}>
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
