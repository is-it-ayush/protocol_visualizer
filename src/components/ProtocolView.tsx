import { useEffect, useMemo, useReducer, useState } from 'react'
import type { FieldSpan, Protocol } from '../core/types'
import { asciiToBytes, bytesToAscii, formatHex, parseHex } from '../core/bits'
import { initialPlayback, playbackReducer } from '../core/playback'
import { ConfigPanel } from './ConfigPanel'
import { PlaybackControls } from './PlaybackControls'
import { FieldInspector } from './FieldInspector'
import { Waveform } from './Waveform'
import type { Viewport } from './Waveform'
import { Minimap } from './Minimap'
import { NodeDiagram } from './NodeDiagram'
import { PacketAnatomy } from './PacketAnatomy'

const BITS_PER_SECOND_AT_1X = 4

const PANEL = 'flex flex-col gap-3 rounded-lg border border-ivory-deep bg-white p-3'

function parsePayload(text: string, ascii: boolean): number[] | null {
  if (ascii) return asciiToBytes(text)
  const clean = text.replace(/0x/gi, '').replace(/[\s,]+/g, '')
  if (/[^0-9a-f]/i.test(clean) || clean.length % 2 !== 0) return null
  return parseHex(clean)
}

export function ProtocolView({ protocol }: { protocol: Protocol }) {
  const [config, setConfig] = useState<Record<string, any>>(() => ({ ...protocol.defaultConfig }))
  const [ascii, setAscii] = useState(false)
  const [text, setText] = useState(() => formatHex(protocol.defaultPayload))
  const [bytes, setBytes] = useState<number[]>(protocol.defaultPayload)
  const [error, setError] = useState<string | null>(null)
  const [faults, setFaults] = useState<string[]>([])
  const [selected, setSelected] = useState<FieldSpan | null>(null)
  const [anatomyName, setAnatomyName] = useState<string | null>(null)
  const [viewport, setViewport] = useState<Viewport | undefined>()

  const timeline = useMemo(
    () => protocol.encode(config, bytes, faults),
    [protocol, config, bytes, faults],
  )

  const [pb, dispatch] = useReducer(playbackReducer, timeline.duration, initialPlayback)

  useEffect(() => {
    dispatch({ type: 'reset', duration: timeline.duration })
  }, [timeline.duration])

  useEffect(() => {
    if (!pb.playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      dispatch({ type: 'tick', dt: ((now - last) / 1000) * BITS_PER_SECOND_AT_1X })
      last = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pb.playing])

  const onPayload = (value: string) => {
    setText(value)
    const parsed = parsePayload(value, ascii)
    if (parsed === null) {
      setError('Invalid hex: use pairs of 0-9/A-F, e.g. "01 A2 FF"')
      return
    }
    setError(null)
    setBytes(parsed)
  }

  const toggleAscii = (next: boolean) => {
    setAscii(next)
    setError(null)
    setText(next ? bytesToAscii(bytes) : formatHex(bytes))
  }

  const toggleFault = (id: string) =>
    setFaults((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))

  const onAnatomySelect = (name: string) => {
    setAnatomyName(name)
    const span = timeline.fieldSpans.find((s) => s.name === name)
    if (!span) return
    setSelected(span)
    dispatch({ type: 'seek', t: span.start })
  }

  const atPlayhead =
    timeline.fieldSpans.find((s) => pb.t >= s.start && pb.t < s.end) ?? null
  const shown = selected ?? atPlayhead

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="flex min-w-0 flex-col gap-2">
        <PacketAnatomy
          protocolId={protocol.id}
          selected={anatomyName ?? shown?.name ?? null}
          onSelect={onAnatomySelect}
        />
      </section>
      <section className="flex min-w-0 flex-col gap-2">
        <Waveform
          timeline={timeline}
          playhead={pb.t}
          selectedName={anatomyName ?? shown?.name ?? null}
          onViewport={setViewport}
        />
        <Minimap
          timeline={timeline}
          playhead={pb.t}
          viewport={viewport}
          onSeek={(t) => dispatch({ type: 'seek', t })}
        />
        <div className="flex flex-wrap gap-1">
          {timeline.fieldSpans.map((s, i) => (
            <button
              key={i}
              type="button"
              className="min-h-11 rounded border border-ivory-deep px-3 py-0.5 text-xs hover:bg-saffron-tint"
              onMouseEnter={() => setSelected(s)}
              onMouseLeave={() => setSelected(null)}
              onClick={() => {
                setSelected(s)
                setAnatomyName(s.name)
                dispatch({ type: 'seek', t: s.start })
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className={PANEL}>
          <ConfigPanel
            fields={protocol.configFields}
            config={config}
            onChange={(key, value) => setConfig((prev) => ({ ...prev, [key]: value }))}
          />
        </div>
        <div className={PANEL}>
          <div className="flex flex-col gap-1">
            <label htmlFor="payload" className="text-sm font-medium text-ink-soft">
              Payload
            </label>
            <input
              id="payload"
              type="text"
              className="rounded-md border border-ivory-deep p-2 font-mono"
              value={text}
              onChange={(e) => onPayload(e.target.value)}
            />
            {protocol.asciiInput && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={ascii} onChange={(e) => toggleAscii(e.target.checked)} />
                <span>ASCII input</span>
              </label>
            )}
            {error && <p className="text-sm text-vermilion">{error}</p>}
          </div>
          {protocol.faults.length > 0 && (
            <fieldset className="flex flex-col gap-1">
              <legend className="text-sm font-medium text-ink-soft">Faults</legend>
              {protocol.faults.map((fault) => (
                <label key={fault.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={faults.includes(fault.id)}
                    onChange={() => toggleFault(fault.id)}
                  />
                  <span>{fault.label}</span>
                </label>
              ))}
            </fieldset>
          )}
        </div>
        <div className={`${PANEL} md:col-span-2 xl:col-span-1`}>
          <NodeDiagram from={shown?.from ?? 'A'} nodes={['Node A', 'Node B']} />
          <PlaybackControls state={pb} dispatch={dispatch} />
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-medium text-ink">Field inspector</h2>
        <FieldInspector protocolId={protocol.id} span={shown} events={timeline.events} />
      </section>
    </div>
  )
}
