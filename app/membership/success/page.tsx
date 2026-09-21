import Link from 'next/link'

export default function MembershipSuccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-6 text-[#17364d]">
      <div className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[.3em] opacity-50">BeLoved</p>
        <h1 className="mt-5 text-5xl font-light">Welcome into the journey.</h1>
        <p className="mt-5 leading-7 opacity-65">
          Your Stripe Checkout session completed. BeLoved can now connect the subscription to your member record through the Stripe webhook layer.
        </p>
        <Link className="mt-8 inline-flex rounded-full bg-[#17364d] px-6 py-3 text-sm text-white" href="/journey">
          Continue to BeLoved
        </Link>
      </div>
    </main>
  )
}
