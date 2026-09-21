'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, HandHeart, HeartHandshake, MapPin, Plus, Search, Sparkles, Store, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Person = {
  profile_id: string
  display_name: string | null
  photo_url: string | null
  city_region: string | null
  interests: string[]
  skills: string[]
  help_offers: string[]
  bio: string | null
  accepts_asks: boolean
  availability_status: string | null
  professional_capability: string | null
}
type Offer = { id: string; profile_id: string; title: string; description: string | null; category: string | null; offer_type: string; status: string }
type Ask = { id: string; profile_id: string; title: string; description: string | null; category: string; urgency: string; visibility: string }
type Listing = { id: string; seller_id: string; title: string; description: string | null; category: string; price_cents: number | null; location_text: string | null; image_url: string | null; status: string }

const actions = ['All', 'Help', 'Hire', 'Buy', 'Give', 'Join', 'Attend', 'Learn', 'Volunteer', 'Connect']

export default function MarketClient() {
  const supabase = useMemo(() => createClient(), [])
  const [people, setPeople] = useState<Person[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [asks, setAsks] = useState<Ask[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('All')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [composerType, setComposerType] = useState<'offer' | 'ask'>('offer')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('community')

  async function load() {
    const results = await Promise.all([
      supabase.from('member_directory').select('profile_id,display_name,photo_url,city_region,interests,skills,help_offers,bio,accepts_asks,availability_status,professional_capability').eq('discoverable', true).limit(60),
      supabase.from('offers').select('id,profile_id,title,description,category,offer_type,status').eq('status', 'available').limit(60),
      supabase.from('asks').select('id,profile_id,title,description,category,urgency,visibility').eq('status', 'open').limit(60),
      supabase.from('marketplace_listings').select('id,seller_id,title,description,category,price_cents,location_text,image_url,status').eq('status', 'available').limit(60),
    ])

    if (results[0].error || results[1].error || results[2].error || results[3].error) {
      const firstError = [results[0].error, results[1].error, results[2].error, results[3].error].find(Boolean)
      setMessage(firstError?.message || 'Unable to load the People Market right now.')
    }

    setPeople((results[0].data || []) as Person[])
    setOffers((results[1].data || []) as Offer[])
    setAsks((results[2].data || []) as Ask[])
    setListings((results[3].data || []) as Listing[])
  }

  useEffect(() => { void load() }, [])

  const filteredPeople = people.filter(person => {
    const text = [person.display_name, person.city_region, person.bio, person.professional_capability, ...(person.skills || []), ...(person.help_offers || []), ...(person.interests || [])].filter(Boolean).join(' ').toLowerCase()
    const matchesSearch = !query || text.includes(query.toLowerCase())
    const matchesAction = active === 'All' || (
      active === 'Connect' ? true :
      active === 'Help' ? Boolean(person.help_offers?.length || person.accepts_asks) :
      active === 'Hire' ? Boolean(person.professional_capability || person.skills?.length) :
      active === 'Learn' ? Boolean(person.skills?.length || person.professional_capability) :
      true
    )
    return matchesSearch && matchesAction
  })

  async function createPost(event: FormEvent) {
    event.preventDefault()
    setBusy('composer')
    setMessage('')
    const { data } = await supabase.auth.getUser()
    const profileId = data.user?.id
    if (!profileId) { setMessage('Please sign in again.'); setBusy(null); return }

    const table = composerType === 'offer' ? 'offers' : 'asks'
    const payload = composerType === 'offer'
      ? { profile_id: profileId, title: title.trim(), description: description.trim() || null, category: category.trim() || 'community', offer_type: 'capability', status: 'available', visibility: 'network' }
      : { profile_id: profileId, title: title.trim(), description: description.trim() || null, category: category.trim() || 'other', ask_type: 'need', urgency: 'normal', status: 'open', visibility: 'network' }

    const { error } = await supabase.from(table).insert(payload)
    setBusy(null)
    if (error) { setMessage(error.message); return }
    setTitle(''); setDescription(''); setShowComposer(false)
    setMessage(composerType === 'offer' ? 'Your capability is now in the people market.' : 'Your neighbor request is now visible to your network.')
    await load()
  }

  async function connect(profileId: string) {
    setBusy(profileId); setMessage('')
    const { data } = await supabase.auth.getUser()
    const me = data.user?.id
    if (!me || me === profileId) { setBusy(null); return }

    const filter = 'and(requester_profile_id.eq.' + me + ',addressee_profile_id.eq.' + profileId + '),and(requester_profile_id.eq.' + profileId + ',addressee_profile_id.eq.' + me + ')'
    const { data: existing, error: existingError } = await supabase.from('member_connections').select('id,status').or(filter).maybeSingle()
    if (existingError) { setMessage(existingError.message); setBusy(null); return }

    let connectionId = existing?.id
    if (existing?.status === 'accepted') { setMessage('You are already connected.'); setBusy(null); return }

    if (!connectionId) {
      const { data: connection, error } = await supabase.from('member_connections').insert({ requester_profile_id: me, addressee_profile_id: profileId, status: 'requested' }).select('id').single()
      if (error) { setMessage(error.message); setBusy(null); return }
      connectionId = connection.id
    }

    const { data: pending } = await supabase.from('connection_requests').select('id').eq('connection_id', connectionId).eq('status', 'pending').maybeSingle()
    if (pending) { setMessage('A connection request is already pending.'); setBusy(null); return }

    const { error } = await supabase.from('connection_requests').insert({
      connection_id: connectionId,
      requester_profile_id: me,
      addressee_profile_id: profileId,
      status: 'pending',
      note: 'I found you through the BeLoved People Market.',
    })

    setBusy(null)
    setMessage(error ? error.message : 'Connection request sent.')
  }

  async function helpAsk(ask: Ask) {
    setBusy(ask.id); setMessage('')
    const { data } = await supabase.auth.getUser()
    const me = data.user?.id
    if (!me || me === ask.profile_id) { setBusy(null); return }

    const created = await supabase.from('fulfillment_cases').insert({
      profile_id: ask.profile_id,
      ask_id: ask.id,
      title: ask.title,
      description: ask.description,
      visibility: 'member',
      status: 'open',
      priority: ask.urgency === 'high' ? 'high' : 'normal',
    }).select('id').single()

    if (created.error) { setMessage(created.error.message); setBusy(null); return }

    const matched = await supabase.from('fulfillment_matches').insert({
      case_id: created.data.id,
      requester_profile_id: ask.profile_id,
      helper_profile_id: me,
      status: 'proposed',
      match_basis: { source: 'people_market', action: 'help' },
    })

    setBusy(null)
    setMessage(matched.error ? matched.error.message : 'You stepped forward. The request now has a fulfillment match.')
  }

  async function interested(offer: Offer) {
    setBusy(offer.id); setMessage('')
    const { data } = await supabase.auth.getUser()
    const me = data.user?.id
    if (!me || me === offer.profile_id) { setBusy(null); return }

    const created = await supabase.from('fulfillment_cases').insert({
      profile_id: me,
      title: offer.title,
      description: offer.description,
      visibility: 'member',
      status: 'open',
      priority: 'normal',
      metadata: { source: 'people_market', offer_id: offer.id },
    }).select('id').single()

    if (created.error) { setMessage(created.error.message); setBusy(null); return }

    const matched = await supabase.from('fulfillment_matches').insert({
      case_id: created.data.id,
      requester_profile_id: me,
      helper_profile_id: offer.profile_id,
      offer_id: offer.id,
      status: 'proposed',
      match_basis: { source: 'people_market', action: 'hire_or_learn' },
    })

    setBusy(null)
    setMessage(matched.error ? matched.error.message : 'Interest sent. The capability is now connected to a fulfillment case.')
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
      <section className="pt-12 lg:pt-20">
        <p className="text-xs uppercase tracking-[.3em] opacity-50">The People Market</p>
        <div className="mt-5 grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div><h1 className="max-w-5xl text-5xl font-light leading-[1.02] md:text-7xl">Discover people, capability, needs, and opportunity — locally.</h1><p className="mt-7 max-w-3xl text-lg leading-8 opacity-70">Not a catalog of people. A living market of what people can create, teach, repair, build, offer, need, and do together.</p></div>
          <div className="rounded-[2rem] bg-[#17364d] p-8 text-[#f7f4ed]"><Sparkles className="h-6 w-6" /><h2 className="mt-7 text-2xl font-light">Human potential is the inventory.</h2><p className="mt-3 leading-7 opacity-70">The transaction is only one possible outcome. Connection, learning, service, employment, giving, and belonging count too.</p></div>
        </div>
      </section>

      <section className="mt-14 flex flex-wrap gap-2">{actions.map(action => <button key={action} onClick={() => setActive(action)} className={'rounded-full px-4 py-2 text-sm ' + (active === action ? 'bg-[#17364d] text-white' : 'border border-[#17364d]/15 bg-white/60')}>{action}</button>)}</section>
      <section className="mt-6 flex flex-col gap-4 md:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-[#17364d]/10 bg-white px-5 py-4"><Search className="h-5 w-5 opacity-45" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people, skills, help, businesses, knowledge..." className="w-full bg-transparent outline-none" /></label>
        <button onClick={() => { setShowComposer(true); setComposerType(active === 'Help' ? 'ask' : 'offer') }} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17364d] px-6 py-4 text-sm text-white"><Plus className="h-4 w-4" /> Put something into the market</button>
      </section>
      {message && <div className="mt-5 rounded-2xl border border-[#17364d]/10 bg-white px-5 py-4 text-sm">{message}</div>}

      {showComposer && <form onSubmit={createPost} className="mt-6 rounded-[2rem] border border-[#17364d]/10 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setComposerType('offer')} className={'rounded-full px-4 py-2 text-sm ' + (composerType === 'offer' ? 'bg-[#17364d] text-white' : 'border border-[#17364d]/15')}>I can offer</button><button type="button" onClick={() => setComposerType('ask')} className={'rounded-full px-4 py-2 text-sm ' + (composerType === 'ask' ? 'bg-[#17364d] text-white' : 'border border-[#17364d]/15')}>I need</button></div>
        <input required value={title} onChange={e => setTitle(e.target.value)} placeholder={composerType === 'offer' ? 'What can you do or provide?' : 'What do you need?'} className="mt-5 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" />
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add context so the right person can respond." rows={4} className="mt-3 w-full rounded-xl border border-[#17364d]/10 px-4 py-3" />
        <div className="mt-4 flex gap-3"><button disabled={busy === 'composer'} className="rounded-full bg-[#17364d] px-5 py-3 text-sm text-white">{busy === 'composer' ? 'Saving…' : 'Publish'}</button><button type="button" onClick={() => setShowComposer(false)} className="rounded-full border border-[#17364d]/15 px-5 py-3 text-sm">Cancel</button></div>
      </form>}

      <section className="mt-16"><div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[.3em] opacity-50">People</p><h2 className="mt-2 text-3xl font-light">Who is here</h2></div><Users className="h-6 w-6 opacity-35" /></div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredPeople.map(person => <article key={person.profile_id} className="rounded-[1.75rem] border border-[#17364d]/10 bg-white p-6">
          <div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e7dfd0] text-sm font-medium">{person.photo_url ? <img src={person.photo_url} alt="" className="h-full w-full object-cover" /> : (person.display_name || 'B').split(' ').map(x => x[0]).slice(0, 2).join('')}</div><div><h3 className="text-xl font-light">{person.display_name || 'BeLoved member'}</h3>{person.city_region && <p className="mt-1 flex items-center gap-1 text-xs opacity-50"><MapPin className="h-3 w-3" />{person.city_region}</p>}</div></div>
          <p className="mt-5 text-sm leading-6 opacity-65">{person.bio || person.professional_capability || 'Building capacity, relationships, and community.'}</p>
          <div className="mt-5 flex flex-wrap gap-2">{[...(person.skills || []), ...(person.help_offers || [])].slice(0, 5).map(skill => <span key={skill} className="rounded-full bg-[#f7f4ed] px-3 py-1 text-xs">{skill}</span>)}</div>
          <button disabled={busy === person.profile_id} onClick={() => void connect(person.profile_id)} className="mt-6 w-full rounded-full border border-[#17364d]/15 px-4 py-3 text-sm">{busy === person.profile_id ? 'Sending…' : 'Connect'}</button>
        </article>)}</div>
        {filteredPeople.length === 0 && <div className="mt-5 rounded-3xl border border-dashed border-[#17364d]/15 p-10 text-center opacity-60">No discoverable people match this search yet.</div>}
      </section>

      <section className="mt-20 grid gap-8 lg:grid-cols-2">
        <div><p className="text-xs uppercase tracking-[.3em] opacity-50">Capabilities</p><h2 className="mt-2 text-3xl font-light">What people can do</h2><div className="mt-6 space-y-4">{offers.slice(0, 8).map(offer => <article key={offer.id} className="rounded-3xl border border-[#17364d]/10 bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wider opacity-45">{offer.category || offer.offer_type}</p><h3 className="mt-2 text-xl font-light">{offer.title}</h3><p className="mt-2 text-sm leading-6 opacity-65">{offer.description}</p></div><HandHeart className="h-5 w-5 opacity-35" /></div><button onClick={() => void interested(offer)} disabled={busy === offer.id} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#17364d] px-4 py-2 text-sm text-white">{busy === offer.id ? 'Connecting…' : 'I’m interested'}<ArrowRight className="h-4 w-4" /></button></article>)}</div></div>
        <div><p className="text-xs uppercase tracking-[.3em] opacity-50">Hey Neighbor</p><h2 className="mt-2 text-3xl font-light">What people need</h2><div className="mt-6 space-y-4">{asks.slice(0, 8).map(ask => <article key={ask.id} className="rounded-3xl border border-[#17364d]/10 bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wider opacity-45">{ask.category} · {ask.urgency}</p><h3 className="mt-2 text-xl font-light">{ask.title}</h3><p className="mt-2 text-sm leading-6 opacity-65">{ask.description}</p></div><HeartHandshake className="h-5 w-5 opacity-35" /></div><button onClick={() => void helpAsk(ask)} disabled={busy === ask.id} className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#17364d]/15 px-4 py-2 text-sm">{busy === ask.id ? 'Stepping forward…' : 'I can help'}<ArrowRight className="h-4 w-4" /></button></article>)}</div></div>
      </section>

      <section className="mt-20"><p className="text-xs uppercase tracking-[.3em] opacity-50">Artifacts</p><div className="mt-2 flex items-end justify-between"><h2 className="text-3xl font-light">Things made by people here</h2><Store className="h-6 w-6 opacity-35" /></div><div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{listings.slice(0, 9).map(item => <article key={item.id} className="overflow-hidden rounded-[1.75rem] border border-[#17364d]/10 bg-white">{item.image_url ? <img src={item.image_url} alt="" className="h-44 w-full object-cover" /> : <div className="grid h-32 place-items-center bg-[#e7dfd0] text-sm opacity-55">Local creation</div>}<div className="p-6"><p className="text-xs uppercase tracking-wider opacity-45">{item.category}</p><h3 className="mt-2 text-xl font-light">{item.title}</h3><p className="mt-2 text-sm opacity-60">{item.description}</p><div className="mt-5 flex items-center justify-between"><span className="text-sm">{item.price_cents == null ? 'Community offering' : '$' + (item.price_cents / 100).toFixed(2)}</span>{item.location_text && <span className="text-xs opacity-45">{item.location_text}</span>}</div></div></article>)}</div></section>
    </div>
  )
}
