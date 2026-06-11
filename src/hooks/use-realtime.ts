import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useRealtime(table: string, callback: () => void, enabled: boolean = true) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel(`realtime:${table}:${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        callbackRef.current()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, enabled])
}

export default useRealtime
