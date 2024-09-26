import { parseEnv } from "znv";
import { z } from "zod";

export const env = parseEnv(process.env, {
	DATABASE_URL: z.string().min(1),
});
