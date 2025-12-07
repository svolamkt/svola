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
    // Chat Trigger expects: { message, sessionId?, metadata? }
    const payload = {
      message,
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

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('n8n chat trigger error:', res.status, errorText)
      return {
        response: `Errore dal server n8n (${res.status}). Verifica che il workflow sia attivo.`,
        error: true
      }
    }
    
    // Chat Trigger returns the response directly (from "Respond to Chat" node)
    const data = await res.json()
    // The response might be in data.text or data.response or just the string
    const responseText = data?.text || data?.response || data?.output || JSON.stringify(data)
    
    return {
      response: responseText,
      action: data?.action || null
    }
  } catch (error) {
    console.error('Error in sendMessageToAnalyst:', error)
    return {
      response: "Errore di connessione. Riprova tra poco.",
      error: true
    }
  }
}
