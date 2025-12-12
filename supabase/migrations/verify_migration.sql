-- Script di verifica per la migration n8n Agency OS
-- Esegui questo script nel SQL Editor di Supabase per verificare che tutto sia corretto

-- 1. Verifica Tabelle
SELECT 
  'TABLES' as check_type,
  table_name,
  CASE 
    WHEN table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs') 
    THEN '✅ OK' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')
ORDER BY table_name;

-- 2. Verifica Colonne nelle Tabelle
SELECT 
  'COLUMNS' as check_type,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')
ORDER BY table_name, ordinal_position;

-- 3. Verifica agency_id in profiles
SELECT 
  'PROFILES_COLUMN' as check_type,
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'agency_id' THEN '✅ OK' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name = 'agency_id';

-- 4. Verifica Indici
SELECT 
  'INDEXES' as check_type,
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

-- 5. Verifica RLS abilitato
SELECT 
  'RLS_STATUS' as check_type,
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

-- 6. Verifica Policies RLS
SELECT 
  'POLICIES' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN policyname IN (
      'Users can view their agency',
      'Users can update their agency',
      'Users can view their agency clients',
      'Users can insert clients for their agency',
      'Users can update their agency clients',
      'Users can view their agency workflows',
      'Users can update their agency workflows',
      'System can insert workflows',
      'Users can view their agency logs',
      'Webhook can insert logs with token'
    ) THEN '✅ OK'
    ELSE '⚠️ EXTRA'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')
ORDER BY tablename, policyname;

-- 7. Verifica Foreign Keys
SELECT
  'FOREIGN_KEYS' as check_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name,
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

-- 8. Riepilogo Finale
SELECT 
  'SUMMARY' as check_type,
  'Total Tables' as item,
  COUNT(*)::text as value,
  CASE WHEN COUNT(*) = 4 THEN '✅ OK' ELSE '❌ ERROR' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')

UNION ALL

SELECT 
  'SUMMARY',
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
)

UNION ALL

SELECT 
  'SUMMARY',
  'RLS Enabled Tables',
  COUNT(*)::text,
  CASE WHEN COUNT(*) = 4 THEN '✅ OK' ELSE '❌ ERROR' END
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs')
AND rowsecurity = true

UNION ALL

SELECT 
  'SUMMARY',
  'Total Policies',
  COUNT(*)::text,
  CASE WHEN COUNT(*) >= 10 THEN '✅ OK' ELSE '⚠️ CHECK' END
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('agencies', 'clients', 'n8n_workflows', 'execution_logs');

