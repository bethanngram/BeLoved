import { login } from './actions'

export default function LoginPage() {
  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d] grid place-items-center p-6"><form action={login} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm"><p className="text-xs uppercase tracking-[.3em] opacity-50">Enter BeLoved</p><h1 className="mt-4 text-4xl font-light">Continue your journey.</h1><p className="mt-4 opacity-65">Sign in to continue where you left off.</p><label className="mt-8 block text-sm" htmlFor="email">Email</label><input className="mt-2 w-full rounded-xl border border-[#17364d]/15 px-4 py-3" id="email" name="email" type="email" required/><button className="mt-5 w-full rounded-full bg-[#17364d] px-5 py-3 text-white">Send magic link</button></form></main>
}
