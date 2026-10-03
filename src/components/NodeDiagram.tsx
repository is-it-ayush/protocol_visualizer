export function NodeDiagram({ from, nodes }: { from: 'A' | 'B'; nodes: [string, string] }) {
  return <div className="flex gap-2"><div>{nodes[0]}</div><span>{from === 'A' ? '->' : '<-'}</span><div>{nodes[1]}</div></div>;
}