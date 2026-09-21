import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID

  if (!secretKey || !priceId) {
    return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
  }

  const origin = new URL(request.url).origin
  const form = new URLSearchParams()
  form.set('mode', 'subscription')
  form.set('line_items[0][price]', priceId)
  form.set('line_items[0][quantity]', '1')
  form.set('success_url', `${origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`)
  form.set('cancel_url', `${origin}/membership`)
  form.set('billing_address_collection', 'auto')
  form.set('allow_promotion_codes', 'true')

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  })

  if (!response.ok) {
    console.error('Stripe Checkout error:', response.status, await response.text())
    return NextResponse.json({ error: 'Stripe Checkout could not be created.' }, { status: 502 })
  }

  const session = await response.json()
  return NextResponse.json({ url: session.url })
}
