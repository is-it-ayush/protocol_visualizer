import type { Timeline } from './types'

export function levelAt(tl: Timeline, lane: string, t: number): number {
  const laneTransitions = tl.transitions.filter(tr => tr.lane === lane)
  const relevant = laneTransitions.filter(tr => tr.t <= t)
  if (relevant.length === 0) {
    return 0
  }
  const last = relevant[relevant.length - 1]
  return last.level
}

export function sampleBits(tl: Timeline, lane: string, start: number, count: number): number[] {
  const bits: number[] = []
  for (let i = 0; i < count; i++) {
    bits.push(levelAt(tl, lane, start + i + 0.5))
  }
  return bits
}
