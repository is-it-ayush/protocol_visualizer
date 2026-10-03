import type { Protocol } from '../core/types'
import { buildSerial, FAULTS, serialConfigFields } from './serial'

export const uart: Protocol = {
  id: 'uart',
  name: 'UART',
  defaultConfig: { baud: 9600, dataBits: 8, parity: 'none', stopBits: 1 },
  configFields: serialConfigFields,
  faults: FAULTS,
  defaultPayload: [0x48, 0x69],
  asciiInput: true,
  encode: (c, p, f) => buildSerial(c, p, f, false),
}
