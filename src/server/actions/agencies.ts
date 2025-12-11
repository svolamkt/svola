'use server'

import { createClient } from '@/lib/supabase/server'
import { N8nApiClient } from '@/lib/n8n/client'
import { revalidatePath } from 'next/cache'

/**
 * Ottiene l'agenzia dell'utente corrente
 */
export async function getAgency() {
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
    return null
  }

  const { data: agency, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', profile.agency_id)
    .single()

  if (error) throw error
  return agency
}

/**
 * Crea o aggiorna l'agenzia dell'utente
 */
export async function upsertAgency(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const name = formData.get('name') as string
  const n8nBaseUrl = formData.get('n8n_base_url') as string
  const n8nApiKey = formData.get('n8n_api_key') as string

  if (!name || !n8nBaseUrl || !n8nApiKey) {
    throw new Error('Missing required fields')
  }

  // Test connessione n8n
  const n8nClient = new N8nApiClient(n8nBaseUrl, n8nApiKey)
  const isConnected = await n8nClient.testConnection()
  
  if (!isConnected) {
    throw new Error('Failed to connect to n8n. Please check URL and API key.')
  }

  // Verifica se esiste già un'agenzia per questo utente
  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  let agencyId: string

  if (profile?.agency_id) {
    // Aggiorna agenzia esistente
    const { data, error } = await supabase
      .from('agencies')
      .update({
        name,
        n8n_base_url: n8nBaseUrl,
        n8n_api_key: n8nApiKey,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.agency_id)
      .select()
      .single()

    if (error) throw error
    agencyId = data.id
  } else {
    // Crea nuova agenzia
    const { data, error } = await supabase
      .from('agencies')
      .insert({
        name,
        n8n_base_url: n8nBaseUrl,
        n8n_api_key: n8nApiKey,
      })
      .select()
      .single()

    if (error) throw error
    agencyId = data.id

    // Collega utente all'agenzia
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ agency_id: agencyId })
      .eq('id', user.id)

    if (profileError) throw profileError
  }

  revalidatePath('/settings')
  return { id: agencyId, success: true }
}

