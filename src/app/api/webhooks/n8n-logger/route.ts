import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Webhook receiver per log da n8n workflow logger
 * Valida logger_token e inserisce log in execution_logs
 * 
 * Usa service role client per bypassare RLS dopo validazione token
 */
export async function POST(request: NextRequest) {
  try {
    const loggerToken = request.headers.get('x-logger-token')
    
    if (!loggerToken) {
      return NextResponse.json(
        { error: 'Missing x-logger-token header' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      client_id,
      execution_id,
      workflow_id,
      status,
      started_at,
      execution_time_ms,
      metadata,
      error_message,
    } = body

    // Validazione campi obbligatori
    if (!client_id || !execution_id || !status || !started_at) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, execution_id, status, started_at' },
        { status: 400 }
      )
    }

    // Verifica che il token corrisponda al cliente (usa service client per validazione)
    const supabase = createServiceClient()
    
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, logger_token')
      .eq('id', client_id)
      .eq('logger_token', loggerToken)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Invalid logger token' },
        { status: 401 }
      )
    }

    // Inserisci log (service client bypassa RLS)
    const { error: insertError } = await supabase
      .from('execution_logs')
      .insert({
        client_id,
        execution_id,
        workflow_id: workflow_id || null,
        status,
        started_at,
        execution_time_ms: execution_time_ms || null,
        metadata: metadata || {},
        error_message: error_message || null,
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to insert log', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

