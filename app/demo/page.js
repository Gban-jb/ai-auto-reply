'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SCENARIOS } from '@/lib/scenarios';
import Navbar from '@/components/Navbar';
import DemoVideo from '@/components/DemoVideo';

function DemoPageContent() {
  // State
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [calling, setCalling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseTimeMs, setResponseTimeMs] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const searchParams = useSearchParams();

  // Effects
  useEffect(() => {
    const clientParam = searchParams.get('client');
    const scenario = clientParam
      ? SCENARIOS.find((s) => s.id === clientParam)
      : SCENARIOS[0];
    if (scenario) {
      setSelectedScenario(scenario);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Functions
  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setCalling(false);
    setLoading(false);
    setResponseTimeMs(null);
    setInputMessage('');
    setError(null);
  };

  const handleSimulateMissedCall = async () => {
    if (!selectedScenario || calling || loading) return;

    setCalling(true);
    setError(null);
    setResponseTimeMs(null);

    try {
      const startTime = Date.now();

      const response = await fetch('/api/missed-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedScenario.phone,
          scenarioId: selectedScenario.id,
          businessConfig: {
            name: selectedScenario.businessName,
            industry: selectedScenario.industry,
            context: selectedScenario.context,
          },
        }),
      });

      const elapsed = Date.now() - startTime;

      if (!response.ok) {
        throw new Error('Failed to simulate missed call');
      }

      const data = await response.json();

      setMessages([
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ]);

      setResponseTimeMs(elapsed);
    } catch (err) {
      setError(err.message || 'Error simulating missed call');
    } finally {
      setCalling(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedScenario || loading || messages.length === 0) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    setLoading(true);
    setError(null);

    try {
      const startTime = Date.now();

      const response = await fetch('/api/sms-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedScenario.phone,
          message: userMessage,
          businessConfig: {
            name: selectedScenario.businessName,
            industry: selectedScenario.industry,
            context: selectedScenario.context,
          },
        }),
      });

      const elapsed = Date.now() - startTime;

      if (!response.ok) {
        throw new Error('Failed to get AI reply');
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || data.message,
          timestamp: new Date(),
        },
      ]);

      setResponseTimeMs(elapsed);
    } catch (err) {
      setError(err.message || 'Error getting AI reply');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
  };

  const handleSendKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedScenario) {
    return (
      <div className="bg-navy min-h-screen flex items-center justify-center">
        <div className="animate-fade-in-up fill-mode-both">
          <p className="text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full px-6 py-8 flex flex-col animate-fade-in-up fill-mode-both">
          {/* Client Selector */}
          <div className="mb-6 animate-fade-in-up fill-mode-both delay-100">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <p className="text-slate-500 text-xs font-mono uppercase mb-4 tracking-widest">
                Select a Business
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {SCENARIOS.map((scenario, idx) => (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario)}
                  className={`group flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-300 animate-fade-in-up fill-mode-both hover:-translate-y-0.5 ${
                    selectedScenario.id === scenario.id
                      ? 'bg-white'
                      : 'bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                  style={{
                    animationDelay: `${idx * 50}ms`,
                    borderColor:
                      selectedScenario.id === scenario.id
                        ? scenario.color
                        : '#E2E8F0',
                    boxShadow:
                      selectedScenario.id === scenario.id
                        ? `0 14px 36px ${scenario.color}22`
                        : '0 8px 24px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{
                      backgroundColor: `${scenario.color}16`,
                      color: scenario.color,
                    }}
                  >
                    {scenario.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {scenario.label}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {scenario.industry}
                    </span>
                  </span>
                  <span
                    className="text-lg leading-none"
                    style={{
                      color:
                        selectedScenario.id === scenario.id
                          ? scenario.color
                          : '#94A3B8',
                    }}
                  >
                    ›
                  </span>
                </button>
              ))}
            </div>
            </div>
          </div>

          {/* Animated Demo Video */}
          <div className="mb-8 animate-fade-in-up fill-mode-both delay-200">
            <div className="text-center mb-4">
              <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-1">How It Works</p>
              <h3 className="text-white text-lg font-bold">Watch the Full Missed-Call Recovery Flow</h3>
            </div>
            <DemoVideo
              businessName={selectedScenario.businessName}
              businessEmoji={selectedScenario.emoji}
              color={selectedScenario.color}
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 flex-1 min-h-0">
            {/* Left Sidebar - Business Info Panel */}
            <div className="animate-fade-in-left fill-mode-both delay-100">
              <div className="h-full overflow-y-auto flex flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-0">
                {/* Hero Image */}
                {selectedScenario.heroImage && (
                  <div className="relative h-40 overflow-hidden rounded-t-2xl">
                    <img
                      src={selectedScenario.heroImage}
                      alt={selectedScenario.businessName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
                  </div>
                )}

                <div className="flex-1 flex flex-col p-5">
                  {/* Business Header */}
                  <div className="flex items-start gap-3 mb-5 animate-scale-in fill-mode-both delay-200">
                    <div
                      className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${selectedScenario.color}20`,
                      }}
                    >
                      {selectedScenario.emoji}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-lg text-slate-900 leading-tight">
                        {selectedScenario.businessName}
                      </h2>
                      <p className="text-slate-500 text-xs font-mono mt-1">
                        {selectedScenario.industry}
                      </p>
                      <p className="text-slate-600 text-xs mt-1 leading-snug">
                        {selectedScenario.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 my-4" />

                  {/* Info Rows */}
                  <div className="space-y-3 mb-5 animate-fade-in-left fill-mode-both delay-200">
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">📍</span>
                      <p className="text-slate-600 text-xs leading-snug">
                        {selectedScenario.address}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">📞</span>
                      <p className="text-slate-600 text-xs font-mono">
                        {selectedScenario.phone}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">🕐</span>
                      <p className="text-slate-600 text-xs leading-snug">
                        {selectedScenario.hours}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">🌐</span>
                      <a
                        href={selectedScenario.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal text-xs hover:text-sky-600 transition-colors hover-scale"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 my-4" />

                  {/* Simulate Button */}
                  <button
                    onClick={handleSimulateMissedCall}
                    disabled={calling || loading}
                    className="w-full relative overflow-hidden rounded-xl py-3 text-sm font-bold text-navy transition-all duration-300 mb-3 hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none animate-fade-in-up fill-mode-both delay-300"
                    style={{
                      background: `linear-gradient(135deg, #00C8D4 0%, #00F0B5 100%)`,
                    }}
                  >
                    {calling ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-navy animate-bounce" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      '📞 Simulate Missed Call'
                    )}
                  </button>

                  {/* Response Time */}
                  {responseTimeMs !== null && (
                    <div className="text-emerald-600 text-xs font-mono text-center mb-4 animate-scale-in fill-mode-both">
                      ⚡ {responseTimeMs}ms response time
                    </div>
                  )}

                  {responseTimeMs !== null && <div className="border-t border-slate-200 my-4" />}

                  {/* Quick Replies */}
                  <div className="animate-fade-in-left fill-mode-both delay-400">
                    <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-3">
                      Quick Replies
                    </p>
                    <div className="flex flex-col gap-2 animate-stagger-in fill-mode-both">
                      {selectedScenario.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(reply)}
                          disabled={messages.length === 0}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700 hover:border-slate-300 hover:bg-slate-50 text-left transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover-scale animate-fade-in-left fill-mode-both"
                          style={{
                            animationDelay: `${200 + idx * 50}ms`,
                          }}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Chat Window */}
            <div className="animate-fade-in-right fill-mode-both delay-100">
              <div className="h-full rounded-2xl overflow-hidden flex flex-col border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                {/* Chat Header */}
                <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg animate-scale-in fill-mode-both delay-200"
                      style={{
                        backgroundColor: `${selectedScenario.color}`,
                        color: '#04111F',
                      }}
                    >
                      {selectedScenario.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-base text-white">
                        {selectedScenario.businessName}
                      </p>
                      <p className="text-white/30 text-[11px] font-mono">AI Auto-Reply</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-mint rounded-full animate-pulse" />
                    <p className="text-mint text-xs font-medium">Online</p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 bg-slate-950">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in-up fill-mode-both delay-300">
                      <div className="text-6xl opacity-20 animate-float">📞</div>
                      <div className="text-center">
                        <p className="text-white/40 text-sm font-medium">
                          Simulate a missed call to start
                        </p>
                        <p className="text-white/20 text-xs mt-2">
                          The AI will text back as {selectedScenario.businessName}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => {
                        const isAssistant = msg.role === 'assistant';
                        const timeStr = msg.timestamp.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={idx}
                            className={`flex flex-col gap-1.5 ${
                              isAssistant ? 'items-start' : 'items-end'
                            } animate-scale-in fill-mode-both`}
                            style={{
                              animationDelay: `${idx * 100}ms`,
                            }}
                          >
                            <p className="text-white/25 text-[10px] font-mono px-1">
                              {isAssistant
                                ? `${selectedScenario.businessName} · AI · ${timeStr}`
                                : `You · ${timeStr}`}
                            </p>
                            <div
                              className={`rounded-2xl px-5 py-3 text-white/90 text-sm leading-relaxed max-w-[85%] backdrop-blur-sm transition-all duration-300 ${
                                isAssistant
                                  ? 'glass-card rounded-bl-none'
                                  : 'bg-gradient-to-r from-teal/40 to-mint/20 border border-teal/30 rounded-br-none'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        );
                      })}

                      {loading && (
                        <div className="flex items-center gap-2 px-5 py-3 bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none self-start animate-fade-in-up fill-mode-both">
                          <div
                            className="w-2 h-2 bg-teal rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="w-2 h-2 bg-teal rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="w-2 h-2 bg-teal rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mx-6 mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-xl backdrop-blur-sm animate-fade-in-up fill-mode-both">
                    {error}
                  </div>
                )}

                {/* Input Bar */}
                <div className="border-t border-slate-200 bg-white p-4 flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleSendKeyDown}
                    disabled={messages.length === 0 || loading}
                    placeholder="Reply as the customer..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-teal/60 focus:ring-1 focus:ring-teal/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      !inputMessage.trim() || loading || messages.length === 0
                    }
                    className="relative overflow-hidden rounded-xl px-6 py-3 text-sm font-bold text-navy transition-all duration-300 hover-scale disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    style={{
                      background: `linear-gradient(135deg, #00C8D4 0%, #00F0B5 100%)`,
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-50 min-h-screen flex items-center justify-center">
          <p className="text-slate-500 text-sm font-medium">Loading demo...</p>
        </div>
      }
    >
      <DemoPageContent />
    </Suspense>
  );
}
