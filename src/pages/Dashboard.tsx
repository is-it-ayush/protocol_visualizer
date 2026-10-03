import { Link } from 'react-router'
import { CATALOG } from '../protocols/catalog'

function FrameSketch({ wires }: { wires: number }) {
  return (
    <svg
      data-testid="card-sketch"
      viewBox="0 0 120 32"
      className="h-8 w-full text-peacock"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="28" height="30" rx="3" className="fill-saffron-tint stroke-saffron" />
      <rect x="91" y="1" width="28" height="30" rx="3" className="fill-peacock-tint stroke-peacock" />
      {Array.from({ length: wires }, (_, i) => {
        const y = ((i + 1) * 32) / (wires + 1)
        return <line key={i} x1="29" x2="91" y1={y} y2={y} className="stroke-ink-soft" strokeWidth="1.5" />
      })}
    </svg>
  )
}

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-ink">Protocol Visualizer</h1>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG.map((protocol) => (
          <Link
            key={protocol.id}
            to={`/protocol/${protocol.id}`}
            data-testid={`card-${protocol.id}`}
            className="flex min-h-11 flex-col gap-2 rounded border border-ink-soft bg-ivory-deep p-3 text-ink hover:bg-saffron-tint"
            aria-label={`${protocol.name} protocol page`}
          >
            <span className="flex items-baseline justify-between">
              <span className="font-semibold">{protocol.name}</span>
              <span data-testid="card-wires" className="text-sm text-ink-soft">
                {protocol.wires} {protocol.wires === 1 ? 'wire' : 'wires'}
              </span>
            </span>
            <span data-testid="card-desc" className="text-sm text-ink-soft">
              {protocol.purpose}
            </span>
            <FrameSketch wires={protocol.wires} />
          </Link>
        ))}
      </div>
    </div>
  )
}
