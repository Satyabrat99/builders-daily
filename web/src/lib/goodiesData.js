/**
 * Curated vault of 15 verified, real-world builder goodies.
 * Short, clean titles and punchy descriptions matching Featured Gem aesthetics.
 * Strictly no stock images, no mock data.
 */

export const INITIAL_GOODIES = [
  // 1. shadcn/ui
  {
    id: 'goody-1',
    title: 'shadcn/ui',
    description: 'Accessible, copy-paste React & Tailwind components.',
    resource_url: 'https://github.com/shadcn-ui/ui',
    url: 'https://github.com/shadcn-ui/ui',
    thumbnail_url: 'https://opengraph.githubassets.com/1/shadcn-ui/ui',
    image: 'https://opengraph.githubassets.com/1/shadcn-ui/ui',
    platform: 'code',
    category: 'Vibecoders',
    author_name: 'shadcn',
    author_handle: '@shadcn',
    status: 'approved',
    is_featured: true,
    click_count: 340
  },
  // 2. 21st.dev Component & Shader Vault
  {
    id: 'goody-2',
    title: '21st.dev',
    description: 'Curated component & WebGL shader library.',
    resource_url: 'https://21st.dev',
    url: 'https://21st.dev',
    thumbnail_url: 'https://21st.dev/opengraph-image.png',
    image: 'https://21st.dev/opengraph-image.png',
    platform: 'tool',
    category: 'Vibecoders',
    author_name: '21st.dev Community',
    author_handle: '@21st_dev',
    status: 'approved',
    is_featured: true,
    click_count: 295
  },
  // 3. BentoGrids
  {
    id: 'goody-3',
    title: 'BentoGrids',
    description: 'Modern bento layouts & UI section presets.',
    resource_url: 'https://bentogrids.com',
    url: 'https://bentogrids.com',
    thumbnail_url: 'https://bentogrids.com/images/og.png',
    image: 'https://bentogrids.com/images/og.png',
    platform: 'tool',
    category: 'SaaS Builders',
    author_name: 'BentoGrids',
    author_handle: '@bentogrids',
    status: 'approved',
    is_featured: true,
    click_count: 210
  },
  // 4. Y Combinator Standard Post-Money SAFE
  {
    id: 'goody-4',
    title: 'YC SAFE Agreements',
    description: 'Industry-standard seed fundraising contracts.',
    resource_url: 'https://www.ycombinator.com/documents',
    url: 'https://www.ycombinator.com/documents',
    thumbnail_url: 'https://www.ycombinator.com/assets/ycdc/yc-og-image-c440a0ad1dacfb86eeeb343717479cc54d256614449b4ef719977a0a451f8bc8.png',
    image: 'https://www.ycombinator.com/assets/ycdc/yc-og-image-c440a0ad1dacfb86eeeb343717479cc54d256614449b4ef719977a0a451f8bc8.png',
    platform: 'legal',
    category: 'Series Founders',
    author_name: 'Y Combinator',
    author_handle: '@ycombinator',
    status: 'approved',
    is_featured: true,
    click_count: 280
  },
  // 5. Pitch Deck Hunt
  {
    id: 'goody-5',
    title: 'Pitch Deck Hunt',
    description: 'Real winning pitch decks from top startups.',
    resource_url: 'https://pitchdeckhunt.com',
    url: 'https://pitchdeckhunt.com',
    thumbnail_url: 'https://cdn.prod.website-files.com/5eb6a4640e0bc85ac562ed85/5ebbf61e9b155e3fb809ecc8_pitchdeckhunt-og-image.jpg',
    image: 'https://cdn.prod.website-files.com/5eb6a4640e0bc85ac562ed85/5ebbf61e9b155e3fb809ecc8_pitchdeckhunt-og-image.jpg',
    platform: 'tool',
    category: 'Series Founders',
    author_name: 'Pitch Deck Hunt',
    author_handle: '@PitchDeckHunt',
    status: 'approved',
    is_featured: true,
    click_count: 245
  },
  // 6. Vercel AI Chatbot Starter
  {
    id: 'goody-6',
    title: 'Vercel AI Chatbot',
    description: 'Production-ready Next.js AI chat template.',
    resource_url: 'https://github.com/vercel/ai-chatbot',
    url: 'https://github.com/vercel/ai-chatbot',
    thumbnail_url: 'https://opengraph.githubassets.com/1/vercel/ai-chatbot',
    image: 'https://opengraph.githubassets.com/1/vercel/ai-chatbot',
    platform: 'code',
    category: 'Vibecoders',
    author_name: 'Vercel Engineering',
    author_handle: '@vercel',
    status: 'approved',
    is_featured: true,
    click_count: 260
  },

  // 7. Magic UI
  {
    id: 'goody-7',
    title: 'Magic UI',
    description: '50+ animated React landing page components.',
    resource_url: 'https://github.com/magicuidesign/magicui',
    url: 'https://github.com/magicuidesign/magicui',
    thumbnail_url: 'https://opengraph.githubassets.com/1/magicuidesign/magicui',
    image: 'https://opengraph.githubassets.com/1/magicuidesign/magicui',
    platform: 'code',
    category: 'Vibecoders',
    author_name: 'Dillion Verma',
    author_handle: '@dillionverma',
    status: 'approved',
    is_featured: false,
    click_count: 195
  },
  // 8. Stripe Subscription Sample & Webhooks
  {
    id: 'goody-8',
    title: 'Stripe Subscriptions',
    description: 'Official webhook and billing starter repo.',
    resource_url: 'https://github.com/stripe-samples/subscription-use-cases',
    url: 'https://github.com/stripe-samples/subscription-use-cases',
    thumbnail_url: 'https://opengraph.githubassets.com/1/stripe-samples/subscription-use-cases',
    image: 'https://opengraph.githubassets.com/1/stripe-samples/subscription-use-cases',
    platform: 'code',
    category: 'SaaS Builders',
    author_name: 'Stripe Dev',
    author_handle: '@stripedev',
    status: 'approved',
    is_featured: false,
    click_count: 175
  },
  // 9. Resend Modern Email Platform
  {
    id: 'goody-9',
    title: 'Resend',
    description: 'Modern email API built for developers.',
    resource_url: 'https://resend.com',
    url: 'https://resend.com',
    thumbnail_url: 'https://resend.com/static/cover.png',
    image: 'https://resend.com/static/cover.png',
    platform: 'tool',
    category: 'SaaS Builders',
    author_name: 'Zeno Rocha',
    author_handle: '@zenorocha',
    status: 'approved',
    is_featured: false,
    click_count: 165
  },
  // 10. Dub.co Open-Source Link Management
  {
    id: 'goody-10',
    title: 'Dub.co',
    description: 'Open-source link management infrastructure.',
    resource_url: 'https://github.com/dubinc/dub',
    url: 'https://github.com/dubinc/dub',
    thumbnail_url: 'https://opengraph.githubassets.com/1/dubinc/dub',
    image: 'https://opengraph.githubassets.com/1/dubinc/dub',
    platform: 'code',
    category: 'SaaS Builders',
    author_name: 'Steven Tey',
    author_handle: '@steventey',
    status: 'approved',
    is_featured: false,
    click_count: 155
  },
  // 11. SST Ion Modern Serverless
  {
    id: 'goody-11',
    title: 'SST Ion',
    description: 'Zero-config TypeScript cloud deployments.',
    resource_url: 'https://github.com/sst/ion',
    url: 'https://github.com/sst/ion',
    thumbnail_url: 'https://opengraph.githubassets.com/1/sst/ion',
    image: 'https://opengraph.githubassets.com/1/sst/ion',
    platform: 'code',
    category: 'Vibecoders',
    author_name: 'SST Team',
    author_handle: '@sst_dev',
    status: 'approved',
    is_featured: false,
    click_count: 150
  },
  // 12. Supabase Open Source Firebase Alternative
  {
    id: 'goody-12',
    title: 'Supabase',
    description: 'Open-source Firebase alternative with Postgres.',
    resource_url: 'https://github.com/supabase/supabase',
    url: 'https://github.com/supabase/supabase',
    thumbnail_url: 'https://opengraph.githubassets.com/1/supabase/supabase',
    image: 'https://opengraph.githubassets.com/1/supabase/supabase',
    platform: 'code',
    category: 'SaaS Builders',
    author_name: 'Supabase Team',
    author_handle: '@supabase',
    status: 'approved',
    is_featured: false,
    click_count: 220
  },
  // 13. DAIR.AI Prompt Engineering Guide
  {
    id: 'goody-13',
    title: 'Prompt Guide',
    description: 'Comprehensive LLM & AI agent techniques.',
    resource_url: 'https://github.com/dair-ai/Prompt-Engineering-Guide',
    url: 'https://github.com/dair-ai/Prompt-Engineering-Guide',
    thumbnail_url: 'https://opengraph.githubassets.com/1/dair-ai/Prompt-Engineering-Guide',
    image: 'https://opengraph.githubassets.com/1/dair-ai/Prompt-Engineering-Guide',
    platform: 'code',
    category: 'Vibecoders',
    author_name: 'DAIR.AI',
    author_handle: '@dair_ai',
    status: 'approved',
    is_featured: false,
    click_count: 180
  },
  // 14. OpenAI Whisper
  {
    id: 'goody-14',
    title: 'OpenAI Whisper',
    description: 'High-accuracy local speech-to-text neural net.',
    resource_url: 'https://github.com/openai/whisper',
    url: 'https://github.com/openai/whisper',
    thumbnail_url: 'https://opengraph.githubassets.com/1/openai/whisper',
    image: 'https://opengraph.githubassets.com/1/openai/whisper',
    platform: 'code',
    category: 'Vibecoders',
    author_name: 'OpenAI Open Source',
    author_handle: '@openai',
    status: 'approved',
    is_featured: false,
    click_count: 215
  },
  // 15. Developer Roadmap
  {
    id: 'goody-15',
    title: 'Cursor Rules',
    description: 'Curated .cursorrules for Next.js and Python.',
    resource_url: 'https://github.com/PatrickJS/awesome-cursorrules',
    url: 'https://github.com/PatrickJS/awesome-cursorrules',
    thumbnail_url: 'https://opengraph.githubassets.com/1/PatrickJS/awesome-cursorrules',
    image: 'https://opengraph.githubassets.com/1/PatrickJS/awesome-cursorrules',
    platform: 'code',
    category: 'Vibecoders',
    author_name: 'PatrickJS',
    author_handle: '@gdi2290',
    status: 'approved',
    is_featured: false,
    click_count: 205
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Goodies', count: 15 },
  { id: 'Vibecoders', label: 'Vibecoders', count: 8 },
  { id: 'SaaS Builders', label: 'SaaS Builders', count: 5 },
  { id: 'Series Founders', label: 'Series Founders', count: 2 }
];
