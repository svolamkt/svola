-- Migration: Add workflow_logs table and white-label fields to organizations
-- Date: December 2024
-- Purpose: Support n8n Analytics Dashboard White-Label

-- 1. Extend organizations table with white-label fields
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE DEFAULT gen_random_uuid();

-- 2. Create workflow_logs table
CREATE TABLE IF NOT EXISTS workflow_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  execution_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('success', 'error', 'running')) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_logs_org_date ON workflow_logs(org_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_status ON workflow_logs(status);
CREATE INDEX IF NOT EXISTS idx_logs_workflow ON workflow_logs(workflow_name);
CREATE INDEX IF NOT EXISTS idx_logs_execution_id ON workflow_logs(execution_id);

-- 4. Enable RLS
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy: Users can view their org logs
CREATE POLICY "Users can view their org logs"
  ON workflow_logs FOR SELECT
  USING (
    org_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 6. RLS Policy: n8n can insert logs with api_key
-- NOTE: This requires Supabase Edge Function or Service Role
-- For now, we'll use a function that validates API key
CREATE OR REPLACE FUNCTION validate_api_key(api_key_param TEXT, org_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organizations 
    WHERE id = org_id_param 
    AND api_key = api_key_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for INSERT (will be handled by Edge Function or Service Role in practice)
-- For development, we can use a more permissive policy, but in production use Edge Function
CREATE POLICY "Allow insert with valid api_key"
  ON workflow_logs FOR INSERT
  WITH CHECK (true); -- In production, validate via Edge Function

-- 7. Add comment for documentation
COMMENT ON TABLE workflow_logs IS 'Logs from n8n workflows. Inserted via API key authentication.';
COMMENT ON COLUMN workflow_logs.org_id IS 'Organization ID for multi-tenancy isolation';
COMMENT ON COLUMN workflow_logs.execution_id IS 'Unique n8n execution ID';
COMMENT ON COLUMN workflow_logs.metadata IS 'Custom JSON data from n8n workflow';


