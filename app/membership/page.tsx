'use client'

import { useState } from 'react'

export default function MembershipPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function startCheckout() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to start checkout.')
      window.location.assign(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ed] px-6 py-16 text-[#17364d]">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[.3em] opacity-50">BeLoved membership</p>
        <h1 className="mt-5 text-5xl font-light leading-tight">Make room for the journey.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 opacity-70">
          Membership unlocks the connected BeLoved experience. Stripe securely handles the subscription and payment details.
        </p>

        <div className="mt-10 rounded-[2rem] border border-[#17364d]/10 bg-white/70 p-8">
          <h2 className="text-2xl font-light">Continue to secure checkout</h2>
          <p className="mt-3 text-sm leading-6 opacity-60">
            Your card details are entered on Stripe Checkout and are never stored in BeLoved.
          </p>
          <button
            type="button"
            onClick={startCheckout}
            disabled={loading}
            className="mt-7 rounded-full bg-[#17364d] px-7 py-4 text-sm text-white disabled:opacity-50"
          >
            {loading ? 'Opening checkout…' : 'Continue to checkout'}
          </button>
          {error && <p className="mt-5 text-sm text-red-700">{error}</p>}
        </div>
      </div>
    </main>
  )
}
