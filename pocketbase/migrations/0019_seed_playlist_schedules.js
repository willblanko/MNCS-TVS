migrate(
  (app) => {
    try {
      const users = app.findRecordsByFilter('_pb_users_auth_', '1=1', 'created', 1, 0)
      const tvs = app.findRecordsByFilter('tvs', '1=1', 'created', 1, 0)
      const playlists = app.findRecordsByFilter('playlists', '1=1', 'created', 1, 0)

      if (users.length > 0 && tvs.length > 0 && playlists.length > 0) {
        const admin = users[0]
        const tv = tvs[0]
        const playlist = playlists[0]
        const col = app.findCollectionByNameOrId('playlist_schedules')

        const r1 = new Record(col)
        r1.set('playlist', playlist.id)
        r1.set('tv', tv.id)
        r1.set('days_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
        r1.set('start_time', '08:00')
        r1.set('end_time', '12:00')
        r1.set('active', true)
        r1.set('user', admin.id)
        app.save(r1)

        const r2 = new Record(col)
        r2.set('playlist', playlist.id)
        r2.set('tv', tv.id)
        r2.set('days_of_week', ['saturday', 'sunday'])
        r2.set('start_time', '18:00')
        r2.set('end_time', '23:59')
        r2.set('active', true)
        r2.set('user', admin.id)
        app.save(r2)
      }
    } catch (err) {
      console.log('Could not seed playlist schedules: ' + err)
    }
  },
  (app) => {
    try {
      app.db().newQuery('DELETE FROM playlist_schedules').execute()
    } catch (_) {}
  },
)
