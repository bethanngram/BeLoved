import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Globe2, HeartHandshake, MapPin, Sparkles } from 'lucide-react'
import { BelovedHeader } from '@/components/BelovedHeader'
import { createClient } from '@/lib/supabase/server'

async function recordImpact(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const id = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!id) redirect('/login')
  const title = String(formData.get('title') ?? '').trim()
  if (!title) redirect('/world')
  await supabase.from('world_impact_records').insert({ profile_id: id, impact_type: 'service', title, description: String(formData.get('description') ?? '').trim() || null, recipient_name: String(formData.get('recipient_name') ?? '').trim() || null, geography_name: String(formData.get('geography_name') ?? '').trim() || null, hours_contributed: Number(formData.get('hours') ?? 0) || 0, people_helped: Number(formData.get('people') ?? 0) || 0 })
  revalidatePath('/world'); revalidatePath('/'); redirect('/world')
}

async function recordCapacity(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const id = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!id) redirect('/login')
  const name = String(formData.get('name') ?? '').trim()
  if (!name) redirect('/world')
  await supabase.from('world').insert({ profile_id: id, record_type: 'capacity', name, location: String(formData.get('location') ?? '').trim() || null, description: String(formData.get('description') ?? '').trim() || null, capacity: String(formData.get('capacity') ?? '').trim() || null, contribution: String(formData.get('contribution') ?? '').trim() || null, stewardship_interest: String(formData.get('stewardship_interest') ?? '').trim() || null })
  revalidatePath('/world'); revalidatePath('/'); redirect('/world')
}

export const dynamic = 'force-dynamic'

