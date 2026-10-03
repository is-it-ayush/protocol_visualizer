import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ProtocolView } from '../src/components/ProtocolView';
import type { Protocol, Timeline } from '../src/core/types';

afterEach(cleanup);

const tl: Timeline = {
  lanes: [{ id: 'TX', label: 'TX', kind: 'digital' }],
  transitions: [{ lane: 'TX', t: 0, level: 1 }],
  fieldSpans: [{ name: 'data', start: 0, end: 8, lane: 'TX', value: '0x01', from: 'A' }],
  events: [],
  duration: 10,
};

function makeFake() {
  const encode = vi.fn((_c: Record<string, unknown>, _p: number[], _f: string[]) => tl);
  const proto: Protocol = {
    id: 'fakeview',
    name: 'FakeView',
    defaultConfig: { baud: 115200 },
    configFields: [{ key: 'baud', label: 'Speed', type: 'number' }],
    faults: [{ id: 'f1', label: 'Parity error' }],
    defaultPayload: [0x01],
    encode,
  };
  return { proto, encode };
}

const last = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls[fn.mock.calls.length - 1];

describe('ProtocolView', () => {
  it('encodes defaults on mount', () => {
    const { proto, encode } = makeFake();
    render(<ProtocolView protocol={proto} />);
    expect(encode).toHaveBeenCalled();
    expect(last(encode)[1]).toEqual([0x01]);
    expect(last(encode)[2]).toEqual([]);
  });

  it('re-encodes when payload changes', () => {
    const { proto, encode } = makeFake();
    render(<ProtocolView protocol={proto} />);
    fireEvent.change(screen.getByLabelText('Payload'), { target: { value: '01 02' } });
    expect(last(encode)[1]).toEqual([0x01, 0x02]);
  });

  it('shows an error for invalid hex and does not encode it', () => {
    const { proto, encode } = makeFake();
    render(<ProtocolView protocol={proto} />);
    const before = encode.mock.calls.length;
    fireEvent.change(screen.getByLabelText('Payload'), { target: { value: 'zz' } });
    expect(screen.getByText(/invalid hex/i)).toBeTruthy();
    for (const call of encode.mock.calls.slice(before)) {
      expect(call[1]).not.toContain(NaN);
    }
  });

  it('re-encodes with fault id when a fault is toggled', () => {
    const { proto, encode } = makeFake();
    render(<ProtocolView protocol={proto} />);
    fireEvent.click(screen.getByLabelText('Parity error'));
    expect(last(encode)[2]).toContain('f1');
  });

  it('re-encodes when a config field changes', () => {
    const { proto, encode } = makeFake();
    render(<ProtocolView protocol={proto} />);
    fireEvent.change(screen.getByLabelText('Speed'), { target: { value: '9600' } });
    expect(last(encode)[0]).toMatchObject({ baud: 9600 });
  });
});
