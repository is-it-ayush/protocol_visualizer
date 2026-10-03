import type { Protocol } from '../core/types'
import { buildSerial, FAULTS, serialConfigFields } from './serial'

export const rs232: Protocol = {
  id: 'rs232',
  name: 'RS-232',
  defaultConfig: { baud: 9600, dataBits: 8, parity: 'none', stopBits: 1, voltage: 12 },
  configFields: [...serialConfigFields, { key: 'voltage', label: 'Voltage (V)', type: 'number' }],
  faults: FAULTS,
  defaultPayload: [0x48, 0x69],
  asciiInput: true,
  encode: (c, p, f) => buildSerial(c, p, f, true),
}
