import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
const stripeApi = 'https://api.stripe.com/v1'

async function stripeRequest(path: string, secretKey: string, body: URLSearchParams) {
  const response = await fetch(stripeApi + path, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(secretKey + ':').toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload?.error?.message || 'Stripe request failed')
  return payload
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const profileId = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const secretKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID
  if (!secretKey || !priceId) return NextResponse.json({ error: 'Stripe live configuration is not complete.' }, { status: 503 })

  try {
    const { data: profile } = await supabase.from('profiles').select('name,email').eq('id', profileId).maybeSingle()
    const { data: existingAccount } = await supabase.from('payment_accounts').select('stripe_customer_id').eq('profile_id', profileId).eq('account_type', 'customer').maybeSingle()
    let customerId = existingAccount?.stripe_customer_id ?? null

    if (!customerId) {
      const customerForm = new URLSearchParams()
      if (profile?.email) customerForm.set('email', profile.email)
      if (profile?.name) customerForm.set('name', profile.name)
      customerForm.set('metadata[supabase_profile_id]', profileId)
      const customer = await stripeRequest('/customers', secretKey, customerForm)
      customerId = customer.id as string
      await supabase.from('payment_accounts').upsert({ profile_id: profileId, stripe_customer_id: customerId, account_type: 'customer', status: 'active', metadata: { source: 'beloved_membership_checkout' }, updated_at: new Date().toISOString() }, { onConflict: 'profile_id,account_type' })
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
    const form = new URLSearchParams()
    form.set('mode', 'subscription')
    form.set('customer', customerId)
    form.set('line_items[0][price]', priceId)
    form.set('line_items[0][quantity]', '1')
    form.set('success_url', origin + '/membership/success?session_id={CHECKOUT_SESSION_ID}')
    form.set('cancel_url', origin + '/membership')
    form.set('billing_address_collection', 'auto')
    form.set('allow_promotion_codes', 'true')
    form.set('client_reference_id', profileId)
    form.set('metadata[profile_id]', profileId)
    form.set('metadata[purpose]', 'beloved_membership')

    const session = await stripeRequest('/checkout/sessions', secretKey, form)
    return NextResponse.json({ url: session.url, session_id: session.id }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    console.error('Stripe membership checkout error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Stripe Checkout could not be created.' }, { status: 502 })
  }
}
