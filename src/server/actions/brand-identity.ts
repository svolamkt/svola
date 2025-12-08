'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper function to get organization_id
async function getOrganizationId() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
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
      throw new Error('Failed to create organization: ' + rpcError?.message)
    }
    
    const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('organization_id, full_name')
        .eq('id', user.id)
        .single()
        
    if (fetchError || !updatedProfile) {
       throw new Error('Failed to fetch updated profile')
    }
    
    profile = updatedProfile
  }

  return profile.organization_id
}

export async function updateCompanyInfo(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user's organization_id
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id, full_name')
    .eq('id', user.id)
    .single()

  // Fallback: Create organization if missing
  if (profileError || !profile?.organization_id) {
    console.warn('Profile missing organization_id, creating one...')
    
    // Use RPC to create org and link profile securely
    const { data: orgId, error: rpcError } = await supabase
      .rpc('create_user_organization', { 
        org_name: user.email?.split('@')[0] || 'My Organization' 
      })
    
    if (rpcError || !orgId) {
      throw new Error('Failed to create organization: ' + rpcError?.message)
    }
    
    // Fetch the updated profile
    const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('organization_id, full_name')
        .eq('id', user.id)
        .single()
        
    if (fetchError || !updatedProfile) {
       throw new Error('Failed to fetch updated profile')
    }
    
    profile = updatedProfile
  }

  const company_name = formData.get('company_name') as string
  const company_description = formData.get('company_description') as string
  const website_url = formData.get('website_url') as string
  const industry = formData.get('industry') as string
  const founded_year = formData.get('founded_year') 
    ? parseInt(formData.get('founded_year') as string) 
    : null

  // Check if brand_identity exists
  const { data: existing } = await supabase
    .from('brand_identity')
    .select('organization_id')
    .eq('organization_id', profile.organization_id)
    .single()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('brand_identity')
      .update({
        company_name,
        company_description: company_description || null,
        website_url: website_url || null,
        industry: industry || null,
        founded_year: founded_year || null,
      })
      .eq('organization_id', profile.organization_id)

    if (error) throw error
  } else {
    // Insert new
    const { error } = await supabase
      .from('brand_identity')
      .insert({
        organization_id: profile.organization_id,
        company_name,
        company_description: company_description || null,
        website_url: website_url || null,
        industry: industry || null,
        founded_year: founded_year || null,
      })

    if (error) throw error
  }

  revalidatePath('/brain')
}

export async function updateBrandKit(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id, full_name')
    .eq('id', user.id)
    .single()

  // Fallback: Create organization if missing
  if (profileError || !profile?.organization_id) {
    console.warn('Profile missing organization_id, creating one...')
    
    // Use RPC to create org and link profile securely
    const { data: orgId, error: rpcError } = await supabase
      .rpc('create_user_organization', { 
        org_name: user.email?.split('@')[0] || 'My Organization' 
      })
    
    if (rpcError || !orgId) {
      throw new Error('Failed to create organization: ' + rpcError?.message)
    }
    
    // Fetch the updated profile
    const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('organization_id, full_name')
        .eq('id', user.id)
        .single()
        
    if (fetchError || !updatedProfile) {
       throw new Error('Failed to fetch updated profile')
    }
    
    profile = updatedProfile
  }

  const primary_color = formData.get('primary_color') as string
  const secondary_color = formData.get('secondary_color') as string
  const logo_url = formData.get('logo_url') as string
  const typography = formData.get('typography') as string
  const brand_voice_description = formData.get('brand_voice_description') as string

  const { data: existing } = await supabase
    .from('brand_identity')
    .select('organization_id')
    .eq('organization_id', profile.organization_id)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('brand_identity')
      .update({
        primary_color: primary_color || null,
        secondary_color: secondary_color || null,
        logo_url: logo_url || null,
        typography: typography || null,
        brand_voice_description: brand_voice_description || null,
      })
      .eq('organization_id', profile.organization_id)

    if (error) throw error
  } else {
    // If brand_identity doesn't exist, we need company_name at minimum
    // This should not happen if user fills Tab 1 first, but handle gracefully
    const { error } = await supabase
      .from('brand_identity')
      .insert({
        organization_id: profile.organization_id,
        company_name: 'Untitled Company', // Placeholder
        primary_color: primary_color || null,
        secondary_color: secondary_color || null,
        logo_url: logo_url || null,
        typography: typography || null,
        brand_voice_description: brand_voice_description || null,
      })

    if (error) throw error
  }

  revalidatePath('/brain')
}

// Update Brand DNA (JSONB)
export async function updateBrandDNA(data: {
  purpose?: string
  mission?: string
  values?: string[]
  archetypes?: string[]
  tone_of_voice?: string
}) {
  const supabase = await createClient()
  const organizationId = await getOrganizationId()

  const brandDna = {
    purpose: data.purpose || null,
    mission: data.mission || null,
    values: data.values || [],
    archetypes: data.archetypes || [],
    tone_of_voice: data.tone_of_voice || null
  }

  const { data: existing } = await supabase
    .from('brand_identity')
    .select('brand_dna')
    .eq('organization_id', organizationId)
    .single()

  const updatedBrandDna = existing?.brand_dna 
    ? { ...(existing.brand_dna as any), ...brandDna }
    : brandDna

  const { error } = await supabase
    .from('brand_identity')
    .update({ brand_dna: updatedBrandDna })
    .eq('organization_id', organizationId)

  if (error) throw error
  revalidatePath('/brain')
}

