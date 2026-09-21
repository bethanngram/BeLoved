import { createClient } from '@/lib/supabase/server'
import { createBeLovedResponse } from '@/lib/openai'
import { AGENTS, selectAgents, type AgentResult } from './agents'

type MemberContext = { profile: Record<string, unknown> | null; life: Record<string, unknown> | null; settings: Record<string, unknown> | null; directory: Record<string, unknown> | null; formation: unknown[]; growth: unknown[]; people: unknown[]; asks: unknown[]; offers: unknown[]; world: unknown[]; thread: unknown[] }

export async function buildMemberContext(profileId: string): Promise<MemberContext> {
  const supabase = await createClient()
  const [{ data: profile }, { data: life }, { data: settings }, { data: directory }, { data: formation }, { data: growth }, { data: people }, { data: asks }, { data: offers }, { data: world }, { data: thread }] = await Promise.all([
    supabase.from('profiles').select('id,name,bio,location_text,membership_tier,account_status').eq('id', profileId).maybeSingle(),
    supabase.from('life').select('life_stage,current_season,vision,priorities,current_place,future_place,reflection').eq('profile_id', profileId).maybeSingle(),
    supabase.from('member_settings').select('timezone,morning_start,evening_start,night_start,privacy_show_profile,privacy_show_trust,privacy_show_asks,privacy_show_offers').eq('profile_id', profileId).maybeSingle(),
    supabase.from('member_directory').select('display_name,city_region,interests,skills,help_offers,professional_capability,communities').eq('profile_id', profileId).maybeSingle(),
    supabase.from('formation').select('id,title,formation_area,member_status,started_at,completed_at').eq('profile_id', profileId).order('updated_at', { ascending: false }).limit(8),
    supabase.from('growth').select('id,title,growth_area,capability,evidence,contribution,status,started_at,completed_at').eq('profile_id', profileId).order('updated_at', { ascending: false }).limit(8),
    supabase.from('people').select('id,name,relationship,relationship_strength,trust_level,is_family,is_mentor,is_mentee,is_community').eq('user_id', profileId).order('updated_at', { ascending: false }).limit(12),
    supabase.from('asks').select('id,title,category,ask_type,urgency,status,visibility').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(8),
    supabase.from('offers').select('id,title,category,offer_type,entrustable,status,visibility').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(8),
    supabase.from('world').select('id,record_type,name,location,capacity,contribution,stewardship_interest').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(8),
    supabase.from('personal_thread_entries').select('entry_key,entry_title,entry_body,reflection_text,completed,reflected_at').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(8),
  ])
  return { profile, life, settings, directory, formation: formation ?? [], growth: growth ?? [], people: people ?? [], asks: asks ?? [], offers: offers ?? [], world: world ?? [], thread: thread ?? [] }
}

export async function orchestrate(profileId: string, input: string) {
  const context = await buildMemberContext(profileId)
  const selected = selectAgents(input)
  const results: AgentResult[] = selected.map((agent) => ({ agent, perspective: AGENTS[agent].purpose, confidence: 70 }))
  let response = ''
  let aiAvailable = Boolean(process.env.OPENAI_API_KEY)

  if (aiAvailable) {
    try {
      response = await createBeLovedResponse(JSON.stringify({ member: context, memberQuestion: input, selectedAgents: results }), 'You are BeLoved intelligence: a quiet concierge for lifelong Christian formation. Use only the authorized member context. Never claim to know God’s will or make spiritual pronouncements. Never invent facts, people, needs, opportunities, outcomes, institutions, or Scripture claims. Preserve privacy. Personalize relevance, never truth. Respect diverse Christian traditions and human agency. Offer one meaningful next step when appropriate.')
    } catch (error) {
      console.error('BeLoved OpenAI orchestration failed:', error)
      aiAvailable = false
    }
  }

  return { mode: 'adaptive', center: 'Christ, love, unity, stewardship, community, service', agents: results, aiAvailable, response, instruction: 'Meet the member where they are. Personalize relevance, never personalize truth. Preserve privacy. Offer one meaningful next faithful step.' }
}
