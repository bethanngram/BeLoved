import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const profileId = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })

  const { data: account } = await supabase
    .from('payment_accounts')
    .select('stripe_customer_id')
    .eq('profile_id', profileId)
    .eq('account_type', 'customer')
    .maybeSingle()

  if (!account?.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer record exists for this account yet.' }, { status: 404 })
  }

  const form = new URLSearchParams({
    customer: account.stripe_customer_id,
    return_url: (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin) + '/account',
  })

  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error('Stripe Portal error:', payload)
    return NextResponse.json({ error: payload?.error?.message || 'Stripe customer portal could not be created.' }, { status: 502 })
  }

  return NextResponse.json({ url: payload.url }, { headers: { 'Cache-Control': 'private, no-store' } })
}
