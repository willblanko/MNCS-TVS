import { supabase } from '@/lib/supabase/client'

export type SupabaseTV = {
  id: string
  name: string
  location: string
  status: 'online' | 'offline'
  playlist_id: string | null
  created_at?: string
}

export const getTVs = async () => {
  const { data, error } = await supabase
    .from('tvs')
    .select('*')
    .order('created_at', { ascending: true })
  return { data, error }
}

export const getTV = async (id: string) => {
  const { data, error } = await supabase.from('tvs').select('*').eq('id', id).single()
  return { data, error }
}

export const addTV = async (tv: SupabaseTV) => {
  const { data, error } = await supabase.from('tvs').insert(tv).select().single()
  return { data, error }
}

export const updateTV = async (id: string, updates: Partial<SupabaseTV>) => {
  const { data, error } = await supabase.from('tvs').update(updates).eq('id', id).select().single()
  return { data, error }
}

export const removeTV = async (id: string) => {
  const { error } = await supabase.from('tvs').delete().eq('id', id)
  return { error }
}
