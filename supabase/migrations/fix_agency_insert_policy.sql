-- Migration: Fix policy INSERT per agencies
-- Date: December 2024
-- Purpose: Semplifica la policy per permettere INSERT a tutti gli utenti autenticati

-- Rimuovi la policy precedente
DROP POLICY IF EXISTS "Users can insert their agency" ON agencies;

-- Crea policy semplice: tutti gli utenti autenticati possono creare un'agenzia
-- La verifica che l'utente non abbia già un'agenzia viene fatta a livello applicativo
CREATE POLICY "Authenticated users can insert agency"
  ON agencies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Nota: La prevenzione di duplicati è gestita a livello applicativo nel Server Action

