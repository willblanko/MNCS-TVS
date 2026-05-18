migrate(
  (app) => {
    // 1. Add fields as optional first to avoid constraints errors with existing empty records
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(new TextField({ name: 'security_question', required: false }))
    users.fields.add(new TextField({ name: 'security_answer', required: false, hidden: true }))
    app.save(users)

    // 2. Populate existing records with default values
    app
      .db()
      .newQuery(
        "UPDATE users SET security_question = 'Qual era o nome do seu primeiro animal de estimação?', security_answer = 'admin' WHERE security_question IS NULL OR security_question = ''",
      )
      .execute()

    // 3. Make fields required
    const usersUpdated = app.findCollectionByNameOrId('_pb_users_auth_')
    usersUpdated.fields.add(new TextField({ name: 'security_question', required: true }))
    usersUpdated.fields.add(
      new TextField({ name: 'security_answer', required: true, hidden: true }),
    )
    app.save(usersUpdated)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('security_question')
    users.fields.removeByName('security_answer')
    app.save(users)
  },
)
