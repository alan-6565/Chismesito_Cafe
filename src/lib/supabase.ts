import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key. Every DB access in this app
// goes through our own API routes, never directly from the browser, so we
// never need to expose an anon key or set up client-side RLS policies.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
