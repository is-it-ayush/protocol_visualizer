import { byteToBits } from '../core/bits'
import type { FaultDef, FieldSpan, Protocol, ProtocolEvent, Transition } from '../core/types'

const FAULTS: FaultDef[] = [
  { id: 'address-nack', label: 'Address NACK (no device responds)' },
  { id: 'data-nack', label: 'Data NACK on first byte' },
]

const hex = (b: number) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')

export const i2c: Protocol = {
  id: 'i2c',
  name: 'I2C',
  defaultConfig: { address: 0x50, read: false, clockHz: 100_000 },
  configFields: [
    { key: 'address', label: 'Address (7-bit)', type: 'number' },
    {
      key: 'read',
      label: 'Direction',
      type: 'select',
      options: [
        { value: 0, label: 'Write' },
        { value: 1, label: 'Read' },
      ],
    },
    { key: 'clockHz', label: 'Clock (Hz)', type: 'number' },
  ],
  faults: FAULTS,
  defaultPayload: [0x11, 0x22],
  encode: (cfg, payload, faults) => {
    const address = Number(cfg.address) & 0x7f
    const read = cfg.read === true || Number(cfg.read) === 1
    const addrNack = faults.includes('address-nack')
    const dataNack = faults.includes('data-nack')

    const transitions: Transition[] = [
      { lane: 'SCL', t: 0, level: 1 },
      { lane: 'SDA', t: 0, level: 1 },
    ]
    const fieldSpans: FieldSpan[] = []
    const events: ProtocolEvent[] = []

    let cell = 1

    // START: SDA falls while SCL is high
    fieldSpans.push({ name: 'start', start: cell, end: cell + 1, lane: 'SDA', from: 'A' })
    transitions.push({ lane: 'SDA', t: cell + 0.5, level: 0 })
    cell++

    // SDA changes at cell start; SCL is low first half, high second half
    const bit = (level: number) => {
      transitions.push({ lane: 'SDA', t: cell, level })
      transitions.push({ lane: 'SCL', t: cell, level: 0 })
      transitions.push({ lane: 'SCL', t: cell + 0.5, level: 1 })
      cell++
    }
    const byte = (value: number, name: string, from: 'A' | 'B') => {
      fieldSpans.push({ name, start: cell, end: cell + 8, lane: 'SDA', value: hex(value), from })
      byteToBits(value).forEach(bit)
    }
    const ack = (nack: boolean, from: 'A' | 'B') => {
      fieldSpans.push({
        name: 'ack',
        start: cell,
        end: cell + 1,
        lane: 'SDA',
        value: nack ? 'NACK' : 'ACK',
        from,
      })
      bit(nack ? 1 : 0)
    }

    fieldSpans.push({ name: 'address', start: cell, end: cell + 7, lane: 'SDA', value: hex(address), from: 'A' })
    byteToBits(address).slice(1).forEach(bit)
    fieldSpans.push({ name: 'rw', start: cell, end: cell + 1, lane: 'SDA', value: read ? 'R' : 'W', from: 'A' })
    bit(read ? 1 : 0)

    ack(addrNack, 'B')
    if (addrNack) {
      events.push({
        t: cell - 0.5,
        kind: 'address-nack',
        label: 'No device acknowledged address ' + hex(address),
        severity: 'error',
      })
    } else {
      for (let i = 0; i < payload.length; i++) {
        const last = i === payload.length - 1
        // write: slave ACKs; read: slave drives data, master ACKs all but last
        byte(payload[i], 'data', read ? 'B' : 'A')
        const nack = dataNack ? i === 0 : read && last
        ack(nack, read ? 'A' : 'B')
        if (dataNack && i === 0) {
          events.push({
            t: cell - 0.5,
            kind: 'data-nack',
            label: 'Data byte 0 NACKed',
            severity: 'error',
            value: 0,
          })
          break
        }
      }
    }

    // STOP: SDA rises while SCL is high
    fieldSpans.push({ name: 'stop', start: cell, end: cell + 1, lane: 'SDA', from: 'A' })
    transitions.push({ lane: 'SDA', t: cell, level: 0 })
    transitions.push({ lane: 'SCL', t: cell, level: 0 })
    transitions.push({ lane: 'SCL', t: cell + 0.5, level: 1 })
    transitions.push({ lane: 'SDA', t: cell + 0.75, level: 1 })
    cell++

    return {
      lanes: [
        { id: 'SCL', label: 'SCL', kind: 'digital' },
        { id: 'SDA', label: 'SDA', kind: 'digital' },
      ],
      transitions,
      fieldSpans,
      events,
      duration: cell + 1,
    }
  },
}
