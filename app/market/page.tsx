import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BelovedHeader } from '@/components/BelovedHeader'
import MarketClient from './MarketClient'

export const dynamic = 'force-dynamic'

export default async function MarketPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims?.sub) redirect('/login')
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]">
      <BelovedHeader />
      <MarketClient />
    </main>
  )
}
