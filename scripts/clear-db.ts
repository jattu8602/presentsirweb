import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    // Delete all records from all tables in the correct order
    // to respect foreign key constraints
    console.log('Clearing database...')

    // First delete records from tables that depend on others
    await prisma.payment.deleteMany()
    await prisma.school.deleteMany()
    await prisma.user.deleteMany()

    console.log('Database cleared successfully!')
  } catch (error) {
    console.error('Error clearing database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearDatabase()
