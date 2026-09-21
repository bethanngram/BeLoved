'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void fetch('/api/telemetry/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: error.message, digest: error.digest, path: window.location.pathname }),
      keepalive: true,
    }).catch(() => undefined)
  }, [error])

  return <main className="grid min-h-screen place-items-center bg-[#f7f4ed] px-6 text-[#17364d]"><div className="max-w-xl text-center"><p className="text-[9px] uppercase tracking-[.3em] text-[#557060]">BeLoved</p><h1 className="mt-5 font-serif text-5xl font-light">Something interrupted the journey.</h1><p className="mt-5 leading-7 opacity-60">The problem has been recorded without exposing private member information.</p><button onClick={reset} className="mt-8 rounded-full bg-[#17364d] px-6 py-3 text-sm text-white">Return to the journey</button></div></main>
}
