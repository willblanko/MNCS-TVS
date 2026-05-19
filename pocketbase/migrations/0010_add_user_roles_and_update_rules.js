migrate(
  (app) => {
    // 1. Update users collection with role field and admin-only rules
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'user'],
          maxSelect: 1,
          required: false,
        }),
      )
    }
    users.listRule = "id = @request.auth.id || role = 'admin'"
    users.viewRule = "id = @request.auth.id || role = 'admin'"
    users.updateRule = "id = @request.auth.id || role = 'admin'"
    users.deleteRule = "id = @request.auth.id || role = 'admin'"
    app.save(users)

    // 2. Make files globally accessible to all authenticated users
    const files = app.findCollectionByNameOrId('files')
    files.listRule = "@request.auth.id != ''"
    files.viewRule = "@request.auth.id != ''"
    files.createRule = "@request.auth.id != ''"
    files.updateRule = "@request.auth.id != ''"
    files.deleteRule = "@request.auth.id != ''"
    app.save(files)

    // 3. Make playlists globally accessible
    const playlists = app.findCollectionByNameOrId('playlists')
    playlists.listRule = "@request.auth.id != ''"
    playlists.viewRule = "@request.auth.id != ''"
    playlists.createRule = "@request.auth.id != ''"
    playlists.updateRule = "@request.auth.id != ''"
    playlists.deleteRule = "@request.auth.id != ''"
    app.save(playlists)

    // 4. Make playlist_items globally accessible
    const playlistItems = app.findCollectionByNameOrId('playlist_items')
    playlistItems.listRule = "@request.auth.id != ''"
    playlistItems.viewRule = "@request.auth.id != ''"
    playlistItems.createRule = "@request.auth.id != ''"
    playlistItems.updateRule = "@request.auth.id != ''"
    playlistItems.deleteRule = "@request.auth.id != ''"
    app.save(playlistItems)
  },
  (app) => {
    // Revert rules to user-specific
    const users = app.findCollectionByNameOrId('users')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)

    const files = app.findCollectionByNameOrId('files')
    files.listRule = 'user = @request.auth.id'
    files.viewRule = 'user = @request.auth.id'
    files.createRule = 'user = @request.auth.id'
    files.updateRule = 'user = @request.auth.id'
    files.deleteRule = 'user = @request.auth.id'
    app.save(files)

    const playlists = app.findCollectionByNameOrId('playlists')
    playlists.listRule = 'user = @request.auth.id'
    playlists.viewRule = 'user = @request.auth.id'
    playlists.createRule = 'user = @request.auth.id'
    playlists.updateRule = 'user = @request.auth.id'
    playlists.deleteRule = 'user = @request.auth.id'
    app.save(playlists)

    const playlistItems = app.findCollectionByNameOrId('playlist_items')
    playlistItems.listRule = 'playlist.user = @request.auth.id'
    playlistItems.viewRule = 'playlist.user = @request.auth.id'
    playlistItems.createRule = 'playlist.user = @request.auth.id'
    playlistItems.updateRule = 'playlist.user = @request.auth.id'
    playlistItems.deleteRule = 'playlist.user = @request.auth.id'
    app.save(playlistItems)
  },
)
