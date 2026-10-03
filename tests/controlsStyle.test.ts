import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8')

describe('controls restyle', () => {
  it.each(['ConfigPanel', 'PlaybackControls', 'ProtocolView'])('%s uses theme tokens, not default palette', (f) => {
    const src = read(`../src/components/${f}.tsx`)
    expect(src).not.toMatch(/\b(gray|blue|red|green|slate|zinc|neutral)-\d/)
    expect(src).toMatch(/\b(bg|text|border|ring)-(ivory|ink|saffron|peacock|vermilion)/)
  })
  it('keeps 44px touch targets on buttons', () => {
    expect(read('../src/components/PlaybackControls.tsx')).toMatch(/min-h-11/)
  })
})
