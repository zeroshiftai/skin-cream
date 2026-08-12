import * as THREE from 'three'

function createCanvas(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas
}

function finish(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

/**
 * Deep teal draped-studio backdrop matching the cream product photograph.
 */
export function createBackdropTexture(size = 1024) {
  const canvas = createCanvas(size)
  const ctx = canvas.getContext('2d')!

  const base = ctx.createLinearGradient(0, 0, size * 0.15, size)
  base.addColorStop(0, '#2a8a9a')
  base.addColorStop(0.25, '#1a7a8a')
  base.addColorStop(0.5, '#0d5c6b')
  base.addColorStop(0.75, '#0a3a44')
  base.addColorStop(1, '#062f38')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  // Soft key bloom behind the product
  const bloom = ctx.createRadialGradient(
    size * 0.5,
    size * 0.38,
    size * 0.04,
    size * 0.5,
    size * 0.38,
    size * 0.55,
  )
  bloom.addColorStop(0, 'rgba(180, 230, 235, 0.45)')
  bloom.addColorStop(0.35, 'rgba(26, 122, 138, 0.28)')
  bloom.addColorStop(0.7, 'rgba(10, 58, 68, 0.1)')
  bloom.addColorStop(1, 'rgba(6, 47, 56, 0)')
  ctx.fillStyle = bloom
  ctx.fillRect(0, 0, size, size)

  // Draped fabric folds (soft vertical bands)
  for (let i = 0; i < 7; i++) {
    const x = (i / 6) * size
    const fold = ctx.createLinearGradient(x - 40, 0, x + 80, 0)
    fold.addColorStop(0, 'rgba(6, 47, 56, 0)')
    fold.addColorStop(0.45, `rgba(6, 47, 56, ${0.08 + (i % 2) * 0.06})`)
    fold.addColorStop(1, 'rgba(6, 47, 56, 0)')
    ctx.fillStyle = fold
    ctx.fillRect(x - 40, 0, 140, size)
  }

  // Soft vignette
  const vignette = ctx.createRadialGradient(
    size * 0.5,
    size * 0.45,
    size * 0.18,
    size * 0.5,
    size * 0.45,
    size * 0.8,
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(0.6, 'rgba(4, 30, 36, 0.2)')
  vignette.addColorStop(1, 'rgba(2, 18, 22, 0.55)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, size, size)

  // Teal bokeh
  for (let i = 0; i < 16; i++) {
    const bx = Math.random() * size
    const by = Math.random() * size
    const r = 10 + Math.random() * 48
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, r)
    g.addColorStop(0, `rgba(160, 220, 230, ${0.06 + Math.random() * 0.1})`)
    g.addColorStop(1, 'rgba(160, 220, 230, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(bx, by, r, 0, Math.PI * 2)
    ctx.fill()
  }

  return finish(canvas)
}

/** Soft ivory marble for secondary surfaces. */
export function createMarbleTexture(size = 512) {
  const canvas = createCanvas(size)
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1a3038'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    const x0 = Math.random() * size
    const y0 = Math.random() * size
    ctx.moveTo(x0, y0)
    for (let j = 0; j < 4; j++) {
      ctx.quadraticCurveTo(
        x0 + (Math.random() - 0.5) * size * 0.4,
        y0 + (Math.random() - 0.5) * size * 0.4,
        x0 + (Math.random() - 0.5) * size * 0.6,
        y0 + (Math.random() - 0.5) * size * 0.6,
      )
    }
    ctx.strokeStyle = `rgba(120, 160, 170, ${0.04 + Math.random() * 0.08})`
    ctx.lineWidth = 1 + Math.random() * 2.5
    ctx.stroke()
  }

  const texture = finish(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

/** Soft round sprite for mist and sparkle point clouds. */
export function createSoftSpriteTexture(size = 128) {
  const canvas = createCanvas(size)
  const ctx = canvas.getContext('2d')!
  const c = size / 2
  const gradient = ctx.createRadialGradient(c, c, 0, c, c, c)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return finish(canvas)
}
