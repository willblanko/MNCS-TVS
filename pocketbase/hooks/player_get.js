routerAdd('GET', '/backend/v1/player/{code}', (e) => {
  const code = e.request.pathValue('code')

  let tv
  try {
    tv = $app.findFirstRecordByData('tvs', 'code', code)
  } catch (_) {
    return e.notFoundError('TV not found')
  }

  const schedules = $app.findRecordsByFilter(
    'playlist_schedules',
    `tv = '${tv.id}' && active = true`,
    '-updated',
    100,
    0,
  )

  const now = new Date()
  const brtTime = new Date(now.getTime() - 3 * 3600 * 1000)

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = days[brtTime.getUTCDay()]

  const currentHours = brtTime.getUTCHours().toString().padStart(2, '0')
  const currentMinutes = brtTime.getUTCMinutes().toString().padStart(2, '0')
  const currentTime = `${currentHours}:${currentMinutes}`

  let scheduledPlaylistId = null

  for (const s of schedules) {
    const rawDays = s.get('days_of_week') || []
    const isDayMatch = Array.isArray(rawDays)
      ? rawDays.includes(currentDay)
      : rawDays === currentDay

    if (isDayMatch) {
      const startTime = s.getString('start_time')
      const endTime = s.getString('end_time')

      if (currentTime >= startTime && currentTime <= endTime) {
        scheduledPlaylistId = s.getString('playlist')
        break
      }
    }
  }

  const items = []
  const playlistId = scheduledPlaylistId || tv.getString('current_playlist')

  if (playlistId) {
    const records = $app.findRecordsByFilter(
      'playlist_items',
      `playlist = '${playlistId}'`,
      'sort_order',
      1000,
      0,
    )

    for (const r of records) {
      try {
        const fileRecord = $app.findRecordById('files', r.getString('file'))
        items.push({
          id: r.id,
          order: r.getInt('sort_order'),
          duration: r.getInt('duration'),
          file: {
            id: fileRecord.id,
            url: fileRecord.getString('url'),
            type: fileRecord.getString('type'),
            thumbnail: fileRecord.getString('thumbnail'),
          },
        })
      } catch (_) {}
    }
  }

  return e.json(200, {
    tv: {
      id: tv.id,
      name: tv.getString('name'),
      status: tv.getString('status'),
      playlist_id: playlistId,
    },
    items: items,
  })
})
