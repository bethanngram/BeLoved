import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ArrowRight, Handshake, ShieldCheck } from 'lucide-react'
import { BelovedHeader } from '@/components/BelovedHeader'
import { createClient } from '@/lib/supabase/server'

const levels = ['known', 'met', 'shared', 'trusted', 'invested']

async function recordTrust(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const id = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!id) redirect('/login')
  const personId = String(formData.get('person_id') ?? '')
  const level = String(formData.get('trust_level') ?? 'known')
  const note = String(formData.get('note') ?? '').trim()
  if (!personId || !levels.includes(level)) redirect('/trust')

  await supabase.from('trust_actions').insert({ actor_profile_id: id, target_person_id: personId, action_type: level, status: 'completed', note: note || null, metadata: { source: 'trust_page' } })
  await supabase.from('people').update({ trust_level: level, relationship_strength: level === 'known' ? 'new' : level === 'met' ? 'developing' : 'strong', updated_at: new Date().toISOString() }).eq('id', personId).eq('user_id', id)

  const { data: edge } = await supabase.from('relationship_edges').select('id,evidence_count').eq('source_profile_id', id).eq('target_person_id', personId).order('updated_at', { ascending: false }).limit(1).maybeSingle()
  if (edge?.id) await supabase.from('relationship_edges').update({ trust_level: level, evidence_count: Number(edge.evidence_count ?? 0) + 1, updated_at: new Date().toISOString() }).eq('id', edge.id)
  else await supabase.from('relationship_edges').insert({ source_profile_id: id, target_person_id: personId, relationship_type: 'relationship', trust_level: level, strength: level === 'known' ? 'new' : level === 'met' ? 'developing' : 'strong', evidence_count: 1 })

  revalidatePath('/trust'); revalidatePath('/people'); redirect('/trust')
}

export const dynamic = 'force-dynamic'

export default async function TrustPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth?.claims?.sub) return <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-6 text-[#17364d]"><div className="text-center"><ShieldCheck className="mx-auto h-8 w-8" /><h1 className="mt-5 font-serif text-5xl font-light">Trust is something we practice.</h1><Link href="/login" className="mt-8 inline-flex rounded-full bg-[#17364d] px-6 py-3 text-sm text-white">Enter BeLoved</Link></div></main>

  const id = String(auth.claims.sub)
  const [{ data: people }, { data: edges }, { data: actions }, { data: connections }] = await Promise.all([
    supabase.from('people').select('id,name,relationship,relationship_strength,trust_level').eq('user_id', id).order('updated_at', { ascending: false }).limit(60),
    supabase.from('relationship_edges').select('id,target_person_id,relationship_type,trust_level,strength,evidence_count,updated_at').eq('source_profile_id', id).order('updated_at', { ascending: false }).limit(60),
    supabase.from('trust_actions').select('id,target_person_id,action_type,status,note,created_at').eq('actor_profile_id', id).order('created_at', { ascending: false }).limit(30),
    supabase.from('member_connections').select('id,status,trusted_at').or(`requester_profile_id.eq.${id},addressee_profile_id.eq.${id}`).eq('status', 'accepted').limit(60),
  ])
  const personMap = new Map((people ?? []).map((person) => [person.id, person]))
  const activeTrust = (edges ?? []).filter((edge) => edge.trust_level && edge.trust_level !== 'known').length

  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader /><div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
    <section className="grid gap-8 border-b border-[#17364d]/10 py-12 lg:grid-cols-[1.2fr_.8fr]"><div><p className="text-[9px] uppercase tracking-[.3em] text-[#557060]">Trust</p><h1 className="mt-4 font-serif text-5xl font-light leading-[1.04] sm:text-6xl">Trust grows through evidence, not assertion.</h1><p className="mt-6 max-w-2xl leading-8 opacity-65">BeLoved keeps trust close to actual relationship, contribution, response, and entrusted responsibility.</p></div><div className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><Handshake /><p className="mt-6 text-3xl font-light">{activeTrust} relationships with recorded trust evidence</p><p className="mt-3 text-sm leading-6 opacity-55">{connections?.length ?? 0} accepted network connections are available for deeper relationship.</p></div></section>
    <section className="mt-8 rounded-[2rem] bg-white p-7"><div className="grid gap-3 sm:grid-cols-5">{levels.map((level)=><div key={level} className="rounded-2xl bg-[#f7f4ed] p-4 text-center"><p className="text-[9px] uppercase tracking-[.2em] text-[#557060]">{level}</p><p className="mt-2 text-sm opacity-60">{level === 'known' ? 'Recognize' : level === 'met' ? 'Encounter' : level === 'shared' ? 'Practice' : level === 'trusted' ? 'Entrust' : 'Carry together'}</p></div>)}</div></section>
    <section className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">Your people</h2><div className="mt-5 space-y-3">{(people ?? []).map((person)=><div key={person.id} className="rounded-2xl bg-[#f7f4ed] p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-medium">{person.name}</p><p className="mt-1 text-xs opacity-45">{person.relationship || 'relationship'}</p></div><span className="rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[.15em]">{(edges ?? []).find((candidate) => candidate.target_person_id === person.id)?.trust_level || person.trust_level || 'known'}</span></div><form action={recordTrust} className="mt-4 grid gap-2"><input type="hidden" name="person_id" value={person.id} /><select name="trust_level" defaultValue={(edges ?? []).find((candidate) => candidate.target_person_id === person.id)?.trust_level || person.trust_level || 'known'} className="rounded-xl border border-[#17364d]/10 px-3 py-2 text-sm">{levels.map((level)=><option key={level} value={level}>{level}</option>)}</select><input name="note" placeholder="Evidence or context" className="rounded-xl border border-[#17364d]/10 px-3 py-2 text-sm" /><button className="rounded-full bg-[#17364d] px-4 py-2 text-xs text-white">Record trust evidence</button></form></div>)}{!people?.length && <p className="rounded-2xl border border-dashed border-[#17364d]/10 p-6 text-sm opacity-50">People you know personally can be connected here as trust becomes explicit.</p>}</div></section>
      <section className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">Recent evidence</h2><div className="mt-5 space-y-3">{(actions ?? []).map((action)=><article key={action.id} className="rounded-2xl bg-[#f7f4ed] p-5"><p className="text-[9px] uppercase tracking-[.2em] text-[#557060]">{action.action_type}</p><h3 className="mt-2 font-medium">{personMap.get(action.target_person_id)?.name || 'Person'}</h3>{action.note && <p className="mt-2 text-sm opacity-55">{action.note}</p>}<p className="mt-3 text-[10px] opacity-35">{new Date(action.created_at).toLocaleString()}</p></article>)}{!actions?.length && <p className="rounded-2xl border border-dashed border-[#17364d]/10 p-6 text-sm opacity-50">Trust evidence appears here after real interactions are recorded.</p>}</div></section></section>
    <section className="mt-8"><Link href="/people" className="inline-flex items-center gap-2 rounded-full border border-[#17364d]/10 bg-white px-5 py-2.5 text-sm">Return to People <ArrowRight size={14} /></Link></section>
  </div></main>
}
