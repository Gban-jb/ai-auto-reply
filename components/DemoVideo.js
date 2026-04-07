'use client';

import { useEffect, useRef, useState } from 'react';

const SCENES = [
  {
    id: 'ring',
    duration: 3000,
    label: 'Incoming Call',
  },
  {
    id: 'missed',
    duration: 2500,
    label: 'Call Missed',
  },
  {
    id: 'twilio-detect',
    duration: 2500,
    label: 'Twilio Detects Missed Call',
  },
  {
    id: 'ai-sends',
    duration: 3000,
    label: 'AI Sends First Text',
  },
  {
    id: 'customer-reply',
    duration: 2500,
    label: 'Customer Replies',
  },
  {
    id: 'ai-reply',
    duration: 3000,
    label: 'AI Continues Conversation',
  },
  {
    id: 'booking',
    duration: 2500,
    label: 'Customer Books Appointment',
  },
  {
    id: 'booked',
    duration: 3500,
    label: 'Deal Closed!',
  },
];

const DEMO_SCRIPTS = {
  'kindred-technology': {
    callerPhone: '(334) 555-0117',
    ownerStatus: 'in a client strategy session',
    firstAiMessage:
      'Hey! Sorry I missed your call. This is Kindred Technology Group. What kind of website or marketing help do you need?',
    customerMessage:
      'Hi! I need a new website for my home care agency and I want help with SEO too.',
    aiReply:
      'Absolutely, we build websites and SEO campaigns for growing businesses. Would you like to book a 15-minute discovery call this Thursday?',
    bookingMessage:
      'Yes, Thursday afternoon works great. Please send me the details.',
    bookedTitle: 'Discovery Call Booked!',
    revenueSaved: '$4.8k',
    bookedSubtitle:
      'Lead captured. Sales conversation secured while the team stayed focused.',
  },
  'baker-underwood-law': {
    callerPhone: '(334) 555-0124',
    ownerStatus: 'in court',
    firstAiMessage:
      'Hey! Sorry I missed your call. This is The Baker Underwood Law Firm. What legal matter can we help you with?',
    customerMessage:
      'Hi, I need help setting up an LLC and I want to schedule a consultation this week.',
    aiReply:
      'Absolutely, we help with business formation and can walk you through the next steps. Would tomorrow at 2pm work for a consultation?',
    bookingMessage: 'Yes, 2pm tomorrow works for me.',
    bookedTitle: 'Consultation Scheduled!',
    revenueSaved: '$2.5k',
    bookedSubtitle:
      'A new client inquiry stayed warm and moved straight to intake.',
  },
  walker360: {
    callerPhone: '(334) 555-0139',
    ownerStatus: 'on a press check',
    firstAiMessage:
      'Hey! Sorry I missed your call. This is Walker360. What printing or marketing project are you working on?',
    customerMessage:
      'Hi! I need 5,000 brochures for an event next week and I also need help with the design.',
    aiReply:
      'We can handle both the design and print run for you. Want to set a quick project call for tomorrow morning so we can quote it fast?',
    bookingMessage: 'Yes, tomorrow morning is perfect.',
    bookedTitle: 'Project Call Booked!',
    revenueSaved: '$7.2k',
    bookedSubtitle:
      'The print job stayed on track and the sales handoff is ready.',
  },
  'slt-consulting': {
    callerPhone: '(334) 555-0142',
    ownerStatus: 'in a strategy session',
    firstAiMessage:
      'Hey! Sorry I missed your call. This is SLT Business Consulting. What are you building right now?',
    customerMessage:
      'Hi! I just launched my business and I need help creating a growth plan and finding capital.',
    aiReply:
      'We can absolutely help with strategy and funding readiness. Would you like to book a business discovery consult for Friday?',
    bookingMessage: 'Friday works well for me.',
    bookedTitle: 'Consult Booked!',
    revenueSaved: '$1.8k',
    bookedSubtitle:
      'A founder got answered quickly and moved into your pipeline.',
  },
  'pathway-consult': {
    callerPhone: '(256) 555-0156',
    ownerStatus: 'on a coaching call',
    firstAiMessage:
      'Hey! Sorry I missed your call. This is Pathway Small Business Consultants. What kind of support do you need?',
    customerMessage:
      'Hi, I started a business with five employees and I need help tightening our operations.',
    aiReply:
      'That is exactly what we help with for small teams. Would you like to grab the free 15-minute consultation on Wednesday?',
    bookingMessage: 'Yes, Wednesday works for me.',
    bookedTitle: 'Consultation Reserved!',
    revenueSaved: '$950',
    bookedSubtitle:
      'The prospect got a clear next step without waiting for a callback.',
  },
  'veda-cuisine': {
    callerPhone: '(256) 555-0168',
    ownerStatus: 'during dinner rush',
    firstAiMessage:
      'Hey! Sorry I missed your call. This is VEDA Indian Cuisine & Bar. How can we help with your order or reservation?',
    customerMessage:
      'Hi! Do you have a table for four available tonight at 7pm?',
    aiReply:
      'Yes, we can reserve a table for four at 7pm tonight. Can I book it under your name?',
    bookingMessage: 'Yes please, book it under Maya Johnson.',
    bookedTitle: 'Reservation Confirmed!',
    revenueSaved: '$160',
    bookedSubtitle:
      'A missed call still turned into a filled table during service.',
  },
  'society-salon': {
    callerPhone: '(256) 555-0171',
    ownerStatus: 'with a client in the chair',
    firstAiMessage:
      'Hey! Sorry I missed your call. This is Society Salon. What service are you looking to book?',
    customerMessage:
      'Hi! I want a balayage and blowout this Saturday if you have an opening.',
    aiReply:
      'We would love to help with that. We have a Saturday afternoon opening available. Would you like me to hold that spot for you?',
    bookingMessage:
      'Yes, please hold the Saturday afternoon appointment.',
    bookedTitle: 'Salon Visit Booked!',
    revenueSaved: '$280',
    bookedSubtitle:
      'The stylist stayed focused and the chair time still got sold.',
  },
  'mr-rooter': {
    callerPhone: '(256) 555-0184',
    ownerStatus: 'on an emergency repair',
    firstAiMessage:
      'Hey! Sorry I missed your call. This is Mr. Rooter Plumbing of Huntsville. What plumbing issue are you dealing with?',
    customerMessage:
      'Hi! I have a burst pipe in my kitchen and I need someone out today.',
    aiReply:
      'We can help with that right away. We have a tech available this afternoon. Would you like me to lock in the emergency visit?',
    bookingMessage: 'Yes, please send someone this afternoon.',
    bookedTitle: 'Service Call Booked!',
    revenueSaved: '$650',
    bookedSubtitle:
      'An urgent job got captured fast instead of slipping to a competitor.',
  },
  'inspiring-smiles': {
    callerPhone: '(256) 555-0192',
    ownerStatus: 'with a patient',
    firstAiMessage:
      'Hey! Sorry I missed your call. This is Inspiring Smiles Family Dentistry. How can we help today?',
    customerMessage:
      'Hi! I chipped a tooth and I need an emergency appointment as soon as possible.',
    aiReply:
      'We can help with that. We have an emergency opening tomorrow morning. Would you like me to reserve it for you?',
    bookingMessage: 'Yes, please reserve that appointment.',
    bookedTitle: 'Dental Visit Booked!',
    revenueSaved: '$425',
    bookedSubtitle:
      'The patient got reassurance quickly and the appointment stayed in-house.',
  },
};

