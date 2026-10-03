import type { FieldSpan, ProtocolEvent } from '../core/types'
import { fieldDoc } from '../protocols/fields'

type Props = {
  span: FieldSpan | null
  events: ProtocolEvent[]
  protocolId?: string
}

export function FieldInspector({ span, events, protocolId }: Props) {
  const doc = span && protocolId ? fieldDoc(protocolId, span.name) : undefined
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded border p-2">
        {span ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-sm">
            <dt className="font-medium">Field</dt>
            <dd>{span.name}</dd>
            <dt className="font-medium">Value</dt>
            <dd>{span.value ?? '-'}</dd>
            <dt className="font-medium">From</dt>
            <dd>Node {span.from}</dd>
            {doc && (
              <>
                <dt className="font-medium">Bits</dt>
                <dd>{doc.bits}</dd>
                <dt className="font-medium">Meaning</dt>
                <dd>{doc.meaning}</dd>
              </>
            )}
          </dl>
        ) : (
          <p className="text-sm text-gray-500">Hover or tap a field to inspect it.</p>
        )}
      </div>
      <ul className="max-h-48 overflow-y-auto text-sm">
        {events.map((ev, i) => (
          <li key={i} className={ev.severity === 'error' ? 'text-red-600' : 'text-gray-700'}>
            t={ev.t} {ev.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
