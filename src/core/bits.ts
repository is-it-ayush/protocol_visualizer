export function parseHex(s: string): number[] {
  let clean = s
    .replace(/\s+/g, '')
    .replace(/,/g, '')
  // Remove 0x only from the start
  if (clean.startsWith('0x') || clean.startsWith('0X')) {
    clean = clean.slice(2)
  }
  // Now handle 0x in the middle (e.g., '0x550xaa' -> '550xaa')
  // Split by 0x and join
  clean = clean.replace(/0x/gi, '')
  if (clean.length % 2 !== 0) {
    throw new Error('Odd-length hex string')
  }
  const result: number[] = []
  for (let i = 0; i < clean.length; i += 2) {
    const byte = parseInt(clean.slice(i, i + 2), 16)
    if (isNaN(byte)) {
      throw new Error(`Invalid hex: ${clean.slice(i, i + 2)}`)
    }
    result.push(byte)
  }
  return result
}

export function formatHex(bytes: number[], separator = ' '): string {
  return bytes
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(separator)
}

export function byteToBits(b: number, lsbFirst: boolean = false, width: number = 8): number[] {
  const bits = []
  for (let i = 0; i < width; i++) {
    bits.push((b >> (width - 1 - i)) & 1)
  }
  if (lsbFirst) {
    return bits.reverse()
  }
  return bits
}

export function bitsToByte(bits: number[], msbFirst: boolean = true): number {
  if (msbFirst) {
    return bits.reduce((acc, bit, i) => acc | (bit << (bits.length - 1 - i)), 0)
  } else {
    return bits.reduce((acc, bit, i) => acc | (bit << i), 0)
  }
}

export function parityBit(bits: number[], mode: 'even' | 'odd'): number {
  let sum = bits.reduce((a, b) => a + b, 0)
  if (mode === 'even') {
    return sum % 2 === 0 ? 0 : 1
  } else {
    return sum % 2 === 0 ? 1 : 0
  }
}

export function asciiToBytes(str: string): number[] {
  return str.split('').map(c => c.charCodeAt(0))
}

export function bytesToAscii(bytes: number[]): string {
  return bytes.map(b => String.fromCharCode(b)).join('')
}