function getFallbackScript(scenario) {
  const businessName = scenario?.businessName || 'the business';
  const service = scenario?.services?.[0] || 'services';

  return {
    callerPhone: '(555) 010-0199',
    ownerStatus: 'helping another customer',
    firstAiMessage: `Hey! Sorry I missed your call. This is ${businessName}. How can we help you today?`,
    customerMessage:
      scenario?.quickReplies?.[0] ||
      `Hi! I would like to learn more about your ${service.toLowerCase()}.`,
    aiReply: `Absolutely, we can help with ${service.toLowerCase()}. Would you like to book a quick follow-up with our team?`,
    bookingMessage: 'Yes, that sounds great.',
    bookedTitle: 'Appointment Booked!',
    revenueSaved: '$500',
    bookedSubtitle:
      'Customer saved. Revenue recovered. All while the owner stayed focused.',
  };
}

export default function DemoVideo({ scenario, autoplayToken = 0 }) {
  const businessName = scenario?.businessName || 'Mr. Rooter Plumbing';
  const businessEmoji = scenario?.emoji || '🔧';
  const color = scenario?.color || '#E97A2B';
  const script = DEMO_SCRIPTS[scenario?.id] || getFallbackScript(scenario);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef(null);

  const scene = SCENES[sceneIndex];
  const progress = ((sceneIndex + 1) / SCENES.length) * 100;

  useEffect(() => {
    clearTimeout(timerRef.current);
    setSceneIndex(0);
    setIsPlaying(true);
    setHasStarted(false);
  }, [scenario?.id]);

  useEffect(() => {
    if (!autoplayToken) return;
    clearTimeout(timerRef.current);
    setSceneIndex(0);
    setIsPlaying(true);
    setHasStarted(true);
  }, [autoplayToken]);

  useEffect(() => {
    if (!isPlaying || !hasStarted) return;

    timerRef.current = setTimeout(() => {
      if (sceneIndex < SCENES.length - 1) {
        setSceneIndex((index) => index + 1);
      } else {
        setSceneIndex(0);
      }
    }, scene.duration);

    return () => clearTimeout(timerRef.current);
  }, [scene.duration, sceneIndex, isPlaying, hasStarted]);

  const handleStart = () => {
    clearTimeout(timerRef.current);
    setHasStarted(true);
    setSceneIndex(0);
    setIsPlaying(true);
  };

  const handleToggle = () => {
    if (!hasStarted) {
      handleStart();
      return;
    }

    setIsPlaying((playing) => !playing);
  };

  const firstChatMessage = {
    from: 'ai',
    text: script.firstAiMessage,
  };

  const customerReply = {
    from: 'user',
    text: script.customerMessage,
  };

  const aiFollowUp = {
    from: 'ai',
    text: script.aiReply,
  };

  const bookingReply = {
    from: 'user',
    text: script.bookingMessage,
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)',
          aspectRatio: '16/9',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {!hasStarted ? (
            <StartScreen businessName={businessName} onStart={handleStart} />
          ) : (
            <>
              {scene.id === 'ring' && (
                <RingingScene
                  businessEmoji={businessEmoji}
                  businessName={businessName}
                  ownerStatus={script.ownerStatus}
                />
              )}
              {scene.id === 'missed' && (
                <MissedScene
                  callerPhone={script.callerPhone}
                  ownerStatus={script.ownerStatus}
                />
              )}
              {scene.id === 'twilio-detect' && <TwilioDetectScene />}
              {scene.id === 'ai-sends' && (
                <ChatScene
                  businessEmoji={businessEmoji}
                  businessName={businessName}
                  messages={[firstChatMessage]}
                />
              )}
              {scene.id === 'customer-reply' && (
                <ChatScene
                  businessEmoji={businessEmoji}
                  businessName={businessName}
                  messages={[firstChatMessage, { ...customerReply, isNew: true }]}
                />
              )}
              {scene.id === 'ai-reply' && (
                <ChatScene
                  businessEmoji={businessEmoji}
                  businessName={businessName}
                  messages={[firstChatMessage, customerReply, { ...aiFollowUp, isNew: true }]}
                />
              )}
              {scene.id === 'booking' && (
                <ChatScene
                  businessEmoji={businessEmoji}
                  businessName={businessName}
                  messages={[customerReply, aiFollowUp, { ...bookingReply, isNew: true }]}
                />
              )}
              {scene.id === 'booked' && (
                <BookedScene
                  bookedRevenue={script.revenueSaved}
                  bookedSubtitle={script.bookedSubtitle}
                  bookedTitle={script.bookedTitle}
                  color={color}
                />
              )}
            </>
          )}
        </div>

        {hasStarted && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className="text-[10px] font-mono px-2 py-1 rounded-full"
              style={{ backgroundColor: `${color}30`, color }}
            >
              STEP {sceneIndex + 1}/{SCENES.length}
            </span>
            <span className="text-white/60 text-xs font-medium">{scene.label}</span>
          </div>
        )}

        {hasStarted && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${color}, #00F0B5)`,
              }}
            />
          </div>
        )}

        {hasStarted && (
          <button
            onClick={handleToggle}
            className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white/60 hover:text-white text-xs"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        )}
      </div>

      {hasStarted && (
        <div className="flex gap-1 mt-3 px-1">
          {SCENES.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                setSceneIndex(index);
                setIsPlaying(true);
              }}
              className="flex-1 group relative"
            >
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  background:
                    index <= sceneIndex
                      ? `linear-gradient(90deg, ${color}, #00F0B5)`
                      : 'rgba(255,255,255,0.1)',
                  boxShadow: index === sceneIndex ? `0 0 8px ${color}60` : 'none',
                }}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/30 font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {step.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StartScreen({ businessName, onStart }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="text-5xl animate-float">📱</div>
      <div>
        <h3 className="text-white font-bold text-xl mb-2">See How AI Auto-Reply Works</h3>
        <p className="text-white/50 text-sm max-w-md">
          Watch how {businessName} turns a missed call into a booked conversation in seconds.
        </p>
      </div>
      <button
        onClick={onStart}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #00C8D4, #00F0B5)', color: '#04111F' }}
      >
        <span className="text-lg">▶</span> Watch Demo
      </button>
    </div>
  );
}

function RingingScene({ businessEmoji, businessName, ownerStatus }) {
  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-green-500/20 border-2 border-green-400 flex items-center justify-center text-4xl animate-pulse">
            📱
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-green-400/50 animate-ping" />
          <div
            className="absolute -inset-3 rounded-2xl border border-green-400/20 animate-ping"
            style={{ animationDelay: '0.5s' }}
          />
        </div>
        <span className="text-green-400 text-sm font-bold font-mono">RINGING...</span>
        <span className="text-white/40 text-xs">Customer is calling</span>
      </div>

      <div className="text-white/20 text-3xl">→</div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl relative">
          {businessEmoji}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px]">
            📞
          </div>
        </div>
        <span className="text-white/60 text-sm font-bold text-center max-w-[12rem]">
          {businessName}
        </span>
        <span className="text-yellow-400/70 text-xs font-mono uppercase tracking-wide text-center">
          {ownerStatus}
        </span>
      </div>
    </div>
  );
}

