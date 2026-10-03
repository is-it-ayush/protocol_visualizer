import { describe, it, expect } from 'vitest';
import { can, crc15, stuffBits, canFrameBits } from '../src/protocols/can';
import { getProtocol } from '../src/core/registry';
import { sampleBits } from '../src/core/timeline';
import '../src/protocols';
import type { Timeline } from '../src/core/types';

// Reference CRCs computed from the ISO 11898-1 CRC-15 algorithm (poly 0x4599, init 0)
// over SOF + 11-bit ID + RTR + IDE + r0 + 4-bit DLC + data (MSB first), unstuffed.
const toBits = (v: number, n: number) => Array.from({ length: n }, (_, i) => (v >> (n - 1 - i)) & 1);
const cfg = { id: 0x123, bitrate: 500000 };
const span = (tl: Timeline, name: string) => tl.fieldSpans.find((f) => f.name === name);

describe('CAN helpers', () => {
  it('canFrameBits layout', () => {
    const b = canFrameBits(0x123, [0x11, 0x22]);
    expect(b.length).toBe(35);
    expect(b.slice(0, 12)).toEqual([0, ...toBits(0x123, 11)]);
    expect(b.slice(12, 15)).toEqual([0, 0, 0]);
    expect(b.slice(15, 19)).toEqual(toBits(2, 4));
    expect(b.slice(19)).toEqual([...toBits(0x11, 8), ...toBits(0x22, 8)]);
  });

  // External reference: Wikimedia Commons "CAN-Bus-frame in base format without stuffbits" (ID 0x014, DLC 1, data 0x01);
  // the figure's own CRC is flagged wrong on its page, corrected value 111011101010011 = 0x7753.
  // https://commons.wikimedia.org/wiki/File:CAN-Bus-frame_in_base_format_without_stuffbits.svg (accessed 2026-10-01)
  it('crc15 matches external reference frame', () => {
    expect(crc15(canFrameBits(0x014, [0x01]))).toBe(0x7753);
  });

  it('crc15 matches reference values', () => {
    expect(crc15(canFrameBits(0x123, [0x11, 0x22]))).toBe(0x04b7);
    expect(crc15(canFrameBits(0x7ff, [0xaa, 0x55, 0x00, 0xff]))).toBe(0x4fec);
    expect(crc15(canFrameBits(0x000, []))).toBe(0x0000);
  });

  it('crc15 residue over frame + crc is zero', () => {
    const f = canFrameBits(0x7ff, [0xaa, 0x55, 0x00, 0xff]);
    expect(crc15([...f, ...toBits(crc15(f), 15)])).toBe(0);
  });

  it('stuffBits inserts complement after 5 equal bits, stuff bit starts new run', () => {
    expect(stuffBits([0, 0, 0, 0, 0, 0])).toEqual([0, 0, 0, 0, 0, 1, 0]);
    expect(stuffBits([1, 1, 1, 1, 1, 0, 0, 0, 0])).toEqual([1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1]);
    expect(stuffBits([1, 0, 1, 0])).toEqual([1, 0, 1, 0]);
  });
});

describe('CAN encode', () => {
  it('is registered', () => {
    expect(getProtocol('can')).toBe(can);
  });

  it('happy path: stuffed (no 6 equal bits) from SOF to CRC delimiter, ACK dominant, no error frame', () => {
    const tl = can.encode(cfg, [0x00, 0x00, 0xff], []);
    const sof = span(tl, 'sof')!;
    const del = span(tl, 'crc-delimiter')!;
    const bits = sampleBits(tl, 'BUS', sof.start, del.start - sof.start);
    let run = 1;
    for (let i = 1; i < bits.length; i++) {
      run = bits[i] === bits[i - 1] ? run + 1 : 1;
      expect(run).toBeLessThanOrEqual(5);
    }
    expect(bits.length).toBeGreaterThan(canFrameBits(0x123, [0x00, 0x00, 0xff]).length + 15);
    expect(sampleBits(tl, 'BUS', span(tl, 'ack')!.start, 1)).toEqual([0]);
    expect(span(tl, 'error-frame')).toBeUndefined();
    expect(tl.events.filter((e) => e.severity === 'error')).toEqual([]);
  });

  it('crc-error: receiver signals error frame', () => {
    const tl = can.encode(cfg, [0x11, 0x22], ['crc-error']);
    expect(tl.events.some((e) => e.kind === 'crc-error' && e.severity === 'error')).toBe(true);
    expect(tl.events.some((e) => e.kind === 'error-frame')).toBe(true);
    const ef = span(tl, 'error-frame')!;
    expect(sampleBits(tl, 'BUS', ef.start, 6)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('ack-missing: ACK slot recessive and transmitter emits error frame', () => {
    const tl = can.encode(cfg, [0x11, 0x22], ['ack-missing']);
    expect(sampleBits(tl, 'BUS', span(tl, 'ack')!.start, 1)).toEqual([1]);
    expect(tl.events.some((e) => e.kind === 'ack-missing' && e.severity === 'error')).toBe(true);
    const ef = span(tl, 'error-frame')!;
    expect(ef.start).toBeGreaterThan(span(tl, 'ack')!.start);
    expect(sampleBits(tl, 'BUS', ef.start, 6)).toEqual([0, 0, 0, 0, 0, 0]);
  });
});
