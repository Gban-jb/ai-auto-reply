import {
  buildAvailability,
  findAppointmentConflict,
  formatDateLabel,
  formatTimeLabel,
  getBookingProfile,
  getDayRange,
  getSuggestedSlots,
  toTimestamp,
} from '@/lib/calendar'
import { SCENARIOS, getScenarioBySlug } from '@/lib/scenarios'

const conversations = new Map()
const leads = new Map()
const appointments = new Map()

let preventedConflicts = 0
let hasSeededDemo = false

function getScenarioForFilters(filters = {}) {
  if (filters.scenarioId) {
    return getScenarioBySlug(filters.scenarioId)
  }

  if (filters.businessName) {
    return SCENARIOS.find((scenario) => scenario.businessName === filters.businessName) || null
  }

  return null
}

function normalizeFilters(filters = {}) {
  const scenario = getScenarioForFilters(filters)

  return {
    phone: filters.phone || '',
    scenarioId: filters.scenarioId || scenario?.id || '',
    businessName: filters.businessName || scenario?.businessName || '',
  }
}

function matchesLead(lead = {}, filters = {}) {
  const normalized = normalizeFilters(filters)

  if (normalized.phone && lead.phone !== normalized.phone) {
    return false
  }

  if (normalized.scenarioId && lead.scenarioId !== normalized.scenarioId) {
    return false
  }

  if (normalized.businessName && lead.businessName !== normalized.businessName) {
    return false
  }

  return true
}

function buildConversationRecord(phone, messages = []) {
  const lead = leads.get(phone) || {}
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

  return {
    phone,
    lead,
    messages,
    messageCount: messages.length,
    lastUpdated: lastMessage?.timestamp || lead.updatedAt || 0,
    lastMessage: lastMessage?.content || '',
    lastMessageTime: lastMessage?.timestamp || lead.updatedAt || 0,
    leadStatus: lead.status || 'new',
    businessName: lead.businessName || '',
    customerName: lead.customerName || '',
    scenarioId: lead.scenarioId || '',
    missedCallAt: lead.missedCallAt || null,
  }
}

function decorateAppointment(appointment) {
  return {
    ...appointment,
    startLabel: formatTimeLabel(appointment.startTime),
    endLabel: formatTimeLabel(appointment.endTime),
    dateLabel: formatDateLabel(appointment.startTime, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    dateKey: formatDateLabel(appointment.startTime, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }),
  }
}

function addSeedConversation(phone, messageSeed) {
  conversations.set(
    phone,
    messageSeed.map((message) => ({
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    }))
  )
}

function createSeedAppointment(data) {
  appointments.set(data.id, data)
}

