import type { PlaybackAction, PlaybackState } from '../core/playback'

type Props = {
  state: PlaybackState
  dispatch: (action: PlaybackAction) => void
}

export function PlaybackControls({ state, dispatch }: Props) {
  const canPlay = state.duration > 0
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPlay}
          className="min-h-11 rounded bg-peacock px-4 py-1 text-ivory disabled:opacity-50"
          onClick={() => dispatch({ type: state.playing ? 'pause' : 'play' })}
        >
          {state.playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="min-h-11 rounded bg-ink-soft px-4 py-1 text-ivory"
          onClick={() => dispatch({ type: 'step' })}
        >
          Step
        </button>
        <span className="text-sm text-ink-soft">
          t = {state.t.toFixed(2)} / {state.duration} bits
        </span>
      </div>
      <label htmlFor="pb-speed" className="text-sm font-medium text-ink-soft">
        Playback speed ({state.speed.toFixed(1)}x)
      </label>
      <input
        id="pb-speed"
        type="range"
        className="min-h-11 accent-saffron"
        min={0.1}
        max={10}
        step={0.1}
        value={state.speed}
        onChange={(e) => dispatch({ type: 'speed', speed: Number(e.target.value) })}
      />
      <label htmlFor="pb-seek" className="text-sm font-medium text-ink-soft">
        Seek
      </label>
      <input
        id="pb-seek"
        type="range"
        className="min-h-11 accent-saffron"
        min={0}
        max={state.duration}
        step={0.01}
        value={state.t}
        onChange={(e) => dispatch({ type: 'seek', t: Number(e.target.value) })}
      />
    </div>
  )
}
