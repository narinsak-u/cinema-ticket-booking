import { describe, it, expect } from 'vitest'
import { createShowtimeSeats } from './seed.js'

describe('createShowtimeSeats', () => {
  it('generates seat labels for a 5x8 hall', () => {
    const seats = createShowtimeSeats(5, 8)
    expect(seats).toHaveLength(40)
    expect(seats[0]).toBe('A1')
    expect(seats[39]).toBe('E8')
  })

  it('generates seat labels for a 3x4 hall', () => {
    const seats = createShowtimeSeats(3, 4)
    expect(seats).toHaveLength(12)
    expect(seats[0]).toBe('A1')
    expect(seats[11]).toBe('C4')
  })
})
