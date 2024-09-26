import {
	pgTable,
	timestamp,
	varchar,
	boolean,
	text,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { FeatureId, FeatureStateId, generateId } from "./id";
import { relations } from "drizzle-orm";
import type { db } from "./db";
import { z } from "zod";

export const features = pgTable("features", {
	id: varchar("id", { length: 255 })
		.primaryKey()
		.$defaultFn(() => generateId("feature"))
		.$type<FeatureId>(),
	key: varchar("key", { length: 255 }).notNull().unique(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
		.defaultNow()
		.notNull(),
});

export const featureStates = pgTable(
	"feature_states",
	{
		id: varchar("id", { length: 255 })
			.primaryKey()
			.$defaultFn(() => generateId("featureState"))
			.$type<FeatureStateId>(),
		featureId: varchar("feature_id", { length: 255 })
			.references(() => features.id)
			.notNull()
			.$type<FeatureId>(),
		contextType: varchar("context_type", { length: 20 }).notNull(), // workspace, organization, global
		contextId: varchar("context_id", { length: 255 }),
		state: boolean("state").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
			.defaultNow()
			.notNull(),
	},
	(table) => {
		return {
			featureContextUnique: uniqueIndex("feature_context_unique").on(
				table.featureId,
				table.contextType,
				table.contextId,
			),
		};
	},
);

export const featureStatesRelations = relations(featureStates, ({ one }) => ({
	feature: one(features, {
		fields: [featureStates.featureId],
		references: [features.id],
	}),
}));

export const SelectFeature = createSelectSchema(features, {
	id: FeatureId,
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const SelectFeatureState = createSelectSchema(featureStates, {
	id: FeatureStateId,
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
}).extend({
	feature: SelectFeature,
});

export async function generateFlagdConfig(db: db) {
	const featuresList = await db.select().from(features);
	const featureStatesList = await db.query.featureStates.findMany({
		with: {
			feature: true,
		},
	});

	const config: {
		flags: Record<
			string,
			{
				state: "ENABLED" | "DISABLED";
				variants: {
					on: boolean;
					off: boolean;
				};
				defaultVariant: "on" | "off";
			}
		>;
		$schema: "https://flagd.dev/schema/v0/flags.json";
	} = {
		$schema: "https://flagd.dev/schema/v0/flags.json",
		flags: {},
	};

	for (const feature of featuresList) {
		const state = getFeatureState(feature.key, featureStatesList);
		config.flags[feature.key] = {
			state: state ? "ENABLED" : "DISABLED",
			variants: {
				on: true,
				off: false,
			},
			defaultVariant: state ? "on" : "off",
		};
	}

	return config;
}

export type SelectFeatureState = z.infer<typeof SelectFeatureState>;
function getFeatureState(
	featureKey: string,
	featureStatesList: SelectFeatureState[],
) {
	for (const state of featureStatesList) {
		if (state.feature.key === featureKey) {
			if (state.contextType === "workspace") {
				return state.state;
			} else if (state.contextType === "organization") {
				return state.state;
			} else if (state.contextType === "global") {
				return state.state;
			}
		}
	}
	return false; // Default to disabled if no state is found
}
