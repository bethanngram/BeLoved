import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function JourneyPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  if (!claimsData?.claims) return <main className="min-h-screen grid place-items-center bg-[#f7f4ed] text-[#17364d]"><div><h1 className="text-4xl font-light">Your journey is waiting.</h1><Link className="mt-6 inline-block rounded-full bg-[#17364d] px-6 py-3 text-white" href="/login">Enter BeLoved</Link></div></main>

  const id = String(claimsData.claims.sub)
  const [{ data: profile }, { data: moments }, { data: encounters }, { data: preferences }] = await Promise.all([
    supabase.from('profiles').select('name,tier').eq('id', id).maybeSingle(),
    supabase.from('journey_moments').select('id,season,question,felt_need,status,opened_at').eq('profile_id', id).order('opened_at', { ascending: false }).limit(5),
    supabase.from('formation_encounters').select('id,title,encounter_type,why_this_now,status').eq('profile_id', id).order('offered_at', { ascending: false }).limit(5),
    supabase.from('profile_preferences').select('current_focus,current_season,preferred_day_rhythm').eq('profile_id', id).maybeSingle(),
  ])

  const name = profile?.name?.split(' ')[0] ?? 'Friend'
  const focus = preferences?.current_focus || moments?.[0]?.question || 'Begin by noticing where you are.'
  const latest = encounters?.[0]

  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><header className="border-b border-[#17364d]/10 bg-white/40"><div className="mx-auto flex max-w-7xl justify-between px-6 py-6"><Link href="/" className="tracking-[.2em]">BELOVED</Link><span className="text-sm opacity-60">My Journey</span></div></header><div className="mx-auto max-w-7xl px-6 py-16"><p className="text-xs uppercase tracking-[.3em] opacity-50">Where you are</p><h1 className="mt-4 text-6xl font-light">Welcome, {name}.</h1><p className="mt-6 max-w-2xl text-xl leading-8 opacity-70">BeLoved does not ask you to fit a program. It adapts around your journey.</p><section className="mt-14 grid gap-6 lg:grid-cols-3"><article className="rounded-3xl bg-white p-7 lg:col-span-2"><p className="text-xs uppercase tracking-[.25em] opacity-45">Today's invitation</p><h2 className="mt-5 text-3xl font-light">{latest?.title ?? 'Begin with where you are.'}</h2><p className="mt-4 leading-7 opacity-65">{latest?.why_this_now ?? focus}</p><Link href="/reflect" className="mt-7 inline-block rounded-full bg-[#17364d] px-6 py-3 text-white">Reflect</Link></article><article className="rounded-3xl border border-[#17364d]/10 p-7"><p className="text-xs uppercase tracking-[.25em] opacity-45">Your season</p><h2 className="mt-5 text-2xl font-light">{preferences?.current_season ?? 'Discovery'}</h2><p className="mt-4 opacity-65">Your path can change. Your pace can change. Your questions can change.</p></article></section><section className="mt-10"><p className="text-xs uppercase tracking-[.25em] opacity-45">Journey memory</p><div className="mt-5 grid gap-4 md:grid-cols-2">{(moments ?? []).map(m=><div key={m.id} className="rounded-2xl border border-[#17364d]/10 bg-white/50 p-6"><p className="text-xs uppercase opacity-45">{m.season ?? 'Journey moment'}</p><p className="mt-3 text-lg">{m.question ?? m.felt_need ?? 'A moment of noticing.'}</p></div>)}</div></section></div></main>
}
