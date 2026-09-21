import Link from 'next/link'
import { BelovedNav } from './BelovedNav'

export function BelovedHeader() {
  return (
    <header className="pt-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-[0.18em]">BELOVED</Link>
        <Link href="/messages" className="rounded-full border border-[#17364d]/10 bg-white/70 px-4 py-2 text-sm">Private messages</Link>
      </div>
      <BelovedNav />
    </header>
  )
}
