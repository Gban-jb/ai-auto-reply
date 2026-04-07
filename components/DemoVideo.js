'use client';

import { useState, useEffect, useRef } from 'react';

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

export default function DemoVideo({ businessName = 'Mr. Rooter Plumbing', businessEmoji = 'ð§', color = '#E97A2B' }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef(null);

  const scene = SCENES[sceneIndex];
  const progress = ((sceneIndex + 1) / SCENES.length) * 100;

  useEffect(() => {
    if (!isPlaying || !hasStarted) return;
    timerRef.current = setTimeout(() => {
      if (sceneIndex < SCENES.length - 1) {
        setSceneIndex((i) => i + 1);
      } else {
        // Loop back
        setSceneIndex(0);
      }
    }, scene.duration);
    return () => clearTimeout(timerRef.current);
  }, [sceneIndex, isPlaying, hasStarted, scene.duration]);

  const handleStart = () => {
    setHasStarted(true);
    setSceneIndex(0);
    setIsPlaying(true);
  };

  const handleToggle = () => {
    if (!hasStarted) {
      handleStart();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Video Container */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)',
          aspectRatio: '16/9',
        }}
      >
        {/* Scene Content */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {!hasStarted ? (
            <StartScreen onStart={handleStart} />
          ) : (
            <>
              {scene.id === 'ring' && <RingingScene businessName={businessName} />}
              {scene.id === 'missed' && <MissedScene />}
              {scene.id === 'twilio-detect' && <TwilioDetectScene />}
              {scene.id === 'ai-sends' && (
                <ChatScene
                  messages={[
                    {
                      from: 'ai',
                      text: `Hey! Sorry I missed your call. This is ${businessName}. How can I help you today? ð`,
                    },
                  ]}
                  businessName={businessName}
                  businessEmoji={businessEmoji}
                />
              )}
              {scene.id === 'customer-reply' && (
                <ChatScene
                  messages={[
                    {
                      from: 'ai',
                      text: `Hey! Sorry I missed your call. This is ${businessName}. How can I help you today? ð`,
                    },
                    {
                      from: 'user',
                      text: "Hi! I have a leaky faucet that's been dripping all day. Can you send someone?",
                      isNew: true,
                    },
                  ]}
                  businessName={businessName}
                  businessEmoji={businessEmoji}
                />
              )}
              {scene.id === 'ai-reply' && (
                <ChatScene
                  messages={[
                    {
                      from: 'ai',
                      text: `Hey! Sorry I missed your call. This is ${businessName}. How can I help you today? ð`,
                    },
                    {
                      from: 'user',
                      text: "Hi! I have a leaky faucet that's been dripping all day. Can you send someone?",
                    },
                    {
                      from: 'ai',
                      text: "Absolutely! We can get a plumber out to you tomorrow morning. Would 10am work for you? ð§",
                      isNew: true,
                    },
                  ]}
                  businessName={businessName}
                  businessEmoji={businessEmoji}
                />
              )}
              {scene.id === 'booking' && (
                <ChatScene
                  messages={[
                    {
                      from: 'user',
                      text: "Hi! I have a leaky faucet that's been dripping all day. Can you send someone?",
                    },
                    {
                      from: 'ai',
                      text: "Absolutely! We can get a plumber out to you tomorrow morning. Would 10am work for you? ð§",
                    },
                    {
                      from: 'user',
                      text: "10am is perfect! Please book me in.",
                      isNew: true,
                    },
                  ]}
                  businessName={businessName}
                  businessEmoji={businessEmoji}
                />
              )}
              {scene.id === 'booked' && <BookedScene businessName={businessName} color={color} />}
            </>
          )}
        </div>

        {/* Step Label */}
        {hasStarted && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className="text-[10px] font-mono px-2 py-1 rounded-full"
              style={{ backgroundColor: `${color}30`, color: color }}
            >
              STEP {sceneIndex + 1}/{SCENES.length}
            </span>
            <span className="text-white/60 text-xs font-medium">{scene.label}</span>
          </div>
        )}

        {/* Progress Bar */}
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

        {/* Play/Pause Button */}
        {hasStarted && (
          <button
            onClick={handleToggle}
            className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white/60 hover:text-white text-xs"
          >
            {isPlaying ? 'â¸' : 'â¶'}
          </button>
        )}
      </div>

      {/* Timeline */}
      {hasStarted && (
        <div className="flex gap-1 mt-3 px-1">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setSceneIndex(i); setIsPlaying(true); }}
              className="flex-1 group relative"
            >
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: i <= sceneIndex ? `linear-gradient(90deg, ${color}, #00F0B5)` : 'rgba(255,255,255,0.1)',
                  boxShadow: i === sceneIndex ? `0 0 8px ${color}60` : 'none',
                }}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/30 font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââ */
/*  SCENE COMPONENTS                      */
/* âââââââââââââââââââââââââââââââââââââââ */

function StartScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="text-5xl animate-float">ð±</div>
      <div>
        <h3 className="text-white font-bold text-xl mb-2">See How AI Auto-Reply Works</h3>
        <p className="text-white/50 text-sm max-w-md">
          Watch a real missed call get recovered by AI â from ring to booked appointment in seconds.
        </p>
      </div>
      <button
        onClick={onStart}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #00C8D4, #00F0B5)', color: '#04111F' }}
      >
        <span className="text-lg">â¶</span> Watch Demo
      </button>
    </div>
  );
}

function RingingScene({ businessName }) {
  return (
    <div className="flex items-center gap-8">
      {/* Phone */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-green-500/20 border-2 border-green-400 flex items-center justify-center text-4xl animate-pulse">
            ð±
          </div>
          {/* Ripple rings */}
          <div className="absolute inset-0 rounded-2xl border-2 border-green-400/50 animate-ping" />
          <div className="absolute -inset-3 rounded-2xl border border-green-400/20 animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>
        <span className="text-green-400 text-sm font-bold font-mono">RINGING...</span>
        <span className="text-white/40 text-xs">Customer is calling</span>
      </div>

      {/* Arrow */}
      <div className="text-white/20 text-3xl">â</div>

      {/* Business Owner */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl relative">
          ð·
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px]">
            ð
          </div>
        </div>
        <span className="text-white/60 text-sm font-bold">{businessName}</span>
        <span className="text-yellow-400/70 text-xs font-mono">BUSY ON A JOB</span>
      </div>
    </div>
  );
}

function MissedScene() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-red-500/15 border-2 border-red-400/60 flex items-center justify-center text-5xl">
          ðµ
        </div>
      </div>
      <div>
        <p className="text-red-400 text-lg font-bold">Missed Call!</p>
        <p className="text-white/40 text-sm mt-1">Business owner couldn&apos;t answer â they&apos;re on a job.</p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        <span className="text-red-300 text-xs font-mono">1 missed call from (256) 555-0147</span>
      </div>
    </div>
  );
}

function TwilioDetectScene() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-3xl">
          ðµ
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-teal animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
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
        <span className="text-teal">â GPT-4o-mini</span>
      </div>
    </div>
  );
}

