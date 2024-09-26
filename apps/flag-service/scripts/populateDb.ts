import { hc } from "hono/client";
import type { App } from "../src/api";

async function populateDb() {
	const apiClient = hc<App>("http://localhost:3000", {
		headers: {
			"Content-Type": "application/json",
		},
	});

	// Create features
	const features = [
		{ key: "feature1", name: "Feature 1", description: "Test feature 1" },
		{ key: "feature2", name: "Feature 2", description: "Test feature 2" },
		{ key: "feature3", name: "Feature 3", description: "Test feature 3" },
	];

	for (const feature of features) {
		const result = await apiClient.features.$post({ json: feature });
		if (result.status !== 201) {
			console.warn(
				`Failed to create feature ${feature.key}:`,
				(await result.json()).error,
			);
			continue;
		}
		console.log(`Created feature: ${feature.key}`);
	}

	// Define static feature states
	const featureStates = [
		// feature1: enabled for org1, disabled for org2
		{
			featureKey: "feature1",
			contextType: "organization",
			contextId: "org1",
			state: true,
		},
		{
			featureKey: "feature1",
			contextType: "organization",
			contextId: "org2",
			state: true,
		},
		// feature1: 3 workspaces in org1, mixed states
		{
			featureKey: "feature1",
			contextType: "workspace",
			contextId: "workspace1",
			state: true,
		},
		{
			featureKey: "feature1",
			contextType: "workspace",
			contextId: "workspace2",
			state: true,
		},
		{
			featureKey: "feature1",
			contextType: "workspace",
			contextId: "workspace3",
			state: true,
		},
		// feature2: enabled for org1, disabled for some workspaces
		{
			featureKey: "feature2",
			contextType: "organization",
			contextId: "org1",
			state: true,
		},
		{
			featureKey: "feature2",
			contextType: "workspace",
			contextId: "workspace1",
			state: true,
		},
		{
			featureKey: "feature2",
			contextType: "workspace",
			contextId: "workspace2",
			state: true,
		},
		// feature3: mixed states
		{
			featureKey: "feature3",
			contextType: "organization",
			contextId: "org1",
			state: true,
		},
		{
			featureKey: "feature3",
			contextType: "organization",
			contextId: "org2",
			state: true,
		},
		{
			featureKey: "feature3",
			contextType: "workspace",
			contextId: "workspace1",
			state: true,
		},
		{
			featureKey: "feature3",
			contextType: "workspace",
			contextId: "workspace2",
			state: true,
		},
	];

	for (const state of featureStates) {
		const result = await apiClient["feature-states"].$post({ json: state });
		if (result.status !== 201) {
			console.warn(
				`Failed to create feature state for ${state.featureKey} in ${state.contextType} ${state.contextId}:`,
				(await result.json()).error,
			);
			continue;
		}
		console.log(
			`Created feature state: ${state.featureKey} for ${state.contextType} ${state.contextId} = ${state.state}`,
		);
	}

	console.log("Database populated successfully");
}

populateDb().catch((error) => {
	console.error("Failed to populate database:", error);
	process.exit(1);
});
