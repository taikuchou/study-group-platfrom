import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Create test database instance with timestamp-based name
const testDbName = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
process.env.DATABASE_URL = `postgresql://postgres:postgres@localhost:5432/${testDbName}?schema=public`;

// Test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE = '7d';

let prisma: PrismaClient;

beforeAll(async () => {
  // Create test database
  try {
    execSync(`createdb ${testDbName}`, { stdio: 'ignore' });
  } catch (error) {
    console.log('Database might already exist or createdb not available');
  }

  // Initialize Prisma client
  prisma = new PrismaClient();
  
  // Run migrations
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
});

afterAll(async () => {
  // Clean up
  await prisma.$disconnect();
  
  try {
    execSync(`dropdb ${testDbName}`, { stdio: 'ignore' });
  } catch (error) {
    console.log('Error dropping test database');
  }
});

beforeEach(async () => {
  // Clean all tables before each test
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
    }
  }
});

export { prisma };