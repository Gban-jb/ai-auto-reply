import { NextResponse } from 'next/server'
import { generateReply } from '@/lib/ai'
import { addMessage, getConversation, saveLead } from '@/lib/store'

export async function POST(request) {
  try {
    const { phone, message, businessConfig } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'phone is required' }, { status: 400 })
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    console.log('\n💬 CUSTOMER REPLY')
    console.log('   From:    ', phone)
    console.log('   Message: "' + message + '"')

    addMessage(phone, 'user', message)

    const history = getConversation(phone)
    const formatted = history.map(({ role, content }) => ({ role, content }))

    const aiReply = await generateReply(formatted, businessConfig)

    addMessage(phone, 'assistant', aiReply)
    saveLead(phone, {
      status: 'active',
      lastCustomerMessage: message,
      lastReplyAt: Date.now(),
    })

    console.log('🤖 AI REPLY: "' + aiReply + '"')
    console.log('━'.repeat(44) + '\n')

    return NextResponse.json({ success: true, reply: aiReply, phone })

  } catch (error) {
    console.error('❌ sms-reply error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'SMS reply endpoint active' })
}
