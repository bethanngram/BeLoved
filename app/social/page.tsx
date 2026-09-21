import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BelovedHeader } from '@/components/BelovedHeader'
import SocialClient from './SocialClient'

export const dynamic='force-dynamic'

export default async function SocialPage(){
 const supabase=await createClient()
 const {data:auth}=await supabase.auth.getClaims()
 if(!auth?.claims?.sub)redirect('/login')
 return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader/><SocialClient/></main>
}
