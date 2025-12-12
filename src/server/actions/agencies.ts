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
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      throw new Error('Unauthorized: Please log in again')
    }

    const name = formData.get('name') as string
    const n8nBaseUrl = formData.get('n8n_base_url') as string
    const n8nApiKey = formData.get('n8n_api_key') as string

    if (!name || !name.trim()) {
      throw new Error('Nome agenzia è obbligatorio')
    }

    if (!n8nBaseUrl || !n8nBaseUrl.trim()) {
      throw new Error('URL n8n è obbligatorio')
    }

    if (!n8nApiKey || !n8nApiKey.trim()) {
      throw new Error('API Key n8n è obbligatoria')
    }

    // Normalizza URL (rimuovi trailing slash)
    const normalizedUrl = n8nBaseUrl.trim().replace(/\/$/, '')

    // Test connessione n8n
    try {
      const n8nClient = new N8nApiClient(normalizedUrl, n8nApiKey.trim())
      const isConnected = await n8nClient.testConnection()
      
      if (!isConnected) {
        throw new Error('Impossibile connettersi a n8n. Verifica URL e API Key.')
      }
    } catch (n8nError) {
      console.error('n8n connection error:', n8nError)
      const errorMessage = n8nError instanceof Error ? n8nError.message : 'Unknown error'
      throw new Error(`Errore connessione n8n: ${errorMessage}. Verifica che l'URL sia corretto e che l'API Key sia valida.`)
    }

    // Verifica se esiste già un'agenzia per questo utente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      throw new Error(`Errore nel caricamento profilo: ${profileError.message}`)
    }

    let agencyId: string

    if (profile?.agency_id) {
      // Aggiorna agenzia esistente
      const { data, error } = await supabase
        .from('agencies')
        .update({
          name: name.trim(),
          n8n_base_url: normalizedUrl,
          n8n_api_key: n8nApiKey.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.agency_id)
        .select()
        .single()

      if (error) {
        console.error('Agency update error:', error)
        throw new Error(`Errore aggiornamento agenzia: ${error.message}`)
      }

      if (!data) {
        throw new Error('Agenzia non trovata dopo l\'aggiornamento')
      }

      agencyId = data.id
    } else {
      // Crea nuova agenzia
      const { data, error } = await supabase
        .from('agencies')
        .insert({
          name: name.trim(),
          n8n_base_url: normalizedUrl,
          n8n_api_key: n8nApiKey.trim(),
        })
        .select()
        .single()

      if (error) {
        console.error('Agency creation error:', error)
        throw new Error(`Errore creazione agenzia: ${error.message}`)
      }

      if (!data) {
        throw new Error('Agenzia non creata')
      }

      agencyId = data.id

      // Collega utente all'agenzia
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ agency_id: agencyId })
        .eq('id', user.id)

      if (profileUpdateError) {
        console.error('Profile update error:', profileUpdateError)
        // Rollback: elimina agenzia creata
        try {
          await supabase.from('agencies').delete().eq('id', agencyId)
        } catch (deleteError) {
          console.error('Error deleting agency during rollback:', deleteError)
        }
        throw new Error(`Errore collegamento agenzia al profilo: ${profileUpdateError.message}`)
      }
    }

    revalidatePath('/settings')
    return { id: agencyId, success: true }
  } catch (error) {
    console.error('Error in upsertAgency:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(errorMessage)
  }
}

