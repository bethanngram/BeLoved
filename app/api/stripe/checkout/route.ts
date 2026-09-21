import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const userId = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!userId) return NextResponse.json({ error: 'Sign in before starting a payment.' }, { status: 401 })

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  const mode = body?.mode === 'donation' ? 'donation' : 'membership'
  const origin = new URL(request.url).origin
  const { data: profile } = await supabase.from('profiles').select('email,name').eq('id', userId).maybeSingle()

  const form = new URLSearchParams()
  form.set('line_items[0][quantity]', '1')
  form.set('success_url', origin + '/' + (mode === 'donation' ? 'give' : 'membership/success') + '?session_id={CHECKOUT_SESSION_ID}')
  form.set('cancel_url', origin + '/' + (mode === 'donation' ? 'give' : 'membership'))
  form.set('billing_address_collection', 'auto')
  form.set('allow_promotion_codes', 'true')
  form.set('client_reference_id', userId)
  form.set('metadata[user_id]', userId)
  form.set('metadata[purpose]', mode === 'donation' ? String(body?.purpose || 'community giving') : 'BeLoved membership')
  if (profile?.email) form.set('customer_email', profile.email)

  if (mode === 'membership') {
    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) return NextResponse.json({ error: 'Membership billing is not configured yet.' }, { status: 503 })
    form.set('mode', 'subscription')
    form.set('line_items[0][price]', priceId)
  } else {
    const amount = Math.round(Number(body?.amount_cents))
    if (!Number.isFinite(amount) || amount < 100 || amount > 1000000) return NextResponse.json({ error: 'Choose a giving amount between $1 and $10,000.' }, { status: 400 })
    const purpose = String(body?.purpose || 'community giving').trim().slice(0, 120)
    const { data: intent, error: intentError } = await supabase.from('funding_intents').insert({
      payer_profile_id: userId,
      purpose,
      amount_cents: amount,
      currency: 'usd',
      status: 'pending',
      description: purpose,
      metadata: { source: 'beloved_give' },
    }).select('id').single()
    if (intentError) return NextResponse.json({ error: intentError.message }, { status: 400 })
    form.set('mode', 'payment')
    form.set('line_items[0][price_data][currency]', 'usd')
    form.set('line_items[0][price_data][product_data][name]', 'BeLoved Giving')
    form.set('line_items[0][price_data][product_data][description]', purpose)
    form.set('line_items[0][price_data][unit_amount]', String(amount))
    form.set('metadata[funding_intent_id]', intent.id)
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(secretKey + ':').toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  })
  if (!response.ok) {
    console.error('Stripe Checkout error:', response.status, await response.text())
    return NextResponse.json({ error: 'Stripe Checkout could not be created.' }, { status: 502 })
  }
  const session = await response.json()
  return NextResponse.json({ url: session.url }, { headers: { 'Cache-Control': 'private, no-store' } })
}
