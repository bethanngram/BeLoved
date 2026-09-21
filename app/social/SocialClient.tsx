'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExternalLink, RefreshCw, Rss, ShieldCheck, Unplug } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Provider = 'linkedin' | 'instagram' | 'youtube'

type FeedItem = {
  id: string
  source_id: string | null
  provider: string
  external_id: string
  external_url: string | null
  author_name: string | null
  author_handle: string | null
  author_avatar_url: string | null
  title: string | null
  body: string | null
  excerpt: string | null
  image_url: string | null
  content_type: string
  published_at: string | null
  fetched_at: string
  visibility: string
}

type Connection = {
  id: string
  provider: string
  connector_type: string | null
  status: string
  connected_at: string | null
  last_synced_at: string | null
  metadata?: Record<string, unknown>
}

type ProviderStatus = {
  provider: Provider
  label: string
  category: string
  configured: boolean
  requiredSecrets: string[]
  missingSecrets: string[]
  redirectUri: string
  requiredScopes: string[]
  approvalNote: string
}

const providers: Array<{ id: Provider; label: string; description: string }> = [
  { id: 'linkedin', label: 'LinkedIn', description: 'Bring professional presence into your BeLoved life without making BeLoved another social network.' },
  { id: 'instagram', label: 'Instagram', description: 'Bring creative work and public posts into your personal thread and community context.' },
  { id: 'youtube', label: 'YouTube', description: 'Bring your channel and published work into one living record.' },
]

