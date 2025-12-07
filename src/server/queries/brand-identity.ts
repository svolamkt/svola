import { createClient } from '@/lib/supabase/server'

export async function getBrandIdentity() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) return null

  const { data } = await supabase
    .from('brand_identity')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .single()

  return data
}
