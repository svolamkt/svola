# NEXT.JS FOLDER STRUCTURE

/app
  /(auth)                 # Public Auth Routes
    /login
    /register
  /(dashboard)            # Protected App Routes
    /layout.tsx           # Sidebar Navigation & User Context
    /page.tsx             # THE FEED (Home - Unified View)
    /leads/page.tsx       # "The Hunter" Interface
    /strategy/page.tsx    # "The Brain" (SWOT, Personas)
    /settings/page.tsx    # Brand & Integrations
  /api
    /webhooks/n8n         # Endpoint for inbound proposals
    /webhooks/stripe      # Billing

/components
  /modules
    /feed                 # ProposalCard, FeedFilters
    /leads                # LeadsTable, SearchInput
    /strategy             # SwotGrid, PersonaCard
    /onboarding           # Initial Wizard
  /ui                     # Shadcn Components (Button, Input, Card)
  /layout                 # Sidebar, Header, MobileNav

/lib
  /supabase               # Client & Server Clients
  /types                  # Zod Schemas & TS Interfaces
  /utils                  # Helpers

/server
  /actions                # Server Actions (Mutations)
    /proposals.ts         # approveProposal, rejectProposal
    /leads.ts             # startSearch, updateLead
    /strategy.ts          # saveSwot
  /queries                # Data Fetching
    /get-feed.ts
    /get-leads.ts