function MissedScene({ callerPhone, ownerStatus }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-red-500/15 border-2 border-red-400/60 flex items-center justify-center text-5xl">
          📵
        </div>
      </div>
      <div>
        <p className="text-red-400 text-lg font-bold">Missed Call!</p>
        <p className="text-white/40 text-sm mt-1">
          The owner could not answer because they were {ownerStatus}.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        <span className="text-red-300 text-xs font-mono">
          1 missed call from {callerPhone}
        </span>
      </div>
    </div>
  );
}

function TwilioDetectScene() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-3xl">
          📵
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 rounded-full bg-teal animate-bounce"
                style={{ animationDelay: `${dot * 150}ms` }}
              />
            ))}
          </div>
          <span className="text-white/30 text-[10px] font-mono">PROCESSING</span>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-[#F22F46]/15 border border-[#F22F46]/30 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#F22F46" strokeWidth="2" />
            <circle cx="12" cy="12" r="2" fill="#F22F46" />
            <circle cx="20" cy="12" r="2" fill="#F22F46" />
            <circle cx="12" cy="20" r="2" fill="#F22F46" />
            <circle cx="20" cy="20" r="2" fill="#F22F46" />
          </svg>
        </div>
      </div>
      <div>
        <p className="text-[#F22F46] text-sm font-bold font-mono">TWILIO WEBHOOK TRIGGERED</p>
        <p className="text-white/50 text-sm mt-2">
          Twilio detects the missed call and triggers AI Auto-Reply
        </p>
      </div>
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-mono text-[11px] text-white/40">
        <span className="text-green-400">POST</span>
        <span>/api/missed-call</span>
        <span className="text-teal">→ GPT-4o-mini</span>
      </div>
    </div>
  );
}

