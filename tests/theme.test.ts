import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8')

describe('design foundation', () => {
  const css = read('../src/index.css')
  it.each(['ivory', 'ink', 'saffron', 'peacock', 'vermilion'])('defines --color-%s in @theme', (c) => {
    expect(css).toMatch(/@theme[\s\S]*--color-/)
    expect(css).toContain(`--color-${c}:`)
  })
  it('defines a system font stack without webfonts', () => {
    expect(css).toContain('--font-sans:')
    expect(css).not.toMatch(/@import url|@font-face/)
  })
  it('App shell uses theme tokens and no default gray', () => {
    const app = read('../src/App.tsx')
    expect(app).toMatch(/bg-ivory/)
    expect(app).toMatch(/text-ink/)
    expect(app).not.toMatch(/\bgray-\d/)
  })
})
