routerAdd('GET', '/backend/v1/player/{code}', (e) => {
  const code = e.request.pathValue('code')

  let tv
  try {
    tv = $app.findFirstRecordByData('tvs', 'code', code)
  } catch (_) {
    return e.notFoundError('TV not found')
  }

  const items = []
  const playlistId = tv.getString('current_playlist')

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
