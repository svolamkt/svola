'use server'

import { createClient } from '@/lib/supabase/server'

interface BrandAnalysisFormData {
  // Core Identità
  company_name: string
  website_url?: string // Now optional
  industry?: string
  country?: string
  
  // Strategic Inputs
  company_description: string
  business_type: string
  growth_stage: string
  
  // Context
  awareness_level?: 'low' | 'medium' | 'high'
  target_audience_idea?: string
  current_channels?: string[]
  
  // Objectives
  key_objectives?: string
  competitors_known?: string
  
  // Legacy/Fallback
  additional_info?: string
}

export async function submitBrandAnalysis(formData: BrandAnalysisFormData) {
  try {
    const supabase = await createClient()
    
    // 1. Security & Context
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return {
        error: "Errore di autenticazione. Effettua il login."
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
          error: "Errore nella creazione dell'organizzazione. Riprova o contatta il supporto."
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
          error: "Errore nell'aggiornamento del profilo. Riprova."
        }
      }
      
      profile = updatedProfile
    }

    // 2. Prepare Payload for n8n Webhook - STRATEGIC FORMAT
    const payload = {
      organization_id: profile.organization_id,
      user_id: user.id,
      user_name: profile.full_name || 'User',
      
      // The Core Vision (User's Truth)
      vision_input: {
        company_name: formData.company_name,
        description: formData.company_description,
        website_url: formData.website_url || null,
        business_type: formData.business_type,
        stage: formData.growth_stage,
        industry: formData.industry || 'Generico',
        country: formData.country || 'Italia'
      },
      
      // The Assumptions (To be Challenged)
      assumptions: {
        target_audience: formData.target_audience_idea,
        current_channels: formData.current_channels,
        competitors_known: formData.competitors_known,
        awareness_level: formData.awareness_level || 'medium'
      },
      
      // The Goals (North Star)
      objectives: formData.key_objectives,
      
      // Legacy flat structure for simple nodes
      form_data: {
        ...formData,
        website_url: formData.website_url || ''
      },
      
      trigger: 'strategic_analysis_submit',
      timestamp: new Date().toISOString()
    }

    // 3. Call n8n Webhook
    const webhookUrl = process.env.N8N_BRAND_ANALYST_WEBHOOK_URL || 
                      process.env.N8N_CHAT_WEBHOOK_URL || 
                      'https://n8n.srv1054743.hstgr.cloud/webhook/604358c0-ee69-4e03-bd67-9f4f50dba13c'

    if (!webhookUrl) {
      console.warn('N8N_BRAND_ANALYST_WEBHOOK_URL not configured')
      return {
        error: "⚠️ n8n Webhook non configurato. Configura `N8N_BRAND_ANALYST_WEBHOOK_URL` nelle variabili d'ambiente di Vercel."
      }
    }

    console.log('Calling n8n webhook for strategic analysis:', webhookUrl)
    console.log('Payload:', JSON.stringify(payload, null, 2))

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('n8n webhook error:', res.status, errorText)
      
      let errorMessage = `Errore ${res.status} dal server n8n`
      
      if (res.status === 404) {
        errorMessage = `Errore 404: Webhook non trovato.\n\nVerifica che:\n- Il workflow "Nexus Deep Analyst" sia attivo in n8n\n- L'URL del webhook sia corretto\n\nURL tentato: ${webhookUrl}`
      } else if (res.status === 500) {
        errorMessage = `Errore 500: Errore interno del server n8n.\n\nDettagli: ${errorText.substring(0, 300)}`
      } else {
        errorMessage = `Errore ${res.status}: ${errorText.substring(0, 300)}`
      }
      
      return {
        error: errorMessage
      }
    }
    
    // Webhook returns JSON response
    let data
    try {
      data = await res.json()
    } catch (jsonError) {
      const textResponse = await res.text()
      return {
        success: true,
        message: textResponse || "Analisi avviata con successo"
      }
    }
    
    return {
      success: true,
      message: data?.response || data?.message || "Analisi avviata con successo!",
      data: data
    }
  } catch (error) {
    console.error('Error in submitBrandAnalysis:', error)
    const errorMessage = error instanceof Error 
      ? `Errore di connessione: ${error.message}` 
      : "Errore di connessione. Riprova tra poco."
    
    return {
      error: errorMessage
    }
  }
}
