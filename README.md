# AI Auto-Reply

> No missed call. No lost deal. Ever.

AI-powered SMS recovery for small business owners. When a customer calls and nobody picks up, the system automatically texts them back using GPT-4o-mini — carrying the entire conversation until the owner is ready to step in.

**[Live Demo →](https://ai-auto-reply-gamma.vercel.app)**

---

## What It Does

A missed call is a missed sale. AI Auto-Reply fixes that by simulating a real-time SMS recovery workflow: the moment a call goes unanswered, an AI-generated text goes out to the customer, and a natural back-and-forth conversation begins — all tailored to the specific business.

The app ships with **9 real business presets** spanning law firms, restaurants, salons, plumbers, dental offices, consultants, and tech agencies — each with its own tone, services, branding, and quick-reply prompts.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 |
| UI | React 18 + Tailwind CSS 3 |
| AI | OpenAI SDK v4 (GPT-4o-mini) |
| Language | JavaScript (no TypeScript) |
| Storage | In-memory (Maps) |
| Hosting | Vercel |

---

## Pages

| Route | What It Does |
|-------|--------------|
| `/` | Marketing landing page with animated counters, phone mockup preview, how-it-works section, and client showcase |
| `/demo` | Live simulator — pick a business, simulate a missed call, and chat as the customer in real time |
| `/admin` | Preset business catalog with top-level stats and quick links to test each AI |
| `/dashboard` | Conversation viewer with search, live polling (5s), thread detail, and delete |
| `/client/[id]` | Detail page for a single business — hero banner, contact info, services, AI config preview, and conversation history |

---

## API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/missed-call` | POST | Triggers the first outbound AI text after a missed call |
| `/api/sms-reply` | POST | Accepts a customer reply and returns the next AI message |
| `/api/conversations` | GET | Returns all conversations and aggregate stats |
| `/api/conversations?phone=...` | GET | Returns a single conversation and its lead |
| `/api/conversations?phone=...` | DELETE | Deletes a conversation |

---

## Business Presets

All 9 presets live in `lib/scenarios.js`. Each includes business name, industry, context, phone, email, address, hours, website, hero image, services, quick replies, and branding color.

| # | Business | Industry |
|---|----------|----------|
| 1 | Kindred Technology | Web Design & Digital Marketing |
| 2 | Baker Underwood Law | Legal Services |
| 3 | Walker360 | Media & Brand Strategy |
| 4 | SLT Consulting | Business Consulting |
| 5 | Pathway Consult | Career & Education Consulting |
| 6 | Veda Indian Cuisine | Restaurant |
| 7 | Society Salon | Hair Salon & Beauty |
| 8 | Mr. Rooter Plumbing | Plumbing Services |
| 9 | Inspiring Smiles Dental | Dental Practice |

---

## Quick Start

```bash
git clone https://github.com/Gban-jb/ai-auto-reply.git
cd ai-auto-reply
npm install
cp .env.example .env.local
```

Add your OpenAI key to `.env.local`:

```
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini        # optional, this is the default
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're in.

---

## How the Demo Flow Works

1. Open `/demo` and pick a business (or let it default to the first one).
2. Click **Simulate Missed Call** — the app hits `/api/missed-call`, and the AI sends the first text.
3. Type a reply as the customer — the app calls `/api/sms-reply`, appends your message, and streams back the next AI response.
4. The AI stays in character for that business: warm, short, asks a follow-up, and never reveals it's AI unless directly asked.

---

## Project Structure

```
app/
  page.js                    ← landing page
  layout.js                  ← global shell + Google fonts
  globals.css                ← Tailwind + custom styles, glass UI, animations
  demo/page.js               ← live simulator
  admin/page.js              ← business catalog + stats
  dashboard/page.js          ← conversation viewer
  client/[id]/page.js        ← individual business detail
  api/
    missed-call/route.js     ← POST: first AI text
    sms-reply/route.js       ← POST: customer reply handler
    conversations/route.js   ← GET/DELETE: conversation data

components/
  Navbar.js                  ← shared navigation bar

lib/
  ai.js                      ← OpenAI client + prompt builder
  store.js                   ← in-memory Maps (conversations, leads)
  scenarios.js               ← 9 business presets
```

---

## Cost

| Service | Cost |
|---------|------|
| Next.js | Free |
| OpenAI GPT-4o-mini | ~$0.01 per 100 conversations |
| Vercel hosting | Free tier |

---

## Going to Production

1. **Add Twilio** — point the webhook to `/api/missed-call` and parse `request.formData()` instead of `request.json()`.
2. **Add persistent storage** — replace `lib/store.js` with Vercel KV, Supabase, or any database.
3. **Deploy** — push to GitHub and connect to Vercel, or run `vercel deploy`.

---

## Built By

**Jeeban Bashyal** · Alabama A&M University
HBCU App Build & Pitch Competition 2026
