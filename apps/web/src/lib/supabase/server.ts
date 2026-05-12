import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

function resolveSupabaseServerConfig() {
  const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env

  const supabaseUrl = runtimeEnv?.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL
  const supabasePublishableKey =
    runtimeEnv?.SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Supabase server client is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY, or VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    )
  }

  if (supabaseUrl.startsWith('postgres://') || supabaseUrl.startsWith('postgresql://')) {
    throw new Error('Invalid Supabase URL for server client. Use SUPABASE_URL/VITE_SUPABASE_URL, not a Postgres DATABASE_URL.')
  }

  return { supabaseUrl, supabasePublishableKey }
}

export function createClient(request: Request) {
  const headers = new Headers()
  const { supabaseUrl, supabasePublishableKey } = resolveSupabaseServerConfig()

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '') as {
          name: string
          value: string
        }[]
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
        )
      },
    },
  })

  return { supabase, headers }
}
