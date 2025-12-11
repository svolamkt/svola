-- Migration: n8n Agency OS - Control Plane
-- Date: December 2024
-- Purpose: Support bidirectional n8n management and client organization

-- 1. Agenzie (Configurazione n8n)
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  n8n_api_key TEXT NOT NULL, -- API Key di n8n (criptare in produzione)
  n8n_base_url TEXT NOT NULL, -- es. https://n8n.miagenzia.com
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clienti dell'Agenzia
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  logger_token TEXT UNIQUE DEFAULT gen_random_uuid(), -- Token per webhook logger
  logger_workflow_id TEXT, -- ID del workflow logger creato in n8n
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Workflow Mappati (Ponte tra n8n e Dashboard)
CREATE TABLE IF NOT EXISTS n8n_workflows (
  id TEXT PRIMARY KEY, -- ID originale di n8n (es. "1234")
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL, -- NULL = Unassigned
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Log Esecuzioni (Dati per Analytics)
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT REFERENCES n8n_workflows(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  execution_id TEXT NOT NULL, -- ID esecuzione n8n
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running')),
  started_at TIMESTAMPTZ NOT NULL,
  execution_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indici per Performance
CREATE INDEX IF NOT EXISTS idx_workflows_agency ON n8n_workflows(agency_id);
CREATE INDEX IF NOT EXISTS idx_workflows_client ON n8n_workflows(client_id);
CREATE INDEX IF NOT EXISTS idx_logs_client_date ON execution_logs(client_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_workflow ON execution_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_clients_agency ON clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_logs_execution_id ON execution_logs(execution_id);

-- RLS Policies
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Agencies (ogni utente vede solo la sua agenzia)
-- Assumiamo che profiles.agency_id esista (da aggiungere se non presente)
CREATE POLICY "Users can view their agency"
  ON agencies FOR SELECT
  USING (
    id = (
      SELECT agency_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their agency"
  ON agencies FOR UPDATE
  USING (
    id = (
      SELECT agency_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Clients (solo clienti della propria agenzia)
CREATE POLICY "Users can view their agency clients"
  ON clients FOR SELECT
  USING (
    agency_id = (
      SELECT agency_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert clients for their agency"
  ON clients FOR INSERT
  WITH CHECK (
    agency_id = (
      SELECT agency_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their agency clients"
  ON clients FOR UPDATE
  USING (
    agency_id = (
      SELECT agency_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Workflows (solo workflow della propria agenzia)
CREATE POLICY "Users can view their agency workflows"
  ON n8n_workflows FOR SELECT
  USING (
    agency_id = (
      SELECT agency_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their agency workflows"
  ON n8n_workflows FOR UPDATE
  USING (
    agency_id = (
      SELECT agency_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert workflows"
  ON n8n_workflows FOR INSERT
  WITH CHECK (true); -- Validated via Server Action

-- Policy: Logs (solo log dei clienti della propria agenzia)
CREATE POLICY "Users can view their agency logs"
  ON execution_logs FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE agency_id = (
        SELECT agency_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Policy: Webhook può inserire log (convalidato via token)
-- NOTE: In produzione, usare Edge Function per validazione token
CREATE POLICY "Webhook can insert logs with token"
  ON execution_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id 
      AND logger_token = current_setting('request.headers', true)::json->>'x-logger-token'
    )
  );

-- Aggiungere agency_id a profiles se non esiste
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'agency_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN agency_id UUID REFERENCES agencies(id);
  END IF;
END $$;

-- Comments per documentazione
COMMENT ON TABLE agencies IS 'Agenzie che usano il sistema. Contiene credenziali n8n.';
COMMENT ON TABLE clients IS 'Clienti dell''agenzia. Ogni cliente ha un workflow logger automatico.';
COMMENT ON TABLE n8n_workflows IS 'Workflow sincronizzati da n8n. Possono essere assegnati a clienti.';
COMMENT ON TABLE execution_logs IS 'Log esecuzioni workflow. Inseriti via webhook con logger_token.';

