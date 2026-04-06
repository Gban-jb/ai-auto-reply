'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import AppointmentBookingForm from '@/components/AppointmentBookingForm'
import DemoWalkthroughReel from '@/components/DemoWalkthroughReel'
import Navbar from '@/components/Navbar'
import { SCENARIOS } from '@/lib/scenarios'

function randomPhone() {
  const suffix = String(Math.floor(1000 + Math.random() * 9000))
  return `(256) 555-${suffix}`
}

function buildCallerProfile(scenario) {
  return {
    customerName: 'Jamie Carter',
    phone: randomPhone(),
    address: '124 Willow Bend Dr, Huntsville, AL',
    serviceType: scenario?.services?.[0] || 'General service request',
    priority: 'normal',
  }
}

function relativeTime(value) {
  if (!value) {
    return 'just now'
  }

  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] text-slate-900">
          <Navbar />
          <main className="mx-auto flex max-w-7xl items-center justify-center px-6 py-24">
            <p className="text-slate-500">Loading demo...</p>
          </main>
        </div>
      }
    >
      <DemoPageContent />
    </Suspense>
  )
}

function DemoPageContent() {
  const searchParams = useSearchParams()
  const messagesEndRef = useRef(null)

  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0])
  const [caller, setCaller] = useState(buildCallerProfile(SCENARIOS[0]))
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [calling, setCalling] = useState(false)
  const [loading, setLoading] = useState(false)
  const [responseTimeMs, setResponseTimeMs] = useState(null)
  const [error, setError] = useState(null)
  const [bookingNote, setBookingNote] = useState(null)
  const [bookingContext, setBookingContext] = useState({
    appointments: [],
    availability: { slots: [], availableCount: 0 },
  })

  useEffect(() => {
    const clientParam = searchParams.get('client')
    const scenario = clientParam
      ? SCENARIOS.find((item) => item.id === clientParam) || SCENARIOS[0]
      : SCENARIOS[0]

    applyScenario(scenario)
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function fetchBookingContext(scenarioId) {
    try {
      const response = await fetch(`/api/appointments?scenarioId=${encodeURIComponent(scenarioId)}`)
      if (!response.ok) {
        throw new Error('Failed to load booking context')
      }

      const data = await response.json()
      setBookingContext({
        appointments: data.appointments || [],
        availability: data.availability || { slots: [], availableCount: 0 },
      })
    } catch (requestError) {
      console.error(requestError)
    }
  }

  async function loadConversation(phone) {
    const response = await fetch(`/api/conversations?phone=${encodeURIComponent(phone)}`)
    const data = await response.json()
    setMessages(data.messages || [])
  }

  function applyScenario(scenario) {
    setSelectedScenario(scenario)
    setCaller(buildCallerProfile(scenario))
    setMessages([])
    setInputMessage('')
    setError(null)
    setResponseTimeMs(null)
    setBookingNote(null)
    fetchBookingContext(scenario.id)
  }

  async function handleSimulateMissedCall() {
    if (!selectedScenario || calling || loading) {
      return
    }

    setCalling(true)
    setError(null)
    setBookingNote(null)

    try {
      const started = Date.now()
      const response = await fetch('/api/missed-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: caller.phone,
          scenarioId: selectedScenario.id,
          customerName: caller.customerName,
          address: caller.address,
          serviceType: caller.serviceType,
          priority: caller.priority,
          businessConfig: {
            name: selectedScenario.businessName,
            industry: selectedScenario.industry,
            context: selectedScenario.context,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to simulate missed call')
      }

      await response.json()
      await loadConversation(caller.phone)
      setResponseTimeMs(Date.now() - started)
      await fetchBookingContext(selectedScenario.id)
    } catch (requestError) {
      setError(requestError.message || 'Unable to simulate missed call')
    } finally {
      setCalling(false)
    }
  }

  async function handleSendMessage() {
    if (!inputMessage.trim() || loading || messages.length === 0) {
      return
    }

    const customerMessage = inputMessage.trim()
    setInputMessage('')
    setLoading(true)
    setError(null)

    setMessages((current) => [
      ...current,
      {
        role: 'user',
        content: customerMessage,
        timestamp: Date.now(),
      },
    ])

    try {
      const started = Date.now()
      const response = await fetch('/api/sms-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: caller.phone,
          scenarioId: selectedScenario.id,
          customerName: caller.customerName,
          address: caller.address,
          serviceType: caller.serviceType,
          priority: caller.priority,
          message: customerMessage,
          businessConfig: {
            name: selectedScenario.businessName,
            industry: selectedScenario.industry,
            context: selectedScenario.context,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI reply')
      }

      await response.json()
      await loadConversation(caller.phone)
      setResponseTimeMs(Date.now() - started)
    } catch (requestError) {
      setError(requestError.message || 'Unable to send message')
    } finally {
      setLoading(false)
    }
  }

  const openSlots = (bookingContext.availability?.slots || []).filter((slot) => slot.available).slice(0, 4)
  const blockedSlots = (bookingContext.availability?.slots || []).filter((slot) => !slot.available).slice(0, 2)
  const upcomingAppointments = bookingContext.appointments.slice(0, 3)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf3_0%,#fffdf8_38%,#f8fafc_100%)] text-slate-900">
      <Navbar />

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-[#ead8c1] bg-white px-6 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">
                Live Demo
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                Clean flow: set the caller, launch the text recovery, then book against the calendar.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                This page is now organized into a simple presentation path so it is easy to navigate
                during a demo and easy for the judge to understand.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StepPill>1. Setup</StepPill>
              <StepPill>2. Conversation</StepPill>
              <StepPill>3. Booking</StepPill>
              <StepPill>4. Dashboard</StepPill>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <MetricPill label="Business" value={selectedScenario.businessName} />
            <MetricPill label="Open slots" value={String(openSlots.length)} />
            <MetricPill label="Busy windows" value={String(blockedSlots.length)} />
            <MetricPill label="Response time" value={responseTimeMs ? `${responseTimeMs}ms` : 'Ready'} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <StepCard
            step="Step 1"
            title="Setup"
            description="Pick the business, adjust the caller details, then start the missed-call flow."
          >
            <Field label="Business">
              <select
                className={inputClassName}
                value={selectedScenario.id}
                onChange={(event) => {
                  const nextScenario = SCENARIOS.find((item) => item.id === event.target.value)
                  if (nextScenario) {
                    applyScenario(nextScenario)
                  }
                }}
              >
                {SCENARIOS.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Customer name">
                <input
                  className={inputClassName}
                  value={caller.customerName}
                  onChange={(event) => setCaller({ ...caller, customerName: event.target.value })}
                />
              </Field>

              <Field label="Phone">
                <input
                  className={inputClassName}
                  value={caller.phone}
                  onChange={(event) => setCaller({ ...caller, phone: event.target.value })}
                />
              </Field>
            </div>

            <Field label="Service type">
              <input
                className={inputClassName}
                value={caller.serviceType}
                onChange={(event) => setCaller({ ...caller, serviceType: event.target.value })}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr] xl:grid-cols-1">
              <Field label="Priority">
                <select
                  className={inputClassName}
                  value={caller.priority}
                  onChange={(event) => setCaller({ ...caller, priority: event.target.value })}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </Field>

              <Field label="Address">
                <textarea
                  className={`${inputClassName} min-h-24 resize-y`}
                  value={caller.address}
                  onChange={(event) => setCaller({ ...caller, address: event.target.value })}
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={handleSimulateMissedCall}
              disabled={calling || loading}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#fbbf24_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:shadow-[0_16px_36px_rgba(249,115,22,0.2)] disabled:opacity-60"
            >
              {calling ? 'Starting demo...' : 'Start missed-call demo'}
            </button>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Quick prompts
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedScenario.quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => setInputMessage(reply)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-orange-300 hover:text-orange-700"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          </StepCard>

          <StepCard
            step="Step 2"
            title="Conversation"
            description="Use the live text thread during the demo. The AI responds through the real app flow."
          >
            <div className="rounded-[28px] border border-slate-200 bg-slate-50">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selectedScenario.businessName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {caller.customerName} · {caller.phone}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ConversationBadge>{messages.length} messages</ConversationBadge>
                  <ConversationBadge>{responseTimeMs ? `${responseTimeMs}ms` : 'No reply yet'}</ConversationBadge>
                </div>
              </div>

              <div className="min-h-[430px] space-y-4 px-5 py-5">
                {messages.length === 0 ? (
                  <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-orange-100 p-5 text-3xl">📞</div>
                    <h3 className="mt-4 text-2xl font-semibold text-slate-900">No conversation yet</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Start the missed-call demo first, then continue the live conversation here.
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <MessageBubble
                      key={`${message.timestamp}-${index}`}
                      author={message.role === 'assistant' ? selectedScenario.businessName : caller.customerName}
                      isAssistant={message.role === 'assistant'}
                      timestamp={message.timestamp}
                    >
                      {message.content}
                    </MessageBubble>
                  ))
                )}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                      {selectedScenario.businessName} is typing...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-200 px-5 py-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <textarea
                    className="min-h-24 w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Type the customer's next text..."
                    value={inputMessage}
                    onChange={(event) => setInputMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      The assistant will not promise a booking until the calendar accepts it.
                    </p>
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={loading || messages.length === 0}
                      className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      Send message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </StepCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
          <StepCard
            step="Step 3"
            title="Booking"
            description="Use the real booking form. Busy windows are rejected, open windows are accepted."
          >
            <AppointmentBookingForm
              scenarioId={selectedScenario.id}
              businessName={selectedScenario.businessName}
              initialValues={caller}
              title="Booking form"
              subtitle="Try a busy slot first, then choose an opening to show the confirmation flow."
              submitLabel="Check and book"
              onSuccess={async (data) => {
                setBookingNote({
                  tone: 'success',
                  text: data.message,
                })
                await loadConversation(data.appointment?.phone || caller.phone)
                await fetchBookingContext(selectedScenario.id)
              }}
              onConflict={async (data) => {
                setBookingNote({
                  tone: 'error',
                  text: data.message || data.error,
                })
                await loadConversation(caller.phone)
                await fetchBookingContext(selectedScenario.id)
              }}
            />

            {bookingNote && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  bookingNote.tone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-orange-200 bg-orange-50 text-orange-700'
                }`}
              >
                {bookingNote.text}
              </div>
            )}
          </StepCard>

          <div className="space-y-6">
            <StepCard
              step="Step 4"
              title="Judge preview"
              description="Hover the reel for a clean, automatic walkthrough of the entire flow."
            >
              <DemoWalkthroughReel scenario={selectedScenario} caller={caller} />
              <div className="flex justify-end">
                <Link
                  href="/dashboard"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
                >
                  Open owner dashboard
                </Link>
              </div>
            </StepCard>

            <StepCard
              step="Calendar snapshot"
              title="Today at a glance"
              description="Keep this small and readable while you explain how the booking guard works."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                    Next openings
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {openSlots.length === 0 ? (
                      <span className="text-sm text-emerald-700">No open slots yet</span>
                    ) : (
                      openSlots.map((slot) => (
                        <span
                          key={slot.startTime}
                          className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700"
                        >
                          {slot.label}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
                    Busy windows
                  </p>
                  <div className="mt-3 space-y-2">
                    {blockedSlots.length === 0 ? (
                      <p className="text-sm text-rose-700">No blocked windows yet</p>
                    ) : (
                      blockedSlots.map((slot) => (
                        <div key={slot.startTime} className="rounded-xl border border-rose-200 bg-white px-3 py-3">
                          <p className="text-sm font-semibold text-rose-700">{slot.label}</p>
                          <p className="mt-1 text-xs text-rose-600">
                            {slot.conflictTitle || 'Already booked'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Upcoming appointments
                </p>
                <div className="mt-3 space-y-2">
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-sm text-slate-500">No appointments scheduled yet.</p>
                  ) : (
                    upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{appointment.customerName}</p>
                          <p className="mt-1 text-xs text-slate-500">{appointment.serviceType}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                          {appointment.startLabel}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </StepCard>
          </div>
        </section>
      </main>
    </div>
  )
}

function StepCard({ step, title, description, children }) {
  return (
    <section className="flex flex-col gap-5 rounded-[30px] border border-[#ead8c1] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-600">{step}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </label>
      {children}
    </div>
  )
}

function MetricPill({ label, value }) {
  return (
    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <span className="ml-2 text-sm font-semibold text-slate-900">{value}</span>
    </div>
  )
}

function StepPill({ children }) {
  return (
    <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
      {children}
    </span>
  )
}

function ConversationBadge({ children }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
      {children}
    </span>
  )
}

function MessageBubble({ children, author, isAssistant, timestamp }) {
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className="max-w-[82%]">
        <p className="mb-1 px-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
          {author} · {relativeTime(timestamp)}
        </p>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
            isAssistant
              ? 'bg-white text-slate-900 shadow-sm'
              : 'bg-[linear-gradient(135deg,#f97316_0%,#fbbf24_100%)] text-white'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:outline-none'
