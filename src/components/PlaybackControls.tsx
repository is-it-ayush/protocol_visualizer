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
          className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
          onClick={() => dispatch({ type: state.playing ? 'pause' : 'play' })}
        >
          {state.playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="rounded bg-gray-600 px-3 py-1 text-white"
          onClick={() => dispatch({ type: 'step' })}
        >
          Step
        </button>
        <span className="text-sm text-gray-600">
          t = {state.t.toFixed(2)} / {state.duration} bits
        </span>
      </div>
      <label htmlFor="pb-speed" className="text-sm font-medium text-gray-700">
        Playback speed ({state.speed.toFixed(1)}x)
      </label>
      <input
        id="pb-speed"
        type="range"
        min={0.1}
        max={10}
        step={0.1}
        value={state.speed}
        onChange={(e) => dispatch({ type: 'speed', speed: Number(e.target.value) })}
      />
      <label htmlFor="pb-seek" className="text-sm font-medium text-gray-700">
        Seek
      </label>
      <input
        id="pb-seek"
        type="range"
        min={0}
        max={state.duration}
        step={0.01}
        value={state.t}
        onChange={(e) => dispatch({ type: 'seek', t: Number(e.target.value) })}
      />
    </div>
  )
}
