'use client'

import { useState } from 'react'
import { ArrowRight, HeartHandshake, MapPin, Plus, Search, Sparkles, Store, Users } from 'lucide-react'

const actions = ['All', 'Help', 'Hire', 'Buy', 'Give', 'Join', 'Attend', 'Learn', 'Volunteer', 'Connect']

export default function MarketClient() {
  const [active, setActive] = useState('All')
  const [query, setQuery] = useState('')
  const [showComposer, setShowComposer] = useState(false)

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
      <section className="pt-12 lg:pt-20">
        <p className="text-xs uppercase tracking-[.3em] opacity-50">The People Market</p>
        <div className="mt-5 grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <h1 className="max-w-5xl text-5xl font-light leading-[1.02] md:text-7xl">Discover people, capability, needs, and opportunity — locally.</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 opacity-70">Not a catalog of people. A living market of what people can create, teach, repair, build, offer, need, and do together.</p>
          </div>
          <div className="rounded-[2rem] bg-[#17364d] p-8 text-[#f7f4ed]">
            <Sparkles className="h-6 w-6" />
            <h2 className="mt-7 text-2xl font-light">Human potential is the inventory.</h2>
            <p className="mt-3 leading-7 opacity-70">Connection, learning, service, employment, giving, and belonging are all valid outcomes.</p>
          </div>
        </div>
      </section>

      <section className="mt-14 flex flex-wrap gap-2">
        {actions.map(action => (
          <button key={action} onClick={() => setActive(action)} className={'rounded-full px-4 py-2 text-sm ' + (active === action ? 'bg-[#17364d] text-white' : 'border border-[#17364d]/15 bg-white/60')}>{action}</button>
        ))}
      </section>

      <section className="mt-6 flex flex-col gap-4 md:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-[#17364d]/10 bg-white px-5 py-4">
          <Search className="h-5 w-5 opacity-45" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people, skills, help, businesses, knowledge..." className="w-full bg-transparent outline-none" />
        </label>
        <button onClick={() => setShowComposer(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#17364d] px-6 py-4 text-sm text-white"><Plus className="h-4 w-4" /> Put something into the market</button>
      </section>

      {showComposer && (
        <section className="mt-6 rounded-[2rem] border border-[#17364d]/10 bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-light">Put something into the market</h2>
          <p className="mt-2 text-sm opacity-60">We are connecting the live Supabase market layer next.</p>
          <button onClick={() => setShowComposer(false)} className="mt-5 rounded-full border border-[#17364d]/15 px-5 py-3 text-sm">Close</button>
        </section>
      )}

      <section className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[
          ['People', 'Who is here', Users],
          ['Capabilities', 'What people can do', HeartHandshake],
          ['Hey Neighbor', 'What people need', MapPin],
          ['Artifacts', 'Things made by people here', Store],
          ['Opportunity', 'Work, learning, service, and connection', ArrowRight],
          ['Growth', 'The next meaningful action', Sparkles],
        ].map(([eyebrow, title, Icon]) => (
          <article key={String(title)} className="rounded-[1.75rem] border border-[#17364d]/10 bg-white p-7">
            <Icon className="h-6 w-6 opacity-40" />
            <p className="mt-6 text-xs uppercase tracking-[.3em] opacity-50">{String(eyebrow)}</p>
            <h2 className="mt-2 text-2xl font-light">{String(title)}</h2>
            <p className="mt-3 text-sm leading-6 opacity-60">{query ? 'Your search will shape this living market.' : 'A connected part of the BeLoved people and community ecosystem.'}</p>
            <button className="mt-5 inline-flex items-center gap-2 text-sm">Explore <ArrowRight className="h-4 w-4" /></button>
          </article>
        ))}
      </section>
    </div>
  )
}
