'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { BelovedHeader } from '@/components/BelovedHeader'

type Result = { response?: string; agents?: Array<{ agent: string; perspective: string; confidence: number }>; instruction?: string }

export default function CompanionPage() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!question.trim()) return
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: question.trim() }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The companion is unavailable.')
      setResult(data)
    } catch (err) { setError(err instanceof Error ? err.message : 'The companion is unavailable.') }
    finally { setLoading(false) }
  }

  return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader /><div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
    <section className="border-b border-[#17364d]/10 py-12"><p className="flex items-center gap-2 text-[9px] uppercase tracking-[.3em] text-[#557060]"><Sparkles size={13} /> BeLoved intelligence</p><h1 className="mt-4 font-serif text-5xl font-light leading-tight sm:text-6xl">A quieter place to notice what may matter next.</h1><p className="mt-5 max-w-2xl leading-8 opacity-65">BeLoved can connect the information you have chosen to keep here. It does not replace prayer, Scripture, trusted people, or discernment.</p></section>
    <form onSubmit={submit} className="mt-8 rounded-[2rem] bg-white p-7"><label htmlFor="question" className="text-sm font-medium">What are you carrying right now?</label><textarea id="question" value={question} onChange={e=>setQuestion(e.target.value)} rows={6} placeholder="Try: What am I learning? Where could my current capacity serve?" className="mt-4 w-full rounded-2xl border border-[#17364d]/10 bg-[#f7f4ed] px-5 py-4 outline-none" /><div className="mt-4 flex flex-wrap gap-3"><button disabled={loading || !question.trim()} className="rounded-full bg-[#17364d] px-6 py-3 text-sm text-white disabled:opacity-40">{loading ? 'Listening…' : 'Reflect with BeLoved'}</button><Link href="/profile" className="rounded-full border border-[#17364d]/10 px-5 py-3 text-sm">Review your sources</Link></div></form>
    {error && <div className="mt-5 rounded-2xl border border-[#a8863a]/25 bg-white p-5 text-sm">{error}</div>}
    {result && <section className="mt-8 space-y-5"><article className="rounded-[2rem] bg-[#17364d] p-8 text-[#f7f4ed]"><p className="text-[9px] uppercase tracking-[.28em] opacity-45">Reflection</p><p className="mt-5 whitespace-pre-wrap font-serif text-2xl font-light leading-9">{result.response || 'No generated reflection was returned.'}</p></article><div className="grid gap-4 md:grid-cols-2">{(result.agents || []).map(agent=><article key={agent.agent} className="rounded-3xl bg-white p-6"><p className="text-[9px] uppercase tracking-[.22em] text-[#557060]">{agent.agent}</p><p className="mt-3 text-sm leading-6 opacity-60">{agent.perspective}</p><p className="mt-4 text-[10px] uppercase tracking-[.2em] opacity-35">Context confidence · {agent.confidence}%</p></article>)}</div><div className="rounded-2xl border border-[#17364d]/10 bg-white p-5 text-sm leading-6 opacity-65">{result.instruction}</div><Link href="/journey" className="inline-flex items-center gap-2 rounded-full border border-[#17364d]/10 bg-white px-5 py-3 text-sm">Carry one next step into Becoming <ArrowRight size={14} /></Link></section>}
  </div></main>
}
