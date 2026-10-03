import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import ProtocolPage from '../src/pages/ProtocolPage'
import { fieldDoc } from '../src/protocols/fields'

afterEach(cleanup)

const page = () =>
  render(
    <MemoryRouter initialEntries={['/protocol/i2c']}>
      <Routes>
        <Route path="/protocol/:id" element={<ProtocolPage />} />
      </Routes>
    </MemoryRouter>,
  )

describe('Protocol page layout', () => {
  it('shows anatomy strip before the waveform', () => {
    page()
    const strip = screen.getByTestId('anatomy-block-start')
    const lane = screen.getByTestId('lane-SCL')
    expect(strip.compareDocumentPosition(lane) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('clicking an anatomy block shows its meaning', () => {
    page()
    fireEvent.click(screen.getByTestId('anatomy-block-address'))
    expect(screen.getByTestId('anatomy-meaning').textContent).toContain(fieldDoc('i2c', 'address')!.meaning)
  })
})
