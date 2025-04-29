import { createClient } from "@supabase/supabase-js"

// For client-side (safe queries, reads)
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
