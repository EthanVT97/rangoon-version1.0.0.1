// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  dialect: 'postgresql', // <-- ဒီ line ကို အတိအကျ ထည့်သွင်းထားပါ
} satisfies Config;
