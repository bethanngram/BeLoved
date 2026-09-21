import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BelovedHeader } from '@/components/BelovedHeader'

const pillars = [
  ['Be Loved', 'Begin with identity, not performance.'],
  ['Receive', 'Make room for grace, presence, and trust.'],
  ['Become', 'Let love shape the person you are becoming.'],
  ['Learn', 'Explore Scripture, wisdom, tradition, and questions.'],
  ['Reflect', 'Notice what is happening within and around you.'],
  ['Steward', 'Discover what has been entrusted to you.'],
  ['Love', 'Turn formation outward into relationship and action.'],
  ['Belong', 'Find meaningful community across Christian traditions.'],
  ['Serve', 'Translate love into faithful participation in the world.'],
]

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const profileId = auth?.claims?.sub ? String(auth.claims.sub) : null

  if (!profileId) return <PublicHome />

  const [{ data: profile }, { data: directory }, { data: asks }, { data: offers }, { data: listings }, { data: notifications }, { data: connections }, { data: gaps }] = await Promise.all([
    supabase.from('profiles').select('id,name,bio,location_text,membership_tier').eq('id', profileId).maybeSingle(),
    supabase.from('member_directory').select('display_name,city_region,interests,skills,help_offers,professional_capability,availability_status').eq('profile_id', profileId).maybeSingle(),
    supabase.from('asks').select('id,title,category,ask_type,status,created_at').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(4),
    supabase.from('offers').select('id,title,category,offer_type,status,created_at').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(4),
    supabase.from('marketplace_listings').select('id,title,category,status,created_at').eq('seller_id', profileId).order('created_at', { ascending: false }).limit(4),
    supabase.from('notifications').select('id,title,body,read_at,created_at').eq('recipient_profile_id', profileId).order('created_at', { ascending: false }).limit(5),
    supabase.from('member_connections').select('id,status,created_at,updated_at').or(`requester_profile_id.eq.${profileId},addressee_profile_id.eq.${profileId}`).eq('status','accepted').limit(100),
    supabase.from('world_response_gaps').select('geography_key,need_code,unmet_quantity,coverage_ratio,coverage_status,calculated_at').order('unmet_quantity', { ascending: false }).limit(4),
  ])

  const name = profile?.name?.split(' ')[0] || directory?.display_name?.split(' ')[0] || 'Friend'
  const unread = (notifications || []).filter(n => !n.read_at).length
  const skills = directory?.skills || []
  const interests = directory?.interests || []
  const activeAsks = (asks || []).filter(a => a.status === 'open' || a.status === 'active').length
  const activeOffers = (offers || []).filter(o => o.status === 'open' || o.status === 'active').length
  const activeListings = (listings || []).filter(l => l.status === 'active' || l.status === 'available').length

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]">
      <BelovedHeader />
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="grid gap-8 border-b border-[#17364d]/10 py-12 lg:grid-cols-[1.25fr_.75fr] lg:py-16">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#557060]">Your BeLoved home</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl font-light leading-[1.02] sm:text-6xl lg:text-7xl">Welcome, {name}.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#17364d]/65">One living place for your growth, relationships, capability, contribution, and community.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/journey" className="rounded-full bg-[#17364d] px-6 py-3 text-sm text-white">Continue Journey</Link>
              <Link href="/hey-neighbor" className="rounded-full border border-[#17364d]/15 bg-white/70 px-6 py-3 text-sm">Hey Neighbor</Link>
              <Link href="/member/people" className="rounded-full border border-[#17364d]/15 bg-white/70 px-6 py-3 text-sm">People Market</Link>
            </div>
          </div>
          <div className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]">
            <p className="text-[10px] uppercase tracking-[.28em] opacity-45">Your local presence</p>
            <p className="mt-5 text-3xl font-light">{profile?.location_text || directory?.city_region || 'Add your place'}</p>
            <p className="mt-3 text-sm leading-6 opacity-60">{directory?.professional_capability || 'Your capability becomes more useful when people can find it.'}</p>
            <Link href="/people/me" className="mt-6 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm">Build your living profile</Link>
          </div>
        </section>

        <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Connections" value={String(connections?.length || 0)} href="/network" />
          <Metric label="Unread" value={String(unread)} href="/messages" />
          <Metric label="My asks" value={String(activeAsks)} href="/hey-neighbor" />
          <Metric label="My offers" value={String(activeOffers)} href="/member/people" />
          <Metric label="My listings" value={String(activeListings)} href="/member/people" />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <ActionCard href="/journey" eyebrow="GROW" title="Your journey" text="Notice where you are, develop capacity, and turn formation into faithful practice." />
          <ActionCard href="/member/people" eyebrow="CONNECT" title="Your capability" text={skills.length ? skills.slice(0, 3).join(' · ') : 'Make what you can do visible to people who need it.'} />
          <ActionCard href="/hey-neighbor" eyebrow="RESPOND" title="Your community" text="See needs, offers, and response gaps where people can act together." />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[2rem] bg-white p-7">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Private signals</p><h2 className="mt-2 font-serif text-3xl font-light">What needs your attention</h2></div>
              <Link href="/messages" className="text-sm underline underline-offset-4">Open</Link>
            </div>
            <div className="mt-6 space-y-3">
              {(notifications || []).slice(0, 4).map(n => <div key={n.id} className={`rounded-2xl p-4 ${n.read_at ? 'bg-[#f7f4ed]' : 'bg-[#eef2ed]'}`}><p className="text-sm font-medium">{n.title}</p>{n.body && <p className="mt-1 text-xs leading-5 opacity-55">{n.body}</p>}</div>)}
              {!notifications?.length && <p className="rounded-2xl bg-[#f7f4ed] p-5 text-sm opacity-55">New connection requests, messages, and community responses will appear here.</p>}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]">
            <p className="text-[9px] uppercase tracking-[.28em] opacity-45">Community intelligence</p>
            <h2 className="mt-2 font-serif text-3xl font-light">Where response is needed</h2>
            <div className="mt-6 space-y-3">
              {(gaps || []).map((gap, i) => <div key={`${gap.geography_key}-${gap.need_code}-${i}`} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex justify-between gap-3"><span className="text-sm">{gap.need_code}</span><span className="text-xs opacity-45">{gap.geography_key}</span></div><p className="mt-2 text-xs opacity-55">{gap.coverage_status || 'Response gap'} · {gap.unmet_quantity ?? 0} unmet</p></div>)}
              {!gaps?.length && <p className="text-sm leading-6 opacity-55">As community signals accumulate, BeLoved will surface places where existing capacity can meet real need.</p>}
            </div>
            <Link href="/hey-neighbor" className="mt-6 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm">See local action</Link>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-[#17364d]/10 bg-white/50 p-7">
          <p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Your living inventory</p>
          <h2 className="mt-2 font-serif text-3xl font-light">Who you are becoming can become contribution.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Inventory title="What I can do" items={skills} fallback="Skills and capabilities" />
            <Inventory title="What I care about" items={interests} fallback="Interests and communities" />
            <Inventory title="What I offer" items={(directory?.help_offers || []).slice(0, 5)} fallback="Help, work, knowledge, service" />
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/journey" className="rounded-3xl bg-white p-6"><p className="text-xs uppercase tracking-[.25em] opacity-45">01</p><h3 className="mt-4 text-xl font-light">Grow</h3><p className="mt-2 text-sm opacity-55">Formation becomes capacity.</p></Link>
          <Link href="/network" className="rounded-3xl bg-white p-6"><p className="text-xs uppercase tracking-[.25em] opacity-45">02</p><h3 className="mt-4 text-xl font-light">Relate</h3><p className="mt-2 text-sm opacity-55">Capacity becomes relationship.</p></Link>
          <Link href="/member/people" className="rounded-3xl bg-white p-6"><p className="text-xs uppercase tracking-[.25em] opacity-45">03</p><h3 className="mt-4 text-xl font-light">Act</h3><p className="mt-2 text-sm opacity-55">Relationship becomes action.</p></Link>
          <Link href="/hey-neighbor" className="rounded-3xl bg-white p-6"><p className="text-xs uppercase tracking-[.25em] opacity-45">04</p><h3 className="mt-4 text-xl font-light">Strengthen</h3><p className="mt-2 text-sm opacity-55">Action becomes sustainable growth.</p></Link>
        </section>
      </div>
    </main>
  )
}

function PublicHome() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-7 lg:px-10">
        <div className="text-2xl font-semibold tracking-[0.18em]">BELOVED</div>
        <div className="flex items-center gap-3"><Link className="hidden rounded-full border border-[#17364d]/20 px-5 py-2 text-sm sm:inline-flex" href="/membership">Membership</Link><Link className="rounded-full border border-[#17364d] px-5 py-2 text-sm" href="/login">Enter BeLoved</Link></div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.15fr_.85fr] lg:px-10 lg:pt-28">
        <div><p className="mb-7 text-xs uppercase tracking-[0.35em] opacity-60">A living journey of Christian formation</p><h1 className="max-w-4xl text-6xl font-light leading-[.98] tracking-[-.04em] md:text-8xl">You do not have to fit BeLoved.<br/><em>BeLoved meets you where you are.</em></h1><p className="mt-9 max-w-2xl text-xl font-light leading-8 opacity-80">An intelligent, ecumenical formation ecosystem that grows with you—helping you notice, reflect, learn, love, steward, belong, and serve.</p><div className="mt-10 flex flex-wrap gap-4"><Link href="/journey" className="rounded-full bg-[#17364d] px-7 py-4 text-sm text-white">Begin your journey</Link><Link href="/member/people" className="rounded-full border border-[#17364d]/30 px-7 py-4 text-sm">People Market</Link></div></div>
        <div className="flex items-end"><div className="w-full rounded-[2rem] border border-[#17364d]/10 bg-white/55 p-8 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] opacity-50">John 17:21</p><p className="mt-8 text-4xl font-light leading-tight">“That they may all be one.”</p><p className="mt-8 leading-7 opacity-70">Unity is not a feature. It is the north star of the experience.</p></div></div>
      </section>
      <section className="border-y border-[#17364d]/10 bg-white/50"><div className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><p className="text-xs uppercase tracking-[.3em] opacity-50">The living journey</p><div className="mt-10 grid gap-4 md:grid-cols-3">{pillars.map(([title,body])=><article key={title} className="rounded-3xl border border-[#17364d]/10 bg-[#f7f4ed] p-7"><h2 className="text-2xl font-light">{title}</h2><p className="mt-3 leading-6 opacity-65">{body}</p></article>)}</div></div></section>
    </main>
  )
}

