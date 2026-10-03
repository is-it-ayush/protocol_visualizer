import { describe, it, expect } from 'vitest';
import { initialPlayback, playbackReducer } from '../src/core/playback';

describe('playbackReducer', () => {
  it('initial state is paused at 0, speed 1', () => {
    const s = initialPlayback(20);
    expect(s).toMatchObject({ t: 0, playing: false, speed: 1, duration: 20 });
  });
  it('step advances exactly one bit to the next integer and pauses', () => {
    let s = { ...initialPlayback(20), playing: true };
    s = playbackReducer(s, { type: 'step' });
    expect(s.t).toBe(1);
    expect(s.playing).toBe(false);
    s = playbackReducer({ ...s, t: 2.4 }, { type: 'step' });
    expect(s.t).toBe(3);
  });
  it('step does not pass duration', () => {
    const s = playbackReducer({ ...initialPlayback(5), t: 5 }, { type: 'step' });
    expect(s.t).toBe(5);
  });
  it('tick advances by dt * speed while playing', () => {
    let s = playbackReducer(initialPlayback(100), { type: 'play' });
    s = playbackReducer(s, { type: 'speed', speed: 2 });
    s = playbackReducer(s, { type: 'tick', dt: 1.5 });
    expect(s.t).toBeCloseTo(3);
  });
  it('speed is clamped to [0.1, 10]', () => {
    const s0 = initialPlayback(10);
    expect(playbackReducer(s0, { type: 'speed', speed: 50 }).speed).toBe(10);
    expect(playbackReducer(s0, { type: 'speed', speed: 0.01 }).speed).toBe(0.1);
  });
  it('pause halts ticks', () => {
    let s = playbackReducer(initialPlayback(10), { type: 'play' });
    s = playbackReducer(s, { type: 'pause' });
    s = playbackReducer(s, { type: 'tick', dt: 3 });
    expect(s.t).toBe(0);
  });
  it('seek clamps to [0, duration]', () => {
    const s0 = initialPlayback(10);
    expect(playbackReducer(s0, { type: 'seek', t: 4 }).t).toBe(4);
    expect(playbackReducer(s0, { type: 'seek', t: -3 }).t).toBe(0);
    expect(playbackReducer(s0, { type: 'seek', t: 99 }).t).toBe(10);
  });
  it('tick past the end wraps (loop)', () => {
    let s = playbackReducer({ ...initialPlayback(10), t: 9 }, { type: 'play' });
    s = playbackReducer(s, { type: 'tick', dt: 3 });
    expect(s.t).toBeCloseTo(2);
    expect(s.playing).toBe(true);
  });
});
