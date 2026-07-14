import { PrismaClient } from '@prisma/client'

const ROWS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function createShowtimeSeats(rows: number, cols: number): string[] {
  const seats: string[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      seats.push(`${ROWS[r]}${c}`)
    }
  }
  return seats
}

async function main() {
  const prisma = new PrismaClient()

  try {
    const movies = await Promise.all([
      prisma.movie.create({
        data: {
          title: 'Inception',
          description: 'A thief who steals corporate secrets through dream-sharing technology',
          posterUrl: '/posters/inception.jpg',
          duration: 148,
          genre: 'Sci-Fi',
        },
      }),
      prisma.movie.create({
        data: {
          title: 'The Matrix',
          description: 'A computer hacker learns about the true nature of reality',
          posterUrl: '/posters/matrix.jpg',
          duration: 136,
          genre: 'Action',
        },
      }),
      prisma.movie.create({
        data: {
          title: 'Interstellar',
          description: 'A team of explorers travel through a wormhole in space',
          posterUrl: '/posters/interstellar.jpg',
          duration: 169,
          genre: 'Sci-Fi',
        },
      }),
    ])

    const now = new Date()
    for (const movie of movies) {
      for (let day = 0; day < 3; day++) {
        const showtime = await prisma.showtime.create({
          data: {
            movieId: movie.id,
            hall: `Hall ${(day % 3) + 1}`,
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, 10 + day * 3, 0),
            price: 12.5 + day * 2,
          },
        })

        const seatLabels = createShowtimeSeats(5, 8)
        await prisma.seat.createMany({
          data: seatLabels.map((seatNo) => ({
            showtimeId: showtime.id,
            seatNo,
          })),
        })
      }
    }

    const adminEmail = 'admin@cinema.com'
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (!existing) {
      const bcrypt = await import('bcryptjs')
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: await bcrypt.hash('admin123', 10),
          name: 'Admin',
          role: 'ADMIN',
        },
      })
    }

    console.log('Seed complete')
  } finally {
    await prisma.$disconnect()
  }
}

if (!process.env['VITEST']) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
