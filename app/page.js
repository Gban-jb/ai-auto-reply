'use client';

import Link from 'next/link';
import { SCENARIOS } from '@/lib/scenarios';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';

export default function Home() {
  // Animated stats counter
  const [clientCount, setClientCount] = useState(0);
  const [responseTime, setResponseTime] = useState(0);

  useEffect(() => {
    // Animate client count
    const interval1 = setInterval(() => {
      setClientCount((prev) => (prev < 9 ? prev + 1 : 9));
    }, 50);

    // Animate response time
    const interval2 = setInterval(() => {
      setResponseTime((prev) => (prev < 2 ? prev + 0.1 : 2));
    }, 30);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);

  // Chat messages for demo preview
  const chatMessages = [
    { type: 'user', text: 'Hi, I need a plumbing estimate for my kitchen' },
    { type: 'ai', text: 'Hey! Thanks for reaching out. I\'d love to help. What\'s the issue you\'re experiencing?' },
    { type: 'user', text: 'There\'s a leak under my sink' },
    { type: 'ai', text: 'Got it! I can schedule someone to come look at that. Are you available tomorrow between 9am-12pm?' },
    { type: 'user', text: 'Yes, that works!' },
    { type: 'ai', text: 'Perfect! I\'ve scheduled your appointment. Someone will be there tomorrow at 10am. Your address is on file. See you then!' },
  ];

  return (
    <div className="bg-white text-gray-900 min-h-screen overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar />

      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="relative bg-gradient-hero min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Blob 1 - Teal */}
          <div
            className="absolute w-96 h-96 rounded-full blur-3xl animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(0,200,212,0.15) 0%, rgba(0,200,212,0.05) 100%)',
              top: '-10%',
              right: '10%',
              animationDuration: '12s',
            }}
          ></div>

          {/* Blob 2 - Mint */}
          <div
            className="absolute w-80 h-80 rounded-full blur-3xl animate-float-slow"
            style={{
              background: 'radial-gradient(circle, rgba(0,240,181,0.12) 0%, rgba(0,240,181,0.02) 100%)',
              bottom: '5%',
              left: '5%',
              animationDuration: '14s',
            }}
          ></div>

          {/* Blob 3 - Purple accent */}
          <div
            className="absolute w-72 h-72 rounded-full blur-3xl animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.02) 100%)',
              top: '40%',
              left: '50%',
              transform: 'translateX(-50%)',
              animationDuration: '16s',
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Animated Badge */}
          <div
            className="inline-block glass rounded-full px-4 py-2 text-xs text-white/70 font-mono mb-8 animate-fade-in-down fill-mode-both"
            style={{ animationDelay: '0ms' }}
          >
            ⚡ Powered by GPT-4o-mini
          </div>

          {/* Main Heading with gradient text */}
          <h1
            className="text-6xl md:text-7xl font-black leading-tight mb-6 animate-fade-in-up fill-mode-both"
            style={{ animationDelay: '100ms' }}
          >
            Never Lose a Customer to a{' '}
            <span className="text-gradient">Missed Call</span> Again
          </h1>

          {/* Subtitle */}
          <p
            className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-10 animate-fade-in-up fill-mode-both"
            style={{ animationDelay: '200ms' }}
          >
            AI-powered SMS that instantly texts back your missed callers, handles the full conversation, and books appointments — while you focus on the job.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up fill-mode-both"
            style={{ animationDelay: '300ms' }}
          >
            <Link
              href="/demo"
              className="btn-primary inline-flex items-center justify-center text-lg hover-lift"
            >
              Try Live Demo →
            </Link>
            <Link
              href="/admin"
              className="btn-outline inline-flex items-center justify-center text-lg hover-lift"
            >
              View All Clients →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ANIMATED STATS ROW
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat 1 - Active Clients */}
          <div
            className="glass-card rounded-2xl p-8 text-center glow-teal hover-lift animate-stagger-in fill-mode-both"
            style={{ animationDelay: '100ms' }}
          >
            <div className="text-5xl font-black text-gradient mb-2">
              {clientCount}
            </div>
            <div className="text-white/60 font-medium">Active Clients</div>
          </div>

          {/* Stat 2 - 24/7 Coverage */}
          <div
            className="glass-card rounded-2xl p-8 text-center glow-teal hover-lift animate-stagger-in fill-mode-both"
            style={{ animationDelay: '200ms' }}
          >
            <div className="text-5xl font-black text-gradient mb-2">
              24/7
            </div>
            <div className="text-white/60 font-medium">AI Coverage</div>
          </div>

          {/* Stat 3 - Response Time */}
          <div
            className="glass-card rounded-2xl p-8 text-center glow-teal hover-lift animate-stagger-in fill-mode-both"
            style={{ animationDelay: '300ms' }}
          >
            <div className="text-5xl font-black text-gradient mb-2">
              {responseTime.toFixed(1)}s
            </div>
            <div className="text-white/60 font-medium">Avg Response</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LIVE DEMO PREVIEW
          ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up fill-mode-both">
            See It <span className="text-gradient">In Action</span>
          </h2>
          <p className="text-slate-600 text-lg animate-fade-in-up fill-mode-both" style={{ animationDelay: '100ms' }}>
            Watch how AI Auto-Reply turns missed calls into booked appointments
          </p>
        </div>

        <div className="flex justify-center animate-fade-in-up fill-mode-both" style={{ animationDelay: '200ms' }}>
          {/* iPhone Frame */}
          <div className="relative w-full max-w-sm">
            {/* Phone body */}
            <div
              className="glass-card rounded-[40px] border-8 p-3 aspect-[9/19] overflow-hidden"
              style={{ borderColor: 'rgba(0, 200, 212, 0.2)' }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-navy2 rounded-b-3xl z-20"></div>

              {/* Screen */}
              <div className="w-full h-full bg-navy rounded-3xl overflow-y-auto scrollbar-hide">
                {/* Chat content */}
                <div className="p-4 pt-8 flex flex-col gap-4 pb-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up fill-mode-both`}
                      style={{ animationDelay: `${400 + idx * 150}ms` }}
                    >
                      <div
                        className={`${
                          msg.type === 'user'
                            ? 'chat-bubble-user'
                            : 'chat-bubble-ai'
                        } px-4 py-2 max-w-xs text-sm text-white`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up fill-mode-both">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-slate-600 text-lg animate-fade-in-up fill-mode-both" style={{ animationDelay: '100ms' }}>
            Three simple steps to never lose a customer again
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 - Missed Call */}
          <div
            className="glass-card rounded-2xl p-8 hover-lift animate-fade-in-left fill-mode-both"
            style={{ animationDelay: '200ms' }}
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange/20 to-orange/5 flex items-center justify-center border border-orange/20 mx-auto">
                <span className="text-4xl">📞</span>
              </div>
            </div>
            <div className="text-center font-mono text-sm text-gradient mb-3">Step 01</div>
            <h3 className="text-xl font-bold text-white mb-3 text-center">Missed Call</h3>
            <p className="text-white/60 text-center text-sm">
              Customer calls your business. You're busy on the job and can't answer.
            </p>
          </div>

          {/* Connector arrow - hidden on mobile */}
          <div className="hidden md:flex absolute top-1/3 left-1/3 right-auto transform -translate-y-1/2 pointer-events-none">
            <div
              className="text-3xl text-slate-300 font-bold"
              style={{
                position: 'absolute',
                left: '50%',
                top: '-30px',
                transform: 'translateX(-50%)',
              }}
            >
              ↓
            </div>
          </div>

          {/* Step 2 - AI Texts Back */}
          <div
            className="glass-card rounded-2xl p-8 hover-lift animate-fade-in-up fill-mode-both"
            style={{ animationDelay: '300ms' }}
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal/20 to-mint/5 flex items-center justify-center border border-teal/20 mx-auto">
                <span className="text-4xl">🤖</span>
              </div>
            </div>
            <div className="text-center font-mono text-sm text-gradient mb-3">Step 02</div>
            <h3 className="text-xl font-bold text-white mb-3 text-center">AI Texts Back</h3>
            <p className="text-white/60 text-center text-sm">
              Within seconds, GPT-4o-mini sends a warm, personalized SMS automatically.
            </p>
          </div>

          {/* Connector arrow - hidden on mobile */}
          <div className="hidden md:flex absolute top-1/3 right-1/3 left-auto transform -translate-y-1/2 pointer-events-none">
            <div
              className="text-3xl text-slate-300 font-bold"
              style={{
                position: 'absolute',
                right: '50%',
                top: '-30px',
                transform: 'translateX(50%)',
              }}
            >
              ↓
            </div>
          </div>

          {/* Step 3 - Books the Job */}
          <div
            className="glass-card rounded-2xl p-8 hover-lift animate-fade-in-right fill-mode-both"
            style={{ animationDelay: '400ms' }}
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint/20 to-teal/5 flex items-center justify-center border border-mint/20 mx-auto">
                <span className="text-4xl">📅</span>
              </div>
            </div>
            <div className="text-center font-mono text-sm text-gradient mb-3">Step 03</div>
            <h3 className="text-xl font-bold text-white mb-3 text-center">Books the Job</h3>
            <p className="text-white/60 text-center text-sm">
              AI handles questions, collects info, and schedules appointments for you.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CLIENT SHOWCASE GRID
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up fill-mode-both">
            Trusted by <span className="text-gradient">Top Businesses</span>
          </h2>
          <p className="text-slate-600 text-lg animate-fade-in-up fill-mode-both" style={{ animationDelay: '100ms' }}>
            9 active clients transforming their customer communication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SCENARIOS.map((scenario, idx) => (
            <Link
              key={scenario.id}
              href={`/client/${scenario.id}`}
              className="group animate-stagger-in fill-mode-both hover-lift"
              style={{ animationDelay: `${150 + idx * 50}ms` }}
            >
              <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
                {/* Hero Image Background */}
                <div
                  className="relative h-48 overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${scenario.heroImage}')`,
                  }}
                >
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      background: `linear-gradient(135deg, ${scenario.color}33, ${scenario.color}11)`,
                    }}
                  ></div>

                  {/* Large emoji in corner */}
                  <div className="absolute top-4 right-4 text-5xl">{scenario.emoji}</div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-all">
                    {scenario.businessName}
                  </h3>

                  {/* Industry tag */}
                  <div className="inline-flex w-fit mb-3">
                    <span
                      className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border"
                      style={{
                        borderColor: `${scenario.color}40`,
                        backgroundColor: `${scenario.color}15`,
                        color: scenario.color,
                      }}
                    >
                      {scenario.industry}
                    </span>
                  </div>

                  {/* Tagline */}
                  <p className="text-white/70 text-sm mb-4 flex-1">
                    {scenario.tagline}
                  </p>

                  {/* Bottom accent bar */}
                  <div
                    className="h-1 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  ></div>
                </div>

                {/* Hover view indicator */}
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-white/40 text-xs font-mono">{scenario.phone}</span>
                  <span className="text-slate-400 group-hover:text-gradient transition-all text-sm font-medium">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <section className="section-divider"></section>
      <footer className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="text-slate-700 text-xs font-mono">
          AI Auto-Reply · HBCU App Build & Pitch 2026 · Jeeban Bashyal · Alabama A&M University
        </p>
      </footer>
    </div>
  );
}
