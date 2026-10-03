import { describe, it, expect } from 'vitest';
import { uart } from '../src/protocols/uart';
import { rs232 } from '../src/protocols/rs232';
import { getProtocol } from '../src/core/registry';
import { sampleBits } from '../src/core/timeline';
import '../src/protocols';
import type { Timeline } from '../src/core/types';

const span = (tl: Timeline, name: string) => {
  const s = tl.fieldSpans.find((f) => f.name === name && f.lane === 'TX');
  if (!s) throw new Error(`no TX span ${name}`);
  return s;
};
const cfg = (o: object = {}) => ({ baud: 9600, dataBits: 8, parity: 'none', stopBits: 1, ...o });

describe('UART', () => {
  it('is registered', () => {
    expect(getProtocol('uart')).toBe(uart);
    expect(getProtocol('rs232')).toBe(rs232);
  });

  it('0x55 8N1 frame is start, LSB-first data, stop', () => {
    const tl = uart.encode(cfg(), [0x55], []);
    expect(sampleBits(tl, 'TX', span(tl, 'start').start, 10)).toEqual([0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
  });

  it('even/odd parity bit', () => {
    const even = uart.encode(cfg({ parity: 'even' }), [0x55], []);
    expect(sampleBits(even, 'TX', span(even, 'parity').start, 1)).toEqual([0]);
    const odd = uart.encode(cfg({ parity: 'odd' }), [0x55], []);
    expect(sampleBits(odd, 'TX', span(odd, 'parity').start, 1)).toEqual([1]);
  });

  it('parity-error flips parity bit and emits error event', () => {
    const tl = uart.encode(cfg({ parity: 'even' }), [0x55], ['parity-error']);
    expect(sampleBits(tl, 'TX', span(tl, 'parity').start, 1)).toEqual([1]);
    expect(tl.events.some((e) => e.kind === 'parity-error' && e.severity === 'error')).toBe(true);
  });

  it('framing-error drives stop bit low and emits error event', () => {
    const tl = uart.encode(cfg(), [0x55], ['framing-error']);
    expect(sampleBits(tl, 'TX', span(tl, 'stop').start, 1)).toEqual([0]);
    expect(tl.events.some((e) => e.kind === 'framing-error' && e.severity === 'error')).toBe(true);
  });

  it('happy path has no error events', () => {
    const tl = uart.encode(cfg({ parity: 'odd' }), [0x55, 0xa3], []);
    expect(tl.events.filter((e) => e.severity === 'error')).toEqual([]);
  });

  it('exposes the two faults', () => {
    expect(uart.faults.map((f) => f.id).sort()).toEqual(['framing-error', 'parity-error']);
  });
});

describe('RS-232', () => {
  it('uses inverted +/-V levels: mark(1) = -V, space(0) = +V', () => {
    const tl = rs232.encode({ ...cfg(), voltage: 12 }, [0x55], []);
    expect(sampleBits(tl, 'TX', span(tl, 'start').start, 10)).toEqual([12, -12, 12, -12, 12, -12, 12, -12, 12, -12]);
    expect(tl.lanes.find((l) => l.id === 'TX')?.kind).toBe('analog');
  });

  it('framing-error stop bit is at +V (space)', () => {
    const tl = rs232.encode({ ...cfg(), voltage: 12 }, [0x55], ['framing-error']);
    expect(sampleBits(tl, 'TX', span(tl, 'stop').start, 1)).toEqual([12]);
  });
});
