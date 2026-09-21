import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BelovedHeader } from '@/components/BelovedHeader'
import { JourneyDashboard } from '@/components/journey/journey-dashboard'

export const dynamic = 'force-dynamic'

export default async function JourneyPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims?.sub) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-6 text-[#17364d]">
        <div className="max-w-xl text-center">
          <p className="text-[10px] uppercase tracking-[.3em] text-[#557060]">BeLoved</p>
          <h1 className="mt-5 font-serif text-5xl font-light">Your journey is waiting.</h1>
          <p className="mt-5 text-[#17364d]/60">A living picture of formation, capability, contribution, relationships, and stewardship begins with what is actually true about your life.</p>
          <Link className="mt-8 inline-flex rounded-full bg-[#17364d] px-6 py-3 text-sm text-white" href="/login">Enter BeLoved</Link>
        </div>
      </main>
    )
  }

  const id = String(claimsData.claims.sub)
  const [{ data: profile }, { data: preferences }, { data: formation }, { data: resources }, { data: growth }, { data: capacity }, { data: life }] = await Promise.all([
    supabase.from('profiles').select('name,location_text,membership_tier').eq('id', id).maybeSingle(),
    supabase.from('formation_preferences').select('active_focus,opportunity_scope,active_horizon').eq('profile_id', id).maybeSingle(),
    supabase.from('formation').select('id,title,formation_area,reflection,member_status,started_at,completed_at').eq('profile_id', id).order('updated_at', { ascending: false }).limit(12),
    supabase.from('formation_resource_journeys').select('id,resource_id,horizon,status,reflection,started_at,completed_at').eq('profile_id', id).order('updated_at', { ascending: false }).limit(12),
    supabase.from('growth').select('id,growth_area,title,capability,evidence,contribution,status,started_at,completed_at').eq('profile_id', id).order('updated_at', { ascending: false }).limit(12),
    supabase.from('capacity').select('energy,time,attention,emotional,spiritual,updated_at').eq('profile_id', id).maybeSingle(),
    supabase.from('life').select('life_stage,current_season,vision,priorities,current_place,future_place,opportunities_summary,reflection').eq('profile_id', id).maybeSingle(),
  ])

  const name = profile?.name?.split(' ')[0] || 'Friend'
  const focus = preferences?.active_focus || life?.current_season || formation?.[0]?.formation_area || ''
  const completedFormation = (formation || []).filter(x => x.completed_at || x.member_status === 'completed').length
  const activeGrowth = (growth || []).filter(x => x.status !== 'completed').length
  const completedResources = (resources || []).filter(x => x.completed_at || x.status === 'completed').length
  const evidence = (growth || []).filter(x => x.evidence || x.contribution).length
  const signal = Math.min(100, Math.round((completedFormation * 8) + (activeGrowth * 6) + (completedResources * 8) + (evidence * 8) + (focus ? 20 : 0)))

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]">
      <BelovedHeader />
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="grid gap-8 border-b border-[#17364d]/10 py-12 lg:grid-cols-[1.35fr_.65fr] lg:py-16">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[.3em] text-[#557060]">Your Journey</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl font-light leading-[1.04] sm:text-6xl">Faithfulness, stewardship, contribution, and becoming.</h1>
            <p className="mt-6 max-w-2xl leading-8 text-[#17364d]/65">Welcome, {name}. BeLoved connects formation to real capability and contribution instead of treating growth as content consumption.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/profile" className="rounded-full bg-[#17364d] px-5 py-3 text-sm text-white">Update your living profile</Link>
              <Link href="/market" className="inline-flex items-center gap-2 rounded-full border border-[#17364d]/10 bg-white/70 px-5 py-3 text-sm">Turn capability outward <ArrowRight size={15}/></Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-[#17364d]/10 bg-white/65 p-6">
            <div className="flex items-start justify-between"><div><p className="text-[9px] uppercase tracking-[.24em] opacity-45">Evidence signal</p><p className="mt-2 font-serif text-5xl font-light">{signal}</p></div><Sparkles size={18} className="text-[#a8863a]"/></div>
            <p className="mt-5 text-sm leading-6 opacity-55">A provisional picture from available evidence. It is not a measure of spiritual worth.</p>
          </div>
        </section>

        <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Formation" value={String(formation?.length || 0)} />
          <Metric label="Completed resources" value={String(completedResources)} />
          <Metric label="Growth paths" value={String(growth?.length || 0)} />
          <Metric label="Active growth" value={String(activeGrowth)} />
          <Metric label="Evidence" value={String(evidence)} />
        </section>

        <JourneyDashboard focus={focus} moments={formation?.length || 0} encounters={resources?.length || 0} />

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-7">
            <p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Formation → capability</p>
            <h2 className="mt-3 font-serif text-3xl font-light">What you are practicing</h2>
            <div className="mt-6 space-y-3">
              {(growth || []).slice(0,6).map(item => <div key={item.id} className="rounded-2xl bg-[#f7f4ed] p-5"><div className="flex justify-between gap-3"><span className="text-sm font-medium">{item.title || item.growth_area || 'Growth path'}</span><span className="text-[10px] uppercase opacity-40">{item.status || 'active'}</span></div>{item.capability && <p className="mt-2 text-sm opacity-60">Capability: {item.capability}</p>}{item.contribution && <p className="mt-2 text-sm opacity-60">Contribution: {item.contribution}</p>}</div>)}
              {!growth?.length && <p className="rounded-2xl bg-[#f7f4ed] p-5 text-sm opacity-50">Your growth paths will become the bridge between formation and contribution.</p>}
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]">
            <p className="text-[9px] uppercase tracking-[.28em] opacity-45">Life context</p>
            <h2 className="mt-3 font-serif text-3xl font-light">{life?.current_season || 'Your current season'}</h2>
            <p className="mt-4 leading-7 opacity-60">{life?.vision || life?.priorities || 'Your life context gives BeLoved a better basis for relevant next steps.'}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-4"><p className="text-[9px] uppercase tracking-[.2em] opacity-40">Current place</p><p className="mt-2 text-sm">{life?.current_place || profile?.location_text || 'Not set'}</p></div>
              <div className="rounded-2xl bg-white/5 p-4"><p className="text-[9px] uppercase tracking-[.2em] opacity-40">Future place</p><p className="mt-2 text-sm">{life?.future_place || 'Not set'}</p></div>
            </div>
          </div>
        </section>

        {capacity && <section className="mt-8 rounded-[2rem] border border-[#17364d]/10 bg-white/50 p-7"><p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Capacity check</p><h2 className="mt-3 font-serif text-3xl font-light">Growth has to fit the life you actually have.</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[['Energy',capacity.energy],['Time',capacity.time],['Attention',capacity.attention],['Emotional',capacity.emotional],['Spiritual',capacity.spiritual]].map(([label,value])=><div key={String(label)} className="rounded-2xl bg-white p-4"><p className="text-[9px] uppercase tracking-[.2em] opacity-40">{label}</p><p className="mt-2 text-2xl font-light">{value ?? '—'}</p></div>)}</div></section>}
      </div>
    </main>
  )
}

function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-[#17364d]/10 bg-white p-5"><p className="text-[9px] uppercase tracking-[.2em] opacity-40">{label}</p><p className="mt-3 font-serif text-3xl font-light">{value}</p></div>}
