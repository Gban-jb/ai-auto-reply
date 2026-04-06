import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    'Missing OPENAI_API_KEY in .env.local\n' +
    'Get yours at https://platform.openai.com/api-keys'
  )
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

function buildSystemPrompt(businessConfig) {
  const name     = businessConfig?.name     || process.env.BUSINESS_NAME
  const industry = businessConfig?.industry || process.env.BUSINESS_INDUSTRY
  const context  = businessConfig?.context  || process.env.BUSINESS_CONTEXT

  return `You are a helpful, friendly assistant for ${name}, a ${industry} business.

About this business: ${context}

Situation: A customer just called the business phone and the call went unanswered. You are now texting them back on behalf of the owner via SMS.

Your rules:
1. Be warm and natural — never robotic or scripted
2. Keep every reply SHORT: 2 sentences maximum
3. Each message should do ONE thing: answer their question, OR collect their name/address, OR help schedule an appointment
4. Always end with a brief question to keep the conversation going
5. Do NOT say you are an AI unless the customer asks directly
6. Maximum one emoji per message
7. Write as the business owner, not as "AI Assistant"
8. Be genuinely helpful — solve their actual problem`
}

export async function generateReply(conversationHistory, businessConfig) {
  const systemPrompt = buildSystemPrompt(businessConfig)

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
  ]

  console.log(
    '🧠 OpenAI', MODEL, '|',
    conversationHistory.length, 'messages in context'
  )

  const started = Date.now()

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 150,
      temperature: 0.75,
    })

    const reply = response.choices[0].message.content.trim()

    console.log('✅ OpenAI responded in', (Date.now() - started) + 'ms')
    console.log('   Reply:', reply)

    return reply

  } catch (error) {
    console.error('❌ OpenAI error:', error.message)

    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key — check your OPENAI_API_KEY in .env.local')
    }
    if (error.status === 429) {
      throw new Error('OpenAI quota exceeded — check usage at platform.openai.com')
    }
    throw new Error('AI generation failed: ' + error.message)
  }
}
