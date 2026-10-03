import { describe, it, expect } from 'vitest';
import {
  parseHex, formatHex, byteToBits, bitsToByte, parityBit, asciiToBytes, bytesToAscii,
} from '../src/core/bits';
import { levelAt, sampleBits } from '../src/core/timeline';
import { registerProtocol, getProtocol, listProtocols } from '../src/core/registry';
import type { Protocol, Timeline } from '../src/core/types';

describe('hex', () => {
  it('parses spaced, 0x-prefixed, comma and packed forms', () => {
    expect(parseHex('55 AA')).toEqual([0x55, 0xaa]);
    expect(parseHex('0x55,0xaa')).toEqual([0x55, 0xaa]);
    expect(parseHex('55aa01')).toEqual([0x55, 0xaa, 0x01]);
    expect(parseHex('')).toEqual([]);
  });
  it('throws on invalid hex', () => {
    expect(() => parseHex('zz')).toThrow();
    expect(() => parseHex('5')).toThrow();
    expect(() => parseHex('123')).toThrow();
  });
  it('formats uppercase space-separated', () => {
    expect(formatHex([0x55, 0x0a])).toBe('55 0A');
  });
});

describe('bits', () => {
  it('byteToBits MSB-first by default, LSB-first on request', () => {
    expect(byteToBits(0xa5)).toEqual([1, 0, 1, 0, 0, 1, 0, 1]);
    expect(byteToBits(0x01, true)).toEqual([1, 0, 0, 0, 0, 0, 0, 0]);
    expect(byteToBits(0x5, false, 4)).toEqual([0, 1, 0, 1]);
  });
  it('bitsToByte inverts byteToBits (MSB-first)', () => {
    expect(bitsToByte([1, 0, 1, 0, 0, 1, 0, 1])).toBe(0xa5);
  });
  it('parityBit makes total ones even/odd', () => {
    expect(parityBit([1, 1, 0], 'even')).toBe(0);
    expect(parityBit([1, 0, 0], 'even')).toBe(1);
    expect(parityBit([1, 1, 0], 'odd')).toBe(1);
    expect(parityBit([1, 0, 0], 'odd')).toBe(0);
  });
  it('ascii round trip', () => {
    expect(asciiToBytes('Hi')).toEqual([0x48, 0x69]);
    expect(bytesToAscii([0x48, 0x69])).toBe('Hi');
  });
});

const tl: Timeline = {
  lanes: [{ id: 'D', label: 'Data', kind: 'digital' }],
  transitions: [
    { lane: 'D', t: 0, level: 1 },
    { lane: 'D', t: 2, level: 0 },
    { lane: 'D', t: 3, level: 1 },
  ],
  fieldSpans: [],
  events: [],
  duration: 5,
};

describe('timeline helpers', () => {
  it('levelAt returns the latest transition at or before t', () => {
    expect(levelAt(tl, 'D', 0)).toBe(1);
    expect(levelAt(tl, 'D', 1.99)).toBe(1);
    expect(levelAt(tl, 'D', 2)).toBe(0);
    expect(levelAt(tl, 'D', 4)).toBe(1);
  });
  it('sampleBits samples at mid-bit for count bits', () => {
    expect(sampleBits(tl, 'D', 0, 5)).toEqual([1, 1, 0, 1, 1]);
  });
});

describe('registry', () => {
  const fake = (id: string): Protocol => ({
    id,
    name: id.toUpperCase(),
    defaultConfig: {},
    configFields: [],
    faults: [],
    defaultPayload: [0x01],
    encode: () => tl,
  });
  it('returns registered modules by id and in list', () => {
    registerProtocol(fake('fake-a'));
    registerProtocol(fake('fake-b'));
    expect(getProtocol('fake-a')?.name).toBe('FAKE-A');
    expect(getProtocol('nope')).toBeUndefined();
    const ids = listProtocols().map((p) => p.id);
    expect(ids).toContain('fake-a');
    expect(ids).toContain('fake-b');
  });
});
