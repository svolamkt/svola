/**
 * Script per eseguire la migration n8n Agency OS
 * 
 * Uso:
 *   npx tsx scripts/run-migration.ts
 * 
 * Oppure con variabili d'ambiente:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
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

async function runMigration() {
  console.log('🚀 Starting migration: n8n Agency OS...\n')

  // Crea client con service role (bypassa RLS)
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Leggi file migration
  const migrationPath = join(process.cwd(), 'supabase/migrations/add_n8n_agency_os.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  console.log('📄 Migration file loaded')
  console.log(`📏 SQL length: ${migrationSQL.length} characters\n`)

  // Esegui migration in blocchi (Supabase ha limiti su query molto lunghe)
  // Dividiamo per statement SQL (separati da ;)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`📦 Found ${statements.length} SQL statements\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';' // Aggiungi ; che è stato rimosso dallo split
    
    // Salta commenti e blocchi DO vuoti
    if (statement.trim().startsWith('--') || statement.trim().length < 10) {
      continue
    }

    try {
      console.log(`[${i + 1}/${statements.length}] Executing statement...`)
      
      // Usa rpc o query diretta
      // Per CREATE TABLE, INDEX, ALTER TABLE, etc. usiamo query diretta
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement }).catch(async () => {
        // Se rpc non esiste, proviamo con query diretta usando REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql_query: statement }),
        })
        
        if (!response.ok) {
          // Se anche questo fallisce, proviamo a eseguire direttamente tramite PostgREST
          // Per CREATE TABLE, dobbiamo usare l'API SQL di Supabase
          throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }
        
        return { error: null }
      })

      if (error) {
        // Se è un errore "already exists", è ok (IF NOT EXISTS)
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`   ⚠️  Already exists (skipped)`)
          successCount++
        } else {
          throw error
        }
      } else {
        console.log(`   ✅ Success`)
        successCount++
      }
    } catch (error: any) {
      // Se è un errore "already exists", è ok
      if (error?.message?.includes('already exists') || 
          error?.message?.includes('duplicate') ||
          error?.message?.includes('relation') && error?.message?.includes('already exists')) {
        console.log(`   ⚠️  Already exists (skipped)`)
        successCount++
      } else {
        console.error(`   ❌ Error: ${error?.message || error}`)
        errorCount++
        // Non fermiamo l'esecuzione, continuiamo con le altre statement
      }
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Migration Summary:')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log('='.repeat(50) + '\n')

  if (errorCount === 0) {
    console.log('🎉 Migration completed successfully!')
  } else if (errorCount < statements.length / 2) {
    console.log('⚠️  Migration completed with some errors (may be expected if tables already exist)')
  } else {
    console.log('❌ Migration failed. Please check the errors above.')
    process.exit(1)
  }

  // Verifica che le tabelle siano state create
  console.log('\n🔍 Verifying tables...')
  const tables = ['agencies', 'clients', 'n8n_workflows', 'execution_logs']
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)
    
    if (error) {
      console.log(`   ❌ Table '${table}': ${error.message}`)
    } else {
      console.log(`   ✅ Table '${table}': exists`)
    }
  }
}

runMigration().catch((error) => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})

