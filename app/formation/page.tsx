import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { BookOpen, Check, Sparkles } from 'lucide-react'
import { BelovedHeader } from '@/components/BelovedHeader'
import { createClient } from '@/lib/supabase/server'

async function addLearning(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const id = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!id) redirect('/login')
  const title = String(formData.get('title') ?? '').trim()
  if (!title) redirect('/formation')
  await supabase.from('formation').insert({ profile_id: id, title, formation_area: String(formData.get('area') ?? '').trim() || null, member_status: 'planned', data: { source: 'member' } })
  revalidatePath('/formation'); revalidatePath('/journey'); redirect('/formation')
}

async function addPractice(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const id = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!id) redirect('/login')
  const title = String(formData.get('practice') ?? '').trim()
  if (!title) redirect('/formation')
  await supabase.from('growth').insert({ profile_id: id, title, growth_area: 'practice', capability: String(formData.get('capability') ?? '').trim() || null, status: 'active', started_at: new Date().toISOString().slice(0, 10) })
  revalidatePath('/formation'); revalidatePath('/journey'); redirect('/formation')
}

async function completeLearning(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const id = auth?.claims?.sub ? String(auth.claims.sub) : null
  const itemId = String(formData.get('id') ?? '')
  if (!id || !itemId) redirect('/login')
  await supabase.from('formation').update({ member_status: 'completed', completed_at: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() }).eq('id', itemId).eq('profile_id', id)
  revalidatePath('/formation'); revalidatePath('/journey'); redirect('/formation')
}

export const dynamic = 'force-dynamic'

export default async function FormationPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth?.claims?.sub) return <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-6 text-[#17364d]"><div className="text-center"><h1 className="font-serif text-5xl font-light">The school of the whole life.</h1><Link href="/login" className="mt-8 inline-flex rounded-full bg-[#17364d] px-6 py-3 text-sm text-white">Enter BeLoved</Link></div></main>

  const id = String(auth.claims.sub)
  const [{ data: learning }, { data: growth }, { data: preferences }, { data: profession }] = await Promise.all([
    supabase.from('formation').select('id,title,description,formation_area,member_status,started_at,completed_at').eq('profile_id', id).order('updated_at', { ascending: false }).limit(20),
    supabase.from('growth').select('id,title,growth_area,capability,evidence,contribution,status,started_at,completed_at').eq('profile_id', id).order('updated_at', { ascending: false }).limit(20),
    supabase.from('formation_preferences').select('active_focus,opportunity_scope,active_horizon').eq('profile_id', id).maybeSingle(),
    supabase.from('profession').select('title,organization,description,contribution,current').eq('profile_id', id).eq('current', true).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const completed = (learning ?? []).filter((item) => item.member_status === 'completed' || item.completed_at).length
  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader /><div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
    <section className="grid gap-8 border-b border-[#17364d]/10 py-12 lg:grid-cols-[1.2fr_.8fr]"><div><p className="text-[9px] uppercase tracking-[.3em] text-[#557060]">Formation</p><h1 className="mt-4 max-w-4xl font-serif text-5xl font-light leading-[1.02] sm:text-6xl">Learn. Practice. Demonstrate. Integrate. Lead. Give.</h1><p className="mt-6 max-w-2xl leading-8 opacity-65">Formation is not a catalog. It is where knowledge becomes capability, judgment, character, leadership, love, contribution, and stewardship.</p></div><div className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><Sparkles /><p className="mt-6 font-serif text-3xl font-light">{preferences?.active_focus || 'Choose what you are learning now.'}</p><p className="mt-3 text-sm opacity-55">{profession?.title ? `Your current work: ${profession.title}.` : 'Your learning becomes more useful as it connects to real responsibility.'}</p></div></section>
    <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Learning objects" value={String(learning?.length ?? 0)} /><Metric label="Completed" value={String(completed)} /><Metric label="Practice paths" value={String(growth?.length ?? 0)} /><Metric label="Current work" value={profession?.title || 'Not set'} /></section>
    <section className="grid gap-6 lg:grid-cols-2">
      <Panel title="Learning">{(learning ?? []).map((item) => <article key={item.id} className="rounded-2xl bg-[#f7f4ed] p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#557060]">{item.formation_area || 'Learning'}</p><h3 className="mt-2 font-serif text-2xl font-light">{item.title}</h3></div><span className="rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[.15em]">{item.member_status || 'planned'}</span></div>{item.description && <p className="mt-3 text-sm leading-6 opacity-60">{item.description}</p>}{item.member_status !== 'completed' && <form action={completeLearning} className="mt-4"><input type="hidden" name="id" value={item.id} /><button className="rounded-full border border-[#17364d]/15 bg-white px-4 py-2 text-xs"><Check className="mr-1 inline h-3.5 w-3.5" /> Mark integrated</button></form>}</article>)}{!learning?.length && <Empty text="Your learning path starts with what you choose to study now." />}</Panel>
      <Panel title="Practice → Capability">{(growth ?? []).map((item) => <article key={item.id} className="rounded-2xl bg-[#f7f4ed] p-5"><p className="text-[9px] uppercase tracking-[.2em] text-[#557060]">{item.growth_area || 'Practice'}</p><h3 className="mt-2 font-serif text-2xl font-light">{item.title}</h3>{item.capability && <p className="mt-3 text-sm opacity-60">Capability: {item.capability}</p>}{item.evidence && <p className="mt-2 text-sm opacity-60">Evidence: {item.evidence}</p>}{item.contribution && <p className="mt-2 text-sm opacity-60">Contribution: {item.contribution}</p>}</article>)}{!growth?.length && <Empty text="Your practice paths become the bridge between learning and real responsibility." />}</Panel>
    </section>
    <section className="mt-8 grid gap-6 md:grid-cols-2"><form action={addLearning} className="rounded-[2rem] bg-white p-7"><BookOpen className="h-5 w-5 opacity-45" /><h2 className="mt-4 font-serif text-3xl font-light">Add a learning path</h2><input name="title" required placeholder="What are you learning?" className="mt-5 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><input name="area" placeholder="Area · Scripture, leadership, craft..." className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><button className="mt-4 rounded-full bg-[#17364d] px-5 py-2.5 text-sm text-white">Add learning</button></form><form action={addPractice} className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><Sparkles className="h-5 w-5 opacity-65" /><h2 className="mt-4 font-serif text-3xl font-light">Name the capability you are practicing</h2><input name="practice" required placeholder="What are you practicing?" className="mt-5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /><input name="capability" placeholder="What should become possible?" className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /><button className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm text-[#17364d]">Add practice</button></form></section>
  </div></main>
}

function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-[#17364d]/10 bg-white p-5"><p className="text-[9px] uppercase tracking-[.2em] opacity-40">{label}</p><p className="mt-3 font-serif text-3xl font-light">{value}</p></div>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">{title}</h2><div className="mt-5 space-y-3">{children}</div></section>}
function Empty({text}:{text:string}){return <p className="rounded-2xl border border-dashed border-[#17364d]/10 p-6 text-sm opacity-50">{text}</p>}
