import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import App from '../src/App'

afterEach(cleanup)

describe('Dashboard cards', () => {
  it('renders 6 cards with description, sketch and wire count', () => {
    const { container } = render(<App />)
    const cards = container.querySelectorAll('[data-testid^="card-"]:not([data-testid="card-desc"]):not([data-testid="card-wires"]):not([data-testid="card-sketch"])')
    expect(cards.length).toBe(6)
    for (const id of ['i2c', 'spi', 'uart', 'can', 'lin', 'rs232']) {
      const card = container.querySelector(`[data-testid="card-${id}"]`)!
      expect(card, id).toBeTruthy()
      expect(card.closest('a')?.getAttribute('href') ?? card.querySelector('a')?.getAttribute('href')).toContain(`/protocol/${id}`)
      expect(card.querySelector('[data-testid="card-desc"]')!.textContent!.length).toBeGreaterThan(15)
      expect(card.querySelector('[data-testid="card-wires"]')!.textContent).toMatch(/\d+\s*wires?/i)
      expect(card.querySelector('[data-testid="card-sketch"]')).toBeTruthy()
    }
  })
})
