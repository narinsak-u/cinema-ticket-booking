import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/error.middleware.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.use(errorHandler)

  return app
}
