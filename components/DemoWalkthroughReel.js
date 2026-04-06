'use client'

import { useEffect, useMemo, useState } from 'react'

const STEP_DURATION_MS = 2400

function formatBusinessLabel(name) {
  return name?.replace(' of Huntsville', '') || 'Mr. Rooter'
}

export default function DemoWalkthroughReel({ scenario, caller }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const isPlaying = isHovered || isPinned
  const businessLabel = formatBusinessLabel(scenario?.businessName)
  const serviceLabel = caller?.serviceType || scenario?.services?.[0] || 'Drain cleaning'
  const customerName = caller?.customerName || 'Jamie Carter'
  const customerPhone = caller?.phone || '(256) 555-0147'

  const steps = useMemo(() => ([
    {
      id: 'incoming',
      label: 'Missed call captured',
      title: 'A new caller instantly becomes a lead',
      caption: 'The system catches the missed call, tags priority, and opens the text recovery flow.',
    },
    {
      id: 'texting',
      label: 'AI starts texting',
      title: 'The assistant asks the next best question',
      caption: 'It responds fast, keeps the text short, and gathers the job details without sounding robotic.',
    },
    {
      id: 'conflict',
      label: 'Conflict blocked',
      title: 'Busy times are rejected automatically',
      caption: 'If the owner already has a meeting or service visit, the requested slot is not accepted.',
    },
    {
      id: 'accepted',
      label: 'Open slot booked',
      title: 'The next opening gets confirmed in seconds',
      caption: 'When the time no longer collides with anything, the booking is accepted and confirmed.',
    },
    {
      id: 'dashboard',
      label: 'Dashboard updates',
      title: 'The owner sees queue and calendar update together',
      caption: 'The judge can see the full workflow without clicking through every screen by hand.',
    },
  ]), [])

  useEffect(() => {
    if (!isPlaying) {
      setActiveStep(0)
      return
    }

    const timeout = window.setTimeout(() => {
      setActiveStep((current) => (current + 1) % steps.length)
    }, STEP_DURATION_MS)

    return () => window.clearTimeout(timeout)
  }, [activeStep, isPlaying, steps.length])

  const currentStep = steps[activeStep]

  return (
    <button
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={() => setIsPinned((current) => !current)}
      className="group relative w-full overflow-hidden rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] p-4 text-left shadow-[0_32px_80px_rgba(15,23,42,0.28)] transition duration-500 hover:-translate-y-1 hover:border-orange-200/50 focus:outline-none focus:ring-2 focus:ring-orange-200/60 sm:p-5"
      aria-label="Hover to autoplay the product walkthrough"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.16),transparent_32%)] opacity-80" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-100/80">
              Judge Walkthrough
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              Hover to auto-play the demo story
            </h3>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur">
            <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
            <span>{isPinned ? 'Pinned' : isPlaying ? 'Playing' : 'Hover to play'}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/12">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-orange-300 via-amber-200 to-orange-100 ${
                  index < activeStep ? 'w-full' : index === activeStep && isPlaying ? 'walkthrough-progress-fill' : 'w-0'
                }`}
                style={index === activeStep && isPlaying ? { animationDuration: `${STEP_DURATION_MS}ms` } : undefined}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-4 backdrop-blur sm:p-5">
          <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-400/20 text-xl">
                {scenario?.emoji || '🔧'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{businessLabel}</p>
                <p className="text-xs text-white/45">{currentStep.label}</p>
              </div>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/55">
              Scene {activeStep + 1}
            </div>
          </div>

          <div className="relative mt-5 min-h-[390px] overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-4 sm:min-h-[420px] sm:p-5">
            <WalkthroughScene
              activeStep={activeStep}
              businessLabel={businessLabel}
              customerName={customerName}
              customerPhone={customerPhone}
              serviceLabel={serviceLabel}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-100/65">
              What the judge sees
            </p>
            <h4 className="mt-2 text-xl font-semibold text-white">{currentStep.title}</h4>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              {currentStep.caption}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Caller</p>
              <p className="mt-2 text-sm font-semibold text-white">{customerName}</p>
              <p className="mt-1 text-xs text-white/55">{customerPhone}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Service</p>
              <p className="mt-2 text-sm font-semibold text-white">{serviceLabel}</p>
              <p className="mt-1 text-xs text-white/55">{scenario?.industry || 'Service business'}</p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-white/45">
          Hover plays the walkthrough. Click once to keep it running while you talk.
        </p>
      </div>
    </button>
  )
}

function WalkthroughScene({ activeStep, businessLabel, customerName, customerPhone, serviceLabel }) {
  return (
    <div className="relative h-full">
      <SceneFrame visible={activeStep === 0}>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[24px] border border-orange-400/20 bg-orange-400/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-orange-100/70">Incoming call</p>
              <span className="flex h-3 w-3 rounded-full bg-orange-300 animate-pulse" />
            </div>
            <h5 className="mt-4 text-lg font-semibold text-white">{customerName}</h5>
            <p className="mt-1 text-sm text-white/55">{customerPhone}</p>
            <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">Requested help</p>
              <p className="mt-2 text-sm text-white">{serviceLabel}</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Automation timeline</p>
            <div className="mt-4 space-y-3">
              {[
                'Missed call logged',
                'Lead record created',
                'Priority tagged emergency',
                'Text recovery launched',
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/6 bg-slate-950/40 px-4 py-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    index === 0 ? 'bg-orange-300 text-slate-950' : 'bg-white/10 text-white/70'
                  }`}>
                    {index + 1}
                  </span>
                  <p className="text-sm text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SceneFrame>

      <SceneFrame visible={activeStep === 1}>
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Lead status</p>
            <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/70">Now texting</p>
              <p className="mt-2 text-sm text-white">Lead moved from new caller to active conversation.</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatBox label="Response time" value="< 2 sec" />
              <StatBox label="Goal" value="Get address" />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">SMS thread</p>
            <div className="mt-4 space-y-3">
              <Bubble align="left" author={businessLabel} tone="light">
                Sorry we missed your call. Is this a leak, clog, or water heater issue?
              </Bubble>
              <Bubble align="right" author={customerName} tone="warm">
                I need help with {serviceLabel.toLowerCase()} at my house today.
              </Bubble>
              <Bubble align="left" author={businessLabel} tone="light">
                We can help. What is the service address so we can check the best arrival window?
              </Bubble>
            </div>
          </div>
        </div>
      </SceneFrame>

      <SceneFrame visible={activeStep === 2}>
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border border-orange-300/18 bg-orange-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-orange-100/70">Booking request</p>
            <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3">
              <p className="text-sm text-white">Customer asks for today at 3:00 PM.</p>
              <p className="mt-2 text-xs text-white/50">Requested duration: 90 minutes</p>
            </div>
            <div className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-300/12 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-rose-100/80">Conflict detected</p>
              <p className="mt-2 text-sm text-white">3:00 PM overlaps with Dana Brooks - Drain Cleaning Visit.</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Today's calendar</p>
            <div className="mt-4 space-y-3">
              <CalendarRow label="8:00 - 8:45" detail="Morning dispatch huddle" tone="neutral" />
              <CalendarRow label="2:30 - 4:00" detail="Dana Brooks - Drain Cleaning" tone="busy" />
              <CalendarRow label="3:00 - 4:30" detail="Requested by new caller" tone="error" />
              <CalendarRow label="4:30 - 6:00" detail="Next opening available" tone="open" />
            </div>
          </div>
        </div>
      </SceneFrame>

      <SceneFrame visible={activeStep === 3}>
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-white/8 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Confirmation thread</p>
            <div className="mt-4 space-y-3">
              <Bubble align="left" author={businessLabel} tone="light">
                3:00 PM is already booked, but we can do today at 4:30 PM. Does that work?
              </Bubble>
              <Bubble align="right" author={customerName} tone="warm">
                Yes, 4:30 works for me.
              </Bubble>
              <Bubble align="left" author={businessLabel} tone="success">
                You&apos;re booked for today at 4:30 PM. We&apos;ll see you then.
              </Bubble>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-emerald-300/25 bg-emerald-300/12 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/80">Accepted slot</p>
              <p className="mt-3 text-lg font-semibold text-white">4:30 PM - 6:00 PM</p>
              <p className="mt-1 text-sm text-white/65">{customerName} - {serviceLabel}</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Calendar result</p>
              <div className="mt-4 space-y-3">
                <CalendarRow label="2:30 - 4:00" detail="Dana Brooks - Drain Cleaning" tone="busy" />
                <CalendarRow label="4:30 - 6:00" detail={`${customerName} - ${serviceLabel}`} tone="success" />
              </div>
            </div>
          </div>
        </div>
      </SceneFrame>

      <SceneFrame visible={activeStep === 4}>
        <div className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Owner dashboard</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatBox label="Waiting callers" value="2" accent="orange" />
              <StatBox label="Appointments today" value="3" accent="emerald" />
              <StatBox label="Conflicts blocked" value="1" accent="rose" />
              <StatBox label="Open slots left" value="5" accent="sky" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/8 bg-slate-950/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{customerName}</p>
                  <p className="mt-1 text-xs text-white/50">{serviceLabel}</p>
                </div>
                <span className="rounded-full border border-emerald-300/25 bg-emerald-300/12 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-100/80">
                  Booked
                </span>
              </div>
              <p className="mt-4 text-sm text-white/75">4:30 PM confirmed and pushed into the appointment list.</p>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">What changed</p>
              <div className="mt-4 space-y-3">
                {[
                  'Queue updated after booking',
                  'Calendar slot reserved',
                  'Conversation shows confirmation text',
                  'Owner can review everything in one dashboard',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/6 bg-slate-950/35 px-4 py-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-300/15 text-sm text-emerald-100">✓</span>
                    <p className="text-sm text-white/78">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SceneFrame>
    </div>
  )
}

