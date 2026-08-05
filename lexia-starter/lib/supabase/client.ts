import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ehmxjwmwwirvnvdakahx.supabase.co";

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_rQ0_cgEKffn_XcmhQ56mpA_411CYGEc";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserSupabaseClient | null = null;

export function createClient(): BrowserSupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabasePublishableKey);
  }

  return browserClient;
}
