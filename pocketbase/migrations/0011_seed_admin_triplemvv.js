migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    try {
      const admin = app.findAuthRecordByEmail('users', 'triplemvv@gmail.com')
      admin.set('role', 'admin')
      app.save(admin)
    } catch (_) {
      // If not found, create it as admin
      const admin = new Record(users)
      admin.setEmail('triplemvv@gmail.com')
      admin.setPassword('Skip@Pass123')
      admin.setVerified(true)
      admin.set('name', 'Admin')
      admin.set('role', 'admin')
      app.save(admin)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'triplemvv@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
