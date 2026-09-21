import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
  }

  let customerId: string | undefined
  try {
    const body = await request.json()
    customerId = typeof body.customerId === 'string' ? body.customerId.trim() : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!customerId || !customerId.startsWith('cus_')) {
    return NextResponse.json({ error: 'A valid Stripe customer ID is required.' }, { status: 400 })
  }

  const form = new URLSearchParams({
    customer: customerId,
    return_url: `${new URL(request.url).origin}/account`,
  })

  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  })

  if (!response.ok) {
    console.error('Stripe Portal error:', response.status, await response.text())
    return NextResponse.json({ error: 'Stripe customer portal could not be created.' }, { status: 502 })
  }

  const session = await response.json()
  return NextResponse.json({ url: session.url })
}
