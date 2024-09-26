import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { env } from "./env";
import { sql } from "drizzle-orm";

let db: PostgresJsDatabase<typeof schema>;

export function initDb(testDb?: PostgresJsDatabase<typeof schema>) {
	if (testDb) {
		db = testDb;
		return db;
	}

	const dbUrl = env.DATABASE_URL;
	if (!dbUrl) throw new Error("DATABASE_URL is not set");

	const client = postgres(dbUrl, { prepare: true });
	db = drizzle(client, { schema });

	return db;
}

export function getDb() {
	if (!db) {
		db = initDb();
	}
	return db;
}

export async function createTestDb(testName: string) {
	const dbName = `test_db_${testName}_${Date.now()}`.toLowerCase();
	const dbUrl = env.DATABASE_URL;
	if (!dbUrl) throw new Error("DATABASE_URL is not set");

	const pg = postgres(dbUrl);
	const adminDrizzle = drizzle(pg, { schema, logger: true });

	try {
		await adminDrizzle.execute(sql`CREATE DATABASE ${sql.raw(dbName)}`);

		const newDbUrl = dbUrl.replace(/\/[^/]+$/, `/${dbName}`);
		const newPg = postgres(newDbUrl);
		const testDb = drizzle(newPg, { schema, logger: false });

		await migrate(testDb, { migrationsFolder: "drizzle" });

		// Initialize the global db with the test database
		initDb(testDb);

		return testDb;
	} catch (error) {
		console.error("Error creating test database:", error);
		throw error;
	} finally {
		await pg.end();
	}
}

export type db = typeof db;
