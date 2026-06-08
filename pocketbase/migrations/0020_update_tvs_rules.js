migrate(
  (app) => {
    const tvs = app.findCollectionByNameOrId('tvs')
    tvs.listRule = 'user = @request.auth.id || code = @request.query.code'
    tvs.viewRule = 'user = @request.auth.id || code = @request.query.code'
    app.save(tvs)

    // Ensure dependent collections are publicly readable so the unauthenticated Player can fetch content
    const deps = ['playlists', 'playlist_items', 'playlist_schedules', 'files']
    for (const name of deps) {
      const col = app.findCollectionByNameOrId(name)
      col.listRule = ''
      col.viewRule = ''
      app.save(col)
    }
  },
  (app) => {
    const tvs = app.findCollectionByNameOrId('tvs')
    tvs.listRule = "@request.auth.id != ''"
    tvs.viewRule = "@request.auth.id != ''"
    app.save(tvs)

    const deps = ['playlists', 'playlist_items', 'playlist_schedules', 'files']
    for (const name of deps) {
      const col = app.findCollectionByNameOrId(name)
      col.listRule = "@request.auth.id != ''"
      col.viewRule = "@request.auth.id != ''"
      app.save(col)
    }
  },
)
