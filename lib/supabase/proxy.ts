import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://srrstsgqmjulwyqfgmdv.supabase.co'

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_LolpTHZsFbjPR8qNOm0G2Q_1NKp9kb8'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )

        Object.entries(headers).forEach(([header, value]) =>
          response.headers.set(header, value)
        )
      },
    },
  })

  await supabase.auth.getClaims()
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
