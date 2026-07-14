import { describe, it, expect } from 'vitest'
import { createApp } from './app.js'

describe('createApp', () => {
  it('returns an Express app', () => {
    const app = createApp()
    expect(app).toBeDefined()
    expect(typeof app.use).toBe('function')
  })
})
