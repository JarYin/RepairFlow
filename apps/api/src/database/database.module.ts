import { Logger, Module } from '@nestjs/common';
import { attachDatabasePool } from '@vercel/functions';
import { Pool } from 'pg';
import { DatabaseService, PG_POOL } from './database.service.js';

const logger = new Logger('DatabaseModule');

function createPool(): Pool {
  // In production this must be app_tenant. A role from the Neon Console has
  // BYPASSRLS, which would turn off every policy (ADR-0001).
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  // Creating a Pool opens no connection, so this does not wake Neon.
  const pool = new Pool({ connectionString });

  // A lost connection, such as when Neon scales to zero, arrives as an 'error' event,
  // and an unhandled 'error' event crashes the whole process, not one request. pg
  // emits it on the pool for an idle connection and on the client for a checked-out
  // one, so both need a listener. The work on that connection still fails normally.
  const logError = (error: Error) => logger.error(error.message);
  pool.on('error', logError);
  pool.on('connect', (client) => client.on('error', logError));

  // Keeps the Vercel function alive long enough to close idle connections, and does
  // nothing outside Vercel (ADR-0008).
  attachDatabasePool(pool);

  return pool;
}

@Module({
  providers: [{ provide: PG_POOL, useFactory: createPool }, DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
