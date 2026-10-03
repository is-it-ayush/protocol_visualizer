import { useReducer, useEffect, useRef } from 'react';
import { playbackReducer, PlaybackState, PlaybackAction } from '../core/playback';

export function usePlayback(duration: number, bitsPerSecondAt1x: number): PlaybackState {
  const [state, dispatch] = useReducer(playbackReducer, { t: 0, playing: false, speed: 1, duration });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    dispatch({ type: 'reset', duration });
  }, [duration]);

  useEffect(() => {
    if (!state.playing) return;

    const tick = () => {
      dispatch({ type: 'tick', dt: 1 / bitsPerSecondAt1x } as PlaybackAction);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [state.playing, bitsPerSecondAt1x]);

  return state;
}
