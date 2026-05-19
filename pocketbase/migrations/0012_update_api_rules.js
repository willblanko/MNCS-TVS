migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    app.save(users)

    const files = app.findCollectionByNameOrId('files')
    files.listRule = "@request.auth.id != ''"
    files.viewRule = "@request.auth.id != ''"
    files.createRule = "@request.auth.id != ''"
    files.updateRule = "@request.auth.id != ''"
    files.deleteRule = "@request.auth.id != ''"
    app.save(files)

    const playlists = app.findCollectionByNameOrId('playlists')
    playlists.listRule = "@request.auth.id != ''"
    playlists.viewRule = "@request.auth.id != ''"
    playlists.createRule = "@request.auth.id != ''"
    playlists.updateRule = "@request.auth.id != ''"
    playlists.deleteRule = "@request.auth.id != ''"
    app.save(playlists)

    const playlistItems = app.findCollectionByNameOrId('playlist_items')
    playlistItems.listRule = "@request.auth.id != ''"
    playlistItems.viewRule = "@request.auth.id != ''"
    playlistItems.createRule = "@request.auth.id != ''"
    playlistItems.updateRule = "@request.auth.id != ''"
    playlistItems.deleteRule = "@request.auth.id != ''"
    app.save(playlistItems)

    try {
      const adminUser = app.findAuthRecordByEmail('users', 'triplemvv@gmail.com')
      adminUser.set('role', 'admin')
      app.save(adminUser)
    } catch (_) {
      // Admin user not found, ignore
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.listRule = "id = @request.auth.id || role = 'admin'"
    users.viewRule = "id = @request.auth.id || role = 'admin'"
    users.updateRule = "id = @request.auth.id || role = 'admin'"
    users.deleteRule = "id = @request.auth.id || role = 'admin'"
    app.save(users)

    const files = app.findCollectionByNameOrId('files')
    files.listRule = "@request.auth.id != ''"
    files.viewRule = "@request.auth.id != ''"
    files.createRule = "@request.auth.id != ''"
    files.updateRule = "@request.auth.id != ''"
    files.deleteRule = "@request.auth.id != ''"
    app.save(files)

    const playlists = app.findCollectionByNameOrId('playlists')
    playlists.listRule = "@request.auth.id != ''"
    playlists.viewRule = "@request.auth.id != ''"
    playlists.createRule = "@request.auth.id != ''"
    playlists.updateRule = "@request.auth.id != ''"
    playlists.deleteRule = "@request.auth.id != ''"
    app.save(playlists)

    const playlistItems = app.findCollectionByNameOrId('playlist_items')
    playlistItems.listRule = "@request.auth.id != ''"
    playlistItems.viewRule = "@request.auth.id != ''"
    playlistItems.createRule = "@request.auth.id != ''"
    playlistItems.updateRule = "@request.auth.id != ''"
    playlistItems.deleteRule = "@request.auth.id != ''"
    app.save(playlistItems)
  },
)
