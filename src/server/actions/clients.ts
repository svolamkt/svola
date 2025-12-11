'use server'

import { createClient } from '@/lib/supabase/server'
import { N8nApiClient } from '@/lib/n8n/client'
import { revalidatePath } from 'next/cache'
// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Template workflow logger per n8n
 */
function createLoggerWorkflowTemplate(
  clientName: string,
  loggerToken: string,
  clientId: string,
  supabaseUrl: string,
  supabaseAnonKey: string
) {
  const webhookPath = `logger-${clientName.toLowerCase().replace(/\s+/g, '-')}-${loggerToken.substring(0, 8)}`
  
  return {
    name: `_SYSTEM_LOG_RECEIVER_${clientName}`,
    active: true,
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: webhookPath,
          responseMode: 'responseNode',
          options: {},
        },
        id: 'webhook-trigger',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        webhookId: webhookPath,
      },
      {
        parameters: {
          url: `${supabaseUrl}/rest/v1/execution_logs`,
          authentication: 'genericCredentialType',
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: 'x-logger-token',
                value: loggerToken,
              },
              {
                name: 'apikey',
                value: supabaseAnonKey,
              },
              {
                name: 'Content-Type',
                value: 'application/json',
              },
              {
                name: 'Prefer',
                value: 'return=minimal',
              },
            ],
          },
          sendBody: true,
          bodyParameters: {
            parameters: [
              {
                name: 'client_id',
                value: clientId,
              },
              {
                name: 'execution_id',
                value: '={{ $json.execution_id }}',
              },
              {
                name: 'workflow_id',
                value: '={{ $json.workflow_id || null }}',
              },
              {
                name: 'status',
                value: '={{ $json.status }}',
              },
              {
                name: 'started_at',
                value: '={{ $json.started_at }}',
              },
              {
                name: 'execution_time_ms',
                value: '={{ $json.execution_time_ms }}',
              },
              {
                name: 'metadata',
                value: '={{ $json.metadata || {} }}',
              },
              {
                name: 'error_message',
                value: '={{ $json.error_message || null }}',
              },
            ],
          },
          options: {},
        },
        id: 'supabase-insert',
        name: 'Insert to Supabase',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.1,
        position: [450, 300],
      },
      {
        parameters: {
          respondWith: 'json',
          responseBody: '={{ { "success": true } }}',
          options: {},
        },
        id: 'respond-webhook',
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1,
        position: [650, 300],
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: 'Insert to Supabase', type: 'main', index: 0 }]],
      },
      'Insert to Supabase': {
        main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]],
      },
    },
    settings: {
      executionOrder: 'v1',
    },
  }
}

/**
 * Crea un nuovo cliente e workflow logger automaticamente
 */
export async function createClientAndLogger(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  if (!profile?.agency_id) {
    throw new Error('Agency not found. Please configure your agency first.')
  }

  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', profile.agency_id)
    .single()

  if (agencyError || !agency) {
    throw new Error('Agency configuration not found')
  }

  const name = formData.get('name') as string
  if (!name) {
    throw new Error('Client name is required')
  }

  // Genera logger token
  const loggerToken = generateUUID()

  // 1. Crea cliente in DB
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      agency_id: agency.id,
      name,
      logger_token: loggerToken,
      status: 'active',
    })
    .select()
    .single()

  if (clientError) throw clientError

  // 2. Crea workflow logger in n8n
  try {
    const n8nClient = new N8nApiClient(agency.n8n_base_url, agency.n8n_api_key)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const loggerWorkflow = createLoggerWorkflowTemplate(
      name,
      loggerToken,
      client.id,
      supabaseUrl,
      supabaseAnonKey
    )

    const createdWorkflow = await n8nClient.createWorkflow(loggerWorkflow)

    // 3. Salva workflow_id nel cliente
    await supabase
      .from('clients')
      .update({ logger_workflow_id: createdWorkflow.id })
      .eq('id', client.id)

    // 4. Sincronizza workflow nel database locale
    await supabase
      .from('n8n_workflows')
      .upsert({
        id: createdWorkflow.id,
        agency_id: agency.id,
        name: createdWorkflow.name,
        is_active: createdWorkflow.active,
        client_id: client.id, // Assegnato al cliente
        last_synced_at: new Date().toISOString(),
      })

    revalidatePath('/clients')
    return { success: true, client, loggerWorkflowId: createdWorkflow.id }
  } catch (error) {
    // Se creazione workflow fallisce, elimina cliente
    await supabase.from('clients').delete().eq('id', client.id)
    throw new Error(`Failed to create logger workflow: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Ottiene tutti i clienti dell'agenzia
 */
export async function getClients() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  if (!profile?.agency_id) {
    return []
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('agency_id', profile.agency_id)
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Genera snippet JSON per nodo logger da incollare in n8n
 */
export async function generateLoggerSnippet(clientId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  if (!profile?.agency_id) {
    throw new Error('Agency not found')
  }

  const { data: client, error } = await supabase
    .from('clients')
    .select('logger_workflow_id')
    .eq('id', clientId)
    .eq('agency_id', profile.agency_id)
    .single()

  if (error || !client || !client.logger_workflow_id) {
    throw new Error('Client not found or logger workflow not created')
  }

  // Genera snippet nodo Execute Workflow
  const snippet = {
    type: 'n8n-nodes-base.executeWorkflow',
    typeVersion: 1,
    parameters: {
      workflowId: client.logger_workflow_id,
      source: {
        mode: 'json',
        json: `={{ JSON.stringify({ execution_id: $execution.id, workflow_id: $workflow.id, status: $execution.status, started_at: $execution.startedAt, execution_time_ms: $execution.duration, metadata: $json, error_message: $execution.error?.message || null }) }}`,
      },
    },
  }

  return JSON.stringify(snippet, null, 2)
}

