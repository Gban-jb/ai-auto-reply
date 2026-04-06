import { NextResponse } from 'next/server'
import { addMessage, createAppointment, getAppointments, getBusinessOverview } from '@/lib/store'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const scenarioId = searchParams.get('scenarioId')
  const phone = searchParams.get('phone')
  const day = searchParams.get('day')

  const appointments = getAppointments({
    scenarioId: scenarioId || undefined,
    phone: phone || undefined,
    day: day || undefined,
  })

  const overview = scenarioId
    ? getBusinessOverview({ scenarioId, day: day || undefined })
    : null

  return NextResponse.json({
    appointments,
    availability: overview?.availability || null,
    stats: overview?.stats || null,
    total: appointments.length,
  })
}

export async function POST(request) {
  try {
    const payload = await request.json()

    if (!payload.phone) {
      return NextResponse.json({ error: 'phone is required' }, { status: 400 })
    }

    if (!payload.startTime) {
      return NextResponse.json({ error: 'startTime is required' }, { status: 400 })
    }

    const result = createAppointment(payload)

    if (!result.success) {
      const conflictReply = result.conflict?.startLabel
        ? `That time is already booked. The existing appointment starts at ${result.conflict.startLabel}.`
        : 'That time is already booked. Please choose another opening.'

      addMessage(payload.phone, 'assistant', conflictReply)

      return NextResponse.json(
        {
          success: false,
          error: 'Selected time collides with an existing meeting',
          message: conflictReply,
          conflict: result.conflict,
          suggestions: result.suggestions,
        },
        { status: 409 }
      )
    }

    const confirmation = `You're booked for ${result.appointment.dateLabel} at ${result.appointment.startLabel}. We'll see you then.`
    addMessage(payload.phone, 'assistant', confirmation)

    return NextResponse.json(
      {
        success: true,
        message: confirmation,
        appointment: result.appointment,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
