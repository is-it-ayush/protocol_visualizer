import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { PacketAnatomy } from '../src/components/PacketAnatomy'
import { FIELD_DOCS, fieldColor, fieldDoc } from '../src/protocols/fields'

afterEach(cleanup)

describe('PacketAnatomy', () => {
  it('renders one block per doc field with name, width and color', () => {
    const { container } = render(<PacketAnatomy protocolId="can" selected={null} onSelect={() => {}} />)
    const blocks = container.querySelectorAll('[data-testid^="anatomy-block-"]')
    expect(blocks.length).toBe(FIELD_DOCS.can.length)
    for (const d of FIELD_DOCS.can) {
      const b = screen.getByTestId(`anatomy-block-${d.name}`)
      expect(b.textContent).toContain(d.name)
      expect(b.getAttribute('data-color')).toBe(fieldColor(d.name))
    }
  })

  it('click calls onSelect with the field name', () => {
    const onSelect = vi.fn()
    render(<PacketAnatomy protocolId="i2c" selected={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByTestId('anatomy-block-address'))
    expect(onSelect).toHaveBeenCalledWith('address')
  })

  it('shows the meaning of the selected field', () => {
    render(<PacketAnatomy protocolId="i2c" selected="ack" onSelect={() => {}} />)
    expect(screen.getByTestId('anatomy-meaning').textContent).toContain(fieldDoc('i2c', 'ack')!.meaning)
  })

  it('renders nothing for an unknown protocol', () => {
    const { container } = render(<PacketAnatomy protocolId="zzz" selected={null} onSelect={() => {}} />)
    expect(container.querySelectorAll('[data-testid^="anatomy-block-"]').length).toBe(0)
  })
})
