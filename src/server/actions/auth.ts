'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('full_name') as string,
    company_name: formData.get('company_name') as string,
  }
  
  // 1. Sign Up User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (authError) {
    redirect('/register?error=' + authError.message)
  }

  // 2. Create Agency & Profile
  if (authData.user) {
     // Create Agency
     const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .insert({ name: data.company_name, n8n_api_key: '', n8n_base_url: '' })
        .select()
        .single()
     
     if (!agencyError && agency) {
         // Create Profile linked to Agency
         const { error: profileError } = await supabase.from('profiles').insert({
             id: authData.user.id,
             agency_id: agency.id,
             full_name: data.full_name,
             role: 'admin'
         })
         
         if (profileError) {
            console.error('Profile creation failed:', profileError)
         }
     } else {
         console.error('Agency creation failed:', agencyError)
     }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

