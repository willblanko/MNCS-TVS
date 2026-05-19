migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"

    if (users.fields.getByName('security_question')) {
      users.fields.removeByName('security_question')
    }
    if (users.fields.getByName('security_answer')) {
      users.fields.removeByName('security_answer')
    }

    app.save(users)

    try {
      const adminUser = app.findAuthRecordByEmail('users', 'triplemvv@gmail.com')
      adminUser.set('role', 'admin')
      app.save(adminUser)
    } catch (_) {
      // Ignore if not found
    }

    const collections = ['files', 'playlists', 'playlist_items']
    for (const name of collections) {
      const col = app.findCollectionByNameOrId(name)
      col.listRule = "@request.auth.id != ''"
      col.viewRule = "@request.auth.id != ''"
      col.createRule = "@request.auth.id != ''"
      col.updateRule = "@request.auth.id != ''"
      col.deleteRule = "@request.auth.id != ''"
      app.save(col)
    }
  },
  (app) => {
    // Down migration ignored for forward progress
  },
)
