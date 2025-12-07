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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      console.error('Profile error:', profileError)
      return {
        response: "Organizzazione non trovata. Contatta il supporto.",
        error: true
      }
    }

    // 2. Prepare Payload for n8n (must match webhook expected format)
    const payload = {
      body: {
        message,
        organization_id: profile.organization_id,
        user_id: user.id,
        user_name: profile.full_name || 'User'
      },
      history // Pass context to keep memory
    }

    // 3. Call n8n Webhook
    const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL

    if (!webhookUrl) {
      console.warn('N8N_CHAT_WEBHOOK_URL not configured')
      // Fallback mock response if no webhook is connected yet
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
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
      console.error('n8n webhook error:', res.status, errorText)
      return {
        response: `Errore dal server n8n (${res.status}). Verifica che il workflow sia attivo.`,
        error: true
      }
    }
    
    const data = await res.json()
    return data // Expected format: { response: "...", action: "update_db" | "ask_more" }
  } catch (error) {
    console.error('Error in sendMessageToAnalyst:', error)
    return {
      response: "Errore di connessione. Riprova tra poco.",
      error: true
    }
  }
}
