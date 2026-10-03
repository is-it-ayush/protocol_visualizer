export type Lane = {
  id: string
  label: string
  kind: 'digital' | 'analog'
}

export type Transition = {
  lane: string
  t: number
  level: number
}

export type FieldSpan = {
  name: string
  start: number
  end: number
  lane?: string
  value?: string
  from: 'A' | 'B'
}

export type ProtocolEvent = {
  t: number
  kind: string
  label: string
  severity: 'info' | 'error'
  value?: number
}

export type Timeline = {
  lanes: Lane[]
  transitions: Transition[]
  fieldSpans: FieldSpan[]
  events: ProtocolEvent[]
  duration: number
}

export type ConfigField = {
  key: string
  label: string
  type: 'number' | 'select'
  options?: { value: string | number; label: string }[]
}

export type FaultDef = {
  id: string
  label: string
}

export type Protocol<C = Record<string, any>> = {
  id: string
  name: string
  defaultConfig: C
  configFields: ConfigField[]
  faults: FaultDef[]
  defaultPayload: number[]
  asciiInput?: boolean
  encode: (config: C, payload: number[], faults: string[]) => Timeline
}
