import { hc } from 'hono/client'
import { App } from "../src/index";

async function populateDb() {
  const apiClient = hc<App>("http://localhost:3000", {
    headers: {
      "Content-Type": "application/json",
    },
  }); // Adjust the URL to your running service

  // Create some test data using API endpoints
  const result = await apiClient.features.$post({
    json: { key: "feature1", name: "Feature 1", description: "Test feature 1" },
  });
  if (result.status !== 201) {
    console.error("Failed to create feature:", (await result.json()).error);
    process.exit(1);
  }
  const result1 = await apiClient.features.$post({
    json: { key: "feature2", name: "Feature 2", description: "Test feature 2" },
  });
  if (result1.status !== 201) {
    console.error("Failed to create feature:", (await result1.json()).error);
    process.exit(1);
  }

  const result2 = await apiClient["feature-states"].$post({
    json: {
      featureKey: "feature1",
      contextType: "workspace",
      contextId: "workspace1",
      state: true,
    },
  });
  if (result2.status !== 201) {
    console.error("Failed to create feature state:", (await result2.json()).error);
    process.exit(1);
  }
  const result3 = await apiClient["feature-states"].$post({
    json: {
      featureKey: "feature2",
      contextType: "workspace",
      contextId: "workspace2",
      state: false,
    },
  });
  if (result3.status !== 201) {
    console.error("Failed to create feature state:", (await result3.json()).error);
    process.exit(1);
  }

  console.log("Database populated successfully");
}

populateDb().catch((error) => {
  console.error("Failed to populate database:", error);
  process.exit(1);
});