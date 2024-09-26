import { app } from "../src/index";
import { createTestDb, type db } from "../src/db";
import { testClient } from "hono/testing";
import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { features, featureStates } from "../src/schema";

describe("Flag Service API", () => {
  let testDb: db;
  let testApiClient = testClient(app);

  beforeAll(async () => {
    testDb = await createTestDb("flagservice");
    testApiClient = testClient(app, { db: testDb });
    console.log("Test database created");
  });

  beforeEach(async () => {
    // Reset the features and featureStates tables before each test
    await testDb.delete(features).execute();
    await testDb.delete(featureStates).execute();
  });

  test("GET /flagd - Generate flagd config", async () => {
    // Create some test data using API endpoints
    await testApiClient["features"].$post({
      json: { key: "feature1", name: "Feature 1", description: "Test feature 1" },
    });
    await testApiClient["features"].$post({
      json: { key: "feature2", name: "Feature 2", description: "Test feature 2" },
    });

    await testApiClient["feature-states"].$post({
      json: { featureKey: "feature1", contextType: "workspace", contextId: "workspace1", state: true },
    });
    await testApiClient["feature-states"].$post({
      json: { featureKey: "feature2", contextType: "workspace", contextId: "workspace2", state: false },
    });

    const res = await testApiClient["flagd"].$get();
    expect(res.status).toBe(200);
    if (res.status !== 200) {
      console.log(await res.json());
      throw new Error("Failed to generate flagd config");
    }
    const data = await res.json();
    console.log(data);
    expect(data).toHaveProperty("flags");
    // expect(data.flags["feature1"]).toHaveProperty("state", "ENABLED");
    // expect(data.flags["feature2"]).toHaveProperty("state", "DISABLED");
  });
});
