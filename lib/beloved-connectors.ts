import { createClient } from '@/lib/supabase/client'

export type SignalInference = {
  id: string
  feed_item_id: string
  ai_classification: string | null
  ai_confidence: number | null
  ai_model: string
  ai_prompt_version: string
  inferred_domain: string | null
  inferred_urgency: string | null
  suggested_next_actions: string[]
  explainable_reasons: string[]
  human_verified: boolean
  verified_by: string | null
  verified_at: string | null
}

const supabase = createClient()

export async function classifySignal(feedItemId: string) {
  const { data, error } = await supabase.functions.invoke('classify-signal', {
    body: { feed_item_id: feedItemId },
  })
  if (error) throw error
  return data as { inference: SignalInference; human_verification_required: true }
}

export async function reviewSignal(
  inferenceId: string,
  decision: 'confirm' | 'reject',
  notes?: string,
) {
  const { data, error } = await supabase.functions.invoke('review-signal', {
    body: { inference_id: inferenceId, decision, notes },
  })
  if (error) throw error
  return data
}

export async function createFundingCheckout(fundingIntentId: string) {
  const { data, error } = await supabase.functions.invoke(
    'create-checkout-session',
    { body: { funding_intent_id: fundingIntentId } },
  )
  if (error) throw error
  if (!data?.url) throw new Error('Stripe Checkout URL was not returned')
  window.location.assign(data.url)
}
