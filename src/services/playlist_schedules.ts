import { supabase } from '@/lib/supabase/client'

export interface PlaylistSchedule {
  id: string
  playlist_id: string
  tv_id: string
  days_of_week: string[]
  start_time: string
  end_time: string
  active: boolean
  user_id: string | null
  created_at: string
  updated_at: string
  playlists?: { id: string; name: string } | null
  tvs?: { id: string; name: string } | null
}

export const getPlaylistSchedules = async (): Promise<PlaylistSchedule[]> => {
  const { data, error } = await supabase
    .from('playlist_schedules')
    .select('*, playlists(id, name), tvs(id, name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as PlaylistSchedule[]
}

export const createPlaylistSchedule = async (data: Partial<PlaylistSchedule>) => {
  const { error } = await supabase.from('playlist_schedules').insert(data)
  if (error) throw error
}

export const updatePlaylistSchedule = async (id: string, data: Partial<PlaylistSchedule>) => {
  const { error } = await supabase.from('playlist_schedules').update(data).eq('id', id)
  if (error) throw error
}

export const deletePlaylistSchedule = async (id: string) => {
  const { error } = await supabase.from('playlist_schedules').delete().eq('id', id)
  if (error) throw error
}
