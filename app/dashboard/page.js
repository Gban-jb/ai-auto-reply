'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SCENARIOS } from '@/lib/scenarios'
import Navbar from '@/components/Navbar'

export default function DashboardPage() {
  // State management
  const [conversations, setConversations] = useState([])
  const [stats, setStats] = useState({ totalLeads: 0, activeConversations: 0, totalMessages: 0, activeClients: 0 })
  const [selectedPhone, setSelectedPhone] = useState(null)
  const [selectedMsgs, setSelectedMsgs] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Helper functions
  const relativeTime = (timestamp) => {
    if (!timestamp) return ''
    const now = new Date()
    const then = new Date(timestamp)
    const seconds = Math.floor((now - then) / 1000)

    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return then.toLocaleDateString()
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const getLastMessage = (conv) => {
    if (!conv.messages || conv.messages.length === 0) return ''
    const lastMsg = conv.messages[conv.messages.length - 1]
    return lastMsg.content || ''
  }

  const getScenarioForConv = (conv) => {
    const businessName = conv.lead?.businessName || conv.businessName || ''
    const phone = conv.phone || ''

    for (const scenario of SCENARIOS) {
      if (businessName && scenario.businessName && businessName.toLowerCase().includes(scenario.businessName.toLowerCase())) {
        return scenario
      }
      if (phone && scenario.phone && phone.includes(scenario.phone)) {
        return scenario
      }
    }
    return null
  }

  const filteredConversations = conversations.filter((conv) => {
    const phone = conv.phone || ''
    const businessName = conv.lead?.businessName || conv.businessName || ''
    const searchLower = search.toLowerCase()
    return phone.includes(searchLower) || businessName.toLowerCase().includes(searchLower)
  })

  // API calls
  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
      setStats(data.stats || { totalLeads: 0, activeConversations: 0, totalMessages: 0, activeClients: 0 })
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchConversation = useCallback(async (phone) => {
    try {
      const res = await fetch(`/api/conversations?phone=${encodeURIComponent(phone)}`)
      const data = await res.json()
      setSelectedMsgs(data.messages || [])
      setSelectedLead(data.lead || null)
    } catch (err) {
      console.error('Failed to fetch conversation:', err)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchAll()
    if (selectedPhone) {
      await fetchConversation(selectedPhone)
    }
    setRefreshing(false)
  }, [fetchAll, fetchConversation, selectedPhone])

  const handleClear = useCallback(
    async (phone, e) => {
      e.stopPropagation()
      if (confirm('Are you sure you want to delete this conversation?')) {
        try {
          await fetch(`/api/conversations?phone=${encodeURIComponent(phone)}`, {
            method: 'DELETE',
          })
          setConversations((prev) => prev.filter((conv) => conv.phone !== phone))
          if (selectedPhone === phone) {
            setSelectedPhone(null)
            setSelectedMsgs([])
            setSelectedLead(null)
          }
        } catch (err) {
          console.error('Failed to delete conversation:', err)
        }
      }
    },
    [selectedPhone]
  )

  const handleSelectConversation = useCallback(
    (phone) => {
      setSelectedPhone(phone)
      fetchConversation(phone)
    },
    [fetchConversation]
  )

  // Effects
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAll()
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchAll])

  return (
    <div className="min-h-screen bg-navy bg-gradient-mesh text-white">
      {/* Navbar */}
      <Navbar />

      {/* Stats Bar */}
      <div className="border-b border-white/10 bg-navy/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Leads */}
            <div className="animate-fade-in-down glass rounded-xl p-4 fill-mode-both delay-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Total Leads</p>
                  <p className="text-2xl font-bold text-white">{stats.totalLeads || 0}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>

            {/* Active Conversations */}
            <div className="animate-fade-in-down glass rounded-xl p-4 fill-mode-both delay-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Active Conversations</p>
                  <p className="text-2xl font-bold text-white">{stats.activeConversations || 0}</p>
                </div>
                <div className="text-3xl">💬</div>
              </div>
            </div>

            {/* Total Messages */}
            <div className="animate-fade-in-down glass rounded-xl p-4 fill-mode-both delay-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Total Messages</p>
                  <p className="text-2xl font-bold text-white">{stats.totalMessages || 0}</p>
                </div>
                <div className="text-3xl">📨</div>
              </div>
            </div>

            {/* Active Clients */}
            <div className="animate-fade-in-down glass rounded-xl p-4 fill-mode-both delay-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Active Clients</p>
                  <p className="text-2xl font-bold text-white">{stats.activeClients || 0}</p>
                </div>
                <div className="text-3xl">⭐</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="hidden w-80 flex-shrink-0 lg:flex">
            <div className="glass-card w-full rounded-2xl p-6">
              {/* Sidebar Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Conversations
                  <span className="ml-2 inline-block rounded-full bg-teal/30 px-2.5 py-0.5 text-sm font-semibold text-teal">
                    {filteredConversations.length}
                  </span>
                </h2>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-white/60 hover:text-teal disabled:opacity-50"
                  title="Refresh"
                >
                  <svg
                    className={`h-5 w-5 transition-transform ${refreshing ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Search Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by phone or business..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 transition-all focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal/50"
                />
              </div>

              {/* Conversations List */}
              <div className="flex flex-col gap-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border border-teal/30 border-t-teal" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-3xl mb-2">📬</div>
                    <p className="text-white/60 text-sm mb-3">No conversations yet</p>
                    <Link href="/demo" className="text-teal hover:text-mint text-sm font-medium transition-colors">
                      Try the demo →
                    </Link>
                  </div>
                ) : (
                  filteredConversations.map((conv, idx) => {
                    const scenario = getScenarioForConv(conv)
                    const businessName = conv.lead?.businessName || conv.businessName || 'Unknown'
                    const status = conv.lead?.status || 'new'
                    const lastMsg = getLastMessage(conv)
                    const isSelected = selectedPhone === conv.phone

                    return (
                      <button
                        key={conv.phone}
                        onClick={() => handleSelectConversation(conv.phone)}
                        className={`animate-stagger-in group relative rounded-xl p-4 text-left transition-all fill-mode-both ${
                          idx % 4 === 0 ? 'delay-100' : idx % 4 === 1 ? 'delay-200' : idx % 4 === 2 ? 'delay-300' : 'delay-400'
                        } ${
                          isSelected
                            ? 'glass-strong border border-teal bg-teal/10 shadow-lg shadow-teal/20'
                            : 'glass hover:glass-strong border border-white/10 hover:border-teal/30'
                        }`}
                      >
                        {/* Scenario Emoji + Business Name + Status */}
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0">{scenario?.emoji || '🏢'}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-white truncate">{businessName}</p>
                            </div>
                          </div>
                          <span
                            className={`flex-shrink-0 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                              status === 'active' ? 'bg-mint/20 text-mint' : 'bg-orange/20 text-orange'
                            }`}
                          >
                            {status === 'active' ? 'Active' : 'New'}
                          </span>
                        </div>

                        {/* Phone Number */}
                        <p className="mb-2 text-xs font-mono text-white/50">{conv.phone}</p>

                        {/* Last Message Preview */}
                        <p className="mb-3 line-clamp-2 text-xs text-white/50">{lastMsg || '(no messages)'}</p>

                        {/* Footer: Message Count + Time + Clear Button */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-white/40">{(conv.messages || []).length} msgs • {relativeTime(conv.lastMessageTime)}</span>
                          <button
                            onClick={(e) => handleClear(conv.phone, e)}
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 rounded-full p-1 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
                            title="Delete conversation"
                          >
                            ✕
                          </button>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border border-teal/30 border-t-teal" />
                </div>
              </div>
            ) : conversations.length === 0 ? (
              // Empty state - no conversations
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="inline-block">
                  <div className="text-6xl mb-4">📬</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No conversations yet</h3>
                  <p className="text-white/60 mb-6">Your conversations will appear here once you start receiving messages</p>
                  <Link
                    href="/demo"
                    className="inline-block rounded-lg bg-gradient-to-r from-teal to-mint px-6 py-2.5 font-semibold text-navy hover-lift transition-all"
                  >
                    Open Demo →
                  </Link>
                </div>
              </div>
            ) : !selectedPhone ? (
              // No selection state
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">👈</div>
                <h3 className="text-2xl font-bold text-white mb-2">Select a conversation</h3>
                <p className="text-white/60">Choose a conversation from the sidebar to view and manage messages</p>
              </div>
            ) : (
              // Selected conversation
              <div className="glass-card rounded-2xl p-0 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                {/* Conversation Header */}
                <div className="border-b border-white/10 bg-white/5 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      {getScenarioForConv(conversations.find((c) => c.phone === selectedPhone)) && (
                        <span className="text-lg">{getScenarioForConv(conversations.find((c) => c.phone === selectedPhone))?.emoji}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white truncate">
                          {selectedLead?.businessName || conversations.find((c) => c.phone === selectedPhone)?.businessName || 'Conversation'}
                        </h3>
                      </div>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 ${
                          selectedLead?.status === 'active' ? 'bg-mint/20 text-mint' : 'bg-orange/20 text-orange'
                        }`}
                      >
                        {selectedLead?.status === 'active' ? 'Active' : 'New'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      handleClear(selectedPhone, e)
                    }}
                    className="flex-shrink-0 rounded-lg p-2 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    title="Delete conversation"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Phone + Message Count + Time */}
                <div className="border-b border-white/10 bg-white/[0.02] px-6 py-2 flex items-center gap-4 flex-shrink-0 text-xs text-white/50">
                  <span className="font-mono">{selectedPhone}</span>
                  <span>•</span>
                  <span>{selectedMsgs.length} messages</span>
                  {conversations.find((c) => c.phone === selectedPhone)?.lastMessageTime && (
                    <>
                      <span>•</span>
                      <span>Last: {relativeTime(conversations.find((c) => c.phone === selectedPhone)?.lastMessageTime)}</span>
                    </>
                  )}
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
                  {selectedMsgs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-white/40">
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    selectedMsgs.map((msg, idx) => {
                      const isAI = msg.sender === 'ai' || msg.role === 'assistant'

                      return (
                        <div
                          key={idx}
                          className={`animate-fade-in-up flex ${isAI ? 'justify-start' : 'justify-end'} fill-mode-both ${
                            idx % 2 === 0 ? 'delay-100' : idx % 2 === 1 ? 'delay-200' : ''
                          }`}
                        >
                          <div className={`max-w-xs ${isAI ? 'mr-auto' : 'ml-auto'}`}>
                            <p className="mb-1 text-xs text-white/50 px-2">
                              {isAI ? 'AI Assistant' : 'Customer'} • {formatTime(msg.timestamp)}
                            </p>
                            <div
                              className={`rounded-2xl px-4 py-3 break-words ${
                                isAI
                                  ? 'chat-bubble-ai bg-white/10 text-white'
                                  : 'chat-bubble-user bg-gradient-to-r from-teal to-mint text-navy font-medium'
                              }`}
                            >
                              {msg.content || msg.text || '(empty message)'}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
