import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { HeartHandshake, Plus, ShieldCheck, Users } from 'lucide-react'
import { BelovedHeader } from '@/components/BelovedHeader'
import { createClient } from '@/lib/supabase/server'

async function publishOffer(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const id = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!id) redirect('/login')
  const title = String(formData.get('title') ?? '').trim()
  if (!title) redirect('/people')
  await supabase.from('offers').insert({ profile_id: id, title, description: String(formData.get('description') ?? '').trim() || null, category: String(formData.get('category') ?? '').trim() || 'community', offer_type: 'skill', entrustable: true, status: 'available', visibility: 'community', audience_communities: [] })
  revalidatePath('/people'); revalidatePath('/'); redirect('/people')
}

async function publishAsk(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const id = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!id) redirect('/login')
  const title = String(formData.get('title') ?? '').trim()
  if (!title) redirect('/people')
  await supabase.from('asks').insert({ profile_id: id, title, description: String(formData.get('description') ?? '').trim() || null, category: String(formData.get('category') ?? '').trim() || 'community', ask_type: 'need', urgency: 'low', status: 'open', visibility: 'circles', audience_communities: [] })
  revalidatePath('/people'); revalidatePath('/hey-neighbor'); revalidatePath('/'); redirect('/people')
}

async function addCircle(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const id = auth?.claims?.sub ? String(auth.claims.sub) : null
  if (!id) redirect('/login')
  const memberProfileId = String(formData.get('member_profile_id') ?? '')
  const circleName = String(formData.get('circle_name') ?? '').trim()
  if (!memberProfileId || !circleName) redirect('/people')
  await supabase.from('member_circle_memberships').insert({ owner_profile_id: id, member_profile_id: memberProfileId, circle_name: circleName })
  revalidatePath('/people'); redirect('/people')
}

export const dynamic = 'force-dynamic'

