import Link from 'next/link'
import { signup } from './actions'

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4ed] p-6 text-[#17364d]">
      <form action={signup} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[.3em] opacity-50">BeLoved</p>
        <h1 className="mt-4 font-serif text-4xl font-light">Come as you are.</h1>
        <p className="mt-4 leading-7 opacity-60">Create your member account. You do not have to prove anything here.</p>
        <label className="mt-8 block text-sm" htmlFor="name">Name</label>
        <input className="mt-2 w-full rounded-xl border border-[#17364d]/15 px-4 py-3" id="name" name="name" required autoComplete="name" />
        <label className="mt-5 block text-sm" htmlFor="email">Email</label>
        <input className="mt-2 w-full rounded-xl border border-[#17364d]/15 px-4 py-3" id="email" name="email" type="email" required autoComplete="email" />
        <label className="mt-5 block text-sm" htmlFor="password">Password</label>
        <input className="mt-2 w-full rounded-xl border border-[#17364d]/15 px-4 py-3" id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
        <p className="mt-2 text-xs opacity-45">At least 8 characters.</p>
        <button className="mt-6 w-full rounded-full bg-[#17364d] px-5 py-3 text-white">Create my account</button>
        <p className="mt-5 text-center text-sm opacity-55">Already a member? <Link href="/login" className="underline">Enter BeLoved</Link></p>
      </form>
    </main>
  )
}