function SceneFrame({ visible, children }) {
  return (
    <div
      className={`absolute inset-0 transition-all duration-700 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      {children}
    </div>
  )
}

function Bubble({ align, author, tone, children }) {
  const bubbleTone =
    tone === 'warm'
      ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white'
      : tone === 'success'
        ? 'bg-emerald-300/14 text-emerald-50 border border-emerald-300/20'
        : 'bg-white/8 text-white border border-white/8'

  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[88%]">
        <p className="mb-1 px-2 text-[11px] uppercase tracking-[0.18em] text-white/35">{author}</p>
        <div className={`rounded-[22px] px-4 py-3 text-sm leading-6 ${bubbleTone}`}>
          {children}
        </div>
      </div>
    </div>
  )
}

function CalendarRow({ label, detail, tone }) {
  const toneClass =
    tone === 'busy'
      ? 'border-orange-300/22 bg-orange-300/12 text-orange-50'
      : tone === 'error'
        ? 'border-rose-300/24 bg-rose-300/12 text-rose-50'
        : tone === 'success'
          ? 'border-emerald-300/24 bg-emerald-300/12 text-emerald-50'
          : tone === 'open'
            ? 'border-sky-300/22 bg-sky-300/10 text-sky-50'
            : 'border-white/8 bg-white/5 text-white'

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{label}</p>
        <span className="text-[11px] uppercase tracking-[0.22em] opacity-70">
          {tone === 'busy' ? 'Busy' : tone === 'error' ? 'Rejected' : tone === 'success' ? 'Booked' : tone === 'open' ? 'Open' : 'Blocked'}
        </span>
      </div>
      <p className="mt-1 text-xs opacity-75">{detail}</p>
    </div>
  )
}

function StatBox({ label, value, accent = 'neutral' }) {
  const accentClass =
    accent === 'orange'
      ? 'from-orange-400/28 to-orange-200/10 border-orange-300/16'
      : accent === 'emerald'
        ? 'from-emerald-400/28 to-emerald-200/10 border-emerald-300/16'
        : accent === 'rose'
          ? 'from-rose-400/28 to-rose-200/10 border-rose-300/16'
          : accent === 'sky'
            ? 'from-sky-400/28 to-sky-200/10 border-sky-300/16'
            : 'from-white/10 to-white/5 border-white/8'

  return (
    <div className={`rounded-2xl border bg-gradient-to-br px-4 py-3 ${accentClass}`}>
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}
