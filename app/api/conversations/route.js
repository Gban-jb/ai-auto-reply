import { NextResponse } from 'next/server'
import {
  getConversation,
  getLead,
  getAllConversations,
  getStats,
  clearConversation,
} from '@/lib/store'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')

  if (phone) {
    return NextResponse.json({
      messages: getConversation(phone),
      lead: getLead(phone),
    })
  }

  const conversations = getAllConversations()
  return NextResponse.json({
    conversations,
    stats: getStats(),
    total: conversations.length,
  })
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')

  if (!phone) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 })
  }

  clearConversation(phone)
  return NextResponse.json({ success: true, message: 'Conversation cleared' })
}
