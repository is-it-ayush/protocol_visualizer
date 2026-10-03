import { byteToBits } from '../core/bits'
import type { ConfigField, FaultDef, FieldSpan, ProtocolEvent, Timeline, Transition } from '../core/types'

export const FAULTS: FaultDef[] = [
  { id: 'parity-error', label: 'Parity error' },
  { id: 'framing-error', label: 'Framing error' },
]

export const serialConfigFields: ConfigField[] = [
  { key: 'dataBits', label: 'Data bits', type: 'number' },
  {
    key: 'parity',
    label: 'Parity',
    type: 'select',
    options: [
      { value: 'none', label: 'None' },
      { value: 'even', label: 'Even' },
      { value: 'odd', label: 'Odd' },
    ],
  },
  {
    key: 'stopBits',
    label: 'Stop bits',
    type: 'select',
    options: [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
    ],
  },
]

export function buildSerial(
  cfg: Record<string, any>,
  payload: number[],
  faults: string[],
  analog: boolean,
): Timeline {
  const V = Number(cfg.voltage ?? 12)
  const lv = (b: number) => (analog ? (b ? -V : V) : b)
  const dataBits = Number(cfg.dataBits)
  const stopBits = Number(cfg.stopBits)
  const kind = analog ? 'analog' : 'digital'

  const transitions: Transition[] = [
    { lane: 'TX', t: 0, level: lv(1) },
    { lane: 'RX', t: 0, level: lv(1) },
  ]
  const fieldSpans: FieldSpan[] = []
  const events: ProtocolEvent[] = []

  let t = 1

  const frame = (lane: string, from: 'A' | 'B', byte: number, faulty: boolean) => {
    const bit = (level: number) => {
      transitions.push({ lane, t, level: lv(level) })
      t += 1
    }
    const span = (name: string, start: number, value: string) =>
      fieldSpans.push({ name, start, end: t, lane, value, from })
    const fault = (id: string, start: number) => {
      const def = FAULTS.find((f) => f.id === id)!
      events.push({ t: start, kind: id, label: def.label, severity: 'error' })
    }

    let s = t
    bit(0)
    span('start', s, '0')

    s = t
    const bits = byteToBits(byte, true, dataBits)
    bits.forEach(bit)
    span('data', s, '0x' + byte.toString(16).toUpperCase().padStart(2, '0'))

    if (cfg.parity !== 'none') {
      s = t
      let p = bits.reduce((a, b) => a ^ b, 0)
      if (cfg.parity === 'odd') p ^= 1
      if (faulty && faults.includes('parity-error')) {
        p ^= 1
        fault('parity-error', s)
      }
      bit(p)
      span('parity', s, String(p))
    }

    s = t
    for (let i = 0; i < stopBits; i++) {
      if (i === 0 && faulty && faults.includes('framing-error')) {
        fault('framing-error', t)
        bit(0)
      } else {
        bit(1)
      }
    }
    span('stop', s, '1')
  }

  for (const byte of payload) {
    frame('TX', 'A', byte, true)
    frame('RX', 'B', byte, false)
  }

  return {
    lanes: [
      { id: 'TX', label: 'TX', kind },
      { id: 'RX', label: 'RX', kind },
    ],
    transitions,
    fieldSpans,
    events,
    duration: t,
  }
}
