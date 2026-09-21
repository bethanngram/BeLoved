import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MarketClient from './MarketClient'

export default async function MarketPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims?.sub) redirect('/login')
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <Link href="/" className="text-2xl font-semibold tracking-[0.18em]">BELOVED</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/journey" className="rounded-full border border-[#17364d]/15 px-4 py-2">Journey</Link>
          <Link href="/market" className="rounded-full bg-[#17364d] px-4 py-2 text-white">People Market</Link>
        </nav>
      </header>
      <MarketClient />
    </main>
  )
}
