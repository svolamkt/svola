'use server'

import { createClient } from '@/lib/supabase/server'
import { N8nApiClient } from '@/lib/n8n/client'
import { revalidatePath } from 'next/cache'

/**
 * Sincronizza workflow da n8n al database locale
 */
export async function syncWorkflows() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Ottieni agenzia
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

  // Connetti a n8n
  const n8nClient = new N8nApiClient(agency.n8n_base_url, agency.n8n_api_key)
  
  try {
    // Ottieni workflow da n8n
    const n8nWorkflows = await n8nClient.getWorkflows()

    // Sincronizza nel database
    let synced = 0
    let created = 0
    let updated = 0

    for (const wf of n8nWorkflows) {
      // Verifica se esiste già
      const { data: existing } = await supabase
        .from('n8n_workflows')
        .select('id')
        .eq('id', wf.id)
        .single()

      if (existing) {
        // Aggiorna
        await supabase
          .from('n8n_workflows')
          .update({
            name: wf.name,
            is_active: wf.active,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', wf.id)
        updated++
      } else {
        // Crea nuovo
        await supabase
          .from('n8n_workflows')
          .insert({
            id: wf.id,
            agency_id: agency.id,
            name: wf.name,
            is_active: wf.active,
            client_id: null, // Unassigned
          })
        created++
      }
      synced++
    }

    revalidatePath('/workflows')
    return {
      success: true,
      synced,
      created,
      updated,
    }
  } catch (error) {
    console.error('Sync error:', error)
    throw new Error(`Failed to sync workflows: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Assegna un workflow a un cliente (o rimuove assegnazione)
 */
export async function assignWorkflowToClient(
  workflowId: string,
  clientId: string | null
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verifica che il workflow appartenga all'agenzia dell'utente
  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  if (!profile?.agency_id) {
    throw new Error('Agency not found')
  }

  const { data: workflow } = await supabase
    .from('n8n_workflows')
    .select('agency_id')
    .eq('id', workflowId)
    .single()

  if (!workflow || workflow.agency_id !== profile.agency_id) {
    throw new Error('Workflow not found or access denied')
  }

  // Se clientId è fornito, verifica che appartenga all'agenzia
  if (clientId) {
    const { data: client } = await supabase
      .from('clients')
      .select('agency_id')
      .eq('id', clientId)
      .single()

    if (!client || client.agency_id !== profile.agency_id) {
      throw new Error('Client not found or access denied')
    }
  }

  // Aggiorna workflow
  const { error } = await supabase
    .from('n8n_workflows')
    .update({ client_id: clientId })
    .eq('id', workflowId)

  if (error) throw error

  revalidatePath('/workflows')
  return { success: true }
}

/**
 * Ottiene workflow non assegnati (Unassigned)
 */
export async function getUnassignedWorkflows() {
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
    .from('n8n_workflows')
    .select('*')
    .eq('agency_id', profile.agency_id)
    .is('client_id', null)
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Ottiene workflow assegnati a un cliente
 */
export async function getClientWorkflows(clientId: string) {
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

  // Verifica che il cliente appartenga all'agenzia
  const { data: client } = await supabase
    .from('clients')
    .select('agency_id')
    .eq('id', clientId)
    .single()

  if (!client || client.agency_id !== profile.agency_id) {
    throw new Error('Client not found or access denied')
  }

  const { data, error } = await supabase
    .from('n8n_workflows')
    .select('*')
    .eq('client_id', clientId)
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

