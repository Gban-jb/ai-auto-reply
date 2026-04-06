# AI Auto-Reply
> No missed call. No lost deal. Ever.

AI-powered SMS recovery for small business owners. When a
customer calls and gets no answer, this system automatically
texts them back using GPT-4o-mini — handling the entire
conversation until the owner is ready.

## Quick Start

```bash
git clone <your-repo-url>
cd ai-auto-reply
npm install
cp .env.example .env.local
# Open .env.local and add your OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000

## Setup

### OpenAI API Key
1. Go to https://platform.openai.com
2. Sign in with your .edu account
3. API Keys → Create new secret key
4. Copy and paste into .env.local as OPENAI_API_KEY

### .env.local
```
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
BUSINESS_NAME=Your Business Name
BUSINESS_INDUSTRY=your industry
BUSINESS_CONTEXT=Describe your business here.
```

## How to Use
1. Open http://localhost:3000
2. Select a business scenario (Plumber, Salon, etc.)
3. Click "Simulate Missed Call"
4. Watch GPT-4o-mini reply within seconds
5. Type replies as the customer
6. View all conversations at /dashboard

## Project Structure
```
app/
  api/missed-call/   ← simulated missed call trigger
  api/sms-reply/     ← customer reply handler
  api/conversations/ ← dashboard data
  dashboard/         ← owner dashboard UI
  page.js            ← simulator (main page)
lib/
  ai.js              ← OpenAI client
  store.js           ← in-memory storage
  scenarios.js       ← 4 demo business presets
```

## API Endpoints
| Route | Method | Purpose |
|-------|--------|---------|
| /api/missed-call | POST | Trigger missed call simulation |
| /api/sms-reply | POST | Send customer reply, get AI response |
| /api/conversations | GET | Get all leads and stats |
| /api/conversations?phone=X | GET | Get one conversation |

## Cost
| Service | Cost |
|---------|------|
| Next.js | Free |
| OpenAI gpt-4o-mini | ~$0.01 per 100 conversations |
| Vercel (hosting) | Free |

## Going to Production
1. Add Twilio → point webhook to /api/missed-call
2. Parse request.formData() instead of request.json() in routes
3. Add Vercel KV → replace lib/store.js with kv.get/set
4. Deploy to Vercel → vercel deploy

## Built By
Jeeban Bashyal · Alabama A&M University
HBCU App Build & Pitch Competition 2026
