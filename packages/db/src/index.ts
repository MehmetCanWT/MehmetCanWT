import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
const isProd = process.env.NODE_ENV === 'production';

let dbInstance: NodePgDatabase<typeof schema> | null = null;

if (connectionString) {
  try {
    const pool = new Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      ...(isProd ? { ssl: { rejectUnauthorized: false } } : {}),
    });
    dbInstance = drizzle(pool, { schema });
    console.log("✅ Database pool initialized successfully.");
  } catch (e) {
    console.error("❌ Failed to initialize database pool:", e);
    console.warn("⚠️ Running in OFFLINE mode.");
  }
} else {
  console.warn("⚠️ No DATABASE_URL provided. Running in OFFLINE mode.");
}

export const db = dbInstance;
export * from './schema';
