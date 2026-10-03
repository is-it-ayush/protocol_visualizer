import type { Protocol } from './types'

const registry: Map<string, Protocol> = new Map()

export function registerProtocol(p: Protocol): void {
  registry.set(p.id, p)
}

export function getProtocol(id: string): Protocol | undefined {
  return registry.get(id)
}

export function listProtocols(): Protocol[] {
  return Array.from(registry.values())
}
