import type { ConfigField } from '../core/types'

type Props = {
  fields: ConfigField[]
  config: Record<string, any>
  onChange: (key: string, value: string | number) => void
}

export function ConfigPanel({ fields, config, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {fields.map((field) => {
        const id = `cfg-${field.key}`
        return (
          <div key={field.key} className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-gray-700">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                id={id}
                className="rounded-md border p-1"
                value={String(config[field.key])}
                onChange={(e) => {
                  const opt = field.options?.find((o) => String(o.value) === e.target.value)
                  if (opt) onChange(field.key, opt.value)
                }}
              >
                {(field.options ?? []).map((o) => (
                  <option key={String(o.value)} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                type="number"
                className="rounded-md border p-1"
                value={String(config[field.key])}
                onChange={(e) => {
                  const raw = e.target.value
                  const n = Number(raw)
                  if (raw.trim() === '' || Number.isNaN(n)) return
                  onChange(field.key, n)
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
