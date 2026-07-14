import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SeatMap } from './SeatMap.js'

describe('SeatMap', () => {
  const seats = [
    { id: '1', seatNo: 'A1', status: 'AVAILABLE' },
    { id: '2', seatNo: 'A2', status: 'LOCKED' },
    { id: '3', seatNo: 'A3', status: 'BOOKED' },
  ]

  it('renders all seats', () => {
    render(<SeatMap seats={seats} onSelect={vi.fn()} />)
    expect(screen.getByText('A1')).toBeDefined()
    expect(screen.getByText('A2')).toBeDefined()
    expect(screen.getByText('A3')).toBeDefined()
  })

  it('disables booked seats', () => {
    render(<SeatMap seats={seats} onSelect={vi.fn()} />)
    const bookedBtn = screen.getByText('A3').closest('button')
    expect(bookedBtn?.disabled).toBe(true)
  })
})
