import { useParams } from 'react-router'
import { getProtocol } from '../core/registry'
import { CATALOG } from '../protocols/catalog'
import { ProtocolView } from '../components/ProtocolView'
import '../protocols'

export default function ProtocolPage() {
  const { id = '' } = useParams()
  const protocol = getProtocol(id)
  const name = protocol?.name ?? CATALOG.find((p) => p.id === id)?.name ?? id

  return (
    <div className="p-4">
      <h1 className="mb-4 border-b-2 border-saffron pb-2 text-2xl font-bold text-ink">{name}</h1>
      {protocol ? (
        <ProtocolView key={protocol.id} protocol={protocol} />
      ) : (
        <p className="text-ink-soft">Visualization for {name} is coming soon.</p>
      )}
    </div>
  )
}
