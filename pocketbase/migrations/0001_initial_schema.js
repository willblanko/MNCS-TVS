migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const files = new Collection({
      name: 'files',
      type: 'base',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: 'user = @request.auth.id',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'url', type: 'url', required: true },
        { name: 'thumbnail', type: 'url' },
        { name: 'type', type: 'select', values: ['image', 'video'], required: true, maxSelect: 1 },
        { name: 'size', type: 'number' },
        { name: 'duration', type: 'number' },
        {
          name: 'user',
          type: 'relation',
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_files_user ON files (user)'],
    })
    app.save(files)

    const playlists = new Collection({
      name: 'playlists',
      type: 'base',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: 'user = @request.auth.id',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'user',
          type: 'relation',
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_playlists_user ON playlists (user)'],
    })
    app.save(playlists)

    const playlistItems = new Collection({
      name: 'playlist_items',
      type: 'base',
      listRule: 'playlist.user = @request.auth.id',
      viewRule: 'playlist.user = @request.auth.id',
      createRule: 'playlist.user = @request.auth.id',
      updateRule: 'playlist.user = @request.auth.id',
      deleteRule: 'playlist.user = @request.auth.id',
      fields: [
        {
          name: 'playlist',
          type: 'relation',
          collectionId: playlists.id,
          cascadeDelete: true,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'file',
          type: 'relation',
          collectionId: files.id,
          cascadeDelete: true,
          maxSelect: 1,
          required: true,
        },
        { name: 'sort_order', type: 'number', required: true },
        { name: 'duration', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_playlist_items_playlist ON playlist_items (playlist)'],
    })
    app.save(playlistItems)

    const tvs = new Collection({
      name: 'tvs',
      type: 'base',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id || code = @request.query.code',
      createRule: 'user = @request.auth.id',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'code', type: 'text', required: true },
        { name: 'status', type: 'select', values: ['online', 'offline'], maxSelect: 1 },
        { name: 'current_playlist', type: 'relation', collectionId: playlists.id, maxSelect: 1 },
        {
          name: 'user',
          type: 'relation',
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
          required: true,
        },
        { name: 'last_seen', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_tvs_code ON tvs (code)',
        'CREATE INDEX idx_tvs_user ON tvs (user)',
      ],
    })
    app.save(tvs)

    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: 'user = @request.auth.id',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'message', type: 'text', required: true },
        { name: 'read', type: 'bool' },
        {
          name: 'user',
          type: 'relation',
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_notifications_user ON notifications (user)'],
    })
    app.save(notifications)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('notifications'))
    app.delete(app.findCollectionByNameOrId('tvs'))
    app.delete(app.findCollectionByNameOrId('playlist_items'))
    app.delete(app.findCollectionByNameOrId('playlists'))
    app.delete(app.findCollectionByNameOrId('files'))
  },
)
