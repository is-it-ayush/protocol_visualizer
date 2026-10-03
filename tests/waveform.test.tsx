import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Waveform } from '../src/components/Waveform';
import type { Timeline } from '../src/core/types';

afterEach(cleanup);

const fixture: Timeline = {
  lanes: [
    { id: 'SCL', label: 'SCL', kind: 'digital' },
    { id: 'SDA', label: 'SDA', kind: 'digital' },
  ],
  transitions: [
    { lane: 'SCL', t: 0, level: 1 },
    { lane: 'SDA', t: 0, level: 1 },
    { lane: 'SDA', t: 1, level: 0 },
    { lane: 'SCL', t: 2, level: 0 },
  ],
  fieldSpans: [
    { name: 'start', start: 0, end: 2, lane: 'SDA', from: 'A' },
    { name: 'address', start: 2, end: 9, lane: 'SDA', value: '0x50', from: 'A' },
  ],
  events: [],
  duration: 10,
};

describe('Waveform', () => {
  it('renders one lane per timeline lane', () => {
    const { container } = render(<Waveform timeline={fixture} playhead={0} />);
    expect(container.querySelectorAll('[data-testid^="lane-"]').length).toBe(2);
    expect(screen.getByTestId('lane-SCL')).toBeTruthy();
    expect(screen.getByTestId('lane-SDA')).toBeTruthy();
  });

  it('renders field labels', () => {
    render(<Waveform timeline={fixture} playhead={0} />);
    expect(screen.getAllByText('start').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/address/).length).toBeGreaterThan(0);
  });

  it('playhead x is linear in time at pxPerBit', () => {
    const { rerender } = render(<Waveform timeline={fixture} playhead={3} pxPerBit={20} />);
    const x3 = Number(screen.getByTestId('playhead').getAttribute('x1'));
    rerender(<Waveform timeline={fixture} playhead={5} pxPerBit={20} />);
    const x5 = Number(screen.getByTestId('playhead').getAttribute('x1'));
    expect(x5 - x3).toBeCloseTo(40);
  });
});
