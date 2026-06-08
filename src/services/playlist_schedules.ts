import pb from '@/lib/pocketbase/client'

export interface PlaylistSchedule {
  id: string
  playlist: string
  tv: string
  days_of_week: string[]
  start_time: string
  end_time: string
  active: boolean
  user: string
  created: string
  updated: string
  expand?: {
    playlist: { id: string; name: string }
    tv: { id: string; name: string }
    user: { id: string; name: string }
  }
}

export const getPlaylistSchedules = () =>
  pb.collection('playlist_schedules').getFullList<PlaylistSchedule>({
    sort: '-created',
    expand: 'playlist,tv,user',
  })

export const createPlaylistSchedule = (data: Partial<PlaylistSchedule>) =>
  pb.collection('playlist_schedules').create<PlaylistSchedule>(data)

export const updatePlaylistSchedule = (id: string, data: Partial<PlaylistSchedule>) =>
  pb.collection('playlist_schedules').update<PlaylistSchedule>(id, data)

export const deletePlaylistSchedule = (id: string) => pb.collection('playlist_schedules').delete(id)
