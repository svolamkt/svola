/**
 * Script per eseguire la migration n8n Agency OS direttamente via API Supabase
 * 
 * Questo script usa l'API REST di Supabase per eseguire la migration SQL
 * 
 * Uso:
 *   npx tsx scripts/run-migration-direct.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables')
  console.error('Required:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function executeSQL(sql: string) {
  // Supabase non ha un'API REST diretta per SQL arbitrario per sicurezza
  // Dobbiamo usare l'approccio del dashboard: eseguire tramite PostgREST o creare una funzione
  
  // Alternativa: usare l'API Management di Supabase (se disponibile)
  // Oppure creare una Edge Function temporanea
  
  // Per ora, mostriamo le istruzioni per eseguire manualmente
  console.log('⚠️  Supabase non espone un\'API REST pubblica per eseguire SQL arbitrario per motivi di sicurezza.')
  console.log('📋 Esegui la migration manualmente nel Dashboard Supabase:\n')
  console.log('1. Vai su https://app.supabase.com')
  console.log('2. Seleziona il tuo progetto')
  console.log('3. Vai su SQL Editor')
  console.log('4. Copia e incolla il contenuto di: supabase/migrations/add_n8n_agency_os.sql')
  console.log('5. Clicca "Run"\n')
  
  // Mostriamo anche il contenuto del file per facilità
  const migrationPath = join(process.cwd(), 'supabase/migrations/add_n8n_agency_os.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')
  
  console.log('📄 Contenuto della migration:\n')
  console.log('─'.repeat(60))
  console.log(migrationSQL)
  console.log('─'.repeat(60))
}

async function runMigration() {
  console.log('🚀 n8n Agency OS - Migration Script\n')
  
  const migrationPath = join(process.cwd(), 'supabase/migrations/add_n8n_agency_os.sql')
  
  if (!migrationPath) {
    console.error('❌ Migration file not found')
    process.exit(1)
  }
  
  const migrationSQL = readFileSync(migrationPath, 'utf-8')
  
  await executeSQL(migrationSQL)
  
  console.log('\n✅ Istruzioni mostrate sopra. Esegui la migration nel Dashboard Supabase.')
}

runMigration().catch((error) => {
  console.error('\n❌ Error:', error)
  process.exit(1)
})

