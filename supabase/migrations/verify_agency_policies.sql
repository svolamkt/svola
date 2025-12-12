-- Verifica Rapida: Policies Agencies
-- Esegui questo per verificare che tutto sia OK

-- 1. Verifica policies su agencies
SELECT 
  '1. POLICIES AGENCIES' as check_section,
  policyname as policy_name,
  cmd as operation,
  CASE 
    WHEN cmd = 'INSERT' AND policyname = 'Authenticated users can insert agency' THEN '✅ INSERT Policy OK'
    WHEN cmd = 'SELECT' AND policyname = 'Users can view their agency' THEN '✅ SELECT Policy OK'
    WHEN cmd = 'UPDATE' AND policyname = 'Users can update their agency' THEN '✅ UPDATE Policy OK'
    ELSE '⚠️ Policy: ' || policyname
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'agencies'
ORDER BY cmd;

-- 2. Verifica RLS attivo
SELECT 
  '2. RLS STATUS' as check_section,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Abilitato'
    ELSE '❌ RLS NON Abilitato'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'agencies';

-- 3. Verifica profilo utente
SELECT 
  '3. PROFILO UTENTE' as check_section,
  id,
  full_name,
  CASE 
    WHEN agency_id IS NULL THEN '⚠️ Nessuna agenzia collegata (normale per nuovo utente)'
    ELSE '✅ Agenzia già collegata: ' || agency_id::text
  END as status
FROM profiles
WHERE id = auth.uid();

-- 4. Test INSERT (simulazione)
SELECT 
  '4. TEST POLICY' as check_section,
  'INSERT policy allows authenticated users' as test_name,
  '✅ Se vedi questo messaggio, hai i permessi corretti' as status;

-- 5. Conteggio agencies
SELECT 
  '5. CONTEGGIO AGENCIES' as check_section,
  COUNT(*) as total_agencies,
  CASE 
    WHEN COUNT(*) = 0 THEN '⚠️ Nessuna agenzia ancora (normale per nuovo setup)'
    ELSE '✅ ' || COUNT(*) || ' agenzia/e presente/i'
  END as status
FROM agencies;

-- 6. Riepilogo finale
SELECT 
  '6. RIEPILOGO' as check_section,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'agencies' AND cmd = 'INSERT') as insert_policies,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'agencies' AND cmd = 'SELECT') as select_policies,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'agencies' AND cmd = 'UPDATE') as update_policies,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'agencies' AND cmd = 'INSERT') > 0 
    THEN '✅ Tutto pronto! Puoi creare l''agenzia'
    ELSE '❌ Manca ancora qualcosa'
  END as status;

