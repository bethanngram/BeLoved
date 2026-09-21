const OPENAI_API_URL = 'https://api.openai.com/v1/responses'

export async function createBeLovedResponse(input: string, instructions?: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      instructions: instructions || 'You are the BeLoved formation companion. Be thoughtful, grounded, compassionate, and respectful of diverse Christian traditions.',
      input,
      max_output_tokens: 1200,
    }),
  })

  if (!response.ok) throw new Error(`OpenAI request failed with status ${response.status}`)

  const data = await response.json()
  return typeof data.output_text === 'string' ? data.output_text : ''
}
