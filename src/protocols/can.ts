import { byteToBits } from '../core/bits'
import type { FaultDef, FieldSpan, Protocol, ProtocolEvent, Transition } from '../core/types'

const FAULTS: FaultDef[] = [
  { id: 'crc-error', label: 'CRC error (receiver signals error frame)' },
  { id: 'ack-missing', label: 'ACK missing (no receiver acknowledges)' },
]

const hex = (b: number, width = 2) => '0x' + b.toString(16).toUpperCase().padStart(width, '0')

export function canFrameBits(id: number, data: number[]): number[] {
  return [
    0,
    ...byteToBits(id & 0x7ff, false, 11),
    0, // RTR
    0, // IDE
    0, // r0
    ...byteToBits(data.length, false, 4),
    ...data.flatMap((b) => byteToBits(b)),
  ]
}

export function crc15(bits: number[]): number {
  let crc = 0
  for (const bit of bits) {
    const next = bit ^ ((crc >> 14) & 1)
    crc = (crc << 1) & 0x7fff
    if (next) crc ^= 0x4599
  }
  return crc
}

// pos[i] is the index of input bit i in the stuffed output
function stuff(bits: number[]): { out: number[]; pos: number[] } {
  const out: number[] = []
  const pos: number[] = []
  let run = 0
  for (const bit of bits) {
    pos.push(out.length)
    out.push(bit)
    run = run > 0 && out[out.length - 2] === bit ? run + 1 : 1
    if (run === 5) {
      out.push(bit ^ 1)
      run = 1
    }
  }
  return { out, pos }
}

export function stuffBits(bits: number[]): number[] {
  return stuff(bits).out
}

export const can: Protocol = {
  id: 'can',
  name: 'CAN',
  defaultConfig: { id: 0x123, bitrate: 500_000 },
  configFields: [
    { key: 'id', label: 'Identifier (11-bit)', type: 'number' },
    { key: 'bitrate', label: 'Bitrate (bit/s)', type: 'number' },
  ],
  faults: FAULTS,
  defaultPayload: [0x11, 0x22],
  encode: (cfg, payload, faults) => {
    const id = Number(cfg.id) & 0x7ff
    const data = payload.slice(0, 8)
    const crcError = faults.includes('crc-error')
    const ackMissing = faults.includes('ack-missing')

    const frame = canFrameBits(id, data)
    const crc = crc15(frame)
    // a corrupted CRC on the wire makes the receiver's computed CRC mismatch
    const sentCrc = crcError ? crc ^ 1 : crc
    const { out: stuffed, pos } = stuff([...frame, ...byteToBits(sentCrc, false, 15)])

    const transitions: Transition[] = [{ lane: 'BUS', t: 0, level: 1 }]
    const fieldSpans: FieldSpan[] = []
    const events: ProtocolEvent[] = []

    let cell = 1
    let level = 1
    const put = (bit: number) => {
      if (bit !== level) {
        transitions.push({ lane: 'BUS', t: cell, level: bit })
        level = bit
      }
      cell++
    }

    const base = cell
    const span = (name: string, first: number, last: number, from: 'A' | 'B', value?: string) =>
      fieldSpans.push({
        name,
        start: base + pos[first],
        end: base + pos[last] + 1,
        lane: 'BUS',
        value,
        from,
      })

    const dataEnd = 19 + data.length * 8
    span('sof', 0, 0, 'A')
    span('id', 1, 11, 'A', hex(id, 3))
    span('rtr', 12, 12, 'A')
    span('ide', 13, 13, 'A')
    span('r0', 14, 14, 'A')
    span('dlc', 15, 18, 'A', String(data.length))
    if (data.length > 0) span('data', 19, dataEnd - 1, 'A', data.map((b) => hex(b)).join(' '))
    span('crc', dataEnd, dataEnd + 14, 'A', hex(sentCrc, 4))
    stuffed.forEach(put)

    const tail = (name: string, bit: number, from: 'A' | 'B', value?: string) => {
      fieldSpans.push({ name, start: cell, end: cell + 1, lane: 'BUS', value, from })
      put(bit)
    }
    tail('crc-delimiter', 1, 'A')
    tail('ack', ackMissing ? 1 : 0, 'B', ackMissing ? 'missing' : 'ACK')
    if (ackMissing) {
      events.push({
        t: cell - 0.5,
        kind: 'ack-missing',
        label: 'No receiver drove the ACK slot',
        severity: 'error',
      })
    }
    tail('ack-delimiter', 1, 'A')

    if (crcError) {
      events.push({
        t: cell - 1,
        kind: 'crc-error',
        label: 'Receiver CRC mismatch (expected ' + hex(crc, 4) + ', got ' + hex(sentCrc, 4) + ')',
        severity: 'error',
      })
    }

    if (crcError || ackMissing) {
      // 6 dominant (active error flag) + 8 recessive (error delimiter)
      fieldSpans.push({
        name: 'error-frame',
        start: cell,
        end: cell + 14,
        lane: 'BUS',
        from: crcError ? 'B' : 'A',
      })
      events.push({
        t: cell,
        kind: 'error-frame',
        label: 'Error frame: 6 dominant + 8 recessive bits',
        severity: 'error',
      })
      for (let i = 0; i < 6; i++) put(0)
      for (let i = 0; i < 8; i++) put(1)
    } else {
      fieldSpans.push({ name: 'eof', start: cell, end: cell + 7, lane: 'BUS', from: 'A' })
      for (let i = 0; i < 7; i++) put(1)
    }

    return {
      lanes: [{ id: 'BUS', label: 'CAN bus', kind: 'digital' }],
      transitions,
      fieldSpans,
      events,
      duration: cell + 1,
    }
  },
}
