import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const actor = auth?.claims?.sub ? String(auth.claims.sub) : null
  const body = await request.json().catch(() => ({}))
  await supabase.from('system_events').insert({ actor_profile_id: actor, event_type: 'client_error', metadata: { message: typeof body.message === 'string' ? body.message.slice(0, 1000) : 'Unknown client error', digest: typeof body.digest === 'string' ? body.digest.slice(0, 200) : null, path: typeof body.path === 'string' ? body.path.slice(0, 500) : null, user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null } })
  return NextResponse.json({ ok: true })
}