function ChatScene({ businessEmoji, businessName, messages }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: '#0f1d2f' }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10" style={{ background: '#0a1628' }}>
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm">
            {businessEmoji}
          </div>
          <div className="flex-1">
            <p className="text-white text-xs font-bold leading-tight">{businessName}</p>
            <p className="text-green-400 text-[9px] font-mono">AI Auto-Reply</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-green-400 text-[9px]">Online</span>
          </div>
        </div>

        <div className="px-3 py-3 space-y-2.5" style={{ minHeight: '180px' }}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  message.isNew ? 'animate-fade-in-up fill-mode-both' : ''
                } ${
                  message.from === 'user'
                    ? 'bg-gradient-to-r from-teal/40 to-[#00F0B5]/30 text-white rounded-br-sm'
                    : 'bg-white/8 text-white/90 rounded-bl-sm'
                }`}
                style={message.from !== 'user' ? { background: 'rgba(255,255,255,0.08)' } : {}}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 px-3 py-2.5 border-t border-white/10" style={{ background: '#0a1628' }}>
          <div className="flex-1 h-8 rounded-lg bg-white/5 border border-white/10 px-3 flex items-center">
            <span className="text-white/20 text-[10px]">Type a message...</span>
          </div>
          <div
            className="h-8 px-3 rounded-lg flex items-center text-[10px] font-bold"
            style={{ background: 'linear-gradient(135deg, #00C8D4, #00F0B5)', color: '#04111F' }}
          >
            Send
          </div>
        </div>
      </div>
    </div>
  );
}

function BookedScene({ bookedRevenue, bookedSubtitle, bookedTitle, color }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{ background: `${color}20`, border: `2px solid ${color}` }}
        >
          ✅
        </div>
        <div className="absolute -top-2 -left-2 text-xl animate-bounce" style={{ animationDelay: '0ms' }}>
          🎉
        </div>
        <div className="absolute -top-2 -right-2 text-xl animate-bounce" style={{ animationDelay: '200ms' }}>
          ⭐
        </div>
        <div className="absolute -bottom-1 -left-3 text-lg animate-bounce" style={{ animationDelay: '400ms' }}>
          💰
        </div>
        <div className="absolute -bottom-1 -right-3 text-lg animate-bounce" style={{ animationDelay: '300ms' }}>
          📅
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">{bookedTitle}</p>
        <p className="text-white/50 text-sm">{bookedSubtitle}</p>
      </div>
      <div className="mt-2 grid w-full max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-teal text-lg font-bold font-mono">~2s</p>
          <p className="text-white/30 text-[10px] font-mono">RESPONSE TIME</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-green-400 text-lg font-bold font-mono">$0</p>
          <p className="text-white/30 text-[10px] font-mono">HUMAN NEEDED</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-[#F22F46] text-lg font-bold">Twilio</p>
          <p className="text-white/30 text-[10px] font-mono">POWERED BY</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-amber-300 text-lg font-bold font-mono">{bookedRevenue}</p>
          <p className="text-white/30 text-[10px] font-mono">REVENUE SAVED</p>
        </div>
      </div>
    </div>
  );
}
