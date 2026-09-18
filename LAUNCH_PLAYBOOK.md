# Builders Daily — Launch Playbook

> **Goal**: Turn Builders Daily from a solo project into a recognized AI digest with 1,000+ subscribers, paying sponsors, and a growing community — within 90 days.

---

## Phase 0: Pre-Launch Setup (Week 1-2)

### 0.1 Domain & Branding
- [ ] Register `buildersdaily.com` (or your preferred domain)
- [ ] Set up SSL, redirect www → apex (or vice versa)
- [ ] Create OG image: 1200x630px with logo + tagline "Your Daily Digest for AI Developers"
- [ ] Set up Google Search Console + Bing Webmaster Tools
- [ ] Create social accounts: Twitter/X, LinkedIn, Threads (at minimum)

### 0.2 Email Infrastructure
**Recommended stack (budget-friendly):**
- **Resend** (free tier: 100 emails/day, 3,000/month) — transactional + marketing
- **Alternatives**: Loops ($20/mo, built for SaaS), Mailchimp (free tier), Buttondown ($9/mo, indie-friendly)

**Setup:**
- [ ] Verify domain in Resend (DKIM, SPF, DMARC)
- [ ] Create email sequences:
  1. **Waitlist Welcome** — immediate, confirms signup, sets expectations
  2. **Launch Day** — "We're live!" with CTA to install extension / visit site
  3. **Day 3 Follow-up** — "Here's what you missed" + best content from first days
  4. **Day 7 Nurture** — "Why I built this" (your story, builds connection)
  5. **Day 14 Engagement** — "What do you want to see?" (survey/feedback)
  6. **Day 21 Community** — "Join our Discord/Slack" (community CTA)

### 0.3 Waitlist Landing Page
Build a simple, high-converting waitlist page. Options:

**Option A: Build it yourself (recommended — you have the skills)**
- Single page at `buildersdaily.com/waitlist` or just the root `/`
- Hero: "Builders Daily — Your Daily Digest for AI Developers"
- Subhead: "Fresh AI papers, tools, models, and repos — delivered every morning."
- Email capture form (single input + button)
- Social proof: "Join 500+ builders already on the waitlist" (update as grows)
- Below fold: Preview of what a daily report looks like (screenshot of your dashboard)
- Footer: "Built by a solo dev who got tired of doomscrolling AI Twitter"

**Option B: Use a tool**
- **Tally** (free) — embed a waitlist form
- **Waitlist API** — `waitlistapi.com` or **Loops** has built-in waitlist pages
- **Carrd** ($19/yr) — one-page site with email capture

**Waitlist form fields:**
- Email (required)
- "What's your role?" (optional dropdown: Developer, PM, Designer, Founder, Other)
- "How do you currently stay updated on AI?" (optional: Twitter, Reddit, Newsletters, HN, Other)

This data helps you segment later and pitch sponsors ("Our audience is 60% developers, 25% founders").

### 0.4 Referral System (Viral Waitlist)
This is how you turn 100 signups into 1,000:

**Tool: Viral Loops** (free tier: 500 referrals) or **ReferralHero**
- Each waitlist member gets a unique referral link
- Rewards ladder:
  - 3 referrals → Early access (day before public launch)
  - 5 referrals → "Founding Builder" badge on profile
  - 10 referrals → Lifetime premium (when subscription launches)
  - 25 referrals → "Ambassador" status + direct line to you

**Alternative: DIY with Supabase**
- Add `referral_code` and `referred_by` columns to a `waitlist` table
- Generate unique codes on signup
- Track referral counts in real-time
- Show progress on a dashboard: "You're #47 on the waitlist. 3 more referrals to unlock early access!"

---

## Phase 1: Soft Launch (Week 3-4)

### 1.1 Seed the Content
Before any public launch, you need content that makes people stay:

- [ ] **Write 3-5 blog posts** (your experiments, pipeline learnings, tool reviews)
  - "How I Built a Daily AI Digest Pipeline in Node.js"
  - "7 Data Sources I Scrape for AI Trending Content"
  - "Why I Chose Supabase Over Firebase for This Project"
  - "The LLM Cascade: How I保证 99.9% Report Generation Uptime"
  - "Building a 3D Knowledge Sphere with Pure Canvas (No Three.js)"

- [ ] **Polish the existing dashboard** — fix the thin blog content, ensure all sections render correctly
- [ ] **Remove the "Coming Soon" overlay** from /archive
- [ ] **Test the Chrome extension** (if ready) or prepare the install flow

