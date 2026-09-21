'use client'

import { useState } from 'react'
import Link from 'next/link'

const amounts = [2500, 5000, 10000, 25000, 50000]

export default function GivePage() {
  const [amount, setAmount] = useState(5000)
  const [purpose, setPurpose] = useState('Where love is needed')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function give() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'donation', amount_cents: amount, purpose }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to open giving checkout.')
      window.location.assign(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open giving checkout.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ed] px-6 py-16 text-[#17364d]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-xs uppercase tracking-[.3em] opacity-45">BeLoved</Link>
        <p className="mt-12 text-[9px] uppercase tracking-[.3em] text-[#557060]">Give</p>
        <h1 className="mt-4 font-serif text-5xl font-light">Let what has been entrusted to you become love.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 opacity-65">Giving is not a transaction inside BeLoved. It is one way stewardship can become response.</p>

        <section className="mt-10 rounded-[2rem] bg-white p-8">
          <p className="text-sm font-medium">Choose an amount</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {amounts.map(value => <button key={value} type="button" onClick={() => setAmount(value)} className={'rounded-xl px-3 py-3 text-sm ' + (amount === value ? 'bg-[#17364d] text-white' : 'bg-[#f7f4ed]')}>{'$' + value / 100}</button>)}
          </div>
          <label className="mt-7 block text-sm" htmlFor="purpose">Purpose</label>
          <input id="purpose" value={purpose} onChange={e => setPurpose(e.target.value)} className="mt-2 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" />
          <button type="button" onClick={() => void give()} disabled={loading} className="mt-7 rounded-full bg-[#17364d] px-7 py-4 text-sm text-white disabled:opacity-50">{loading ? 'Opening secure checkout…' : 'Continue to secure giving'}</button>
          {error && <p className="mt-5 text-sm text-red-700">{error}</p>}
          <p className="mt-5 text-xs leading-5 opacity-40">Payment details are entered on Stripe Checkout. BeLoved does not store your card number.</p>
        </section>
      </div>
    </main>
  )
}
