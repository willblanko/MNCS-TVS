migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'ilopes@lclaw.com.br')
    } catch (_) {
      // Se o usuário não existir, interrompe o processo para não falhar a migration
      return
    }

    const filesCol = app.findCollectionByNameOrId('files')
    let file1, file2

    try {
      file1 = app.findFirstRecordByData('files', 'name', 'Welcome Video')
    } catch (_) {
      file1 = new Record(filesCol)
      file1.set('name', 'Welcome Video')
      file1.set('type', 'video')
      file1.set('url', 'https://images.pexels.com/photos/853168/pexels-photo-853168.jpeg')
      file1.set('size', 1500000)
      file1.set('user', user.id)
      app.save(file1)
    }

    try {
      file2 = app.findFirstRecordByData('files', 'name', 'Store Promo')
    } catch (_) {
      file2 = new Record(filesCol)
      file2.set('name', 'Store Promo')
      file2.set('type', 'image')
      file2.set('url', 'https://images.unsplash.com/photo-1534452286302-2f504e76046e')
      file2.set('size', 500000)
      file2.set('user', user.id)
      app.save(file2)
    }

    const playlistsCol = app.findCollectionByNameOrId('playlists')
    let playlist
    try {
      playlist = app.findFirstRecordByData('playlists', 'name', 'Main Reception Loop')
    } catch (_) {
      playlist = new Record(playlistsCol)
      playlist.set('name', 'Main Reception Loop')
      playlist.set('user', user.id)
      app.save(playlist)
    }

    const itemsCol = app.findCollectionByNameOrId('playlist_items')
    try {
      app.findFirstRecordByData('playlist_items', 'playlist', playlist.id)
    } catch (_) {
      const item1 = new Record(itemsCol)
      item1.set('playlist', playlist.id)
      item1.set('file', file1.id)
      item1.set('sort_order', 1)
      item1.set('duration', 15)
      app.save(item1)

      const item2 = new Record(itemsCol)
      item2.set('playlist', playlist.id)
      item2.set('file', file2.id)
      item2.set('sort_order', 2)
      item2.set('duration', 15)
      app.save(item2)
    }

    const tvsCol = app.findCollectionByNameOrId('tvs')
    let tv
    try {
      tv = app.findFirstRecordByData('tvs', 'code', 'ENT-001')
    } catch (_) {
      tv = new Record(tvsCol)
      tv.set('name', 'Entrance TV')
      tv.set('code', 'ENT-001')
      tv.set('status', 'online')
      tv.set('current_playlist', playlist.id)
      tv.set('user', user.id)
      app.save(tv)
    }
  },
  (app) => {
    try {
      const tv = app.findFirstRecordByData('tvs', 'code', 'ENT-001')
      app.delete(tv)
    } catch (_) {}

    try {
      const playlist = app.findFirstRecordByData('playlists', 'name', 'Main Reception Loop')
      const items = app.findRecordsByFilter(
        'playlist_items',
        `playlist='${playlist.id}'`,
        '',
        100,
        0,
      )
      for (const item of items) {
        app.delete(item)
      }
      app.delete(playlist)
    } catch (_) {}

    try {
      const file1 = app.findFirstRecordByData('files', 'name', 'Welcome Video')
      app.delete(file1)
    } catch (_) {}

    try {
      const file2 = app.findFirstRecordByData('files', 'name', 'Store Promo')
      app.delete(file2)
    } catch (_) {}
  },
)