### 1.2 Beta Access (10-20 people)
- [ ] Invite top waitlist referrers + 5-10 hand-picked AI builders
- [ ] Create a private channel (Discord/Slack) for beta feedback
- [ ] Collect feedback on: content quality, UI, missing features, willingness to pay
- [ ] **Key question to ask**: "Would you pay $5-10/month for this?" (validates subscription)

### 1.3 Analytics Setup
- [ ] **Plausible** or **Umami** (privacy-friendly, self-hostable) — page views, referrals
- [ ] **Supabase Dashboard** — monitor query patterns, active users
- [ ] **Email analytics** — open rates, click rates (built into Resend/Loops)
- [ ] Track: daily active users, page views per session, blog read time, referral conversions

---

## Phase 2: Public Launch (Week 5-6)

### 2.1 Launch Day Strategy

**The "Build in Public" Launch Thread (Twitter/X):**
```
I just launched Builders Daily — a free daily digest for AI developers.

Every morning, I scrape 7 data sources (GitHub, HN, ArXiv, ProductHunt, Reddit, HuggingFace) and use an LLM to curate the best AI tools, papers, and repos.

Here's what's inside:
🧵 [thread with screenshots]

→ buildersdaily.com

RT if you know someone who'd find this useful 🙏
```

**Where to post (Day 1):**
| Platform | Format | Why |
|---|---|---|
| **Twitter/X** | Build-in-public thread + individual tweets | AI Twitter is your core audience |
| **Hacker News** | "Show HN: Builders Daily — AI Digest I Built as a Solo Dev" | High-intent technical audience |
| **Reddit** | r/LocalLLaMA, r/MachineLearning, r/SideProject, r/artificial | These are YOUR data sources — give back |
| **LinkedIn** | Personal post about the journey | Founder network, potential sponsors |
| **Product Hunt** | Schedule a launch (Tuesday-Thursday best) | Massive visibility spike |
| **Indie Hackers** | Launch post + milestone updates | Solo dev community |
| **Dev.to / Hashnode** | Cross-post your blog articles | SEO + developer audience |

### 2.2 Product Hunt Launch
This is a BIG moment. Prepare:

- [ ] **Schedule for Tuesday-Thursday** (highest traffic)
- [ ] **Tagline**: "Your daily digest for AI developers — papers, tools, repos"
- [ ] **Description**: 3-4 sentences max
- [ ] **First comment**: Your personal story — why you built this, what makes it different
- [ ] **Gallery**: 5-6 screenshots (dashboard, blog, admin, mobile, Chrome ext)
- [ ] **Maker comment**: Reply to every comment within 1 hour
- [ ] **Prepare your network**: Ask 20-30 people to upvote + comment on launch day
- [ ] **Schedule tweets**: Post at launch, 2 hours later, end of day, next morning

### 2.3 Launch Week Content Calendar
| Day | Content | Platform |
|---|---|---|
| Mon | Launch thread + HN post | Twitter, HN |
| Tue | Product Hunt launch | PH + all platforms |
| Wed | "What I learned launching" post | LinkedIn, Indie Hackers |
| Thu | Blog post: "How the pipeline works" | Dev.to, Hashnode |
| Fri | "Week 1 stats" thread | Twitter |
| Sat | Community highlight / user feedback | Twitter, LinkedIn |
| Sun | "What's coming next" teaser | Twitter |

---

## Phase 3: Growth Engine (Week 7-12)

### 3.1 Email Automation (The Money Machine)

