import { describe, it, expect } from 'vitest';
import { lin, linPid, linChecksum } from '../src/protocols/lin';
import { getProtocol } from '../src/core/registry';
import { sampleBits } from '../src/core/timeline';
import '../src/protocols';
import type { Timeline } from '../src/core/types';

const cfg = (o: object = {}) => ({ id: 0x10, checksum: 'enhanced', baud: 19200, ...o });
const spans = (tl: Timeline, name: string) => tl.fieldSpans.filter((f) => f.name === name);

describe('LIN helpers', () => {
  it('PID parity bits P0/P1', () => {
    expect(linPid(0x00)).toBe(0x80);
    expect(linPid(0x01)).toBe(0xc1);
    expect(linPid(0x3c)).toBe(0x3c);
    expect(linPid(0x3d)).toBe(0x7d);
  });

  it('LIN 2.x checksum example: enhanced and classic', () => {
    // enhanced: inverted carry-sum of PID 0x4A + data 0x55 0x93 0xE5 = 0xE6
    expect(linChecksum([0x55, 0x93, 0xe5], 0x4a, 'enhanced')).toBe(0xe6);
    expect(linChecksum([0x55, 0x93, 0xe5], 0x4a, 'classic')).toBe(0x31);
  });
});

describe('LIN encode', () => {
  it('is registered', () => {
    expect(getProtocol('lin')).toBe(lin);
  });

  it('header: break >= 13 dominant bits, then sync, pid; response: data, checksum', () => {
    const tl = lin.encode(cfg(), [0x01, 0x02], []);
    const brk = spans(tl, 'break')[0];
    const len = Math.round(brk.end - brk.start);
    expect(len).toBeGreaterThanOrEqual(13);
    expect(sampleBits(tl, 'LIN', brk.start, 13)).toEqual(Array(13).fill(0));
    const order = [...tl.fieldSpans].sort((a, b) => a.start - b.start).map((f) => f.name);
    const firsts = ['break', 'sync', 'pid', 'data', 'checksum'].map((n) => order.indexOf(n));
    expect(firsts.every((v, i) => v >= 0 && (i === 0 || v > firsts[i - 1]))).toBe(true);
    expect(spans(tl, 'data').length).toBe(2);
    expect(spans(tl, 'checksum')[0].from).toBe('B');
    expect(spans(tl, 'pid')[0].from).toBe('A');
  });

  it('sync byte 0x55 on the wire as UART frame (LSB first)', () => {
    const tl = lin.encode(cfg(), [0x01], []);
    const s = spans(tl, 'sync')[0];
    expect(sampleBits(tl, 'LIN', s.start, 10)).toEqual([0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
  });

  it('checksum span value reflects selected model', () => {
    const pid = linPid(0x10);
    const enh = lin.encode(cfg(), [0x01, 0x02], []);
    expect(Number(spans(enh, 'checksum')[0].value)).toBe(linChecksum([1, 2], pid, 'enhanced'));
    const cls = lin.encode(cfg({ checksum: 'classic' }), [0x01, 0x02], []);
    expect(Number(spans(cls, 'checksum')[0].value)).toBe(linChecksum([1, 2], pid, 'classic'));
  });

  it('checksum-error: wrong checksum and error event', () => {
    const pid = linPid(0x10);
    const tl = lin.encode(cfg(), [0x01, 0x02], ['checksum-error']);
    expect(Number(spans(tl, 'checksum')[0].value)).not.toBe(linChecksum([1, 2], pid, 'enhanced'));
    expect(tl.events.some((e) => e.kind === 'checksum-error' && e.severity === 'error')).toBe(true);
  });

  it('no-response: header only and no-response event', () => {
    const tl = lin.encode(cfg(), [0x01, 0x02], ['no-response']);
    expect(spans(tl, 'pid').length).toBe(1);
    expect(spans(tl, 'data')).toEqual([]);
    expect(spans(tl, 'checksum')).toEqual([]);
    expect(tl.events.some((e) => e.kind === 'no-response' && e.severity === 'error')).toBe(true);
  });
});
