export type AgentName = 'journey' | 'scripture' | 'reflection' | 'formation' | 'stewardship' | 'love' | 'community' | 'discernment' | 'unity' | 'content' | 'admin'

export type AgentResult = { agent: AgentName; perspective: string; confidence: number }

export const AGENTS: Record<AgentName, { purpose: string; signals: string[] }> = {
  journey: { purpose: 'Understand where the member is and identify the next faithful step.', signals: ['where am i', 'next', 'journey', 'season'] },
  scripture: { purpose: 'Connect questions with Scripture and Christian wisdom while distinguishing interpretation from Scripture.', signals: ['bible', 'scripture', 'verse', 'jesus', 'prayer', 'gospel'] },
  reflection: { purpose: 'Help the member notice, name, and explore what is happening within them.', signals: ['feel', 'notice', 'reflect', 'struggle', 'journal'] },
  formation: { purpose: 'Design adaptive formation experiences matched to the member.', signals: ['learn', 'formation', 'practice', 'study'] },
  stewardship: { purpose: 'Explore what has been entrusted and how it can be faithfully stewarded.', signals: ['steward', 'work', 'time', 'talent', 'resource', 'money'] },
  love: { purpose: 'Translate formation into loving relationships and action.', signals: ['forgive', 'love', 'relationship', 'reconcile', 'serve'] },
  community: { purpose: 'Find meaningful belonging, groups, conversations, and service.', signals: ['community', 'group', 'belong', 'church', 'people'] },
  discernment: { purpose: 'Surface assumptions, values, tensions, possibilities, and consequences.', signals: ['decide', 'discern', 'choice', 'direction', 'calling'] },
  unity: { purpose: 'Advance Christian unity and ecumenical understanding rooted in John 17:21.', signals: ['unity', 'ecumenical', 'tradition', 'denomination', 'one'] },
  content: { purpose: 'Connect the member with relevant BeLoved content and experiences.', signals: ['article', 'book', 'video', 'resource', 'read'] },
  admin: { purpose: 'Interpret platform evidence for authorized administrators.', signals: ['members', 'analytics', 'activity', 'platform'] },
}

export function selectAgents(input: string): AgentName[] {
  const q = input.toLowerCase()
  const matches = (Object.entries(AGENTS) as [AgentName, { signals: string[] }][])
    .map(([name, agent]) => ({ name, score: agent.signals.reduce((n, s) => n + (q.includes(s) ? 1 : 0), 0) }))
    .filter(x => x.score > 0).sort((a, b) => b.score - a.score).map(x => x.name)
  return matches.length ? matches.slice(0, 4) : ['journey', 'reflection', 'formation']
}
