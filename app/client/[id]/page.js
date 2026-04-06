'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { SCENARIOS } from '@/lib/scenarios'
import Navbar from '@/components/Navbar'

export default function ClientDetailPage() {
  const params = useParams()
  const { id } = params
  const scenario = SCENARIOS.find(s => s.id === id) || null
  const [conversations, setConversations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!scenario) return

    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/conversations')
        const data = await res.json()

        const allConvos = data.conversations || []
        const filtered = allConvos.filter(
          c => c.businessName === scenario.businessName
        )
        setConversations(filtered)
        setStats(data.stats || {})
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [scenario])

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Client Not Found</h1>
          <p className="text-gray-400 mb-8">
            The client you're looking for doesn't exist.
          </p>
          <Link href="/admin" className="btn-primary inline-block">
            Back to Admin
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      {/* HERO BANNER */}
      <section className="relative h-72 overflow-hidden">
        {/* Background Image */}
        <img
          src={scenario.heroImage}
          alt={scenario.businessName}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Gradient Overlay - fades from transparent to navy */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-fade-in fill-mode-both">
          {/* Emoji */}
          <div className="text-7xl mb-4 animate-float">{scenario.emoji}</div>

          {/* Business Name */}
          <h1 className="text-4xl font-bold mb-3 max-w-3xl">{scenario.businessName}</h1>

          {/* Industry Badge */}
          <div
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              background: `${scenario.color}20`,
              color: scenario.color,
              border: `1px solid ${scenario.color}40`,
            }}
          >
            {scenario.industry}
          </div>

          {/* Tagline */}
          <p className="text-gray-300 mt-4 max-w-2xl text-lg">{scenario.tagline}</p>
        </div>
      </section>

      {/* QUICK INFO BAR */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Phone */}
            <div
              className="glass rounded-xl p-6 animate-fade-in-up fill-mode-both delay-100"
            >
              <div className="text-2xl mb-2">📞</div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Phone</p>
              <a
                href={`tel:${scenario.phone}`}
                className="font-semibold hover:text-teal transition"
              >
                {scenario.phone}
              </a>
            </div>

            {/* Email */}
            <div
              className="glass rounded-xl p-6 animate-fade-in-up fill-mode-both delay-200"
            >
              <div className="text-2xl mb-2">📧</div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Email</p>
              <a
                href={`mailto:${scenario.email}`}
                className="font-semibold hover:text-teal transition break-all"
              >
                {scenario.email}
              </a>
            </div>

            {/* Address */}
            <div
              className="glass rounded-xl p-6 animate-fade-in-up fill-mode-both delay-300"
            >
              <div className="text-2xl mb-2">📍</div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Address</p>
              <p className="font-semibold text-sm">{scenario.address}</p>
            </div>

            {/* Hours */}
            <div
              className="glass rounded-xl p-6 animate-fade-in-up fill-mode-both delay-400"
            >
              <div className="text-2xl mb-2">⏰</div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Hours</p>
              <p className="font-semibold text-sm">{scenario.hours}</p>
            </div>

            {/* Website */}
            <div
              className="glass rounded-xl p-6 animate-fade-in-up fill-mode-both delay-500"
            >
              <div className="text-2xl mb-2">🌐</div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Website</p>
              <a
                href={scenario.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm hover:text-teal transition"
              >
                Visit Site
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-6xl mx-auto"></div>

      {/* ABOUT SECTION & SERVICES */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-2xl p-8 animate-fade-in-left fill-mode-both">
            <h2 className="text-3xl font-bold mb-6">About</h2>
            <p className="text-gray-300 leading-relaxed mb-8">{scenario.context}</p>

            {/* Services Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <div className="flex flex-wrap gap-3">
                {scenario.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 hover-lift"
                    style={{
                      background: `${scenario.color}15`,
                      color: scenario.color,
                      border: `1px solid ${scenario.color}40`,
                    }}
                  >
                    {service}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-6xl mx-auto"></div>

      {/* AI CONFIGURATION */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-2xl p-8 animate-fade-in-right fill-mode-both">
            <h2 className="text-3xl font-bold mb-6">AI Configuration</h2>

            {/* System Prompt */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">System Prompt</h3>
              <div className="bg-black/30 rounded-xl p-4 overflow-x-auto font-mono text-xs leading-relaxed text-gray-300 border border-gray-700/50">
                <pre>{scenario.context}</pre>
              </div>
            </div>

            {/* Quick Reply Templates */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Reply Templates</h3>
              <div className="space-y-3">
                {scenario.quickReplies.map((reply, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors cursor-pointer hover-lift"
                    style={{
                      background: `${scenario.color}08`,
                      borderColor: `${scenario.color}20`,
                    }}
                  >
                    <p className="text-sm text-gray-300">{reply}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-6xl mx-auto"></div>

      {/* CONVERSATION HISTORY */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-2xl p-8 animate-fade-in-up fill-mode-both">
            <h2 className="text-3xl font-bold mb-6">Conversation History</h2>

            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">
                  No conversations yet. Test the AI to generate some.
                </p>
                <Link
                  href={`/demo?client=${id}`}
                  className="btn-primary inline-block"
                >
                  Start Test Conversation
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conv, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-700/30 rounded-lg p-4 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{conv.phone || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">
                          {conv.messageCount || conv.messages?.length || 0} messages
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {relativeTime(conv.lastUpdated || conv.timestamp)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {conv.lastMessage || (conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content : 'No messages')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-6xl mx-auto"></div>

      {/* CTA SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Test?</h2>
          <p className="text-gray-400 mb-8">
            Experience how the AI responds to customer inquiries for {scenario.businessName}.
          </p>
          <Link href={`/demo?client=${id}`} className="btn-primary inline-block text-lg">
            Test AI for {scenario.emoji}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>AI Auto-Reply Demo Platform</p>
        </div>
      </footer>
    </div>
  )
}

/**
 * Helper function to format relative time
 * @param {string|number|Date} timestamp
 * @returns {string} Relative time string (e.g., "2m ago", "1h ago")
 */
function relativeTime(timestamp) {
  if (!timestamp) return 'Recently'

  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString()
}
