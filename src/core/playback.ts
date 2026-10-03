export interface PlaybackState {
  t: number;
  playing: boolean;
  speed: number;
  duration: number;
}

export interface PlaybackAction {
  type: 'play' | 'pause' | 'step' | 'tick' | 'speed' | 'seek' | 'reset';
  speed?: number;
  t?: number;
  dt?: number;
  duration?: number;
}

export function initialPlayback(duration: number): PlaybackState {
  return { t: 0, playing: false, speed: 1, duration };
}

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case 'play':
      return { ...state, playing: true };
    case 'pause':
      return { ...state, playing: false };
    case 'step':
      const floorT = Math.floor(state.t);
      const nextT = Math.min(state.duration, floorT + 1);
      return { ...state, t: nextT, playing: false };
    case 'tick':
      if (!state.playing) return state;
      let newT = state.t + (action.dt ?? 0) * state.speed;
      if (newT >= state.duration) {
        newT = newT % state.duration;
      }
      return { ...state, t: newT };
    case 'speed':
      const clampedSpeed = Math.max(0.1, Math.min(10, action.speed ?? state.speed));
      return { ...state, speed: clampedSpeed };
    case 'seek':
      const clampedT = Math.max(0, Math.min(state.duration, action.t ?? state.t));
      return { ...state, t: clampedT };
    case 'reset':
      return { ...state, t: 0, playing: false, duration: action.duration ?? state.duration };
    default:
      return state;
  }
}
