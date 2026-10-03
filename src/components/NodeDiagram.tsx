export function NodeDiagram({ from, nodes }: { from: 'A' | 'B'; nodes: [string, string] }) {
  const active = (side: 'A' | 'B') => (from === side ? 'border-blue-500 bg-blue-50' : 'border-gray-300')
  // the line is drawn in the direction of travel, so decreasing dashoffset always moves dashes forward
  const x1 = from === 'A' ? 110 : 190
  const x2 = from === 'A' ? 190 : 110
  return (
    <div className="flex items-center justify-center gap-2" data-testid="node-diagram" data-from={from}>
      <div className={`rounded-md border-2 px-4 py-3 text-sm font-medium ${active('A')}`}>{nodes[0]}</div>
      <svg width={80} height={24} viewBox="100 0 100 24" aria-label={`${from === 'A' ? nodes[0] : nodes[1]} transmitting`}>
        <defs>
          <marker id="node-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0L8,4L0,8z" fill="#2563eb" />
          </marker>
        </defs>
        <line
          x1={x1}
          x2={x2}
          y1={12}
          y2={12}
          stroke="#2563eb"
          strokeWidth={2}
          strokeDasharray="6 4"
          markerEnd="url(#node-arrow)"
        >
          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.6s" repeatCount="indefinite" />
        </line>
      </svg>
      <div className={`rounded-md border-2 px-4 py-3 text-sm font-medium ${active('B')}`}>{nodes[1]}</div>
    </div>
  )
}
