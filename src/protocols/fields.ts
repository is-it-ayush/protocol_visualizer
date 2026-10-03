export type FieldDoc = { name: string; bits: string; meaning: string; example: string }

const START_UART: FieldDoc = {
  name: 'start',
  bits: '1 bit (0)',
  meaning: 'Line drops low to signal the start of a frame.',
  example: '0',
}
const DATA_UART: FieldDoc = {
  name: 'data',
  bits: '5-8 bits, LSB first',
  meaning: 'The payload byte, sent least significant bit first.',
  example: '0x41',
}
const PARITY_UART: FieldDoc = {
  name: 'parity',
  bits: '1 bit (optional)',
  meaning: 'Error-detection bit making the count of 1s even or odd.',
  example: '1',
}
const STOP_UART: FieldDoc = {
  name: 'stop',
  bits: '1-2 bits (1)',
  meaning: 'Line returns high so the receiver can resync; low here is a framing error.',
  example: '1',
}

export const FIELD_DOCS: Record<string, FieldDoc[]> = {
  i2c: [
    { name: 'start', bits: '1 condition', meaning: 'SDA falls while SCL is high; claims the bus.', example: 'SDA 1→0' },
    { name: 'address', bits: '7 bits, MSB first', meaning: 'Target device address.', example: '0x50' },
    { name: 'rw', bits: '1 bit', meaning: 'Direction: 0 = master writes, 1 = master reads.', example: 'W' },
    { name: 'ack', bits: '1 bit', meaning: 'Receiver pulls SDA low to acknowledge; high is a NACK.', example: 'ACK' },
    { name: 'data', bits: '8 bits, MSB first', meaning: 'Payload byte, each followed by an ACK slot.', example: '0x11' },
    { name: 'stop', bits: '1 condition', meaning: 'SDA rises while SCL is high; releases the bus.', example: 'SDA 0→1' },
  ],
  spi: [
    { name: 'MOSI', bits: '8 bits, MSB first', meaning: 'Byte shifted from master to slave, clocked by SCK.', example: '0xA5' },
    { name: 'MISO', bits: '8 bits, MSB first', meaning: 'Byte shifted from slave to master at the same time.', example: '0x3C' },
  ],
  uart: [START_UART, DATA_UART, PARITY_UART, STOP_UART],
  rs232: [START_UART, DATA_UART, PARITY_UART, STOP_UART],
  can: [
    { name: 'sof', bits: '1 bit (0)', meaning: 'Start of frame: dominant bit that syncs all nodes.', example: '0' },
    { name: 'id', bits: '11 bits', meaning: 'Message identifier; lower value wins arbitration.', example: '0x123' },
    { name: 'rtr', bits: '1 bit', meaning: 'Remote transmission request; 0 for a data frame.', example: '0' },
    { name: 'ide', bits: '1 bit', meaning: 'Identifier extension; 0 means standard 11-bit ID.', example: '0' },
    { name: 'r0', bits: '1 bit', meaning: 'Reserved bit, sent dominant.', example: '0' },
    { name: 'dlc', bits: '4 bits', meaning: 'Data length code: number of data bytes (0-8).', example: '2' },
    { name: 'data', bits: '0-64 bits', meaning: 'Payload bytes, MSB first.', example: '0x11 0x22' },
    { name: 'crc', bits: '15 bits', meaning: 'CRC-15 over the frame; receivers flag a mismatch.', example: '0x1A2B' },
    { name: 'crc-delimiter', bits: '1 bit (1)', meaning: 'Recessive bit ending the CRC field.', example: '1' },
    { name: 'ack', bits: '1 bit', meaning: 'Receivers drive dominant to acknowledge; recessive means nobody did.', example: 'ACK' },
    { name: 'ack-delimiter', bits: '1 bit (1)', meaning: 'Recessive bit ending the ACK field.', example: '1' },
    { name: 'eof', bits: '7 bits (1)', meaning: 'End of frame: seven recessive bits.', example: '1111111' },
    {
      name: 'error-frame',
      bits: '6 + 8 bits',
      meaning: 'Error flag (6 dominant) plus error delimiter (8 recessive) after a CRC or ACK fault.',
      example: '000000 11111111',
    },
  ],
  lin: [
    { name: 'break', bits: '13+ bits (0)', meaning: 'Long dominant pulse that wakes slaves and starts a frame.', example: '0 ×13' },
    { name: 'sync', bits: '8 bits (0x55)', meaning: 'Alternating pattern so slaves can measure the baud rate.', example: '0x55' },
    { name: 'pid', bits: '6-bit ID + 2 parity', meaning: 'Protected identifier: frame ID plus two parity bits.', example: '0x50' },
    { name: 'data', bits: '1-8 bytes', meaning: 'Slave response payload, LSB first per byte.', example: '0x01' },
    { name: 'checksum', bits: '8 bits', meaning: 'Inverted 8-bit sum with carry; enhanced mode includes the PID.', example: '0xAC' },
  ],
}

export function fieldDoc(protocolId: string, name: string): FieldDoc | undefined {
  return FIELD_DOCS[protocolId]?.find((d) => d.name === name)
}

// Saffron, teal, indigo and vermilion tones; one color per field name across protocols.
export const FIELD_COLORS: Record<string, string> = {
  start: '#e8590c',
  sof: '#e8590c',
  break: '#c92a2a',
  sync: '#f59f00',
  address: '#0b7285',
  id: '#0b7285',
  pid: '#1098ad',
  rw: '#5f3dc4',
  rtr: '#7048e8',
  ide: '#9775fa',
  r0: '#868e96',
  dlc: '#3b5bdb',
  data: '#f08c00',
  MOSI: '#e8590c',
  MISO: '#0c8599',
  parity: '#9c36b5',
  crc: '#364fc7',
  checksum: '#364fc7',
  ack: '#2b8a3e',
  'crc-delimiter': '#74c0fc',
  'ack-delimiter': '#63e6be',
  stop: '#d9480f',
  eof: '#fd7e14',
  'error-frame': '#e03131',
}

export function fieldColor(name: string): string {
  return FIELD_COLORS[name] ?? '#868e96'
}
