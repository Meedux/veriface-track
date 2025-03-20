import { PrismaClient } from '@prisma/client'

// Using JavaScript-compatible syntax for global variable
const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma