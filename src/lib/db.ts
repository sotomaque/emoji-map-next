import { PrismaClient } from '@prisma/client';
import { env } from '@/env';

// Create a function that returns a properly configured PrismaClient
function createPrismaClient() {
  return new PrismaClient({
    log: ['error', 'warn'],
    // Always use the non-pooling URL to avoid connection pooling issues
    datasourceUrl: env.POSTGRES_URL_NON_POOLING,
  });
}

// Use a more robust global singleton pattern
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize the client with proper error handling
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Add proper shutdown handling
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;

  // Handle common termination signals
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, closing Prisma connections...`);
      await prisma.$disconnect();
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (e) => {
    console.error('Uncaught exception, closing Prisma connections...', e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
