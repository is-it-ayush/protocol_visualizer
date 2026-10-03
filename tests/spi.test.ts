import { describe, it, expect } from 'vitest';
import { spi } from '../src/protocols/spi';
import { getProtocol } from '../src/core/registry';
import { levelAt } from '../src/core/timeline';
import { byteToBits } from '../src/core/bits';
import '../src/protocols';

const EPS = 1e-3;

describe('SPI', () => {
  it('is registered with lanes CS, SCK, MOSI, MISO', () => {
    expect(getProtocol('spi')).toBe(spi);
    const tl = spi.encode({ mode: 0, clockHz: 1e6 }, [0xa5], []);
    expect(tl.lanes.map((l) => l.id).sort()).toEqual(['CS', 'MISO', 'MOSI', 'SCK']);
  });

  for (const mode of [0, 1, 2, 3] as const) {
    it(`mode ${mode}: idle SCK = CPOL, samples on correct edge, MOSI stable MSB-first`, () => {
      const cpol = mode >> 1;
      const risingSample = mode === 0 || mode === 3;
      const tl = spi.encode({ mode, clockHz: 1e6 }, [0xa5], []);
      expect(levelAt(tl, 'SCK', 0)).toBe(cpol);
      const samples = tl.events.filter((e) => e.kind === 'sample').map((e) => e.t);
      expect(samples.length).toBe(8);
      const bits = byteToBits(0xa5);
      samples.forEach((t, i) => {
        expect(levelAt(tl, 'SCK', t)).toBe(risingSample ? 1 : 0);
        expect(levelAt(tl, 'SCK', t - EPS)).toBe(risingSample ? 0 : 1);
        expect(levelAt(tl, 'MOSI', t)).toBe(bits[i]);
        expect(levelAt(tl, 'MOSI', t - EPS)).toBe(bits[i]);
      });
      const rx = tl.events.find((e) => e.kind === 'rx');
      expect(rx?.value).toBe(0xa5);
      expect(tl.events.filter((e) => e.severity === 'error')).toEqual([]);
    });
  }

  it('CS is asserted low during the transfer', () => {
    const tl = spi.encode({ mode: 0, clockHz: 1e6 }, [0xa5], []);
    const t0 = tl.events.find((e) => e.kind === 'sample')!.t;
    expect(levelAt(tl, 'CS', t0)).toBe(0);
    expect(levelAt(tl, 'CS', 0)).toBe(1);
  });

  it('mode-mismatch: slave samples on the other edge, mode 0 0xA5 reads 0x4A', () => {
    const tl = spi.encode({ mode: 0, clockHz: 1e6 }, [0xa5], ['mode-mismatch']);
    const rx = tl.events.find((e) => e.kind === 'rx');
    expect(rx?.value).toBe(0x4a);
    expect(tl.events.some((e) => e.kind === 'mode-mismatch' && e.severity === 'error')).toBe(true);
  });
});
