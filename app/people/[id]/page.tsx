import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BelovedHeader } from '@/components/BelovedHeader'
import PersonClient from './PersonClient'

export const dynamic='force-dynamic'

export default async function PersonPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params
 const supabase=await createClient()
 const {data:auth}=await supabase.auth.getClaims()
 if(!auth?.claims?.sub)redirect('/login')
 const {data:person}=await supabase.from('profiles').select('id,name,avatar,bio,location_text,latitude,longitude').eq('id',id).maybeSingle()
 if(!person)notFound()
 return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader/><PersonClient person={person} currentProfileId={String(auth.claims.sub)}/></main>
}
