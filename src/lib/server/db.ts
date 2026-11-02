import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// process.env instead of $app/env, because the seed script runs outside SvelteKit
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter: new PrismaLibSql({ url: databaseUrl })
	});

// Keep one client across HMR reloads in dev so each reload doesn't open a new connection
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
