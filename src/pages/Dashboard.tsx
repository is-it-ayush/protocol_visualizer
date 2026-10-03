import { Link } from 'react-router'
import { CATALOG } from '../protocols/catalog'

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Protocol Visualizer</h1>
      <div className="space-y-2">
        {CATALOG.map((protocol) => (
          <Link
            key={protocol.id}
            to={`/protocol/${protocol.id}`}
            className="block p-2 hover:bg-gray-100 rounded"
            aria-label={`${protocol.name} protocol page`}
          >
            {protocol.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
