/**
 * Route di debug temporanea per vedere errori dettagliati
 * ⚠️ RIMUOVI QUESTA ROUTE IN PRODUZIONE!
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { N8nApiClient } from '@/lib/n8n/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, n8n_base_url, n8n_api_key } = body

    if (!name || !n8n_base_url || !n8n_api_key) {
      return NextResponse.json(
        { error: 'Missing required fields', details: { name: !!name, n8n_base_url: !!n8n_base_url, n8n_api_key: !!n8n_api_key } },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message },
        { status: 401 }
      )
    }

    // Normalizza URL
    const normalizedUrl = n8n_base_url.trim().replace(/\/$/, '')

    // Test connessione n8n
    try {
      const n8nClient = new N8nApiClient(normalizedUrl, n8n_api_key.trim())
      const workflows = await n8nClient.getWorkflows()
      console.log('n8n connection successful, workflows count:', workflows.length)
    } catch (n8nError) {
      console.error('n8n connection error:', n8nError)
      return NextResponse.json(
        { 
          error: 'n8n connection failed', 
          details: n8nError instanceof Error ? n8nError.message : String(n8nError),
          url: normalizedUrl
        },
        { status: 400 }
      )
    }

    // Verifica profilo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile fetch failed', details: profileError.message },
        { status: 500 }
      )
    }

    let agencyId: string

    if (profile?.agency_id) {
      // Update
      const { data, error } = await supabase
        .from('agencies')
        .update({
          name: name.trim(),
          n8n_base_url: normalizedUrl,
          n8n_api_key: n8n_api_key.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.agency_id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Agency update failed', details: error.message, code: error.code },
          { status: 500 }
        )
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Agency not found after update' },
          { status: 500 }
        )
      }

      agencyId = data.id
    } else {
      // Create
      // Verifica che l'utente non abbia già un'agenzia
      if (profile?.agency_id) {
        return NextResponse.json(
          { error: 'Agency already exists for this user' },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('agencies')
        .insert({
          name: name.trim(),
          n8n_base_url: normalizedUrl,
          n8n_api_key: n8n_api_key.trim(),
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { 
            error: 'Agency creation failed', 
            details: error.message, 
            code: error.code,
            hint: error.code === '42501' ? 'RLS policy violation: Missing INSERT policy for agencies table. Run migration: add_agency_insert_policy.sql' : undefined
          },
          { status: 500 }
        )
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Agency not created' },
          { status: 500 }
        )
      }

      agencyId = data.id

      // Link to profile
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ agency_id: agencyId })
        .eq('id', user.id)

      if (profileUpdateError) {
        // Rollback
        await supabase.from('agencies').delete().eq('id', agencyId)
        return NextResponse.json(
          { error: 'Profile update failed', details: profileUpdateError.message, code: profileUpdateError.code },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true, agencyId })
  } catch (error) {
    console.error('Debug route error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

