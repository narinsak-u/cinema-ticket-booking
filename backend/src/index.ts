import { createApp } from './app.js'
import { env } from './config/env.js'

const { httpServer, cleanup, prisma } = createApp()

httpServer.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
})

function shutdown() {
  console.log('Shutting down gracefully...')
  cleanup()
  httpServer.close()
  prisma.$disconnect()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err)
})
