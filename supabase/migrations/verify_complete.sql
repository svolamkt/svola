-- Script di verifica completo per n8n Agency OS
-- Esegui questo script nel SQL Editor di Supabase per verificare che tutto sia corretto

-- ============================================
-- 1. VERIFICA TABELLE
-- ============================================
SELECT 
  '✅ TABELLE' as sezione,
  table_name,
  CASE 
    WHEN table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs') 
    THEN '✅ OK' 
    ELSE '❌ MANCANTE' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')
ORDER BY table_name;

-- ============================================
-- 2. VERIFICA COLONNA agency_id IN profiles
-- ============================================
SELECT 
  '✅ PROFILES COLUMN' as sezione,
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'agency_id' THEN '✅ OK' 
    ELSE '❌ MANCANTE' 
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name = 'agency_id';

-- ============================================
-- 3. VERIFICA RLS ENABLED
-- ============================================
SELECT 
  '✅ RLS STATUS' as sezione,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')
ORDER BY tablename;

-- ============================================
-- 4. VERIFICA POLICIES RLS - AGENCIES
-- ============================================
SELECT 
  '✅ POLICIES AGENCIES' as sezione,
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname IN (
      'Users can view their agency',
      'Users can update their agency',
      'Users can insert their agency'
    ) THEN '✅ OK'
    ELSE '⚠️ EXTRA'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'agencies'
ORDER BY cmd, policyname;

-- ============================================
-- 5. VERIFICA POLICIES RLS - CLIENTS
-- ============================================
SELECT 
  '✅ POLICIES CLIENTS' as sezione,
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname IN (
      'Users can view their agency clients',
      'Users can insert clients for their agency',
      'Users can update their agency clients'
    ) THEN '✅ OK'
    ELSE '⚠️ EXTRA'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'clients'
ORDER BY cmd, policyname;

-- ============================================
-- 6. VERIFICA POLICIES RLS - WORKFLOWS
-- ============================================
SELECT 
  '✅ POLICIES WORKFLOWS' as sezione,
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname IN (
      'Users can view their agency workflows',
      'Users can update their agency workflows',
      'System can insert workflows'
    ) THEN '✅ OK'
    ELSE '⚠️ EXTRA'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'n8n_workflows'
ORDER BY cmd, policyname;

-- ============================================
-- 7. VERIFICA POLICIES RLS - LOGS
-- ============================================
SELECT 
  '✅ POLICIES LOGS' as sezione,
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname IN (
      'Users can view their agency logs',
      'Webhook can insert logs with token'
    ) THEN '✅ OK'
    ELSE '⚠️ EXTRA'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'execution_logs'
ORDER BY cmd, policyname;

-- ============================================
-- 8. VERIFICA INDICI
-- ============================================
SELECT 
  '✅ INDICI' as sezione,
  indexname,
  tablename,
  CASE 
    WHEN indexname IN (
      'idx_workflows_agency',
      'idx_workflows_client',
      'idx_logs_client_date',
      'idx_logs_workflow',
      'idx_clients_agency',
      'idx_logs_execution_id'
    ) THEN '✅ OK'
    ELSE '⚠️ EXTRA'
  END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND (
  indexname IN (
    'idx_workflows_agency',
    'idx_workflows_client',
    'idx_logs_client_date',
    'idx_logs_workflow',
    'idx_clients_agency',
    'idx_logs_execution_id'
  )
  OR tablename IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')
)
ORDER BY tablename, indexname;

-- ============================================
-- 9. VERIFICA FOREIGN KEYS
-- ============================================
SELECT
  '✅ FOREIGN KEYS' as sezione,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✅ OK' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs', 'profiles')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 10. RIEPILOGO FINALE
-- ============================================
SELECT 
  '📊 RIEPILOGO' as sezione,
  'Total Tables' as item,
  COUNT(*)::text as value,
  CASE WHEN COUNT(*) = 4 THEN '✅ OK' ELSE '❌ ERROR' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')

UNION ALL

SELECT 
  '📊 RIEPILOGO',
  'RLS Enabled Tables',
  COUNT(*)::text,
  CASE WHEN COUNT(*) = 4 THEN '✅ OK' ELSE '❌ ERROR' END
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')
AND rowsecurity = true

UNION ALL

SELECT 
  '📊 RIEPILOGO',
  'Total Policies',
  COUNT(*)::text,
  CASE WHEN COUNT(*) >= 10 THEN '✅ OK' ELSE '⚠️ CHECK' END
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')

UNION ALL

SELECT 
  '📊 RIEPILOGO',
  'Agencies INSERT Policy',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'agencies' 
    AND policyname = 'Users can insert their agency'
  ) THEN '1' ELSE '0' END,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'agencies' 
    AND policyname = 'Users can insert their agency'
  ) THEN '✅ OK' ELSE '❌ MISSING' END

UNION ALL

SELECT 
  '📊 RIEPILOGO',
  'Total Indexes',
  COUNT(*)::text,
  CASE WHEN COUNT(*) >= 6 THEN '✅ OK' ELSE '⚠️ CHECK' END
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
  'idx_workflows_agency',
  'idx_workflows_client',
  'idx_logs_client_date',
  'idx_logs_workflow',
  'idx_clients_agency',
  'idx_logs_execution_id'
);

