'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCompanyInfo(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user's organization_id
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  // Fallback: Create organization if missing
  if (profileError || !profile?.organization_id) {
    console.warn('Profile missing organization_id, creating one...')
    
    // Create a default organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: user.email?.split('@')[0] || 'My Organization' })
      .select()
      .single()
    
    if (orgError || !org) {
      throw new Error('Failed to create organization')
    }
    
    // Update or create profile with organization_id
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        organization_id: org.id,
        full_name: profile?.full_name || user.email?.split('@')[0] || 'User',
        role: 'admin'
      })
      .select('organization_id')
      .single()
    
    if (updateError || !updatedProfile) {
      throw new Error('Failed to update profile')
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
    .select('organization_id')
    .eq('id', user.id)
    .single()

  // Fallback: Create organization if missing
  if (profileError || !profile?.organization_id) {
    console.warn('Profile missing organization_id, creating one...')
    
    // Create a default organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: user.email?.split('@')[0] || 'My Organization' })
      .select()
      .single()
    
    if (orgError || !org) {
      throw new Error('Failed to create organization')
    }
    
    // Update or create profile with organization_id
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        organization_id: org.id,
        full_name: profile?.full_name || user.email?.split('@')[0] || 'User',
        role: 'admin'
      })
      .select('organization_id')
      .single()
    
    if (updateError || !updatedProfile) {
      throw new Error('Failed to update profile')
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
