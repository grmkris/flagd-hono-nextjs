import pino from "pino";
import { createFlagApi } from "./api";

export const logger = pino({ level: "info" }).child({
	deploymentId: crypto.randomUUID(),
});

export const app = await createFlagApi().finally(() => {
	logger.info("Flag service stopped");
});

Bun.serve({
	port: 3000,
	hostname: "0.0.0.0",
	fetch: app.fetch,
});


logger.info("Service listening on http://localhost:3000")