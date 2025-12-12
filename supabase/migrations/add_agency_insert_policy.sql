-- Migration: Aggiungi policy INSERT per agencies
-- Date: December 2024
-- Purpose: Permettere agli utenti di creare una nuova agenzia

-- Policy: Users can insert a new agency if they don't have one yet
DROP POLICY IF EXISTS "Users can insert their agency" ON agencies;
CREATE POLICY "Users can insert their agency"
  ON agencies FOR INSERT
  WITH CHECK (
    -- Permetti inserimento se l'utente non ha ancora un'agenzia
    NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND agency_id IS NOT NULL
    )
  );

