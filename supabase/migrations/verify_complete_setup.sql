-- Script di Verifica Completa - n8n Agency OS
-- Esegui questo script per verificare che tutto sia configurato correttamente

-- ==============================================
-- 1. VERIFICA ESISTENZA TABELLE
-- ==============================================
SELECT 
  'TABELLE ESISTENTI' as check_type,
  table_name,
  CASE 
    WHEN table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs', 'profiles') 
    THEN '✅ OK'
    ELSE '❌ Tabella imprevista'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs', 'profiles')
ORDER BY table_name;

-- ==============================================
-- 2. VERIFICA RLS ABILITATO
-- ==============================================
SELECT 
  'RLS STATUS' as check_type,
  tablename as table_name,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Abilitato'
    ELSE '❌ RLS NON Abilitato'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs', 'profiles')
ORDER BY tablename;

-- ==============================================
-- 3. VERIFICA POLICIES - AGENCIES
-- ==============================================
SELECT 
  'POLICIES - AGENCIES' as check_type,
  policyname as policy_name,
  cmd as operation,
  CASE 
    WHEN policyname LIKE '%view%' AND cmd = 'SELECT' THEN '✅ SELECT Policy OK'
    WHEN policyname LIKE '%update%' AND cmd = 'UPDATE' THEN '✅ UPDATE Policy OK'
    WHEN policyname LIKE '%insert%' AND cmd = 'INSERT' THEN '✅ INSERT Policy OK'
    ELSE '⚠️ Policy trovata: ' || cmd
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'agencies'
ORDER BY cmd, policyname;

-- ==============================================
-- 4. VERIFICA POLICIES - CLIENTS
-- ==============================================
SELECT 
  'POLICIES - CLIENTS' as check_type,
  policyname as policy_name,
  cmd as operation,
  CASE 
    WHEN cmd IN ('SELECT', 'INSERT', 'UPDATE') THEN '✅ Policy OK'
    ELSE '⚠️ Policy: ' || cmd
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'clients'
ORDER BY cmd, policyname;

-- ==============================================
-- 5. VERIFICA POLICIES - N8N_WORKFLOWS
-- ==============================================
SELECT 
  'POLICIES - N8N_WORKFLOWS' as check_type,
  policyname as policy_name,
  cmd as operation,
  CASE 
    WHEN cmd IN ('SELECT', 'INSERT', 'UPDATE') THEN '✅ Policy OK'
    ELSE '⚠️ Policy: ' || cmd
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'n8n_workflows'
ORDER BY cmd, policyname;

-- ==============================================
-- 6. VERIFICA POLICIES - EXECUTION_LOGS
-- ==============================================
SELECT 
  'POLICIES - EXECUTION_LOGS' as check_type,
  policyname as policy_name,
  cmd as operation,
  CASE 
    WHEN cmd IN ('SELECT', 'INSERT') THEN '✅ Policy OK'
    ELSE '⚠️ Policy: ' || cmd
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'execution_logs'
ORDER BY cmd, policyname;

-- ==============================================
-- 7. VERIFICA COLONNE AGENCIES
-- ==============================================
SELECT 
  'COLONNE - AGENCIES' as check_type,
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'id' AND data_type = 'uuid' THEN '✅ OK'
    WHEN column_name = 'name' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'n8n_api_key' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'n8n_base_url' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name IN ('created_at', 'updated_at') AND data_type = 'timestamp with time zone' THEN '✅ OK'
    ELSE '⚠️ Colonna imprevista'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agencies'
ORDER BY ordinal_position;

-- ==============================================
-- 8. VERIFICA COLONNE CLIENTS
-- ==============================================
SELECT 
  'COLONNE - CLIENTS' as check_type,
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'id' AND data_type = 'uuid' THEN '✅ OK'
    WHEN column_name = 'agency_id' AND data_type = 'uuid' THEN '✅ OK'
    WHEN column_name = 'name' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'status' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'logger_token' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'logger_workflow_id' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name IN ('created_at', 'updated_at') AND data_type = 'timestamp with time zone' THEN '✅ OK'
    ELSE '⚠️ Colonna imprevista'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'clients'