**Daily Digest Email (the core product):**
- Automated daily email at 7 AM (recipient's local time)
- Subject line format: " Builders Daily #47 — [Top item of the day]"
- Content: Top 5 items from the daily report (not everything — curate)
- CTA: "Read full report → buildersdaily.com"
- **This is your retention engine** — if the email is good, people stay

**Weekly Recap Email (Sundays):**
- "This Week in AI" — top 10 items of the week
- Blog post highlight
- "What's coming next week" teaser
- Community spotlight (best discussion, most-shared item)

**Onboarding Sequence (for new subscribers):**
- Day 0: Welcome + what to expect
- Day 1: "Here's today's report" (first digest)
- Day 3: "How to get the most out of Builders Daily" (tips)
- Day 7: "Why I built this" (your story)
- Day 14: Feedback survey
- Day 21: Community invite

### 3.2 Content Strategy (SEO Flywheel)

**Blog post categories:**
1. **Tutorials** — "How to build X with Y" (high search volume)
2. **Tool Reviews** — "I tested [Tool] for 7 days — here's what happened"
3. **Pipeline Diaries** — "What I learned scraping AI data daily" (build in public)
4. **Weekly Roundups** — "Best AI tools this week" (SEO magnet)
5. **Opinion/Perspective** — "Why [trend] matters for developers" (shareability)

**SEO targets (keyword research needed):**
- "AI tools for developers" (high volume)
- "daily AI newsletter" (medium volume, high intent)
- "best AI models today" (medium volume)
- "AI research papers weekly" (low volume, high intent)
- "AI developer resources" (medium volume)

**Publishing cadence:** 2 blog posts per week minimum

### 3.3 Distribution Channels

**Automated distribution:**
- Blog posts → automatically tweet a link (use Buffer or Typefully)
- Daily report → auto-post top item to Twitter/LinkedIn
- Weekly digest → auto-post to Reddit (r/LocalLLaMA, r/MachineLearning)

**Manual distribution (high-impact):**
- Reply to AI conversations on Twitter with "I covered this in today's Builders Daily"
- Comment on relevant HN threads with your analysis + link to blog
- Guest post on other newsletters (offer to write for TLDR, AI Breakfast, etc.)

### 3.4 Partnership & Cross-Promotion

**Newsletter swaps:**
- Reach out to 5-10 complementary newsletters (AI-focused, dev-focused)
- Offer to promote them in your digest if they promote you
- Target: 500+ subscriber newsletters with similar audience

**Tool/product partnerships:**
- Offer free "Tool of the Day" features to AI startups
- They promote Builders Daily to their audience → you get subscribers
- This is also your sponsor pipeline — "Here's what a feature looks like"

**Community partnerships:**
- Partner with AI Discord servers, Slack communities
- Offer to do a "weekly AI digest" post in their channels
- Cross-promote with other solo dev builders

### 3.5 Referral Growth (Ongoing)

Keep the referral engine running post-launch:
- Every email has a "Forward to a friend" CTA
- Dashboard has a share button with referral tracking
- Monthly "referral leaderboard" — top referrers get shoutouts
- Milestone rewards: 100 subscribers = celebration tweet, 500 = blog post, 1000 = special edition

---

## Phase 4: Monetization (Month 3-6)

### 4.1 Sponsor Revenue (Active Now)

**Sponsorship tiers:**
| Tier | Price | Includes |
|---|---|---|
| **Featured Gem** | $200-500/week | Card in Featured Gems slider + email mention |
| **Promo Banner** | $300-700/week | PromoSlider banner + blog sidebar |
| **Tool of the Day** | $150-400/day | Dedicated spotlight in daily report |
| **Newsletter Sponsor** | $100-300/email | Dedicated section in daily digest email |
| **Blog Post** | $200-500/post | Sponsored blog post (clearly labeled) |

**How to get sponsors:**
1. **Build a media kit** — audience size, demographics, engagement metrics
2. **Cold email AI startups** — "I run a daily AI digest read by X developers..."
3. **List on ad marketplaces** — Paved, Swapstack, Passionfruit
4. **Leverage Product Hunt** — "We featured [Startup] and got 500 clicks"
5. **Start with barter** — Offer free features to tools you genuinely like, get testimonials

**Target sponsors:**
- AI API providers (OpenAI, Anthropic, Groq, Cerebras)
- Dev tools (Vercel, Supabase, Railway, Render)
- AI-powered SaaS products
- Coding bootcamps / courses
- AI hardware (GPUs, cloud GPUs)

### 4.2 Subscription Tiers (Month 4-6)

**Free tier (what you already have):**
- Daily dashboard access
- Blog access
- Chrome extension

**Pro tier ($9/month or $79/year):**
- Ad-free experience
- Historical archive access (time machine)
- Early access to new features
- Priority in community
- Custom alerts (track specific topics/models)

**Team tier ($29/month):**
- Everything in Pro
- Team dashboard (multiple users)
- Custom data sources
- API access
- Priority support

### 4.3 Chrome Extension Revenue

**Option A: Free extension + upsell**
- Extension shows today's top 3 items free
- Full report requires login (free account)
- Pro features behind subscription

**Option B: Freemium extension**
- Free: daily digest notification
- Pro ($5/month): custom alerts, saved items, historical search

---

## Phase 5: Community Building (Month 3-6)

### 5.1 Discord/Slack Community

**Structure:**
- `#general` — casual AI chat
- `#daily-discussion` — discuss today's digest
- `#tools` — share/discuss AI tools
- `#jobs` — AI job postings (community value)
- `#show-and-tell` — members share their projects
- `#feedback` — suggest features, report bugs
- `#ama` — monthly AMA with AI builders

**Growth tactics:**
- Invite beta users first
- Add Discord link to every email + dashboard
- Weekly "community highlight" in newsletter
- Monthly virtual meetup / AMA

### 5.2 "Vibecoder" Identity

You mentioned building a community of "vibecoders and AI enthusiasts." Lean into this:
- Create a hashtag: #Vibecoders or #BuildersDaily
- Feature community members' projects in the newsletter
- Create a "Builder of the Week" spotlight
- Write about the "vibecoding" philosophy (building with AI assistance)
- This becomes your brand identity — not just a newsletter, a movement

---

## Revenue Projections (Conservative)

| Month | Subscribers | Sponsors | Subscription | Total MRR |
|---|---|---|---|---|
| Month 1 | 500 | $0 | $0 | $0 |
| Month 2 | 1,500 | $200 | $0 | $200 |
| Month 3 | 3,000 | $500 | $100 | $600 |
| Month 4 | 5,000 | $1,000 | $300 | $1,300 |
| Month 5 | 8,000 | $2,000 | $600 | $2,600 |
| Month 6 | 12,000 | $3,500 | $1,200 | $4,700 |

**Break-even point:** ~Month 3-4 (covering hosting + email costs)

---

## Key Metrics to Track

| Metric | Target (90 days) | Tool |
|---|---|---|
| Waitlist signups | 1,000+ | Supabase / Resend |
| Email subscribers | 2,000+ | Resend / Loops |
| Daily active users | 200+ | Plausible / Umami |
| Blog traffic (monthly) | 5,000+ pageviews | Plausible |
| Twitter followers | 1,000+ | Manual |
| Sponsor revenue | $500+/month | Manual |
| Referral rate | 15%+ of signups come from referrals | Supabase |

---

## Week-by-Week Action Plan

### Week 1: Foundation
- [ ] Register domain
- [ ] Set up email (Resend)
- [ ] Build waitlist page
- [ ] Set up referral system
- [ ] Create social accounts

### Week 2: Content Prep
- [ ] Write 3 blog posts
- [ ] Polish dashboard
- [ ] Set up analytics
- [ ] Create media kit (1-pager)

### Week 3: Soft Launch
- [ ] Open waitlist to public
- [ ] Start "build in public" on Twitter
- [ ] Invite 10 beta users
- [ ] Collect feedback

### Week 4: Iterate
- [ ] Fix beta feedback
- [ ] Write 2 more blog posts
- [ ] Start newsletter swaps outreach
- [ ] Prepare Product Hunt assets

### Week 5: Launch Week
- [ ] Product Hunt launch (Tue-Thu)
- [ ] HN "Show HN" post
- [ ] Reddit posts
- [ ] Full social media push
- [ ] Email launch announcement

### Week 6: Post-Launch
- [ ] Respond to all feedback
- [ ] Write "launch stats" post
- [ ] Start daily email digest
- [ ] Begin sponsor outreach

### Week 7-8: Growth
- [ ] Publish 2 blog posts/week
- [ ] Newsletter swaps
- [ ] Community building (Discord)
- [ ] Referral program optimization

### Week 9-12: Monetize
- [ ] First sponsor deals
- [ ] Subscription tier planning
- [ ] Chrome extension polish
- [ ] Community growth push

---

## Tools & Costs Summary

| Tool | Purpose | Cost |
|---|---|---|
| Resend | Email automation | Free (100/day) → $20/mo |
| Plausible | Analytics | $9/mo |
| Viral Loops | Referral system | Free (500 referrals) |
| Vercel | Hosting | Free (hobby) → $20/mo |
| Supabase | Database | Free tier (you already have this) |
| Cloudinary | Image CDN | Free tier (you already have this) |
| Carrd | Waitlist page (if needed) | $19/year |
| Buffer | Social scheduling | Free (3 channels) |
| **Total** | | **~$30-50/month** |

---

## The One Thing That Matters Most

**Consistency.**

Publish every day. Send every email. Post every day on Twitter. The algorithm rewards consistency. Your audience rewards consistency. Sponsors reward consistency.

You've already built the hard part — the pipeline, the dashboard, the admin CMS. Now it's about showing up every day and letting the compound effect work.

Day 1: 10 people see it.
Day 30: 100 people see it.
Day 90: 1,000 people see it.
Day 180: 10,000 people see it.

That's how newsletters grow. That's how businesses are built.

**Now go ship it.** 🚀