function ChatScene({ messages, businessName, businessEmoji }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Phone Chrome */}
      <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: '#0f1d2f' }}>
        {/* Header */}
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

        {/* Messages */}
        <div className="px-3 py-3 space-y-2.5" style={{ minHeight: '180px' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  msg.isNew ? 'animate-fade-in-up fill-mode-both' : ''
                } ${
                  msg.from === 'user'
                    ? 'bg-gradient-to-r from-teal/40 to-[#00F0B5]/30 text-white rounded-br-sm'
                    : 'bg-white/8 text-white/90 rounded-bl-sm'
                }`}
                style={msg.from !== 'user' ? { background: 'rgba(255,255,255,0.08)' } : {}}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
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

function BookedScene({ businessName, color }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{ background: `${color}20`, border: `2px solid ${color}` }}
        >
          â
        </div>
        {/* Celebration particles */}
        <div className="absolute -top-2 -left-2 text-xl animate-bounce" style={{ animationDelay: '0ms' }}>ð</div>
        <div className="absolute -top-2 -right-2 text-xl animate-bounce" style={{ animationDelay: '200ms' }}>â­</div>
        <div className="absolute -bottom-1 -left-3 text-lg animate-bounce" style={{ animationDelay: '400ms' }}>ð°</div>
        <div className="absolute -bottom-1 -right-3 text-lg animate-bounce" style={{ animationDelay: '300ms' }}>ð</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">Appointment Booked!</p>
        <p className="text-white/50 text-sm">
          Customer saved. Revenue recovered. All while the owner was on the job.
        </p>
      </div>
      <div className="flex gap-4 mt-2">
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
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';

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

export default function DemoVideo({ businessName = 'Mr. Rooter Plumbing', businessEmoji = '\u{1F527}', color = '#E97A2B' }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef(null);

  const scene = SCENES[sceneIndex];
  const progress = ((sceneIndex + 1) / SCENES.length) * 100;

  useEffect(() => {
    if (!isPlaying || !hasStarted) return;
    timerRef.current = setTimeout(() => {
      if (sceneIndex < SCENES.length - 1) {
        setSceneIndex((i) => i + 1);
      } else {
        setSceneIndex(0);
      }
    }, scene.duration);
    return () => clearTimeout(timerRef.current);
  }, [sceneIndex, isPlaying, hasStarted, scene.duration]);

  const handleStart = () => {
    setHasStarted(true);
    setSceneIndex(0);
    setIsPlaying(true);
  };

  const handleToggle = () => {
    if (!hasStarted) {
      handleStart();
    } else {
      setIsPlaying(!isPlaying);
    }
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
            <StartScreen onStart={handleStart} />
          ) : (
            <>
              {scene.id === 'ring' && <RingingScene businessName={businessName} />}
              {scene.id === 'missed' && <MissedScene />}
              {scene.id === 'twilio-detect' && <TwilioDetectScene />}
              {scene.id === 'ai-sends' && (
                <ChatScene
                  messages={[
                    {
                      from: 'ai',
                      text: `Hey! Sorry I missed your call. This is ${businessName}. How can I help you today? \u{1F60A}`,
                    },
                  ]}
                  businessName={businessName}
                  businessEmoji={businessEmoji}
                />
              )}
              {scene.id === 'customer-reply' && (
                <ChatScene
                  messages={[
                    {
                      from: 'ai',
                      text: `Hey! Sorry I missed your call. This is ${businessName}. How can I help you today? \u{1F60A}`,
                    },
                    {
                      from: 'user',
                      text: "Hi! I have a leaky faucet that's been dripping all day. Can you send someone?",
                      isNew: true,
                    },
                  ]}
                  businessName={businessName}
                  businessEmoji={businessEmoji}
                />
              )}
              {scene.id === 'ai-reply' && (
                <ChatScene
                  messages={[
                    {
                      from: 'ai',
                      text: `Hey! Sorry I missed your call. This is ${businessName}. How can I help you today? \u{1F60A}`,
                    },
                    {
                      from: 'user',
                      text: "Hi! I have a leaky faucet that's been dripping all day. Can you send someone?",
                    },
                    {
                      from: 'ai',
                      text: "Absolutely! We can get a plumber out to you tomorrow morning. Would 10am work for you? \u{1F527}",
                      isNew: true,
                    },
                  ]}
                  businessName={businessName}
                  businessEmoji={businessEmoji}
                />
              )}
              {scene.id === 'booking' && (
                <ChatScene
                  messages={[
                    {
                      from: 'user',
                      text: "Hi! I have a leaky faucet that's been dripping all day. Can you send someone?",
                    },
                    {
                      from: 'ai',
                      text: "Absolutely! We can get a plumber out to you tomorrow morning. Would 10am work for you? \u{1F527}",
                    },
                    {
                      from: 'user',
                      text: "10am is perfect! Please book me in.",
                      isNew: true,
                    },
                  ]}
                  businessName={businessName}
                  businessEmoji={businessEmoji}
                />
              )}
              {scene.id === 'booked' && <BookedScene businessName={businessName} color={color} />}
            </>
          )}
        </div>

        {hasStarted && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className="text-[10px] font-mono px-2 py-1 rounded-full"
              style={{ backgroundColor: `${color}30`, color: color }}
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
            {isPlaying ? '\u23F8' : '\u25B6'}
          </button>
        )}
      </div>

      {hasStarted && (
        <div className="flex gap-1 mt-3 px-1">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setSceneIndex(i); setIsPlaying(true); }}
              className="flex-1 group relative"
            >
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: i <= sceneIndex ? `linear-gradient(90deg, ${color}, #00F0B5)` : 'rgba(255,255,255,0.1)',
                  boxShadow: i === sceneIndex ? `0 0 8px ${color}60` : 'none',
                }}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/30 font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StartScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="text-5xl animate-float">\u{1F4F1}</div>
      <div>
        <h3 className="text-white font-bold text-xl mb-2">See How AI Auto-Reply Works</h3>
        <p className="text-white/50 text-sm max-w-md">
          Watch a real missed call get recovered by AI — from ring to booked appointment in seconds.
        </p>
      </div>
      <button
        onClick={onStart}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #00C8D4, #00F0B5)', color: '#04111F' }}
      >
        <span className="text-lg">\u25B6</span> Watch Demo
      </button>
    </div>
  );
}

function RingingScene({ businessName }) {
  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-green-500/20 border-2 border-green-400 flex items-center justify-center text-4xl animate-pulse">
            \u{1F4F1}
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-green-400/50 animate-ping" />
          <div className="absolute -inset-3 rounded-2xl border border-green-400/20 animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>
        <span className="text-green-400 text-sm font-bold font-mono">RINGING...</span>
        <span className="text-white/40 text-xs">Customer is calling</span>
      </div>

      <div className="text-white/20 text-3xl">\u2192</div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl relative">
          \u{1F477}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px]">
            \u{1F4DE}
          </div>
        </div>
        <span className="text-white/60 text-sm font-bold">{businessName}</span>
        <span className="text-yellow-400/70 text-xs font-mono">BUSY ON A JOB</span>
      </div>
    </div>
  );
}

function MissedScene() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-red-500/15 border-2 border-red-400/60 flex items-center justify-center text-5xl">
          \u{1F4F5}
        </div>
      </div>
      <div>
        <p className="text-red-400 text-lg font-bold">Missed Call!</p>
        <p className="text-white/40 text-sm mt-1">Business owner couldn&apos;t answer — they&apos;re on a job.</p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        <span className="text-red-300 text-xs font-mono">1 missed call from (256) 555-0147</span>
      </div>
    </div>
  );
}

function TwilioDetectScene() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-3xl">
          \u{1F4F5}
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-teal animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
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
        <span className="text-teal">\u2192 GPT-4o-mini</span>
      </div>
    </div>
  );
}

function ChatScene({ messages, businessName, businessEmoji }) {
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
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  msg.isNew ? 'animate-fade-in-up fill-mode-both' : ''
                } ${
                  msg.from === 'user'
