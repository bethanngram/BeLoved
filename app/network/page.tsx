import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NetworkPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <Link href="/" className="text-2xl font-semibold tracking-[0.18em]">BELOVED</Link>
        <nav className="flex gap-3 text-sm">
          <Link href="/market" className="rounded-full border border-[#17364d]/15 px-4 py-2">People Market</Link>
          <Link href="/network" className="rounded-full bg-[#17364d] px-4 py-2 text-white">My Network</Link>
        </nav>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <p className="text-xs uppercase tracking-[.3em] opacity-50">My Network</p>
        <h1 className="mt-3 text-5xl font-light">Relationships become action.</h1>
        <p className="mt-5 max-w-2xl leading-7 opacity-65">Connection requests, private messages, and signals from the People Market live here.</p>
      </section>
    </main>
  )
}
