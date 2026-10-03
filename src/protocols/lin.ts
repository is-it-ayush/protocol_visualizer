import { byteToBits } from '../core/bits'
import type { FaultDef, FieldSpan, Protocol, ProtocolEvent, Transition } from '../core/types'

const FAULTS: FaultDef[] = [
  { id: 'checksum-error', label: 'Checksum error (wrong checksum on the wire)' },
  { id: 'no-response', label: 'No response (slave does not answer the header)' },
]

const hex = (b: number) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')

export function linPid(id: number): number {
  const b = (n: number) => (id >> n) & 1
  const p0 = b(0) ^ b(1) ^ b(2) ^ b(4)
  const p1 = (b(1) ^ b(3) ^ b(4) ^ b(5)) ^ 1
  return (id & 0x3f) | (p0 << 6) | (p1 << 7)
}

export function linChecksum(data: number[], pid: number, model: 'classic' | 'enhanced'): number {
  const bytes = model === 'enhanced' ? [pid, ...data] : data
  let sum = 0
  for (const b of bytes) {
    sum += b & 0xff
    if (sum > 0xff) sum -= 0xff
  }
  return ~sum & 0xff
}

export const lin: Protocol = {
  id: 'lin',
  name: 'LIN',
  defaultConfig: { id: 0x10, checksum: 'enhanced', baud: 19200 },
  configFields: [
    { key: 'id', label: 'Frame ID (0-63)', type: 'number' },
    {
      key: 'checksum',
      label: 'Checksum model',
      type: 'select',
      options: [
        { value: 'classic', label: 'Classic' },
        { value: 'enhanced', label: 'Enhanced' },
      ],
    },
    { key: 'baud', label: 'Baud rate', type: 'number' },
  ],
  faults: FAULTS,
  defaultPayload: [0x01, 0x02],
  encode: (cfg, payload, faults) => {
    const id = Number(cfg.id) & 0x3f
    const model = cfg.checksum === 'classic' ? 'classic' : 'enhanced'
    const data = payload.slice(0, 8).map((b) => b & 0xff)
    const noResponse = faults.includes('no-response')
    const checksumError = faults.includes('checksum-error') && !noResponse

    const pid = linPid(id)
    const checksum = linChecksum(data, pid, model)
    const sentChecksum = checksumError ? checksum ^ 0xff : checksum

    const transitions: Transition[] = [{ lane: 'LIN', t: 0, level: 1 }]
    const fieldSpans: FieldSpan[] = []
    const events: ProtocolEvent[] = []

    let t = 1
    let level = 1
    const bit = (b: number) => {
      if (b !== level) {
        transitions.push({ lane: 'LIN', t, level: b })
        level = b
      }
      t++
    }

    const byte = (name: string, from: 'A' | 'B', value: number) => {
      const start = t
      bit(0)
      byteToBits(value, true, 8).forEach(bit)
      bit(1)
      fieldSpans.push({ name, start, end: t, lane: 'LIN', value: hex(value), from })
    }

    const breakStart = t
    for (let i = 0; i < 13; i++) bit(0)
    fieldSpans.push({ name: 'break', start: breakStart, end: t, lane: 'LIN', from: 'A' })
    bit(1) // break delimiter

    byte('sync', 'A', 0x55)
    byte('pid', 'A', pid)

    if (noResponse) {
      events.push({
        t,
        kind: 'no-response',
        label: 'No slave response after header',
        severity: 'error',
      })
    } else {
      data.forEach((b) => byte('data', 'B', b))
      const csStart = t
      byte('checksum', 'B', sentChecksum)
      if (checksumError) {
        events.push({
          t: csStart,
          kind: 'checksum-error',
          label: 'Checksum mismatch (expected ' + hex(checksum) + ', got ' + hex(sentChecksum) + ')',
          severity: 'error',
        })
      }
    }

    bit(1)

    return {
      lanes: [{ id: 'LIN', label: 'LIN bus', kind: 'digital' }],
      transitions,
      fieldSpans,
      events,
      duration: t,
    }
  },
}
