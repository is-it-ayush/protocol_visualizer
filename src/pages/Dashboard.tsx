import { Link } from 'react-router'
import { CATALOG } from '../protocols/catalog'

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Protocol Visualizer</h1>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG.map((protocol) => (
          <Link
            key={protocol.id}
            to={`/protocol/${protocol.id}`}
            className="flex min-h-11 items-center rounded border p-2 hover:bg-gray-100"
            aria-label={`${protocol.name} protocol page`}
          >
            {protocol.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
