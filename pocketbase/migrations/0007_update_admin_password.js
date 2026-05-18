migrate(
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'triplemvv@gmail.com')
      record.setPassword('Skip@2026')
      record.set('security_question', 'Qual era o nome do seu primeiro animal de estimação?')
      record.set('security_answer', 'admin')
      app.save(record)
    } catch (err) {
      // Ignore if the specific user doesn't exist in this environment
    }
  },
  (app) => {
    // No down migration
  },
)
