// In-memory store — resets on server restart.
// Swap with Vercel KV or Redis for production.

import {
  getConversationRevenueSaved,
  getDerivedLeadStatus,
} from '@/lib/revenue'

const conversations = new Map()
const leads = new Map()

function buildLeadSnapshot(phone) {
  const lead = leads.get(phone) || {}
  const messages = conversations.get(phone) || []
  const status = getDerivedLeadStatus({
    messages,
    status: lead.status,
  })
  const revenueSaved = getConversationRevenueSaved({
    messages,
    scenarioId: lead.scenarioId,
  })

  return {
    ...lead,
    status,
    revenueSaved,
  }
}

export function getConversation(phone) {
  return conversations.get(phone) || []
}

export function addMessage(phone, role, content) {
  const history = conversations.get(phone) || []
  const updated = [...history, { role, content, timestamp: Date.now() }]
  conversations.set(phone, updated)
  return updated
}

export function getAllConversations() {
  const result = []
  for (const [phone, messages] of conversations.entries()) {
    const lead = buildLeadSnapshot(phone)
    result.push({
      phone,
      messages,
      messageCount: messages.length,
      lastUpdated: messages.length > 0
        ? messages[messages.length - 1].timestamp
        : 0,
      lastMessageTime: messages.length > 0
        ? messages[messages.length - 1].timestamp
        : 0,
      leadStatus: lead.status || 'new',
      businessName: lead.businessName || '',
      scenarioId: lead.scenarioId || '',
      missedCallAt: lead.missedCallAt || null,
      revenueSaved: lead.revenueSaved || 0,
    })
  }
  return result.sort((a, b) => b.lastUpdated - a.lastUpdated)
}

export function saveLead(phone, data) {
  const existing = leads.get(phone) || {}
  leads.set(phone, { ...existing, ...data, updatedAt: Date.now() })
}

export function getLead(phone) {
  return buildLeadSnapshot(phone)
}

export function getAllLeads() {
  return Array.from(leads.keys())
    .map((phone) => buildLeadSnapshot(phone))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

export function clearConversation(phone) {
  conversations.delete(phone)
  leads.delete(phone)
  return true
}

export function getStats() {
  let totalMessages = 0
  for (const msgs of conversations.values()) {
    totalMessages += msgs.length
  }
  const allLeads = Array.from(leads.keys()).map((phone) => buildLeadSnapshot(phone))

  const uniqueClients = new Set(
    allLeads
      .map((lead) => lead.businessName || lead.scenarioId)
      .filter(Boolean)
  )

  return {
    totalLeads: leads.size,
    totalMessages,
    activeConversations: allLeads.filter(l => l.status === 'active').length,
    newLeads: allLeads.filter(l => l.status === 'new').length,
    bookedConversations: allLeads.filter(l => l.status === 'booked').length,
    activeClients: uniqueClients.size,
    totalRevenueSaved: allLeads.reduce((sum, lead) => sum + (lead.revenueSaved || 0), 0),
  }
}