ORDER BY ordinal_position;

-- ==============================================
-- 9. VERIFICA COLONNE N8N_WORKFLOWS
-- ==============================================
SELECT 
  'COLONNE - N8N_WORKFLOWS' as check_type,
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'id' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'agency_id' AND data_type = 'uuid' THEN '✅ OK'
    WHEN column_name = 'client_id' AND data_type = 'uuid' THEN '✅ OK'
    WHEN column_name = 'name' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'is_active' AND data_type = 'boolean' THEN '✅ OK'
    WHEN column_name IN ('last_synced_at', 'created_at') AND data_type = 'timestamp with time zone' THEN '✅ OK'
    ELSE '⚠️ Colonna imprevista'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'n8n_workflows'
ORDER BY ordinal_position;

-- ==============================================
-- 10. VERIFICA COLONNE EXECUTION_LOGS
-- ==============================================
SELECT 
  'COLONNE - EXECUTION_LOGS' as check_type,
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'id' AND data_type = 'uuid' THEN '✅ OK'
    WHEN column_name = 'workflow_id' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'client_id' AND data_type = 'uuid' THEN '✅ OK'
    WHEN column_name = 'execution_id' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'status' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'execution_time_ms' AND data_type = 'integer' THEN '✅ OK'
    WHEN column_name = 'error_message' AND data_type = 'text' THEN '✅ OK'
    WHEN column_name = 'metadata' AND data_type = 'jsonb' THEN '✅ OK'
    WHEN column_name IN ('started_at', 'created_at') AND data_type = 'timestamp with time zone' THEN '✅ OK'
    ELSE '⚠️ Colonna imprevista'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'execution_logs'
ORDER BY ordinal_position;

-- ==============================================
-- 11. VERIFICA INDICI
-- ==============================================
SELECT 
  'INDICI' as check_type,
  tablename as table_name,
  indexname as index_name,
  '✅ Indice presente' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')
  AND indexname NOT LIKE '%pkey'
ORDER BY tablename, indexname;

-- ==============================================
-- 12. VERIFICA FOREIGN KEYS
-- ==============================================
SELECT 
  'FOREIGN KEYS' as check_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✅ FK Presente' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('clients', 'n8n_workflows', 'execution_logs', 'profiles')
ORDER BY tc.table_name, kcu.column_name;

-- ==============================================
-- 13. VERIFICA PROFILO UTENTE
-- ==============================================
SELECT 
  'PROFILO UTENTE' as check_type,
  id,
  full_name,
  CASE 
    WHEN agency_id IS NULL THEN '⚠️ Nessuna agenzia collegata'
    ELSE '✅ Agenzia collegata: ' || agency_id::text
  END as status
FROM profiles
WHERE id = auth.uid();

-- ==============================================
-- 14. CONTEGGIO RECORDS
-- ==============================================
SELECT 'CONTEGGIO - AGENCIES' as check_type, COUNT(*) as total FROM agencies
UNION ALL
SELECT 'CONTEGGIO - CLIENTS', COUNT(*) FROM clients
UNION ALL
SELECT 'CONTEGGIO - N8N_WORKFLOWS', COUNT(*) FROM n8n_workflows
UNION ALL
SELECT 'CONTEGGIO - EXECUTION_LOGS', COUNT(*) FROM execution_logs
ORDER BY check_type;

-- ==============================================
-- 15. RIEPILOGO FINALE
-- ==============================================
SELECT 
  '🎉 RIEPILOGO FINALE' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'agencies' AND cmd = 'INSERT') > 0 
    THEN '✅ Policy INSERT per agencies presente'
    ELSE '❌ MANCA policy INSERT per agencies'
  END as agencies_insert_policy,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'agencies') > 0 
    THEN '✅ Tutte le tabelle presenti'
    ELSE '❌ Tabelle mancanti'
  END as tables_status,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE rowsecurity = false AND tablename IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')) = 0
    THEN '✅ RLS abilitato su tutte le tabelle'
    ELSE '❌ RLS non abilitato su alcune tabelle'
  END as rls_status;

