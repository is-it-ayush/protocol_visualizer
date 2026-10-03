import { render, screen } from '@testing-library/react'
import App from '../src/App'

describe('App', () => {
  it('renders dashboard with protocol links', () => {
    render(<App />)
    expect(screen.getByText('I2C')).toBeInTheDocument()
    expect(screen.getByText('SPI')).toBeInTheDocument()
  })

  it('navigates to protocol page', () => {
    const { container } = render(<App />)
    const i2cLink = container.querySelector('a[href*="/protocol/i2c"]')
    expect(i2cLink).toBeInTheDocument()
  })
})
