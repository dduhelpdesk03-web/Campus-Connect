import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Database setup needs DATABASE_URL (and DATABASE_DIRECT_URL for a Neon pooled connection). See the free hosting guide.");
  process.exit(1);
}

try {
  const host = new URL(connectionString).hostname;
  if (host.includes("-pooler.") && host.endsWith(".neon.tech")) {
    console.error("For Neon migrations, set DATABASE_DIRECT_URL to the direct (unpooled) connection string.");
    process.exit(1);
  }
} catch {
  console.error("The database connection URL is invalid.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 20000 });
let client;
try {
  client = await pool.connect();
  const db = drizzle(client);
  // Keep simultaneous deployments from applying migrations at the same time.
  await db.execute(sql`select pg_advisory_lock(1847652912)`);
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Database migrations are up to date.");
  } finally {
    await db.execute(sql`select pg_advisory_unlock(1847652912)`);
  }
} catch (error) {
  console.error("Database migration failed. Check the direct connection URL and database permissions.");
  if (error && typeof error === "object" && "code" in error) console.error(`Database error code: ${error.code}`);
  process.exitCode = 1;
} finally {
  if (client) client.release();
  await pool.end();
}
