import Link from 'next/link'

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

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <div className="text-2xl font-semibold tracking-[0.18em]">BELOVED</div>
        <nav className="hidden gap-7 text-sm tracking-wide md:flex">
          <Link href="#explore">Explore</Link><Link href="#formation">Formation</Link><Link href="#journey">The Way Forward</Link><Link href="#community">Community</Link>
        </nav>
        <Link className="rounded-full border border-[#17364d] px-5 py-2 text-sm" href="/login">Enter BeLoved</Link>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.15fr_.85fr] lg:px-10 lg:pt-28">
        <div>
          <p className="mb-7 text-xs uppercase tracking-[0.35em] opacity-60">A living journey of Christian formation</p>
          <h1 className="max-w-4xl text-6xl font-light leading-[.98] tracking-[-.04em] md:text-8xl">You do not have to fit BeLoved.<br/><em>BeLoved meets you where you are.</em></h1>
          <p className="mt-9 max-w-2xl text-xl font-light leading-8 opacity-80">An intelligent, ecumenical formation ecosystem that grows with you—helping you notice, reflect, learn, love, steward, belong, and serve.</p>
          <div className="mt-10 flex flex-wrap gap-4"><Link href="/journey" className="rounded-full bg-[#17364d] px-7 py-4 text-sm text-white">Begin your journey</Link><Link href="#explore" className="rounded-full border border-[#17364d]/30 px-7 py-4 text-sm">Explore BeLoved</Link></div>
        </div>
        <div className="flex items-end"><div className="w-full rounded-[2rem] border border-[#17364d]/10 bg-white/55 p-8 shadow-sm"><p className="text-xs uppercase tracking-[.3em] opacity-50">John 17:21</p><p className="mt-8 text-4xl font-light leading-tight">“That they may all be one.”</p><p className="mt-8 leading-7 opacity-70">Unity is not a feature. It is the north star of the experience.</p></div></div>
      </section>

      <section id="journey" className="border-y border-[#17364d]/10 bg-white/50"><div className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><p className="text-xs uppercase tracking-[.3em] opacity-50">The living journey</p><div className="mt-10 grid gap-4 md:grid-cols-3">{pillars.map(([title,body])=><article key={title} className="rounded-3xl border border-[#17364d]/10 bg-[#f7f4ed] p-7"><h2 className="text-2xl font-light">{title}</h2><p className="mt-3 leading-6 opacity-65">{body}</p></article>)}</div></div></section>

      <section id="formation" className="mx-auto max-w-7xl px-6 py-24 lg:px-10"><div className="grid gap-12 lg:grid-cols-2"><div><p className="text-xs uppercase tracking-[.3em] opacity-50">Adaptive intelligence</p><h2 className="mt-5 text-5xl font-light leading-tight">The platform transforms with the person.</h2></div><div className="text-lg font-light leading-8 opacity-75"><p>BeLoved uses a coordinated network of specialized AI agents to understand authorized journey context and offer the next meaningful experience—not simply the next piece of content.</p><p className="mt-6">The path can change. The pace can change. The questions can change. The depth can change. The center does not.</p></div></div></section>

      <section id="community" className="bg-[#17364d] text-[#f7f4ed]"><div className="mx-auto max-w-7xl px-6 py-24 lg:px-10"><p className="text-xs uppercase tracking-[.3em] opacity-50">One connected ecosystem</p><h2 className="mt-5 max-w-4xl text-5xl font-light leading-tight md:text-6xl">AI intelligence. Member memory. Human community. One journey.</h2><div className="mt-12 grid gap-6 md:grid-cols-3"><div><h3 className="text-xl">Member Intelligence</h3><p className="mt-3 leading-7 opacity-65">A secure member database connects profile, journey, formation, community, content, service, and preferences.</p></div><div><h3 className="text-xl">Specialist Agents</h3><p className="mt-3 leading-7 opacity-65">Journey, Scripture, Reflection, Formation, Stewardship, Love, Community, Discernment, Unity, and Content agents collaborate through an orchestrator.</p></div><div><h3 className="text-xl">Meaningful Belonging</h3><p className="mt-3 leading-7 opacity-65">Groups, events, conversations, service, and shared formation connect people without turning community into another social feed.</p></div></div></div></section>

      <footer className="mx-auto max-w-7xl px-6 py-12 text-sm opacity-55 lg:px-10">BELOVED · A living journey of being loved, becoming, loving, belonging, and serving.</footer>
    </main>
  )
}