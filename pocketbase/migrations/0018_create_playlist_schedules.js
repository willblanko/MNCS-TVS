migrate(
  (app) => {
    const collection = new Collection({
      name: 'playlist_schedules',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'playlist',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('playlists').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'tv',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('tvs').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'days_of_week',
          type: 'select',
          required: true,
          maxSelect: 7,
          values: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
        {
          name: 'start_time',
          type: 'text',
          required: true,
          pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
        },
        {
          name: 'end_time',
          type: 'text',
          required: true,
          pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
        },
        { name: 'active', type: 'bool' },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_playlist_schedules_tv ON playlist_schedules (tv)',
        'CREATE INDEX idx_playlist_schedules_playlist ON playlist_schedules (playlist)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('playlist_schedules')
    app.delete(collection)
  },
)
