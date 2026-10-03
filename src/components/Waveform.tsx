import * as d3 from 'd3';
import type { Timeline } from '../core/types';
export function Waveform({ timeline, playhead, pxPerBit = 40 }: { timeline: Timeline; playhead: number; pxPerBit?: number }) {
  const x = d3.scaleLinear().domain([0, 1]).range([40, 40 + pxPerBit]);
  return (
    <svg width={x(timeline.duration)} height={timeline.lanes.length * 50}>
      {timeline.lanes.map((l, i) => <g key={l.id} data-testid={`lane-${l.id}`}><text y={i * 50 + 25}>{l.label}</text></g>)}
      {timeline.fieldSpans.map(f => <text key={f.start} x={x(f.start)} y={10}>{f.name} {f.value}</text>)}
      <line data-testid="playhead" x1={x(playhead)} x2={x(playhead)} y1={0} y2={100} stroke="red" />
    </svg>
  );
}