// Update Product Matrix (JSONB)
export async function updateProductMatrix(data: {
  value_proposition?: string
  usp?: string
  benefits?: string[]
}) {
  const supabase = await createClient()
  const organizationId = await getOrganizationId()

  const productMatrix = {
    value_proposition: data.value_proposition || null,
    usp: data.usp || null,
    benefits: data.benefits || []
  }

  const { data: existing } = await supabase
    .from('brand_identity')
    .select('product_matrix')
    .eq('organization_id', organizationId)
    .single()

  const updatedProductMatrix = existing?.product_matrix
    ? { ...(existing.product_matrix as any), ...productMatrix }
    : productMatrix

  const { error } = await supabase
    .from('brand_identity')
    .update({ product_matrix: updatedProductMatrix })
    .eq('organization_id', organizationId)

  if (error) throw error
  revalidatePath('/brain')
}

// Update Target Audience (JSONB)
export async function updateTargetAudience(data: {
  personas?: Array<{ name: string; description: string }>
  pain_points?: string[]
  triggers?: string[]
}) {
  const supabase = await createClient()
  const organizationId = await getOrganizationId()

  const targetAudience = {
    personas: data.personas || [],
    pain_points: data.pain_points || [],
    triggers: data.triggers || []
  }

  const { data: existing } = await supabase
    .from('brand_identity')
    .select('target_audience')
    .eq('organization_id', organizationId)
    .single()

  const updatedTargetAudience = existing?.target_audience
    ? { ...(existing.target_audience as any), ...targetAudience }
    : targetAudience

  const { error } = await supabase
    .from('brand_identity')
    .update({ target_audience: updatedTargetAudience })
    .eq('organization_id', organizationId)

  if (error) throw error
  revalidatePath('/brain')
}

// Update Market Research (JSONB)
export async function updateMarketResearch(data: {
  market_size?: string
  trends?: string[]
}) {
  const supabase = await createClient()
  const organizationId = await getOrganizationId()

  const marketResearch = {
    market_size: data.market_size || null,
    trends: data.trends || []
  }

  const { data: existing } = await supabase
    .from('brand_identity')
    .select('market_research')
    .eq('organization_id', organizationId)
    .single()

  const updatedMarketResearch = existing?.market_research
    ? { ...(existing.market_research as any), ...marketResearch }
    : marketResearch

  const { error } = await supabase
    .from('brand_identity')
    .update({ market_research: updatedMarketResearch })
    .eq('organization_id', organizationId)

  if (error) throw error
  revalidatePath('/brain')
}

// Update Competitors (JSONB)
export async function updateCompetitors(data: {
  direct_competitors?: Array<{ name: string; strengths?: string; weaknesses?: string }>
  positioning_map?: string
}) {
  const supabase = await createClient()
  const organizationId = await getOrganizationId()

  const competitors = {
    direct_competitors: data.direct_competitors || [],
    positioning_map: data.positioning_map || null
  }

  const { data: existing } = await supabase
    .from('brand_identity')
    .select('competitors')
    .eq('organization_id', organizationId)
    .single()

  const updatedCompetitors = existing?.competitors
    ? { ...(existing.competitors as any), ...competitors }
    : competitors

  const { error } = await supabase
    .from('brand_identity')
    .update({ competitors: updatedCompetitors })
    .eq('organization_id', organizationId)

  if (error) throw error
  revalidatePath('/brain')
}

// Update Marketing Assets (JSONB)
export async function updateMarketingAssets(data: {
  funnel?: string
  channels?: string[]
}) {
  const supabase = await createClient()
  const organizationId = await getOrganizationId()

  const marketingAssets = {
    funnel: data.funnel || null,
    channels: data.channels || []
  }

  const { data: existing } = await supabase
    .from('brand_identity')
    .select('marketing_assets')
    .eq('organization_id', organizationId)
    .single()

  const updatedMarketingAssets = existing?.marketing_assets
    ? { ...(existing.marketing_assets as any), ...marketingAssets }
    : marketingAssets

  const { error } = await supabase
    .from('brand_identity')
    .update({ marketing_assets: updatedMarketingAssets })
    .eq('organization_id', organizationId)

  if (error) throw error
  revalidatePath('/brain')
}

// Update Brand Perception (JSONB)
export async function updateBrandPerception(data: {
  sentiment?: string
}) {
  const supabase = await createClient()
  const organizationId = await getOrganizationId()

  const brandPerception = {
    sentiment: data.sentiment || null
  }

  const { data: existing } = await supabase
    .from('brand_identity')
    .select('brand_perception')
    .eq('organization_id', organizationId)
    .single()

  const updatedBrandPerception = existing?.brand_perception
    ? { ...(existing.brand_perception as any), ...brandPerception }
    : brandPerception

  const { error } = await supabase
    .from('brand_identity')
    .update({ brand_perception: updatedBrandPerception })
    .eq('organization_id', organizationId)

  if (error) throw error
  revalidatePath('/brain')
}

// Update SWOT Analysis (JSONB)
export async function updateSWOTAnalysis(data: {
  strengths?: string[]
  weaknesses?: string[]
  opportunities?: string[]
  threats?: string[]
}) {
  const supabase = await createClient()
  const organizationId = await getOrganizationId()

  const swotAnalysis = {
    strengths: data.strengths || [],
    weaknesses: data.weaknesses || [],
    opportunities: data.opportunities || [],
    threats: data.threats || []
  }

  const { data: existing } = await supabase
    .from('brand_identity')
    .select('swot_analysis')
    .eq('organization_id', organizationId)
    .single()

  const updatedSWOT = existing?.swot_analysis
    ? { ...(existing.swot_analysis as any), ...swotAnalysis }
    : swotAnalysis

  const { error } = await supabase
    .from('brand_identity')
    .update({ swot_analysis: updatedSWOT })
    .eq('organization_id', organizationId)

  if (error) throw error
  revalidatePath('/brain')
}
