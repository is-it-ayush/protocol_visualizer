import type { MouseEvent } from 'react'
import type { Timeline } from '../core/types'
import type { Viewport } from './Waveform'

const WIDTH = 600
const HEIGHT = 24

type Props = {
  timeline: Timeline
  playhead: number
  onSeek: (t: number) => void
  viewport?: Viewport
}

export function Minimap({ timeline, playhead, onSeek, viewport }: Props) {
  const d = timeline.duration || 1
  const sx = (t: number) => (t / d) * WIDTH

  const click = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (r.width === 0) return
    onSeek(Math.min(d, Math.max(0, ((e.clientX - r.left) / r.width) * d)))
  }

  return (
    <svg
      data-testid="minimap"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="h-6 w-full cursor-pointer rounded border bg-ivory-deep"
      onClick={click}
    >
      {timeline.fieldSpans.map((f, i) => (
        <rect
          key={i}
          x={sx(f.start)}
          y={4}
          width={Math.max(1, sx(f.end) - sx(f.start))}
          height={HEIGHT - 8}
          className={f.from === 'A' ? 'fill-peacock' : 'fill-saffron'}
          fillOpacity={0.5}
        />
      ))}
      {viewport && (
        <rect
          data-testid="minimap-viewport"
          x={sx(viewport.start)}
          y={1}
          width={Math.max(2, sx(viewport.end) - sx(viewport.start))}
          height={HEIGHT - 2}
          fill="none"
          className="stroke-ink"
          strokeWidth={1.5}
        />
      )}
      <line
        x1={sx(playhead)}
        x2={sx(playhead)}
        y1={0}
        y2={HEIGHT}
        className="stroke-vermilion"
        strokeWidth={2}
      />
    </svg>
  )
}