function ensureDemoSeedData() {
  if (hasSeededDemo) {
    return
  }

  if (conversations.size > 0 || leads.size > 0 || appointments.size > 0) {
    hasSeededDemo = true
    return
  }

  hasSeededDemo = true

  const scenario = getScenarioBySlug('mr-rooter')
  if (!scenario) {
    return
  }

  const now = Date.now()
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tomorrowStart = new Date(tomorrow)
  tomorrowStart.setHours(10, 0, 0, 0)

  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(11, 30, 0, 0)

  const callers = [
    {
      phone: '(256) 555-0131',
      lead: {
        customerName: 'Sarah Parker',
        address: '124 Willow Bend Dr, Huntsville, AL',
        serviceType: 'Burst Pipe Repair',
        priority: 'emergency',
        status: 'active',
        queueStatus: 'waiting',
        missedCallAt: now - (42 * 60 * 1000),
        lastReplyAt: now - (35 * 60 * 1000),
      },
      messages: [
        {
          role: 'assistant',
          content: 'Sorry we missed your call. Is this a leak, clog, or water heater issue?',
          timestamp: now - (42 * 60 * 1000),
        },
        {
          role: 'user',
          content: 'My kitchen pipe burst and water is everywhere.',
          timestamp: now - (41 * 60 * 1000),
        },
        {
          role: 'assistant',
          content: 'We can help fast. What is the service address so we can dispatch the right tech?',
          timestamp: now - (40 * 60 * 1000),
        },
      ],
    },
    {
      phone: '(256) 555-0146',
      lead: {
        customerName: 'Marcus Reed',
        address: '88 Summer Trace Ln, Madison, AL',
        serviceType: 'Water Heater Replacement Estimate',
        priority: 'high',
        status: 'new',
        queueStatus: 'new-call',
        missedCallAt: now - (18 * 60 * 1000),
      },
      messages: [
        {
          role: 'assistant',
          content: 'Thanks for calling Mr. Rooter Plumbing of Huntsville. What plumbing issue can we help with today?',
          timestamp: now - (18 * 60 * 1000),
        },
      ],
    },
    {
      phone: '(256) 555-0190',
      lead: {
        customerName: 'Dana Brooks',
        address: '4513 Capshaw Rd, Huntsville, AL',
        serviceType: 'Drain Cleaning',
        priority: 'normal',
        status: 'booked',
        queueStatus: 'booked',
        missedCallAt: now - (3 * 60 * 60 * 1000),
        lastBookingAt: now - (2 * 60 * 60 * 1000),
      },
      messages: [
        {
          role: 'assistant',
          content: 'Thanks for calling back. We have an opening this afternoon for drain cleaning. Would 2:30 PM work?',
          timestamp: now - (2 * 60 * 60 * 1000),
        },
        {
          role: 'user',
          content: 'Yes, 2:30 works for me.',
          timestamp: now - ((2 * 60 * 60 * 1000) - (8 * 60 * 1000)),
        },
      ],
    },
  ]

  callers.forEach((caller) => {
    saveLead(caller.phone, {
      phone: caller.phone,
      scenarioId: scenario.id,
      businessName: scenario.businessName,
      industry: scenario.industry,
      ...caller.lead,
    })
    addSeedConversation(caller.phone, caller.messages)
  })

  const seededAppointments = [
    {
      id: 'apt_seed_dispatch',
      phone: '(256) 555-0000',
      scenarioId: scenario.id,
      businessName: scenario.businessName,
      customerName: 'Team Block',
      title: 'Morning Dispatch Huddle',
      serviceType: 'Team Meeting',
      address: scenario.address,
      notes: 'Daily routing and truck assignment block.',
      status: 'confirmed',
      source: 'seed',
      kind: 'internal',
      startTime: new Date(today.setHours(8, 0, 0, 0)).getTime(),
      endTime: new Date(today.setHours(8, 45, 0, 0)).getTime(),
      durationMinutes: 45,
      createdAt: now - (6 * 60 * 60 * 1000),
    },
    {
      id: 'apt_seed_water_heater',
      phone: '(256) 555-0190',
      scenarioId: scenario.id,
      businessName: scenario.businessName,
      customerName: 'Dana Brooks',
      title: 'Drain Cleaning Visit',
      serviceType: 'Drain Cleaning',
      address: '4513 Capshaw Rd, Huntsville, AL',
      notes: 'Main line slow drain inspection.',
      status: 'confirmed',
      source: 'seed',
      kind: 'customer',
      startTime: new Date(today.setHours(14, 30, 0, 0)).getTime(),
      endTime: new Date(today.setHours(16, 0, 0, 0)).getTime(),
      durationMinutes: 90,
      createdAt: now - (2 * 60 * 60 * 1000),
    },
    {
      id: 'apt_seed_tomorrow',
      phone: '(256) 555-0148',
      scenarioId: scenario.id,
      businessName: scenario.businessName,
      customerName: 'Lena Foster',
      title: 'Water Heater Replacement Estimate',
      serviceType: 'Water Heater Estimate',
      address: '2008 Meadowbrook Dr, Huntsville, AL',
      notes: 'Owner requested first available morning window.',
      status: 'confirmed',
      source: 'seed',
      kind: 'customer',
      startTime: tomorrowStart.getTime(),
      endTime: tomorrowEnd.getTime(),
      durationMinutes: 90,
      createdAt: now - (90 * 60 * 1000),
    },
  ]

  seededAppointments.forEach(createSeedAppointment)
}

