migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    try {
      app.findAuthRecordByEmail('users', 'ilopes@lclaw.com.br')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('ilopes@lclaw.com.br')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Administrador')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'ilopes@lclaw.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
