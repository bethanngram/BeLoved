'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BelovedHeader } from '@/components/BelovedHeader'

export default function AccountPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function openPortal() {
    setLoading(true); setMessage('')
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Stripe portal is unavailable.')
      window.location.assign(data.url)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Stripe portal is unavailable.')
    } finally { setLoading(false) }
  }

  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader /><div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
    <section className="border-b border-[#17364d]/10 py-12"><p className="text-[9px] uppercase tracking-[.3em] text-[#557060]">Account</p><h1 className="mt-4 font-serif text-5xl font-light">Keep the practical pieces simple.</h1><p className="mt-5 max-w-2xl leading-8 opacity-65">Membership, payments, and practical account care belong behind one quiet door.</p></section>
    <section className="mt-8 grid gap-6 md:grid-cols-2">
      <div className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">Membership</h2><p className="mt-4 text-sm leading-6 opacity-55">Use Stripe to manage the membership attached to this BeLoved account.</p><Link href="/membership" className="mt-6 inline-flex rounded-full bg-[#17364d] px-5 py-2.5 text-sm text-white">Membership</Link></div>
      <div className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">Stripe</h2><p className="mt-4 text-sm leading-6 opacity-55">BeLoved never needs to hold card details. Stripe handles payment details and billing.</p><button onClick={() => void openPortal()} disabled={loading} className="mt-6 rounded-full border border-[#17364d]/15 px-5 py-2.5 text-sm disabled:opacity-40">{loading ? 'Opening…' : 'Manage billing'}</button>{message && <p className="mt-4 text-sm">{message}</p>}</div>
      <Link href="/profile" className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">Living profile</h2><p className="mt-3 text-sm leading-6 opacity-55">Identity, season, rhythm, belonging, skills, and Personal Thread.</p></Link>
      <Link href="/journey" className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><h2 className="font-serif text-3xl font-light">Return to Becoming</h2><p className="mt-3 text-sm leading-6 opacity-55">Bring the practical back into the living journey.</p></Link>
    </section>
  </div></main>
}