export function getConversation(phone) {
  ensureDemoSeedData()
  return conversations.get(phone) || []
}

export function addMessage(phone, role, content) {
  ensureDemoSeedData()
  const history = conversations.get(phone) || []
  const updated = [...history, { role, content, timestamp: Date.now() }]
  conversations.set(phone, updated)
  return updated
}

export function getAllConversations(filters = {}) {
  ensureDemoSeedData()
  const result = []

  for (const [phone, messages] of conversations.entries()) {
    const record = buildConversationRecord(phone, messages)

    if (!matchesLead(record.lead, filters)) {
      continue
    }

    result.push(record)
  }

  return result.sort((a, b) => b.lastUpdated - a.lastUpdated)
}

export function saveLead(phone, data) {
  ensureDemoSeedData()
  const existing = leads.get(phone) || {}
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  )

  leads.set(phone, {
    ...existing,
    ...cleaned,
    phone,
    updatedAt: Date.now(),
  })
}

export function getLead(phone) {
  ensureDemoSeedData()
  return leads.get(phone) || null
}

export function getAllLeads(filters = {}) {
  ensureDemoSeedData()

  return Array.from(leads.values())
    .filter((lead) => matchesLead(lead, filters))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

export function getAppointments(filters = {}) {
  ensureDemoSeedData()

  const normalized = normalizeFilters(filters)
  const { start, end } = filters.day ? getDayRange(filters.day) : { start: null, end: null }

  return Array.from(appointments.values())
    .filter((appointment) => {
      if (normalized.phone && appointment.phone !== normalized.phone) {
        return false
      }

      if (normalized.scenarioId && appointment.scenarioId !== normalized.scenarioId) {
        return false
      }

      if (normalized.businessName && appointment.businessName !== normalized.businessName) {
        return false
      }

      if (start !== null && end !== null) {
        return appointment.startTime < end && appointment.endTime > start
      }

      return true
    })
    .sort((a, b) => a.startTime - b.startTime)
    .map(decorateAppointment)
}

export function createAppointment(data) {
  ensureDemoSeedData()

  const scenario = getScenarioForFilters(data) || getScenarioBySlug('mr-rooter')
  const profile = getBookingProfile(scenario || {})
  const startTime = toTimestamp(data.startTime)
  const durationMinutes = Number(data.durationMinutes) || profile.defaultDurationMinutes
  const endTime = data.endTime
    ? toTimestamp(data.endTime)
    : startTime + (durationMinutes * 60 * 1000)

  if (endTime <= startTime) {
    throw new Error('Appointment end time must be after start time')
  }

  const scope = {
    scenarioId: data.scenarioId || scenario?.id || '',
    businessName: data.businessName || scenario?.businessName || '',
  }

  const existingAppointments = getAppointments(scope)
  const conflict = findAppointmentConflict(existingAppointments, startTime, endTime)

  if (conflict) {
    preventedConflicts += 1

    return {
      success: false,
      conflict,
      suggestions: getSuggestedSlots({
        appointments: existingAppointments,
        dayInput: startTime,
        profile,
        durationMinutes,
      }),
    }
  }

  const appointment = {
    id: `apt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    phone: data.phone,
    scenarioId: scope.scenarioId,
    businessName: scope.businessName,
    customerName: data.customerName || 'Unknown Customer',
    title: data.title || `${data.serviceType || 'Service Visit'} for ${data.customerName || 'Customer'}`,
    serviceType: data.serviceType || 'Service Visit',
    address: data.address || '',
    notes: data.notes || '',
    status: 'confirmed',
    source: data.source || 'booking-form',
    kind: data.kind || 'customer',
    startTime,
    endTime,
    durationMinutes,
    createdAt: Date.now(),
  }

  appointments.set(appointment.id, appointment)

  saveLead(data.phone, {
    phone: data.phone,
    scenarioId: scope.scenarioId,
    businessName: scope.businessName,
    customerName: data.customerName,
    address: data.address,
    serviceType: data.serviceType,
    priority: data.priority || 'normal',
    status: 'booked',
    queueStatus: 'booked',
    lastBookingAt: Date.now(),
    nextAppointmentAt: startTime,
  })

  return {
    success: true,
    appointment: decorateAppointment(appointment),
  }
}

export function getCallerQueue(filters = {}) {
  ensureDemoSeedData()
  const conversationsByPhone = new Map(getAllConversations(filters).map((item) => [item.phone, item]))

  const priorityWeight = {
    emergency: 3,
    high: 2,
    normal: 1,
    low: 0,
  }

  return getAllLeads(filters)
    .filter((lead) => lead.status !== 'booked' || lead.queueStatus !== 'booked')
    .map((lead) => {
      const conversation = conversationsByPhone.get(lead.phone)
      return {
        phone: lead.phone,
        customerName: lead.customerName || 'Unknown Caller',
        address: lead.address || '',
        serviceType: lead.serviceType || 'General plumbing request',
        priority: lead.priority || 'normal',
        priorityScore: priorityWeight[lead.priority || 'normal'] || 0,
        status: lead.status || 'new',
        queueStatus: lead.queueStatus || lead.status || 'new',
        missedCallAt: lead.missedCallAt || lead.updatedAt || Date.now(),
        lastReplyAt: lead.lastReplyAt || lead.updatedAt || Date.now(),
        messageCount: conversation?.messageCount || 0,
        lastMessage: conversation?.lastMessage || '',
      }
    })
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore
      }

      return (b.missedCallAt || 0) - (a.missedCallAt || 0)
    })
}

export function getBusinessOverview(filters = {}) {
  ensureDemoSeedData()

  const scenario = getScenarioForFilters(filters) || getScenarioBySlug('mr-rooter') || SCENARIOS[0]
  const profile = getBookingProfile(scenario)
  const day = filters.day || Date.now()

  const queue = getCallerQueue({ scenarioId: scenario.id })
  const businessAppointments = getAppointments({ scenarioId: scenario.id })
  const appointmentsToday = getAppointments({ scenarioId: scenario.id, day })
  const upcomingAppointments = businessAppointments
    .filter((appointment) => appointment.endTime >= Date.now())
    .slice(0, 6)
  const availability = buildAvailability({
    appointments: appointmentsToday,
    dayInput: day,
    profile,
    durationMinutes: profile.defaultDurationMinutes,
  })
  const bookedLeads = getAllLeads({ scenarioId: scenario.id }).filter((lead) => lead.status === 'booked')

  return {
    scenario,
    queue,
    appointmentsToday,
    upcomingAppointments,
    availability,
    stats: {
      waitingCallers: queue.length,
      appointmentsToday: appointmentsToday.length,
      bookedJobs: bookedLeads.length,
      openSlotsToday: availability.availableCount,
      preventedConflicts,
    },
  }
}

export function clearConversation(phone) {
  ensureDemoSeedData()
  conversations.delete(phone)
  leads.delete(phone)

  for (const [appointmentId, appointment] of appointments.entries()) {
    if (appointment.phone === phone) {
      appointments.delete(appointmentId)
    }
  }

  return true
}

export function getStats() {
  ensureDemoSeedData()
  let totalMessages = 0

  for (const messages of conversations.values()) {
    totalMessages += messages.length
  }

  const allLeads = Array.from(leads.values())

  return {
    totalLeads: leads.size,
    totalMessages,
    activeConversations: allLeads.filter((lead) => lead.status === 'active').length,
    newLeads: allLeads.filter((lead) => lead.status === 'new').length,
    bookedAppointments: appointments.size,
    activeClients: new Set(allLeads.map((lead) => lead.businessName).filter(Boolean)).size,
  }
}
