'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMessageToAnalyst(message: string, history: any[]) {
  try {
    const supabase = await createClient()
    
    // 1. Security & Context
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return {
        response: "Errore di autenticazione. Effettua il login.",
        error: true
      }
    }

    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, full_name')
      .eq('id', user.id)
      .single()

    // Fallback: Create organization if missing
    if (profileError || !profile?.organization_id) {
      console.warn('Profile missing organization_id, creating one...')
      
      const { data: orgId, error: rpcError } = await supabase
        .rpc('create_user_organization', { 
          org_name: user.email?.split('@')[0] || 'My Organization' 
        })
      
      if (rpcError || !orgId) {
        console.error('Failed to create organization:', rpcError)
        return {
          response: "Errore nella creazione dell'organizzazione. Riprova o contatta il supporto.",
          error: true
        }
      }
      
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('organization_id, full_name')
        .eq('id', user.id)
        .single()
      
      if (fetchError || !updatedProfile) {
        console.error('Failed to fetch updated profile:', fetchError)
        return {
          response: "Errore nell'aggiornamento del profilo. Riprova.",
          error: true
        }
      }
      
      profile = updatedProfile
    }

    // 2. Prepare Payload for n8n Chat Trigger (webhook mode)
    // Chat Trigger in webhook mode expects: { chatInput } or { message } or { chatInput, sessionId, metadata }
    // Include organization_id in message as hidden metadata (format: [ORG_ID:xxx])
    const messageWithOrgId = `[ORG_ID:${profile.organization_id}] ${message}`
    
    // Chat Trigger expects 'chatInput' field, not 'message'
    const payload = {
      chatInput: messageWithOrgId,
      sessionId: `session-${user.id}`, // Keep conversation context per user
      metadata: {
        organization_id: profile.organization_id,
        user_id: user.id,
        user_name: profile.full_name || 'User'
      }
    }

    // 3. Call n8n Chat Trigger Webhook
    const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL || 'https://n8n.srv1054743.hstgr.cloud/webhook/fb166c84-71dc-4dfd-a585-87cbdef9aac9/chat'

    if (!webhookUrl) {
      console.warn('N8N_CHAT_WEBHOOK_URL not configured')
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        response: "⚠️ n8n Webhook non configurato. Configura `N8N_CHAT_WEBHOOK_URL` nelle variabili d'ambiente di Vercel.",
        action: null
      }
    }

    console.log('Calling n8n webhook:', webhookUrl)
    console.log('Payload:', JSON.stringify(payload, null, 2))

    let res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    // Se 404, prova con formati alternativi
    if (res.status === 404) {
      console.log('404 received, trying alternative payload formats...')
      
      // Prova 1: solo chatInput
      let simplePayload = { chatInput: messageWithOrgId }
      res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simplePayload)
      })
      
      // Se ancora 404, prova con 'message' invece di 'chatInput'
      if (res.status === 404) {
        console.log('Still 404, trying with "message" field...')
        simplePayload = { message: messageWithOrgId } as any
        res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(simplePayload)
        })
      }
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('n8n chat trigger error:', res.status, errorText)
      
      // Dettagli dell'errore per il frontend
      let errorMessage = `Errore ${res.status} dal server n8n`
      
      if (res.status === 404) {
        errorMessage = `Errore 404: Webhook non trovato.\n\nVerifica che:\n- Il workflow "Nexus Deep Analyst" (ID: bjSW53qgmDGMP5TZ) sia attivo in n8n\n- L'URL del webhook sia corretto\n- Il nodo Chat Trigger sia configurato in modalità "webhook"\n\nURL tentato: ${webhookUrl}\n\nPer ottenere l'URL corretto:\n1. Apri il workflow in n8n\n2. Clicca sul nodo "Chat Trigger"\n3. Copia l'URL del webhook mostrato\n4. Aggiorna la variabile N8N_CHAT_WEBHOOK_URL in Vercel`
      } else if (res.status === 500) {
        errorMessage = `Errore 500: Errore interno del server n8n.\n\nDettagli: ${errorText.substring(0, 300)}`
      } else {
        errorMessage = `Errore ${res.status}: ${errorText.substring(0, 300)}`
      }
      
      return {
        response: errorMessage,
        error: true,
        statusCode: res.status,
        details: `URL: ${webhookUrl}\n\nErrore: ${errorText}`
      }
    }
    
    // Chat Trigger returns the response directly (from "Respond to Chat" node)
    let data
    try {
      data = await res.json()
    } catch (jsonError) {
      // Se la risposta non è JSON, prova a leggerla come testo
      const textResponse = await res.text()
      return {
        response: textResponse || "Risposta ricevuta ma formato non riconosciuto",
        error: false
      }
    }
    
    // The response might be in data.text or data.response or just the string
    const responseText = data?.text || data?.response || data?.output || data?.message || JSON.stringify(data)
    
    return {
      response: responseText,
      action: data?.action || null
    }
  } catch (error) {
    console.error('Error in sendMessageToAnalyst:', error)
    const errorMessage = error instanceof Error 
      ? `Errore di connessione: ${error.message}` 
      : "Errore di connessione. Riprova tra poco."
    
    return {
      response: errorMessage,
      error: true,
      details: error instanceof Error ? error.stack : String(error)
    }
  }
}
