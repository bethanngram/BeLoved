import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BelovedHeader } from '@/components/BelovedHeader'
import MessagesClient from './MessagesClient'

export const dynamic='force-dynamic'

export default async function MessagesPage({searchParams}:{searchParams:Promise<{conversation?:string}>}){
 const supabase=await createClient()
 const {data:auth}=await supabase.auth.getClaims()
 if(!auth?.claims?.sub)redirect('/login')
 const params=await searchParams
 return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader/><MessagesClient currentProfileId={String(auth.claims.sub)} initialConversationId={params.conversation||null}/></main>
}
