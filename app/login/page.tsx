import Link from 'next/link'
import { login, passwordLogin } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const params = await searchParams
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4ed] p-6 text-[#17364d]">
      <div className="w-full max-w-md space-y-4">
        <form action={passwordLogin} className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[.3em] opacity-50">Enter BeLoved</p>
          <h1 className="mt-4 font-serif text-4xl font-light">Continue your journey.</h1>
          <p className="mt-4 leading-7 opacity-60">Your place is here. Sign in to return to it.</p>
          <label className="mt-7 block text-sm" htmlFor="email">Email</label>
          <input className="mt-2 w-full rounded-xl border border-[#17364d]/15 px-4 py-3" id="email" name="email" type="email" required autoComplete="email" />
          <label className="mt-5 block text-sm" htmlFor="password">Password</label>
          <input className="mt-2 w-full rounded-xl border border-[#17364d]/15 px-4 py-3" id="password" name="password" type="password" required autoComplete="current-password" />
          <button className="mt-6 w-full rounded-full bg-[#17364d] px-5 py-3 text-white">Enter BeLoved</button>
        </form>
        <form action={login} className="rounded-[2rem] border border-[#17364d]/10 bg-white/60 p-6">
          <p className="text-sm font-medium">Prefer a magic link?</p>
          <input className="mt-3 w-full rounded-xl border border-[#17364d]/15 bg-white px-4 py-3" name="email" type="email" placeholder="you@example.com" required aria-label="Email for magic link" />
          <button className="mt-3 w-full rounded-full border border-[#17364d]/20 px-5 py-3 text-sm">Send magic link</button>
        </form>
        {params.sent && <p className="rounded-2xl bg-[#eef2ed] p-4 text-sm">Check your email for the secure BeLoved link.</p>}
        {params.error && <p className="rounded-2xl bg-[#f7e8e5] p-4 text-sm text-red-800">{params.error}</p>}
        <p className="text-center text-sm opacity-60">New here? <Link href="/signup" className="underline">Create your account</Link></p>
      </div>
    </main>
  )
}
