'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMessageToAnalyst(message: string, history: any[]) {
  const supabase = await createClient()
  
  // 1. Security & Context
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) throw new Error('No Organization')

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
  // NOTE: You need to set NEXT_PUBLIC_N8N_CHAT_WEBHOOK in .env.local
  const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL

  if (!webhookUrl) {
    // Fallback mock response if no webhook is connected yet
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
    return {
      response: "⚠️ n8n Webhook non configurato. Configura `N8N_CHAT_WEBHOOK_URL` nelle variabili d'ambiente. Per ora, sto simulando una risposta.",
      action: null
    }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error(`n8n error: ${res.statusText}`)
    
    const data = await res.json()
    return data // Expected format: { response: "...", action: "update_db" | "ask_more" }
  } catch (error) {
    console.error('Error calling n8n:', error)
    return {
      response: "Mi dispiace, ho perso il collegamento con il cervello centrale (n8n). Riprova tra poco.",
      error: true
    }
  }
}
