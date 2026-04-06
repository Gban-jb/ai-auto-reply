'use client'

import { useEffect, useState } from 'react'

const DURATIONS = [
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '120 min', value: 120 },
]

function pad(value) {
  return String(value).padStart(2, '0')
}

function toDateTimeLocal(value) {
  const date = value ? new Date(value) : getDefaultStartTimeDate()
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function getDefaultStartTimeDate() {
  const date = new Date()
  date.setHours(date.getHours() + 1)
  const remainder = date.getMinutes() % 30
  const nextMinutes = remainder === 0 ? date.getMinutes() : date.getMinutes() + (30 - remainder)
  date.setMinutes(nextMinutes, 0, 0)

  return date
}

export default function AppointmentBookingForm({
  scenarioId,
  businessName,
  title = 'Book Appointment',
  subtitle = 'Create a job visit and check for collisions before it is accepted.',
  initialValues = {},
  theme = 'light',
  submitLabel = 'Check and Book',
  onSuccess,
  onConflict,
}) {
  const isDark = theme === 'dark'
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    serviceType: '',
    address: '',
    startTime: toDateTimeLocal(),
    durationMinutes: 90,
    notes: '',
    priority: 'normal',
  })
  const [status, setStatus] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setForm((current) => ({
      ...current,
      customerName: initialValues.customerName || current.customerName,
      phone: initialValues.phone || current.phone,
      serviceType: initialValues.serviceType || current.serviceType,
      address: initialValues.address || current.address,
      priority: initialValues.priority || current.priority,
      startTime: initialValues.startTime ? toDateTimeLocal(initialValues.startTime) : current.startTime,
    }))
  }, [
    initialValues.address,
    initialValues.customerName,
    initialValues.phone,
    initialValues.priority,
    initialValues.serviceType,
    initialValues.startTime,
  ])

  const panelClassName = isDark
    ? 'glass-card rounded-[28px] border border-white/10 p-6 text-white'
    : 'rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.08)]'
  const inputClassName = isDark
    ? 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-orange-300 focus:outline-none'
    : 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:outline-none'
  const labelClassName = isDark ? 'text-xs font-semibold uppercase tracking-[0.24em] text-white/50' : 'text-xs font-semibold uppercase tracking-[0.24em] text-slate-500'
  const subtleTextClassName = isDark ? 'text-sm text-white/60' : 'text-sm text-slate-500'

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setStatus(null)
    setSuggestions([])

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          scenarioId,
          businessName,
          startTime: new Date(form.startTime).toISOString(),
          durationMinutes: Number(form.durationMinutes),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus({
          tone: 'error',
          message: data.message || data.error || 'That time is unavailable.',
        })
        setSuggestions(data.suggestions || [])
        onConflict?.(data)
        return
      }

      setStatus({
        tone: 'success',
        message: data.message || 'Appointment booked successfully.',
      })
      setSuggestions([])
      onSuccess?.(data)
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error.message || 'Unable to create appointment.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={panelClassName}>
      <div className="mb-6">
        <p className={labelClassName}>{title}</p>
        <h3 className={`mt-2 text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Calendar-backed booking
        </h3>
        <p className={`mt-2 max-w-md ${subtleTextClassName}`}>{subtitle}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClassName}>Customer</label>
            <input
              className={inputClassName}
              value={form.customerName}
              onChange={(event) => setForm({ ...form, customerName: event.target.value })}
              placeholder="Sarah Parker"
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Phone</label>
            <input
              className={inputClassName}
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="(256) 555-0131"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <label className={labelClassName}>Service</label>
            <input
              className={inputClassName}
              value={form.serviceType}
              onChange={(event) => setForm({ ...form, serviceType: event.target.value })}
              placeholder="Drain cleaning"
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Priority</label>
            <select
              className={inputClassName}
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClassName}>Service Address</label>
          <input
            className={inputClassName}
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            placeholder="124 Willow Bend Dr, Huntsville, AL"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-2">
            <label className={labelClassName}>Requested Time</label>
            <input
              type="datetime-local"
              className={inputClassName}
              value={form.startTime}
              onChange={(event) => setForm({ ...form, startTime: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Duration</label>
            <select
              className={inputClassName}
              value={form.durationMinutes}
              onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })}
            >
              {DURATIONS.map((duration) => (
                <option key={duration.value} value={duration.value}>
                  {duration.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClassName}>Notes</label>
          <textarea
            className={`${inputClassName} min-h-28 resize-y`}
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Gate code, pet instructions, or equipment notes."
          />
        </div>

        {status && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              status.tone === 'success'
                ? isDark
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : isDark
                  ? 'border-orange-400/30 bg-orange-400/10 text-orange-200'
                  : 'border-orange-200 bg-orange-50 text-orange-700'
            }`}
          >
            {status.message}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className={labelClassName}>Next Openings</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.startTime}`}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, startTime: toDateTimeLocal(suggestion.startTime) })
                    setStatus(null)
                  }}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    isDark
                      ? 'border border-white/10 bg-white/5 text-white/80 hover:border-orange-300 hover:text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            isDark
              ? 'bg-gradient-to-r from-orange-400 to-amber-300 text-slate-950 hover:shadow-[0_14px_32px_rgba(251,146,60,0.28)] disabled:opacity-60'
              : 'bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:shadow-[0_14px_32px_rgba(249,115,22,0.22)] disabled:opacity-60'
          }`}
        >
          {submitting ? 'Checking calendar...' : submitLabel}
        </button>
      </form>
    </div>
  )
}
