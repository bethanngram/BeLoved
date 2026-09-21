import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BelovedHeader } from '@/components/BelovedHeader'
import { createClient } from '@/lib/supabase/server'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth?.claims?.sub) redirect('/login')
  const id = String(auth.claims.sub)
  const [{ data: profile }, { data: account }] = await Promise.all([
    supabase.from('profiles').select('name,email,membership_tier,account_status').eq('id', id).maybeSingle(),
    supabase.from('payment_accounts').select('stripe_customer_id,status,account_type,updated_at').eq('profile_id', id).maybeSingle(),
  ])

  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader /><div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
    <section className="border-b border-[#17364d]/10 py-12"><p className="text-[9px] uppercase tracking-[.3em] text-[#557060]">Account</p><h1 className="mt-4 font-serif text-5xl font-light">Keep the practical pieces simple.</h1><p className="mt-5 max-w-2xl leading-8 opacity-65">Identity, membership, payments, and privacy belong behind one quiet door.</p></section>
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <section className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">Membership</h2><p className="mt-4 text-sm opacity-55">{profile?.membership_tier || 'member'} · {profile?.account_status || 'pending'}</p><Link href="/membership" className="mt-6 inline-flex rounded-full bg-[#17364d] px-5 py-2.5 text-sm text-white">Manage membership</Link></section>
      <section className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">Stripe</h2><p className="mt-4 text-sm opacity-55">{account?.stripe_customer_id ? 'A secure Stripe customer record is connected.' : 'A Stripe customer record will be created at checkout.'}</p><p className="mt-2 text-xs opacity-40">Card details remain with Stripe.</p></section>
      <section className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">Your email</h2><p className="mt-4 text-sm">{profile?.email || 'Not available'}</p><p className="mt-2 text-xs opacity-45">Authentication and session state are managed by Supabase.</p></section>
      <section className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><h2 className="font-serif text-3xl font-light">Leave quietly.</h2><p className="mt-3 text-sm leading-6 opacity-55">Signing out ends the current session without deleting your record.</p><form action={signOut} className="mt-6"><button className="rounded-full bg-white px-5 py-2.5 text-sm text-[#17364d]">Sign out</button></form></section>
    </div>
    <section className="mt-8 flex flex-wrap gap-3"><Link href="/profile" className="rounded-full border border-[#17364d]/10 bg-white px-5 py-2.5 text-sm">Profile</Link><Link href="/trust" className="rounded-full border border-[#17364d]/10 bg-white px-5 py-2.5 text-sm">Trust</Link><Link href="/journey" className="rounded-full border border-[#17364d]/10 bg-white px-5 py-2.5 text-sm">Journey</Link></section>
  </div></main>
}
