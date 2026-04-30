import { useState, useEffect, useCallback } from 'react'

export type MediaType = 'video' | 'image'

export type MediaFile = {
  id: string
  name: string
  type: MediaType
  originalSize: number
  optimizedSize: number
  status: 'optimizing' | 'ready'
  url: string
  thumbnail: string
  createdAt: number
}

export type PlaylistItem = {
  id: string
  fileId: string
  duration: number
}

export type Playlist = {
  id: string
  name: string
  items: PlaylistItem[]
}

export type TV = {
  id: string
  name: string
  location: string
  status: 'online' | 'offline'
  playlistId: string | null
}

type State = {
  files: MediaFile[]
  playlists: Playlist[]
  tvs: TV[]
}

let memoryState: State = {
  files: [
    {
      id: '1',
      name: 'Promo Verão.mp4',
      type: 'video',
      originalSize: 15000000,
      optimizedSize: 5000000,
      status: 'ready',
      url: 'https://img.usecurling.com/p/800/600?q=beach',
      thumbnail: 'https://img.usecurling.com/p/200/200?q=beach',
      createdAt: Date.now(),
    },
    {
      id: '2',
      name: 'Cardápio Dia.png',
      type: 'image',
      originalSize: 2000000,
      optimizedSize: 800000,
      status: 'ready',
      url: 'https://img.usecurling.com/p/800/600?q=food',
      thumbnail: 'https://img.usecurling.com/p/200/200?q=food',
      createdAt: Date.now() - 1000,
    },
  ],
  playlists: [
    {
      id: '1',
      name: 'Recepção Principal',
      items: [
        { id: 'i1', fileId: '2', duration: 15 },
        { id: 'i2', fileId: '1', duration: 10 },
      ],
    },
  ],
  tvs: [
    { id: 'tv1', name: 'TV Entrada', location: 'Recepção', status: 'offline', playlistId: '1' },
    { id: 'tv2', name: 'TV Corredor', location: 'Corredor 1', status: 'offline', playlistId: null },
  ],
}

const listeners = new Set<(state: State) => void>()

function dispatch(fn: (state: State) => State) {
  memoryState = fn(memoryState)
  listeners.forEach((l) => l(memoryState))
}

export default function useMainStore() {
  const [state, setState] = useState(memoryState)

  useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  const addFile = useCallback(
    (file: MediaFile) => dispatch((s) => ({ ...s, files: [file, ...s.files] })),
    [],
  )
  const updateFile = useCallback(
    (id: string, updates: Partial<MediaFile>) =>
      dispatch((s) => ({
        ...s,
        files: s.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      })),
    [],
  )
  const removeFile = useCallback(
    (id: string) => dispatch((s) => ({ ...s, files: s.files.filter((f) => f.id !== id) })),
    [],
  )

  const addPlaylist = useCallback(
    (playlist: Playlist) => dispatch((s) => ({ ...s, playlists: [...s.playlists, playlist] })),
    [],
  )
  const updatePlaylist = useCallback(
    (id: string, updates: Partial<Playlist>) =>
      dispatch((s) => ({
        ...s,
        playlists: s.playlists.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),
    [],
  )
  const removePlaylist = useCallback(
    (id: string) => dispatch((s) => ({ ...s, playlists: s.playlists.filter((p) => p.id !== id) })),
    [],
  )

  const addTV = useCallback((tv: TV) => dispatch((s) => ({ ...s, tvs: [...s.tvs, tv] })), [])
  const updateTV = useCallback(
    (id: string, updates: Partial<TV>) =>
      dispatch((s) => ({ ...s, tvs: s.tvs.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
    [],
  )
  const removeTV = useCallback(
    (id: string) => dispatch((s) => ({ ...s, tvs: s.tvs.filter((t) => t.id !== id) })),
    [],
  )

  return {
    ...state,
    addFile,
    updateFile,
    removeFile,
    addPlaylist,
    updatePlaylist,
    removePlaylist,
    addTV,
    updateTV,
    removeTV,
  }
}
