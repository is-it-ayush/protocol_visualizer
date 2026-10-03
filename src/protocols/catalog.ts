export const CATALOG = [
  { id: 'i2c', name: 'I2C', blurb: 'Inter-Integrated Circuit', purpose: 'Addressed two-wire bus linking many chips on one board.', wires: 2 },
  { id: 'spi', name: 'SPI', blurb: 'Serial Peripheral Interface', purpose: 'Fast clocked full-duplex link between a controller and its peripherals.', wires: 4 },
  { id: 'uart', name: 'UART', blurb: 'Universal Asynchronous Receiver-Transmitter', purpose: 'Clockless point-to-point serial link framed by start and stop bits.', wires: 2 },
  { id: 'can', name: 'CAN', blurb: 'Controller Area Network', purpose: 'Differential multi-node bus with priority arbitration for vehicles.', wires: 2 },
  { id: 'lin', name: 'LIN', blurb: 'Local Interconnect Network', purpose: 'Low-cost single-wire bus where a master schedules slave replies.', wires: 1 },
  { id: 'rs232', name: 'RS-232', blurb: 'Serial Communication Standard', purpose: 'Classic point-to-point serial standard with bipolar voltage levels.', wires: 3 },
] as const
