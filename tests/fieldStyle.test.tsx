import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Waveform } from '../src/components/Waveform'
import { FieldInspector } from '../src/components/FieldInspector'
import { fieldColor, fieldDoc } from '../src/protocols/fields'
import type { Timeline } from '../src/core/types'

afterEach(cleanup)

const tl: Timeline = {
  lanes: [{ id: 'SDA', label: 'SDA', kind: 'digital' }],
  transitions: [{ lane: 'SDA', t: 0, level: 1 }],
  fieldSpans: [
    { name: 'start', start: 0, end: 2, lane: 'SDA', from: 'A' },
    { name: 'address', start: 2, end: 9, lane: 'SDA', value: '0x50', from: 'A' },
  ],
  events: [],
  duration: 10,
}

describe('Waveform field colors', () => {
  it('span color equals the field color map', () => {
    const { container } = render(<Waveform timeline={tl} playhead={0} />)
    for (const n of ['start', 'address']) {
      const el = container.querySelector(`[data-field="${n}"]`)!
      expect(el, n).toBeTruthy()
      expect(el.getAttribute('data-color')).toBe(fieldColor(n))
    }
  })

  it('marks the selected field', () => {
    const { container } = render(<Waveform timeline={tl} playhead={0} selectedName="address" />)
    expect(container.querySelector('[data-field="address"]')!.getAttribute('data-selected')).toBe('true')
    expect(container.querySelector('[data-field="start"]')!.getAttribute('data-selected')).not.toBe('true')
  })
})

describe('FieldInspector', () => {
  it('shows meaning, width and live value', () => {
    const span = tl.fieldSpans[1]
    render(<FieldInspector protocolId="i2c" span={span} events={[]} />)
    const d = fieldDoc('i2c', 'address')!
    expect(screen.getByText(d.meaning)).toBeInTheDocument()
    expect(screen.getByText('0x50')).toBeInTheDocument()
    expect(screen.getByText(d.bits)).toBeInTheDocument()
  })
})
