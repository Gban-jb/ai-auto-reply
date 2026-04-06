import { NextResponse } from 'next/server'
import { generateReply } from '@/lib/ai'
import { addMessage, saveLead } from '@/lib/store'

export async function POST(request) {
  try {
    const {
      phone,
      scenarioId,
      businessConfig,
      customerName,
      address,
      serviceType,
      priority,
    } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'phone is required' },
        { status: 400 }
      )
    }

    console.log('\n' + '━'.repeat(44))
    console.log('📞 MISSED CALL SIMULATED')
    console.log('   Phone:    ', phone)
    console.log('   Scenario: ', scenarioId || 'default')
    console.log('   Business: ', businessConfig?.name)
    console.log('   Time:     ', new Date().toLocaleTimeString())

    const started = Date.now()

    const aiMessage = await generateReply([], businessConfig)

    addMessage(phone, 'assistant', aiMessage)
    saveLead(phone, {
      phone,
      scenarioId: scenarioId || 'custom',
      businessName: businessConfig?.name || process.env.BUSINESS_NAME,
      industry: businessConfig?.industry,
      customerName: customerName || '',
      address: address || '',
      serviceType: serviceType || '',
      priority: priority || 'normal',
      status: 'new',
      queueStatus: 'new-call',
      missedCallAt: Date.now(),
    })

    const responseTimeMs = Date.now() - started

    console.log('🤖 AI replied in', responseTimeMs + 'ms')
    console.log('   "' + aiMessage + '"')
    console.log('━'.repeat(44) + '\n')

    return NextResponse.json({
      success: true,
      message: aiMessage,
      responseTimeMs,
      phone,
    })

  } catch (error) {
    console.error('❌ missed-call error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Missed call endpoint active',
    method: 'POST',
    expects: { phone: 'string', scenarioId: 'string', businessConfig: 'object' },
  })
}