function Metric({ label, value, href }: { label: string; value: string; href: string }) {
  return <Link href={href} className="rounded-2xl border border-[#17364d]/10 bg-white p-5"><p className="text-[9px] uppercase tracking-[.2em] opacity-40">{label}</p><p className="mt-3 font-serif text-3xl font-light">{value}</p></Link>
}

function ActionCard({ href, eyebrow, title, text }: { href: string; eyebrow: string; title: string; text: string }) {
  return <Link href={href} className="rounded-[2rem] bg-white p-7 transition hover:-translate-y-0.5"><p className="text-[9px] uppercase tracking-[.25em] text-[#557060]">{eyebrow}</p><h2 className="mt-3 font-serif text-3xl font-light">{title}</h2><p className="mt-3 text-sm leading-6 opacity-55">{text}</p></Link>
}

function Inventory({ title, items, fallback }: { title: string; items: string[]; fallback: string }) {
  return <div className="rounded-2xl bg-[#f7f4ed] p-5"><h3 className="text-lg font-light">{title}</h3><div className="mt-4 flex flex-wrap gap-2">{items.length ? items.map(item => <span key={item} className="rounded-full bg-white px-3 py-2 text-xs">{item}</span>) : <span className="text-sm opacity-45">{fallback}</span>}</div></div>
}