export default async function WorldPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth?.claims?.sub) return <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-6 text-[#17364d]"><div className="text-center"><Globe2 className="mx-auto h-8 w-8" /><h1 className="mt-5 font-serif text-5xl font-light">See where love is needed.</h1><Link href="/login" className="mt-8 inline-flex rounded-full bg-[#17364d] px-6 py-3 text-sm text-white">Enter BeLoved</Link></div></main>

  const id = String(auth.claims.sub)
  const [{ data: gaps }, { data: impacts }, { data: needs }] = await Promise.all([
    supabase.from('world_response_gaps').select('geography_key,need_code,need_quantity,capacity_quantity,delivered_quantity,unmet_quantity,coverage_ratio,coverage_status,confidence,source_count,methodology').order('unmet_quantity', { ascending: false }).limit(12),
    supabase.from('world_impact_records').select('id,impact_type,title,description,recipient_name,geography_name,hours_contributed,people_helped,occurred_at').eq('profile_id', id).order('occurred_at', { ascending: false }).limit(12),
    supabase.from('world_need_signals').select('geography_key,need_code,people_affected,quantity,severity,source_name,confidence,observed_at').order('observed_at', { ascending: false }).limit(12),
  ])
  const totalHours = (impacts ?? []).reduce((sum, item) => sum + Number(item.hours_contributed ?? 0), 0)
  const totalPeople = (impacts ?? []).reduce((sum, item) => sum + Number(item.people_helped ?? 0), 0)

  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader /><div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
    <section className="grid gap-8 border-b border-[#17364d]/10 py-12 lg:grid-cols-[1.15fr_.85fr]"><div><p className="text-[9px] uppercase tracking-[.3em] text-[#557060]">World · Need · Capacity · Response · Impact</p><h1 className="mt-4 max-w-4xl font-serif text-5xl font-light leading-[1.02] sm:text-6xl">Move from seeing a need to carrying a response.</h1><p className="mt-6 max-w-2xl leading-8 opacity-65">BeLoved surfaces verified signals where available, shows their source and confidence, and keeps human response at the center.</p></div><div className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><Globe2 /><p className="mt-6 text-3xl font-light">{totalPeople} people helped</p><p className="mt-2 text-sm opacity-55">{totalHours.toFixed(1)} hours recorded in your impact history.</p></div></section>
    <section className="mt-8 grid gap-6 lg:grid-cols-2"><Panel title="Response gaps">{(gaps ?? []).map((gap,index)=><article key={gap.geography_key+'-'+gap.need_code+'-'+index} className="rounded-2xl bg-[#f7f4ed] p-5"><div className="flex items-center justify-between gap-4"><p className="text-[9px] uppercase tracking-[.2em] text-[#557060]">{gap.geography_key}</p><span className="text-[10px] uppercase opacity-40">{gap.coverage_status}</span></div><h3 className="mt-2 font-serif text-2xl font-light">{gap.need_code}</h3><p className="mt-3 text-sm leading-6 opacity-60">{gap.unmet_quantity ?? 0} unmet · {gap.capacity_quantity ?? 0} capacity · confidence {Math.round(Number(gap.confidence ?? 0) * 100)}%</p><p className="mt-2 text-[10px] opacity-35">{gap.source_count} source(s) · {gap.methodology}</p></article>)}{!gaps?.length && <Empty text="No verified response gap is currently available. BeLoved will not invent one." />}</Panel>
      <Panel title="Recent verified need signals">{(needs ?? []).map((need,index)=><article key={need.geography_key+'-'+need.need_code+'-'+index} className="rounded-2xl bg-[#f7f4ed] p-5"><p className="text-[9px] uppercase tracking-[.2em] text-[#557060]">{need.geography_key}</p><h3 className="mt-2 font-serif text-2xl font-light">{need.need_code}</h3><p className="mt-3 text-sm opacity-60">{need.people_affected ?? need.quantity ?? 0} affected · severity {need.severity ?? '—'} · confidence {Math.round(Number(need.confidence ?? 0) * 100)}%</p><p className="mt-2 text-[10px] opacity-35">Source: {need.source_name}</p></article>)}{!needs?.length && <Empty text="No current world signal has been loaded." />}</Panel>
    </section>
    <section className="mt-8 grid gap-6 lg:grid-cols-2"><form action={recordCapacity} className="rounded-[2rem] bg-white p-7"><HeartHandshake className="h-5 w-5 opacity-45" /><h2 className="mt-4 font-serif text-3xl font-light">Make capacity visible.</h2><input name="name" required placeholder="What is available?" className="mt-5 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><input name="location" placeholder="Place" className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><input name="capacity" placeholder="Capacity · time, skill, goods, money..." className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><textarea name="contribution" rows={3} placeholder="What could this make possible?" className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><textarea name="description" rows={2} placeholder="Context" className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><input name="stewardship_interest" placeholder="What kind of response interests you?" className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><button className="mt-4 rounded-full bg-[#17364d] px-5 py-2.5 text-sm text-white">Record capacity</button></form>
      <form action={recordImpact} className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><Sparkles className="h-5 w-5 opacity-65" /><h2 className="mt-4 font-serif text-3xl font-light">Record what was actually done.</h2><input name="title" required placeholder="What happened?" className="mt-5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /><input name="recipient_name" placeholder="Recipient / community" className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /><input name="geography_name" placeholder="Place" className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /><textarea name="description" rows={3} placeholder="What was given, learned, or completed?" className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /><div className="mt-3 grid gap-3 sm:grid-cols-2"><input name="hours" type="number" min="0" step="0.25" placeholder="Hours" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /><input name="people" type="number" min="0" step="1" placeholder="People helped" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /></div><button className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm text-[#17364d]">Record impact</button></form></section>
    <section className="mt-8 rounded-[2rem] bg-white p-7"><p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Your response history</p><div className="mt-5 grid gap-3 md:grid-cols-2">{(impacts ?? []).map((impact)=><article key={impact.id} className="rounded-2xl bg-[#f7f4ed] p-5"><h3 className="font-medium">{impact.title}</h3><p className="mt-2 text-sm opacity-55">{impact.geography_name || impact.recipient_name || 'Response'} · {impact.hours_contributed ?? 0} hours · {impact.people_helped ?? 0} helped</p></article>)}{!impacts?.length && <Empty text="Impact begins with a real response. Nothing is fabricated here." />}</div></section>
    <section className="mt-8"><Link href="/journey" className="inline-flex items-center gap-2 rounded-full border border-[#17364d]/10 bg-white px-5 py-2.5 text-sm">Carry this back into your Journey <MapPin size={14} /></Link></section>
  </div></main>
}

function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">{title}</h2><div className="mt-5 space-y-3">{children}</div></section>}
function Empty({text}:{text:string}){return <p className="rounded-2xl border border-dashed border-[#17364d]/10 p-6 text-sm opacity-50">{text}</p>}
