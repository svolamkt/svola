/**
 * API Route temporanea per eseguire la migration n8n Agency OS
 * 
 * ⚠️ IMPORTANTE: Rimuovi questa route dopo aver eseguito la migration!
 * 
 * Uso:
 *   POST /api/migrations/run
 *   Headers: Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}
 * 
 * Oppure esegui direttamente nel Dashboard Supabase (consigliato)
 */

import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    // Verifica autorizzazione (usa service role key come token)
    const authHeader = request.headers.get('authorization')
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!authHeader || !serviceKey || authHeader !== `Bearer ${serviceKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Use SUPABASE_SERVICE_ROLE_KEY as Bearer token.' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()
    const migrationPath = join(process.cwd(), 'supabase/migrations/add_n8n_agency_os.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    // Esegui la migration usando una funzione SQL
    // Nota: Supabase non permette esecuzione diretta di SQL arbitrario via API
    // Dobbiamo eseguire statement per statement

    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    const results = []

    for (const statement of statements) {
      if (statement.trim().length < 10) continue

      try {
        // Per CREATE TABLE, dobbiamo usare l'approccio del dashboard
        // L'API REST di Supabase non supporta DDL diretto
        results.push({
          statement: statement.substring(0, 50) + '...',
          status: 'skipped',
          message: 'DDL operations must be run in Supabase Dashboard SQL Editor',
        })
      } catch (error: any) {
        results.push({
          statement: statement.substring(0, 50) + '...',
          status: 'error',
          message: error.message,
        })
      }
    }

    return NextResponse.json({
      message: 'Migration cannot be executed via API. Please use Supabase Dashboard SQL Editor.',
      instructions: [
        '1. Go to https://app.supabase.com',
        '2. Select your project',
        '3. Go to SQL Editor',
        '4. Copy and paste the content of: supabase/migrations/add_n8n_agency_os.sql',
        '5. Click "Run"',
      ],
      results,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Failed to process migration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

