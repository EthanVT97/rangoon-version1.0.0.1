// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  // Fixed: Add 'dialect' property for clearer configuration (essential for some drivers)
  dialect: 'postgresql', 
} satisfies Config;