export default async function PeoplePage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth?.claims?.sub) return <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-6 text-[#17364d]"><div className="text-center"><h1 className="font-serif text-5xl font-light">People is where belonging becomes real.</h1><Link href="/login" className="mt-8 inline-flex rounded-full bg-[#17364d] px-6 py-3 text-sm text-white">Enter BeLoved</Link></div></main>

  const id = String(auth.claims.sub)
  const [{ data: members }, { data: offers }, { data: asks }, { data: circles }, { data: listings }] = await Promise.all([
    supabase.from('member_directory').select('profile_id,display_name,city_region,interests,skills,help_offers,professional_capability,bio').eq('discoverable', true).neq('profile_id', id).order('display_name', { ascending: true }).limit(60),
    supabase.from('offers').select('id,profile_id,title,description,category,offer_type,status').in('status', ['available','open']).eq('visibility', 'community').order('created_at', { ascending: false }).limit(30),
    supabase.from('asks').select('id,profile_id,title,description,category,ask_type,urgency,status').in('status', ['open','active']).in('visibility', ['community','circles']).order('created_at', { ascending: false }).limit(30),
    supabase.from('member_circle_memberships').select('id,member_profile_id,circle_name,created_at').eq('owner_profile_id', id).order('created_at', { ascending: false }).limit(40),
    supabase.from('marketplace_listings').select('id,seller_id,title,description,category,price_cents,location_text,status').in('status', ['available','active']).limit(20),
  ])
  const memberMap = new Map((members ?? []).map((m) => [m.profile_id, m]))

  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader /><div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
    <section className="grid gap-8 border-b border-[#17364d]/10 py-12 lg:grid-cols-[1.2fr_.8fr]"><div><p className="text-[9px] uppercase tracking-[.3em] text-[#557060]">People · Circles · Trust</p><h1 className="mt-4 max-w-4xl font-serif text-5xl font-light leading-[1.02] sm:text-6xl">Known → Met → Shared → Trusted → Invested.</h1><p className="mt-6 max-w-2xl leading-8 opacity-65">People is not a social feed. It is the relationship infrastructure around a person's real life.</p></div><div className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><Users /><p className="mt-5 font-serif text-3xl font-light">What we have is sometimes meant to be shared.</p><p className="mt-3 text-sm leading-6 opacity-55">Capability, need, relationship, time, knowledge, goods, and money all belong in the same trust-aware ecosystem.</p></div></section>
    <section className="mt-8 grid gap-6 lg:grid-cols-3">
      <Panel title="People">{(members ?? []).slice(0, 12).map((person) => <article key={person.profile_id} className="rounded-2xl bg-[#f7f4ed] p-5"><h3 className="font-serif text-2xl font-light">{person.display_name || 'BeLoved member'}</h3><p className="mt-1 text-xs opacity-45">{person.city_region || 'Place not shared'}</p>{person.professional_capability && <p className="mt-3 text-sm opacity-65">{person.professional_capability}</p>}<div className="mt-4 flex flex-wrap gap-2">{(person.skills ?? []).slice(0,4).map((skill) => <span key={skill} className="rounded-full bg-white px-3 py-1.5 text-[10px]">{skill}</span>)}</div></article>)}{!members?.length && <Empty text="As members choose to be discoverable, people will appear here." />}</Panel>
      <Panel title="Asks & Offers">{(offers ?? []).map((offer) => <article key={offer.id} className="rounded-2xl bg-[#f7f4ed] p-5"><p className="text-[9px] uppercase tracking-[.2em] text-[#557060]">Offer · {offer.category || 'community'}</p><h3 className="mt-2 font-medium">{offer.title}</h3>{offer.description && <p className="mt-2 text-sm leading-6 opacity-55">{offer.description}</p>}<Link href="/network" className="mt-4 inline-flex text-xs underline underline-offset-4">Connect</Link></article>)}{(asks ?? []).map((ask) => <article key={ask.id} className="rounded-2xl bg-[#f7f4ed] p-5"><p className="text-[9px] uppercase tracking-[.2em] text-[#a8863a]">Ask · {ask.category || 'community'}</p><h3 className="mt-2 font-medium">{ask.title}</h3>{ask.description && <p className="mt-2 text-sm leading-6 opacity-55">{ask.description}</p>}<Link href="/hey-neighbor" className="mt-4 inline-flex text-xs underline underline-offset-4">See response path</Link></article>)}{!offers?.length && !asks?.length && <Empty text="No live asks or offers are visible in your current circles yet." />}</Panel>
      <Panel title="Shared Resources">{(listings ?? []).map((listing) => <article key={listing.id} className="rounded-2xl bg-[#f7f4ed] p-5"><p className="text-[9px] uppercase tracking-[.2em] text-[#557060]">{listing.category || 'resource'}</p><h3 className="mt-2 font-medium">{listing.title}</h3><p className="mt-2 text-sm opacity-55">{listing.location_text || 'Local'}{listing.price_cents != null ? ` · $${(listing.price_cents / 100).toFixed(2)}` : ''}</p>{listing.description && <p className="mt-2 text-sm leading-6 opacity-55">{listing.description}</p>}</article>)}{!listings?.length && <Empty text="Shared resources will appear here as members entrust goods, services, and practical help to the community." />}</Panel>
    </section>
    <section className="mt-8 grid gap-6 lg:grid-cols-2"><form action={addCircle} className="rounded-[2rem] bg-white p-7"><HeartHandshake className="h-5 w-5 opacity-45" /><h2 className="mt-4 font-serif text-3xl font-light">Place someone in a circle</h2><select name="member_profile_id" required className="mt-5 w-full rounded-xl border border-[#17364d]/10 px-4 py-3"><option value="">Choose a person</option>{(members ?? []).map((person) => <option key={person.profile_id} value={person.profile_id}>{person.display_name || person.profile_id}</option>)}</select><input name="circle_name" required placeholder="Circle · family, work, church, neighbors..." className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><button className="mt-4 rounded-full bg-[#17364d] px-5 py-2.5 text-sm text-white"><Plus className="mr-1 inline h-3.5 w-3.5" /> Add to circle</button></form><div className="rounded-[2rem] bg-white p-7"><ShieldCheck className="h-5 w-5 opacity-45" /><h2 className="mt-4 font-serif text-3xl font-light">Your circles</h2><div className="mt-5 space-y-3">{(circles ?? []).map((circle) => { const person = memberMap.get(circle.member_profile_id); return <div key={circle.id} className="rounded-2xl bg-[#f7f4ed] p-4"><p className="font-medium">{person?.display_name || 'Member'}</p><p className="mt-1 text-xs opacity-45">{circle.circle_name}</p></div> })}{!circles?.length && <Empty text="Your circles will become a quieter layer of trust inside the broader People experience." />}</div></div></section>
    <section className="mt-8 grid gap-6 lg:grid-cols-2"><form action={publishAsk} className="rounded-[2rem] bg-white p-7"><p className="text-[9px] uppercase tracking-[.25em] text-[#a8863a]">Ask</p><h2 className="mt-3 font-serif text-3xl font-light">Name what you need.</h2><input name="title" required placeholder="What would help right now?" className="mt-5 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><input name="category" placeholder="Category" className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><textarea name="description" rows={4} placeholder="Give your circle enough context to respond." className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" /><button className="mt-4 rounded-full bg-[#17364d] px-5 py-2.5 text-sm text-white">Publish ask</button></form><form action={publishOffer} className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]"><p className="text-[9px] uppercase tracking-[.25em] opacity-45">Offer</p><h2 className="mt-3 font-serif text-3xl font-light">Name what you can entrust.</h2><input name="title" required placeholder="What can you offer?" className="mt-5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /><input name="category" placeholder="Category" className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /><textarea name="description" rows={4} placeholder="What does the offer make possible?" className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35" /><button className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm text-[#17364d]">Publish offer</button></form></section>
  </div></main>
}

function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className="rounded-[2rem] bg-white p-7"><h2 className="font-serif text-3xl font-light">{title}</h2><div className="mt-5 space-y-3">{children}</div></section>}
function Empty({text}:{text:string}){return <p className="rounded-2xl border border-dashed border-[#17364d]/10 p-6 text-sm opacity-50">{text}</p>}
