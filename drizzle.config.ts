// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  dialect: 'postgresql', // <-- ဒီ line ကို ထည့်သွင်းပါ သို့မဟုတ် ရှိပြီးသားဖြစ်အောင် စစ်ဆေးပါ။
} satisfies Config;
