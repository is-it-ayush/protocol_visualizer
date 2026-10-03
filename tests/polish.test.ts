import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(import.meta.url), '..', '..', 'src')
function walk(d: string): string[] {
  return readdirSync(d).flatMap((n) => {
    const p = join(d, n)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}
const all = walk(root)
const tsx = all.filter((f) => f.endsWith('.tsx'))

describe('polish', () => {
  it('no default Tailwind palette classes in any component', () => {
    for (const f of tsx) expect(readFileSync(f, 'utf8'), f).not.toMatch(/\b(gray|blue|red|green|slate|zinc|neutral)-\d/)
  })
  it('no hex literals in components (colors come from theme or fields.ts)', () => {
    for (const f of tsx) expect(readFileSync(f, 'utf8'), f).not.toMatch(/#[0-9a-fA-F]{6}\b/)
  })
  it('only index.css exists as a stylesheet', () => {
    expect(all.filter((f) => /\.(css|scss|sass|less)$/.test(f)).map((f) => f.slice(root.length))).toEqual(['/index.css'])
  })
  it('no inline <style> tags', () => {
    for (const f of tsx) expect(readFileSync(f, 'utf8'), f).not.toMatch(/<style/)
  })
})
