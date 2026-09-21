import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BelovedHeader } from '@/components/BelovedHeader'
import SocialClient from './SocialClient'

export const dynamic = 'force-dynamic'

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const profileId = claims?.claims?.sub ? String(claims.claims.sub) : null
  if (!profileId) redirect('/login')

  const [{ data: feed }, { data: connections }] = await Promise.all([
    supabase
      .from('social_feed_items')
      .select('id,source_id,provider,external_id,external_url,author_name,author_handle,author_avatar_url,title,body,excerpt,image_url,content_type,published_at,fetched_at,visibility')
      .eq('profile_id', profileId)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(60),
    supabase
      .from('connections')
      .select('id,provider,connector_type,status,connected_at,last_synced_at,metadata')
      .eq('profile_id', profileId)
      .order('connected_at', { ascending: false }),
  ])

  const params = await searchParams
  const connected = typeof params.connected === 'string' ? params.connected : null
  const error = typeof params.connection_error === 'string' ? params.connection_error : null

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]">
      <BelovedHeader />
      <SocialClient
        initialFeed={feed || []}
        initialConnections={connections || []}
        connected={connected}
        connectionError={error}
      />
    </main>
  )
}
