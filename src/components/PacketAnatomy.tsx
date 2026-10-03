import { FIELD_DOCS, fieldColor, fieldDoc } from '../protocols/fields'

// Relative width from the leading number in the bits label, clamped so tiny fields stay clickable.
function widthWeight(bits: string): number {
  const n = parseInt(bits, 10)
  return Math.min(Math.max(Number.isFinite(n) ? n : 1, 2), 16)
}

export function PacketAnatomy({
  protocolId,
  selected,
  onSelect,
}: {
  protocolId: string
  selected: string | null
  onSelect: (name: string) => void
}) {
  const docs = FIELD_DOCS[protocolId]
  if (!docs) return null
  const doc = selected ? fieldDoc(protocolId, selected) : undefined

  return (
    <div className="w-full">
      <div className="flex w-full gap-1 overflow-x-auto">
        {docs.map((d) => {
          const color = fieldColor(d.name)
          const active = d.name === selected
          return (
            <button
              key={d.name}
              type="button"
              data-testid={`anatomy-block-${d.name}`}
              data-color={color}
              aria-pressed={active}
              onClick={() => onSelect(d.name)}
              style={{
                flexGrow: widthWeight(d.bits),
                flexBasis: 0,
                minWidth: '3.5rem',
                backgroundColor: color,
                outline: active ? '3px solid currentColor' : 'none',
                opacity: selected && !active ? 0.6 : 1,
              }}
              className="rounded px-2 py-2 text-left text-xs text-white"
            >
              <div className="font-semibold">{d.name}</div>
              <div className="opacity-90">{d.bits}</div>
            </button>
          )
        })}
      </div>
      <div data-testid="anatomy-meaning" className="mt-2 text-sm">
        {doc ? (
          <>
            <span className="font-semibold">{doc.name}</span>: {doc.meaning}{' '}
            <span className="opacity-70">e.g. {doc.example}</span>
          </>
        ) : (
          <span className="opacity-70">Select a field to see what it means.</span>
        )}
      </div>
    </div>
  )
}
