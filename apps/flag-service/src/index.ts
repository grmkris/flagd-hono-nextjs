import { Hono } from "hono";
import { features, featureStates, generateFlagdConfig } from "./schema";
import { eq } from "drizzle-orm";
import type { FeatureId, FeatureStateId } from "./id";
import { createMiddleware } from "hono/factory";
import { getDb, type db } from "./db";
import { cors } from 'hono/cors'
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { pinoLogger } from "hono-pino-logger";
import pino from "pino";
export type AppContext = {
	db: db;
};

export const createFlagService = async () => {
	const db = getDb();
	const logger = pino({ level: "info" });
	const migrationResult = await migrate(getDb(), {
		migrationsFolder: "./drizzle",
	});
	logger.info("Migration result", migrationResult);

	const appMiddleware = createMiddleware(async (c, next) => {
		c.set("db", db);
		await next();
	});

	const app = new Hono<{
		Variables: AppContext;
	}>()
		.use(pinoLogger())
		.use(cors({ origin: "*", allowHeaders: ["Content-Type"], allowMethods: ["GET", "POST", "PUT", "DELETE"] }))
		.use("*", appMiddleware)
		.get("/", (c) => c.text("Ready"))
		.post("/features", async (c) => {
			console.log("POST /features");
			const db = c.get("db");
			try {
				const { key, name, description } = await c.req.json();
				console.log("POST /features", key, name, description);
				const [newFeature] = await db
					.insert(features)
					.values({ key, name, description })
					.returning();
				return c.json(newFeature, 201);
			} catch (error) {
				console.log("POST /features", error);
				return c.json({ error: "Failed to create feature" }, 500);
			}
		})
		.put("/features/:id", async (c) => {
			const db = c.get("db");
			try {
				const id = c.req.param("id");
				const { key, name, description } = await c.req.json();
				const [updatedFeature] = await db
					.update(features)
					.set({ key, name, description, updatedAt: new Date() })
					.where(eq(features.id, id as FeatureId))
					.returning();
				if (updatedFeature) {
					return c.json(updatedFeature);
				}
				return c.json({ error: "Feature not found" }, 404);
			} catch (error) {
				return c.json({ error: "Failed to update feature" }, 500);
			}
		})
		.delete("/features/:id", async (c) => {
			const db = c.get("db");
			try {
				const id = c.req.param("id");
				const [deletedFeature] = await db
					.delete(features)
					.where(eq(features.id, id as FeatureId))
					.returning();
				if (deletedFeature) {
					return c.json({ message: "Feature deleted successfully" });
				}
				return c.json({ error: "Feature not found" }, 404);
			} catch (error) {
				return c.json({ error: "Failed to delete feature" }, 500);
			}
		})
		.post("/feature-states", async (c) => {
			const db = c.get("db");
			try {
				const { featureId, featureKey, contextType, contextId, state } = await c.req.json();
				let resolvedFeatureId = featureId;
				if (!resolvedFeatureId && featureKey) {
					const feature = await db.query.features.findFirst({
						where: eq(features.key, featureKey),
					});
					if (!feature) {
						return c.json({ error: "Feature not found" }, 404);
					}
					resolvedFeatureId = feature.id;
				}

				const [newFeatureState] = await db
					.insert(featureStates)
					.values({ featureId: resolvedFeatureId, contextType, contextId, state })
					.returning();
				return c.json(newFeatureState, 201);
			} catch (error) {
				return c.json({ error: "Failed to create feature state" }, 500);
			}
		})
		.put("/feature-states/:id", async (c) => {
			const db = c.get("db");
			try {
				const id = c.req.param("id");
				const { featureId, contextType, contextId, state } = await c.req.json();
				const [updatedFeatureState] = await db
					.update(featureStates)
					.set({
						featureId,
						contextType,
						contextId,
						state,
						updatedAt: new Date(),
					})
					.where(eq(featureStates.id, id as FeatureStateId))
					.returning();
				if (updatedFeatureState) {
					return c.json(updatedFeatureState);
				}
				return c.json({ error: "Feature state not found" }, 404);
			} catch (error) {
				return c.json({ error: "Failed to update feature state" }, 500);
			}
		})
		.delete("/feature-states/:id", async (c) => {
			const db = c.get("db");
			try {
				const id = c.req.param("id");
				const [deletedFeatureState] = await db
					.delete(featureStates)
					.where(eq(featureStates.id, id as FeatureStateId))
					.returning();
				if (deletedFeatureState) {
					return c.json({ message: "Feature state deleted successfully" });
				}
				return c.json({ error: "Feature state not found" }, 404);
			} catch (error) {
				return c.json({ error: "Failed to delete feature state" }, 500);
			}
		})
		.get("/flagd.json", async (c) => {
			const db = c.get("db");
			try {
				const config = await generateFlagdConfig(db);
				return c.json(config);
			} catch (error) {
				return c.json({ error: "Failed to generate flagd config" }, 500);
			}
		})
		.get("/flagd1.json", async (c) => {
			return c.json({
				"$schema": "https://flagd.dev/schema/v0/flags.json",
				"flags": {
					"show-welcome-banner": {
						"state": "ENABLED",
						"variants": {
							"on": true,
							"off": false
						},
						"defaultVariant": "off"
					},
					"background-color": {
						"state": "ENABLED",
						"variants": {
							"red": "#FF0000",
							"blue": "#0000FF",
							"green": "#00FF00",
							"yellow": "#FFFF00"
						},
						"defaultVariant": "red",
						"targeting": {
							"if": [
								{
									"===": [
										{
											"var": "company"
										},
										"initech"
									]
								},
								"green"
							]
						}
					}
				}
			}, 200);
		});
	return app;
}

export const app = await createFlagService()

Bun.serve({
	port: 3000,
	hostname: "0.0.0.0",
	fetch: app.fetch,
});

export type App = typeof app;