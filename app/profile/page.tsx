import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BelovedHeader } from '@/components/BelovedHeader'
import ProfileEditor from './ProfileEditor'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth?.claims?.sub) redirect('/login')
  const id = String(auth.claims.sub)
  const [{ data: profile }, { data: directory }] = await Promise.all([
    supabase.from('profiles').select('id,name,avatar,bio,location_text,latitude,longitude').eq('id',id).maybeSingle(),
    supabase.from('member_directory').select('profile_id,display_name,photo_url,city_region,interests,skills,help_offers,communities,accepts_introductions,accepts_asks,availability_status,professional_capability,discoverable').eq('profile_id',id).maybeSingle(),
  ])
  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader/><ProfileEditor profile={profile} directory={directory}/></main>
}
