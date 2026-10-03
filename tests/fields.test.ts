import { describe, it, expect } from 'vitest'
import { getProtocol } from '../src/core/registry'
import '../src/protocols'
import { FIELD_DOCS, fieldDoc, fieldColor } from '../src/protocols/fields'

const IDS = ['i2c', 'spi', 'uart', 'rs232', 'can', 'lin']

function names(id: string): Set<string> {
  const p = getProtocol(id)!
  const out = new Set<string>()
  const faultSets: string[][] = [[], ...p.faults.map((f) => [f.id]), p.faults.map((f) => f.id)]
  const configs = [p.defaultConfig, { ...p.defaultConfig, parity: 'even', stopBits: 2 }]
  for (const c of configs)
    for (const fs of faultSets)
      for (const pl of [p.defaultPayload, [0x00], []])
        for (const s of p.encode(c, pl, fs).fieldSpans) out.add(s.name)
  return out
}

describe('field docs', () => {
  it.each(IDS)('%s documents every emitted span name', (id) => {
    for (const n of names(id)) {
      const d = fieldDoc(id, n)
      expect(d, `${id}:${n}`).toBeDefined()
      expect(d!.name).toBe(n)
      expect(d!.meaning.length).toBeGreaterThan(5)
      expect(d!.bits.length).toBeGreaterThan(0)
      expect(d!.example.length).toBeGreaterThan(0)
      expect(fieldColor(n)).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('has docs for all six protocols and no duplicate names', () => {
    for (const id of IDS) {
      const docs = FIELD_DOCS[id]
      expect(docs.length).toBeGreaterThan(1)
      expect(new Set(docs.map((d) => d.name)).size).toBe(docs.length)
    }
  })

  it('returns undefined for unknown field or protocol', () => {
    expect(fieldDoc('i2c', 'nope')).toBeUndefined()
    expect(fieldDoc('nope', 'start')).toBeUndefined()
  })
})
