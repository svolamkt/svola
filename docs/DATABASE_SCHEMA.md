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

-- 2. THE BRAIN (Strategy & Memory) - BRAND IDENTITY COMPLETE
CREATE TABLE brand_identity (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Informazioni Base Azienda
  company_name TEXT NOT NULL,
  company_description TEXT,
  website_url TEXT,
  industry TEXT,
  founded_year INTEGER,
  
  -- Brand Kit (Design)
  primary_color TEXT, -- Hex code (e.g., #FF5733)
  secondary_color TEXT,
  logo_url TEXT, -- Supabase Storage URL
  typography TEXT, -- Font family name
  brand_voice_description TEXT, -- Descrizione testuale del tono
  
  -- Tono di Voce (Dettagliato)
  tone_of_voice JSONB, -- { "formal": 3, "friendly": 8, "professional": 9, "humorous": 2, "technical": 5 }
  forbidden_words TEXT[], -- Array di parole da evitare
  key_messages TEXT[], -- Array di messaggi chiave da includere sempre
  
  -- Analisi Strategica
  swot_analysis JSONB, -- { "strengths": [...], "weaknesses": [...], "opportunities": [...], "threats": [...] }
  market_research JSONB, -- { "market_size": "...", "trends": [...], "insights": [...] }
  competitors JSONB, -- [{ "name": "...", "strengths": "...", "weaknesses": "..." }]
  target_audience JSONB, -- [{ "persona": "...", "pain_points": [...], "goals": [...] }]
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE strategy_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  doc_type TEXT, -- 'swot', 'persona', 'journey', 'competitor_analysis', 'market_research'
  title TEXT,
  content_json JSONB, -- Structured data
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
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
  type TEXT CHECK (type IN ('social_post', 'cold_email', 'reply', 'strategy_alert')),
  
  -- The core content to be approved
  content_payload JSONB NOT NULL, -- { "body": "...", "subject": "..." }
  
  -- Link to a Lead (if it's an outreach proposal)
  related_lead_id UUID REFERENCES leads(id),
  
  status TEXT DEFAULT 'pending', -- pending, approved, published, failed, rejected
  ai_rationale TEXT, -- "Why I proposed this"
  snooze_until TIMESTAMPTZ, -- For snooze functionality
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

-- SECURITY: RLS POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: brand_identity
CREATE POLICY "Users can view their org brand_identity"
  ON brand_identity FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their org brand_identity"
  ON brand_identity FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their org brand_identity"
  ON brand_identity FOR UPDATE
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policy: strategy_docs
CREATE POLICY "Users can view their org strategy_docs"
  ON strategy_docs FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their org strategy_docs"
  ON strategy_docs FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their org strategy_docs"
  ON strategy_docs FOR UPDATE
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their org strategy_docs"
  ON strategy_docs FOR DELETE
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policy: profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

