import { byteToBits, bitsToByte } from '../core/bits'
import type { FaultDef, FieldSpan, Protocol, ProtocolEvent, Transition } from '../core/types'

const FAULTS: FaultDef[] = [{ id: 'mode-mismatch', label: 'CPOL/CPHA mode mismatch' }]

const hex = (b: number) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')

export const spi: Protocol = {
  id: 'spi',
  name: 'SPI',
  defaultConfig: { mode: 0, clockHz: 1_000_000 },
  configFields: [
    {
      key: 'mode',
      label: 'Mode (CPOL/CPHA)',
      type: 'select',
      options: [
        { value: 0, label: '0 (0/0)' },
        { value: 1, label: '1 (0/1)' },
        { value: 2, label: '2 (1/0)' },
        { value: 3, label: '3 (1/1)' },
      ],
    },
    { key: 'clockHz', label: 'Clock (Hz)', type: 'number' },
  ],
  faults: FAULTS,
  defaultPayload: [0xa5, 0x3c],
  encode: (cfg, payload, faults) => {
    const mode = Number(cfg.mode)
    const cpol = mode >> 1
    const cpha = mode & 1
    const risingSample = mode === 0 || mode === 3
    const mismatch = faults.includes('mode-mismatch')

    const transitions: Transition[] = [
      { lane: 'CS', t: 0, level: 1 },
      { lane: 'SCK', t: 0, level: cpol },
      { lane: 'MOSI', t: 0, level: 0 },
      { lane: 'MISO', t: 0, level: 0 },
    ]
    const fieldSpans: FieldSpan[] = []
    const events: ProtocolEvent[] = []

    const misoBytes = payload.map((b) => ~b & 0xff)
    const mosiBits = payload.flatMap((b) => byteToBits(b))
    const misoBits = misoBytes.flatMap((b) => byteToBits(b))

    const csLow = 1
    transitions.push({ lane: 'CS', t: csLow, level: 0 })

    const start = csLow + 1
    const dataOffset = cpha ? 0.5 : 0
    const sampleOffset = cpha ? 1 : 0.5

    mosiBits.forEach((bit, i) => {
      const cell = start + i
      transitions.push({ lane: 'MOSI', t: cell + dataOffset, level: bit })
      transitions.push({ lane: 'MISO', t: cell + dataOffset, level: misoBits[i] })
      transitions.push({ lane: 'SCK', t: cell + 0.5, level: cpol ^ 1 })
      transitions.push({ lane: 'SCK', t: cell + 1, level: cpol })
      events.push({
        t: cell + sampleOffset,
        kind: 'sample',
        label: risingSample ? 'Sample (rising)' : 'Sample (falling)',
        severity: 'info',
      })
    })

    const end = start + mosiBits.length
    transitions.push({ lane: 'MOSI', t: end + 0.5, level: 0 })
    transitions.push({ lane: 'MISO', t: end + 0.5, level: 0 })
    transitions.push({ lane: 'CS', t: end + 1, level: 1 })

    payload.forEach((byte, n) => {
      const s = start + n * 8
      const e = s + 8
      fieldSpans.push({ name: 'MOSI', start: s, end: e, lane: 'MOSI', value: hex(byte), from: 'A' })
      fieldSpans.push({ name: 'MISO', start: s, end: e, lane: 'MISO', value: hex(misoBytes[n]), from: 'B' })

      const seen = bitsToByte(
        byteToBits(byte).map((bit, i) => (mismatch ? (mosiBits[n * 8 + i + 1] ?? 0) : bit)),
      )
      events.push({
        t: e - 1 + sampleOffset,
        kind: 'rx',
        label: 'Slave received ' + hex(seen),
        severity: 'info',
        value: seen,
      })
    })

    if (mismatch && payload.length > 0) {
      events.push({
        t: start + sampleOffset,
        kind: 'mode-mismatch',
        label: FAULTS[0].label,
        severity: 'error',
      })
    }

    return {
      lanes: [
        { id: 'CS', label: 'CS', kind: 'digital' },
        { id: 'SCK', label: 'SCK', kind: 'digital' },
        { id: 'MOSI', label: 'MOSI', kind: 'digital' },
        { id: 'MISO', label: 'MISO', kind: 'digital' },
      ],
      transitions,
      fieldSpans,
      events,
      duration: end + 2,
    }
  },
}
