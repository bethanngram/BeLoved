import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { MemberHeader } from '@/components/member/member-header'
import { JourneyDashboard } from '@/components/journey/journey-dashboard'
import { createClient } from '@/lib/supabase/server'

function signal(profile: boolean, focus: boolean, moments: number, encounters: number) {
  const value = (profile ? 20 : 0) + (focus ? 20 : 0) + Math.min(moments, 4) * 7.5 + Math.min(encounters, 4) * 7.5
  return value >= 30 ? Math.round(value) : null
}

export default async function JourneyPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  if (!claimsData?.claims) return <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-6 text-[#17364d]"><div className="max-w-xl text-center"><p className="text-[10px] uppercase tracking-[0.3em] text-[#557060]">BeLoved</p><h1 className="mt-5 font-serif text-5xl font-light">Your journey is waiting.</h1><p className="mt-5 text-[#17364d]/60">A living picture of faithfulness, stewardship, contribution, and becoming begins with what is actually true about your life.</p><Link className="mt-8 inline-flex rounded-full bg-[#17364d] px-6 py-3 text-sm text-white" href="/login">Enter BeLoved</Link></div></main>

  const id = String(claimsData.claims.sub)
  const [{ data: profile }, { data: moments }, { data: encounters }, { data: preferences }] = await Promise.all([
    supabase.from('profiles').select('name,tier').eq('id', id).maybeSingle(),
    supabase.from('journey_moments').select('id,season,question,felt_need,status,opened_at').eq('profile_id', id).order('opened_at', { ascending: false }).limit(8),
    supabase.from('formation_encounters').select('id,title,encounter_type,why_this_now,status').eq('profile_id', id).order('offered_at', { ascending: false }).limit(8),
    supabase.from('profile_preferences').select('current_focus,current_season,preferred_day_rhythm').eq('profile_id', id).maybeSingle(),
  ])

  const name = profile?.name?.split(' ')[0] ?? 'Friend'
  const focus = preferences?.current_focus || moments?.[0]?.question || ''
  const score = signal(Boolean(profile), Boolean(preferences?.current_focus), moments?.length ?? 0, encounters?.length ?? 0)

  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><MemberHeader section="YOUR JOURNEY" title="Faithfulness, stewardship, contribution, and becoming" signal={score == null ? 'Evidence building' : 'Personal signal'} score={score} /><div className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 lg:px-8"><section className="grid gap-8 border-b border-[#17364d]/10 py-10 lg:grid-cols-[1.35fr_.65fr] lg:py-14"><div><p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#557060]">The measure beneath the measures</p><h1 className="mt-4 max-w-4xl font-serif text-4xl font-light leading-[1.04] sm:text-5xl lg:text-6xl">Become faithful to what has been entrusted to you.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-[#17364d]/65 sm:text-lg sm:leading-8">Welcome, {name}. BeLoved is not trying to score your worth. It is building an increasingly honest picture of how your choices, commitments, relationships, resources, and contribution are moving together.</p></div><div className="self-end rounded-[28px] border border-[#17364d]/10 bg-white/65 p-6"><div className="flex items-start justify-between"><div><p className="text-[9px] uppercase tracking-[0.24em] text-[#17364d]/45">Journey signal</p><p className="mt-2 font-serif text-5xl font-light">{score == null ? '—' : score}</p></div><Sparkles size={18} strokeWidth={1.2} className="text-[#a8863a]" /></div><p className="mt-5 text-sm leading-6 text-[#17364d]/60">{score == null ? 'Your signal will appear when BeLoved has enough real evidence. Missing data is never treated as failure.' : 'A provisional signal based only on evidence currently available. It is not a measure of spiritual worth.'}</p></div></section><JourneyDashboard focus={focus} moments={moments?.length ?? 0} encounters={encounters?.length ?? 0} /><section className="border-t border-[#17364d]/10 py-10"><p className="max-w-3xl font-serif text-2xl font-light leading-9 sm:text-3xl">“To whom much is given, from him much will be required.”</p><p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#557060]">Luke 12:48</p><p className="mt-5 max-w-2xl text-sm leading-7 text-[#17364d]/55">The aim is not to become independent of everyone. It is to become faithful with what you have received, capable of carrying responsibility, willing to contribute, and ready to strengthen the people entrusted to your care.</p></section></div></main>
}
