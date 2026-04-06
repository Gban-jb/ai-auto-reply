import { NextResponse } from 'next/server'
import { getBusinessOverview, getConversation, getLead } from '@/lib/store'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const scenarioId = searchParams.get('scenarioId') || 'mr-rooter'
  const day = searchParams.get('day') || undefined

  const overview = getBusinessOverview({ scenarioId, day })
  const selectedPhone =
    searchParams.get('phone') ||
    overview.queue[0]?.phone ||
    overview.upcomingAppointments[0]?.phone ||
    null

  return NextResponse.json({
    ...overview,
    selectedPhone,
    selectedConversation: selectedPhone
      ? {
          messages: getConversation(selectedPhone),
          lead: getLead(selectedPhone),
        }
      : null,
  })
}
