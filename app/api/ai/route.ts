import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { orchestrate } from '@/lib/ai/orchestrator'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims?.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const input = typeof body.input === 'string' ? body.input.trim() : ''
  if (!input) return NextResponse.json({ error: 'Input required' }, { status: 400 })

  const result = await orchestrate(String(data.claims.sub), input)
  return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } })
}
