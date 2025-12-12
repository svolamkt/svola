-- Migration: n8n Agency OS - Control Plane (Safe Version - No DROP statements)
-- Date: December 2024
-- Purpose: Support bidirectional n8n management and client organization
-- 
-- NOTE: This version doesn't use DROP POLICY to avoid Supabase warnings.
-- If policies already exist, you may see "already exists" errors which are safe to ignore.

-- STEP 0: Aggiungere agency_id a profiles PRIMA di creare le policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'agency_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN agency_id UUID;
  END IF;
END $$;

-- 1. Agenzie (Configurazione n8n)
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  n8n_api_key TEXT NOT NULL,
  n8n_base_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Aggiungi foreign key constraint a profiles.agency_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_agency_id_fkey'
    AND table_name = 'profiles'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'agency_id'
    ) THEN
      ALTER TABLE profiles 
      ADD CONSTRAINT profiles_agency_id_fkey 
      FOREIGN KEY (agency_id) REFERENCES agencies(id);
    END IF;
  END IF;
END $$;

-- 2. Clienti dell'Agenzia
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  logger_token TEXT UNIQUE DEFAULT gen_random_uuid(),
  logger_workflow_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Workflow Mappati
CREATE TABLE IF NOT EXISTS n8n_workflows (
  id TEXT PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Log Esecuzioni
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT REFERENCES n8n_workflows(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  execution_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running')),
  started_at TIMESTAMPTZ NOT NULL,
  execution_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_workflows_agency ON n8n_workflows(agency_id);
CREATE INDEX IF NOT EXISTS idx_workflows_client ON n8n_workflows(client_id);
CREATE INDEX IF NOT EXISTS idx_logs_client_date ON execution_logs(client_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_workflow ON execution_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_clients_agency ON clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_logs_execution_id ON execution_logs(execution_id);

-- RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;

-- Policies (senza DROP - se esistono già darà errore "already exists" che puoi ignorare)
CREATE POLICY IF NOT EXISTS "Users can view their agency"
  ON agencies FOR SELECT
  USING (
    id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users can update their agency"
  ON agencies FOR UPDATE
  USING (
    id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users can view their agency clients"
  ON clients FOR SELECT
  USING (
    agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users can insert clients for their agency"
  ON clients FOR INSERT
  WITH CHECK (
    agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users can update their agency clients"
  ON clients FOR UPDATE
  USING (
    agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users can view their agency workflows"
  ON n8n_workflows FOR SELECT
  USING (
    agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "Users can update their agency workflows"
  ON n8n_workflows FOR UPDATE
  USING (
    agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "System can insert workflows"
  ON n8n_workflows FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can view their agency logs"
  ON execution_logs FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY IF NOT EXISTS "Webhook can insert logs with token"
  ON execution_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id 
      AND logger_token = current_setting('request.headers', true)::json->>'x-logger-token'
    )
  );

-- Comments
COMMENT ON TABLE agencies IS 'Agenzie che usano il sistema. Contiene credenziali n8n.';
COMMENT ON TABLE clients IS 'Clienti dell''agenzia. Ogni cliente ha un workflow logger automatico.';
COMMENT ON TABLE n8n_workflows IS 'Workflow sincronizzati da n8n. Possono essere assegnati a clienti.';
COMMENT ON TABLE execution_logs IS 'Log esecuzioni workflow. Inseriti via webhook con logger_token.';

