'use client'

import { useEffect, useState } from 'react'
import AppointmentBookingForm from '@/components/AppointmentBookingForm'
import Navbar from '@/components/Navbar'
import { SCENARIOS } from '@/lib/scenarios'

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
  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatTimestamp(value) {
  if (!value) {
    return 'Not scheduled'
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function DashboardPage() {
  const [scenarioId, setScenarioId] = useState('mr-rooter')
  const [dashboard, setDashboard] = useState(null)
  const [selectedPhone, setSelectedPhone] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [bookingBanner, setBookingBanner] = useState(null)

  async function fetchDashboard(phone = selectedPhone, silent = false) {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const query = new URLSearchParams({
        scenarioId,
      })

      if (phone) {
        query.set('phone', phone)
      }

      const response = await fetch(`/api/dashboard?${query.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to load owner dashboard')
      }

      const data = await response.json()
      setDashboard(data)
      setSelectedPhone(data.selectedPhone || null)
      setError(null)
    } catch (requestError) {
      setError(requestError.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboard(null, false)
  }, [scenarioId])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard(selectedPhone, true)
    }, 15000)

    return () => clearInterval(interval)
  }, [scenarioId, selectedPhone])

  const scenario = dashboard?.scenario || SCENARIOS.find((item) => item.id === scenarioId) || SCENARIOS[0]
  const stats = dashboard?.stats || {
    waitingCallers: 0,
    appointmentsToday: 0,
    bookedJobs: 0,
    openSlotsToday: 0,
    preventedConflicts: 0,
  }
  const queue = dashboard?.queue || []
  const selectedLead = dashboard?.selectedConversation?.lead || null
  const selectedMessages = dashboard?.selectedConversation?.messages || []
  const appointmentsToday = dashboard?.appointmentsToday || []
  const upcomingAppointments = dashboard?.upcomingAppointments || []
  const availability = dashboard?.availability || { slots: [] }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#fff5eb_22%,#fffdf8_48%,#f8fafc_100%)] text-slate-900">
      <Navbar />

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[38px] border border-orange-200/60 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_34%),linear-gradient(135deg,#0f172a_0%,#1e293b_46%,#334155_100%)] p-6 text-white shadow-[0_32px_90px_rgba(15,23,42,0.18)] sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">
                Owner Operations Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
                {scenario.businessName} can now see live callers, booking demand, and today's calendar in one place.
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
                This example is centered on Mr. Rooter Plumbing of Huntsville and uses the new
                collision-aware booking engine, so overlapping appointments are rejected before
                they ever hit the schedule.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white outline-none backdrop-blur"
                value={scenarioId}
                onChange={(event) => {
                  setScenarioId(event.target.value)
                  setSelectedPhone(null)
                  setBookingBanner(null)
                }}
              >
                {SCENARIOS.map((item) => (
                  <option key={item.id} value={item.id} className="text-slate-900">
                    {item.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => fetchDashboard(selectedPhone, true)}
                className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                {refreshing ? 'Refreshing...' : 'Refresh data'}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: 'Waiting callers',
              value: stats.waitingCallers,
              accent: 'from-orange-500 to-amber-400',
            },
            {
              label: 'Appointments today',
              value: stats.appointmentsToday,
              accent: 'from-sky-500 to-cyan-400',
            },
            {
              label: 'Booked jobs',
              value: stats.bookedJobs,
              accent: 'from-emerald-500 to-lime-400',
            },
            {
              label: 'Open slots today',
              value: stats.openSlotsToday,
              accent: 'from-violet-500 to-fuchsia-400',
            },
            {
              label: 'Conflicts blocked',
              value: stats.preventedConflicts,
              accent: 'from-rose-500 to-orange-400',
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
            >
              <div className={`h-1 w-full rounded-full bg-gradient-to-r ${card.accent}`} />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {card.label}
              </p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{card.value}</p>
            </div>
          ))}
        </section>

        {error && (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {bookingBanner && (
          <div
            className={`rounded-[28px] border px-5 py-4 text-sm ${
              bookingBanner.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-orange-200 bg-orange-50 text-orange-700'
            }`}
          >
            {bookingBanner.text}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <aside className="space-y-6">
            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Caller Queue
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Calls waiting on owner</h2>
                </div>
                <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
                  {queue.length}
                </div>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    Loading queue...
                  </div>
                ) : queue.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    No callers are waiting right now.
                  </div>
                ) : (
                  queue.map((item) => {
                    const isSelected = selectedPhone === item.phone

                    return (
                      <button
                        key={item.phone}
                        type="button"
                        onClick={() => {
                          setSelectedPhone(item.phone)
                          fetchDashboard(item.phone, true)
                        }}
                        className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                          isSelected
                            ? 'border-slate-900 bg-slate-950 text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]'
                            : 'border-slate-200 bg-slate-50 text-slate-900 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {item.customerName}
                            </p>
                            <p className={`mt-1 text-xs ${isSelected ? 'text-white/60' : 'text-slate-500'}`}>
                              {item.phone}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              item.priority === 'emergency'
                                ? isSelected
                                  ? 'bg-orange-400/20 text-orange-200'
                                  : 'bg-orange-100 text-orange-700'
                                : item.priority === 'high'
                                  ? isSelected
                                    ? 'bg-amber-400/20 text-amber-100'
                                    : 'bg-amber-100 text-amber-700'
                                  : isSelected
                                    ? 'bg-white/10 text-white/70'
                                    : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>

                        <p className={`mt-3 text-sm ${isSelected ? 'text-white/80' : 'text-slate-700'}`}>
                          {item.serviceType}
                        </p>
                        <p className={`mt-2 text-xs ${isSelected ? 'text-white/60' : 'text-slate-500'}`}>
                          {item.address || 'Address still needed'} 
                        </p>
                        <div className={`mt-3 flex items-center justify-between text-xs ${isSelected ? 'text-white/60' : 'text-slate-500'}`}>
                          <span>{item.messageCount} messages</span>
                          <span>{relativeTime(item.missedCallAt)}</span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Today's Open Windows
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(availability.slots || [])
                  .filter((slot) => slot.available)
                  .slice(0, 8)
                  .map((slot) => (
                    <span
                      key={slot.startTime}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                    >
                      {slot.label}
                    </span>
                  ))}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Today's Calendar
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                    Schedule for {scenario.businessName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Booked slots show where the collision rules will reject new appointments.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                  {appointmentsToday.length} jobs on the board
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-3">
                  {appointmentsToday.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      No appointments are scheduled for today yet.
                    </div>
                  ) : (
                    appointmentsToday.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{appointment.title}</p>
                            <p className="mt-1 text-sm text-slate-600">{appointment.customerName}</p>
                            <p className="mt-2 text-xs text-slate-500">{appointment.address}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right text-xs text-slate-600">
                            <p className="font-semibold text-slate-900">{appointment.startLabel} - {appointment.endLabel}</p>
                            <p className="mt-1">{appointment.serviceType}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Availability Snapshot
                  </p>
                  <div className="mt-4 space-y-2">
                    {(availability.slots || []).slice(0, 10).map((slot) => (
                      <div
                        key={slot.startTime}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm ${
                          slot.available
                            ? 'border border-emerald-200 bg-white text-emerald-700'
                            : 'border border-orange-200 bg-orange-50 text-orange-700'
                        }`}
                      >
                        <span>{slot.label}</span>
                        <span className="font-semibold">
                          {slot.available ? 'Open' : 'Busy'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Selected Conversation
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                    {selectedLead?.customerName || 'Select a caller from the queue'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    The owner can review the latest text history before calling back or booking the job.
                  </p>
                </div>

                {selectedLead && (
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{selectedLead.serviceType || 'Plumbing request'}</p>
                    <p className="mt-1">{selectedLead.address || 'Address still needed'}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 min-h-[320px] rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                {selectedMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                    Pick a caller to view their full thread here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedMessages.map((message, index) => {
                      const isAssistant = message.role === 'assistant'

                      return (
                        <div key={`${message.timestamp}-${index}`} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                          <div className="max-w-[82%]">
                            <p className="mb-1 px-2 text-xs text-slate-400">
                              {isAssistant ? scenario.businessName : selectedLead?.customerName || 'Customer'} - {relativeTime(message.timestamp)}
                            </p>
                            <div
                              className={`rounded-[24px] px-4 py-3 text-sm leading-6 ${
                                isAssistant
                                  ? 'bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
                                  : 'bg-gradient-to-r from-orange-500 to-amber-400 text-white'
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <AppointmentBookingForm
              scenarioId={scenario.id}
              businessName={scenario.businessName}
              theme="dark"
              initialValues={{
                customerName: selectedLead?.customerName || '',
                phone: selectedLead?.phone || selectedPhone || '',
                serviceType: selectedLead?.serviceType || scenario.services?.[0] || '',
                address: selectedLead?.address || '',
                priority: selectedLead?.priority || 'normal',
              }}
              title="Create Booking"
              subtitle="Book directly from the owner dashboard. If the time collides with an existing meeting, it will be rejected here."
              submitLabel="Check availability"
              onSuccess={async (data) => {
                setBookingBanner({
                  tone: 'success',
                  text: data.message,
                })
                await fetchDashboard(data.appointment?.phone || selectedPhone, true)
              }}
              onConflict={async (data) => {
                setBookingBanner({
                  tone: 'error',
                  text: data.message || data.error,
                })
                await fetchDashboard(selectedPhone, true)
              }}
            />

            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Upcoming Jobs
              </p>
              <div className="mt-4 space-y-3">
                {upcomingAppointments.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No future jobs are scheduled yet.
                  </div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">{appointment.customerName}</p>
                      <p className="mt-1 text-sm text-slate-600">{appointment.serviceType}</p>
                      <p className="mt-3 text-xs text-slate-500">{formatTimestamp(appointment.startTime)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Owner Notes
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>New callers stay in the queue until they are booked or resolved.</p>
                <p>Accepted appointments immediately reserve the slot and update the caller record.</p>
                <p>Blocked overlaps increase the "Conflicts blocked" counter so the owner can see the protection working.</p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
