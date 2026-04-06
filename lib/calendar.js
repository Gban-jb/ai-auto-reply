const DEFAULT_WORKING_HOURS = {
  0: null,
  1: { start: '07:00', end: '18:00' },
  2: { start: '07:00', end: '18:00' },
  3: { start: '07:00', end: '18:00' },
  4: { start: '07:00', end: '18:00' },
  5: { start: '07:00', end: '18:00' },
  6: { start: '08:00', end: '14:00' },
}

function pad(value) {
  return String(value).padStart(2, '0')
}

export function getBookingProfile(scenario = {}) {
  return {
    timezone: 'America/Chicago',
    slotMinutes: 30,
    defaultDurationMinutes: 90,
    bufferMinutes: 0,
    workingHours: DEFAULT_WORKING_HOURS,
    ...scenario.bookingProfile,
  }
}

export function toTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value)
  const timestamp = date.getTime()

  if (Number.isNaN(timestamp)) {
    throw new Error('Invalid date value')
  }

  return timestamp
}

export function getDayKey(value = Date.now()) {
  const date = value instanceof Date ? value : new Date(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getDayRange(dayInput = Date.now()) {
  const date = dayInput instanceof Date ? new Date(dayInput) : new Date(dayInput)
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return {
    start: start.getTime(),
    end: end.getTime(),
    dayKey: getDayKey(start),
  }
}

export function createTimestampForDay(dayInput, hhmm) {
  const date = dayInput instanceof Date ? new Date(dayInput) : new Date(dayInput)
  const [hours, minutes] = hhmm.split(':').map(Number)
  date.setHours(hours, minutes, 0, 0)
  return date.getTime()
}

export function formatTimeLabel(value) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatDateLabel(value, options = {}) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(value))
}

export function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA
}

export function findAppointmentConflict(appointments, startTime, endTime, ignoreId) {
  return appointments.find((appointment) => {
    if (ignoreId && appointment.id === ignoreId) {
      return false
    }

    if (appointment.status === 'cancelled') {
      return false
    }

    return overlaps(startTime, endTime, appointment.startTime, appointment.endTime)
  }) || null
}

export function buildAvailability({
  appointments = [],
  dayInput = Date.now(),
  profile = getBookingProfile(),
  durationMinutes,
}) {
  const day = dayInput instanceof Date ? new Date(dayInput) : new Date(dayInput)
  const weekday = day.getDay()
  const workingHours = profile.workingHours?.[weekday]
  const duration = Number(durationMinutes) || profile.defaultDurationMinutes

  if (!workingHours) {
    return {
      dayKey: getDayKey(day),
      workingHours: null,
      slots: [],
      availableCount: 0,
    }
  }

  const slotStep = (profile.slotMinutes || 30) * 60 * 1000
  const workStart = createTimestampForDay(day, workingHours.start)
  const workEnd = createTimestampForDay(day, workingHours.end)
  const slots = []

  for (let cursor = workStart; cursor + (duration * 60 * 1000) <= workEnd; cursor += slotStep) {
    const slotEnd = cursor + (duration * 60 * 1000)
    const conflict = findAppointmentConflict(appointments, cursor, slotEnd)

    slots.push({
      startTime: cursor,
      endTime: slotEnd,
      label: `${formatTimeLabel(cursor)} - ${formatTimeLabel(slotEnd)}`,
      available: !conflict,
      conflictId: conflict?.id || null,
      conflictTitle: conflict?.title || conflict?.serviceType || null,
    })
  }

  return {
    dayKey: getDayKey(day),
    workingHours,
    workStart,
    workEnd,
    slots,
    availableCount: slots.filter((slot) => slot.available).length,
  }
}

export function getSuggestedSlots({
  appointments = [],
  dayInput = Date.now(),
  profile = getBookingProfile(),
  durationMinutes,
  limit = 3,
}) {
  const suggestions = []

  for (let offset = 0; offset < 5 && suggestions.length < limit; offset += 1) {
    const day = new Date(dayInput)
    day.setDate(day.getDate() + offset)

    const availability = buildAvailability({
      appointments,
      dayInput: day,
      profile,
      durationMinutes,
    })

    for (const slot of availability.slots) {
      if (slot.available) {
        suggestions.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
          label: `${formatDateLabel(slot.startTime)} - ${slot.label}`,
        })
      }

      if (suggestions.length >= limit) {
        break
      }
    }
  }

  return suggestions
}
