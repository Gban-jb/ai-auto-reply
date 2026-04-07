const ESTIMATED_REVENUE_BY_SCENARIO = {
  'kindred-technology': 4800,
  'baker-underwood-law': 2500,
  walker360: 7200,
  'slt-consulting': 1800,
  'pathway-consult': 950,
  'veda-cuisine': 160,
  'society-salon': 280,
  'mr-rooter': 650,
  'inspiring-smiles': 425,
  default: 500,
}

const BOOKED_PATTERNS = [
  /\bbook (?:me )?in\b/i,
  /\bbook it under\b/i,
  /\bplease send me the details\b/i,
  /\bworks (?:for me|great|well)\b/i,
  /\bthat works\b/i,
  /\bplease hold\b/i,
  /\bhold that spot\b/i,
  /\bplease reserve\b/i,
  /\breserve (?:that|the|it)\b/i,
  /\bconfirm(?:ed)?\b/i,
  /\block (?:it )?in\b/i,
  /\bsend someone (?:out )?(?:today|this afternoon|tomorrow)\b/i,
]

const AI_BOOKED_PATTERNS = [
  /\bappointment booked\b/i,
  /\breservation confirmed\b/i,
  /\bservice call booked\b/i,
  /\bconsultation scheduled\b/i,
  /\bdiscovery call booked\b/i,
  /\bscheduled\b/i,
  /\breserved\b/i,
]

export function getEstimatedRevenueValue(scenarioId) {
  return ESTIMATED_REVENUE_BY_SCENARIO[scenarioId] || ESTIMATED_REVENUE_BY_SCENARIO.default
}

export function formatRevenueCompact(value) {
  if (!value) return '$0'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}

function getMessageText(message) {
  return (message?.content || message?.text || '').trim()
}

function getMessageRole(message) {
  return message?.role || message?.sender || ''
}

export function isBookedConversation(messages = []) {
  if (!Array.isArray(messages) || messages.length < 3) {
    return false
  }

  const userConfirmed = messages.some((message) => {
    if (getMessageRole(message) !== 'user') return false
    const text = getMessageText(message)
    return BOOKED_PATTERNS.some((pattern) => pattern.test(text))
  })

  const assistantConfirmed = messages.some((message) => {
    const role = getMessageRole(message)
    if (role !== 'assistant' && role !== 'ai') return false
    const text = getMessageText(message)
    return AI_BOOKED_PATTERNS.some((pattern) => pattern.test(text))
  })

  return userConfirmed || assistantConfirmed
}

export function getConversationRevenueSaved({ messages = [], scenarioId }) {
  if (!isBookedConversation(messages)) {
    return 0
  }

  return getEstimatedRevenueValue(scenarioId)
}

export function getDerivedLeadStatus({ messages = [], status }) {
  if (isBookedConversation(messages)) {
    return 'booked'
  }

  if (status === 'active' || messages.length > 1) {
    return 'active'
  }

  return 'new'
}
