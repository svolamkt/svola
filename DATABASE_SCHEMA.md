/**
 * NEXUS AI - HYBRID SCHEMA (Marketing + Sales)
 * Target: PostgreSQL (Supabase)
 */

-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. TENANCY & AUTH
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'trial',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  full_name TEXT,
  role TEXT DEFAULT 'member'
);

-- 2. THE BRAIN (Strategy & Memory)
CREATE TABLE brand_settings (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id),
  tone_of_voice TEXT,
  website_url TEXT,
  target_audience TEXT
);

CREATE TABLE strategy_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  doc_type TEXT, -- 'swot', 'persona', 'journey'
  content_json JSONB, -- Structured data
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE knowledge_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  content_chunk TEXT,
  embedding vector(1536), -- For RAG
  metadata JSONB -- { source: "brochure.pdf" }
);

-- 3. THE HUNTER (Lead Gen)
CREATE TABLE lead_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  query TEXT,
  status TEXT DEFAULT 'queued', -- queued, processing, completed
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  search_id UUID REFERENCES lead_searches(id),
  company_name TEXT,
  contact_name TEXT,
  email TEXT,
  linkedin_url TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, converted
  enrichment_data JSONB -- Extra data from scraping
);

-- 4. THE FEED (Proposals)
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  type TEXT CHECK (type IN ('social_post', 'cold_email', 'reply')),
  
  -- The core content to be approved
  content_payload JSONB NOT NULL, -- { "body": "...", "subject": "..." }
  
  -- Link to a Lead (if it's an outreach proposal)
  related_lead_id UUID REFERENCES leads(id),
  
  status TEXT DEFAULT 'pending', -- pending, approved, published, failed
  ai_rationale TEXT, -- "Why I proposed this"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. INTEGRATIONS
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  provider TEXT, -- 'linkedin', 'google', 'custom_webhook'
  encrypted_token TEXT,
  is_active BOOLEAN DEFAULT true
);

-- SECURITY: RLS POLICIES (Example)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
-- (Add policies filtering by organization_id = auth.user.org_id)

