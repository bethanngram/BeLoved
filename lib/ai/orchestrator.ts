import { createClient } from '@/lib/supabase/server'
import { AGENTS, selectAgents, type AgentResult } from './agents'

export async function buildMemberContext(profileId: string) {
  const supabase = await createClient()
  const [{ data: profile }, { data: preferences }, { data: moments }, { data: encounters }] = await Promise.all([
    supabase.from('profiles').select('name,tier,status').eq('id', profileId).maybeSingle(),
    supabase.from('profile_preferences').select('*').eq('profile_id', profileId).maybeSingle(),
    supabase.from('journey_moments').select('*').eq('profile_id', profileId).order('opened_at', { ascending: false }).limit(8),
    supabase.from('formation_encounters').select('*').eq('profile_id', profileId).order('offered_at', { ascending: false }).limit(8),
  ])
  return { profile, preferences, moments, encounters }
}

export async function orchestrate(profileId: string, input: string) {
  const context = await buildMemberContext(profileId)
  const selected = selectAgents(input)
  const results: AgentResult[] = selected.map(agent => ({
    agent,
    perspective: AGENTS[agent].purpose,
    confidence: 70,
  }))

  return {
    mode: 'adaptive',
    center: 'Christ, love, unity, stewardship, community, service',
    agents: results,
    memberContext: context,
    instruction: 'Meet the member where they are. Personalize relevance, never personalize truth. Preserve privacy. Offer one meaningful next step.',
  }
}
