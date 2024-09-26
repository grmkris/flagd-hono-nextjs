import { Hono } from "hono";

import { OpenFeature } from "@openfeature/server-sdk";
import { FlagdProvider } from "@openfeature/flagd-provider";

export const createApp = async () => {
	await OpenFeature.setProviderAndWait(new FlagdProvider());

	// create a new client
	const client = OpenFeature.getClient();

	// Evaluate your feature flag
	const v2Enabled = await client.getBooleanValue("feature1", false, {
		workspaceId: "workspace1",
	});

	if (v2Enabled) {
		console.log("feature1 is enabled");
	}

	const app = new Hono().get("/", async (c) => {
		const feature = c.req.query("feature");
		const workspaceId = c.req.query("workspaceId");
		const organizationId = c.req.query("organizationId");

		if (workspaceId && feature) {
			const isEnabled = await client.getBooleanValue(feature, false, {
				workspaceId: workspaceId,
			});
			return c.json({
				feature,
				isEnabled,
				workspaceId: workspaceId,
			});
		}

		if (organizationId && feature) {
			const isEnabled = await client.getBooleanValue(feature, false, {
				organizationId: organizationId,
			});
			return c.json({
				feature,
				isEnabled,
				organizationId: organizationId,
			});
		}

		if (feature) {
			const isEnabled = await client.getBooleanValue(feature, false);
			return c.json({
				feature,
				isEnabled,
				workspaceId: "Not specified",
				organizationId: "Not specified",
			});
		}

		// If no feature is specified, return examples
		return c.json({
			message:
				"Use '?feature=featureName' with optional 'workspaceId' or 'organizationId' to check feature flags.",
			examples: {
				example1: {
					url: "/?feature=feature1",
					description: "Check feature1 without workspace or organization",
				},
				example2: {
					url: "/?feature=feature2&workspaceId=workspace123",
					description: "Check feature2 for workspace123",
				},
				example3: {
					url: "/?feature=feature3&organizationId=org456",
					description: "Check feature3 for organization org456",
				},
			},
		});
	});

	console.log("App started on http://localhost:3001");
	return app;
};

export const app = await createApp();

Bun.serve({
	port: 3001,
	fetch: app.fetch,
});
