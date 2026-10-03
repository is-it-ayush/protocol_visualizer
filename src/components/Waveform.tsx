import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { Lane, Timeline, Transition } from '../core/types'
import { fieldColor } from '../protocols/fields'

const MARGIN = 40
const LANE_H = 50
const PAD = 8
const CANVAS = '#1e1b4b'

export type Viewport = { start: number; end: number }

type Props = {
  timeline: Timeline
  playhead: number
  pxPerBit?: number
  selectedName?: string | null
  onViewport?: (v: Viewport) => void
}

function stepPath(
  lane: Lane,
  trs: Transition[],
  x: d3.ScaleLinear<number, number>,
  duration: number,
  top: number,
): { d: string; zeroY: number | null } {
  const levels = trs.map((tr) => tr.level)
  let lo = 0
  let hi = 1
  if (lane.kind === 'analog') {
    lo = Math.min(0, ...levels)
    hi = Math.max(0, ...levels)
    if (hi === lo) hi = lo + 1
  }
  const y = d3
    .scaleLinear()
    .domain([lo, hi])
    .range([top + LANE_H - PAD, top + PAD])
  if (trs.length === 0) return { d: '', zeroY: null }
  let d = `M${x(trs[0].t)},${y(trs[0].level)}`
  for (let i = 1; i < trs.length; i++) {
    d += `H${x(trs[i].t)}V${y(trs[i].level)}`
  }
  d += `H${x(duration)}`
  return { d, zeroY: lane.kind === 'analog' ? y(0) : null }
}

export function Waveform({ timeline, playhead, pxPerBit = 40, selectedName, onViewport }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [k, setK] = useState(1)

  const px = pxPerBit * k
  const x = useMemo(
    () => d3.scaleLinear().domain([0, timeline.duration]).range([MARGIN, MARGIN + timeline.duration * px]),
    [timeline.duration, px],
  )
  const width = x(timeline.duration) + MARGIN
  const height = timeline.lanes.length * LANE_H

  const laneIndex = (id?: string) => Math.max(0, timeline.lanes.findIndex((l) => l.id === id))

  const report = useCallback(() => {
    const el = wrapRef.current
    if (!el || !onViewport || timeline.duration <= 0) return
    const clamp = (t: number) => Math.min(timeline.duration, Math.max(0, t))
    onViewport({
      start: clamp(x.invert(el.scrollLeft)),
      end: clamp(x.invert(el.scrollLeft + el.clientWidth)),
    })
  }, [onViewport, timeline.duration, x])

  useEffect(() => {
    report()
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(report)
    ro.observe(el)
    return () => ro.disconnect()
  }, [report])

  // auto-follow: keep the playhead inside the visible window
  useEffect(() => {
    const el = wrapRef.current
    if (!el || el.clientWidth === 0) return
    const px0 = x(playhead)
    if (px0 < el.scrollLeft + MARGIN) el.scrollLeft = Math.max(0, px0 - MARGIN)
    else if (px0 > el.scrollLeft + el.clientWidth - MARGIN) el.scrollLeft = px0 - el.clientWidth + MARGIN
  }, [playhead, x])

  // pinch / ctrl-wheel zooms the x scale; drag pans the scroll container
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    let prevX = 0
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 8])
      .filter((e: Event) => (e.type === 'wheel' ? (e as WheelEvent).ctrlKey : !(e as MouseEvent).button))
      .on('zoom', (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setK(e.transform.k)
        const src = e.sourceEvent as Event | null
        if (src && src.type !== 'wheel' && wrapRef.current) {
          wrapRef.current.scrollLeft -= e.transform.x - prevX
        }
        prevX = e.transform.x
      })
    d3.select(svg).call(zoom)
    return () => {
      d3.select(svg).on('.zoom', null)
    }
  }, [])

  return (
    <div ref={wrapRef} className="max-w-full overflow-x-auto rounded-lg" onScroll={report}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ touchAction: 'pan-y', background: CANVAS }}
      >
        {timeline.lanes.map((lane, i) => {
          const top = i * LANE_H
          const trs = timeline.transitions.filter((tr) => tr.lane === lane.id).sort((a, b) => a.t - b.t)
          const { d, zeroY } = stepPath(lane, trs, x, timeline.duration, top)
          return (
            <g key={lane.id} data-testid={`lane-${lane.id}`}>
              <text x={4} y={top + LANE_H / 2} fontSize={11} fill="#c7d2fe">
                {lane.label}
              </text>
              {zeroY !== null && (
                <line x1={MARGIN} x2={width - MARGIN} y1={zeroY} y2={zeroY} stroke="#6366f1" strokeDasharray="3 3" />
              )}
              <path d={d} fill="none" stroke="#e0e7ff" strokeWidth={2} />
            </g>
          )
        })}
        {timeline.fieldSpans.map((f, i) => {
          const top = laneIndex(f.lane) * LANE_H
          const label = f.value !== undefined ? `${f.name} ${f.value}` : f.name
          const color = fieldColor(f.name)
          const isSelected = selectedName != null && f.name === selectedName
          return (
            <g key={i}>
              <rect
                data-field={f.name}
                data-color={color}
                data-selected={isSelected ? 'true' : undefined}
                x={x(f.start)}
                y={top + 2}
                width={Math.max(0, x(f.end) - x(f.start))}
                height={LANE_H - 4}
                fill={color}
                fillOpacity={isSelected ? 0.35 : 0.22}
                stroke={color}
                strokeOpacity={isSelected ? 1 : 0.7}
                strokeWidth={isSelected ? 3 : 1}
              />
              <text x={x(f.start) + 3} y={top + 12} fontSize={10} fill="#eef2ff">
                {label}
              </text>
            </g>
          )
        })}
        {timeline.events
          .filter((ev) => ev.severity === 'error')
          .map((ev, i) => (
            <g key={i} data-testid="error-marker">
              <line x1={x(ev.t)} x2={x(ev.t)} y1={0} y2={height} stroke="#dc2626" strokeWidth={2} strokeDasharray="4 2" />
              <circle cx={x(ev.t)} cy={6} r={4} fill="#dc2626" />
              <title>{ev.label}</title>
            </g>
          ))}
        <line
          data-testid="playhead"
          x1={x(playhead)}
          x2={x(playhead)}
          y1={0}
          y2={height}
          stroke="#f59e0b"
          strokeWidth={2}
        />
      </svg>
    </div>
  )
}
