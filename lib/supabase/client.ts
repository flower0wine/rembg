import type { Database } from "./database.types";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export function createClient() {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      // default schema is public
      // db: {
      //   schema: "public",
      // },
      auth: {
        flowType: "pkce",
        // debug: process.env.NODE_ENV === "development",
      }
    }
  );
}
