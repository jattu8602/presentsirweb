import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Log the database URL we're connecting to
console.log(
  `Connecting to database: ${process.env.DATABASE_URL?.substring(0, 25)}...`
)

// Force Prisma to respect the DATABASE_URL environment variable
export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