export default function SocialClient({
  initialFeed,
  initialConnections,
  connected,
  connectionError,
}: {
  initialFeed: FeedItem[]
  initialConnections: Connection[]
  connected: string | null
  connectionError: string | null
}) {
  const supabase = useMemo(() => createClient(), [])
  const [connections, setConnections] = useState(initialConnections)
  const [feed, setFeed] = useState(initialFeed)
  const [statuses, setStatuses] = useState<ProviderStatus[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState(connectionError ? `Connection returned: ${connectionError}` : connected ? `${connected} is connected to BeLoved.` : '')
  const [rssUrl, setRssUrl] = useState('')
  const [rssLabel, setRssLabel] = useState('')

  const functionUrl = (name: string, query = '') => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://srrstsgqmjulwyqfgmdv.supabase.co'
    return `${base}/functions/v1/${name}${query}`
  }

  const authorizedFetch = useCallback(async (url: string, init: RequestInit = {}) => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new Error('Your BeLoved session has expired. Please sign in again.')
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${token}`)
    headers.set('apikey', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_LolpTHZsFbjPR8qNOm0G2Q_1NKp9kb8')
    return fetch(url, { ...init, headers })
  }, [supabase])

  const loadStatus = useCallback(async () => {
    try {
      const response = await authorizedFetch(functionUrl('integration-status'))
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to check connection status.')
      setStatuses(payload.providers || [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to check connection status.')
    }
  }, [authorizedFetch])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  async function connect(provider: Provider) {
    setBusy(provider)
    setMessage('')
    try {
      const response = await authorizedFetch(functionUrl('oauth-connect', `?action=authorize&provider=${encodeURIComponent(provider)}`))
      const payload = await response.json()
      if (!response.ok || !payload.authorizeUrl) {
        throw new Error(payload.error || payload.detail || 'This connection is not configured yet.')
      }
      window.location.assign(payload.authorizeUrl)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start the connection.')
      setBusy(null)
    }
  }

  async function sync(provider: string) {
    setBusy(provider)
    setMessage('')
    try {
      const response = await authorizedFetch(functionUrl('oauth-connect', `?action=sync&provider=${encodeURIComponent(provider)}`))
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Synchronization failed.')
      setMessage(`${provider} synchronized successfully.`)
      window.location.reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Synchronization failed.')
      setBusy(null)
    }
  }

  async function revoke(provider: string) {
    if (!window.confirm(`Disconnect ${provider} from BeLoved?`)) return
    setBusy(provider)
    setMessage('')
    try {
      const response = await authorizedFetch(functionUrl('oauth-connect', `?action=revoke&provider=${encodeURIComponent(provider)}`))
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Disconnect failed.')
      setConnections(current => current.filter(connection => connection.provider !== provider))
      setFeed(current => current.filter(item => item.provider !== provider))
      setMessage(`${provider} is disconnected.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Disconnect failed.')
    } finally {
      setBusy(null)
    }
  }

  async function addRss() {
    if (!rssUrl.trim()) return
    setBusy('rss')
    setMessage('')
    try {
      const { data, error } = await supabase.functions.invoke('people-feed-sync', {
        body: { feedUrl: rssUrl.trim(), label: rssLabel.trim() || undefined },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setRssUrl('')
      setRssLabel('')
      setMessage('Feed connected and synchronized.')
      window.location.reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to add this feed.')
    } finally {
      setBusy(null)
    }
  }

  async function refreshRss() {
    setBusy('rss-sync')
    setMessage('')
    try {
      const { data, error } = await supabase.functions.invoke('people-feed-sync')
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setMessage('Community feeds refreshed.')
      window.location.reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to refresh feeds.')
    } finally {
      setBusy(null)
    }
  }

  const connectedProviders = new Set(connections.filter(item => item.status === 'active').map(item => item.provider))
  const configuredByProvider = new Map(statuses.map(item => [item.provider, item]))
  const allItems = feed.slice().sort((a, b) => new Date(b.published_at || b.fetched_at).getTime() - new Date(a.published_at || a.fetched_at).getTime())

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <section className="border-b border-[#17364d]/10 py-12 lg:py-16">
        <p className="text-[9px] uppercase tracking-[.3em] text-[#557060]">SOCIAL · COMMUNITY</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <h1 className="font-serif text-5xl font-light leading-[1.03] sm:text-6xl">Your social life, brought into relationship.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#17364d]/65">BeLoved does not replace the places where you already live online. It gives those relationships a trustworthy home inside your larger story of formation, people, work, creativity, and service.</p>
          </div>
          <div className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]">
            <p className="text-[9px] uppercase tracking-[.28em] opacity-45">The principle</p>
            <p className="mt-4 font-serif text-3xl font-light">Connection before consumption.</p>
            <p className="mt-4 text-sm leading-6 opacity-60">Imported content remains attributed to its source. BeLoved stores only what is needed to make the relationship useful.</p>
          </div>
        </div>
      </section>

      {message && <div className="mt-6 rounded-2xl border border-[#17364d]/10 bg-white p-4 text-sm">{message}</div>}

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {providers.map(({ id, label, description }) => {
          const status = configuredByProvider.get(id)
          const connectedNow = connectedProviders.has(id)
          return (
            <article key={id} className="rounded-[2rem] bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f4ed] text-xs font-semibold">{label.slice(0, 1)}</div><h2 className="text-xl font-light">{label}</h2></div>
                <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[.15em] ${connectedNow ? 'bg-[#e8f0e9]' : status?.configured ? 'bg-[#f3efe4]' : 'bg-[#f7f4ed]'}`}>
                  {connectedNow ? 'Connected' : status?.configured ? 'Ready' : 'Needs setup'}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 opacity-55">{description}</p>
              {status?.missingSecrets?.length ? <p className="mt-4 rounded-xl bg-[#f7f4ed] p-3 text-xs leading-5 opacity-60">Waiting on: {status.missingSecrets.join(', ')}</p> : null}
              <div className="mt-5 flex flex-wrap gap-2">
                {!connectedNow && <button onClick={() => void connect(id)} disabled={busy === id || !status?.configured} className="rounded-full bg-[#17364d] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-35">{busy === id ? 'Opening…' : 'Connect'}</button>}
                {connectedNow && <><button onClick={() => void sync(id)} disabled={busy === id} className="rounded-full border border-[#17364d]/15 px-4 py-2 text-sm"><RefreshCw size={14} className="mr-1 inline" />{busy === id ? 'Syncing…' : 'Sync now'}</button><button onClick={() => void revoke(id)} disabled={busy === id} className="rounded-full border border-[#17364d]/15 px-4 py-2 text-sm"><Unplug size={14} className="mr-1 inline" />Disconnect</button></>}
              </div>
              {status?.redirectUri && <details className="mt-4"><summary className="cursor-pointer text-xs opacity-45">Connection details</summary><p className="mt-2 break-all text-[11px] leading-5 opacity-45">Redirect URI: {status.redirectUri}</p><p className="mt-2 text-[11px] leading-5 opacity-45">Scopes: {status.requiredScopes.join(', ')}</p></details>}
            </article>
          )
        })}
      </section>

      <section className="mt-8 rounded-[2rem] border border-[#17364d]/10 bg-white p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Open feeds</p><h2 className="mt-2 font-serif text-3xl font-light">Public feeds and newsletters</h2><p className="mt-3 max-w-2xl text-sm leading-6 opacity-55">You can also bring an RSS or Atom feed into BeLoved when an account does not provide an OAuth connection.</p></div>
          <button onClick={() => void refreshRss()} disabled={busy === 'rss-sync'} className="rounded-full border border-[#17364d]/15 px-4 py-2 text-sm"><RefreshCw size={14} className="mr-1 inline" />Refresh feeds</button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input value={rssUrl} onChange={e => setRssUrl(e.target.value)} placeholder="https://example.com/feed.xml" className="rounded-xl border border-[#17364d]/10 bg-[#f7f4ed] px-4 py-3 text-sm outline-none" />
          <input value={rssLabel} onChange={e => setRssLabel(e.target.value)} placeholder="Feed name (optional)" className="rounded-xl border border-[#17364d]/10 bg-[#f7f4ed] px-4 py-3 text-sm outline-none" />
          <button onClick={() => void addRss()} disabled={busy === 'rss'} className="rounded-full bg-[#17364d] px-5 py-3 text-sm text-white">{busy === 'rss' ? 'Adding…' : 'Add feed'}</button>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <aside className="rounded-[2rem] bg-[#17364d] p-7 text-[#f7f4ed]">
          <div className="flex items-center gap-3"><ShieldCheck size={18} /><h2 className="font-serif text-2xl font-light">Your connected life</h2></div>
          <div className="mt-6 space-y-3">
            {connections.map(connection => (
              <div key={connection.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3"><span className="text-sm capitalize">{connection.provider}</span><span className="text-[9px] uppercase tracking-[.18em] opacity-45">{connection.status}</span></div>
                <p className="mt-2 text-xs opacity-50">{connection.last_synced_at ? `Last synced ${new Date(connection.last_synced_at).toLocaleString()}` : 'Connected; not yet synchronized'}</p>
              </div>
            ))}
            {!connections.length && <p className="text-sm leading-6 opacity-50">No external accounts are connected yet.</p>}
          </div>
        </aside>

        <section className="rounded-[2rem] bg-white p-7">
          <div className="flex items-center justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.28em] text-[#557060]">Living feed</p><h2 className="mt-2 font-serif text-3xl font-light">What is moving through your world</h2></div><Rss size={18} className="opacity-35" /></div>
          <div className="mt-6 space-y-3">
            {allItems.map(item => (
              <article key={item.id} className="rounded-2xl bg-[#f7f4ed] p-5">
                <div className="flex items-start gap-4">
                  {item.image_url ? <img src={item.image_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white"><span className="text-[10px] uppercase tracking-[.15em] opacity-35">{item.provider}</span></div>}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="text-[9px] uppercase tracking-[.18em] opacity-40">{item.provider}</span>{item.author_name && <span className="text-xs opacity-55">{item.author_name}</span>}</div>
                    <h3 className="mt-2 text-sm font-medium">{item.title || item.excerpt || 'A shared moment'}</h3>
                    {item.excerpt && item.title && <p className="mt-1 line-clamp-3 text-sm leading-6 opacity-55">{item.excerpt}</p>}
                    <div className="mt-3 flex items-center gap-3 text-[10px] opacity-40">{item.published_at && <span>{new Date(item.published_at).toLocaleDateString()}</span>}{item.external_url && <a href={item.external_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">Open source <ExternalLink size={11} /></a>}</div>
                  </div>
                </div>
              </article>
            ))}
            {!allItems.length && <div className="rounded-2xl border border-dashed border-[#17364d]/15 p-8 text-center"><p className="font-serif text-2xl font-light">Your feed is quiet.</p><p className="mt-3 text-sm leading-6 opacity-50">Connect a social account or add a public feed. BeLoved will keep the source and relationship visible.</p></div>}
          </div>
        </section>
      </section>
    </div>
  )
}
