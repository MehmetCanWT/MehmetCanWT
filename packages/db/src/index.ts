import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

let dbInstance: any = null;

if (connectionString) {
  try {
    const pool = new Pool({ connectionString });
    dbInstance = drizzle(pool, { schema });
  } catch (e) {
    console.warn("⚠️ Failed to initialize database pool. Running in OFFLINE mode.");
  }
} else {
  console.warn("⚠️ No DATABASE_URL provided. Running in OFFLINE mode.");
}

export const db = dbInstance;
export * from './schema';
