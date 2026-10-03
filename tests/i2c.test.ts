import { describe, it, expect } from 'vitest';
import { i2c } from '../src/protocols/i2c';
import { getProtocol } from '../src/core/registry';
import { levelAt, sampleBits } from '../src/core/timeline';
import '../src/protocols';
import type { Timeline } from '../src/core/types';

const cfg = { address: 0x50, read: false, clockHz: 100000 };
const spans = (tl: Timeline, name: string) => tl.fieldSpans.filter((f) => f.name === name);
const one = (tl: Timeline, name: string) => {
  const s = spans(tl, name)[0];
  if (!s) throw new Error(`no span ${name}`);
  return s;
};
const sdaEdges = (tl: Timeline, from: number, to: number, level: number) =>
  tl.transitions.filter((x) => x.lane === 'SDA' && x.level === level && x.t >= from && x.t <= to);

describe('I2C', () => {
  it('is registered with SCL and SDA lanes', () => {
    expect(getProtocol('i2c')).toBe(i2c);
    const tl = i2c.encode(cfg, [0x11], []);
    expect(tl.lanes.map((l) => l.id).sort()).toEqual(['SCL', 'SDA']);
  });

  it('start: SDA falls while SCL high; stop: SDA rises while SCL high', () => {
    const tl = i2c.encode(cfg, [0x11], []);
    const st = one(tl, 'start');
    const fall = sdaEdges(tl, st.start, st.end, 0)[0];
    expect(fall).toBeDefined();
    expect(levelAt(tl, 'SCL', fall.t)).toBe(1);
    const sp = one(tl, 'stop');
    const rise = sdaEdges(tl, sp.start, sp.end, 1)[0];
    expect(rise).toBeDefined();
    expect(levelAt(tl, 'SCL', rise.t)).toBe(1);
  });

  it('address, R/W, ACK and data bits exact', () => {
    const tl = i2c.encode(cfg, [0x11, 0x22], []);
    expect(sampleBits(tl, 'SDA', one(tl, 'address').start, 7)).toEqual([1, 0, 1, 0, 0, 0, 0]);
    expect(sampleBits(tl, 'SDA', one(tl, 'rw').start, 1)).toEqual([0]);
    const data = spans(tl, 'data');
    expect(data.length).toBe(2);
    expect(sampleBits(tl, 'SDA', data[0].start, 8)).toEqual([0, 0, 0, 1, 0, 0, 0, 1]);
    const acks = spans(tl, 'ack');
    expect(acks.length).toBe(3);
    for (const a of acks) {
      expect(a.value).toBe('ACK');
      expect(a.from).toBe('B');
      expect(sampleBits(tl, 'SDA', a.start, 1)).toEqual([0]);
    }
    expect(tl.events.filter((e) => e.severity === 'error')).toEqual([]);
  });

  it('address-nack: NACK after address, no data, then stop', () => {
    const tl = i2c.encode(cfg, [0x11, 0x22], ['address-nack']);
    const acks = spans(tl, 'ack');
    expect(acks.length).toBe(1);
    expect(acks[0].value).toBe('NACK');
    expect(sampleBits(tl, 'SDA', acks[0].start, 1)).toEqual([1]);
    expect(spans(tl, 'data')).toEqual([]);
    const last = [...tl.fieldSpans].sort((a, b) => a.start - b.start).at(-1);
    expect(last?.name).toBe('stop');
    expect(tl.events.some((e) => e.kind === 'address-nack' && e.severity === 'error')).toBe(true);
  });

  it('data-nack: first data byte NACKed, transfer stops, event flags byte 0', () => {
    const tl = i2c.encode(cfg, [0x11, 0x22, 0x33], ['data-nack']);
    expect(spans(tl, 'data').length).toBe(1);
    const acks = spans(tl, 'ack');
    expect(acks.map((a) => a.value)).toEqual(['ACK', 'NACK']);
    const last = [...tl.fieldSpans].sort((a, b) => a.start - b.start).at(-1);
    expect(last?.name).toBe('stop');
    const ev = tl.events.find((e) => e.kind === 'data-nack');
    expect(ev?.severity).toBe('error');
    expect(ev?.value).toBe(0);
  });
});
